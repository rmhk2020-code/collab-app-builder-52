import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, Loader2, Video, Clock, Info, ChefHat, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoScene {
  timestamp: string;
  description: string;
  audio?: string;
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
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const generateVideo = async () => {
    setIsLoading(true);
    try {
      const prompt = `${foodName}: A healthy food with ${calories} calories, ${protein}g protein, ${carbs}g carbs, ${fats}g fat. Show the recommended healthy preparation method with cooking sounds and chef instructions.`;
      
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
      setProgress(0);
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

  const handleClose = () => {
    setIsOpen(false);
    stopPlayback();
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      setIsPlaying(true);
      const sceneDuration = 5000; // 5 seconds per scene
      const progressStep = 100 / (sceneDuration / 100);

      // Progress bar animation
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 0;
          return prev + progressStep;
        });
      }, 100);

      // Scene advancement
      intervalRef.current = setInterval(() => {
        setCurrentScene(prev => {
          if (videoData && prev < videoData.videoScript.scenes.length - 1) {
            setProgress(0);
            return prev + 1;
          } else {
            stopPlayback();
            setProgress(0);
            return prev;
          }
        });
      }, sceneDuration);
    }
  };

  const goToScene = (index: number) => {
    stopPlayback();
    setCurrentScene(index);
    setProgress(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const currentSceneData = videoData?.videoScript.scenes[currentScene];

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

      <Dialog open={isOpen} onOpenChange={handleClose}>
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
              {/* Video Player Area */}
              <div 
                className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 group cursor-pointer"
                onClick={handlePlayPause}
              >
                {videoData.thumbnailUrl && (
                  <img 
                    src={videoData.thumbnailUrl} 
                    alt={videoData.videoScript.title}
                    className={`w-full h-full object-cover transition-all duration-300 ${isPlaying ? 'scale-105' : ''}`}
                  />
                )}
                
                {/* Scene description overlay when playing */}
                {isPlaying && currentSceneData && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <p className="text-white text-lg font-medium animate-fade-in">
                      {currentSceneData.description}
                    </p>
                    {currentSceneData.audio && (
                      <p className="text-white/70 text-sm flex items-center gap-1 mt-1 animate-fade-in">
                        <Volume2 className="h-3 w-3" />
                        {currentSceneData.audio}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Play/Pause Button Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100 bg-black/40'}`}>
                  <div className={`w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 ${isPlaying ? 'animate-pulse' : ''}`}>
                    {isPlaying ? (
                      <Pause className="h-8 w-8 text-primary-foreground" fill="currentColor" />
                    ) : (
                      <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {isPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div 
                      className="h-full bg-primary transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {videoData.videoScript.duration_seconds}s
                </div>
              </div>

              {/* Scene Navigation Dots */}
              <div className="flex justify-center gap-2">
                {videoData.videoScript.scenes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToScene(i)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i === currentScene 
                        ? 'bg-primary scale-125' 
                        : i < currentScene 
                          ? 'bg-primary/50' 
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              {/* Scene Details Card */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">
                    Step {currentScene + 1} of {videoData.videoScript.scenes.length}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {currentSceneData?.timestamp}
                  </span>
                </div>
                
                <p className="text-foreground mb-3">
                  {currentSceneData?.description}
                </p>

                {currentSceneData?.audio && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 bg-background/50 p-2 rounded">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <span className="italic">{currentSceneData.audio}</span>
                  </div>
                )}

                {currentSceneData?.keyPoints && currentSceneData.keyPoints.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" /> Key Points:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {currentSceneData.keyPoints.map((point, i) => (
                        <li key={i} className="text-muted-foreground">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Scene Navigation Buttons */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => goToScene(Math.max(0, currentScene - 1))}
                    disabled={currentScene === 0}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handlePlayPause}
                    className="gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Play
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => goToScene(Math.min(videoData.videoScript.scenes.length - 1, currentScene + 1))}
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
