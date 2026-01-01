import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettings } from "@/contexts/SettingsContext";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  User,
  Target,
  Dumbbell,
  Apple,
  BarChart3,
  Bell,
  Palette,
  Shield,
  Sparkles,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  Lock,
  Cloud,
  Trash2,
  FileText,
  HelpCircle,
  MessageSquare,
  Info,
  LogOut,
  Mail,
  KeyRound,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const {
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
  } = useSettings();

  const { setFitnessPlan, setHasCompletedOnboarding } = useFitnessPlan();
  const [activeTab, setActiveTab] = useState("account");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  // Password change states
  const [passwordStep, setPasswordStep] = useState<"idle" | "code" | "newPassword" | "success">("idle");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Delete account states
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
    };
    getUser();
  }, []);

  // Password change handlers
  const handleSendVerificationCode = async () => {
    if (!userEmail) {
      toast({
        title: "Error",
        description: "No email found. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-password-reset", {
        body: { email: userEmail },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setGeneratedCode(data.code);
      setPasswordStep("code");
      toast({
        title: "Code sent!",
        description: "Check your email for the verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send code",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      toast({
        title: "Code required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    if (verificationCode !== generatedCode) {
      toast({
        title: "Invalid code",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setPasswordStep("newPassword");
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Password required",
        description: "Please enter and confirm your new password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("update-password", {
        body: { email: userEmail, newPassword, code: generatedCode },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setPasswordStep("success");
      toast({
        title: "Password updated!",
        description: "Your password has been changed successfully.",
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setPasswordStep("idle");
        setVerificationCode("");
        setNewPassword("");
        setConfirmPassword("");
        setGeneratedCode("");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Failed to update password",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordStep("idle");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setGeneratedCode("");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({
        title: "Confirmation required",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to delete your account.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("delete-account", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });

      // Sign out and redirect
      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Failed to delete account",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmText("");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      navigate("/");
    }
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleResetPlan = () => {
    // Clear local storage
    localStorage.removeItem("fitnessPlan");
    localStorage.removeItem("hasCompletedOnboarding");
    
    // Reset context state
    setFitnessPlan(null);
    setHasCompletedOnboarding(false);
    
    toast({
      title: "Fitness Plan Reset",
      description: "Redirecting to onboarding to generate a new plan...",
    });
    
    // Navigate to onboarding after a short delay
    setTimeout(() => {
      navigate("/onboarding");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/home">
                <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Customize your Health Kinetics experience</p>
              </div>
            </div>
            <Button onClick={handleSave} className="min-h-[44px] gap-2">
              <Save className="h-4 w-4" />
              Save All
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-auto p-1 gap-1 flex-wrap justify-start">
              <TabsTrigger value="account" className="gap-2 min-h-[40px]">
                <User className="h-4 w-4" /> Account
              </TabsTrigger>
              <TabsTrigger value="fitness" className="gap-2 min-h-[40px]">
                <Target className="h-4 w-4" /> Fitness Plan
              </TabsTrigger>
              <TabsTrigger value="exercise" className="gap-2 min-h-[40px]">
                <Dumbbell className="h-4 w-4" /> Exercise
              </TabsTrigger>
              <TabsTrigger value="diet" className="gap-2 min-h-[40px]">
                <Apple className="h-4 w-4" /> Diet
              </TabsTrigger>
              <TabsTrigger value="tracking" className="gap-2 min-h-[40px]">
                <BarChart3 className="h-4 w-4" /> Tracking
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 min-h-[40px]">
                <Bell className="h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2 min-h-[40px]">
                <Palette className="h-4 w-4" /> App
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2 min-h-[40px]">
                <Shield className="h-4 w-4" /> Privacy
              </TabsTrigger>
              <TabsTrigger value="smart" className="gap-2 min-h-[40px]">
                <Sparkles className="h-4 w-4" /> Smart
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2 min-h-[40px]">
                <SettingsIcon className="h-4 w-4" /> System
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* Account & Profile */}
          <TabsContent value="account" className="space-y-6">
            {/* Signed In Email Card */}
            {userEmail && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Signed In As
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium text-foreground">{userEmail}</p>
                </CardContent>
              </Card>
            )}

            {/* Change Password Card */}
            {userEmail && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passwordStep === "idle" && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        To change your password, we'll send a verification code to your email.
                      </p>
                      <Button 
                        onClick={handleSendVerificationCode}
                        className="w-full min-h-[44px] gap-2"
                        disabled={isPasswordLoading}
                      >
                        {isPasswordLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending code...
                          </>
                        ) : (
                          <>
                            <KeyRound className="h-4 w-4" />
                            Send Verification Code
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {passwordStep === "code" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Verification Code</Label>
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="min-h-[44px] text-center text-lg tracking-widest"
                          maxLength={6}
                        />
                        <p className="text-sm text-muted-foreground">
                          Enter the code sent to {userEmail}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={handleCancelPasswordChange}
                          className="flex-1 min-h-[44px]"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleVerifyCode}
                          className="flex-1 min-h-[44px]"
                        >
                          Verify Code
                        </Button>
                      </div>
                      <Button
                        variant="link"
                        className="w-full"
                        onClick={handleSendVerificationCode}
                        disabled={isPasswordLoading}
                      >
                        Resend code
                      </Button>
                    </div>
                  )}

                  {passwordStep === "newPassword" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm Password</Label>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="min-h-[44px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={handleCancelPasswordChange}
                          className="flex-1 min-h-[44px]"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleUpdatePassword}
                          className="flex-1 min-h-[44px]"
                          disabled={isPasswordLoading}
                        >
                          {isPasswordLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {passwordStep === "success" && (
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-foreground font-medium">
                        Password updated successfully!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      placeholder="Enter your name"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={userProfile.age}
                      onChange={(e) => setUserProfile({ ...userProfile, age: parseInt(e.target.value) || 0 })}
                      className="min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height ({appPreferences.units.height})</Label>
                    <Input
                      id="height"
                      type="number"
                      value={userProfile.height}
                      onChange={(e) => setUserProfile({ ...userProfile, height: parseInt(e.target.value) || 0 })}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight ({appPreferences.units.weight})</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={userProfile.weight}
                      onChange={(e) => setUserProfile({ ...userProfile, weight: parseInt(e.target.value) || 0 })}
                      className="min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={userProfile.gender}
                      onValueChange={(value: any) => setUserProfile({ ...userProfile, gender: value })}
                    >
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fitness Level</Label>
                    <Select
                      value={userProfile.fitnessLevel}
                      onValueChange={(value: any) => setUserProfile({ ...userProfile, fitnessLevel: value })}
                    >
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Activity Level</Label>
                  <Select
                    value={userProfile.activityLevel}
                    onValueChange={(value: any) => setUserProfile({ ...userProfile, activityLevel: value })}
                  >
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                      <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                      <SelectItem value="extremely_active">Extremely Active (athlete)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Units Preference</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Weight</Label>
                      <Select
                        value={appPreferences.units.weight}
                        onValueChange={(value: "lbs" | "kg") =>
                          setAppPreferences({ ...appPreferences, units: { ...appPreferences.units, weight: value } })
                        }
                      >
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Distance</Label>
                      <Select
                        value={appPreferences.units.distance}
                        onValueChange={(value: "miles" | "km") =>
                          setAppPreferences({ ...appPreferences, units: { ...appPreferences.units, distance: value } })
                        }
                      >
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="km">Kilometers (km)</SelectItem>
                          <SelectItem value="miles">Miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Height</Label>
                      <Select
                        value={appPreferences.units.height}
                        onValueChange={(value: "ft" | "cm") =>
                          setAppPreferences({ ...appPreferences, units: { ...appPreferences.units, height: value } })
                        }
                      >
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">Centimeters (cm)</SelectItem>
                          <SelectItem value="ft">Feet (ft)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logout Card */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </CardTitle>
                <CardDescription>Sign out of your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  className="w-full min-h-[44px] gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Delete Account Card */}
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>Permanently delete your account and all data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This action is irreversible. All your data, fitness plans, and progress will be permanently deleted.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full min-h-[44px] gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete My Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Account Permanently?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-4">
                        <p>
                          This will permanently delete your account and all associated data including:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Your fitness plan and onboarding answers</li>
                          <li>All exercise and food logs</li>
                          <li>Health vitals and progress data</li>
                          <li>Account settings and preferences</li>
                        </ul>
                        <p className="font-medium text-destructive">
                          This action cannot be undone.
                        </p>
                        <div className="space-y-2 pt-2">
                          <Label htmlFor="confirm-delete">Type DELETE to confirm:</Label>
                          <Input
                            id="confirm-delete"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                            placeholder="DELETE"
                            className="min-h-[44px]"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                        Cancel
                      </AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== "DELETE" || isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Account"
                        )}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fitness Plan Settings */}
          <TabsContent value="fitness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Fitness Plan Configuration
                </CardTitle>
                <CardDescription>Customize your workout preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Workout Days Per Week: {fitnessPlanSettings.workoutDaysPerWeek}</Label>
                    <Slider
                      value={[fitnessPlanSettings.workoutDaysPerWeek]}
                      onValueChange={([value]) =>
                        setFitnessPlanSettings({ ...fitnessPlanSettings, workoutDaysPerWeek: value })
                      }
                      min={1}
                      max={7}
                      step={1}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Workout Duration: {fitnessPlanSettings.workoutDuration} min</Label>
                    <Slider
                      value={[fitnessPlanSettings.workoutDuration]}
                      onValueChange={([value]) =>
                        setFitnessPlanSettings({ ...fitnessPlanSettings, workoutDuration: value })
                      }
                      min={15}
                      max={120}
                      step={5}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Workout Location</Label>
                  <Select
                    value={fitnessPlanSettings.workoutLocation}
                    onValueChange={(value: any) =>
                      setFitnessPlanSettings({ ...fitnessPlanSettings, workoutLocation: value })
                    }
                  >
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="gym">Gym</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                      <SelectItem value="any">Any Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Preferred Workout Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {["strength", "cardio", "hiit", "flexibility", "yoga", "pilates", "sports"].map((type) => (
                      <Badge
                        key={type}
                        variant={fitnessPlanSettings.preferredWorkoutType.includes(type) ? "default" : "outline"}
                        className="cursor-pointer capitalize min-h-[36px] px-3"
                        onClick={() => {
                          const newTypes = fitnessPlanSettings.preferredWorkoutType.includes(type)
                            ? fitnessPlanSettings.preferredWorkoutType.filter((t) => t !== type)
                            : [...fitnessPlanSettings.preferredWorkoutType, type];
                          setFitnessPlanSettings({ ...fitnessPlanSettings, preferredWorkoutType: newTypes });
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Generate Plan</Label>
                    <p className="text-sm text-muted-foreground">Automatically create workout plans based on your preferences</p>
                  </div>
                  <Switch
                    checked={fitnessPlanSettings.autoGeneratePlan}
                    onCheckedChange={(checked) =>
                      setFitnessPlanSettings({ ...fitnessPlanSettings, autoGeneratePlan: checked })
                    }
                  />
                </div>

                <Separator />

                <Button variant="destructive" className="gap-2 min-h-[44px]" onClick={handleResetPlan}>
                  <RefreshCw className="h-4 w-4" />
                  Reset Fitness Plan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exercise Settings */}
          <TabsContent value="exercise" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  Exercise Preferences
                </CardTitle>
                <CardDescription>Configure your exercise experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Recommended Exercises</Label>
                    <p className="text-sm text-muted-foreground">Highlight exercises that match your fitness plan</p>
                  </div>
                  <Switch
                    checked={exerciseSettings.showRecommended}
                    onCheckedChange={(checked) => setExerciseSettings({ ...exerciseSettings, showRecommended: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Animations/Demos</Label>
                    <p className="text-sm text-muted-foreground">Display exercise demonstration animations</p>
                  </div>
                  <Switch
                    checked={exerciseSettings.showAnimations}
                    onCheckedChange={(checked) => setExerciseSettings({ ...exerciseSettings, showAnimations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Progression Tracking</Label>
                    <p className="text-sm text-muted-foreground">Track reps, sets, and weight over time</p>
                  </div>
                  <Switch
                    checked={exerciseSettings.enableProgression}
                    onCheckedChange={(checked) =>
                      setExerciseSettings({ ...exerciseSettings, enableProgression: checked })
                    }
                  />
                </div>

                <div className="space-y-4">
                  <Label>Rest Time Between Sets: {exerciseSettings.restTimeSeconds}s</Label>
                  <Slider
                    value={[exerciseSettings.restTimeSeconds]}
                    onValueChange={([value]) => setExerciseSettings({ ...exerciseSettings, restTimeSeconds: value })}
                    min={15}
                    max={180}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Difficulty Filter</Label>
                  <div className="flex flex-wrap gap-2">
                    {["beginner", "intermediate", "advanced"].map((level) => (
                      <Badge
                        key={level}
                        variant={exerciseSettings.difficultyFilter.includes(level) ? "default" : "outline"}
                        className="cursor-pointer capitalize min-h-[36px] px-3"
                        onClick={() => {
                          const newLevels = exerciseSettings.difficultyFilter.includes(level)
                            ? exerciseSettings.difficultyFilter.filter((l) => l !== level)
                            : [...exerciseSettings.difficultyFilter, level];
                          setExerciseSettings({ ...exerciseSettings, difficultyFilter: newLevels });
                        }}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diet & Nutrition Settings */}
          <TabsContent value="diet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5 text-primary" />
                  Nutrition Goals
                </CardTitle>
                <CardDescription>Set your daily nutrition targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Daily Calorie Target</Label>
                    <Input
                      type="number"
                      value={dietSettings.dailyCalorieTarget}
                      onChange={(e) =>
                        setDietSettings({ ...dietSettings, dailyCalorieTarget: parseInt(e.target.value) || 0 })
                      }
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meal Frequency</Label>
                    <Select
                      value={dietSettings.mealFrequency.toString()}
                      onValueChange={(value) => setDietSettings({ ...dietSettings, mealFrequency: parseInt(value) })}
                    >
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 meals/day</SelectItem>
                        <SelectItem value="3">3 meals/day</SelectItem>
                        <SelectItem value="4">4 meals/day</SelectItem>
                        <SelectItem value="5">5 meals/day</SelectItem>
                        <SelectItem value="6">6 meals/day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Macronutrient Targets (grams)</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Protein</Label>
                      <Input
                        type="number"
                        value={dietSettings.proteinTarget}
                        onChange={(e) =>
                          setDietSettings({ ...dietSettings, proteinTarget: parseInt(e.target.value) || 0 })
                        }
                        className="min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Carbs</Label>
                      <Input
                        type="number"
                        value={dietSettings.carbsTarget}
                        onChange={(e) =>
                          setDietSettings({ ...dietSettings, carbsTarget: parseInt(e.target.value) || 0 })
                        }
                        className="min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fats</Label>
                      <Input
                        type="number"
                        value={dietSettings.fatsTarget}
                        onChange={(e) =>
                          setDietSettings({ ...dietSettings, fatsTarget: parseInt(e.target.value) || 0 })
                        }
                        className="min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Water Intake Goal (glasses)</Label>
                  <Slider
                    value={[dietSettings.waterIntakeGoal]}
                    onValueChange={([value]) => setDietSettings({ ...dietSettings, waterIntakeGoal: value })}
                    min={4}
                    max={16}
                    step={1}
                  />
                  <p className="text-sm text-muted-foreground">{dietSettings.waterIntakeGoal} glasses per day</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Dietary Preferences</Label>
                  <div className="flex flex-wrap gap-2">
                    {["vegan", "vegetarian", "keto", "paleo", "gluten-free", "dairy-free", "low-carb", "high-protein"].map(
                      (pref) => (
                        <Badge
                          key={pref}
                          variant={dietSettings.dietaryPreferences.includes(pref) ? "default" : "outline"}
                          className="cursor-pointer capitalize min-h-[36px] px-3"
                          onClick={() => {
                            const newPrefs = dietSettings.dietaryPreferences.includes(pref)
                              ? dietSettings.dietaryPreferences.filter((p) => p !== pref)
                              : [...dietSettings.dietaryPreferences, pref];
                            setDietSettings({ ...dietSettings, dietaryPreferences: newPrefs });
                          }}
                        >
                          {pref}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Recommended Foods</Label>
                    <p className="text-sm text-muted-foreground">Highlight foods that match your fitness plan</p>
                  </div>
                  <Switch
                    checked={dietSettings.showRecommendedFoods}
                    onCheckedChange={(checked) => setDietSettings({ ...dietSettings, showRecommendedFoods: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking & Progress */}
          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Progress Tracking
                </CardTitle>
                <CardDescription>Configure what data you want to track</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "enableProgressBars", label: "Enable Progress Bars", desc: "Show visual progress indicators" },
                  { key: "trackWeight", label: "Track Weight", desc: "Log and monitor weight changes" },
                  { key: "trackMeasurements", label: "Track Body Measurements", desc: "Log chest, waist, hips, etc." },
                  { key: "trackCaloriesBurned", label: "Track Calories Burned", desc: "Estimate workout calorie burn" },
                  { key: "showReports", label: "Show Weekly/Monthly Reports", desc: "Generate progress summaries" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={trackingSettings[item.key as keyof typeof trackingSettings] as boolean}
                      onCheckedChange={(checked) =>
                        setTrackingSettings({ ...trackingSettings, [item.key]: checked })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Control when and how you receive reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "workoutReminders", label: "Workout Reminders", desc: "Get notified for scheduled workouts" },
                  { key: "mealReminders", label: "Meal Reminders", desc: "Reminders to log your meals" },
                  { key: "waterReminders", label: "Water Reminders", desc: "Stay hydrated with regular reminders" },
                  { key: "restDayReminders", label: "Rest Day Reminders", desc: "Notifications on rest days" },
                  { key: "motivationNotifications", label: "Motivation Notifications", desc: "Daily motivation and tips" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, [item.key]: checked })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  App Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "light", icon: Sun, label: "Light" },
                      { value: "dark", icon: Moon, label: "Dark" },
                    ].map((theme) => (
                      <Button
                        key={theme.value}
                        variant={appPreferences.theme === theme.value ? "default" : "outline"}
                        className="flex-1 gap-2 min-h-[44px]"
                        onClick={() => setAppPreferences({ ...appPreferences, theme: theme.value as "light" | "dark" })}
                      >
                        <theme.icon className="h-4 w-4" />
                        {theme.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select
                    value={appPreferences.fontSize}
                    onValueChange={(value: any) => setAppPreferences({ ...appPreferences, fontSize: value })}
                  >
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={appPreferences.language}
                    onValueChange={(value) => setAppPreferences({ ...appPreferences, language: value })}
                  >
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {appPreferences.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <Label>Sound Effects</Label>
                  </div>
                  <Switch
                    checked={appPreferences.soundEnabled}
                    onCheckedChange={(checked) => setAppPreferences({ ...appPreferences, soundEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label>Vibration</Label>
                  </div>
                  <Switch
                    checked={appPreferences.vibrationEnabled}
                    onCheckedChange={(checked) => setAppPreferences({ ...appPreferences, vibrationEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Manage your data and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Visibility</Label>
                  <Select
                    value={privacySettings.dataVisibility}
                    onValueChange={(value: any) => setPrivacySettings({ ...privacySettings, dataVisibility: value })}
                  >
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <div className="space-y-0.5">
                      <Label>App Lock</Label>
                      <p className="text-sm text-muted-foreground">Require PIN/biometric to open</p>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.appLock}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, appLock: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    <div className="space-y-0.5">
                      <Label>Cloud Backup</Label>
                      <p className="text-sm text-muted-foreground">Automatically backup your data</p>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.cloudBackup}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, cloudBackup: checked })}
                  />
                </div>

                <Separator />

                <Button variant="destructive" className="gap-2 min-h-[44px]">
                  <Trash2 className="h-4 w-4" />
                  Delete All Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Smart Features */}
          <TabsContent value="smart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Smart Features
                </CardTitle>
                <CardDescription>AI-powered and advanced features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Coming Soon</Badge>
                    <span className="font-medium">AI Recommendations</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Get personalized AI-powered workout and nutrition suggestions</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Coming Soon</Badge>
                    <span className="font-medium">Adaptive Fitness Plans</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Plans that automatically adjust based on your progress</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Coming Soon</Badge>
                    <span className="font-medium">Wearable Integration</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Connect with Apple Health, Google Fit, and other devices</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Coming Soon</Badge>
                    <span className="font-medium">Injury-Safe Mode</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Automatically avoid exercises that may aggravate injuries</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-primary" />
                  System Settings
                </CardTitle>
                <CardDescription>App information and support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span>App Version</span>
                  </div>
                  <span className="text-muted-foreground">1.0.0</span>
                </div>

                <Button variant="outline" className="w-full justify-start gap-2 min-h-[48px]">
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </Button>

                <Button variant="outline" className="w-full justify-start gap-2 min-h-[48px]">
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </Button>

                <Button variant="outline" className="w-full justify-start gap-2 min-h-[48px]">
                  <HelpCircle className="h-4 w-4" />
                  Help & Support
                </Button>

                <Button variant="outline" className="w-full justify-start gap-2 min-h-[48px]">
                  <MessageSquare className="h-4 w-4" />
                  Send Feedback
                </Button>

                <Separator />

                <Button variant="outline" className="w-full justify-start gap-2 min-h-[48px]">
                  <Trash2 className="h-4 w-4" />
                  Clear Cache
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
