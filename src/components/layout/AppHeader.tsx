import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dumbbell, Apple, Target, Zap, Activity, Settings, Menu } from "lucide-react";
import healthKineticsLogo from "@/assets/health-kinetics-logo.png";

interface AppHeaderProps {
  title?: string;
  showTitle?: boolean;
}

const AppHeader = ({ title, showTitle = true }: AppHeaderProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto max-w-6xl px-4 py-3 flex justify-between items-center">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <div className="flex items-center gap-3">
                <img 
                  src={healthKineticsLogo} 
                  alt="Health Kinetics Logo" 
                  className="w-12 h-12 object-contain"
                />
                <SheetTitle className="text-left">Menu</SheetTitle>
              </div>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-2">
              <Link to="/home" onClick={() => setSheetOpen(false)}>
                <Button variant="ghost" className="w-full justify-start min-h-[44px]">
                  <Target className="h-5 w-5 mr-3" />
                  Fitness Goal
                </Button>
              </Link>
              <Link to="/exercises" onClick={() => setSheetOpen(false)}>
                <Button variant="ghost" className="w-full justify-start min-h-[44px]">
                  <Dumbbell className="h-5 w-5 mr-3" />
                  Exercises
                </Button>
              </Link>
              <Link to="/nutrition" onClick={() => setSheetOpen(false)}>
                <Button variant="ghost" className="w-full justify-start min-h-[44px]">
                  <Apple className="h-5 w-5 mr-3" />
                  Nutrition
                </Button>
              </Link>
              <Link to="/health" onClick={() => setSheetOpen(false)}>
                <Button variant="ghost" className="w-full justify-start min-h-[44px]">
                  <Activity className="h-5 w-5 mr-3" />
                  Vitals
                </Button>
              </Link>
              <Link to="/home?section=what-we-offer" onClick={() => setSheetOpen(false)}>
                <Button variant="ghost" className="w-full justify-start min-h-[44px]">
                  <Zap className="h-5 w-5 mr-3" />
                  What Do We Offer
                </Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {showTitle && (
          title ? (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          ) : (
            <img 
              src={healthKineticsLogo} 
              alt="Health Kinetics" 
              className="h-10 object-contain"
            />
          )
        )}

        <Link to="/settings">
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default AppHeader;
