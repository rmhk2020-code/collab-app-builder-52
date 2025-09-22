export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  type: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'professional';
  frequency_per_week: number;
  intensity_level: 'low' | 'moderate' | 'high';
  duration_minutes: number;
  steps: string[];
  equipment: string[];
  muscle_groups: string[];
  calories_burned_per_hour: number | null;
  video_url: string | null;
  image_url: string | null;
  benefits: string[] | null;
  precautions: string[] | null;
  modifications: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface FittFilter {
  frequency?: number;
  intensity?: 'low' | 'moderate' | 'high';
  time?: number;
  type?: string;
  difficulty?: 'beginner' | 'intermediate' | 'professional';
}