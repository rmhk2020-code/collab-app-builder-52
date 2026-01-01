import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dumbbell, Apple, Target, Zap, TrendingUp, Calendar, Clock, Activity, Settings, Menu } from "lucide-react";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";

const Home = () => {
  const { fitnessPlan } = useFitnessPlan();
  const [activeSection, setActiveSection] = useState<string>("fitness-goal");
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Hamburger Menu and Settings */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex justify-between items-center">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                <Button
                  variant={activeSection === "fitness-goal" ? "secondary" : "ghost"}
                  className="justify-start min-h-[44px]"
                  onClick={() => handleSectionChange("fitness-goal")}
                >
                  <Target className="h-5 w-5 mr-3" />
                  Fitness Goal
                </Button>
                <Link to="/exercises" onClick={() => setSheetOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start min-h-[44px]">
                    <Dumbbell className="h-5 w-5 mr-3" />
                    Exercises
                  </Button>
                </Link>
                <Link to="/nutrition" onClick={() => setSheetOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start min-h-[44px]">
                    <Apple className="h-5 w-5 mr-3" />
                    Nutrition
                  </Button>
                </Link>
                <Link to="/health" onClick={() => setSheetOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start min-h-[44px]">
                    <Activity className="h-5 w-5 mr-3" />
                    Vitals
                  </Button>
                </Link>
                <Button
                  variant={activeSection === "what-we-offer" ? "secondary" : "ghost"}
                  className="justify-start min-h-[44px]"
                  onClick={() => handleSectionChange("what-we-offer")}
                >
                  <Zap className="h-5 w-5 mr-3" />
                  What Do We Offer
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold text-foreground">Slim & Smart</h1>

          <Link to="/settings">
            <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-6">
        {activeSection === "fitness-goal" && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Your Fitness Goal</h2>
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
