-- Create exercises table with FITT principle categorization
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- cardio, strength, flexibility, balance, sports
  category TEXT NOT NULL, -- upper_body, lower_body, full_body, core, etc.
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'professional')),
  
  -- FITT Principle fields
  frequency_per_week INTEGER NOT NULL DEFAULT 3, -- recommended frequency per week
  intensity_level TEXT NOT NULL CHECK (intensity_level IN ('low', 'moderate', 'high')), 
  duration_minutes INTEGER NOT NULL DEFAULT 30, -- recommended duration in minutes
  
  -- Exercise details
  steps TEXT[] NOT NULL DEFAULT '{}', -- array of step instructions
  equipment TEXT[] NOT NULL DEFAULT '{}', -- array of required equipment
  muscle_groups TEXT[] NOT NULL DEFAULT '{}', -- targeted muscle groups
  calories_burned_per_hour INTEGER DEFAULT 200, -- estimated calories burned per hour
  
  -- Additional metadata
  video_url TEXT, -- optional video demonstration URL
  image_url TEXT, -- optional exercise image URL
  benefits TEXT[], -- health/fitness benefits
  precautions TEXT[], -- safety precautions
  modifications TEXT[], -- easier/harder variations
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (exercises are public content)
CREATE POLICY "Exercises are publicly readable" 
ON public.exercises 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_exercises_type ON public.exercises(type);
CREATE INDEX idx_exercises_difficulty ON public.exercises(difficulty_level);
CREATE INDEX idx_exercises_intensity ON public.exercises(intensity_level);
CREATE INDEX idx_exercises_category ON public.exercises(category);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_exercises_updated_at
BEFORE UPDATE ON public.exercises
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample exercises following FITT principles
INSERT INTO public.exercises (name, description, type, category, difficulty_level, frequency_per_week, intensity_level, duration_minutes, steps, equipment, muscle_groups, calories_burned_per_hour, benefits, precautions, modifications) VALUES

-- CARDIO EXERCISES
('Running', 'Cardiovascular endurance exercise that improves heart health and burns calories', 'cardio', 'full_body', 'beginner', 3, 'moderate', 30, 
ARRAY['Warm up with 5 minutes of walking', 'Start with a comfortable jogging pace', 'Maintain steady breathing rhythm', 'Keep shoulders relaxed', 'Land on midfoot, not heel', 'Cool down with 5 minutes walking'], 
ARRAY['Running shoes', 'Comfortable clothing'], 
ARRAY['legs', 'core', 'cardiovascular'], 400, 
ARRAY['Improves cardiovascular health', 'Burns calories efficiently', 'Strengthens leg muscles', 'Boosts mental health'], 
ARRAY['Start slowly if beginner', 'Wear proper footwear', 'Stay hydrated'], 
ARRAY['Walk-run intervals for beginners', 'Increase pace for advanced', 'Add hills for intensity']),

('Jump Rope', 'High-intensity cardio exercise that improves coordination and agility', 'cardio', 'full_body', 'intermediate', 4, 'high', 20, 
ARRAY['Hold rope handles at hip level', 'Keep elbows close to body', 'Jump on the balls of your feet', 'Land softly with slight knee bend', 'Maintain steady rhythm', 'Start with 30-second intervals'], 
ARRAY['Jump rope', 'Non-slip mat (optional)'], 
ARRAY['legs', 'arms', 'core', 'cardiovascular'], 600, 
ARRAY['Excellent calorie burner', 'Improves coordination', 'Portable workout', 'Strengthens bones'], 
ARRAY['Start with shorter sessions', 'Use proper rope length', 'Avoid hard surfaces'], 
ARRAY['Step-touch motion for beginners', 'Double-unders for advanced', 'Add freestyle moves']),

-- STRENGTH EXERCISES
('Push-ups', 'Bodyweight exercise targeting chest, shoulders, and triceps', 'strength', 'upper_body', 'beginner', 3, 'moderate', 15, 
ARRAY['Start in plank position', 'Place hands slightly wider than shoulders', 'Lower body until chest nearly touches floor', 'Keep core engaged throughout', 'Push back up to starting position', 'Maintain straight line from head to heels'], 
ARRAY['Exercise mat (optional)'], 
ARRAY['chest', 'shoulders', 'triceps', 'core'], 300, 
ARRAY['Builds upper body strength', 'Improves core stability', 'No equipment needed', 'Functional movement pattern'], 
ARRAY['Keep proper form over speed', 'Modify if wrist pain occurs', 'Don\''t let hips sag'], 
ARRAY['Knee push-ups for beginners', 'Diamond push-ups for advanced', 'Incline/decline variations']),

('Squats', 'Fundamental lower body exercise targeting multiple muscle groups', 'strength', 'lower_body', 'beginner', 3, 'moderate', 20, 
ARRAY['Stand with feet shoulder-width apart', 'Keep chest up and core engaged', 'Lower hips back and down as if sitting', 'Keep knees aligned over toes', 'Descend until thighs parallel to floor', 'Drive through heels to return to start'], 
ARRAY['None required'], 
ARRAY['quadriceps', 'glutes', 'hamstrings', 'core'], 250, 
ARRAY['Strengthens entire lower body', 'Improves functional movement', 'Boosts metabolism', 'Enhances athletic performance'], 
ARRAY['Keep knees behind toes', 'Maintain neutral spine', 'Start with bodyweight only'], 
ARRAY['Wall sits for beginners', 'Goblet squats with weight', 'Jump squats for power']),

('Deadlifts', 'Compound exercise targeting posterior chain muscles', 'strength', 'full_body', 'intermediate', 2, 'high', 25, 
ARRAY['Stand with feet hip-width apart', 'Grip barbell with hands outside legs', 'Keep chest up and shoulders back', 'Hinge at hips while keeping bar close', 'Lower until bar reaches mid-shin', 'Drive hips forward to return to start'], 
ARRAY['Barbell', 'Weight plates', 'Lifting belt (optional)'], 
ARRAY['hamstrings', 'glutes', 'erector_spinae', 'traps', 'forearms'], 350, 
ARRAY['Builds total body strength', 'Improves posture', 'Increases bone density', 'Develops functional power'], 
ARRAY['Learn proper form first', 'Start with light weight', 'Keep bar close to body'], 
ARRAY['Romanian deadlifts', 'Sumo deadlifts', 'Single-leg deadlifts']),

-- FLEXIBILITY EXERCISES
('Yoga Flow', 'Dynamic sequence of yoga poses to improve flexibility and balance', 'flexibility', 'full_body', 'beginner', 5, 'low', 45, 
ARRAY['Begin in mountain pose', 'Flow through sun salutation sequence', 'Hold each pose for 5-8 breaths', 'Focus on smooth transitions', 'End in savasana for relaxation', 'Breathe deeply throughout'], 
ARRAY['Yoga mat', 'Comfortable clothing'], 
ARRAY['full_body', 'core', 'balance'], 180, 
ARRAY['Increases flexibility', 'Reduces stress', 'Improves balance', 'Enhances mind-body connection'], 
ARRAY['Don\''t force poses', 'Listen to your body', 'Modify as needed'], 
ARRAY['Chair yoga for limited mobility', 'Power yoga for intensity', 'Restorative yoga for relaxation']),

('Stretching Routine', 'Static stretching sequence for major muscle groups', 'flexibility', 'full_body', 'beginner', 6, 'low', 20, 
ARRAY['Warm up with light movement', 'Hold each stretch for 30 seconds', 'Breathe deeply and relax', 'Target all major muscle groups', 'Never bounce or force stretch', 'Cool down gradually'], 
ARRAY['Exercise mat', 'Towel (optional)'], 
ARRAY['hamstrings', 'quadriceps', 'calves', 'shoulders', 'back'], 100, 
ARRAY['Improves flexibility', 'Reduces muscle tension', 'Prevents injury', 'Aids recovery'], 
ARRAY['Never stretch cold muscles', 'Avoid painful stretches', 'Be consistent'], 
ARRAY['Dynamic stretching pre-workout', 'PNF stretching for advanced', 'Partner-assisted stretching']),

-- HIIT EXERCISES
('Burpees', 'Full-body explosive exercise combining squat, plank, and jump', 'cardio', 'full_body', 'intermediate', 3, 'high', 15, 
ARRAY['Start standing with feet shoulder-width apart', 'Drop into squat position', 'Place hands on floor and jump feet back to plank', 'Perform push-up (optional)', 'Jump feet back to squat position', 'Explode up with arms overhead'], 
ARRAY['Exercise mat (optional)'], 
ARRAY['legs', 'chest', 'shoulders', 'core', 'cardiovascular'], 500, 
ARRAY['Burns maximum calories', 'Builds explosive power', 'Improves conditioning', 'Full-body workout'], 
ARRAY['Master each component first', 'Start with modified version', 'Maintain good form'], 
ARRAY['Step back instead of jumping', 'Add weights for resistance', 'Single-leg burpees']),

('Mountain Climbers', 'Dynamic core and cardio exercise in plank position', 'cardio', 'core', 'beginner', 4, 'high', 10, 
ARRAY['Start in high plank position', 'Keep hands directly under shoulders', 'Bring right knee toward chest', 'Quickly switch legs like climbing', 'Maintain plank position throughout', 'Keep core engaged and hips level'], 
ARRAY['Exercise mat (optional)'], 
ARRAY['core', 'shoulders', 'legs', 'cardiovascular'], 450, 
ARRAY['Strengthens core', 'Improves agility', 'Burns calories fast', 'Enhances coordination'], 
ARRAY['Keep hips level', 'Don\''t let form break down', 'Start at slower pace'], 
ARRAY['Slow mountain climbers', 'Cross-body mountain climbers', 'Resistance band variation']),

-- BALANCE/FUNCTIONAL
('Plank', 'Isometric core strengthening exercise', 'strength', 'core', 'beginner', 5, 'moderate', 10, 
ARRAY['Start in push-up position', 'Lower to forearms with elbows under shoulders', 'Keep body in straight line', 'Engage core and glutes', 'Breathe normally', 'Hold position for specified time'], 
ARRAY['Exercise mat'], 
ARRAY['core', 'shoulders', 'glutes'], 200, 
ARRAY['Builds core strength', 'Improves posture', 'Reduces back pain', 'Enhances stability'], 
ARRAY['Don\''t let hips sag or pike up', 'Keep neck neutral', 'Build time gradually'], 
ARRAY['Knee plank for beginners', 'Side planks', 'Plank with leg lifts']),

('Single-Leg Stand', 'Balance exercise to improve stability and proprioception', 'balance', 'lower_body', 'beginner', 6, 'low', 15, 
ARRAY['Stand on one foot with slight knee bend', 'Keep other foot lifted off ground', 'Maintain upright posture', 'Focus on fixed point ahead', 'Engage core for stability', 'Switch legs after time interval'], 
ARRAY['None required'], 
ARRAY['ankles', 'calves', 'core', 'proprioception'], 120, 
ARRAY['Improves balance', 'Strengthens ankles', 'Prevents falls', 'Enhances athletic performance'], 
ARRAY['Use wall support if needed', 'Start with shorter holds', 'Progress gradually'], 
ARRAY['Eyes closed for challenge', 'Unstable surface', 'Add arm movements']);

-- Create a view for easy querying with FITT categorization
CREATE VIEW public.exercises_by_fitt AS
SELECT 
  id,
  name,
  type,
  difficulty_level,
  frequency_per_week as frequency,
  intensity_level as intensity,
  duration_minutes as time,
  type as fitt_type,
  equipment,
  muscle_groups,
  calories_burned_per_hour,
  steps
FROM public.exercises
ORDER BY type, difficulty_level, intensity_level;