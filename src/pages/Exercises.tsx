import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Target, Calendar, Clock } from "lucide-react";
import { ExerciseLibrary } from "@/components/exercises/ExerciseLibrary";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";

const Exercises = () => {
  const { 
    fitnessPlan, 
    exercisesCompletedToday, 
    exercisesCompletedThisWeek, 
    exercisesCompletedThisMonth,
    weeklyExerciseGoal,
    monthlyExerciseGoal
  } = useFitnessPlan();

  const dailyGoal = 1; // 1 workout per day
  const dailyProgress = Math.min((exercisesCompletedToday / dailyGoal) * 100, 100);
  const weeklyProgress = Math.min((exercisesCompletedThisWeek / weeklyExerciseGoal) * 100, 100);
  const monthlyProgress = Math.min((exercisesCompletedThisMonth / monthlyExerciseGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Tracking Bar */}
      <div className="sticky top-0 z-10 bg-card border-b border-border py-4 px-4 shadow-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Workout Progress</span>
            </div>
            {fitnessPlan && (
              <span className="text-sm text-muted-foreground">Goal: {fitnessPlan.goal}</span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${dailyProgress >= 100 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">Today</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{exercisesCompletedToday}/{dailyGoal}</span>
                </div>
                <Progress value={dailyProgress} className="h-2" />
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className={`h-4 w-4 ${weeklyProgress >= 100 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">This Week</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{exercisesCompletedThisWeek}/{weeklyExerciseGoal}</span>
                </div>
                <Progress value={weeklyProgress} className="h-2" />
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${monthlyProgress >= 100 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">This Month</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{exercisesCompletedThisMonth}/{monthlyExerciseGoal}</span>
                </div>
                <Progress value={monthlyProgress} className="h-2" />
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
      </div>
      <ExerciseLibrary />
    </div>
  );
};

export default Exercises;
