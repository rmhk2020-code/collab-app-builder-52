import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, Dumbbell, Zap, Eye, Bone } from "lucide-react";

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isHealthy: boolean;
  benefits: string[];
}

interface FoodCategory {
  title: string;
  icon: React.ReactNode;
  description: string;
  foods: FoodItem[];
}

const foodCategories: FoodCategory[] = [
  {
    title: "Brain & Focus",
    icon: <Brain className="h-5 w-5" />,
    description: "Foods that enhance cognitive function and mental clarity",
    foods: [
      { name: "Salmon", calories: 208, protein: 20, carbs: 0, fats: 13, isHealthy: true, benefits: ["Omega-3", "DHA"] },
      { name: "Blueberries", calories: 57, protein: 0.7, carbs: 14, fats: 0.3, isHealthy: true, benefits: ["Antioxidants", "Vitamin C"] },
      { name: "Walnuts", calories: 185, protein: 4.3, carbs: 4, fats: 18, isHealthy: true, benefits: ["Omega-3", "Vitamin E"] },
      { name: "Dark Chocolate", calories: 170, protein: 2, carbs: 13, fats: 12, isHealthy: true, benefits: ["Flavonoids", "Iron"] },
    ]
  },
  {
    title: "Heart Health",
    icon: <Heart className="h-5 w-5" />,
    description: "Foods that support cardiovascular function",
    foods: [
      { name: "Oats", calories: 154, protein: 6, carbs: 27, fats: 3, isHealthy: true, benefits: ["Fiber", "Beta-glucan"] },
      { name: "Avocado", calories: 160, protein: 2, carbs: 9, fats: 15, isHealthy: true, benefits: ["Potassium", "Healthy fats"] },
      { name: "Spinach", calories: 23, protein: 3, carbs: 4, fats: 0.4, isHealthy: true, benefits: ["Iron", "Folate"] },
      { name: "Olive Oil", calories: 119, protein: 0, carbs: 0, fats: 14, isHealthy: true, benefits: ["Monounsaturated fats", "Polyphenols"] },
    ]
  },
  {
    title: "Muscle Building",
    icon: <Dumbbell className="h-5 w-5" />,
    description: "High-protein foods for muscle growth and recovery",
    foods: [
      { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 4, isHealthy: true, benefits: ["Complete protein", "B vitamins"] },
      { name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fats: 1, isHealthy: true, benefits: ["Casein protein", "Probiotics"] },
      { name: "Eggs", calories: 155, protein: 13, carbs: 1, fats: 11, isHealthy: true, benefits: ["Complete protein", "Choline"] },
      { name: "Lean Beef", calories: 250, protein: 26, carbs: 0, fats: 15, isHealthy: true, benefits: ["Iron", "Creatine"] },
    ]
  },
  {
    title: "Energy & Endurance",
    icon: <Zap className="h-5 w-5" />,
    description: "Foods for sustained energy during workouts",
    foods: [
      { name: "Bananas", calories: 89, protein: 1, carbs: 23, fats: 0.3, isHealthy: true, benefits: ["Potassium", "Quick carbs"] },
      { name: "Sweet Potato", calories: 86, protein: 2, carbs: 20, fats: 0, isHealthy: true, benefits: ["Complex carbs", "Vitamin A"] },
      { name: "Quinoa", calories: 120, protein: 4, carbs: 21, fats: 2, isHealthy: true, benefits: ["Complete protein", "Fiber"] },
      { name: "Brown Rice", calories: 112, protein: 2.6, carbs: 24, fats: 0.9, isHealthy: true, benefits: ["Complex carbs", "Magnesium"] },
    ]
  },
  {
    title: "Eye Health",
    icon: <Eye className="h-5 w-5" />,
    description: "Foods rich in nutrients for vision support",
    foods: [
      { name: "Carrots", calories: 41, protein: 0.9, carbs: 10, fats: 0.2, isHealthy: true, benefits: ["Beta-carotene", "Vitamin A"] },
      { name: "Kale", calories: 33, protein: 2.9, carbs: 6, fats: 0.6, isHealthy: true, benefits: ["Lutein", "Zeaxanthin"] },
      { name: "Bell Peppers", calories: 31, protein: 1, carbs: 6, fats: 0.3, isHealthy: true, benefits: ["Vitamin C", "Vitamin A"] },
      { name: "Eggs", calories: 155, protein: 13, carbs: 1, fats: 11, isHealthy: true, benefits: ["Lutein", "Zinc"] },
    ]
  },
  {
    title: "Bone Strength",
    icon: <Bone className="h-5 w-5" />,
    description: "Foods that support bone density and joint health",
    foods: [
      { name: "Milk", calories: 42, protein: 3.4, carbs: 5, fats: 1, isHealthy: true, benefits: ["Calcium", "Vitamin D"] },
      { name: "Sardines", calories: 208, protein: 25, carbs: 0, fats: 11, isHealthy: true, benefits: ["Calcium", "Omega-3"] },
      { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fats: 0.4, isHealthy: true, benefits: ["Vitamin K", "Calcium"] },
      { name: "Almonds", calories: 164, protein: 6, carbs: 6, fats: 14, isHealthy: true, benefits: ["Calcium", "Magnesium"] },
    ]
  },
];

export const FoodCategories = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Foods by Body Benefit</h2>
        <p className="text-muted-foreground">Discover foods that target specific areas of your health</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodCategories.map((category) => (
          <Card key={category.title} className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {category.icon}
                </div>
                <div>
                  <CardTitle className="text-lg text-card-foreground">{category.title}</CardTitle>
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
        ))}
      </div>
    </div>
  );
};
