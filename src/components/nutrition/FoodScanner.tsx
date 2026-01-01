import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, X, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface FoodAnalysis {
  foodName: string;
  isHealthy: boolean;
  healthScore: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  vitamins: string[];
  minerals: string[];
  athleticFit: boolean;
  athleticFitReason: string;
  recommendations: string;
}

export const FoodScanner = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error("Camera access denied:", error);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
        stopCamera();
        analyzeFood(imageData);
      }
    }
  };

  const analyzeFood = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-food`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            imageBase64,
            athleticGoal: "general fitness and muscle building"
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to analyze food");
      }

      const result = await response.json();
      setAnalysis(result);
      toast.success("Food analyzed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze food");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setAnalysis(null);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Camera Overlay */}
      {isCapturing && (
        <div className="fixed inset-0 bg-background/95 z-50 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="max-w-full max-h-[60vh] rounded-lg border border-border"
            />
          </div>
          <div className="p-6 flex justify-center gap-4">
            <Button variant="outline" size="lg" onClick={stopCamera}>
              <X className="h-5 w-5 mr-2" />
              Cancel
            </Button>
            <Button size="lg" onClick={captureImage}>
              <Camera className="h-5 w-5 mr-2" />
              Capture
            </Button>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {(capturedImage || analysis) && !isCapturing && (
        <div className="fixed inset-0 bg-background/95 z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Food Analysis</h2>
              <Button variant="ghost" size="icon" onClick={reset}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured food"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            {isAnalyzing ? (
              <Card className="border-border bg-card">
                <CardContent className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Analyzing your food...</p>
                </CardContent>
              </Card>
            ) : analysis ? (
              <div className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{analysis.foodName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={analysis.isHealthy ? "default" : "destructive"}>
                          {analysis.isHealthy ? "Healthy" : "Less Healthy"}
                        </Badge>
                        <Badge variant="outline">
                          Score: {analysis.healthScore}/10
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{analysis.calories}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{analysis.protein}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{analysis.carbs}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{analysis.fats}g</p>
                        <p className="text-xs text-muted-foreground">Fats</p>
                      </div>
                    </div>

                    {analysis.fiber > 0 && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Fiber: {analysis.fiber}g
                      </p>
                    )}

                    {analysis.vitamins?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-foreground mb-1">Vitamins:</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.vitamins.map((v) => (
                            <Badge key={v} variant="outline" className="text-xs">{v}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.minerals?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-foreground mb-1">Minerals:</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.minerals.map((m) => (
                            <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {analysis.athleticFit ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <CardTitle className="text-lg">Athletic Fit</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">{analysis.athleticFitReason}</p>
                    <p className="text-sm font-medium text-foreground">{analysis.recommendations}</p>
                  </CardContent>
                </Card>

                <Button className="w-full" onClick={reset}>
                  Scan Another Food
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Scan Button */}
      {!isCapturing && !capturedImage && (
        <div className="bg-background border-t border-border p-4">
          <Button
            className="w-full h-14 text-lg"
            size="lg"
            onClick={startCamera}
          >
            <Camera className="h-6 w-6 mr-3" />
            Scan Food with Camera
          </Button>
        </div>
      )}
    </div>
  );
};
