import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import { useTranslation } from "@/i18n/TranslationContext";
import { toast } from "sonner";

export const CloudSyncCheck = () => {
  const { t } = useTranslation();
  const {
    caloriesEaten,
    dailyCalorieGoal,
    exercisesCompletedToday,
    exercisesCompletedThisWeek,
    exercisesCompletedThisMonth,
  } = useFitnessPlan();

  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    setLoading(true);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user) {
        toast.error("Not signed in");
        return;
      }

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select(
          "calories_eaten, daily_calorie_goal, exercises_completed_today, exercises_completed_this_week, exercises_completed_this_month"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!profile) {
        toast.error("No cloud profile found yet (try changing a value, wait 2s, then check again). ");
        return;
      }

      const cloud = {
        caloriesEaten: profile.calories_eaten ?? 0,
        dailyCalorieGoal: profile.daily_calorie_goal ?? 2000,
        today: profile.exercises_completed_today ?? 0,
        week: profile.exercises_completed_this_week ?? 0,
        month: profile.exercises_completed_this_month ?? 0,
      };

      const local = {
        caloriesEaten,
        dailyCalorieGoal,
        today: exercisesCompletedToday,
        week: exercisesCompletedThisWeek,
        month: exercisesCompletedThisMonth,
      };

      const matches =
        cloud.caloriesEaten === local.caloriesEaten &&
        cloud.dailyCalorieGoal === local.dailyCalorieGoal &&
        cloud.today === local.today &&
        cloud.week === local.week &&
        cloud.month === local.month;

      toast.success(
        matches
          ? t("cloudSyncUpToDate")
          : `${t("cloudSyncMismatch")}\nLocal: kcal ${local.caloriesEaten}/${local.dailyCalorieGoal}, ex ${local.today}/${local.week}/${local.month}\nCloud: kcal ${cloud.caloriesEaten}/${cloud.dailyCalorieGoal}, ex ${cloud.today}/${cloud.week}/${cloud.month}`
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to check cloud sync");
    } finally {
      setLoading(false);
    }
  }, [
    caloriesEaten,
    dailyCalorieGoal,
    exercisesCompletedToday,
    exercisesCompletedThisWeek,
    exercisesCompletedThisMonth,
    t,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cloudSyncTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{t("cloudSyncHelp")}</p>
        <Button onClick={check} disabled={loading} className="min-h-[44px]">
          {loading ? t("loading") : t("cloudSyncCheck")}
        </Button>
      </CardContent>
    </Card>
  );
};
