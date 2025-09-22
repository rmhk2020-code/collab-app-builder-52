-- Drop and recreate the view without security definer issues
DROP VIEW IF EXISTS public.exercises_by_fitt;

-- Create a simple view without security definer properties
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