import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, Heart, Dumbbell, Zap, Eye, Bone, Shield, Leaf, Sparkles, Scale, Flame, Moon, Star, Search, X } from "lucide-react";
import { foodCategories, getFoodImage, FoodItem } from "@/data/foodData";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import { useSettings } from "@/contexts/SettingsContext";
import { FoodVideoPlayer } from "./FoodVideoPlayer";

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

// Check if food matches dietary preferences
const foodMatchesDiet = (food: FoodItem, dietaryPreferences: string[], allergies: string[]): boolean => {
  // Check allergies - if food name contains any allergen, exclude it
  const foodNameLower = food.name.toLowerCase();
  for (const allergen of allergies) {
    if (foodNameLower.includes(allergen.toLowerCase())) {
      return false;
    }
  }
  
  // If no dietary preferences set, show all foods
  if (dietaryPreferences.length === 0) return true;
  
  // Simple diet matching based on food properties
  const benefitsLower = food.benefits.map(b => b.toLowerCase()).join(' ');
  
  // Vegan/vegetarian filtering (basic heuristic)
  const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'meat', 'turkey'];
  const dairyKeywords = ['milk', 'cheese', 'yogurt', 'dairy'];
  const isMeat = meatKeywords.some(k => foodNameLower.includes(k));
  const isDairy = dairyKeywords.some(k => foodNameLower.includes(k));
  
  if (dietaryPreferences.includes('vegan') && (isMeat || isDairy)) return false;
  if (dietaryPreferences.includes('vegetarian') && isMeat) return false;
  if (dietaryPreferences.includes('dairy-free') && isDairy) return false;
  
  // High protein preference
  if (dietaryPreferences.includes('high-protein') && food.protein < 15) return false;
  
  // Low carb preference
  if (dietaryPreferences.includes('low-carb') && food.carbs > 20) return false;
  
  return true;
};

export const FoodCategories = () => {
  const { isGuest, fitnessPlan } = useFitnessPlan();
  const { dietSettings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories and foods by search query AND diet settings
  const filteredCategories = useMemo(() => {
    const categories = isGuest 
      ? [{ ...foodCategories[0], foods: foodCategories[0].foods.slice(0, 5) }]
      : foodCategories;

    let result = categories.map(category => {
      // Filter foods based on dietary preferences and allergies
      let filteredFoods = dietSettings.showRecommendedFoods
        ? category.foods.filter(food => 
            foodMatchesDiet(food, dietSettings.dietaryPreferences, dietSettings.allergies)
          )
        : category.foods;

      // Apply search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredFoods = filteredFoods.filter(food =>
          food.name.toLowerCase().includes(query) ||
          food.benefits.some(benefit => benefit.toLowerCase().includes(query)) ||
          category.title.toLowerCase().includes(query)
        );
      }

      return { ...category, foods: filteredFoods };
    });

    // Filter out empty categories
    result = result.filter(category => category.foods.length > 0);

    // Sort recommended categories first if showRecommendedFoods is enabled
    if (dietSettings.showRecommendedFoods && fitnessPlan) {
      result = [...result].sort((a, b) => {
        const aRecommended = isFoodRecommended(a.title, fitnessPlan);
        const bRecommended = isFoodRecommended(b.title, fitnessPlan);
        if (aRecommended && !bRecommended) return -1;
        if (bRecommended && !aRecommended) return 1;
        return 0;
      });
    }

    return result;
  }, [isGuest, searchQuery, dietSettings, fitnessPlan]);

  // Count total foods for display
  const totalFoods = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.foods.length, 0);
  }, [filteredCategories]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Foods by Body Benefit</h2>
        <p className="text-muted-foreground">
          Discover foods that target specific areas of your health
          {isGuest && <span className="block text-sm text-amber-500 mt-1">Guest preview: Showing 5 foods. Sign in for 300+ foods!</span>}
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search foods by name, benefit, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {totalFoods} food{totalFoods !== 1 ? 's' : ''} in {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'} matching "{searchQuery}"
            </p>
          )}
        </div>
      </div>
      
      {filteredCategories.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <Leaf className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No foods found</h3>
            <p className="text-muted-foreground">
              No foods match "{searchQuery}". Try a different search term.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => {
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
                        <div className="flex gap-3">
                          {/* Food Image */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            <img 
                              src={getFoodImage(food.name)} 
                              alt={food.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                // fallback to a known-good default image
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getFoodImage("__fallback__");
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-foreground truncate">{food.name}</span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <FoodVideoPlayer 
                                  foodName={food.name}
                                  calories={food.calories}
                                  protein={food.protein}
                                  carbs={food.carbs}
                                  fats={food.fats}
                                />
                                <Badge variant={food.isHealthy ? "default" : "destructive"} className="text-xs">
                                  {food.isHealthy ? "Healthy" : "Moderate"}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mt-1">
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
      )}
    </div>
  );
};
