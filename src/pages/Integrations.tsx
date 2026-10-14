import { useEffect, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Heart, Flame, Moon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEVICES = [
  { id: "apple", name: "Apple Health", emoji: "🍎" },
  { id: "google", name: "Google Health Connect", emoji: "🟢" },
  { id: "garmin", name: "Garmin", emoji: "⌚" },
  { id: "whoop", name: "Whoop", emoji: "🔴" },
];

type State = Record<string, { on: boolean; last: number | null; syncing: boolean }>;
const init = (): State => {
  try { const s = localStorage.getItem("hk-devices"); if (s) return JSON.parse(s); } catch { /* ignore */ }
  return Object.fromEntries(DEVICES.map((d) => [d.id, { on: false, last: null, syncing: false }]));
};

const ago = (ts: number | null, now: number) => {
  if (!ts) return "Never synced";
  const m = Math.floor((now - ts) / 60000);
  return m < 1 ? "Synced just now" : m < 60 ? `Synced ${m} min ago` : `Synced ${Math.floor(m / 60)} h ago`;
};

const Integrations = () => {
  const [state, setState] = useState<State>(init);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(id); }, []);
  useEffect(() => localStorage.setItem("hk-devices", JSON.stringify(state)), [state]);

  const toggle = (id: string, on: boolean) => {
    setState((s) => ({ ...s, [id]: { ...s[id], on, syncing: on } }));
    if (on) setTimeout(() => {
      setState((s) => ({ ...s, [id]: { ...s[id], syncing: false, last: Date.now() } }));
      toast.success(`${DEVICES.find((d) => d.id === id)?.name} connected (demo data)`);
    }, 1500);
  };

  const connected = Object.values(state).filter((d) => d.on && !d.syncing).length;
  const metrics = [
    { label: "Heart Rate", value: connected ? "68 bpm" : "—", icon: Heart },
    { label: "Resting Calories", value: connected ? "1,640 kcal" : "—", icon: Flame },
    { label: "Sleep Score", value: connected ? "84 / 100" : "—", icon: Moon },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Devices" />
      <main className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <Card key={m.label} className="rounded-2xl transition-all hover:shadow-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><m.icon className="h-6 w-6 text-primary" /></div>
                <div><div className="text-xs text-muted-foreground">{m.label}</div><div className="text-xl font-bold">{m.value}</div></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {DEVICES.map((d) => {
            const s = state[d.id];
            return (
              <Card key={d.id} className={cn("rounded-2xl transition-all hover:-translate-y-0.5", s.on && "border-primary")}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="text-3xl">{d.emoji}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {s.syncing ? <><RefreshCw className="h-3 w-3 animate-spin" /> Syncing…</> : s.on ? <><span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> {ago(s.last, now)}</> : "Not connected"}
                    </div>
                  </div>
                  <Switch checked={s.on} onCheckedChange={(v) => toggle(d.id, v)} aria-label={`Connect ${d.name}`} />
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">Preview: device connections show sample data until official integrations launch.</p>
      </main>
    </div>
  );
};

export default Integrations;
