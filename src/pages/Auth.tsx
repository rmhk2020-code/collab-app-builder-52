import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, User, Loader2, ArrowRight, Dumbbell, Apple, Smartphone, Watch } from "lucide-react";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import healthKineticsLogo from "@/assets/health-kinetics-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const { setIsGuest } = useFitnessPlan();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const checkUserOnboardingStatus = async (userId: string) => {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('fitness_plan')
      .eq('user_id', userId)
      .single();
    
    return profile?.fitness_plan !== null && profile?.fitness_plan !== undefined;
  };

  const checkIfNeedsPassword = (user: any): boolean => {
    // Check if user signed up via OAuth and might not have a password
    const provider = user.app_metadata?.provider;
    const providers = user.app_metadata?.providers || [];
    
    // If signed in via OAuth (not email), they might need to set a password
    return provider !== "email" && !providers.includes("email");
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsGuest(false);
        setTimeout(() => {
          // Check if OAuth user needs to set password
          if (event === "SIGNED_IN" && checkIfNeedsPassword(session.user)) {
            navigate("/set-password");
            return;
          }
          
          checkUserOnboardingStatus(session.user.id).then((hasCompletedOnboardingInDB) => {
            if (hasCompletedOnboardingInDB) {
              navigate("/home");
            } else {
              navigate("/onboarding");
            }
          });
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsGuest(false);
        checkUserOnboardingStatus(session.user.id).then((hasCompletedOnboardingInDB) => {
          if (hasCompletedOnboardingInDB) {
            navigate("/home");
          } else {
            navigate("/onboarding");
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, setIsGuest]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Password validation for signup
    if (isSignUp && password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              name: name || undefined,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
            setIsSignUp(false);
          } else {
            throw error;
          }
        } else if (signUpData.user) {
          // Check if account already exists (identities will be empty)
          if (signUpData.user.identities && signUpData.user.identities.length === 0) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
            setIsSignUp(false);
          } else if (!signUpData.session) {
            // New signup but email confirmation required
            toast({
              title: "Check your email",
              description: "We've sent you a confirmation link. Please check your email to verify your account.",
            });
          } else {
            // New signup with active session - proceed
            // Send welcome email (don't block signup flow)
            supabase.functions.invoke("send-welcome-email", {
              body: { email, name: name || undefined },
            }).catch((emailError) => {
              console.error("Failed to send welcome email:", emailError);
            });

            toast({
              title: "Account created!",
              description: "Welcome to Health Kinetics! Let's set up your fitness plan.",
            });
            setIsGuest(false);
            navigate("/onboarding");
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login")) {
            toast({
              title: "Invalid credentials",
              description: "Email or password is incorrect. Please try again.",
              variant: "destructive",
            });
          } else if (error.message.includes("Email not confirmed")) {
            toast({
              title: "Email not confirmed",
              description: "Please check your email and click the confirmation link before signing in.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          setIsGuest(false);
          const hasCompletedOnboardingInDB = await checkUserOnboardingStatus(data.user.id);
          if (hasCompletedOnboardingInDB) {
            navigate("/home");
          } else {
            navigate("/onboarding");
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google sign-in failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Apple sign-in failed",
        description: error.message || "Could not sign in with Apple. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    setIsGuest(true);
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen flex bg-zinc-950 text-white animate-fade-in">
      {/* Left Side - Feature Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-12 xl:px-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-emerald-600/10" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-xl">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={healthKineticsLogo} 
              alt="Health Kinetics" 
              className="h-16 object-contain"
            />
          </div>

          {/* Main headline */}
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Track & Plan{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              a Lifestyle
            </span>
          </h1>
          
          <p className="text-lg xl:text-xl text-zinc-400 mb-10 leading-relaxed">
            Plan workouts, access elite plans, use personalized metrics, and connect with a supportive community
          </p>

          {/* App Store Badges */}
          <div className="flex gap-4 mb-12">
            <button className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-5 py-3 transition-all duration-300 hover:scale-105">
              <Apple className="w-7 h-7" />
              <div className="text-left">
                <div className="text-[10px] text-zinc-400">Download on the</div>
                <div className="text-sm font-semibold">App Store</div>
              </div>
            </button>
            <button className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-5 py-3 transition-all duration-300 hover:scale-105">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] text-zinc-400">GET IT ON</div>
                <div className="text-sm font-semibold">Google Play</div>
              </div>
            </button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm">Smart Workouts</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm">AI Nutrition</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Watch className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm">Watch Sync</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-sm">Progress Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center px-6 py-12 bg-zinc-900/50 backdrop-blur-sm">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <img 
              src={healthKineticsLogo} 
              alt="Health Kinetics" 
              className="h-20 object-contain"
            />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl xl:text-3xl font-bold mb-2">
              {isSignUp ? "Create Your Account" : "Welcome Back"}
            </h2>
            <p className="text-zinc-400">
              {isSignUp 
                ? "Sign up to save your personalized fitness plan" 
                : "Sign in to access your fitness journey"
              }
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              disabled={isLoading}
              className="w-full flex items-center gap-3 min-h-[52px] py-3 text-base bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              onClick={handleAppleLogin}
              variant="outline"
              disabled={isLoading}
              className="w-full flex items-center gap-3 min-h-[52px] py-3 text-base bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              )}
              Continue with Apple
            </Button>
          </div>

          <div className="relative">
            <Separator className="bg-white/10" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 px-4 text-sm text-zinc-500">
              or continue with email
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12 min-h-[52px] bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  disabled={isLoading}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 min-h-[52px] bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 min-h-[52px] bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                disabled={isLoading}
              />
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-zinc-400 hover:text-blue-400 p-0 h-auto"
                  onClick={() => navigate("/reset-password")}
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full min-h-[52px] py-3 text-base bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  {isSignUp ? "Get Started" : "Sign In"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              className="text-zinc-400 hover:text-white"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>

          <Separator className="bg-white/10" />

          <Button
            onClick={handleGuestContinue}
            variant="ghost"
            className="w-full min-h-[48px] py-3 text-zinc-400 hover:text-white hover:bg-white/5 text-base transition-all duration-300"
            disabled={isLoading}
          >
            Continue as Guest for a preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
