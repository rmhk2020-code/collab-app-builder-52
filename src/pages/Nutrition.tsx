import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Target, Clock, Flame, Edit2, Check, X, Plus } from "lucide-react";
import { FoodCategories } from "@/components/nutrition/FoodCategories";
import { FoodScanner } from "@/components/nutrition/FoodScanner";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import AppHeader from "@/components/layout/AppHeader";
import { useTranslation } from "@/i18n/TranslationContext";

const Nutrition = () => {
  const { t } = useTranslation();
  const { 
    fitnessPlan, 
    caloriesEaten, 
    setCaloriesEaten,
    dailyCalorieGoal,
    setDailyCalorieGoal,
    isGuest 
  } = useFitnessPlan();
  
  const [editingCalories, setEditingCalories] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempCalories, setTempCalories] = useState(caloriesEaten.toString());
  const [tempGoal, setTempGoal] = useState(dailyCalorieGoal.toString());
  const [quickAddAmount, setQuickAddAmount] = useState("");

  const calorieProgress = Math.min((caloriesEaten / dailyCalorieGoal) * 100, 100);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSaveCalories = () => {
    setCaloriesEaten(parseInt(tempCalories) || 0);
    setEditingCalories(false);
  };

  const handleSaveGoal = () => {
    setDailyCalorieGoal(parseInt(tempGoal) || 2000);
    setEditingGoal(false);
  };

  const handleQuickAdd = () => {
    const amount = parseInt(quickAddAmount) || 0;
    if (amount > 0) {
      setCaloriesEaten(caloriesEaten + amount);
      setQuickAddAmount("");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title={t("nutrition")} />

      {/* Calorie Tracking Bar - Hidden for guests */}
      {!isGuest && (
        <div className="sticky top-[61px] z-10 bg-card border-b border-border py-4 px-4 shadow-sm">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{currentTime}</span>
                </div>
                {fitnessPlan && (
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm text-muted-foreground hidden sm:inline">{t("fitnessGoal")}: {fitnessPlan.goal}</span>
                  </div>
                )}
              </div>
              
              <Card className="flex-1 max-w-lg bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">{t("todaysCalories")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingCalories ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={tempCalories}
                            onChange={(e) => setTempCalories(e.target.value)}
                            className="w-20 h-8 text-sm"
                            min="0"
                          />
                          <Button size="icon" variant="ghost" onClick={handleSaveCalories} className="h-8 w-8 min-h-[32px] min-w-[32px]">
                            <Check className="h-4 w-4 text-emerald-500" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingCalories(false)} className="h-8 w-8 min-h-[32px] min-w-[32px]">
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-foreground">
                            {caloriesEaten}
                          </span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => { setTempCalories(caloriesEaten.toString()); setEditingCalories(true); }}
                            className="h-8 w-8 min-h-[32px] min-w-[32px]"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <span className="text-sm text-muted-foreground">/</span>
                      {editingGoal ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={tempGoal}
                            onChange={(e) => setTempGoal(e.target.value)}
                            className="w-20 h-8 text-sm"
                            min="500"
                          />
                          <span className="text-sm text-muted-foreground">kcal</span>
                          <Button size="icon" variant="ghost" onClick={handleSaveGoal} className="h-8 w-8 min-h-[32px] min-w-[32px]">
                            <Check className="h-4 w-4 text-emerald-500" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingGoal(false)} className="h-8 w-8 min-h-[32px] min-w-[32px]">
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">{dailyCalorieGoal} kcal</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => { setTempGoal(dailyCalorieGoal.toString()); setEditingGoal(true); }}
                            className="h-8 w-8 min-h-[32px] min-w-[32px]"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={calorieProgress} 
                    className="h-3"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder={t("addKcal")}
                        value={quickAddAmount}
                        onChange={(e) => setQuickAddAmount(e.target.value)}
                        className="w-24 h-8 text-sm"
                        min="0"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleQuickAdd}
                        className="h-8 min-h-[32px] px-3 active:scale-[0.98] transition-transform"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t("add")}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dailyCalorieGoal - caloriesEaten > 0 
                        ? `${dailyCalorieGoal - caloriesEaten} ${t("kcalRemainingShort")}` 
                        : t("dailyCalorieGoalReached")
                      }
                    </p>
                  </div>
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t("dietAndNutrition")}</h1>
          <p className="text-xl text-muted-foreground">
            {t("fuelPerformance")}
          </p>
        </div>

        <FoodCategories />
      </div>

      <FoodScanner />
    </div>
  );
};

export default Nutrition;
