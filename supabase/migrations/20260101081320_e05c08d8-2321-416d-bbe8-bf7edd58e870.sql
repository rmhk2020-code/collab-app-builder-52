-- Create user_profiles table to store all user data
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Fitness Plan Data
  fitness_plan JSONB,
  onboarding_answers JSONB,
  
  -- Exercise Goals & Progress
  exercises_completed_today INTEGER NOT NULL DEFAULT 0,
  exercises_completed_this_week INTEGER NOT NULL DEFAULT 0,
  exercises_completed_this_month INTEGER NOT NULL DEFAULT 0,
  weekly_exercise_goal INTEGER NOT NULL DEFAULT 5,
  monthly_exercise_goal INTEGER NOT NULL DEFAULT 20,
  
  -- Nutrition Goals & Progress
  calories_eaten INTEGER NOT NULL DEFAULT 0,
  daily_calorie_goal INTEGER NOT NULL DEFAULT 2000,
  
  -- Health Vitals
  health_vitals JSONB DEFAULT '{}',
  
  -- Food & Exercise Logs
  food_logs JSONB DEFAULT '[]',
  exercise_logs JSONB DEFAULT '[]',
  
  -- User Profile Settings
  user_settings JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.user_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();