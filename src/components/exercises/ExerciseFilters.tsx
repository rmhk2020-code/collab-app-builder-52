import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FittFilter } from '@/types/exercise';
import { Filter, RotateCcw } from 'lucide-react';

interface ExerciseFiltersProps {
  filters: FittFilter;
  onFiltersChange: (filters: FittFilter) => void;
  totalExercises: number;
}

export const ExerciseFilters = ({ filters, onFiltersChange, totalExercises }: ExerciseFiltersProps) => {
  const clearFilters = () => {
    onFiltersChange({});
  };

  const updateFilter = (key: keyof FittFilter, value: string | undefined) => {
    const newFilters = { ...filters };
    if (value === 'all' || !value) {
      delete newFilters[key];
    } else {
      if (key === 'frequency' || key === 'time') {
        (newFilters as any)[key] = parseInt(value);
      } else {
        (newFilters as any)[key] = value;
      }
    }
    onFiltersChange(newFilters);
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>FITT Principle Filters</CardTitle>
          </div>
          {activeFilterCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
        <CardDescription>
          Filter exercises by Frequency, Intensity, Time, and Type principles
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Frequency */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Frequency (per week)</label>
            <Select 
              value={filters.frequency?.toString() || 'all'} 
              onValueChange={(value) => updateFilter('frequency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All frequencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All frequencies</SelectItem>
                <SelectItem value="2">2x per week</SelectItem>
                <SelectItem value="3">3x per week</SelectItem>
                <SelectItem value="4">4x per week</SelectItem>
                <SelectItem value="5">5x per week</SelectItem>
                <SelectItem value="6">6x per week</SelectItem>
                <SelectItem value="7">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Intensity</label>
            <Select 
              value={filters.intensity || 'all'} 
              onValueChange={(value) => updateFilter('intensity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All intensities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All intensities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (minutes)</label>
            <Select 
              value={filters.time?.toString() || 'all'} 
              onValueChange={(value) => updateFilter('time', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All durations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All durations</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="25">25 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select 
              value={filters.type || 'all'} 
              onValueChange={(value) => updateFilter('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="balance">Balance</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select 
              value={filters.difficulty || 'all'} 
              onValueChange={(value) => updateFilter('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
        </div>
      </CardContent>
    </Card>
  );
};