import type { QuestionCategory, ExplanationDepth } from "../pat-types.js";
import type { CubeCoord } from "../../server/lib/pat-generation/keyholes.js";

interface Explanation {
  summary: string;
  correct: string;
  distractors?: string[];
  concepts?: string[];
  tips?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProblem = Record<string, any>;
const letter = (i: number) => String.fromCharCode(65 + i);

export function generateExplanation(
  category: QuestionCategory,
  problem: unknown,
  correctIndex: number,
  depth: ExplanationDepth = "detailed"
): Explanation {
  const meta = (problem ?? {}) as AnyProblem;
  let base: Explanation;

  switch (category) {
    case "keyholes": {
      const cubes = (meta.cubes ?? []) as CubeCoord[];
      const axis = String(meta.correctAxis ?? "?");
      base = {
        summary: `The object must pass straight through the aperture. Its silhouette along the ${axis}-axis matches one of the options.`,
        correct: `Option ${letter(correctIndex)} exactly matches the ${axis}-axis silhouette of the ${cubes.length}-cube object.`,
        distractors: [
          "A silhouette from a different axis or rotation",
          "A silhouette stretched or mirrored",
          "An aperture missing or adding a cell (bump/notch)",
        ],
        concepts: ["Orthographic projection", "Silhouette matching", "Mental rotation"],
        tips: [
          "Rotate the object so the chosen axis points at you, then trace the outline.",
          "Count rows and columns of the silhouette to compare with options.",
          "Check corners for small bumps/notches between similar options.",
        ],
      };
      break;
    }
    case "tfe": {
      const missing = String(meta.missingView ?? "?");
      base = {
        summary: `Use orthographic projection: the missing ${missing.toUpperCase()} view is derived from the object shown.`,
        correct: `Option ${letter(correctIndex)} matches the ${missing.toUpperCase()} view; solid lines are visible edges and dashed lines are hidden edges.`,
        distractors: [
          "An edge that should be hidden is drawn solid (or vice versa)",
          "A bump/notch is added or removed from the silhouette",
          "The view is a mirror image of the correct one",
        ],
        concepts: ["Orthographic projection", "Hidden line convention", "Three-view correspondence"],
        tips: [
          "Trace the top view to Front and End views, aligning each feature along common dimensions.",
          "Remember: dashed lines are hidden; solid lines are visible edges.",
          "Check corner heights and depth discontinuities between views.",
        ],
      };
      break;
    }
    case "angle_ranking": {
      const angles = (meta.angles ?? []) as number[];
      const perm = String((meta.options ?? [])[correctIndex] ?? "?");
      base = {
        summary: `Rank the four angles (labelled 1-4) from smallest to largest.`,
        correct: `Option ${letter(correctIndex)} — permutation ${perm} — orders the measured angles ${angles
          .map((a, i) => `${i + 1} (${a}°)`)
          .join(", ")} from smallest to largest.`,
        distractors: [
          "Two adjacent angles swapped in the ordering",
          "Starting from the largest angle instead of the smallest",
          "A middle pair transposed",
        ],
        tips: [
          "Look for the smallest visible angle first and lock it in position 1.",
          "Compare adjacent pairs to spot a swapped ranking.",
          "Ignore rotation of the page; judge the tightness at the vertex.",
        ],
      };
      break;
    }
    case "hole_punching": {
      const holes = (meta.correctHoles ?? []) as { x: number; y: number }[];
      const count = holes.length;
      base = {
        summary: `The paper is folded (dashed lines), punched at the marked spot, then unfolded — each fold doubles the hole positions.`,
        correct: `Option ${letter(correctIndex)} shows ${count} hole${count === 1 ? "" : "s"} at the correct unfolded positions.`,
        distractors: [
          "A mirrored layout of the holes",
          "Hole mirrored an individual fold line",
          "One or more holes missing after an extra fold",
        ],
        tips: [
          "Trace the punch position through each fold using symmetry across the fold line.",
          "Count the number of holes: ¹ fold → up to 2, 2 folds → up to 4, 3 folds → up to 8.",
          "Remove any option that does not match hole positions on the 4x4 grid.",
        ],
      };
      break;
    }
    case "cube_counting": {
      const targetN = Number(meta.targetN ?? "?");
      const answer = Number(meta.answer ?? "?");
      base = {
        summary: `Count the small cubes that have exactly ${targetN} painted side(s). The stack is painted with painted faces shaded.`,
        correct: `${answer} cube${answer === 1 ? "" : "s"} have exactly ${targetN} painted side(s) (option ${letter(correctIndex)}).`,
        distractors: [
          "Counting hidden cubes that are not part of the stack",
          "Confusing cubes with a different number of painted sides",
          "Forgetting interior or support cubes",
        ],
        tips: [
          "Work ground-up: count per layer from the bottom.",
          "A cube at a corner has 3 exposed sides; on an edge 2; on a face 1; interior 0.",
          "Paint is applied only to exposed faces — count exposed painted faces per cube.",
        ],
      };
      break;
    }
    case "pattern_folding": {
      const net = truncate(meta.net as string[]);
      const marks = String((meta.options ?? [])[correctIndex] ?? "?");
      base = {
        summary: `Fold the given net into a cube; compare the visible (top, left, right) faces of the options.`,
        correct: `Option ${letter(correctIndex)} — with visible faces shown as ${marks} — correctly matches the folded net (marks on the net: ${formatNet(net)}).`,
        distractors: [
          "A cube where a visible face shows a mark from the back of the net",
          "A rotation where marks land on the wrong visible face",
          "A mirror-fold of the same net",
        ],
        tips: [
          "Fix the front face in place; determine which face is on top after folding.",
          "Adjacent faces in the net stay adjacent when folded.",
          "Opposite faces never touch on the folded cube.",
        ],
      };
      break;
    }
    default:
      base = {
        summary: "Select the correct answer.",
        correct: `Option ${letter(correctIndex)}.`,
      };
  }

  switch (depth) {
    case "brief":
      return { summary: base.summary, correct: base.correct };
    case "detailed":
      return { summary: base.summary, correct: base.correct, concepts: base.concepts };
    default:
      return base;
  }
}

function truncate(net: string[]): string[] {
  return Array.isArray(net) ? net : [];
}

function formatNet(net: string[]): string {
  const labels = ["F", "T", "B", "L", "R", "K"];
  const parts: string[] = [];
  net.forEach((mark, i) => {
    if (mark) parts.push(`${labels[i] ?? i}="${mark}"`);
  });
  return parts.length > 0 ? parts.join(", ") : "(all faces blank)";
}