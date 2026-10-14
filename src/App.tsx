// App component with providers
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FitnessPlanProvider } from "@/contexts/FitnessPlanContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { HealthVitalsProvider } from "@/contexts/HealthVitalsContext";
import { TranslationProvider } from "@/i18n/TranslationContext";
import { UserDataSync } from "@/components/UserDataSync";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import Home from "./pages/Home";
import Exercises from "./pages/Exercises";
import Nutrition from "./pages/Nutrition";
import Settings from "./pages/Settings";
import Health from "./pages/Health";
import NotFound from "./pages/NotFound";
import Community from "./pages/Community";
import AiTools from "./pages/AiTools";
import Integrations from "./pages/Integrations";
import { SettingsApplier } from "@/components/SettingsApplier";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TranslationProvider>
        <HealthVitalsProvider>
          <FitnessPlanProvider>
            <TooltipProvider>
              <UserDataSync />
              <SettingsApplier />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Auth />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/set-password" element={<SetPassword />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/exercises" element={<Exercises />} />
                  <Route path="/nutrition" element={<Nutrition />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/health" element={<Health />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/ai-tools" element={<AiTools />} />
                  <Route path="/integrations" element={<Integrations />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </FitnessPlanProvider>
        </HealthVitalsProvider>
      </TranslationProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
