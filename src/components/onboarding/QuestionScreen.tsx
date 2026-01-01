import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface QuestionScreenProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  onNext: (answer: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

const QuestionScreen = ({
  question,
  questionNumber,
  totalQuestions,
  onNext,
  onSkip,
  onBack,
}: QuestionScreenProps) => {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");

  const handleNext = () => {
    onNext(answer);
    setAnswer("");
  };

  const handleSkip = () => {
    onSkip();
    setAnswer("");
  };

  const handleBack = () => {
    if (questionNumber === 1) {
      // On first question, go back to sign in
      navigate("/auth");
    } else {
      onBack();
    }
  };
  return (
    <div 
      key={questionNumber}
      className="flex flex-col items-center justify-between min-h-screen px-6 py-12 animate-fade-in"
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md py-8">
        <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-8 leading-relaxed">
          {question}
        </h2>
        
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full min-h-[120px] text-lg resize-none"
        />
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full text-lg min-h-[52px] py-4 transition-all duration-300 hover:scale-105 active:scale-[0.98]"
          disabled={!answer.trim()}
        >
          Next
        </Button>
        <div className="flex gap-3">
          <Button
            onClick={handleBack}
            variant="outline"
            size="lg"
            className="flex-1 text-lg min-h-[52px] py-4 active:scale-[0.98] transition-transform"
          >
            {questionNumber === 1 ? "Sign In" : "Back"}
          </Button>
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="lg"
            className="flex-1 text-lg min-h-[52px] py-4 text-muted-foreground hover:text-foreground active:scale-[0.98] transition-transform"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen;
