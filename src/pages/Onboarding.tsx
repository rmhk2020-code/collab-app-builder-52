import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import ExplanationScreen from "@/components/onboarding/ExplanationScreen";
import QuestionScreen from "@/components/onboarding/QuestionScreen";
import FitnessPlanScreen from "@/components/onboarding/FitnessPlanScreen";
import FeedbackScreen from "@/components/onboarding/FeedbackScreen";
import { supabase } from "@/integrations/supabase/client";
import { useFitnessPlan, type FitnessPlan, type OnboardingAnswers } from "@/contexts/FitnessPlanContext";

const questions = [
  "What's your main fitness goal right now?",
  "How would you describe your current fitness level?",
  "How many days per week can you realistically work out?",
  "How much time do you usually have for a workout session?",
  "Do you have any injuries, pain, or limitations we should consider?",
  "What types of workouts do you enjoy most?",
  "What usually makes it hard for you to stay consistent with workouts?",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { setFitnessPlan: setGlobalPlan, setAnswers: setGlobalAnswers, setHasCompletedOnboarding } = useFitnessPlan();
  const [currentStep, setCurrentStep] = useState<"welcome" | "explanation" | "questions" | "loading" | "plan" | "feedback">("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleWelcomeContinue = () => {
    setCurrentStep("explanation");
  };

  const handleStart = () => {
    setCurrentStep("questions");
  };

  const handleAnswer = (answer: string | null) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      generateFitnessPlan({ ...answers, [currentQuestion]: answer });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      setCurrentStep("explanation");
    }
  };

  const generateFitnessPlan = async (finalAnswers: OnboardingAnswers, feedback?: string) => {
    setCurrentStep("loading");
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-fitness-plan", {
        body: { answers: finalAnswers, questions, feedback },
      });

      if (error) throw error;

      setFitnessPlan(data.plan);
      setGlobalPlan(data.plan);
      setGlobalAnswers(finalAnswers);
      setCurrentStep("plan");
    } catch (error) {
      console.error("Error generating fitness plan:", error);
      // Fallback plan if AI fails
      const fallbackPlan: FitnessPlan = {
        goal: finalAnswers[0] || "General fitness improvement",
        weeklyPlan: "Start with 3 days per week, gradually increasing as you build consistency.",
        workoutStyle: "A mix of cardio and strength training tailored to your preferences.",
        stayingConsistent: "Set reminders, start small, and celebrate every workout completed.",
        duration: "30-45 minutes per session",
        progression: "Week 1-2: Foundation building. Week 3-4: Gradual intensity increase.",
      };
      setFitnessPlan(fallbackPlan);
      setGlobalPlan(fallbackPlan);
      setGlobalAnswers(finalAnswers);
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

  return (
    <div className="min-h-screen bg-background">
      {currentStep === "welcome" && (
        <WelcomeScreen onContinue={handleWelcomeContinue} />
      )}
      {currentStep === "explanation" && (
        <ExplanationScreen onStart={handleStart} />
      )}
      {currentStep === "questions" && (
        <QuestionScreen
          question={questions[currentQuestion]}
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
          onNext={handleAnswer}
          onSkip={() => handleAnswer(null)}
          onBack={handleBack}
        />
      )}
      {currentStep === "loading" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-xl text-foreground text-center">
            Creating your personalized fitness plan...
          </p>
          <p className="text-muted-foreground mt-2 text-center">
            This will only take a moment
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
