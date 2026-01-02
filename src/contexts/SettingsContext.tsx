import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserProfile = {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active";
};

export type FitnessPlanSettings = {
  workoutDaysPerWeek: number;
  workoutDuration: number;
  preferredWorkoutType: string[];
  workoutLocation: "home" | "gym" | "outdoor" | "any";
  availableEquipment: string[];
  autoGeneratePlan: boolean;
};

export type ExerciseSettings = {
  showRecommended: boolean;
  difficultyFilter: string[];
  restTimeSeconds: number;
  showAnimations: boolean;
  enableProgression: boolean;
};

export type DietSettings = {
  dailyCalorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  dietaryPreferences: string[];
  allergies: string[];
  mealFrequency: number;
  waterIntakeGoal: number;
  showRecommendedFoods: boolean;
};

export type TrackingSettings = {
  enableProgressBars: boolean;
  trackWeight: boolean;
  trackMeasurements: boolean;
  trackCaloriesBurned: boolean;
  showReports: boolean;
};

export type NotificationSettings = {
  workoutReminders: boolean;
  mealReminders: boolean;
  waterReminders: boolean;
  restDayReminders: boolean;
  motivationNotifications: boolean;
  customReminderTimes: string[];
};

export type AppPreferences = {
  theme: "light" | "dark";
  accentColor: string;
  language: string;
  fontSize: "small" | "medium" | "large";
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  units: {
    weight: "lbs" | "kg";
    distance: "miles" | "km";
    height: "ft" | "cm";
  };
};

export type PrivacySettings = {
  dataVisibility: "private" | "public";
  appLock: boolean;
  cloudBackup: boolean;
};

interface SettingsContextType {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  fitnessPlanSettings: FitnessPlanSettings;
  setFitnessPlanSettings: (settings: FitnessPlanSettings) => void;
  exerciseSettings: ExerciseSettings;
  setExerciseSettings: (settings: ExerciseSettings) => void;
  dietSettings: DietSettings;
  setDietSettings: (settings: DietSettings) => void;
  trackingSettings: TrackingSettings;
  setTrackingSettings: (settings: TrackingSettings) => void;
  notificationSettings: NotificationSettings;
  setNotificationSettings: (settings: NotificationSettings) => void;
  appPreferences: AppPreferences;
  setAppPreferences: (preferences: AppPreferences) => void;
  privacySettings: PrivacySettings;
  setPrivacySettings: (settings: PrivacySettings) => void;
  loadAllSettings: (settings: Partial<AllSettings>) => void;
}

export type AllSettings = {
  userProfile?: UserProfile;
  fitnessPlanSettings?: FitnessPlanSettings;
  exerciseSettings?: ExerciseSettings;
  dietSettings?: DietSettings;
  trackingSettings?: TrackingSettings;
  notificationSettings?: NotificationSettings;
  appPreferences?: AppPreferences;
  privacySettings?: PrivacySettings;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultUserProfile: UserProfile = {
  name: "",
  age: 25,
  height: 170,
  weight: 70,
  gender: "prefer_not_to_say",
  fitnessLevel: "beginner",
  activityLevel: "moderately_active",
};

const defaultFitnessPlanSettings: FitnessPlanSettings = {
  workoutDaysPerWeek: 4,
  workoutDuration: 45,
  preferredWorkoutType: ["strength", "cardio"],
  workoutLocation: "any",
  availableEquipment: ["dumbbells", "barbell"],
  autoGeneratePlan: true,
};

const defaultExerciseSettings: ExerciseSettings = {
  showRecommended: true,
  difficultyFilter: ["beginner", "intermediate", "advanced"],
  restTimeSeconds: 60,
  showAnimations: true,
  enableProgression: true,
};

const defaultDietSettings: DietSettings = {
  dailyCalorieTarget: 2000,
  proteinTarget: 150,
  carbsTarget: 200,
  fatsTarget: 65,
  dietaryPreferences: [],
  allergies: [],
  mealFrequency: 3,
  waterIntakeGoal: 8,
  showRecommendedFoods: true,
};

const defaultTrackingSettings: TrackingSettings = {
  enableProgressBars: true,
  trackWeight: true,
  trackMeasurements: true,
  trackCaloriesBurned: true,
  showReports: true,
};

const defaultNotificationSettings: NotificationSettings = {
  workoutReminders: true,
  mealReminders: true,
  waterReminders: false,
  restDayReminders: false,
  motivationNotifications: true,
  customReminderTimes: ["08:00", "12:00", "18:00"],
};

const defaultAppPreferences: AppPreferences = {
  theme: "dark",
  accentColor: "#2563EB",
  language: "en",
  fontSize: "medium",
  soundEnabled: true,
  vibrationEnabled: true,
  units: {
    weight: "kg",
    distance: "km",
    height: "cm",
  },
};

const defaultPrivacySettings: PrivacySettings = {
  dataVisibility: "private",
  appLock: false,
  cloudBackup: true,
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // Load theme from localStorage on init
  const getInitialTheme = (): "light" | "dark" => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return "dark";
  };

  const getInitialAppPreferences = (): AppPreferences => {
    const savedPrefs = localStorage.getItem("appPreferences");
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        return { ...defaultAppPreferences, ...parsed };
      } catch {
        return defaultAppPreferences;
      }
    }
    return { ...defaultAppPreferences, theme: getInitialTheme() };
  };

  // Helper to load from localStorage with fallback
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return { ...defaultValue, ...JSON.parse(saved) };
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadFromStorage("userProfile", defaultUserProfile));
  const [fitnessPlanSettings, setFitnessPlanSettings] = useState<FitnessPlanSettings>(() => loadFromStorage("fitnessPlanSettings", defaultFitnessPlanSettings));
  const [exerciseSettings, setExerciseSettings] = useState<ExerciseSettings>(() => loadFromStorage("exerciseSettings", defaultExerciseSettings));
  const [dietSettings, setDietSettings] = useState<DietSettings>(() => loadFromStorage("dietSettings", defaultDietSettings));
  const [trackingSettings, setTrackingSettings] = useState<TrackingSettings>(() => loadFromStorage("trackingSettings", defaultTrackingSettings));
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => loadFromStorage("notificationSettings", defaultNotificationSettings));
  const [appPreferences, setAppPreferencesState] = useState<AppPreferences>(getInitialAppPreferences);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => loadFromStorage("privacySettings", defaultPrivacySettings));

  // Apply theme to document, persist, and save all settings to localStorage
  const setAppPreferences = (prefs: AppPreferences) => {
    setAppPreferencesState(prefs);
    localStorage.setItem("appPreferences", JSON.stringify(prefs));
    localStorage.setItem("theme", prefs.theme);
    
    // Apply theme to document
    if (prefs.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Helper to persist all settings to localStorage for faster restore
  const persistAllSettings = () => {
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    localStorage.setItem("fitnessPlanSettings", JSON.stringify(fitnessPlanSettings));
    localStorage.setItem("exerciseSettings", JSON.stringify(exerciseSettings));
    localStorage.setItem("dietSettings", JSON.stringify(dietSettings));
    localStorage.setItem("trackingSettings", JSON.stringify(trackingSettings));
    localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings));
    localStorage.setItem("privacySettings", JSON.stringify(privacySettings));
  };

  // Auto-persist when any setting changes
  useEffect(() => {
    persistAllSettings();
  }, [userProfile, fitnessPlanSettings, exerciseSettings, dietSettings, trackingSettings, notificationSettings, privacySettings]);

  // Apply theme on mount
  useEffect(() => {
    if (appPreferences.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const loadAllSettings = (settings: Partial<AllSettings>) => {
    const readLocal = <T,>(key: string): T | null => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    };

    const localUserProfile = readLocal<UserProfile>("userProfile");
    const localFitnessPlanSettings = readLocal<FitnessPlanSettings>("fitnessPlanSettings");
    const localExerciseSettings = readLocal<ExerciseSettings>("exerciseSettings");
    const localDietSettings = readLocal<DietSettings>("dietSettings");
    const localTrackingSettings = readLocal<TrackingSettings>("trackingSettings");
    const localNotificationSettings = readLocal<NotificationSettings>("notificationSettings");
    const localPrivacySettings = readLocal<PrivacySettings>("privacySettings");
    const localAppPreferences = readLocal<AppPreferences>("appPreferences");

    // Prefer localStorage if it exists (prevents DB defaults from overwriting recent changes)
    if (settings.userProfile || localUserProfile) setUserProfile(localUserProfile ?? settings.userProfile!);
    if (settings.fitnessPlanSettings || localFitnessPlanSettings) setFitnessPlanSettings(localFitnessPlanSettings ?? settings.fitnessPlanSettings!);
    if (settings.exerciseSettings || localExerciseSettings) setExerciseSettings(localExerciseSettings ?? settings.exerciseSettings!);
    if (settings.dietSettings || localDietSettings) setDietSettings(localDietSettings ?? settings.dietSettings!);
    if (settings.trackingSettings || localTrackingSettings) setTrackingSettings(localTrackingSettings ?? settings.trackingSettings!);
    if (settings.notificationSettings || localNotificationSettings) setNotificationSettings(localNotificationSettings ?? settings.notificationSettings!);

    // For appPreferences, prefer localStorage (including font size), but always respect saved theme.
    if (settings.appPreferences || localAppPreferences) {
      const localTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      const base = settings.appPreferences ?? appPreferences;
      const mergedPrefs: AppPreferences = {
        ...base,
        ...(localAppPreferences ?? {}),
        theme: (localAppPreferences?.theme ?? localTheme ?? base.theme ?? "dark") as "light" | "dark",
      };
      setAppPreferences(mergedPrefs);
    }

    if (settings.privacySettings || localPrivacySettings) setPrivacySettings(localPrivacySettings ?? settings.privacySettings!);
  };

  return (
    <SettingsContext.Provider
      value={{
        userProfile,
        setUserProfile,
        fitnessPlanSettings,
        setFitnessPlanSettings,
        exerciseSettings,
        setExerciseSettings,
        dietSettings,
        setDietSettings,
        trackingSettings,
        setTrackingSettings,
        notificationSettings,
        setNotificationSettings,
        appPreferences,
        setAppPreferences,
        privacySettings,
        setPrivacySettings,
        loadAllSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
