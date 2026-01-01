import { Button } from "@/components/ui/button";

interface ExplanationScreenProps {
  onStart: () => void;
}

const ExplanationScreen = ({ onStart }: ExplanationScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 py-12 animate-fade-in">
      <div className="flex-1" />
      
      <div className="text-center space-y-6 max-w-md">
        <p className="text-xl md:text-2xl text-foreground leading-relaxed">
          We'll ask you <span className="font-semibold text-primary">7 quick questions</span> to better understand your goals, schedule, and preferences.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Your answers will help us create a fitness plan that works for you.
        </p>
      </div>
      
      <div className="flex-1" />
      
      <Button
        onClick={onStart}
        size="lg"
        className="w-full max-w-sm text-lg py-6 transition-all duration-300 hover:scale-105"
      >
        Start
      </Button>
    </div>
  );
};

export default ExplanationScreen;
