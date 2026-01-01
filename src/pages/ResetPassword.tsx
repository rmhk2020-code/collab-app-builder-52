import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2, Lock, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import healthKineticsLogo from "@/assets/health-kinetics-logo.png";

type Step = "email" | "code" | "newPassword" | "success";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const { data, error } = await supabase.functions.invoke("send-password-reset", {
        body: { email },
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

      // Store the code for verification (in production, this would be handled server-side)
      setGeneratedCode(data.code);
      setStep("code");
      toast({
        title: "Code sent!",
        description: "Check your email for the password reset code.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send code",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      toast({
        title: "Code required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    if (code !== generatedCode) {
      toast({
        title: "Invalid code",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setStep("newPassword");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setIsLoading(true);

    try {
      // Update password using Supabase edge function
      const { data, error } = await supabase.functions.invoke("update-password", {
        body: { email, newPassword, code: generatedCode },
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

      setStep("success");
      toast({
        title: "Password reset successful!",
        description: "You can now sign in with your new password.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to reset password",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                onChange={(e) => setCode(e.target.value)}
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
              disabled={isLoading}
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
            <Button
              type="submit"
              className="w-full min-h-[48px] py-3 text-base"
              disabled={isLoading}
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
        return "Choose a new password for your account";
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
