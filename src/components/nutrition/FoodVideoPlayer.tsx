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

  const steps = useMemo(() => {
    if (videoData?.steps?.length) return videoData.steps;
    if (script?.scenes?.length) return script.scenes.map((s) => s.description);
    if (isLoading) return [];
    return [
      `Gather fresh ingredients for ${foodName}.`,
      "Wash, trim and portion everything on a clean board.",
      "Cook with a little olive oil over medium heat — avoid deep frying.",
      "Season lightly with herbs, lemon or spices instead of extra salt or sugar.",
      `Plate your ${foodName} and enjoy a balanced portion.`,
    ];
  }, [videoData, script, isLoading, foodName]);

  const [step, setStep] = useState(0);
  useEffect(() => { setStep(0); }, [steps]);
  useEffect(() => {
    if (!isOpen || steps.length === 0) return;
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 4500);
    return () => clearInterval(id);
  }, [isOpen, steps]);

  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`how to make healthy ${foodName} recipe`)}`;

  const videoContent = steps.length === 0 ? (
    <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent rounded-lg flex items-center justify-center">
      <div className="text-center p-6">
        <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Preparing your cooking video...</p>
      </div>
    </div>
  ) : (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-primary/25 via-accent to-secondary">
      <div key={step} className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-700">
        <ChefHat className="h-14 w-14 text-primary mb-3 animate-bounce" />
        <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          Step {step + 1} of {steps.length}
        </div>
        <p className="text-lg md:text-xl font-semibold text-foreground max-w-lg">{steps[step]}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-3">
        {steps.map((_, i) => (
          <button key={i} onClick={() => setStep(i)} aria-label={`Step ${i + 1}`} className="h-1.5 flex-1 rounded-full bg-foreground/20 overflow-hidden">
            <div className={`h-full bg-primary transition-all ${i < step ? "w-full" : i === step ? "w-full duration-[4500ms]" : "w-0"}`} />
          </button>
        ))}
      </div>
    </div>
  );

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
                  <a href={youtubeUrl} target="_blank" rel="noreferrer" className="text-primary underline">Watch real cooking videos on YouTube</a>
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
