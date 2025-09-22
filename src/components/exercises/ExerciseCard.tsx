import { Exercise } from '@/types/exercise';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Clock, 
  Zap, 
  Calendar, 
  Target, 
  ChevronDown, 
  Trophy,
  AlertTriangle,
  Lightbulb,
  Flame
} from 'lucide-react';
import { useState } from 'react';

interface ExerciseCardProps {
  exercise: Exercise;
}

export const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'professional': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'bg-blue-500';
      case 'moderate': return 'bg-orange-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl capitalize">{exercise.name}</CardTitle>
            <CardDescription className="mt-2">{exercise.description}</CardDescription>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Badge 
              className={`${getDifficultyColor(exercise.difficulty_level)} text-white`}
            >
              {exercise.difficulty_level}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {exercise.type}
            </Badge>
          </div>
        </div>

        {/* FITT Principle Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Frequency</p>
              <p className="font-semibold">{exercise.frequency_per_week}x/week</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Intensity</p>
              <Badge 
                className={`${getIntensityColor(exercise.intensity_level)} text-white text-xs`}
              >
                {exercise.intensity_level}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-semibold">{exercise.duration_minutes} min</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-semibold capitalize">{exercise.category}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Quick Info */}
        <div className="flex flex-wrap gap-4 mb-4">
          {exercise.calories_burned_per_hour && (
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm">{exercise.calories_burned_per_hour} cal/hr</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {exercise.muscle_groups.map((muscle, index) => (
              <Badge key={index} variant="secondary" className="text-xs capitalize">
                {muscle.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Equipment */}
        {exercise.equipment.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Equipment Needed:</h4>
            <div className="flex flex-wrap gap-1">
              {exercise.equipment.map((item, index) => (
                <Badge key={index} variant="outline" className="capitalize">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible Details */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span>View Exercise Details</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Steps */}
            <div>
              <h4 className="font-semibold mb-2">Steps:</h4>
              <ol className="list-decimal list-inside space-y-1">
                {exercise.steps.map((step, index) => (
                  <li key={index} className="text-sm">{step}</li>
                ))}
              </ol>
            </div>

            {/* Benefits */}
            {exercise.benefits && exercise.benefits.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Benefits:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {exercise.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-green-700">{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Precautions */}
            {exercise.precautions && exercise.precautions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Safety Precautions:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {exercise.precautions.map((precaution, index) => (
                    <li key={index} className="text-sm text-red-700">{precaution}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modifications */}
            {exercise.modifications && exercise.modifications.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  Modifications:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {exercise.modifications.map((modification, index) => (
                    <li key={index} className="text-sm text-blue-700">{modification}</li>
                  ))}
                </ul>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};