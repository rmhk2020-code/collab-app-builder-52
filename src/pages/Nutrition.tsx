import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FoodCategories } from "@/components/nutrition/FoodCategories";
import { FoodScanner } from "@/components/nutrition/FoodScanner";

const Nutrition = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Diet & Nutrition</h1>
          <p className="text-xl text-muted-foreground">
            Fuel your athletic performance with smart, personalized nutrition
          </p>
        </div>

        <FoodCategories />
      </div>

      <FoodScanner />
    </div>
  );
};

export default Nutrition;
