import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Calendar, Dumbbell, Heart, MessageSquare } from "lucide-react";
import type { FitnessPlan } from "@/contexts/FitnessPlanContext";

interface FitnessPlanScreenProps {
  plan: FitnessPlan;
  onFinish: () => void;
  onFeedback: () => void;
}

const FitnessPlanScreen = ({ plan, onFinish, onFeedback }: FitnessPlanScreenProps) => {
  const sections = [
    {
      icon: Target,
      title: "Your Goal",
      content: plan.goal,
      color: "text-primary",
    },
    {
      icon: Calendar,
      title: "Your Weekly Plan",
      content: plan.weeklyPlan,
      color: "text-emerald-500",
    },
    {
      icon: Dumbbell,
      title: "Workout Style",
      content: plan.workoutStyle,
      color: "text-amber-500",
    },
    {
      icon: Heart,
      title: "Staying Consistent",
      content: plan.stayingConsistent,
      color: "text-rose-500",
    },
  ];

  return (
    <div className="min-h-screen px-6 py-12 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
            Your Personalized Plan
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what we've crafted just for you
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {sections.map((section, index) => (
            <Card 
              key={section.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <section.icon className={`w-5 h-5 ${section.color}`} />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground mb-1">Session Duration</p>
                  <p className="text-muted-foreground text-sm">{plan.duration}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground mb-1">Progression</p>
                  <p className="text-muted-foreground text-sm">{plan.progression}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground px-4">
            Remember: This plan is a starting point. Listen to your body and adjust as needed. You can always update your preferences later.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onFinish}
              size="lg"
              className="flex-1 text-lg min-h-[52px] py-4 transition-all duration-300 hover:scale-105 active:scale-[0.98]"
            >
              Let's Get Started!
            </Button>
            <Button
              onClick={onFeedback}
              variant="outline"
              size="lg"
              className="flex-1 text-lg min-h-[52px] py-4 transition-all duration-300 hover:scale-105 active:scale-[0.98]"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Give Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessPlanScreen;
