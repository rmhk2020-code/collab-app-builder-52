import { useEffect, useRef, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Sparkles, Video, VideoOff } from "lucide-react";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import { toast } from "sonner";

const MOCK_MEALS = [
  { name: "Grilled Chicken Salad", calories: 420, protein: 38, carbs: 18, fats: 22 },
  { name: "Salmon & Rice Bowl", calories: 610, protein: 41, carbs: 62, fats: 19 },
  { name: "Avocado Toast with Egg", calories: 380, protein: 16, carbs: 34, fats: 21 },
];
const STAGES = ["Detecting food items…", "Estimating portion size…", "Calculating macros…", "Done!"];

const MealScanner = () => {
  const { addFoodLog } = useFitnessPlan();
  const [image, setImage] = useState<string | null>(null);
  const [stage, setStage] = useState(-1);
  const [meal, setMeal] = useState(MOCK_MEALS[0]);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f?: File) => {
    if (!f) return;
    setImage(URL.createObjectURL(f));
    setMeal(MOCK_MEALS[Math.floor(Math.random() * MOCK_MEALS.length)]);
    setStage(0);
  };
  useEffect(() => {
    if (stage < 0 || stage >= STAGES.length - 1) return;
    const t = setTimeout(() => setStage((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [stage]);

  const done = stage === STAGES.length - 1;
  const field = (k: "calories" | "protein" | "carbs" | "fats", label: string) => (
    <label className="text-xs text-muted-foreground">{label}
      <Input type="number" value={meal[k]} onChange={(e) => setMeal({ ...meal, [k]: Number(e.target.value) || 0 })} className="mt-1" />
    </label>
  );

  return (
    <Card className="rounded-2xl">
      <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary" /> AI Vision Meal Scanner</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        <div className="relative aspect-video rounded-xl border-2 border-dashed border-border bg-muted overflow-hidden flex items-center justify-center">
          {image ? <img src={image} alt="Meal" className="absolute inset-0 h-full w-full object-cover" /> : (
            <div className="text-center text-muted-foreground"><Upload className="h-10 w-10 mx-auto mb-2" />Take or upload a meal photo</div>
          )}
          {image && !done && (
            <>
              <div className="absolute inset-x-0 h-1 bg-primary shadow-[0_0_20px_hsl(var(--primary))] animate-[scan_1.5s_ease-in-out_infinite]" />
              <div className="absolute bottom-3 left-3 right-3 bg-background/90 rounded-lg p-2 text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary animate-spin" />{STAGES[stage]}</div>
            </>
          )}
        </div>
        {image && !done && <Progress value={((stage + 1) / STAGES.length) * 100} className="h-2" />}
        <Button onClick={() => fileRef.current?.click()} className="w-full min-h-[44px]"><Camera className="h-4 w-4 mr-2" /> {image ? "Scan another" : "Scan meal"}</Button>
        {done && (
          <div className="rounded-xl border border-border p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <Input value={meal.name} onChange={(e) => setMeal({ ...meal, name: e.target.value })} className="font-semibold" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{field("calories", "Calories")}{field("protein", "Protein (g)")}{field("carbs", "Carbs (g)")}{field("fats", "Fats (g)")}</div>
            <Button className="w-full" onClick={() => { addFoodLog({ name: meal.name, calories: meal.calories }); toast.success(`${meal.name} added to your food log`); }}>Add to food log</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FEEDBACK = [
  { text: "Great Squat Depth!", good: true }, { text: "Keep Spine Neutral", good: false },
  { text: "Knees tracking well", good: true }, { text: "Drive through heels", good: false },
];

const FormCoach = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camOn, setCamOn] = useState(false);
  const [t, setT] = useState(0);
  const [reps, setReps] = useState(0);

  useEffect(() => { const id = setInterval(() => setT((v) => v + 1), 50); return () => clearInterval(id); }, []);
  const phase = (Math.sin(t / 12) + 1) / 2; // 0 standing → 1 deep squat
  const prev = useRef(0);
  useEffect(() => { if (phase > 0.95 && prev.current <= 0.95) setReps((r) => r + 1); prev.current = phase; }, [phase]);

  const startCam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play(); }
      setCamOn(true);
    } catch { toast.error("Camera unavailable — showing demo preview."); }
  };
  const stopCam = () => {
    (videoRef.current?.srcObject as MediaStream | null)?.getTracks().forEach((tr) => tr.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOn(false);
  };
  useEffect(() => () => stopCam(), []);

  const hipY = 120 + phase * 50, kneeX = 100 + phase * 25;
  const pts = { head: [100, 50 + phase * 45], shoulder: [100, 80 + phase * 45], hip: [90 - phase * 15, hipY], knee: [kneeX, 170 + phase * 15], ankle: [100, 230] };
  const bones: [keyof typeof pts, keyof typeof pts][] = [["head", "shoulder"], ["shoulder", "hip"], ["hip", "knee"], ["knee", "ankle"]];
  const fb = FEEDBACK[Math.floor(t / 60) % FEEDBACK.length];

  return (
    <Card className="rounded-2xl">
      <CardHeader><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5 text-primary" /> AI Form Coach</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-xl bg-foreground/90 overflow-hidden">
          <video ref={videoRef} muted playsInline className={`absolute inset-0 h-full w-full object-cover -scale-x-100 ${camOn ? "" : "hidden"}`} />
          <svg viewBox="0 0 200 250" className="absolute inset-0 h-full w-full">
            {bones.map(([a, b]) => <line key={a + b} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" />)}
            <line x1={pts.shoulder[0]} y1={pts.shoulder[1] + 5} x2={pts.shoulder[0] + 40} y2={pts.shoulder[1] + 10} stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" />
            {Object.entries(pts).map(([k, [x, y]]) => <circle key={k} cx={x} cy={y} r={k === "head" ? 9 : 5} fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />)}
          </svg>
          <div className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold">Squat · Reps: {reps}</div>
          <div key={fb.text} className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold animate-in zoom-in ${fb.good ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
            {fb.good ? "✓" : "⚠"} {fb.text}
          </div>
        </div>
        <Button variant={camOn ? "secondary" : "default"} onClick={camOn ? stopCam : startCam} className="w-full min-h-[44px]">
          {camOn ? <><VideoOff className="h-4 w-4 mr-2" /> Stop camera</> : <><Video className="h-4 w-4 mr-2" /> Use my camera</>}
        </Button>
        <p className="text-xs text-muted-foreground">Preview mode: the skeleton and feedback are a demo of live pose coaching.</p>
      </CardContent>
    </Card>
  );
};

const AiTools = () => (
  <div className="min-h-screen bg-background">
    <AppHeader title="AI Tools" />
    <main className="container mx-auto max-w-6xl px-4 py-6 grid gap-6 lg:grid-cols-2">
      <MealScanner />
      <FormCoach />
    </main>
  </div>
);

export default AiTools;
