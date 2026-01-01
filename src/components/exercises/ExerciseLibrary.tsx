import { useState } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseFilters } from './ExerciseFilters';
import { FittFilter } from '@/types/exercise';
import { Loader2, Dumbbell, Target, Zap, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExerciseLibraryProps {
  isGuest?: boolean;
}

export const ExerciseLibrary = ({ isGuest = false }: ExerciseLibraryProps) => {
  const [filters, setFilters] = useState<FittFilter>({});
  const { exercises, loading, error } = useExercises(filters);

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
        totalExercises={exercises.length}
      />

      {/* Exercise Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{exercises.length}</div>
            <div className="text-sm text-muted-foreground">Total Exercises</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {exercises.filter(e => e.difficulty_level === 'beginner').length}
            </div>
            <div className="text-sm text-muted-foreground">Beginner</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {exercises.filter(e => e.difficulty_level === 'intermediate').length}
            </div>
            <div className="text-sm text-muted-foreground">Intermediate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {exercises.filter(e => e.difficulty_level === 'professional').length}
            </div>
            <div className="text-sm text-muted-foreground">Professional</div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Grid */}
      {exercises.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to see more exercises.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(isGuest ? exercises.slice(0, 10) : exercises).map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
};