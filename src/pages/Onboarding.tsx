import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import ExplanationScreen from "@/components/onboarding/ExplanationScreen";
import DynamicQuestionScreen from "@/components/onboarding/DynamicQuestionScreen";
import FitnessPlanScreen from "@/components/onboarding/FitnessPlanScreen";
import FeedbackScreen from "@/components/onboarding/FeedbackScreen";
import { supabase } from "@/integrations/supabase/client";
import { useFitnessPlan, type FitnessPlan, type OnboardingAnswers } from "@/contexts/FitnessPlanContext";
import { baseQuestions, getNextQuestion, buildQuestionSummary, Question } from "@/data/onboardingQuestions";

const Onboarding = () => {
  const navigate = useNavigate();
  const { setFitnessPlan: setGlobalPlan, setAnswers: setGlobalAnswers, setHasCompletedOnboarding } = useFitnessPlan();
  const [currentStep, setCurrentStep] = useState<"loading" | "welcome" | "explanation" | "questions" | "generating" | "plan" | "feedback">("loading");
  const [questionHistory, setQuestionHistory] = useState<Question[]>([baseQuestions[0]]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [baseQuestionIndex, setBaseQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentQuestion = questionHistory[currentQuestionIndex];

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) {
        setCurrentStep("welcome");
        return;
      }

      const provider = user.app_metadata?.provider;
      const providers = user.app_metadata?.providers || [];
      const hasPassword = user.user_metadata?.has_password === true;
      const needsPassword = provider !== "email" && !providers.includes("email") && !hasPassword;

      if (needsPassword) {
        navigate("/set-password");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("fitness_plan, onboarding_answers")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.fitness_plan) {
        setGlobalPlan(profile.fitness_plan as unknown as FitnessPlan);
        if (profile.onboarding_answers) {
          setGlobalAnswers(profile.onboarding_answers as unknown as OnboardingAnswers);
        }
        setHasCompletedOnboarding(true);
        navigate("/home");
        return;
      }

      setCurrentStep("welcome");
    };

    checkUserStatus();
  }, [navigate, setGlobalPlan, setGlobalAnswers, setHasCompletedOnboarding]);

  const handleWelcomeContinue = () => {
    setCurrentStep("explanation");
  };

  const handleStart = () => {
    setCurrentStep("questions");
  };

  const handleAnswer = (answer: string | string[]) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(updatedAnswers);

    // Get the next question (could be a follow-up or next base question)
    const nextQuestion = getNextQuestion(currentQuestion, answer, updatedAnswers, baseQuestionIndex);

    if (nextQuestion) {
      // Check if it's a follow-up (same base index) or a new base question
      const isFollowUp = currentQuestion.options?.some(opt => 
        opt.followUp?.id === nextQuestion.id
      );

      if (!isFollowUp) {
        setBaseQuestionIndex(baseQuestionIndex + 1);
      }

      setQuestionHistory([...questionHistory.slice(0, currentQuestionIndex + 1), nextQuestion]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // No more questions, generate the plan
      generateFitnessPlan(updatedAnswers);
    }
  };

  const handleSkip = () => {
    // Move to next base question, skipping follow-ups
    const nextBaseIndex = baseQuestionIndex + 1;
    if (nextBaseIndex < baseQuestions.length) {
      const nextQuestion = baseQuestions[nextBaseIndex];
      setBaseQuestionIndex(nextBaseIndex);
      setQuestionHistory([...questionHistory.slice(0, currentQuestionIndex + 1), nextQuestion]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      generateFitnessPlan(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // Go back in history
      const prevQuestion = questionHistory[currentQuestionIndex - 1];
      const wasBaseQuestion = baseQuestions.some(q => q.id === prevQuestion.id);
      
      if (wasBaseQuestion && currentQuestion.id !== prevQuestion.id) {
        // Find the base question index
        const prevBaseIndex = baseQuestions.findIndex(q => q.id === prevQuestion.id);
        if (prevBaseIndex >= 0) {
          setBaseQuestionIndex(prevBaseIndex);
        }
      }
      
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Remove the current answer
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestion.id];
      setAnswers(newAnswers);
    } else {
      setCurrentStep("explanation");
    }
  };

  const generateFitnessPlan = async (finalAnswers: Record<string, string | string[]>, feedback?: string) => {
    setCurrentStep("generating");
    setIsGenerating(true);

    const fallbackPlan: FitnessPlan = {
      goal: String(finalAnswers["primary_goal"] || "General fitness improvement"),
      weeklyPlan: "Start with 3 days per week, gradually increasing as you build consistency.",
      workoutStyle: "A mix of cardio and strength training tailored to your preferences.",
      stayingConsistent: "Set reminders, start small, and celebrate every workout completed.",
      duration: "30-45 minutes per session",
      progression: "Week 1-2: Foundation building. Week 3-4: Gradual intensity increase.",
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // Build a detailed summary for the AI
      const questionSummary = buildQuestionSummary(finalAnswers);

      const { data, error } = await supabase.functions.invoke("generate-fitness-plan", {
        body: { 
          answers: finalAnswers, 
          questions: questionSummary.split("\n\n").map(q => q.split("\nAnswer:")[0]),
          feedback 
        },
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      if (!data || !data.plan) {
        console.error("No plan in response:", data);
        throw new Error("No plan returned");
      }

      setFitnessPlan(data.plan);
      setGlobalPlan(data.plan);
      setGlobalAnswers(finalAnswers as unknown as OnboardingAnswers);
      setCurrentStep("plan");
    } catch (error) {
      console.error("Error generating fitness plan:", error);
      setFitnessPlan(fallbackPlan);
      setGlobalPlan(fallbackPlan);
      setGlobalAnswers(finalAnswers as unknown as OnboardingAnswers);
      setCurrentStep("plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeedback = () => {
    setCurrentStep("feedback");
  };

  const handleFeedbackSubmit = (feedback: string) => {
    generateFitnessPlan(answers, feedback);
  };

  const handleBackToPlan = () => {
    setCurrentStep("plan");
  };

  const handleFinish = () => {
    setHasCompletedOnboarding(true);
    navigate("/home");
  };

  const handleBackToSignIn = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    navigate("/auth");
  };

  // Calculate estimated total questions (base + potential follow-ups)
  const estimatedTotal = baseQuestions.length + 3; // Add buffer for follow-ups

  return (
    <div className="min-h-screen bg-background relative">
      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToSignIn}
            className="gap-2 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Button>
        </div>
      </header>

      {currentStep === "welcome" && (
        <WelcomeScreen onContinue={handleWelcomeContinue} />
      )}
      {currentStep === "explanation" && (
        <ExplanationScreen onStart={handleStart} />
      )}
      {currentStep === "questions" && currentQuestion && (
        <DynamicQuestionScreen
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={estimatedTotal}
          onNext={handleAnswer}
          onSkip={handleSkip}
          onBack={handleBack}
          isFirstQuestion={currentQuestionIndex === 0}
        />
      )}
      {currentStep === "loading" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      )}
      {currentStep === "generating" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-xl text-foreground text-center">
            Creating your personalized fitness plan...
          </p>
          <p className="text-muted-foreground mt-2 text-center">
            Analyzing your answers to build the perfect plan
          </p>
        </div>
      )}
      {currentStep === "plan" && fitnessPlan && (
        <FitnessPlanScreen 
          plan={fitnessPlan} 
          onFinish={handleFinish} 
          onFeedback={handleFeedback}
        />
      )}
      {currentStep === "feedback" && fitnessPlan && (
        <FeedbackScreen
          currentPlan={fitnessPlan}
          onSubmit={handleFeedbackSubmit}
          onBack={handleBackToPlan}
          isLoading={isGenerating}
        />
      )}
    </div>
  );
};

export default Onboarding;
