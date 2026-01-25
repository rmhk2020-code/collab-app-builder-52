import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2, Lock, KeyRound, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import healthKineticsLogo from "@/assets/health-kinetics-logo.png";

type Step = "email" | "code" | "newPassword" | "success";

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

const ResetPassword = () => {
  const navigate = useNavigate();
  const debug = new URLSearchParams(window.location.search).get("debug") === "1";
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugLastError, setDebugLastError] = useState<string | null>(null);
  const [debugLastResult, setDebugLastResult] = useState<any>(null);

  useEffect(() => {
    if (!debug) return;
    supabase.auth.getSession().then(({ data }) => {
      setDebugLastResult((prev: any) => ({
        ...(prev || {}),
        sessionUserId: data.session?.user?.id ?? null,
        origin: window.location.origin,
      }));
    });
  }, [debug]);

  const withTimeout = async <T,>(promise: Promise<T>, ms: number) => {
    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error("Request timed out")), ms);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugLastError(null);

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call edge function to send reset code
      const { data, error } = await withTimeout(
        supabase.functions.invoke("send-password-reset", {
          body: { email },
        }),
        15000
      );

      if (error) throw error;

      if (debug) {
        setDebugLastResult({ ok: true, data });
      }

      // Always proceed to code step - the server returns same message for security
      setStep("code");
      toast({
        title: "Check your email",
        description: "If an account exists with this email, a reset code has been sent.",
      });
    } catch (error: any) {
      if (debug) {
        setDebugLastError(error?.message || String(error));
        setDebugLastResult({ ok: false, error: error?.message || String(error) });
        toast({
          title: "Reset code debug error",
          description: error?.message || String(error),
          variant: "destructive",
        });
      }
      toast({
        title: "Request sent",
        description: "If an account exists with this email, a reset code has been sent.",
      });
      setStep("code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast({
        title: "Code required",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    // Move to password step - actual verification happens on submit
    setStep("newPassword");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugLastError(null);

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

    if (!isPasswordValid(newPassword)) {
      toast({
        title: "Password too weak",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update password using Supabase edge function
      const { data, error } = await withTimeout(
        supabase.functions.invoke("update-password", {
          body: { email, newPassword, code },
        }),
        15000
      );

      if (error) throw error;

      if (debug) {
        setDebugLastResult({ ok: true, data });
      }

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setStep("success");
      toast({
        title: "Password reset successful!",
        description: "You can now sign in with your new password.",
      });
    } catch (error: any) {
      if (debug) {
        setDebugLastError(error?.message || String(error));
        setDebugLastResult({ ok: false, error: error?.message || String(error) });
      }
      toast({
        title: "Failed to reset password",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(newPassword);

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-500' : 'text-muted-foreground'}`}>
      {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 min-h-[44px]"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full min-h-[48px] py-3 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>
        );

      case "code":
        return (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="pl-10 min-h-[44px] text-center text-lg tracking-widest"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Enter the code sent to {email}
            </p>
            <Button
              type="submit"
              className="w-full min-h-[48px] py-3 text-base"
              disabled={isLoading || code.length !== 6}
            >
              Verify Code
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => handleSendCode({ preventDefault: () => {} } as React.FormEvent)}
              disabled={isLoading}
            >
              Resend code
            </Button>
          </form>
        );

      case "newPassword":
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 min-h-[44px]"
                disabled={isLoading}
              />
            </div>
            
            {newPassword && (
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
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 min-h-[44px]"
                disabled={isLoading}
              />
            </div>

            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}

            <Button
              type="submit"
              className="w-full min-h-[48px] py-3 text-base"
              disabled={isLoading || !isPasswordValid(newPassword) || newPassword !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        );

      case "success":
        return (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <p className="text-foreground">
              Your password has been reset successfully!
            </p>
            <Button
              onClick={() => navigate("/auth")}
              className="w-full min-h-[48px] py-3 text-base"
            >
              Back to Sign In
            </Button>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (step) {
      case "email":
        return "Reset Password";
      case "code":
        return "Enter Code";
      case "newPassword":
        return "New Password";
      case "success":
        return "Password Reset!";
    }
  };

  const getDescription = () => {
    switch (step) {
      case "email":
        return "Enter your email to receive a password reset code";
      case "code":
        return "We sent a 6-digit code to your email";
      case "newPassword":
        return "Choose a strong password for your account";
      case "success":
        return "You can now sign in with your new password";
    }
  };

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
          <CardTitle className="text-2xl font-semibold">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {debug && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-left">
              <div className="text-xs font-semibold mb-1">Reset Debug (debug=1)</div>
              <div className="text-xs text-muted-foreground">
                <div><span className="font-medium">origin:</span> {window.location.origin}</div>
                <div><span className="font-medium">step:</span> {step}</div>
                {debugLastError && <div className="mt-1"><span className="font-medium">last error:</span> {debugLastError}</div>}
              </div>
              {debugLastResult && (
                <pre className="mt-2 text-[11px] leading-snug whitespace-pre-wrap break-words max-h-40 overflow-auto">
{JSON.stringify(debugLastResult, null, 2)}
                </pre>
              )}
            </div>
          )}

          {renderStep()}

          {step !== "success" && (
            <Button
              variant="ghost"
              className="w-full min-h-[44px] flex items-center justify-center gap-2"
              onClick={() => navigate("/auth")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
