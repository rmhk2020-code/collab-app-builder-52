import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Video, Volume2, VolumeX } from "lucide-react";
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
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      // Fetch both old script and new video data in parallel
      const [scriptResult, videoResult] = await Promise.all([
        supabase.functions.invoke("generate-video", {
          body: {
            prompt: `${exerciseName}: ${exerciseDescription}. Steps: ${steps.join(". ")}`,
            type: "exercise",
            duration: 30,
          },
        }),
        supabase.functions.invoke("generate-item-video", {
          body: {
            itemName: exerciseName,
            itemType: "exercise",
            description: exerciseDescription,
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
      console.error("Failed to load exercise instructions:", e);
      toast.error("Couldn't load exercise instructions.");
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
            voiceId: "JBFqnCBsd6RMkjVDRZzb" // George - friendly male voice
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

  // Generate placeholder video based on exercise
  const videoContent = useMemo(() => {
    if (videoData) {
      return (
        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
          <div className="text-center p-6 space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <Video className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{videoData.title || exerciseName}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              AI-generated demonstration for {exerciseName}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {videoData.visualElements?.slice(0, 3).map((element, idx) => (
                <span key={idx} className="px-2 py-1 bg-primary/10 rounded text-xs text-primary">
                  {element}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <Video className="h-16 w-16 mx-auto text-primary/50 mb-4" />
          <p className="text-muted-foreground">Loading exercise demonstration...</p>
        </div>
      </div>
    );
  }, [videoData, exerciseName]);

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
              {videoContent}
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

              {videoData?.steps?.length ? (
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2">Video Breakdown</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    {videoData.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : script?.scenes?.length ? (
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
