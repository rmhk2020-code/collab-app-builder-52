import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, Dumbbell, Zap, Eye, Bone, Shield, Leaf, Sparkles, Scale, Flame, Moon, Star } from "lucide-react";
import { foodCategories } from "@/data/foodData";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";

const iconMap: Record<string, React.ReactNode> = {
  Brain: <Brain className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Dumbbell: <Dumbbell className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  Eye: <Eye className="h-5 w-5" />,
  Bone: <Bone className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  Leaf: <Leaf className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Scale: <Scale className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Moon: <Moon className="h-5 w-5" />,
};

// Check if food is recommended based on fitness plan
const isFoodRecommended = (categoryTitle: string, fitnessPlan: any): boolean => {
  if (!fitnessPlan) return false;
  const goal = fitnessPlan.goal.toLowerCase();
  const style = fitnessPlan.workoutStyle.toLowerCase();
  
  if ((goal.includes("muscle") || style.includes("strength")) && categoryTitle === "Muscle Building") return true;
  if ((goal.includes("energy") || style.includes("cardio") || style.includes("endurance")) && categoryTitle === "Energy & Endurance") return true;
  if (goal.includes("weight") && categoryTitle === "Weight Management") return true;
  if ((goal.includes("recovery") || goal.includes("sleep")) && categoryTitle === "Recovery & Sleep") return true;
  if (goal.includes("heart") && categoryTitle === "Heart Health") return true;
  if (style.includes("flex") && categoryTitle === "Anti-Inflammatory") return true;
  
  return false;
};

export const FoodCategories = () => {
  const { isGuest, fitnessPlan } = useFitnessPlan();
  
  // Guest users see only first category with 5 foods
  const displayCategories = isGuest 
    ? [{ ...foodCategories[0], foods: foodCategories[0].foods.slice(0, 5) }]
    : foodCategories;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Foods by Body Benefit</h2>
        <p className="text-muted-foreground">
          Discover foods that target specific areas of your health
          {isGuest && <span className="block text-sm text-amber-500 mt-1">Guest preview: Showing 5 foods. Sign in for 300+ foods!</span>}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCategories.map((category) => {
          const recommended = isFoodRecommended(category.title, fitnessPlan);
          return (
            <Card key={category.title} className={`border-border bg-card ${recommended ? 'ring-2 ring-primary/50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {iconMap[category.icon] || <Leaf className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg text-card-foreground">{category.title}</CardTitle>
                      {recommended && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {category.foods.map((food) => (
                    <div key={food.name} className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{food.name}</span>
                        <Badge variant={food.isHealthy ? "default" : "destructive"} className="text-xs">
                          {food.isHealthy ? "Healthy" : "Moderate"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium text-foreground">{food.calories}</span>
                          <span className="block">cal</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{food.protein}g</span>
                          <span className="block">protein</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{food.carbs}g</span>
                          <span className="block">carbs</span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{food.fats}g</span>
                          <span className="block">fats</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {food.benefits.map((benefit) => (
                          <Badge key={benefit} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
