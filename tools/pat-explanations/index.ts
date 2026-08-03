import type { QuestionCategory, ExplanationDepth } from "../pat-types.js";

interface Explanation {
  summary: string;
  correct: string;
  distractors?: string[];
  concepts?: string[];
  tips?: string[];
}

const EXPLANATIONS: Record<QuestionCategory, (correctIndex: number) => Explanation> = {
  keyholes: (correctIndex) => ({
    summary: "Identify which keyhole silhouette matches the 3D object when viewed through the keyhole.",
    correct: `Option ${String.fromCharCode(65 + correctIndex)} correctly shows the silhouette from the keyhole perspective.`,
    distractors: [
      "Shows an incorrect rotation angle",
      "Shows a mirrored view",
      "Shows an impossible perspective",
    ],
    concepts: ["3D visualization", "Mental rotation", "Silhouette matching"],
    tips: [
      "Mentally rotate the object to match the keyhole orientation",
      "Focus on the overall silhouette shape, not details",
      "Eliminate obviously wrong perspectives first",
    ],
  }),

  tfe: (correctIndex) => ({
    summary: "Determine which view matches the Top, Front, and End views of a 3D object.",
    correct: `Option ${String.fromCharCode(65 + correctIndex)} correctly represents the combined TFE views.`,
    distractors: [
      "One view is incorrectly oriented",
      "Views don't match the object's features",
      "End view is rotated incorrectly",
    ],
    concepts: ["Orthographic projection", "Multi-view correspondence", "Spatial reasoning"],
    tips: [
      "Check each view independently against the 3D object",
      "Look for consistent feature alignment across views",
      "The end view is typically the most challenging - focus on it last",
    ],
  }),

  angle_ranking: (correctIndex) => ({
    summary: "Rank angles from smallest to largest (or largest to smallest).",
    correct: `Option ${String.fromCharCode(65 + correctIndex)} correctly ranks the angles.`,
    distractors: [
      "Two angles are swapped",
      "Ranking is reversed",
      "Middle angles are misordered",
    ],
    concepts: ["Angle comparison", "Visual estimation", "Relative size judgment"],
    tips: [
      "Look for the smallest angle first, then work up",
      "Use the vertex as your reference point",
      "Consider using a straight edge for comparison",
    ],
  }),

  hole_punching: (correctIndex) => ({
    summary: "Determine where holes will appear after unfolding a folded, hole-punched paper.",
    correct: `Option ${String.fromCharCode(65 + correctIndex)} correctly shows the unfolded hole pattern.`,
    distractors: [
      "Holes are in wrong positions after unfolding",
      "Mirror image of correct pattern",
      "Missing holes from additional folds",
    ],
    concepts: ["Paper folding", "Symmetry", "Spatial visualization"],
    tips: [
      "Track each fold's axis of symmetry",
      "Apply folds sequentially, not all at once",
      "Draw the fold lines on the paper mentally",
    ],
  }),

  cube_counting: (correctIndex) => ({
    summary: "Count how many faces of each cube are visible from a given perspective.",
    correct: `Option ${String.fromCharCode(65 + correctIndex)} correctly counts the visible faces.`,
    distractors: [
      "Counts hidden faces as visible",
      "Misses partially visible faces",
      "Counts the same face twice",
    ],
    concepts: ["3D visualization", "Face counting", "Perspective analysis"],
    tips: [
      "Start counting from one corner and work systematically",
      "Consider all three visible faces of each cube",
      "Don't forget partially visible faces",
    ],
  }),

  pattern_folding: (correctIndex) => ({
    summary: "Determine which 3D cube can be formed from a given 2D net pattern.",
    correct: `Option ${String.fromCharCode(65 + correctIndex)} correctly shows the folded cube.`,
    distractors: [
      "Face orientations are wrong after folding",
      "Adjacent faces don't match the net",
      "Pattern is mirrored on the cube",
    ],
    concepts: ["Net folding", "Face adjacency", "Pattern orientation"],
    tips: [
      "Start with a unique feature and trace it through folds",
      "Check that adjacent faces in the net remain adjacent on the cube",
      "Look for patterns that break symmetry to eliminate options",
    ],
  }),
};

export function generateExplanation(
  category: QuestionCategory,
  _problem: unknown,
  correctIndex: number,
  depth: ExplanationDepth = "detailed"
): Explanation {
  const base = EXPLANATIONS[category](correctIndex);

  switch (depth) {
    case "brief":
      return {
        summary: base.summary,
        correct: base.correct,
      };
    case "detailed":
      return {
        summary: base.summary,
        correct: base.correct,
        concepts: base.concepts,
      };
    case "full":
      return base;
    default:
      return base;
  }
}
