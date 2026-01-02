import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Video, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import demoExerciseVideo from "@/assets/demo-exercise.mp4";
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

interface ExerciseVideoPlayerProps {
  exerciseName: string;
  exerciseDescription: string;
  steps: string[];
}

export const ExerciseVideoPlayer = ({
  exerciseName,
  exerciseDescription,
  steps,
}: ExerciseVideoPlayerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);

  const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis();

  const narrationText = useMemo(() => {
    const stepText = steps.length ? `Steps: ${steps.map((s, i) => `${i + 1}. ${s}`).join(". ")}.` : "";
    const cueText = script?.scenes?.length
      ? `Coach cues: ${script.scenes
          .flatMap((s) => s.keyPoints || [])
          .slice(0, 8)
          .join(", ")}.`
      : "";

    return `${exerciseName}. ${exerciseDescription || ""} ${stepText} ${cueText}`.replace(/\s+/g, " ").trim();
  }, [exerciseName, exerciseDescription, steps, script]);

  const fetchInstructions = async () => {
    setIsLoading(true);
    try {
      const prompt = `${exerciseName}: ${exerciseDescription}. Steps: ${steps.join(". ")}`;

      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: {
          prompt,
          type: "exercise",
          duration: 30,
        },
      });

      if (error) throw error;

      setScript(data?.videoScript ?? null);
    } catch (e) {
      console.error("Failed to load exercise instructions:", e);
      toast.error("Couldn't load exercise instructions. Video will still play.");
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
      <Button variant="outline" size="sm" onClick={handleOpen} className="gap-2">
        <Video className="h-4 w-4" />
        Watch Demo
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              {exerciseName} — Demo Video
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-muted">
              <video
                src={demoExerciseVideo}
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
                  <span>Instructions & cues</span>
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

            <div className="space-y-3">
              {steps.length > 0 && (
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2">Steps</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
                    {steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}

              {script?.scenes?.length ? (
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2">Coach cues</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {script.scenes.slice(0, 6).map((scene, idx) => (
                      <li key={idx}>
                        <span className="font-medium text-foreground">{scene.timestamp}:</span> {scene.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
