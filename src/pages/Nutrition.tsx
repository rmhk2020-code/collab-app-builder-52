import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera, Utensils, LineChart, Heart } from "lucide-react";

const Nutrition = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Diet & Nutrition</h1>
            <p className="text-xl text-muted-foreground">
              Fuel your athletic performance with smart, personalized nutrition plans
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">AI Food Scanner</CardTitle>
                <CardDescription>
                  Snap a photo and get instant nutritional analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI-powered scanner identifies foods and provides accurate calorie counts, 
                  macronutrient breakdowns, and diet compatibility assessments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Utensils className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Meal Planning</CardTitle>
                <CardDescription>
                  Custom meal plans aligned with your goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get personalized meal suggestions based on your athletic goals, 
                  dietary preferences, and nutritional requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Nutrition Tracking</CardTitle>
                <CardDescription>
                  Monitor your daily intake and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track calories, macros, and micronutrients with detailed charts 
                  and insights to optimize your nutrition strategy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Health Integration</CardTitle>
                <CardDescription>
                  Nutrition tailored to your health profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI considers your medical history, allergies, and health conditions 
                  to provide safe, effective nutritional guidance.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-muted/50">
            <CardContent className="py-12 text-center">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Coming Soon</h3>
              <p className="text-muted-foreground max-w-lg mx-auto">
                We're building advanced nutrition features including AI food scanning, 
                personalized meal plans, and comprehensive macro tracking. Stay tuned!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
