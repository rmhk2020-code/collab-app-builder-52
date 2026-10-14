export type LogLike = { timestamp: Date | string };

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Consecutive active days ending today (or yesterday, so a streak isn't lost before you log today). */
export function computeStreak(logs: LogLike[], now = new Date()): number {
  const days = new Set(logs.map((l) => dayKey(new Date(l.timestamp))));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const LEVELS = ["Kinetic Rookie", "Kinetic Mover", "Kinetic Builder", "Kinetic Athlete", "Kinetic Pro", "Kinetic Elite", "Kinetic Legend"];
export const XP_PER_LEVEL = 100;

export function levelFor(xp: number) {
  const idx = Math.min(Math.floor(xp / XP_PER_LEVEL), LEVELS.length - 1);
  return { level: idx + 1, title: LEVELS[idx], progress: idx === LEVELS.length - 1 ? 100 : xp % XP_PER_LEVEL };
}

export type Badge = { id: string; name: string; emoji: string; description: string; unlocked: boolean };

export function computeBadges(exerciseLogs: LogLike[], foodLogs: LogLike[], streak: number): Badge[] {
  const early = exerciseLogs.some((l) => new Date(l.timestamp).getHours() < 8);
  return [
    { id: "first", name: "First Rep", emoji: "💪", description: "Log your first exercise", unlocked: exerciseLogs.length >= 1 },
    { id: "early", name: "Early Bird", emoji: "🌅", description: "Work out before 8 AM", unlocked: early },
    { id: "streak7", name: "On Fire", emoji: "🔥", description: "Reach a 7-day streak", unlocked: streak >= 7 },
    { id: "macro", name: "Macro Master", emoji: "🥗", description: "Log 25 meals", unlocked: foodLogs.length >= 25 },
    { id: "century", name: "Century Club", emoji: "💯", description: "Complete 100 exercises", unlocked: exerciseLogs.length >= 100 },
    { id: "streak30", name: "Unstoppable", emoji: "🏆", description: "Reach a 30-day streak", unlocked: streak >= 30 },
  ];
}
