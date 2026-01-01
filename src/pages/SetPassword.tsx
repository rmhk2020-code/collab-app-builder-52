import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2, Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import healthKineticsLogo from "@/assets/health-kinetics-logo.png";

// Password validation helper
const validatePassword = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

const isPasswordValid = (password: string) => {
  const validation = validatePassword(password);
  return Object.values(validation).every(Boolean);
};

const SetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated and came from OAuth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        // Not authenticated, redirect to auth
        navigate("/auth");
        return;
      }

      // Check if user signed up via OAuth (no password set)
      const provider = session.user.app_metadata?.provider;
      if (provider === "email") {
        // User already has email/password, redirect to appropriate page
        navigate("/onboarding");
        return;
      }

      setUserEmail(session.user.email || null);
    });
  }, [navigate]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        title: "Password required",
        description: "Please enter and confirm your password.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordValid(password)) {
      toast({
        title: "Password too weak",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update user's password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast({
        title: "Password set successfully!",
        description: "You can now sign in with your email and password.",
      });

      // Check if user has completed onboarding
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('fitness_plan')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profile?.fitness_plan) {
          navigate("/home");
        } else {
          navigate("/onboarding");
        }
      }
    } catch (error: any) {
      toast({
        title: "Failed to set password",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = async () => {
    // Sign out and go back to auth page
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const passwordValidation = validatePassword(password);

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-500' : 'text-muted-foreground'}`}>
      {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background animate-fade-in">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={healthKineticsLogo}
              alt="Health Kinetics"
              className="h-24 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-semibold">Set Your Password</CardTitle>
          <CardDescription>
            Create a password to secure your account
            {userEmail && <span className="block mt-1 text-primary">{userEmail}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 min-h-[44px]"
                disabled={isLoading}
              />
            </div>

            {password && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Password requirements:</p>
                <PasswordRequirement met={passwordValidation.minLength} text="At least 8 characters" />
                <PasswordRequirement met={passwordValidation.hasUppercase} text="One uppercase letter" />
                <PasswordRequirement met={passwordValidation.hasLowercase} text="One lowercase letter" />
                <PasswordRequirement met={passwordValidation.hasNumber} text="One number" />
                <PasswordRequirement met={passwordValidation.hasSpecial} text="One special character" />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 min-h-[44px]"
                disabled={isLoading}
              />
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}

            <Button
              type="submit"
              className="w-full min-h-[48px] py-3 text-base"
              disabled={isLoading || !isPasswordValid(password) || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting password...
                </>
              ) : (
                <>
                  Set Password & Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <Button
            variant="ghost"
            className="w-full min-h-[44px] text-muted-foreground gap-2"
            onClick={handleBackToSignIn}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetPassword;
