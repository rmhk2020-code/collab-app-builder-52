import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Question } from "@/data/onboardingQuestions";
import { cn } from "@/lib/utils";

interface DynamicQuestionScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onNext: (answer: string | string[]) => void;
  onSkip: () => void;
  onBack: () => void;
  isFirstQuestion: boolean;
}

const DynamicQuestionScreen = ({
  question,
  questionNumber,
  totalQuestions,
  onNext,
  onSkip,
  onBack,
  isFirstQuestion,
}: DynamicQuestionScreenProps) => {
  const navigate = useNavigate();
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Reset state when question changes
  useEffect(() => {
    setTextAnswer("");
    setSelectedOption("");
    setSelectedOptions([]);
  }, [question.id]);

  const handleNext = () => {
    if (question.type === "text") {
      onNext(textAnswer);
    } else if (question.type === "multi-choice") {
      onNext(selectedOptions);
    } else {
      onNext(selectedOption);
    }
  };

  const handleBack = () => {
    if (isFirstQuestion) {
      navigate("/auth");
    } else {
      onBack();
    }
  };

  const toggleMultiOption = (value: string) => {
    setSelectedOptions((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const isValid = () => {
    if (question.type === "text") {
      return textAnswer.trim().length > 0;
    } else if (question.type === "multi-choice") {
      return selectedOptions.length > 0;
    } else {
      return selectedOption.length > 0;
    }
  };

  return (
    <div
      key={question.id}
      className="flex flex-col items-center justify-between min-h-screen px-6 py-12 animate-fade-in"
    >
      {/* Progress */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of ~{totalQuestions}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {question.category}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((questionNumber / totalQuestions) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md py-8">
        <h2 className="text-2xl md:text-3xl font-medium text-foreground text-center mb-8 leading-relaxed">
          {question.text}
        </h2>

        {/* Text Input */}
        {question.type === "text" && (
          <Textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder={question.placeholder || "Type your answer here..."}
            className="w-full min-h-[120px] text-lg resize-none"
          />
        )}

        {/* Single Choice */}
        {question.type === "choice" && question.options && (
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="w-full space-y-3"
          >
            {question.options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer",
                  selectedOption === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setSelectedOption(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label
                  htmlFor={option.value}
                  className="text-base cursor-pointer flex-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* Multi Choice */}
        {question.type === "multi-choice" && question.options && (
          <div className="w-full space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Select all that apply
            </p>
            {question.options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer",
                  selectedOptions.includes(option.value)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => toggleMultiOption(option.value)}
              >
                <Checkbox
                  checked={selectedOptions.includes(option.value)}
                  onCheckedChange={() => toggleMultiOption(option.value)}
                  id={option.value}
                />
                <Label
                  htmlFor={option.value}
                  className="text-base cursor-pointer flex-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="w-full max-w-sm space-y-3">
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full text-lg min-h-[52px] py-4 transition-all duration-300 hover:scale-105 active:scale-[0.98]"
          disabled={!isValid()}
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
            {isFirstQuestion ? "Sign In" : "Back"}
          </Button>
          <Button
            onClick={onSkip}
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

export default DynamicQuestionScreen;
