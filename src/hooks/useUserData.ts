import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFitnessPlan, FitnessPlan, OnboardingAnswers } from "@/contexts/FitnessPlanContext";
import { useHealthVitals } from "@/contexts/HealthVitalsContext";
import type { Json } from "@/integrations/supabase/types";

export const useUserData = () => {
  const {
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
    setHasCompletedOnboarding,
    isGuest,
  } = useFitnessPlan();

  const healthVitals = useHealthVitals();

  // Load user data from Supabase
  const loadUserData = useCallback(async () => {
    if (isGuest) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading user data:", error);
      return;
    }

    if (profile) {
      // Load fitness plan
      if (profile.fitness_plan) {
        setFitnessPlan(profile.fitness_plan as unknown as FitnessPlan);
        setHasCompletedOnboarding(true);
      }

      // Load onboarding answers
      if (profile.onboarding_answers) {
        setAnswers(profile.onboarding_answers as unknown as OnboardingAnswers);
      }

      // Load exercise progress
      setExercisesCompletedToday(profile.exercises_completed_today || 0);
      setExercisesCompletedThisWeek(profile.exercises_completed_this_week || 0);
      setExercisesCompletedThisMonth(profile.exercises_completed_this_month || 0);
      setWeeklyExerciseGoal(profile.weekly_exercise_goal || 5);
      setMonthlyExerciseGoal(profile.monthly_exercise_goal || 20);

      // Load nutrition progress
      setCaloriesEaten(profile.calories_eaten || 0);
      setDailyCalorieGoal(profile.daily_calorie_goal || 2000);
    }
  }, [isGuest, setFitnessPlan, setAnswers, setExercisesCompletedToday, setExercisesCompletedThisWeek, setExercisesCompletedThisMonth, setWeeklyExerciseGoal, setMonthlyExerciseGoal, setCaloriesEaten, setDailyCalorieGoal, setHasCompletedOnboarding]);

  // Save user data to Supabase
  const saveUserData = useCallback(async () => {
    if (isGuest) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const healthVitalsData = {
      weightHistory: healthVitals.weightHistory,
      bloodPressureHistory: healthVitals.bloodPressureHistory,
      pulseHistory: healthVitals.pulseHistory,
      bodyMeasurements: healthVitals.bodyMeasurements,
      oxygenHistory: healthVitals.oxygenHistory,
      sleepHistory: healthVitals.sleepHistory,
      stepsHistory: healthVitals.stepsHistory,
      waterIntakeHistory: healthVitals.waterIntakeHistory,
    };

    // Check if profile exists first
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let error;
    if (existingProfile) {
      // Update existing profile
      const result = await supabase
        .from("user_profiles")
        .update({
          fitness_plan: fitnessPlan as unknown as Json,
          onboarding_answers: answers as unknown as Json,
          exercises_completed_today: exercisesCompletedToday,
          exercises_completed_this_week: exercisesCompletedThisWeek,
          exercises_completed_this_month: exercisesCompletedThisMonth,
          weekly_exercise_goal: weeklyExerciseGoal,
          monthly_exercise_goal: monthlyExerciseGoal,
          calories_eaten: caloriesEaten,
          daily_calorie_goal: dailyCalorieGoal,
          health_vitals: healthVitalsData as unknown as Json,
        })
        .eq("user_id", user.id);
      error = result.error;
    } else {
      // Insert new profile
      const result = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          fitness_plan: fitnessPlan as unknown as Json,
          onboarding_answers: answers as unknown as Json,
          exercises_completed_today: exercisesCompletedToday,
          exercises_completed_this_week: exercisesCompletedThisWeek,
          exercises_completed_this_month: exercisesCompletedThisMonth,
          weekly_exercise_goal: weeklyExerciseGoal,
          monthly_exercise_goal: monthlyExerciseGoal,
          calories_eaten: caloriesEaten,
          daily_calorie_goal: dailyCalorieGoal,
          health_vitals: healthVitalsData as unknown as Json,
        });
      error = result.error;
    }

    if (error) {
      console.error("Error saving user data:", error);
    }
  }, [
    isGuest,
    fitnessPlan,
    answers,
    exercisesCompletedToday,
    exercisesCompletedThisWeek,
    exercisesCompletedThisMonth,
    weeklyExerciseGoal,
    monthlyExerciseGoal,
    caloriesEaten,
    dailyCalorieGoal,
    healthVitals.weightHistory,
    healthVitals.bloodPressureHistory,
    healthVitals.pulseHistory,
    healthVitals.bodyMeasurements,
    healthVitals.oxygenHistory,
    healthVitals.sleepHistory,
    healthVitals.stepsHistory,
    healthVitals.waterIntakeHistory,
  ]);

  // Load data on mount and when auth state changes
  useEffect(() => {
    loadUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        loadUserData();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // Auto-save when data changes (debounced)
  useEffect(() => {
    if (isGuest) return;

    const timeoutId = setTimeout(() => {
      saveUserData();
    }, 2000); // Debounce saves by 2 seconds

    return () => clearTimeout(timeoutId);
  }, [
    fitnessPlan,
    answers,
    exercisesCompletedToday,
    exercisesCompletedThisWeek,
    exercisesCompletedThisMonth,
    weeklyExerciseGoal,
    monthlyExerciseGoal,
    caloriesEaten,
    dailyCalorieGoal,
    healthVitals.weightHistory,
    healthVitals.bloodPressureHistory,
    healthVitals.pulseHistory,
    healthVitals.bodyMeasurements,
    healthVitals.oxygenHistory,
    healthVitals.sleepHistory,
    healthVitals.stepsHistory,
    healthVitals.waterIntakeHistory,
    isGuest,
    saveUserData,
  ]);

  return { loadUserData, saveUserData };
};
