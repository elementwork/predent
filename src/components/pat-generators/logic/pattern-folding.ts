import type { PRNG } from "@/lib/prng";

/**
 * Net of a cross cube net. Index order:
 *   0 = front, 1 = top, 2 = bottom, 3 = left, 4 = right, 5 = back.
 * The three faces visible in an isometric drawing are top (1), left (3),
 * right (4).
 * Cell marks: "" = blank, "#" = shaded, otherwise a symbol.
 */
export interface PatternFoldingProblem {
  net: string[];
  /** Each option is the marking string of the visible faces: "top|left|right". */
  options: string[];
  correctIndex: number;
}

export const PATTERN_FOLDING_OPTION_COUNT = 4;
const SYMBOLS = ["●", "■", "▲", "★", "♦", "○"];

function pickMark(random: PRNG): string {
  if (random() < 0.4) return "#";
  return SYMBOLS[Math.floor(random() * SYMBOLS.length)]!;
}

function pickMarkDistinct(random: PRNG, taken: string[]): string {
  let mark = pickMark(random);
  let guard = 0;
  while (taken.includes(mark) && guard++ < 10) {
    mark = pickMark(random);
  }
  return mark;
}

function generateNet(random: PRNG, difficulty: "easy" | "medium" | "hard"): string[] {
  const net: string[] = Array(6).fill("");

  // Always mark the top and left faces so the visible permutations are distinct.
  net[1] = pickMarkDistinct(random, []);
  net[3] = pickMarkDistinct(random, [net[1]]);

  if (difficulty === "medium" || difficulty === "hard") {
    // A third mark on a visible face (right) makes ranking harder.
    if (random() < 0.75) net[4] = pickMarkDistinct(random, [net[1], net[3]]);
  }
  if (difficulty === "hard") {
    // Mark a hidden face so it can appear on the net without showing folded.
    const hidden = random() < 0.5 ? 0 : random() < 0.5 ? 2 : 5;
    net[hidden] = pickMarkDistinct(random, [net[1], net[3], net[4]].filter(Boolean));
  }
  return net;
}

function encodeVisible(t: string, l: string, r: string): string {
  return `${t ?? ""}|${l ?? ""}|${r ?? ""}`;
}

export function generatePatternFoldingProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): PatternFoldingProblem {
  const net = generateNet(random, difficulty);

  const visible = [net[1], net[3], net[4]] as const;
  const correctStr = encodeVisible(visible[0], visible[1], visible[2]);

  // Wrong permutations of the three visible faces.
  const permutations: number[][] = [
    [2, 1, 0],
    [1, 2, 0],
    [2, 0, 1],
  ];
  const tagged: { opt: string; isCorrect: boolean }[] = [
    { opt: correctStr, isCorrect: true },
  ];
  const seen = new Set<string>([correctStr]);
  for (const perm of permutations) {
    const str = encodeVisible(
      visible[perm[0]!]!,
      visible[perm[1]!]!,
      visible[perm[2]!]!
    );
    if (!seen.has(str)) {
      seen.add(str);
      tagged.push({ opt: str, isCorrect: false });
    }
    if (tagged.length >= PATTERN_FOLDING_OPTION_COUNT) break;
  }

  // Pad with a swap variant if any permutation collided.
  let guard = 0;
  while (tagged.length < PATTERN_FOLDING_OPTION_COUNT && guard++ < 20) {
    const str = encodeVisible(visible[1], visible[0], visible[2]);
    if (!seen.has(str)) {
      seen.add(str);
      tagged.push({ opt: str, isCorrect: false });
    }
  }

  for (let i = tagged.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [tagged[i], tagged[j]] = [tagged[j]!, tagged[i]!];
  }

  const options = tagged.map(t => t.opt);
  const correctIndex = tagged.findIndex(t => t.isCorrect);
  return { net, options, correctIndex };
}