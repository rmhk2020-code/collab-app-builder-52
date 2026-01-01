import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Zap, TrendingUp, Calendar, Clock, Dumbbell, CheckCircle, Flame, Apple, Smile, Frown, Meh, Heart, Sparkles, RefreshCw } from "lucide-react";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import { useUserData } from "@/hooks/useUserData";
import AppHeader from "@/components/layout/AppHeader";

const quotes = {
  great: [
    "Your energy is contagious! Channel it into something amazing today.",
    "When you feel unstoppable, you become unstoppable. Go get it!",
    "This is your moment. Make every rep, every step count!",
    "Champions are made when no one is watching. Keep pushing!",
    "Your body can do it. It is your mind you need to convince.",
    "Today is the day to be better than yesterday. You have got this!",
    "Energy flows where intention goes. Focus and conquer!",
    "The fire inside you is stronger than any obstacle ahead.",
  ],
  good: [
    "Consistency beats perfection. Keep showing up!",
    "Good vibes lead to great results. Stay on track!",
    "You are one workout away from a great mood. Let us go!",
    "Every step forward is a step toward your best self.",
    "Success is built one day at a time. Today counts!",
    "Your dedication today creates your results tomorrow.",
    "Stay focused, stay positive, stay strong!",
    "The only bad workout is the one that did not happen.",
  ],
  okay: [
    "Progress is progress, no matter how small. You are doing great!",
    "Some days are harder than others. What matters is you did not quit.",
    "Even on tough days, you are building something beautiful.",
    "Not every day will be your best, but every day can move you forward.",
    "Showing up when it is hard is what separates dreamers from achievers.",
    "Be gentle with yourself. Growth takes time and patience.",
    "Small steps still move you forward. Keep going!",
    "You do not have to be perfect to make progress.",
  ],
  tired: [
    "Rest is part of the journey. Recovery makes you stronger.",
    "Listen to your body. Tomorrow is another opportunity.",
    "Taking care of yourself is the most powerful thing you can do.",
    "Even rest days are part of your training. Honor your body.",
    "Recharging today means crushing it tomorrow. Be kind to yourself.",
    "Your body is your temple. Give it the rest it deserves.",
    "Strength is knowing when to push and when to pause.",
    "Recovery is not weakness. It is wisdom.",
  ],
};

const Home = () => {
  const { 
    fitnessPlan,
    exercisesCompletedToday,
    exercisesCompletedThisWeek,
    weeklyExerciseGoal,
    caloriesEaten,
    dailyCalorieGoal,
    isGuest
  } = useFitnessPlan();
  
  // Initialize user data sync
  useUserData();
  
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>("fitness-goal");
  const [selectedMood, setSelectedMood] = useState<string | null>(() => {
    // Load saved mood from localStorage
    return localStorage.getItem("userMood");
  });
  const [quoteIndex, setQuoteIndex] = useState(() => {
    const saved = localStorage.getItem("quoteIndex");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Handle section from URL params
  useEffect(() => {
    const section = searchParams.get("section");
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  // Save mood to localStorage when it changes
  useEffect(() => {
    if (selectedMood) {
      localStorage.setItem("userMood", selectedMood);
    }
  }, [selectedMood]);

  // Save quote index to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("quoteIndex", quoteIndex.toString());
  }, [quoteIndex]);

  // Auto-cycle quotes every 30 seconds
  useEffect(() => {
    if (!selectedMood) return;
    
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % 8);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [selectedMood]);

  const dailyExerciseGoal = 1;
  const dailyExerciseProgress = Math.min((exercisesCompletedToday / dailyExerciseGoal) * 100, 100);
  const weeklyExerciseProgress = Math.min((exercisesCompletedThisWeek / weeklyExerciseGoal) * 100, 100);
  const calorieProgress = Math.min((caloriesEaten / dailyCalorieGoal) * 100, 100);

  const exercisesRemainingToday = Math.max(dailyExerciseGoal - exercisesCompletedToday, 0);
  const exercisesRemainingWeek = Math.max(weeklyExerciseGoal - exercisesCompletedThisWeek, 0);
  const caloriesRemaining = Math.max(dailyCalorieGoal - caloriesEaten, 0);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-6">
        {activeSection === "fitness-goal" && (
          <section className="animate-fade-in">
            {/* Welcome Message */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome! 👋
              </h2>
              <p className="text-muted-foreground mt-1">
                Let's crush your fitness goals today
              </p>
            </div>

            {/* How Are You Feeling Card */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 mb-6">
              <CardContent className="py-5">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-primary" />
                    <h3 className="font-medium text-foreground">How are you feeling today?</h3>
                  </div>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {[
                      { mood: "great", icon: Sparkles, label: "Great!", color: "text-emerald-500" },
                      { mood: "good", icon: Smile, label: "Good", color: "text-blue-500" },
                      { mood: "okay", icon: Meh, label: "Okay", color: "text-amber-500" },
                      { mood: "tired", icon: Frown, label: "Tired", color: "text-orange-500" },
                    ].map(({ mood, icon: Icon, label, color }) => (
                      <Button
                        key={mood}
                        variant={selectedMood === mood ? "default" : "outline"}
                        size="sm"
                        className={`min-h-[40px] gap-2 transition-all ${
                          selectedMood === mood 
                            ? "" 
                            : `hover:bg-primary/10`
                        }`}
                        onClick={() => {
                          setSelectedMood(mood);
                          setQuoteIndex(Math.floor(Math.random() * 8));
                        }}
                      >
                        <Icon className={`h-4 w-4 ${selectedMood === mood ? "" : color}`} />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivational Quote Card */}
            {selectedMood && (
              <Card className="bg-card border-border mb-6 animate-fade-in">
                <CardContent className="py-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10 shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-muted-foreground">Daily Motivation</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setQuoteIndex((prev) => (prev + 1) % 8)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-foreground font-medium italic">
                        {quotes[selectedMood as keyof typeof quotes][quoteIndex]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Tracking Section */}
            {!isGuest && (
              <div className="mb-8 space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Today's Progress
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Exercise Progress Card */}
                  <Card className="bg-card border-border">
                    <CardContent className="pt-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-5 w-5 text-amber-500" />
                          <span className="font-medium text-foreground">Exercise</span>
                        </div>
                        <Link to="/exercises">
                          <Button variant="ghost" size="sm" className="text-xs min-h-[32px]">
                            View Details
                          </Button>
                        </Link>
                      </div>
                      
                      {/* Daily Exercise */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <CheckCircle className={`h-4 w-4 ${dailyExerciseProgress >= 100 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                            Today
                          </span>
                          <span className="font-medium">
                            {exercisesCompletedToday}/{dailyExerciseGoal} workout
                          </span>
                        </div>
                        <Progress value={dailyExerciseProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {exercisesRemainingToday > 0 
                            ? `${exercisesRemainingToday} workout remaining today` 
                            : "✓ Daily goal completed!"
                          }
                        </p>
                      </div>

                      {/* Weekly Exercise */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className={`h-4 w-4 ${weeklyExerciseProgress >= 100 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                            This Week
                          </span>
                          <span className="font-medium">
                            {exercisesCompletedThisWeek}/{weeklyExerciseGoal} workouts
                          </span>
                        </div>
                        <Progress value={weeklyExerciseProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {exercisesRemainingWeek > 0 
                            ? `${exercisesRemainingWeek} workouts remaining this week` 
                            : "✓ Weekly goal completed!"
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Nutrition Progress Card */}
                  <Card className="bg-card border-border">
                    <CardContent className="pt-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Apple className="h-5 w-5 text-emerald-500" />
                          <span className="font-medium text-foreground">Nutrition</span>
                        </div>
                        <Link to="/nutrition">
                          <Button variant="ghost" size="sm" className="text-xs min-h-[32px]">
                            View Details
                          </Button>
                        </Link>
                      </div>
                      
                      {/* Calorie Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Flame className={`h-4 w-4 ${calorieProgress >= 100 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                            Calories Today
                          </span>
                          <span className="font-medium">
                            {caloriesEaten}/{dailyCalorieGoal} kcal
                          </span>
                        </div>
                        <Progress value={calorieProgress} className="h-3" />
                        <p className="text-xs text-muted-foreground">
                          {caloriesRemaining > 0 
                            ? `${caloriesRemaining} kcal remaining to reach your goal` 
                            : "✓ Daily calorie goal reached!"
                          }
                        </p>
                      </div>

                      {/* Macro Summary */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          Track your meals to stay on target with your nutrition goals.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Guest Banner */}
            {isGuest && (
              <Card className="bg-amber-500/10 border-amber-500/20 mb-6">
                <CardContent className="py-4">
                  <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                    You're in guest mode. <Link to="/" className="underline font-medium">Sign in</Link> to track your progress and save your data!
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Your Fitness Goal</h3>
            </div>

            {fitnessPlan ? (
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Goal</p>
                        <p className="font-medium text-foreground">{fitnessPlan.goal}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Weekly Plan</p>
                        <p className="font-medium text-foreground">{fitnessPlan.weeklyPlan}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Dumbbell className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Workout Style</p>
                        <p className="font-medium text-foreground">{fitnessPlan.workoutStyle}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium text-foreground">{fitnessPlan.duration}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Fitness Goal Set</h3>
                  <p className="text-muted-foreground mb-6">
                    Complete the onboarding to set your personalized fitness goals
                  </p>
                  <Link to="/onboarding">
                    <Button className="min-h-[44px]">Set Your Goals</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {activeSection === "what-we-offer" && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">What Do We Offer</h2>
            </div>

            <p className="text-muted-foreground mb-8">
              We combine the FITT principle (Frequency, Intensity, Time, Type) with personalized 
              nutrition to create comprehensive programs for every athlete level
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border bg-card">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-card-foreground">Set Your Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Define your athletic requirements - whether building strength, improving endurance, 
                    or achieving specific performance targets
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-card-foreground">Personalized Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Get customized exercise routines with varied intensity levels, frequencies, 
                    and durations matched with optimal nutrition
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-card-foreground">Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Monitor your improvements and adjust your program as you progress 
                    toward your athletic goals
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
