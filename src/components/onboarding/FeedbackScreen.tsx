import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import type { FitnessPlan } from "@/contexts/FitnessPlanContext";

interface FeedbackScreenProps {
  currentPlan: FitnessPlan;
  onSubmit: (feedback: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const FeedbackScreen = ({ currentPlan, onSubmit, onBack, isLoading }: FeedbackScreenProps) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 min-h-[44px] px-4 active:scale-[0.98] transition-transform"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plan
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
            Share Your Thoughts
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us what you'd like to change about your fitness plan
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-muted/50">
            <h3 className="font-medium text-foreground mb-2">Current Plan Summary:</h3>
            <p className="text-sm text-muted-foreground mb-1">
              <strong>Goal:</strong> {currentPlan.goal}
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              <strong>Weekly Plan:</strong> {currentPlan.weeklyPlan}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Workout Style:</strong> {currentPlan.workoutStyle}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              What would you like to improve or change?
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="For example: I'd prefer more cardio exercises, shorter workout sessions, or different intensity levels..."
              className="min-h-[150px] text-lg"
            />
          </div>

          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full text-lg min-h-[52px] py-4 transition-all duration-300 hover:scale-105 active:scale-[0.98]"
            disabled={!feedback.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Updating Your Plan...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Update My Plan
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackScreen;
