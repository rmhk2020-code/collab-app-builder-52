import { describe, it, expect } from "vitest";
import { computeStreak, levelFor } from "./gamification";

const daysAgo = (n: number) => { const d = new Date(2026, 9, 14, 12); d.setDate(d.getDate() - n); return d; };
const now = new Date(2026, 9, 14, 18);

describe("streak", () => {
  it("counts consecutive days including today", () => {
    expect(computeStreak([daysAgo(0), daysAgo(1), daysAgo(2)].map((timestamp) => ({ timestamp })), now)).toBe(3);
  });
  it("keeps streak if today not logged yet", () => {
    expect(computeStreak([daysAgo(1), daysAgo(2)].map((timestamp) => ({ timestamp })), now)).toBe(2);
  });
  it("breaks on a gap", () => {
    expect(computeStreak([daysAgo(0), daysAgo(2)].map((timestamp) => ({ timestamp })), now)).toBe(1);
  });
});

describe("level", () => {
  it("350 XP is level 4 Kinetic Athlete", () => {
    expect(levelFor(350)).toMatchObject({ level: 4, title: "Kinetic Athlete", progress: 50 });
  });
});
