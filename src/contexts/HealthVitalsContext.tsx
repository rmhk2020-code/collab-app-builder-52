import { createContext, useContext, useState, ReactNode } from "react";

export type WeightEntry = {
  id: string;
  value: number;
  unit: "kg" | "lbs";
  timestamp: Date;
};

export type BloodPressureEntry = {
  id: string;
  systolic: number;
  diastolic: number;
  timestamp: Date;
};

export type PulseEntry = {
  id: string;
  value: number;
  timestamp: Date;
  context?: "resting" | "after_exercise" | "general";
};

export type BodyMeasurement = {
  id: string;
  chest: number;
  waist: number;
  hips: number;
  biceps: number;
  thighs: number;
  calves: number;
  unit: "cm" | "in";
  timestamp: Date;
};

export type OxygenSaturation = {
  id: string;
  value: number;
  timestamp: Date;
};

export type SleepEntry = {
  id: string;
  hours: number;
  quality: "poor" | "fair" | "good" | "excellent";
  timestamp: Date;
};

export type StepsEntry = {
  id: string;
  count: number;
  timestamp: Date;
};

export type WaterIntakeEntry = {
  id: string;
  glasses: number;
  timestamp: Date;
};

interface HealthVitalsContextType {
  weightHistory: WeightEntry[];
  setWeightHistory: (entries: WeightEntry[]) => void;
  addWeightEntry: (entry: Omit<WeightEntry, "id" | "timestamp">) => void;
  bloodPressureHistory: BloodPressureEntry[];
  setBloodPressureHistory: (entries: BloodPressureEntry[]) => void;
  addBloodPressureEntry: (entry: Omit<BloodPressureEntry, "id" | "timestamp">) => void;
  pulseHistory: PulseEntry[];
  setPulseHistory: (entries: PulseEntry[]) => void;
  addPulseEntry: (entry: Omit<PulseEntry, "id" | "timestamp">) => void;
  bodyMeasurements: BodyMeasurement[];
  setBodyMeasurements: (entries: BodyMeasurement[]) => void;
  addBodyMeasurement: (entry: Omit<BodyMeasurement, "id" | "timestamp">) => void;
  oxygenHistory: OxygenSaturation[];
  setOxygenHistory: (entries: OxygenSaturation[]) => void;
  addOxygenEntry: (entry: Omit<OxygenSaturation, "id" | "timestamp">) => void;
  sleepHistory: SleepEntry[];
  setSleepHistory: (entries: SleepEntry[]) => void;
  addSleepEntry: (entry: Omit<SleepEntry, "id" | "timestamp">) => void;
  stepsHistory: StepsEntry[];
  setStepsHistory: (entries: StepsEntry[]) => void;
  addStepsEntry: (entry: Omit<StepsEntry, "id" | "timestamp">) => void;
  waterIntakeHistory: WaterIntakeEntry[];
  setWaterIntakeHistory: (entries: WaterIntakeEntry[]) => void;
  addWaterIntakeEntry: (entry: Omit<WaterIntakeEntry, "id" | "timestamp">) => void;
  clearAllData: () => void;
}

const HealthVitalsContext = createContext<HealthVitalsContextType | undefined>(undefined);

export const HealthVitalsProvider = ({ children }: { children: ReactNode }) => {
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [bloodPressureHistory, setBloodPressureHistory] = useState<BloodPressureEntry[]>([]);
  const [pulseHistory, setPulseHistory] = useState<PulseEntry[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [oxygenHistory, setOxygenHistory] = useState<OxygenSaturation[]>([]);
  const [sleepHistory, setSleepHistory] = useState<SleepEntry[]>([]);
  const [stepsHistory, setStepsHistory] = useState<StepsEntry[]>([]);
  const [waterIntakeHistory, setWaterIntakeHistory] = useState<WaterIntakeEntry[]>([]);

  const addWeightEntry = (entry: Omit<WeightEntry, "id" | "timestamp">) => {
    const newEntry: WeightEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setWeightHistory((prev) => [...prev, newEntry]);
  };

  const addBloodPressureEntry = (entry: Omit<BloodPressureEntry, "id" | "timestamp">) => {
    const newEntry: BloodPressureEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setBloodPressureHistory((prev) => [...prev, newEntry]);
  };

  const addPulseEntry = (entry: Omit<PulseEntry, "id" | "timestamp">) => {
    const newEntry: PulseEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setPulseHistory((prev) => [...prev, newEntry]);
  };

  const addBodyMeasurement = (entry: Omit<BodyMeasurement, "id" | "timestamp">) => {
    const newEntry: BodyMeasurement = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setBodyMeasurements((prev) => [...prev, newEntry]);
  };

  const addOxygenEntry = (entry: Omit<OxygenSaturation, "id" | "timestamp">) => {
    const newEntry: OxygenSaturation = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setOxygenHistory((prev) => [...prev, newEntry]);
  };

  const addSleepEntry = (entry: Omit<SleepEntry, "id" | "timestamp">) => {
    const newEntry: SleepEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setSleepHistory((prev) => [...prev, newEntry]);
  };

  const addStepsEntry = (entry: Omit<StepsEntry, "id" | "timestamp">) => {
    const newEntry: StepsEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setStepsHistory((prev) => [...prev, newEntry]);
  };

  const addWaterIntakeEntry = (entry: Omit<WaterIntakeEntry, "id" | "timestamp">) => {
    const newEntry: WaterIntakeEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setWaterIntakeHistory((prev) => [...prev, newEntry]);
  };

  const clearAllData = () => {
    setWeightHistory([]);
    setBloodPressureHistory([]);
    setPulseHistory([]);
    setBodyMeasurements([]);
    setOxygenHistory([]);
    setSleepHistory([]);
    setStepsHistory([]);
    setWaterIntakeHistory([]);
  };

  return (
    <HealthVitalsContext.Provider
      value={{
        weightHistory,
        setWeightHistory,
        addWeightEntry,
        bloodPressureHistory,
        setBloodPressureHistory,
        addBloodPressureEntry,
        pulseHistory,
        setPulseHistory,
        addPulseEntry,
        bodyMeasurements,
        setBodyMeasurements,
        addBodyMeasurement,
        oxygenHistory,
        setOxygenHistory,
        addOxygenEntry,
        sleepHistory,
        setSleepHistory,
        addSleepEntry,
        stepsHistory,
        setStepsHistory,
        addStepsEntry,
        waterIntakeHistory,
        setWaterIntakeHistory,
        addWaterIntakeEntry,
        clearAllData,
      }}
    >
      {children}
    </HealthVitalsContext.Provider>
  );
};

export const useHealthVitals = () => {
  const context = useContext(HealthVitalsContext);
  if (context === undefined) {
    throw new Error("useHealthVitals must be used within a HealthVitalsProvider");
  }
  return context;
};
