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

export type FoodLog = {
  id: string;
  name: string;
  calories: number;
  timestamp: Date;
};

export type ExerciseLog = {
  id: string;
  name: string;
  timestamp: Date;
};

interface FitnessPlanContextType {
  fitnessPlan: FitnessPlan | null;
  setFitnessPlan: (plan: FitnessPlan | null) => void;
  answers: OnboardingAnswers;
  setAnswers: (answers: OnboardingAnswers) => void;
  caloriesEaten: number;
  setCaloriesEaten: (calories: number) => void;
  dailyCalorieGoal: number;
  setDailyCalorieGoal: (goal: number) => void;
  exercisesCompletedToday: number;
  setExercisesCompletedToday: (count: number) => void;
  exercisesCompletedThisWeek: number;
  setExercisesCompletedThisWeek: (count: number) => void;
  exercisesCompletedThisMonth: number;
  setExercisesCompletedThisMonth: (count: number) => void;
  weeklyExerciseGoal: number;
  setWeeklyExerciseGoal: (goal: number) => void;
  monthlyExerciseGoal: number;
  setMonthlyExerciseGoal: (goal: number) => void;
  isGuest: boolean;
  setIsGuest: (isGuest: boolean) => void;
  foodLogs: FoodLog[];
  addFoodLog: (food: Omit<FoodLog, "id" | "timestamp">) => void;
  exerciseLogs: ExerciseLog[];
  addExerciseLog: (exercise: Omit<ExerciseLog, "id" | "timestamp">) => void;
}

const FitnessPlanContext = createContext<FitnessPlanContextType | undefined>(undefined);

export const FitnessPlanProvider = ({ children }: { children: ReactNode }) => {
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [caloriesEaten, setCaloriesEaten] = useState(0);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);
  const [exercisesCompletedToday, setExercisesCompletedToday] = useState(0);
  const [exercisesCompletedThisWeek, setExercisesCompletedThisWeek] = useState(0);
  const [exercisesCompletedThisMonth, setExercisesCompletedThisMonth] = useState(0);
  const [weeklyExerciseGoal, setWeeklyExerciseGoal] = useState(5);
  const [monthlyExerciseGoal, setMonthlyExerciseGoal] = useState(20);
  const [isGuest, setIsGuest] = useState(false);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);

  const addFoodLog = (food: Omit<FoodLog, "id" | "timestamp">) => {
    const newLog: FoodLog = {
      ...food,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setFoodLogs((prev) => [...prev, newLog]);
    setCaloriesEaten((prev) => prev + food.calories);
  };

  const addExerciseLog = (exercise: Omit<ExerciseLog, "id" | "timestamp">) => {
    const newLog: ExerciseLog = {
      ...exercise,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setExerciseLogs((prev) => [...prev, newLog]);
    setExercisesCompletedToday((prev) => prev + 1);
    setExercisesCompletedThisWeek((prev) => prev + 1);
    setExercisesCompletedThisMonth((prev) => prev + 1);
  };

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
        setDailyCalorieGoal,
        exercisesCompletedToday,
        setExercisesCompletedToday,
        exercisesCompletedThisWeek,
        setExercisesCompletedThisWeek,
        exercisesCompletedThisMonth,
        setExercisesCompletedThisMonth,
        weeklyExerciseGoal,
        setWeeklyExerciseGoal,
        monthlyExerciseGoal,
        setMonthlyExerciseGoal,
        isGuest,
        setIsGuest,
        foodLogs,
        addFoodLog,
        exerciseLogs,
        addExerciseLog,
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
