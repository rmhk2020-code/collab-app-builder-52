import { useEffect, useRef, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, MessageCircle, Share2, Download, Trophy, Users } from "lucide-react";
import { useFitnessPlan } from "@/contexts/FitnessPlanContext";
import { useDisplayName } from "@/hooks/useDisplayName";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const db = supabase as any;
type DbPost = { id: string; user_id: string; author_name: string; content: string; created_at: string };
type DbComment = { id: string; post_id: string; author_name: string; content: string };
const ago = (d: string) => { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); return m < 1 ? "now" : m < 60 ? `${m}m` : m < 1440 ? `${Math.floor(m / 60)}h` : `${Math.floor(m / 1440)}d`; };
export const challengeDay = (joinedAt: string, days: number, now = new Date()) => Math.min(days, Math.max(0, Math.floor((now.getTime() - new Date(joinedAt).getTime()) / 86400000)));

type Post = { id: string; user: string; avatar: string; text: string; time: string; kudos: number; liked: boolean; comments: string[] };

const SEED: Post[] = [
  { id: "1", user: "Maya R.", avatar: "🧘‍♀️", text: "Finished a 45-min HIIT session — 520 kcal burned!", time: "12m", kudos: 24, liked: false, comments: ["Beast mode! 🔥"] },
  { id: "2", user: "Jordan K.", avatar: "🏃", text: "Unlocked the Early Bird badge 🌅 — 6 AM run done.", time: "38m", kudos: 17, liked: false, comments: [] },
  { id: "3", user: "Priya S.", avatar: "🥗", text: "Logged a quinoa power bowl: 32g protein, 480 kcal.", time: "1h", kudos: 9, liked: false, comments: ["Recipe please!"] },
  { id: "4", user: "Leo M.", avatar: "🏋️", text: "Day 12 of 30-Day Core Blitz complete 💪", time: "2h", kudos: 31, liked: false, comments: [] },
];

const CHALLENGES = [
  { id: "core", name: "30-Day Core Blitz", emoji: "🔥", days: 30, day: 12, members: 1284 },
  { id: "steps", name: "10,000 Steps Daily", emoji: "👟", days: 21, day: 5, members: 3920 },
  { id: "hydrate", name: "Hydration Hero", emoji: "💧", days: 14, day: 9, members: 812 },
  { id: "veg", name: "Plant-Power Week", emoji: "🥦", days: 7, day: 3, members: 640 },
];

const LEADERS = [
  { name: "Leo M.", points: 2840 }, { name: "Maya R.", points: 2615 }, { name: "Jordan K.", points: 2390 },
  { name: "Priya S.", points: 2104 }, { name: "Sam T.", points: 1987 },
];

const pop = () => {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.setValueAtTime(660, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.2);
  } catch { /* audio unavailable */ }
};

const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };

const Community = () => {
  const { exercisesCompletedThisWeek, caloriesEaten } = useFitnessPlan();
  const name = useDisplayName() || "You";
  const [posts, setPosts] = useState<Post[]>(() => load("hk-feed", SEED));
  const [joinedMap, setJoinedMap] = useState<Record<string, string>>(() => { const v = load<any>("hk-challenges-v2", {}); return Array.isArray(v) ? {} : v; });
  const joined = Object.keys(joinedMap);
  const [userId, setUserId] = useState<string | null>(null);
  const [newPost, setNewPost] = useState("");
  const [livePosts, setLivePosts] = useState<DbPost[]>([]);
  const [liveComments, setLiveComments] = useState<DbComment[]>([]);
  const [kudos, setKudos] = useState<{ post_id: string; user_id: string }[]>([]);
  const refresh = async () => {
    const [p, c, k] = await Promise.all([
      db.from("community_posts").select("*").order("created_at", { ascending: false }).limit(50),
      db.from("community_comments").select("*").order("created_at"),
      db.from("community_kudos").select("*"),
    ]);
    setLivePosts(p.data ?? []); setLiveComments(c.data ?? []); setKudos(k.data ?? []);
  };
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, []);
  const submitPost = async () => {
    if (!userId) return toast.error("Sign in to post.");
    if (!newPost.trim()) return;
    const { error } = await db.from("community_posts").insert({ user_id: userId, author_name: name, content: newPost.trim().slice(0, 1000) });
    if (error) return toast.error("Couldn't post. Try again.");
    setNewPost(""); refresh();
  };
  const toggleLiveKudos = async (postId: string) => {
    if (!userId) return toast.error("Sign in to give kudos.");
    const mine = kudos.some((k) => k.post_id === postId && k.user_id === userId);
    if (mine) await db.from("community_kudos").delete().eq("post_id", postId).eq("user_id", userId);
    else await db.from("community_kudos").insert({ post_id: postId, user_id: userId });
    pop(); refresh();
  };
  const addLiveComment = async (postId: string) => {
    if (!userId) return toast.error("Sign in to comment.");
    if (!draft.trim()) return;
    await db.from("community_comments").insert({ post_id: postId, user_id: userId, author_name: name, content: draft.trim().slice(0, 500) });
    setDraft(""); refresh();
  };
  const deletePost = async (postId: string) => { await db.from("community_posts").delete().eq("id", postId); refresh(); };
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => localStorage.setItem("hk-feed", JSON.stringify(posts)), [posts]);
  useEffect(() => localStorage.setItem("hk-challenges-v2", JSON.stringify(joinedMap)), [joinedMap]);

  const toggleKudos = (id: string) => {
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, liked: !p.liked, kudos: p.kudos + (p.liked ? -1 : 1) } : p)));
    pop();
  };
  const addComment = (id: string) => {
    if (!draft.trim()) return;
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, comments: [...p.comments, draft.trim()] } : p)));
    setDraft("");
  };

  const leaders = [...LEADERS, { name: `${name} (you)`, points: 1500 + exercisesCompletedThisWeek * 120 }].sort((a, b) => b.points - a.points);

  useEffect(() => {
    if (!shareOpen) return;
    const t = setTimeout(() => {
      const c = canvasRef.current; if (!c) return;
      const x = c.getContext("2d")!; const W = 540, H = 960;
      const css = getComputedStyle(document.documentElement);
      const primary = `hsl(${css.getPropertyValue("--primary").trim()})`;
      const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, primary); g.addColorStop(1, "#0b1020");
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = "#fff"; x.textAlign = "center";
      x.font = "bold 30px system-ui"; x.fillText("HEALTH KINETICS", W / 2, 90);
      x.font = "120px system-ui"; x.fillText("🏆", W / 2, 300);
      x.font = "bold 56px system-ui"; x.fillText("Workout", W / 2, 420); x.fillText("Complete!", W / 2, 485);
      x.font = "28px system-ui"; x.fillText(name, W / 2, 560);
      x.font = "bold 72px system-ui"; x.fillText(String(exercisesCompletedThisWeek), W / 3, 720); x.fillText(String(caloriesEaten), (2 * W) / 3, 720);
      x.font = "22px system-ui"; x.fillText("workouts this week", W / 3, 760); x.fillText("kcal logged today", (2 * W) / 3, 760);
      x.font = "20px system-ui"; x.fillText("healthkinetics.app", W / 2, 900);
    }, 50);
    return () => clearTimeout(t);
  }, [shareOpen, name, exercisesCompletedThisWeek, caloriesEaten]);

  const download = () => {
    const a = document.createElement("a");
    a.href = canvasRef.current!.toDataURL("image/png"); a.download = "health-kinetics-workout.png"; a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Community" />
      <main className="container mx-auto max-w-6xl px-4 py-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> Activity Feed</h2>
          <Card className="rounded-2xl">
            <CardContent className="p-4 space-y-2">
              <Textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} maxLength={1000} placeholder="Share a workout, a meal, or a win..." />
              <div className="flex justify-end"><Button onClick={submitPost} className="min-h-[44px]">Post</Button></div>
            </CardContent>
          </Card>
          {livePosts.map((p) => {
            const count = kudos.filter((k) => k.post_id === p.id).length;
            const liked = kudos.some((k) => k.post_id === p.id && k.user_id === userId);
            const cs = liveComments.filter((c) => c.post_id === p.id);
            return (
              <Card key={p.id} className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex justify-between"><b>{p.author_name}</b><span className="text-xs text-muted-foreground">{ago(p.created_at)}</span></div>
                  <p className="text-sm mt-1 whitespace-pre-wrap break-words">{p.content}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => toggleLiveKudos(p.id)} className="min-h-[40px]">
                      <Heart className={cn("h-4 w-4 mr-1", liked && "fill-destructive text-destructive")} /> {count} Kudos
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setOpenComments(openComments === p.id ? null : p.id)} className="min-h-[40px]">
                      <MessageCircle className="h-4 w-4 mr-1" /> {cs.length}
                    </Button>
                    {p.user_id === userId && <Button variant="ghost" size="sm" onClick={() => deletePost(p.id)} className="min-h-[40px] ml-auto">Delete</Button>}
                  </div>
                  {openComments === p.id && (
                    <div className="mt-2 space-y-2">
                      {cs.map((c) => <div key={c.id} className="text-sm bg-muted rounded-lg px-3 py-2"><b>{c.author_name}:</b> {c.content}</div>)}
                      <form onSubmit={(e) => { e.preventDefault(); addLiveComment(p.id); }} className="flex gap-2">
                        <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={500} placeholder="Write a comment..." />
                        <Button type="submit">Post</Button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {posts.map((p) => (
            <Card key={p.id} className="rounded-2xl transition-all hover:shadow-lg hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="h-11 w-11 rounded-full bg-accent flex items-center justify-center text-2xl">{p.avatar}</div>
                  <div className="flex-1">
                    <div className="flex justify-between"><b>{p.user}</b><span className="text-xs text-muted-foreground">{p.time}</span></div>
                    <p className="text-sm mt-1">{p.text}</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm" onClick={() => toggleKudos(p.id)} className="min-h-[40px]">
                        <Heart className={cn("h-4 w-4 mr-1 transition-transform", p.liked && "fill-destructive text-destructive scale-125")} /> {p.kudos} Kudos
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setOpenComments(openComments === p.id ? null : p.id)} className="min-h-[40px]">
                        <MessageCircle className="h-4 w-4 mr-1" /> {p.comments.length}
                      </Button>
                    </div>
                    {openComments === p.id && (
                      <div className="mt-2 space-y-2">
                        {p.comments.map((c, i) => <div key={i} className="text-sm bg-muted rounded-lg px-3 py-2">{c}</div>)}
                        <form onSubmit={(e) => { e.preventDefault(); addComment(p.id); }} className="flex gap-2">
                          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a comment..." />
                          <Button type="submit">Post</Button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <aside className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="h-6 w-6 text-primary" /> Challenges</h2>
          <div className="grid gap-3">
            {CHALLENGES.map((c) => {
              const isIn = joined.includes(c.id);
              const day = isIn ? challengeDay(joinedMap[c.id], c.days) : 0;
              return (
                <Card key={c.id} className="rounded-2xl transition-all hover:shadow-md">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center"><b>{c.emoji} {c.name}</b><span className="text-xs text-muted-foreground">{(c.members + (isIn ? 1 : 0)).toLocaleString()} joined</span></div>
                    {isIn && <><Progress value={(day / c.days) * 100} className="h-2" /><div className="text-xs text-muted-foreground">Day {day} of {c.days}</div></>}
                    <Button size="sm" variant={isIn ? "secondary" : "default"} className="w-full min-h-[40px]"
                      onClick={() => setJoinedMap((m) => { const n = { ...m }; if (isIn) delete n[c.id]; else n[c.id] = new Date().toISOString(); return n; })}>
                      {isIn ? "Joined ✓ (tap to leave)" : "Join Challenge"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <b>Live Leaderboard</b>
              <ol className="mt-3 space-y-2">
                {leaders.map((l, i) => (
                  <li key={l.name} className={cn("flex justify-between text-sm rounded-lg px-2 py-1", l.name.includes("(you)") && "bg-primary/10 font-semibold")}>
                    <span>{["🥇", "🥈", "🥉"][i] ?? `${i + 1}.`} {l.name}</span><span>{l.points.toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </aside>
      </main>

      <Button onClick={() => setShareOpen(true)} className="fixed bottom-24 right-6 z-50 rounded-full min-h-[52px] px-5 shadow-xl">
        <Share2 className="h-5 w-5 mr-2" /> Share Progress
      </Button>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Your Story Card</DialogTitle></DialogHeader>
          <canvas ref={canvasRef} width={540} height={960} className="w-full rounded-xl" />
          <Button onClick={download} className="w-full"><Download className="h-4 w-4 mr-2" /> Download</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
