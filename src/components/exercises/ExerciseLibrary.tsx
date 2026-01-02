import { useState, useMemo } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { useSettings } from '@/contexts/SettingsContext';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseFilters } from './ExerciseFilters';
import { FittFilter } from '@/types/exercise';
import { Loader2, Dumbbell, Target, Zap, Clock, Calendar, Search, X, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ExerciseLibraryProps {
  isGuest?: boolean;
}

export const ExerciseLibrary = ({ isGuest = false }: ExerciseLibraryProps) => {
  const [filters, setFilters] = useState<FittFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { exercises, loading, error } = useExercises(filters);
  const { exerciseSettings } = useSettings();

  // Filter exercises by search query AND exercise settings
  const filteredExercises = useMemo(() => {
    let result = exercises;

    // Apply difficulty filter from settings
    if (exerciseSettings.difficultyFilter.length > 0 && exerciseSettings.difficultyFilter.length < 3) {
      result = result.filter(exercise => 
        exerciseSettings.difficultyFilter.includes(exercise.difficulty_level)
      );
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(exercise => 
        exercise.name.toLowerCase().includes(query) ||
        exercise.description?.toLowerCase().includes(query) ||
        exercise.category.toLowerCase().includes(query) ||
        exercise.type.toLowerCase().includes(query) ||
        exercise.muscle_groups.some(mg => mg.toLowerCase().includes(query)) ||
        exercise.equipment.some(eq => eq.toLowerCase().includes(query))
      );
    }

    // Sort recommended exercises first if setting is enabled
    if (exerciseSettings.showRecommended) {
      // For now, mark beginner exercises as "recommended" for beginners
      result = [...result].sort((a, b) => {
        if (a.difficulty_level === 'beginner' && b.difficulty_level !== 'beginner') return -1;
        if (b.difficulty_level === 'beginner' && a.difficulty_level !== 'beginner') return 1;
        return 0;
      });
    }

    return result;
  }, [exercises, searchQuery, exerciseSettings.difficultyFilter, exerciseSettings.showRecommended]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading exercise library...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Exercises</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Exercise Library</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover 500+ exercises organized by the FITT principle (Frequency, Intensity, Time, Type) 
          with detailed instructions, equipment needs, and difficulty levels.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search exercises by name, muscle group, equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>
        
        {/* FITT Principle Explanation */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              The FITT Principle
            </CardTitle>
            <CardDescription>
              A systematic approach to designing effective workout programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold">Frequency</h3>
                <p className="text-sm text-muted-foreground">How often to exercise</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Zap className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <h3 className="font-semibold">Intensity</h3>
                <p className="text-sm text-muted-foreground">How hard to exercise</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold">Time</h3>
                <p className="text-sm text-muted-foreground">Duration of exercise</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-semibold">Type</h3>
                <p className="text-sm text-muted-foreground">Kind of exercise</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ExerciseFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        totalExercises={filteredExercises.length}
      />

      {/* Exercise Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{filteredExercises.length}</div>
            <div className="text-sm text-muted-foreground">Total Exercises</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredExercises.filter(e => e.difficulty_level === 'beginner').length}
            </div>
            <div className="text-sm text-muted-foreground">Beginner</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredExercises.filter(e => e.difficulty_level === 'intermediate').length}
            </div>
            <div className="text-sm text-muted-foreground">Intermediate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredExercises.filter(e => e.difficulty_level === 'professional').length}
            </div>
            <div className="text-sm text-muted-foreground">Professional</div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Grid */}
      {filteredExercises.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `No exercises match "${searchQuery}". Try a different search term.`
                : 'Try adjusting your filters to see more exercises.'
              }
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(isGuest ? filteredExercises.slice(0, 10) : filteredExercises).map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
};