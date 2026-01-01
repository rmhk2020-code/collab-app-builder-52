import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, User } from "lucide-react";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import healthKineticsLogo from "@/assets/health-kinetics-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const { setIsGuest, fitnessPlan } = useFitnessPlan();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGuest(false);
    
    // Existing users with a fitness plan go directly to home
    // New users go to onboarding
    if (isSignUp) {
      // New user - go to onboarding
      navigate("/onboarding");
    } else {
      // Existing user - check if they have a plan
      if (fitnessPlan) {
        navigate("/home");
      } else {
        // No plan yet, show onboarding
        navigate("/onboarding");
      }
    }
  };

  const handleGoogleLogin = () => {
    setIsGuest(false);
    // Check if existing user has a plan
    if (fitnessPlan) {
      navigate("/home");
    } else {
      navigate("/onboarding");
    }
  };

  const handleAppleLogin = () => {
    setIsGuest(false);
    // Check if existing user has a plan
    if (fitnessPlan) {
      navigate("/home");
    } else {
      navigate("/onboarding");
    }
  };

  const handleGuestContinue = () => {
    setIsGuest(true);
    navigate("/onboarding");
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
          <CardTitle className="text-2xl font-semibold">
            {isSignUp ? "Create Your Account" : "Welcome to Health Kinetics"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Sign up to save your personalized fitness plan" 
              : "Sign in to access your fitness journey"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Social Login Buttons */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full flex items-center gap-3 min-h-[48px] py-3 text-base active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            onClick={handleAppleLogin}
            variant="outline"
            className="w-full flex items-center gap-3 min-h-[48px] py-3 text-base active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Continue with Apple
          </Button>

          <div className="relative">
            <Separator className="my-4" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              or
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 min-h-[44px]"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 min-h-[44px]"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 min-h-[44px]"
              />
            </div>
            <Button type="submit" className="w-full min-h-[48px] py-3 text-base active:scale-[0.98] transition-transform">
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <Button
            variant="link"
            className="w-full min-h-[44px] text-base"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp 
              ? "Already have an account? Sign in" 
              : "Don't have an account? Sign up"
            }
          </Button>

          <Separator className="my-4" />

          <Button
            onClick={handleGuestContinue}
            variant="ghost"
            className="w-full min-h-[48px] py-3 text-muted-foreground text-base active:scale-[0.98] transition-transform"
          >
            Continue as Guest for a preview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
