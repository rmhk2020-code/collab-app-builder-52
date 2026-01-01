import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Apple, Target, Zap, TrendingUp, Calendar, Clock, Heart } from "lucide-react";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";

const Home = () => {
  const { fitnessPlan } = useFitnessPlan();

  return (
    <div className="min-h-screen bg-background">
      {/* Goal Summary Section - Only shown if user has a plan */}
      {fitnessPlan && (
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 py-6 px-4 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Your Fitness Goal</h2>
            </div>
            <Card className="bg-card/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              Slim & <span className="text-primary">Smart</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Achieve your athletic potential through personalized exercise programs 
              and nutrition plans tailored to your specific goals
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Science-Based Approach
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Choose Your Path
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Explore our comprehensive library of exercises and nutrition plans designed 
            for athletes of all levels
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Exercise Library Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border bg-card overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Dumbbell className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-card-foreground">Exercise Library</CardTitle>
                <CardDescription className="text-muted-foreground">
                  300+ exercises with detailed FITT principles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Strength, Cardio, Flexibility & more
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Beginner to Professional levels
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Step-by-step instructions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Equipment & modification options
                  </li>
                </ul>
                <Link to="/exercises">
                  <Button className="w-full mt-4" size="lg">
                    Browse Exercises
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Diet/Food Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border bg-card overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Apple className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-card-foreground">Diet & Nutrition</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Fuel your performance with smart nutrition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    AI-powered food analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Macro & calorie tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Goal-based meal suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Dietary restriction support
                  </li>
                </ul>
                <Link to="/nutrition">
                  <Button className="w-full mt-4" size="lg" variant="outline">
                    Explore Nutrition
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">300+</div>
              <div className="text-primary-foreground/80 mt-1">Exercises</div>
            </div>
            <div>
              <div className="text-4xl font-bold">20+</div>
              <div className="text-primary-foreground/80 mt-1">Categories</div>
            </div>
            <div>
              <div className="text-4xl font-bold">3</div>
              <div className="text-primary-foreground/80 mt-1">Skill Levels</div>
            </div>
            <div>
              <div className="text-4xl font-bold">FITT</div>
              <div className="text-primary-foreground/80 mt-1">Principle Based</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl text-center space-y-2">
          <p className="text-muted-foreground">Slim & Smart — Your personalized path to athletic excellence</p>
          <p className="text-sm font-medium text-muted-foreground tracking-wide">Health Kinetics</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
