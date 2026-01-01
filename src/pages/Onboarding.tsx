import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import ExplanationScreen from "@/components/onboarding/ExplanationScreen";
import QuestionScreen from "@/components/onboarding/QuestionScreen";
import FitnessPlanScreen from "@/components/onboarding/FitnessPlanScreen";
import { supabase } from "@/integrations/supabase/client";

const questions = [
  "What's your main fitness goal right now?",
  "How would you describe your current fitness level?",
  "How many days per week can you realistically work out?",
  "How much time do you usually have for a workout session?",
  "Do you have any injuries, pain, or limitations we should consider?",
  "What types of workouts do you enjoy most?",
  "What usually makes it hard for you to stay consistent with workouts?",
];

export type OnboardingAnswers = {
  [key: number]: string | null;
};

export type FitnessPlan = {
  goal: string;
  weeklyPlan: string;
  workoutStyle: string;
  stayingConsistent: string;
  duration: string;
  progression: string;
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<"welcome" | "explanation" | "questions" | "loading" | "plan">("welcome");
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

  const generateFitnessPlan = async (finalAnswers: OnboardingAnswers) => {
    setCurrentStep("loading");
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-fitness-plan", {
        body: { answers: finalAnswers, questions },
      });

      if (error) throw error;

      setFitnessPlan(data.plan);
      setCurrentStep("plan");
    } catch (error) {
      console.error("Error generating fitness plan:", error);
      // Fallback plan if AI fails
      setFitnessPlan({
        goal: finalAnswers[0] || "General fitness improvement",
        weeklyPlan: "Start with 3 days per week, gradually increasing as you build consistency.",
        workoutStyle: "A mix of cardio and strength training tailored to your preferences.",
        stayingConsistent: "Set reminders, start small, and celebrate every workout completed.",
        duration: "30-45 minutes per session",
        progression: "Week 1-2: Foundation building. Week 3-4: Gradual intensity increase.",
      });
      setCurrentStep("plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinish = () => {
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
        <FitnessPlanScreen plan={fitnessPlan} onFinish={handleFinish} />
      )}
    </div>
  );
};

export default Onboarding;
