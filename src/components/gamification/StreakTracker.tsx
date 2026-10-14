import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import { computeBadges, computeStreak, levelFor } from "@/lib/gamification";
import { cn } from "@/lib/utils";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const StreakTracker = () => {
  const { exerciseLogs, foodLogs } = useFitnessPlan();
  const [badgesOpen, setBadgesOpen] = useState(false);
  const allLogs = [...exerciseLogs, ...foodLogs];
  const streak = computeStreak(allLogs);
  const xp = exerciseLogs.length * 10 + foodLogs.length * 5;
  const lvl = levelFor(xp);
  const badges = computeBadges(exerciseLogs, foodLogs, streak);

  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    const active = allLogs.some((l) => new Date(l.timestamp).toDateString() === d.toDateString());
    return { label: DAYS[i], active, isToday: d.toDateString() === today.toDateString() };
  });

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1 rounded-full border border-border bg-card px-3 min-h-[40px] text-sm font-semibold transition-transform hover:scale-105">
            <span className={cn(streak > 0 && "animate-pulse")}>🔥</span>
            <span>{streak}<span className="hidden sm:inline">-Day Streak</span></span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground">Level {lvl.level}</div>
              <div className="font-bold">{lvl.title}</div>
              <Progress value={lvl.progress} className="mt-2 h-2" />
              <div className="text-xs text-muted-foreground mt-1">{xp} XP total</div>
            </div>
            <div>
              <div className="text-xs font-semibold mb-2">This week</div>
              <div className="flex justify-between">
                {week.map((d, i) => (
                  <div key={i} className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs border", d.active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground", d.isToday && "ring-2 ring-ring")}>
                    {d.active ? "🔥" : d.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs">
              Unlocked rewards: <b>{badges.filter((b) => b.unlocked).length}/{badges.length}</b>
            </div>
            <Button size="sm" className="w-full" onClick={() => setBadgesOpen(true)}>View badges</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={badgesOpen} onOpenChange={setBadgesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Your Badges</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.id} className={cn("rounded-xl border p-3 text-center transition-all hover:-translate-y-0.5", b.unlocked ? "border-primary bg-primary/10" : "border-border opacity-50 grayscale")}>
                <div className="text-3xl">{b.unlocked ? b.emoji : "🔒"}</div>
                <div className="font-semibold text-sm mt-1">{b.name}</div>
                <div className="text-xs text-muted-foreground">{b.description}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StreakTracker;
