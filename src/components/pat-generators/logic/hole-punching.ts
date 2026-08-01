import type { PRNG } from "@/lib/prng";

export type Fold = "horizontal" | "vertical" | "diagonal";

export interface Punch {
  x: number;
  y: number;
}

export interface FoldProblem {
  fold: Fold;
  folds: number;
  punch: Punch;
}

export interface HolePunchingProblem {
  foldProblem: FoldProblem;
  correctHoles: Punch[];
  options: Punch[][];
  correctIndex: number;
}

function generateFoldProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): FoldProblem {
  const folds = difficulty === "easy" ? 1 : 2;
  const foldOptions: Fold[] = ["horizontal", "vertical"];
  if (difficulty === "hard") foldOptions.push("diagonal");
  const fold = foldOptions[Math.floor(random() * foldOptions.length)]!;

  const margin = 0.2;
  const punch: Punch = {
    x: Number((random() * (1 - 2 * margin) + margin).toFixed(2)),
    y: Number((random() * (1 - 2 * margin) + margin).toFixed(2)),
  };

  return { fold, folds, punch };
}

function getHolePositions(problem: FoldProblem): Punch[] {
  const { fold, folds, punch } = problem;
  const holes: Punch[] = [punch];

  if (fold === "horizontal") {
    holes.push({ x: punch.x, y: 1 - punch.y });
    if (folds === 2) {
      holes.push({ x: 1 - punch.x, y: punch.y });
      holes.push({ x: 1 - punch.x, y: 1 - punch.y });
    }
  } else if (fold === "vertical") {
    holes.push({ x: 1 - punch.x, y: punch.y });
    if (folds === 2) {
      holes.push({ x: punch.x, y: 1 - punch.y });
      holes.push({ x: 1 - punch.x, y: 1 - punch.y });
    }
  } else {
    holes.push({ x: punch.y, y: punch.x });
    if (folds === 2) {
      holes.push({ x: 1 - punch.x, y: 1 - punch.y });
      holes.push({ x: 1 - punch.y, y: 1 - punch.x });
    }
  }

  const seen = new Set<string>();
  return holes.filter(h => {
    const key = `${h.x.toFixed(3)},${h.y.toFixed(3)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generateOptions(correctHoles: Punch[]): {
  options: Punch[][];
  correctIndex: number;
} {
  const tagged: { holes: Punch[]; isCorrect: boolean }[] = [
    { holes: correctHoles, isCorrect: true },
  ];
  if (correctHoles.length > 1) {
    tagged.push({
      holes: correctHoles.slice(0, correctHoles.length - 1),
      isCorrect: false,
    });
  } else {
    tagged.push({ holes: [{ x: 0.5, y: 0.5 }], isCorrect: false });
  }
  tagged.push({
    holes: correctHoles.map(h => ({ x: 1 - h.x, y: 1 - h.y })),
    isCorrect: false,
  });
  tagged.push({
    holes: correctHoles.map(h => ({
      x: Math.min(0.9, h.x + 0.15),
      y: Math.min(0.9, h.y + 0.15),
    })),
    isCorrect: false,
  });

  const seed = correctHoles.reduce(
    (acc, h) => acc + Math.round(h.x * 100) + Math.round(h.y * 100),
    1
  );
  for (let i = tagged.length - 1; i > 0; i--) {
    const j = (seed * (i + 1)) % (i + 1);
    [tagged[i], tagged[j]] = [tagged[j]!, tagged[i]!];
  }

  const options = tagged.map(t => t.holes);
  const correctIndex = tagged.findIndex(t => t.isCorrect);
  return { options, correctIndex };
}

export function generateHolePunchingProblem(
  random: PRNG,
  difficulty: "easy" | "medium" | "hard"
): HolePunchingProblem {
  const foldProblem = generateFoldProblem(random, difficulty);
  const correctHoles = getHolePositions(foldProblem);
  const { options, correctIndex } = generateOptions(correctHoles);
  return { foldProblem, correctHoles, options, correctIndex };
}
