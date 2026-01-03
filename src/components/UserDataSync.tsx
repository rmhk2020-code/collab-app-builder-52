import { useEffect, useCallback } from "react";
import { useUserData } from "@/hooks/useUserData";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";

const LAST_DAILY_RESET_KEY = "lastDailyReset";
const LAST_WEEKLY_RESET_KEY = "lastWeeklyReset";

/**
 * Get the current date string in user's local timezone (YYYY-MM-DD)
 */
const getLocalDateString = () => {
  const now = new Date();
  return now.toLocaleDateString("en-CA"); // en-CA gives YYYY-MM-DD format
};

/**
 * Get the current week number (ISO week)
 */
const getWeekNumber = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * Get the current week identifier (YYYY-WXX)
 */
const getLocalWeekString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const week = getWeekNumber(now);
  return `${year}-W${week.toString().padStart(2, "0")}`;
};

/**
 * Component that handles syncing user data with Supabase.
 * Also handles automatic daily/weekly resets at midnight in user's timezone.
 * This must be rendered within all context providers to work correctly.
 */
export const UserDataSync = () => {
  // This hook handles loading and auto-saving user data
  useUserData();

  const {
    setCaloriesEaten,
    setExercisesCompletedToday,
    setExercisesCompletedThisWeek,
    setFoodLogs,
    foodLogs,
  } = useFitnessPlan();

  const checkAndPerformResets = useCallback(() => {
    const currentDate = getLocalDateString();
    const currentWeek = getLocalWeekString();
    
    const lastDailyReset = localStorage.getItem(LAST_DAILY_RESET_KEY);
    const lastWeeklyReset = localStorage.getItem(LAST_WEEKLY_RESET_KEY);

    // Daily reset: calories and today's exercises
    if (lastDailyReset !== currentDate) {
      console.log("[UserDataSync] Performing daily reset for", currentDate);
      setCaloriesEaten(0);
      setExercisesCompletedToday(0);
      // Clear food logs from previous days
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayLogs = foodLogs.filter(
        (log) => new Date(log.timestamp) >= todayStart
      );
      setFoodLogs(todayLogs);
      localStorage.setItem(LAST_DAILY_RESET_KEY, currentDate);
    }

    // Weekly reset: this week's exercises
    if (lastWeeklyReset !== currentWeek) {
      console.log("[UserDataSync] Performing weekly reset for", currentWeek);
      setExercisesCompletedThisWeek(0);
      localStorage.setItem(LAST_WEEKLY_RESET_KEY, currentWeek);
    }
  }, [setCaloriesEaten, setExercisesCompletedToday, setExercisesCompletedThisWeek, setFoodLogs, foodLogs]);

  // Check for resets on mount and when app regains focus
  useEffect(() => {
    // Initial check
    checkAndPerformResets();

    // Check when user returns to the app
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndPerformResets();
      }
    };

    // Check periodically (every minute) in case user leaves app open overnight
    const intervalId = setInterval(checkAndPerformResets, 60000);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [checkAndPerformResets]);

  return null;
};
