// Dynamic onboarding questions with conditional follow-ups

export interface QuestionOption {
  label: string;
  value: string;
  followUp?: Question;
}

export interface Question {
  id: string;
  text: string;
  type: "text" | "choice" | "multi-choice" | "scale";
  options?: QuestionOption[];
  placeholder?: string;
  scaleLabels?: { min: string; max: string };
  category: "goal" | "fitness" | "schedule" | "health" | "preferences" | "barriers";
}

export const baseQuestions: Question[] = [
  {
    id: "primary_goal",
    text: "What's your main fitness goal right now?",
    type: "choice",
    category: "goal",
    options: [
      { 
        label: "Lose weight", 
        value: "weight_loss",
        followUp: {
          id: "weight_loss_amount",
          text: "How much weight would you like to lose?",
          type: "choice",
          category: "goal",
          options: [
            { label: "5-10 lbs (2-5 kg)", value: "small" },
            { label: "10-25 lbs (5-12 kg)", value: "medium" },
            { label: "25-50 lbs (12-23 kg)", value: "large" },
            { label: "50+ lbs (23+ kg)", value: "significant" }
          ]
        }
      },
      { 
        label: "Build muscle", 
        value: "muscle_gain",
        followUp: {
          id: "muscle_focus",
          text: "Which areas do you want to focus on most?",
          type: "multi-choice",
          category: "goal",
          options: [
            { label: "Upper body (chest, arms, shoulders)", value: "upper" },
            { label: "Core (abs, obliques)", value: "core" },
            { label: "Lower body (legs, glutes)", value: "lower" },
            { label: "Full body balanced", value: "full" }
          ]
        }
      },
      { 
        label: "Improve endurance", 
        value: "endurance",
        followUp: {
          id: "endurance_type",
          text: "What type of endurance are you aiming for?",
          type: "choice",
          category: "goal",
          options: [
            { label: "Running/cardio endurance", value: "cardio" },
            { label: "Sports performance", value: "sports" },
            { label: "Daily energy levels", value: "daily" },
            { label: "Muscular endurance", value: "muscular" }
          ]
        }
      },
      { 
        label: "Increase flexibility", 
        value: "flexibility",
        followUp: {
          id: "flexibility_reason",
          text: "What's driving your flexibility goal?",
          type: "choice",
          category: "goal",
          options: [
            { label: "Pain relief/mobility", value: "pain" },
            { label: "Yoga/martial arts practice", value: "practice" },
            { label: "Injury prevention", value: "prevention" },
            { label: "General wellness", value: "wellness" }
          ]
        }
      },
      { 
        label: "Get stronger overall", 
        value: "strength" 
      },
      { 
        label: "Reduce stress & feel better", 
        value: "wellness" 
      }
    ]
  },
  {
    id: "fitness_level",
    text: "How would you describe your current fitness level?",
    type: "choice",
    category: "fitness",
    options: [
      { 
        label: "Complete beginner", 
        value: "beginner",
        followUp: {
          id: "beginner_experience",
          text: "Have you ever exercised regularly before?",
          type: "choice",
          category: "fitness",
          options: [
            { label: "Never really exercised", value: "never" },
            { label: "Used to exercise, took a long break", value: "returning" },
            { label: "Exercise occasionally but inconsistently", value: "occasional" }
          ]
        }
      },
      { 
        label: "Some experience", 
        value: "intermediate",
        followUp: {
          id: "intermediate_frequency",
          text: "How often have you been working out recently?",
          type: "choice",
          category: "fitness",
          options: [
            { label: "1-2 times per week", value: "low" },
            { label: "3-4 times per week", value: "moderate" },
            { label: "Sporadically/inconsistently", value: "sporadic" }
          ]
        }
      },
      { 
        label: "Fairly fit", 
        value: "advanced" 
      },
      { 
        label: "Very athletic", 
        value: "athlete" 
      }
    ]
  },
  {
    id: "workout_days",
    text: "How many days per week can you realistically commit to working out?",
    type: "choice",
    category: "schedule",
    options: [
      { label: "1-2 days", value: "1-2" },
      { label: "3-4 days", value: "3-4" },
      { label: "5-6 days", value: "5-6" },
      { label: "Every day", value: "7" }
    ]
  },
  {
    id: "workout_duration",
    text: "How much time do you have for each workout session?",
    type: "choice",
    category: "schedule",
    options: [
      { label: "15-20 minutes", value: "15-20" },
      { label: "30-45 minutes", value: "30-45" },
      { label: "45-60 minutes", value: "45-60" },
      { label: "60+ minutes", value: "60+" }
    ]
  },
  {
    id: "health_conditions",
    text: "Do you have any injuries, pain, or health conditions we should consider?",
    type: "choice",
    category: "health",
    options: [
      { label: "No issues", value: "none" },
      { 
        label: "Yes, I have some limitations", 
        value: "yes",
        followUp: {
          id: "health_details",
          text: "Please tell us about your health considerations:",
          type: "multi-choice",
          category: "health",
          options: [
            { 
              label: "Back pain/issues", 
              value: "back",
              followUp: {
                id: "back_severity",
                text: "How severe is your back condition?",
                type: "choice",
                category: "health",
                options: [
                  { label: "Mild - occasional discomfort", value: "mild" },
                  { label: "Moderate - affects some activities", value: "moderate" },
                  { label: "Severe - significantly limiting", value: "severe" }
                ]
              }
            },
            { label: "Knee problems", value: "knee" },
            { label: "Shoulder issues", value: "shoulder" },
            { label: "Heart condition", value: "heart" },
            { label: "Joint pain/arthritis", value: "joints" },
            { label: "Pregnancy/postpartum", value: "pregnancy" },
            { label: "Other condition", value: "other" }
          ]
        }
      }
    ]
  },
  {
    id: "workout_preferences",
    text: "What types of workouts do you enjoy most?",
    type: "multi-choice",
    category: "preferences",
    options: [
      { label: "Weight training", value: "weights" },
      { label: "Cardio (running, cycling)", value: "cardio" },
      { label: "HIIT/Circuit training", value: "hiit" },
      { label: "Yoga/Pilates", value: "yoga" },
      { label: "Swimming", value: "swimming" },
      { label: "Sports/recreational activities", value: "sports" },
      { label: "Bodyweight exercises", value: "bodyweight" },
      { label: "Dance/aerobics", value: "dance" }
    ]
  },
  {
    id: "consistency_barriers",
    text: "What usually makes it hard for you to stay consistent with workouts?",
    type: "multi-choice",
    category: "barriers",
    options: [
      { 
        label: "Lack of time", 
        value: "time",
        followUp: {
          id: "time_barrier",
          text: "When do you typically have the most free time?",
          type: "choice",
          category: "barriers",
          options: [
            { label: "Early morning (before work)", value: "morning" },
            { label: "Lunch break", value: "lunch" },
            { label: "After work/evening", value: "evening" },
            { label: "Weekends only", value: "weekends" }
          ]
        }
      },
      { 
        label: "Lack of motivation", 
        value: "motivation",
        followUp: {
          id: "motivation_type",
          text: "What motivates you most?",
          type: "choice",
          category: "barriers",
          options: [
            { label: "Seeing visual progress", value: "visual" },
            { label: "Achieving goals/milestones", value: "goals" },
            { label: "Working out with others", value: "social" },
            { label: "Having a set routine/schedule", value: "routine" }
          ]
        }
      },
      { label: "Boredom with routines", value: "boredom" },
      { label: "Physical tiredness", value: "tired" },
      { label: "No gym access/equipment", value: "equipment" },
      { label: "Don't know what to do", value: "knowledge" },
      { label: "Injuries/pain", value: "injury" }
    ]
  }
];

// Helper to flatten questions with their follow-ups based on answers
export function getNextQuestion(
  currentQuestion: Question,
  answer: string | string[],
  allAnswers: Record<string, string | string[]>,
  questionIndex: number
): Question | null {
  // Check if the current answer triggers a follow-up
  if (currentQuestion.options) {
    const selectedValues = Array.isArray(answer) ? answer : [answer];
    
    for (const option of currentQuestion.options) {
      if (selectedValues.includes(option.value) && option.followUp) {
        return option.followUp;
      }
    }
  }
  
  // Move to the next base question
  const nextBaseIndex = questionIndex + 1;
  if (nextBaseIndex < baseQuestions.length) {
    return baseQuestions[nextBaseIndex];
  }
  
  return null;
}

// Build full question flow for AI context
export function buildQuestionSummary(answers: Record<string, string | string[]>): string {
  const lines: string[] = [];
  
  for (const [questionId, answer] of Object.entries(answers)) {
    const question = findQuestionById(questionId);
    if (question) {
      const answerText = Array.isArray(answer) 
        ? answer.map(v => getLabelForValue(question, v)).join(", ")
        : getLabelForValue(question, answer) || answer;
      
      lines.push(`${question.text}\nAnswer: ${answerText}`);
    }
  }
  
  return lines.join("\n\n");
}

function findQuestionById(id: string, questions: Question[] = baseQuestions): Question | undefined {
  for (const q of questions) {
    if (q.id === id) return q;
    if (q.options) {
      for (const opt of q.options) {
        if (opt.followUp) {
          const found = findQuestionById(id, [opt.followUp]);
          if (found) return found;
        }
      }
    }
  }
  return undefined;
}

function getLabelForValue(question: Question, value: string): string | undefined {
  if (!question.options) return undefined;
  const option = question.options.find(o => o.value === value);
  return option?.label;
}
