import { createContext, useContext, useState, ReactNode } from "react";

export type FitnessPlan = {
  goal: string;
  weeklyPlan: string;
  workoutStyle: string;
  stayingConsistent: string;
  duration: string;
  progression: string;
};

export type OnboardingAnswers = {
  [key: number]: string | null;
};

interface FitnessPlanContextType {
  fitnessPlan: FitnessPlan | null;
  setFitnessPlan: (plan: FitnessPlan | null) => void;
  answers: OnboardingAnswers;
  setAnswers: (answers: OnboardingAnswers) => void;
  caloriesEaten: number;
  setCaloriesEaten: (calories: number) => void;
  dailyCalorieGoal: number;
  exercisesCompletedToday: number;
  setExercisesCompletedToday: (count: number) => void;
  exercisesCompletedThisWeek: number;
  setExercisesCompletedThisWeek: (count: number) => void;
  exercisesCompletedThisMonth: number;
  setExercisesCompletedThisMonth: (count: number) => void;
  weeklyExerciseGoal: number;
  monthlyExerciseGoal: number;
}

const FitnessPlanContext = createContext<FitnessPlanContextType | undefined>(undefined);

export const FitnessPlanProvider = ({ children }: { children: ReactNode }) => {
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [caloriesEaten, setCaloriesEaten] = useState(0);
  const [exercisesCompletedToday, setExercisesCompletedToday] = useState(0);
  const [exercisesCompletedThisWeek, setExercisesCompletedThisWeek] = useState(0);
  const [exercisesCompletedThisMonth, setExercisesCompletedThisMonth] = useState(0);

  const dailyCalorieGoal = 2000; // Default, could be personalized
  const weeklyExerciseGoal = 5;
  const monthlyExerciseGoal = 20;

  return (
    <FitnessPlanContext.Provider
      value={{
        fitnessPlan,
        setFitnessPlan,
        answers,
        setAnswers,
        caloriesEaten,
        setCaloriesEaten,
        dailyCalorieGoal,
        exercisesCompletedToday,
        setExercisesCompletedToday,
        exercisesCompletedThisWeek,
        setExercisesCompletedThisWeek,
        exercisesCompletedThisMonth,
        setExercisesCompletedThisMonth,
        weeklyExerciseGoal,
        monthlyExerciseGoal,
      }}
    >
      {children}
    </FitnessPlanContext.Provider>
  );
};

export const useFitnessPlan = () => {
  const context = useContext(FitnessPlanContext);
  if (context === undefined) {
    throw new Error("useFitnessPlan must be used within a FitnessPlanProvider");
  }
  return context;
};
