import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { CheckCircle, Target, Calendar, Clock, Plus, Edit2, Check, X } from "lucide-react";
import { ExerciseLibrary } from "@/components/exercises/ExerciseLibrary";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import AppHeader from "@/components/layout/AppHeader";
import { useTranslation } from "@/i18n/TranslationContext";
import { LogHistoryModal } from "@/components/LogHistoryModal";

const Exercises = () => {
  const { t } = useTranslation();
  const { 
    fitnessPlan, 
    exercisesCompletedToday, 
    setExercisesCompletedToday,
    exercisesCompletedThisWeek, 
    setExercisesCompletedThisWeek,
    exercisesCompletedThisMonth,
    setExercisesCompletedThisMonth,
    weeklyExerciseGoal,
    monthlyExerciseGoal,
    isGuest
  } = useFitnessPlan();

  const [editingDaily, setEditingDaily] = useState(false);
  const [editingWeekly, setEditingWeekly] = useState(false);
  const [editingMonthly, setEditingMonthly] = useState(false);
  const [tempDaily, setTempDaily] = useState(exercisesCompletedToday.toString());
  const [tempWeekly, setTempWeekly] = useState(exercisesCompletedThisWeek.toString());
  const [tempMonthly, setTempMonthly] = useState(exercisesCompletedThisMonth.toString());

  const dailyGoal = 1;
  const dailyProgress = Math.min((exercisesCompletedToday / dailyGoal) * 100, 100);
  const weeklyProgress = Math.min((exercisesCompletedThisWeek / weeklyExerciseGoal) * 100, 100);
  const monthlyProgress = Math.min((exercisesCompletedThisMonth / monthlyExerciseGoal) * 100, 100);

  const handleSaveDaily = () => {
    setExercisesCompletedToday(parseInt(tempDaily) || 0);
    setEditingDaily(false);
  };

  const handleSaveWeekly = () => {
    setExercisesCompletedThisWeek(parseInt(tempWeekly) || 0);
    setEditingWeekly(false);
  };

  const handleSaveMonthly = () => {
    setExercisesCompletedThisMonth(parseInt(tempMonthly) || 0);
    setEditingMonthly(false);
  };

  const handleQuickAdd = () => {
    setExercisesCompletedToday(exercisesCompletedToday + 1);
    setExercisesCompletedThisWeek(exercisesCompletedThisWeek + 1);
    setExercisesCompletedThisMonth(exercisesCompletedThisMonth + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title={t("exercises")} />

      {/* Progress Tracking Bar - Hidden for guests */}
      {!isGuest && (
        <div className="sticky top-[61px] z-10 bg-card border-b border-border py-4 px-4 shadow-sm">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{t("workoutProgress")}</span>
              </div>
              <div className="flex items-center gap-2">
                {fitnessPlan && (
                  <span className="text-sm text-muted-foreground hidden md:inline">{t("fitnessGoal")}: {fitnessPlan.goal}</span>
                )}
                <LogHistoryModal />
                <Button 
                  onClick={handleQuickAdd}
                  size="sm"
                  className="min-h-[44px] min-w-[44px] px-3 active:scale-[0.98] transition-transform"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{t("logWorkout")}</span>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Daily Progress */}
              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${dailyProgress >= 100 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">{t("today")}</span>
                    </div>
                    {editingDaily ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={tempDaily}
                          onChange={(e) => setTempDaily(e.target.value)}
                          className="w-16 h-8 text-sm"
                          min="0"
                        />
                        <span className="text-sm text-muted-foreground">/{dailyGoal}</span>
                        <Button size="icon" variant="ghost" onClick={handleSaveDaily} className="h-8 w-8 min-h-[32px] min-w-[32px]">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingDaily(false)} className="h-8 w-8 min-h-[32px] min-w-[32px]">
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">{exercisesCompletedToday}/{dailyGoal}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => { setTempDaily(exercisesCompletedToday.toString()); setEditingDaily(true); }}
                          className="h-8 w-8 min-h-[32px] min-w-[32px]"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Progress value={dailyProgress} className="h-2" />
                </CardContent>
              </Card>

              {/* Weekly Progress */}
              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className={`h-4 w-4 ${weeklyProgress >= 100 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">{t("thisWeek")}</span>
                    </div>
                    {editingWeekly ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={tempWeekly}
                          onChange={(e) => setTempWeekly(e.target.value)}
                          className="w-16 h-8 text-sm"
                          min="0"
                        />
                        <span className="text-sm text-muted-foreground">/{weeklyExerciseGoal}</span>
                        <Button size="icon" variant="ghost" onClick={handleSaveWeekly} className="h-8 w-8 min-h-[32px] min-w-[32px]">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingWeekly(false)} className="h-8 w-8 min-h-[32px] min-w-[32px]">
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">{exercisesCompletedThisWeek}/{weeklyExerciseGoal}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => { setTempWeekly(exercisesCompletedThisWeek.toString()); setEditingWeekly(true); }}
                          className="h-8 w-8 min-h-[32px] min-w-[32px]"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Progress value={weeklyProgress} className="h-2" />
                </CardContent>
              </Card>

              {/* Monthly Progress */}
              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className={`h-4 w-4 ${monthlyProgress >= 100 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">{t("thisMonth")}</span>
                    </div>
                    {editingMonthly ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={tempMonthly}
                          onChange={(e) => setTempMonthly(e.target.value)}
                          className="w-16 h-8 text-sm"
                          min="0"
                        />
                        <span className="text-sm text-muted-foreground">/{monthlyExerciseGoal}</span>
                        <Button size="icon" variant="ghost" onClick={handleSaveMonthly} className="h-8 w-8 min-h-[32px] min-w-[32px]">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingMonthly(false)} className="h-8 w-8 min-h-[32px] min-w-[32px]">
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">{exercisesCompletedThisMonth}/{monthlyExerciseGoal}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => { setTempMonthly(exercisesCompletedThisMonth.toString()); setEditingMonthly(true); }}
                          className="h-8 w-8 min-h-[32px] min-w-[32px]"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Progress value={monthlyProgress} className="h-2" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {t("guestPreview")} <Link to="/auth" className="underline font-medium">{t("signIn")}</Link> {t("signInForFullAccess")}
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <ExerciseLibrary isGuest={isGuest} />
      </div>
    </div>
  );
};

export default Exercises;
