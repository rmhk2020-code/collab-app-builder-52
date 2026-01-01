import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Target, Clock, Flame } from "lucide-react";
import { FoodCategories } from "@/components/nutrition/FoodCategories";
import { FoodScanner } from "@/components/nutrition/FoodScanner";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";

const Nutrition = () => {
  const { fitnessPlan, caloriesEaten, dailyCalorieGoal } = useFitnessPlan();
  
  const calorieProgress = Math.min((caloriesEaten / dailyCalorieGoal) * 100, 100);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Calorie Tracking Bar */}
      <div className="sticky top-0 z-10 bg-card border-b border-border py-4 px-4 shadow-sm">
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
                  <span className="text-sm text-muted-foreground">Goal: {fitnessPlan.goal}</span>
                </div>
              )}
            </div>
            
            <Card className="flex-1 max-w-md bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Today's Calories</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {caloriesEaten} / {dailyCalorieGoal} kcal
                  </span>
                </div>
                <Progress 
                  value={calorieProgress} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {dailyCalorieGoal - caloriesEaten > 0 
                    ? `${dailyCalorieGoal - caloriesEaten} kcal remaining` 
                    : 'Goal reached!'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Link to="/home">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Diet & Nutrition</h1>
          <p className="text-xl text-muted-foreground">
            Fuel your athletic performance with smart, personalized nutrition
          </p>
        </div>

        <FoodCategories />
      </div>

      <FoodScanner />
    </div>
  );
};

export default Nutrition;
