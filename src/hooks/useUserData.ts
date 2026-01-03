import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFitnessPlan, FitnessPlan, OnboardingAnswers, FoodLog, ExerciseLog } from "@/contexts/FitnessPlanContext";
import { useHealthVitals } from "@/contexts/HealthVitalsContext";
import { useSettings, AllSettings } from "@/contexts/SettingsContext";
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
    foodLogs,
    setFoodLogs,
    exerciseLogs,
    setExerciseLogs,
  } = useFitnessPlan();

  const healthVitals = useHealthVitals();
  const { loadAllSettings, userProfile, fitnessPlanSettings, exerciseSettings, dietSettings, trackingSettings, notificationSettings, appPreferences, privacySettings } = useSettings();

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

      // Load food logs
      if (profile.food_logs && Array.isArray(profile.food_logs)) {
        const parsedFoodLogs = (profile.food_logs as unknown as FoodLog[]).map(log => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        setFoodLogs(parsedFoodLogs);
      }

      // Load exercise logs
      if (profile.exercise_logs && Array.isArray(profile.exercise_logs)) {
        const parsedExerciseLogs = (profile.exercise_logs as unknown as ExerciseLog[]).map(log => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        setExerciseLogs(parsedExerciseLogs);
      }

      // Load health vitals
      if (profile.health_vitals && typeof profile.health_vitals === 'object') {
        const vitals = profile.health_vitals as Record<string, unknown>;
        
        if (Array.isArray(vitals.weightHistory)) {
          healthVitals.setWeightHistory(vitals.weightHistory.map((e: unknown) => {
            const entry = e as Record<string, unknown>;
            return { ...entry, timestamp: new Date(entry.timestamp as string) };
          }) as typeof healthVitals.weightHistory);
        }
        if (Array.isArray(vitals.bloodPressureHistory)) {
          healthVitals.setBloodPressureHistory(vitals.bloodPressureHistory.map((e: unknown) => {
            const entry = e as Record<string, unknown>;
            return { ...entry, timestamp: new Date(entry.timestamp as string) };
          }) as typeof healthVitals.bloodPressureHistory);
        }
        if (Array.isArray(vitals.pulseHistory)) {
          healthVitals.setPulseHistory(vitals.pulseHistory.map((e: unknown) => {
            const entry = e as Record<string, unknown>;
            return { ...entry, timestamp: new Date(entry.timestamp as string) };
          }) as typeof healthVitals.pulseHistory);
        }
        if (Array.isArray(vitals.bodyMeasurements)) {
          healthVitals.setBodyMeasurements(vitals.bodyMeasurements.map((e: unknown) => {
            const entry = e as Record<string, unknown>;
            return { ...entry, timestamp: new Date(entry.timestamp as string) };
          }) as typeof healthVitals.bodyMeasurements);
        }
        if (Array.isArray(vitals.oxygenHistory)) {
          healthVitals.setOxygenHistory(vitals.oxygenHistory.map((e: unknown) => {
            const entry = e as Record<string, unknown>;
            return { ...entry, timestamp: new Date(entry.timestamp as string) };
          }) as typeof healthVitals.oxygenHistory);
        }
        if (Array.isArray(vitals.sleepHistory)) {
          healthVitals.setSleepHistory(vitals.sleepHistory.map((e: unknown) => {
            const entry = e as Record<string, unknown>;
            return { ...entry, timestamp: new Date(entry.timestamp as string) };
          }) as typeof healthVitals.sleepHistory);
        }
        if (Array.isArray(vitals.stepsHistory)) {
          healthVitals.setStepsHistory(vitals.stepsHistory.map((e: unknown) => {
            const entry = e as Record<string, unknown>;
            return { ...entry, timestamp: new Date(entry.timestamp as string) };
          }) as typeof healthVitals.stepsHistory);
        }
        if (Array.isArray(vitals.waterIntakeHistory)) {
          healthVitals.setWaterIntakeHistory(vitals.waterIntakeHistory.map((e: unknown) => {
            const entry = e as Record<string, unknown>;
            return { ...entry, timestamp: new Date(entry.timestamp as string) };
          }) as typeof healthVitals.waterIntakeHistory);
        }
      }

      // Load user settings
      if (profile.user_settings && typeof profile.user_settings === 'object') {
        loadAllSettings(profile.user_settings as unknown as AllSettings);
      }
    }
  }, [isGuest, setFitnessPlan, setAnswers, setExercisesCompletedToday, setExercisesCompletedThisWeek, setExercisesCompletedThisMonth, setWeeklyExerciseGoal, setMonthlyExerciseGoal, setCaloriesEaten, setDailyCalorieGoal, setHasCompletedOnboarding, setFoodLogs, setExerciseLogs, healthVitals, loadAllSettings]);

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

    const userSettingsData: AllSettings = {
      userProfile,
      fitnessPlanSettings,
      exerciseSettings,
      dietSettings,
      trackingSettings,
      notificationSettings,
      appPreferences,
      privacySettings,
    };

    const profileData = {
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
      food_logs: foodLogs as unknown as Json,
      exercise_logs: exerciseLogs as unknown as Json,
      user_settings: userSettingsData as unknown as Json,
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
        .update(profileData)
        .eq("user_id", user.id);
      error = result.error;
    } else {
      // Insert new profile
      const result = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          ...profileData,
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
    foodLogs,
    exerciseLogs,
    healthVitals.weightHistory,
    healthVitals.bloodPressureHistory,
    healthVitals.pulseHistory,
    healthVitals.bodyMeasurements,
    healthVitals.oxygenHistory,
    healthVitals.sleepHistory,
    healthVitals.stepsHistory,
    healthVitals.waterIntakeHistory,
    userProfile,
    fitnessPlanSettings,
    exerciseSettings,
    dietSettings,
    trackingSettings,
    notificationSettings,
    appPreferences,
    privacySettings,
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
    foodLogs,
    exerciseLogs,
    healthVitals.weightHistory,
    healthVitals.bloodPressureHistory,
    healthVitals.pulseHistory,
    healthVitals.bodyMeasurements,
    healthVitals.oxygenHistory,
    healthVitals.sleepHistory,
    healthVitals.stepsHistory,
    healthVitals.waterIntakeHistory,
    userProfile,
    fitnessPlanSettings,
    exerciseSettings,
    dietSettings,
    trackingSettings,
    notificationSettings,
    appPreferences,
    privacySettings,
    isGuest,
    saveUserData,
  ]);

  // Best-effort flush when the user leaves / backgrounds the app
  useEffect(() => {
    if (isGuest) return;

    const flush = () => {
      // Don't await here (events like pagehide can't block anyway)
      void saveUserData();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isGuest, saveUserData]);

  return { loadUserData, saveUserData };
};
