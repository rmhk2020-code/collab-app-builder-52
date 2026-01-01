import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import healthKineticsLogo from "@/assets/health-kinetics-logo.png";

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen = ({ onContinue }: WelcomeScreenProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/auth");
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 py-12 animate-fade-in">
      {/* Back Button */}
      <div className="w-full max-w-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2 min-h-[44px] -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <img 
          src={healthKineticsLogo} 
          alt="Health Kinetics Logo" 
          className="w-64 md:w-80 lg:w-96 h-auto object-contain"
        />
      </div>
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-light text-foreground leading-relaxed">
          Hello, welcome to your
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold text-primary">
          personalized fitness planner!
        </h2>
      </div>
      
      <div className="flex-1" />
      
      <Button
        onClick={onContinue}
        size="lg"
        className="w-full max-w-sm text-lg min-h-[52px] py-4 transition-all duration-300 hover:scale-105 active:scale-[0.98]"
      >
        Continue
      </Button>
      
      <p className="mt-8 text-sm text-muted-foreground font-medium tracking-wide">
        Health Kinetics
      </p>
    </div>
  );
};

export default WelcomeScreen;
