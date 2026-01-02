import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, X, Check, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/TranslationContext";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import { useSettings } from "@/contexts/SettingsContext";

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
  fitsUserDiet?: boolean;
  dietCompatibilityReason?: string;
}

export const FoodScanner = () => {
  const { t } = useTranslation();
  const { fitnessPlan, addFoodLog } = useFitnessPlan();
  const { dietSettings } = useSettings();
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraReady(false);
      setIsCapturing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Use multiple event listeners for better compatibility
        const handleVideoReady = () => {
          setCameraReady(true);
        };
        
        videoRef.current.onloadeddata = handleVideoReady;
        videoRef.current.oncanplay = handleVideoReady;
        
        // Also set a timeout fallback in case events don't fire
        setTimeout(() => {
          if (streamRef.current && !cameraReady) {
            setCameraReady(true);
          }
        }, 2000);
        
        try {
          await videoRef.current.play();
          setCameraReady(true);
        } catch (err) {
          console.error("Video play error:", err);
          // Still allow capture attempt after a delay
          setTimeout(() => setCameraReady(true), 1000);
        }
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      toast.error(t("unableToAccessCamera"));
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setCameraReady(false);
  };

  const captureImage = () => {
    if (!videoRef.current) {
      toast.error("Camera not ready");
      return;
    }
    
    const video = videoRef.current;
    
    // Ensure video has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error("Camera not ready. Please wait a moment.");
      return;
    }
    
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageData);
      stopCamera();
      analyzeFood(imageData);
    } else {
      toast.error("Failed to capture image");
    }
  };

  const analyzeFood = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      // Build athletic goal from fitness plan and diet settings
      const athleticGoal = fitnessPlan?.goal || "general fitness";
      const dietaryRestrictions = dietSettings.dietaryPreferences.join(", ") || "none";
      const allergies = dietSettings.allergies.join(", ") || "none";
      
      const supabaseUrl = "https://kkvudqvxcjchzehrptvy.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdnVkcXZ4Y2pjaHplaHJwdHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNDIzMDYsImV4cCI6MjA3MzkxODMwNn0.28c5wYiUB9Wm1zj3PVN4SlXFO9egiNNrQoiV-KVKJCM";
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/analyze-food`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            imageBase64,
            athleticGoal: `${athleticGoal}. Dietary preferences: ${dietaryRestrictions}. Allergies: ${allergies}. Daily calorie target: ${dietSettings.dailyCalorieTarget}kcal, protein target: ${dietSettings.proteinTarget}g, carbs target: ${dietSettings.carbsTarget}g, fats target: ${dietSettings.fatsTarget}g.`
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("failedToAnalyze"));
      }

      const result = await response.json();
      
      // Determine if food fits user's diet based on analysis
      const fitsUserDiet = checkDietCompatibility(result);
      
      setAnalysis({
        ...result,
        fitsUserDiet,
        dietCompatibilityReason: fitsUserDiet 
          ? t("fitsYourGoals")
          : t("doesNotFitGoals")
      });
      toast.success(t("foodAnalyzedSuccess"));
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : t("failedToAnalyze"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkDietCompatibility = (result: FoodAnalysis): boolean => {
    // Check if food aligns with diet settings
    if (!result) return false;
    
    // Check against allergies (basic check - AI should handle this but we double-check)
    const hasAllergen = dietSettings.allergies.some(allergy => 
      result.foodName.toLowerCase().includes(allergy.toLowerCase())
    );
    if (hasAllergen) return false;
    
    // Check health score
    if (result.healthScore < 5 && !result.athleticFit) return false;
    
    return result.athleticFit || result.healthScore >= 6;
  };

  const handleAddToLog = () => {
    if (analysis) {
      addFoodLog({
        name: analysis.foodName,
        calories: analysis.calories,
      });
      toast.success(`${analysis.foodName} added to your food log!`);
      reset();
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setAnalysis(null);
  };

  const scanAnother = () => {
    setCapturedImage(null);
    setAnalysis(null);
    startCamera();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Camera Overlay */}
      {isCapturing && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`max-w-full max-h-[60vh] rounded-lg border border-border bg-muted ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
              style={{ minHeight: '300px', minWidth: '300px' }}
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg mx-4">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">{t("loading")}</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-6 flex justify-center gap-4 bg-background border-t border-border">
            <Button variant="outline" size="lg" onClick={stopCamera} className="min-h-[48px]">
              <X className="h-5 w-5 mr-2" />
              {t("cancel")}
            </Button>
            <Button 
              size="lg" 
              onClick={captureImage} 
              disabled={!cameraReady}
              className="min-h-[48px]"
            >
              <Camera className="h-5 w-5 mr-2" />
              {t("capture")}
            </Button>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {(capturedImage || analysis) && !isCapturing && (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">{t("foodAnalysis")}</h2>
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
                  <p className="text-muted-foreground">{t("analyzing")}</p>
                </CardContent>
              </Card>
            ) : analysis ? (
              <div className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-xl">{analysis.foodName}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={analysis.isHealthy ? "default" : "destructive"}>
                          {analysis.isHealthy ? t("healthy") : t("lessHealthy")}
                        </Badge>
                        <Badge variant="outline">
                          {t("score")}: {analysis.healthScore}/10
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4">
                      <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{analysis.calories}</p>
                        <p className="text-xs text-muted-foreground">{t("calories")}</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{analysis.protein}g</p>
                        <p className="text-xs text-muted-foreground">{t("protein")}</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{analysis.carbs}g</p>
                        <p className="text-xs text-muted-foreground">{t("carbs")}</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{analysis.fats}g</p>
                        <p className="text-xs text-muted-foreground">{t("fats")}</p>
                      </div>
                    </div>

                    {analysis.fiber > 0 && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {t("fiber")}: {analysis.fiber}g
                      </p>
                    )}

                    {analysis.vitamins?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-foreground mb-1">{t("vitamins")}:</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.vitamins.map((v) => (
                            <Badge key={v} variant="outline" className="text-xs">{v}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.minerals?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-foreground mb-1">{t("minerals")}:</p>
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
                      <CardTitle className="text-lg">{t("athleticFit")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">{analysis.athleticFitReason}</p>
                    <p className="text-sm font-medium text-foreground">{analysis.recommendations}</p>
                  </CardContent>
                </Card>

                {/* Diet Compatibility Card */}
                <Card className={`border-2 ${analysis.fitsUserDiet ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {analysis.fitsUserDiet ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <CardTitle className="text-lg">
                        {analysis.fitsUserDiet ? t("fitsYourGoals") : t("doesNotFitGoals")}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {analysis.fitsUserDiet 
                        ? "This food aligns well with your fitness goals and dietary preferences."
                        : "This food may not be ideal for your current fitness goals. Consider moderation."}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button className="flex-1" variant="outline" onClick={scanAnother}>
                    <Camera className="h-4 w-4 mr-2" />
                    {t("scanAnother")}
                  </Button>
                  <Button className="flex-1" onClick={handleAddToLog}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("addToLog")}
                  </Button>
                </div>
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
            {t("scanFoodWithCamera")}
          </Button>
        </div>
      )}
    </div>
  );
};