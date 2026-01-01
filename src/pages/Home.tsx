import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Zap, TrendingUp, Calendar, Clock, Dumbbell } from "lucide-react";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import AppHeader from "@/components/layout/AppHeader";

const Home = () => {
  const { fitnessPlan } = useFitnessPlan();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>("fitness-goal");

  // Handle section from URL params
  useEffect(() => {
    const section = searchParams.get("section");
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

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
