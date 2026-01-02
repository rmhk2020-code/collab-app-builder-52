import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useHealthVitals } from "@/contexts/HealthVitalsContext";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import { toast } from "@/hooks/use-toast";
import AppHeader from "@/components/layout/AppHeader";
import { useTranslation } from "@/i18n/TranslationContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  Scale,
  Heart,
  Activity,
  Ruler,
  Droplets,
  Moon,
  Footprints,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

const Health = () => {
  const { t } = useTranslation();
  const {
    weightHistory,
    addWeightEntry,
    bloodPressureHistory,
    addBloodPressureEntry,
    pulseHistory,
    addPulseEntry,
    bodyMeasurements,
    addBodyMeasurement,
    oxygenHistory,
    addOxygenEntry,
    sleepHistory,
    addSleepEntry,
    stepsHistory,
    addStepsEntry,
    waterIntakeHistory,
    addWaterIntakeEntry,
  } = useHealthVitals();

  const { isGuest } = useFitnessPlan();
  const [activeTab, setActiveTab] = useState("weight");

  // Form states
  const [weightValue, setWeightValue] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulseValue, setPulseValue] = useState("");
  const [pulseContext, setPulseContext] = useState<"resting" | "after_exercise" | "general">("resting");
  const [oxygenValue, setOxygenValue] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">("good");
  const [stepsCount, setStepsCount] = useState("");
  const [waterGlasses, setWaterGlasses] = useState("");
  const [measurements, setMeasurements] = useState({
    chest: "",
    waist: "",
    hips: "",
    biceps: "",
    thighs: "",
    calves: "",
  });
  const [measurementUnit, setMeasurementUnit] = useState<"cm" | "in">("cm");

  const handleAddWeight = () => {
    const value = parseFloat(weightValue);
    if (isNaN(value) || value <= 0) {
      toast({ title: "Invalid weight", description: "Please enter a valid weight value", variant: "destructive" });
      return;
    }
    addWeightEntry({ value, unit: weightUnit });
    setWeightValue("");
    toast({ title: "Weight logged", description: `${value} ${weightUnit} recorded successfully` });
  };

  const handleAddBloodPressure = () => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) {
      toast({ title: "Invalid values", description: "Please enter valid blood pressure values", variant: "destructive" });
      return;
    }
    addBloodPressureEntry({ systolic: sys, diastolic: dia });
    setSystolic("");
    setDiastolic("");
    toast({ title: "Blood pressure logged", description: `${sys}/${dia} mmHg recorded successfully` });
  };

  const handleAddPulse = () => {
    const value = parseInt(pulseValue);
    if (isNaN(value) || value <= 0) {
      toast({ title: "Invalid pulse", description: "Please enter a valid pulse value", variant: "destructive" });
      return;
    }
    addPulseEntry({ value, context: pulseContext });
    setPulseValue("");
    toast({ title: "Pulse logged", description: `${value} BPM recorded successfully` });
  };

  const handleAddOxygen = () => {
    const value = parseInt(oxygenValue);
    if (isNaN(value) || value < 0 || value > 100) {
      toast({ title: "Invalid SpO2", description: "Please enter a valid oxygen saturation (0-100%)", variant: "destructive" });
      return;
    }
    addOxygenEntry({ value });
    setOxygenValue("");
    toast({ title: "SpO2 logged", description: `${value}% recorded successfully` });
  };

  const handleAddSleep = () => {
    const hours = parseFloat(sleepHours);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      toast({ title: "Invalid hours", description: "Please enter valid sleep hours", variant: "destructive" });
      return;
    }
    addSleepEntry({ hours, quality: sleepQuality });
    setSleepHours("");
    toast({ title: "Sleep logged", description: `${hours} hours recorded successfully` });
  };

  const handleAddSteps = () => {
    const count = parseInt(stepsCount);
    if (isNaN(count) || count < 0) {
      toast({ title: "Invalid steps", description: "Please enter a valid step count", variant: "destructive" });
      return;
    }
    addStepsEntry({ count });
    setStepsCount("");
    toast({ title: "Steps logged", description: `${count.toLocaleString()} steps recorded successfully` });
  };

  const handleAddWater = () => {
    const glasses = parseInt(waterGlasses);
    if (isNaN(glasses) || glasses <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid number of glasses", variant: "destructive" });
      return;
    }
    addWaterIntakeEntry({ glasses });
    setWaterGlasses("");
    toast({ title: "Water intake logged", description: `${glasses} glasses recorded successfully` });
  };

  const handleAddMeasurements = () => {
    const nums = {
      chest: parseFloat(measurements.chest) || 0,
      waist: parseFloat(measurements.waist) || 0,
      hips: parseFloat(measurements.hips) || 0,
      biceps: parseFloat(measurements.biceps) || 0,
      thighs: parseFloat(measurements.thighs) || 0,
      calves: parseFloat(measurements.calves) || 0,
    };
    if (Object.values(nums).every((v) => v === 0)) {
      toast({ title: "No measurements", description: "Please enter at least one measurement", variant: "destructive" });
      return;
    }
    addBodyMeasurement({ ...nums, unit: measurementUnit });
    setMeasurements({ chest: "", waist: "", hips: "", biceps: "", thighs: "", calves: "" });
    toast({ title: "Measurements logged", description: "Body measurements recorded successfully" });
  };

  // Chart data transformations
  const weightChartData = weightHistory.map((entry) => ({
    date: format(new Date(entry.timestamp), "MMM d"),
    value: entry.value,
    fullDate: format(new Date(entry.timestamp), "PPp"),
  }));

  const bpChartData = bloodPressureHistory.map((entry) => ({
    date: format(new Date(entry.timestamp), "MMM d"),
    systolic: entry.systolic,
    diastolic: entry.diastolic,
  }));

  const pulseChartData = pulseHistory.map((entry) => ({
    date: format(new Date(entry.timestamp), "MMM d"),
    value: entry.value,
    context: entry.context,
  }));

  const sleepChartData = sleepHistory.map((entry) => ({
    date: format(new Date(entry.timestamp), "MMM d"),
    hours: entry.hours,
    quality: entry.quality,
  }));

  const stepsChartData = stepsHistory.map((entry) => ({
    date: format(new Date(entry.timestamp), "MMM d"),
    count: entry.count,
  }));

  // Latest values helpers
  const latestWeight = weightHistory[weightHistory.length - 1];
  const latestBP = bloodPressureHistory[bloodPressureHistory.length - 1];
  const latestPulse = pulseHistory[pulseHistory.length - 1];
  const latestOxygen = oxygenHistory[oxygenHistory.length - 1];
  const latestSleep = sleepHistory[sleepHistory.length - 1];
  const latestSteps = stepsHistory[stepsHistory.length - 1];
  const todayWater = waterIntakeHistory.filter(
    (e) => format(new Date(e.timestamp), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ).reduce((sum, e) => sum + e.glasses, 0);

  const getTrend = (history: any[], key: string) => {
    if (history.length < 2) return null;
    const current = history[history.length - 1][key];
    const previous = history[history.length - 2][key];
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "stable";
  };

  const TrendIcon = ({ trend }: { trend: string | null }) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getBPStatus = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { label: "Normal", color: "text-emerald-500" };
    if (sys < 130 && dia < 80) return { label: "Elevated", color: "text-amber-500" };
    if (sys < 140 || dia < 90) return { label: "High Stage 1", color: "text-orange-500" };
    return { label: "High Stage 2", color: "text-red-500" };
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title={t("healthVitals")} />

      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
          <div className="container mx-auto max-w-6xl flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Guest mode: Data won't be saved. Sign in to track your vitals.</span>
            <Link to="/auth" className="ml-auto">
              <Button size="sm" variant="outline" className="min-h-[36px]">Sign In</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats Overview */}
      <section className="py-6 px-4 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card className="p-4 text-center">
              <Scale className="h-5 w-5 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="font-bold">{latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : "--"}</p>
            </Card>
            <Card className="p-4 text-center">
              <Heart className="h-5 w-5 mx-auto text-red-500 mb-2" />
              <p className="text-xs text-muted-foreground">Blood Pressure</p>
              <p className="font-bold">{latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : "--"}</p>
            </Card>
            <Card className="p-4 text-center">
              <Activity className="h-5 w-5 mx-auto text-pink-500 mb-2" />
              <p className="text-xs text-muted-foreground">Pulse</p>
              <p className="font-bold">{latestPulse ? `${latestPulse.value} BPM` : "--"}</p>
            </Card>
            <Card className="p-4 text-center">
              <Droplets className="h-5 w-5 mx-auto text-cyan-500 mb-2" />
              <p className="text-xs text-muted-foreground">SpO2</p>
              <p className="font-bold">{latestOxygen ? `${latestOxygen.value}%` : "--"}</p>
            </Card>
            <Card className="p-4 text-center">
              <Moon className="h-5 w-5 mx-auto text-indigo-500 mb-2" />
              <p className="text-xs text-muted-foreground">Sleep</p>
              <p className="font-bold">{latestSleep ? `${latestSleep.hours}h` : "--"}</p>
            </Card>
            <Card className="p-4 text-center">
              <Footprints className="h-5 w-5 mx-auto text-emerald-500 mb-2" />
              <p className="text-xs text-muted-foreground">Steps</p>
              <p className="font-bold">{latestSteps ? latestSteps.count.toLocaleString() : "--"}</p>
            </Card>
            <Card className="p-4 text-center">
              <Droplets className="h-5 w-5 mx-auto text-blue-500 mb-2" />
              <p className="text-xs text-muted-foreground">Water</p>
              <p className="font-bold">{todayWater} glasses</p>
            </Card>
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-6xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto gap-1">
            <TabsTrigger value="weight" className="gap-1 text-xs sm:text-sm min-h-[40px]">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Weight</span>
            </TabsTrigger>
            <TabsTrigger value="bp" className="gap-1 text-xs sm:text-sm min-h-[40px]">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">BP</span>
            </TabsTrigger>
            <TabsTrigger value="pulse" className="gap-1 text-xs sm:text-sm min-h-[40px]">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Pulse</span>
            </TabsTrigger>
            <TabsTrigger value="oxygen" className="gap-1 text-xs sm:text-sm min-h-[40px]">
              <Droplets className="h-4 w-4" />
              <span className="hidden sm:inline">SpO2</span>
            </TabsTrigger>
            <TabsTrigger value="measurements" className="gap-1 text-xs sm:text-sm min-h-[40px]">
              <Ruler className="h-4 w-4" />
              <span className="hidden sm:inline">Body</span>
            </TabsTrigger>
            <TabsTrigger value="sleep" className="gap-1 text-xs sm:text-sm min-h-[40px]">
              <Moon className="h-4 w-4" />
              <span className="hidden sm:inline">Sleep</span>
            </TabsTrigger>
            <TabsTrigger value="steps" className="gap-1 text-xs sm:text-sm min-h-[40px]">
              <Footprints className="h-4 w-4" />
              <span className="hidden sm:inline">Steps</span>
            </TabsTrigger>
            <TabsTrigger value="water" className="gap-1 text-xs sm:text-sm min-h-[40px]">
              <Droplets className="h-4 w-4" />
              <span className="hidden sm:inline">Water</span>
            </TabsTrigger>
          </TabsList>

          {/* Weight Tab */}
          <TabsContent value="weight" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-primary" />
                      Weight History
                    </span>
                    {latestWeight && <TrendIcon trend={getTrend(weightHistory, "value")} />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weightChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis domain={["dataMin - 2", "dataMax + 2"]} className="text-xs" />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No weight data yet. Add your first entry!
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Log Weight</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Weight</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={weightValue}
                        onChange={(e) => setWeightValue(e.target.value)}
                        placeholder="70"
                        className="min-h-[44px]"
                      />
                      <Select value={weightUnit} onValueChange={(v: "kg" | "lbs") => setWeightUnit(v)}>
                        <SelectTrigger className="w-24 min-h-[44px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAddWeight} className="w-full min-h-[44px] gap-2">
                    <Plus className="h-4 w-4" /> Add Entry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Blood Pressure Tab */}
          <TabsContent value="bp" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Blood Pressure History
                  </CardTitle>
                  {latestBP && (
                    <Badge className={getBPStatus(latestBP.systolic, latestBP.diastolic).color}>
                      {getBPStatus(latestBP.systolic, latestBP.diastolic).label}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {bpChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={bpChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis domain={[60, 180]} className="text-xs" />
                        <Tooltip />
                        <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" strokeWidth={2} />
                        <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No blood pressure data yet. Add your first reading!
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Log Blood Pressure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Systolic (mmHg)</Label>
                    <Input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      placeholder="120"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Diastolic (mmHg)</Label>
                    <Input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      placeholder="80"
                      className="min-h-[44px]"
                    />
                  </div>
                  <Button onClick={handleAddBloodPressure} className="w-full min-h-[44px] gap-2">
                    <Plus className="h-4 w-4" /> Add Entry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pulse Tab */}
          <TabsContent value="pulse" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-pink-500" />
                    Pulse/Heart Rate History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pulseChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={pulseChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis domain={[40, 160]} className="text-xs" />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No pulse data yet. Add your first reading!
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Log Pulse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Heart Rate (BPM)</Label>
                    <Input
                      type="number"
                      value={pulseValue}
                      onChange={(e) => setPulseValue(e.target.value)}
                      placeholder="72"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Context</Label>
                    <Select value={pulseContext} onValueChange={(v: any) => setPulseContext(v)}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resting">Resting</SelectItem>
                        <SelectItem value="after_exercise">After Exercise</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddPulse} className="w-full min-h-[44px] gap-2">
                    <Plus className="h-4 w-4" /> Add Entry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Oxygen Tab */}
          <TabsContent value="oxygen" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-cyan-500" />
                    Oxygen Saturation (SpO2)
                  </CardTitle>
                  {latestOxygen && (
                    <Badge variant={latestOxygen.value >= 95 ? "default" : "destructive"}>
                      {latestOxygen.value >= 95 ? "Normal" : "Low"}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {oxygenHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={oxygenHistory.map((e) => ({ date: format(new Date(e.timestamp), "MMM d"), value: e.value }))}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis domain={[90, 100]} className="text-xs" />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No SpO2 data yet. Add your first reading!
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Log SpO2</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Oxygen Saturation (%)</Label>
                    <Input
                      type="number"
                      value={oxygenValue}
                      onChange={(e) => setOxygenValue(e.target.value)}
                      placeholder="98"
                      min="0"
                      max="100"
                      className="min-h-[44px]"
                    />
                  </div>
                  <Button onClick={handleAddOxygen} className="w-full min-h-[44px] gap-2">
                    <Plus className="h-4 w-4" /> Add Entry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Body Measurements Tab */}
          <TabsContent value="measurements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  Body Measurements
                </CardTitle>
                <CardDescription>Track your body measurements over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["chest", "waist", "hips", "biceps", "thighs", "calves"].map((part) => (
                    <div key={part} className="space-y-2">
                      <Label className="capitalize">{part}</Label>
                      <Input
                        type="number"
                        value={measurements[part as keyof typeof measurements]}
                        onChange={(e) => setMeasurements({ ...measurements, [part]: e.target.value })}
                        placeholder="0"
                        className="min-h-[44px]"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <Select value={measurementUnit} onValueChange={(v: "cm" | "in") => setMeasurementUnit(v)}>
                    <SelectTrigger className="w-32 min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">Centimeters</SelectItem>
                      <SelectItem value="in">Inches</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddMeasurements} className="min-h-[44px] gap-2">
                    <Plus className="h-4 w-4" /> Save Measurements
                  </Button>
                </div>

                {bodyMeasurements.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Recent Measurements</h4>
                    <div className="space-y-2">
                      {bodyMeasurements.slice(-5).reverse().map((m) => (
                        <div key={m.id} className="p-3 bg-muted/50 rounded-lg flex flex-wrap gap-4 text-sm">
                          <span className="text-muted-foreground">{format(new Date(m.timestamp), "PPp")}</span>
                          {m.chest > 0 && <span>Chest: {m.chest}{m.unit}</span>}
                          {m.waist > 0 && <span>Waist: {m.waist}{m.unit}</span>}
                          {m.hips > 0 && <span>Hips: {m.hips}{m.unit}</span>}
                          {m.biceps > 0 && <span>Biceps: {m.biceps}{m.unit}</span>}
                          {m.thighs > 0 && <span>Thighs: {m.thighs}{m.unit}</span>}
                          {m.calves > 0 && <span>Calves: {m.calves}{m.unit}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sleep Tab */}
          <TabsContent value="sleep" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-indigo-500" />
                    Sleep History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sleepChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={sleepChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis domain={[0, 12]} className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No sleep data yet. Add your first entry!
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Log Sleep</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hours Slept</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      placeholder="7.5"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sleep Quality</Label>
                    <Select value={sleepQuality} onValueChange={(v: any) => setSleepQuality(v)}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddSleep} className="w-full min-h-[44px] gap-2">
                    <Plus className="h-4 w-4" /> Add Entry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Steps Tab */}
          <TabsContent value="steps" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Footprints className="h-5 w-5 text-emerald-500" />
                    Daily Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stepsChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stepsChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No step data yet. Add your first entry!
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Log Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Step Count</Label>
                    <Input
                      type="number"
                      value={stepsCount}
                      onChange={(e) => setStepsCount(e.target.value)}
                      placeholder="10000"
                      className="min-h-[44px]"
                    />
                  </div>
                  <Button onClick={handleAddSteps} className="w-full min-h-[44px] gap-2">
                    <Plus className="h-4 w-4" /> Add Entry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Water Tab */}
          <TabsContent value="water" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    Water Intake
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-6xl font-bold text-blue-500 mb-2">{todayWater}</div>
                    <p className="text-muted-foreground">glasses today</p>
                    <div className="mt-6 flex justify-center gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div
                          key={n}
                          className={`w-8 h-12 rounded-lg border-2 ${
                            n <= todayWater ? "bg-blue-500 border-blue-500" : "border-blue-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Add Water</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((n) => (
                      <Button
                        key={n}
                        variant="outline"
                        className="min-h-[48px]"
                        onClick={() => {
                          addWaterIntakeEntry({ glasses: n });
                          toast({ title: "Water logged", description: `${n} glass${n > 1 ? "es" : ""} added` });
                        }}
                      >
                        +{n} glass{n > 1 ? "es" : ""}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Custom Amount</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={waterGlasses}
                        onChange={(e) => setWaterGlasses(e.target.value)}
                        placeholder="0"
                        className="min-h-[44px]"
                      />
                      <Button onClick={handleAddWater} className="min-h-[44px]">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Health;
