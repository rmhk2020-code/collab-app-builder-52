import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Loader2, Video, Clock, Info, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoScene {
  timestamp: string;
  description: string;
  keyPoints: string[];
}

interface VideoScript {
  title: string;
  description: string;
  duration_seconds: number;
  scenes: VideoScene[];
  thumbnailDescription: string;
}

interface FoodVideoPlayerProps {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export const FoodVideoPlayer = ({ 
  foodName, 
  calories,
  protein,
  carbs,
  fats
}: FoodVideoPlayerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<{
    videoScript: VideoScript;
    thumbnailUrl: string | null;
  } | null>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateVideo = async () => {
    setIsLoading(true);
    try {
      const prompt = `${foodName}: A healthy food with ${calories} calories, ${protein}g protein, ${carbs}g carbs, ${fats}g fat. Show the recommended healthy preparation method.`;
      
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { 
          prompt,
          type: "food",
          duration: 30
        },
      });

      if (error) throw error;

      setVideoData(data);
      setCurrentScene(0);
      toast.success("Preparation video generated!");
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!videoData) {
      generateVideo();
    }
  };

  const nextScene = () => {
    if (videoData && currentScene < videoData.videoScript.scenes.length - 1) {
      setCurrentScene(currentScene + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const prevScene = () => {
    if (currentScene > 0) {
      setCurrentScene(currentScene - 1);
    }
  };

  // Auto-advance scenes when playing
  const handlePlayPause = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setCurrentScene(prev => {
          if (videoData && prev < videoData.videoScript.scenes.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            clearInterval(interval);
            return prev;
          }
        });
      }, 4000); // 4 seconds per scene
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleOpen}
        className="gap-1 h-7 px-2 text-xs"
      >
        <ChefHat className="h-3 w-3" />
        Prep Video
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              {foodName} - Preparation Guide
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Generating preparation video...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
            </div>
          ) : videoData ? (
            <div className="space-y-4">
              {/* Thumbnail with Play Button */}
              {videoData.thumbnailUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted group cursor-pointer" onClick={handlePlayPause}>
                  <img 
                    src={videoData.thumbnailUrl} 
                    alt={videoData.videoScript.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Play/Pause Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <div className={`w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 ${isPlaying ? 'animate-pulse' : ''}`}>
                      {isPlaying ? (
                        <div className="flex gap-1">
                          <div className="w-1.5 h-6 bg-primary-foreground rounded" />
                          <div className="w-1.5 h-6 bg-primary-foreground rounded" />
                        </div>
                      ) : (
                        <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {videoData.videoScript.duration_seconds}s
                  </div>
                </div>
              )}

              {/* Video Script / Scene Navigator */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">
                    Step {currentScene + 1} of {videoData.videoScript.scenes.length}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {videoData.videoScript.scenes[currentScene]?.timestamp}
                  </span>
                </div>
                
                <p className="text-foreground mb-3">
                  {videoData.videoScript.scenes[currentScene]?.description}
                </p>

                {videoData.videoScript.scenes[currentScene]?.keyPoints?.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" /> Key Points:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {videoData.videoScript.scenes[currentScene].keyPoints.map((point, i) => (
                        <li key={i} className="text-muted-foreground">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Scene Navigation */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={prevScene}
                    disabled={currentScene === 0}
                  >
                    Previous
                  </Button>
                  
                  {/* Progress dots */}
                  <div className="flex gap-1">
                    {videoData.videoScript.scenes.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentScene(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === currentScene ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={nextScene}
                    disabled={currentScene === videoData.videoScript.scenes.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>

              {/* Regenerate */}
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={generateVideo}
                disabled={isLoading}
              >
                <Video className="h-4 w-4 mr-2" />
                Regenerate Preparation Guide
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No video generated yet</p>
              <Button onClick={generateVideo} className="mt-4">
                Generate Preparation Guide
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
