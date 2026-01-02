import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ChefHat, Volume2, VolumeX } from "lucide-react";
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
}

interface VideoData {
  title: string;
  visualElements: string[];
  steps: string[];
  duration: number;
  searchQuery: string;
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
  fats,
}: FoodVideoPlayerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const narrationText = useMemo(() => {
    const macro = `Nutrition per serving: ${calories} calories, ${protein} grams protein, ${carbs} grams carbs, ${fats} grams fat.`;
    const steps = videoData?.steps?.length
      ? `Preparation steps: ${videoData.steps.join(". ")}.`
      : script?.scenes?.length
      ? `Steps: ${script.scenes.map((s) => s.description).join(". ")}.`
      : `Tip: Prepare ${foodName} with minimal added sugar, and use healthy fats like olive oil.`;
    return `${foodName}. ${macro} ${steps}`.replace(/\s+/g, " ").trim();
  }, [foodName, calories, protein, carbs, fats, script, videoData]);

  const fetchInstructions = async () => {
    setIsLoading(true);
    try {
      const [scriptResult, videoResult] = await Promise.all([
        supabase.functions.invoke("generate-video", {
          body: {
            prompt: `${foodName}: A healthy food with ${calories} calories, ${protein}g protein, ${carbs}g carbs, ${fats}g fat. Provide a simple, healthy preparation method with cooking sounds and chef instructions.`,
            type: "food",
            duration: 30,
          },
        }),
        supabase.functions.invoke("generate-item-video", {
          body: {
            itemName: foodName,
            itemType: "food",
            description: `${calories} calories, ${protein}g protein, ${carbs}g carbs, ${fats}g fat`,
          },
        }),
      ]);

      if (!scriptResult.error) {
        setScript(scriptResult.data?.videoScript ?? null);
      }
      if (!videoResult.error) {
        setVideoData(videoResult.data ?? null);
      }
    } catch (e) {
      console.error("Failed to load food instructions:", e);
      toast.error("Couldn't load prep instructions.");
    } finally {
      setIsLoading(false);
    }
  };

  const playVoice = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }

    setIsAudioLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: narrationText,
            voiceId: "EXAVITQu4vr4xnSDxMaL" // Sarah - friendly female voice for cooking
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
        toast.error("Failed to play audio");
      };

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to play voice:", error);
      toast.error("Couldn't play voice narration. Using fallback.");
      
      // Fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(narrationText);
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } finally {
      setIsAudioLoading(false);
    }
  };

  const stopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!script && !videoData) fetchInstructions();
  };

  const handleClose = () => {
    setIsOpen(false);
    stopVoice();
  };

  useEffect(() => {
    if (!isOpen) stopVoice();
  }, [isOpen]);

  // Generate visual content based on food
  const videoContent = useMemo(() => {
    if (videoData) {
      return (
        <div className="relative aspect-video bg-gradient-to-br from-orange-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
          <div className="text-center p-6 space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <ChefHat className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{videoData.title || foodName}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              AI-generated preparation guide for {foodName}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {videoData.visualElements?.slice(0, 3).map((element, idx) => (
                <span key={idx} className="px-2 py-1 bg-orange-500/10 rounded text-xs text-orange-600 dark:text-orange-400">
                  {element}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="relative aspect-video bg-gradient-to-br from-orange-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <ChefHat className="h-16 w-16 mx-auto text-primary/50 mb-4" />
          <p className="text-muted-foreground">Loading preparation guide...</p>
        </div>
      </div>
    );
  }, [videoData, foodName]);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleOpen} className="gap-1 h-7 px-2 text-xs">
        <ChefHat className="h-3 w-3" />
        Prep Video
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              {foodName} — Prep Video
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-muted">
              {videoContent}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading instructions…
                  </span>
                ) : (
                  <span>Instructions</span>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={isPlaying ? stopVoice : playVoice}
                disabled={isAudioLoading}
              >
                {isAudioLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPlaying ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                {isAudioLoading ? "Loading..." : isPlaying ? "Stop voice" : "Play voice"}
              </Button>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h4 className="font-semibold text-foreground mb-2">Nutrition</h4>
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">{calories}</span>
                  <span className="block">cal</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">{protein}g</span>
                  <span className="block">protein</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">{carbs}g</span>
                  <span className="block">carbs</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">{fats}g</span>
                  <span className="block">fats</span>
                </div>
              </div>
            </div>

            {videoData?.steps?.length ? (
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-semibold text-foreground mb-2">Prep steps</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  {videoData.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            ) : script?.scenes?.length ? (
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-semibold text-foreground mb-2">Prep steps</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  {script.scenes.map((scene, idx) => (
                    <li key={idx}>{scene.description}</li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
