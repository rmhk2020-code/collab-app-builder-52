import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ChefHat, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import demoFoodVideo from "@/assets/demo-food-prep.mp4";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

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
  const [script, setScript] = useState<VideoScript | null>(null);

  const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis();

  const narrationText = useMemo(() => {
    const macro = `Nutrition per serving: ${calories} calories, ${protein} grams protein, ${carbs} grams carbs, ${fats} grams fat.`;
    const steps = script?.scenes?.length
      ? `Steps: ${script.scenes.map((s) => s.description).join(". ")}.`
      : `Tip: Prepare ${foodName} with minimal added sugar, and use healthy fats like olive oil.`;
    return `${foodName}. ${macro} ${steps}`.replace(/\s+/g, " ").trim();
  }, [foodName, calories, protein, carbs, fats, script]);

  const fetchInstructions = async () => {
    setIsLoading(true);
    try {
      const prompt = `${foodName}: A healthy food with ${calories} calories, ${protein}g protein, ${carbs}g carbs, ${fats}g fat. Provide a simple, healthy preparation method with cooking sounds and chef instructions.`;

      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: {
          prompt,
          type: "food",
          duration: 30,
        },
      });

      if (error) throw error;

      setScript(data?.videoScript ?? null);
    } catch (e) {
      console.error("Failed to load food instructions:", e);
      toast.error("Couldn't load prep instructions. Video will still play.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!script) fetchInstructions();
  };

  const handleClose = () => {
    setIsOpen(false);
    stop();
  };

  useEffect(() => {
    if (!isOpen) stop();
  }, [isOpen, stop]);

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
              <video
                src={demoFoodVideo}
                className="w-full h-auto"
                controls
                playsInline
                preload="metadata"
              />
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

              {isSupported && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => (isSpeaking ? stop() : speak(narrationText))}
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {isSpeaking ? "Stop voice" : "Play voice"}
                </Button>
              )}
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

            {script?.scenes?.length ? (
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
