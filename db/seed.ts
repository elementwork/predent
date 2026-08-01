import { getDb } from "../server/queries/connection";
import * as schema from "@db/schema";

/* ─── PAT Question Seed Data ─── */

const categories = [
  {
    id: "keyholes",
    name: "Keyholes",
    timeTarget: 30,
    conceptsPool: [
      "proportional_reasoning",
      "edge_matching",
      "symmetry",
      "concave_features",
      "depth_cues",
    ],
  },
  {
    id: "tfe",
    name: "Top-Front-End",
    timeTarget: 45,
    conceptsPool: [
      "orthographic_projection",
      "hidden_lines",
      "edge_correspondence",
      "orientation",
    ],
  },
  {
    id: "angle_ranking",
    name: "Angle Ranking",
    timeTarget: 25,
    conceptsPool: [
      "angle_discrimination",
      "reference_angles",
      "adjacent_comparison",
      "laptop_method",
    ],
  },
  {
    id: "hole_punching",
    name: "Hole Punching",
    timeTarget: 40,
    conceptsPool: [
      "fold_sequence",
      "layer_tracking",
      "quadrant_system",
      "unfolding",
    ],
  },
  {
    id: "cube_counting",
    name: "Cube Counting",
    timeTarget: 35,
    conceptsPool: [
      "tally_table",
      "hidden_cubes",
      "systematic_counting",
      "paint_pattern",
    ],
  },
  {
    id: "pattern_folding",
    name: "Pattern Folding",
    timeTarget: 50,
    conceptsPool: [
      "net_folding",
      "opposite_faces",
      "symbol_orientation",
      "edge_matching",
    ],
  },
] as const;

type CategoryId = (typeof categories)[number]["id"];
type Difficulty = "beginner" | "intermediate" | "advanced" | "elite";

const difficulties: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
  "elite",
];

function shuffle<T>(arr: readonly T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function conceptsFor(
  category: CategoryId,
  difficulty: Difficulty,
  seed: number
): string[] {
  const pool = categories.find(c => c.id === category)!.conceptsPool;
  const count =
    difficulty === "beginner" ? 2 : difficulty === "intermediate" ? 2 : 3;
  return shuffle(pool, seed).slice(0, count);
}

/* ─── Keyholes ─── */
const keyholeShapes = [
  "L-shaped block with a short vertical arm",
  "T-shaped prism with a wide crossbar",
  "cross-shaped object with equal arms",
  "triangular prism with a notched base",
  "rectangular block with a cylindrical protrusion",
  "U-shaped channel with rounded inner corners",
  "Z-shaped extrusion with uniform thickness",
  "hexagonal prism with a square cutout",
  "pyramid with a rectangular base indentation",
  "cylindrical post with a flat side",
];

function generateKeyhole(i: number, difficulty: Difficulty) {
  const shape = keyholeShapes[i % keyholeShapes.length];
  const complexity =
    difficulty === "beginner"
      ? "simple"
      : difficulty === "intermediate"
        ? "standard"
        : difficulty === "advanced"
          ? "complex"
          : "intricate";
  const prompt = `A ${complexity} ${shape} is shown. Which aperture allows the object to pass through cleanly?`;
  const options = [
    `Aperture A: matches the object's outer profile exactly`,
    `Aperture B: slightly smaller in one dimension`,
    `Aperture C: mirrored profile with extra clearance`,
    `Aperture D: correct width but incorrect depth notch`,
  ];
  const correctAnswer = 0;
  return {
    prompt,
    diagram: `[Keyhole diagram: ${shape}]`,
    options,
    correctAnswer,
    explanationL1: `Aperture A is correct because it is the only opening whose profile exactly matches the object's outer silhouette.`,
    explanationL2: `1. Identify the most restrictive dimension of the ${shape}. 2. Compare each aperture against that dimension. 3. Aperture A aligns with every edge and notch. 4. B, C, and D each fail on at least one critical feature.`,
    explanationL3: `For keyholes, always match the largest or most restrictive feature first. Look for concave grooves and protrusions that must align; a common distractor is an aperture that is correct in width but wrong in depth.`,
    timeTarget: 30,
  };
}

/* ─── Top-Front-End (TFE) ─── */
const tfeSetups = [
  { given: "top and front views", missing: "end view" },
  { given: "top and end views", missing: "front view" },
  { given: "front and end views", missing: "top view" },
];

function generateTFE(i: number, difficulty: Difficulty) {
  const setup = tfeSetups[i % tfeSetups.length];
  const complexity =
    difficulty === "beginner"
      ? "simple"
      : difficulty === "intermediate"
        ? "moderate"
        : difficulty === "advanced"
          ? "complex"
          : "very complex";
  const prompt = `The ${setup.given} of a ${complexity} 3D object are shown. Which option shows the correct ${setup.missing}?`;
  const options = [
    `Option A: correct ${setup.missing} with all edges aligned`,
    `Option B: ${setup.missing} with one edge misplaced`,
    `Option C: ${setup.missing} with hidden lines omitted`,
    `Option D: ${setup.missing} using the wrong orientation`,
  ];
  return {
    prompt,
    diagram: `[TFE diagram: ${setup.given} given, find ${setup.missing}]`,
    options,
    correctAnswer: 0,
    explanationL1: `Option A is correct because every projected edge in the ${setup.missing} corresponds to an edge visible in the two given views.`,
    explanationL2: `1. Identify the two given views. 2. Trace each edge from one given view to the other. 3. Reconstruct the missing view by projecting the remaining edges. 4. Only Option A contains the correct combination of solid and hidden lines.`,
    explanationL3: `On TFE questions, first label the "given" views, then track edge correspondence. Hidden lines are the most common source of errors; if an edge exists in one view but appears hidden in another, it must be shown dashed.`,
    timeTarget: 45,
  };
}

/* ─── Angle Ranking ─── */
const angleRankings = [
  { order: [0, 1, 2, 3], label: "A < B < C < D" },
  { order: [1, 0, 2, 3], label: "B < A < C < D" },
  { order: [0, 2, 1, 3], label: "A < C < B < D" },
  { order: [2, 0, 1, 3], label: "C < A < B < D" },
  { order: [1, 2, 0, 3], label: "B < C < A < D" },
  { order: [2, 1, 0, 3], label: "C < B < A < D" },
];

function generateAngleRanking(i: number, difficulty: Difficulty) {
  const ranking = angleRankings[i % angleRankings.length];
  const spread =
    difficulty === "beginner"
      ? "widely spaced"
      : difficulty === "intermediate"
        ? "moderately spaced"
        : difficulty === "advanced"
          ? "closely spaced"
          : "very closely spaced";
  const prompt = `Four angles labeled A, B, C, and D are shown. Rank them from smallest to largest. The angles are ${spread}.`;
  const options = [
    `${ranking.label}`,
    `${ranking.label.split(" ").reverse().join(" ")}`,
    `A < B < D < C`,
    `D < C < B < A`,
  ];
  return {
    prompt,
    diagram: `[Angle ranking diagram: angles A, B, C, D — ${spread}]`,
    options,
    correctAnswer: 0,
    explanationL1: `The correct order is ${ranking.label}, found by comparing adjacent angles against a right-angle reference.`,
    explanationL2: `1. Use the "laptop" method or a right-angle reference. 2. Compare A to B, then the larger of those to C, and so on. 3. The ordering ${ranking.label} is the only one consistent with the diagram.`,
    explanationL3: `Angle ranking rewards a quick first impression. Trust your initial comparison and avoid re-measuring. Practice comparing angles to a 90° mental reference to build speed.`,
    timeTarget: 25,
  };
}

/* ─── Hole Punching ─── */
const paperShapes = ["square", "rectangle", "triangle"];

function generateHolePunch(i: number, difficulty: Difficulty) {
  const folds =
    difficulty === "beginner"
      ? 1
      : difficulty === "intermediate"
        ? 2
        : difficulty === "advanced"
          ? 3
          : 4;
  const shape = paperShapes[i % paperShapes.length];
  const punch = [
    "top-left corner",
    "center of folded edge",
    "lower-right quadrant",
    "midpoint of diagonal fold",
  ][i % 4];
  const prompt = `A ${shape} sheet of paper is folded ${folds} time(s). A hole is punched at the ${punch}. Which diagram shows the unfolded paper?`;
  const options = [
    `Unfolded pattern with holes in correct mirrored locations`,
    `Unfolded pattern missing one reflected hole`,
    `Unfolded pattern with holes rotated 90°`,
    `Unfolded pattern with too many holes`,
  ];
  return {
    prompt,
    diagram: `[Hole punch diagram: ${shape}, ${folds} fold(s), punch at ${punch}]`,
    options,
    correctAnswer: 0,
    explanationL1: `The correct unfolded pattern shows the hole reflected across every fold line the correct number of times.`,
    explanationL2: `1. Trace the fold sequence backward. 2. Each fold line acts as a mirror for the hole. 3. With ${folds} fold(s), the punch produces ${2 ** folds} hole images. 4. Only the correct pattern places all ${2 ** folds} holes in the mirrored positions.`,
    explanationL3: `Use a quadrant grid and count layers. A common mistake is forgetting that each fold doubles the number of holes. Label the layers before unfolding to avoid losing track.`,
    timeTarget: 40,
  };
}

/* ─── Cube Counting ─── */
const cubeConfigs = [
  { total: 6, faces: [2, 2, 1, 1, 0, 0] },
  { total: 8, faces: [3, 2, 2, 1, 0, 0] },
  { total: 10, faces: [4, 3, 2, 1, 0, 0] },
  { total: 12, faces: [5, 4, 2, 1, 0, 0] },
  { total: 9, faces: [3, 3, 2, 1, 0, 0] },
  { total: 11, faces: [4, 3, 3, 1, 0, 0] },
];

function generateCubeCounting(i: number, difficulty: Difficulty) {
  const config = cubeConfigs[i % cubeConfigs.length];
  const faceCounts =
    difficulty === "beginner"
      ? [1, 2]
      : difficulty === "intermediate"
        ? [2, 3]
        : difficulty === "advanced"
          ? [3, 4]
          : [4, 5];
  const targetFaces = faceCounts[i % faceCounts.length];
  const count = config.faces[targetFaces] ?? 0;
  const prompt = `The stack contains ${config.total} cubes. How many cubes have exactly ${targetFaces} painted faces?`;
  const wrongs = [Math.max(0, count - 1), count + 1, count + 2];
  const options = shuffle(
    [`${count}`, `${wrongs[0]}`, `${wrongs[1]}`, `${wrongs[2]}`],
    i
  );
  const correctAnswer = options.indexOf(`${count}`);
  return {
    prompt,
    diagram: `[Cube counting diagram: stack of ${config.total} cubes, target = ${targetFaces} painted faces]`,
    options,
    correctAnswer,
    explanationL1: `Exactly ${count} cubes have ${targetFaces} painted faces when all exposed faces are counted.`,
    explanationL2: `1. Build a tally table for 0–5 painted faces. 2. Identify cubes on the top, sides, and interior. 3. Count cubes with exactly ${targetFaces} exposed faces. 4. The total is ${count}.`,
    explanationL3: `Always fill the tally table before answering. Interior cubes usually have 0 painted faces, edge cubes have 2 or 3, and corner cubes have 3 or more. Watch for hidden cubes behind the front row.`,
    timeTarget: 35,
  };
}

/* ─── Pattern Folding ─── */
const patternSetups = [
  "cross-shaped cube net with a star symbol",
  "T-shaped net with a circle and triangle symbols",
  "L-shaped net with a square and diamond symbols",
  "Z-shaped net with a hexagon symbol",
  "straight four-square net with a dot symbol",
  "2x2 square net with an arrow symbol",
];

function generatePatternFolding(i: number, difficulty: Difficulty) {
  const setup = patternSetups[i % patternSetups.length];
  const complexity =
    difficulty === "beginner"
      ? "simple"
      : difficulty === "intermediate"
        ? "moderate"
        : difficulty === "advanced"
          ? "complex"
          : "very complex";
  const prompt = `Which 3D form results from folding the ${complexity} ${setup}?`;
  const options = [
    `Form A: correct fold with symbols on adjacent faces`,
    `Form B: impossible adjacency between two faces`,
    `Form C: correct shape but one symbol rotated incorrectly`,
    `Form D: valid fold but wrong symbol face pairing`,
  ];
  return {
    prompt,
    diagram: `[Pattern folding diagram: ${setup}]`,
    options,
    correctAnswer: 0,
    explanationL1: `Form A is correct because it is the only 3D form where every adjacent face pair matches the 2D net and all symbols point the right way.`,
    explanationL2: `1. Identify the base face in the net. 2. Trace which faces become adjacent in 3D. 3. Eliminate options with impossible adjacencies. 4. Verify symbol orientation in the remaining option.`,
    explanationL3: `For pattern folding, elimination is faster than verification. First remove options that connect faces that should be opposite, then check symbol orientation only on the survivors.`,
    timeTarget: 50,
  };
}

const generators: Record<
  CategoryId,
  (
    i: number,
    d: Difficulty
  ) => {
    prompt: string;
    diagram: string;
    options: string[];
    correctAnswer: number;
    explanationL1: string;
    explanationL2: string;
    explanationL3: string;
    timeTarget: number;
  }
> = {
  keyholes: generateKeyhole,
  tfe: generateTFE,
  angle_ranking: generateAngleRanking,
  hole_punching: generateHolePunch,
  cube_counting: generateCubeCounting,
  pattern_folding: generatePatternFolding,
};

function generateQuestions(): schema.InsertPATQuestion[] {
  const questions: schema.InsertPATQuestion[] = [];

  for (const category of categories) {
    for (let i = 0; i < 60; i++) {
      const difficulty = difficulties[i % 4];
      const generated = generators[category.id](i, difficulty);
      const publicId = `pat-${category.id.slice(0, 2).replace(/_/g, "")}-${String(i + 1).padStart(4, "0")}`;
      questions.push({
        publicId,
        category: category.id,
        difficulty,
        source: "curated",
        questionData: {
          prompt: generated.prompt,
          diagram: generated.diagram,
          options: generated.options,
        },
        correctAnswer: generated.correctAnswer,
        explanationL1: generated.explanationL1,
        explanationL2: generated.explanationL2,
        explanationL3: generated.explanationL3,
        concepts: conceptsFor(category.id, difficulty, i),
        timeTarget: generated.timeTarget,
      });
    }
  }

  return questions;
}

async function seed() {
  const db = getDb();
  console.log("Seeding PAT questions...");

  const questions = generateQuestions();
  const batchSize = 100;
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    await db.insert(schema.patQuestions).values(batch);
    console.log(
      `Inserted ${Math.min(i + batchSize, questions.length)} / ${questions.length} questions`
    );
  }

  console.log(`Done. Seeded ${questions.length} PAT questions.`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
