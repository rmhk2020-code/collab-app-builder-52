import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, FittFilter } from '@/types/exercise';

export const useExercises = (filters?: FittFilter) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('exercises')
          .select('*');

        // Apply filters
        if (filters?.type) {
          query = query.eq('type', filters.type);
        }
        if (filters?.difficulty) {
          query = query.eq('difficulty_level', filters.difficulty);
        }
        if (filters?.intensity) {
          query = query.eq('intensity_level', filters.intensity);
        }
        if (filters?.frequency) {
          query = query.eq('frequency_per_week', filters.frequency);
        }
        if (filters?.time) {
          query = query.eq('duration_minutes', filters.time);
        }

        const { data, error } = await query.order('type').order('difficulty_level');

        if (error) throw error;
        setExercises((data as Exercise[]) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch exercises');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [filters]);

  return { exercises, loading, error };
};