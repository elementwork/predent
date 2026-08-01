import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  Lightbulb,
  AlertTriangle,
  Check,
  ChevronRight,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

const patCategories: Record<
  string,
  {
    title: string;
    color: string;
    bgColor: string;
    description: string;
    questions: number;
    targetTime: string;
    difficulty: string;
    strategy: string[];
    commonPitfalls: string[];
    tips: string[];
    exampleWalkthrough: string;
  }
> = {
  keyholes: {
    title: "Keyholes",
    color: "#14B8A6",
    bgColor: "#F0FDFA",
    description:
      "Visualize a 3D object and determine which 2D aperture it can pass through.",
    questions: 15,
    targetTime: "~30 sec/q",
    difficulty: "Medium",
    strategy: [
      "Identify the deepest concave/convex features first",
      "Mentally trace the object through each aperture",
      "Eliminate options with mismatched curves",
      "Focus on the limiting dimension (the tightest fit point)",
    ],
    commonPitfalls: [
      'Choosing the aperture that looks "closest" instead of exact fit',
      "Ignoring hidden curves on the back side of the object",
      "Not rotating the object mentally to check all orientations",
      "Spending too long on one question - flag and move on",
    ],
    tips: [
      "Practice with real 3D objects first, then transition to diagrams",
      "Use our interactive diagrams to study objects from different angles",
      "Time yourself - 30 seconds per question is the sweet spot",
      "If stuck between two options, pick the more conservative fit",
    ],
    exampleWalkthrough:
      "Look for the most restrictive feature (deepest groove or tallest ridge). Compare this feature against each aperture option. The correct aperture must accommodate ALL features of the object at ANY orientation.",
  },
  tfe: {
    title: "Top-Front-End",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    description:
      "Given two orthographic views (top, front, or end), determine the missing third view.",
    questions: 15,
    targetTime: "~45 sec/q",
    difficulty: "Hard",
    strategy: [
      "Identify matching edges between the two given views",
      "Project lines at 45° to transfer dimensions",
      "Look for hidden lines (dashed) indicating internal features",
      "Build a mental 3D model from the two views before checking options",
    ],
    commonPitfalls: [
      "Confusing which edges are visible vs hidden",
      "Misaligning features when transferring between views",
      "Not accounting for holes or cutouts that appear differently in each view",
      "Overcomplicating simple objects - look for the simplest solution first",
    ],
    tips: [
      "Master the projection method: top↔front shares width, front↔end shares height",
      "Practice with engineering drawing basics",
      "Count the number of visible edges as a quick validation",
      "Use our TFE generator to get unlimited practice questions",
    ],
    exampleWalkthrough:
      "Align the two given views. For each feature (edge, hole, notch), trace how it would appear in the missing view using orthographic projection. Compare your mental image with the answer choices.",
  },
  angle_ranking: {
    title: "Angle Ranking",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    description: "Compare 4 angles and rank them from smallest to largest.",
    questions: 15,
    targetTime: "~24 sec/q",
    difficulty: "Medium",
    strategy: [
      'Use the "reference angle" method - compare each to a known 90° angle',
      "Look at the opening of each angle, not the line length",
      "Pairwise comparison: which is larger, A or B? B or C?",
      'Use the "eyeball" method for obvious differences, measurement for close ones',
    ],
    commonPitfalls: [
      "Being influenced by line length instead of actual angle measure",
      "Second-guessing yourself after making a decision",
      "Not using consistent reference points",
      "Panicking when angles are very close together",
    ],
    tips: [
      "The naked eye can reliably distinguish angles >5° apart",
      "For close angles, mentally extend the lines to exaggerate the difference",
      'Use the "bisector" technique - does the angle look more or less than 45°?',
      "Our angle ranking generator lets you practice with adjustable difficulty",
    ],
    exampleWalkthrough:
      "First, identify the obviously smallest and largest angles. Then compare the remaining two. For very close angles, mentally draw a circle around the vertex and compare arc lengths.",
  },
  hole_punching: {
    title: "Hole Punching",
    color: "#F43F5E",
    bgColor: "#FFF1F2",
    description:
      "Mentally unfold a folded paper and determine where the hole(s) appear.",
    questions: 15,
    targetTime: "~40 sec/q",
    difficulty: "Hard",
    strategy: [
      "Track the hole position through each fold in reverse (unfold) order",
      "Remember: each unfold can create up to 2 new hole positions (mirror image)",
      "Use a systematic approach: label fold lines and track hole coordinates",
      "For multiple folds, work backwards from the final folded state",
    ],
    commonPitfalls: [
      "Forgetting that holes can overlap when unfolded",
      "Miscounting the number of folds",
      "Not tracking the correct mirror direction for each fold",
      "Losing track of hole positions after multiple unfolds",
    ],
    tips: [
      "Start with physical paper practice, then transition to mental",
      "Use the coordinate system method: assign (x,y) to each hole",
      'Practice our "fold sequence" exercises to build mental visualization',
      "1-fold and 2-fold questions should be automatic - practice until they are",
    ],
    exampleWalkthrough:
      "Start from the final folded state. For the last fold, determine where the hole would be on the other side of the fold line (mirror image). Repeat for each fold in reverse order. The final pattern shows all hole positions.",
  },
  cube_counting: {
    title: "Cube Counting",
    color: "#10B981",
    bgColor: "#ECFDF5",
    description:
      "Count the number of cubes with a specific number of painted faces in a 3D stack.",
    questions: 15,
    targetTime: "~36 sec/q",
    difficulty: "Medium",
    strategy: [
      "Use a tally table method: 0-painted, 1-painted, 2-painted, etc.",
      "Start by counting total cubes, then categorize by painted faces",
      "Remember: cubes completely inside have 0 painted faces",
      "Edge cubes have 2 painted faces, corner cubes have 3",
    ],
    commonPitfalls: [
      "Missing hidden cubes inside the structure",
      "Double-counting cubes at edges/corners",
      "Forgetting that the bottom face resting on the table is NOT painted",
      " miscounting the total number of cubes in complex structures",
    ],
    tips: [
      "Always use our tally table template to stay organized",
      "Sketch an exploded view to see how cubes are layered and connected",
      "Practice mental decomposition: break the structure into layers",
      "0-painted cubes = total cubes - surface cubes",
    ],
    exampleWalkthrough:
      "Count total cubes first. Then identify cubes with 3 painted faces (corners), 2 painted faces (edges), 1 painted face (surface centers), and 0 painted faces (internal). Use the tally table to keep track.",
  },
  pattern_folding: {
    title: "Pattern Folding",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    description:
      "Determine which 3D form results from folding a 2D pattern/net.",
    questions: 15,
    targetTime: "~66 sec/q",
    difficulty: "Very Hard",
    strategy: [
      "Identify the base face and mentally fold around it",
      "Track adjacent faces and their relative positions",
      "Look for impossible configurations (faces that cannot be adjacent)",
      "Use the elimination method - rule out impossible options first",
    ],
    commonPitfalls: [
      "Not considering the orientation of symbols/patterns on faces",
      "Forgetting that opposite faces can never be adjacent in the 3D form",
      "Mentally folding in the wrong direction",
      "Not using the process of elimination effectively",
    ],
    tips: [
      "Learn the 11 possible cube nets to recognize patterns quickly",
      "Practice with physical paper nets first, then move to interactive diagrams",
      "Focus on face adjacency relationships rather than trying to fully visualize",
      "Eliminate answers first - look for faces that should be opposite but are adjacent",
    ],
    exampleWalkthrough:
      "Pick a reference face on the net. Identify which faces will be adjacent to it after folding. Check each option: does it have the correct faces adjacent? Are opposite faces actually opposite? Use elimination to find the only possible answer.",
  },
};

export default function PATStrategyPage() {
  const { category: rawCategory } = useParams<{ category: string }>();
  // Normalize: replace hyphens with underscores so "angle-ranking" → "angle_ranking"
  const category = (rawCategory || "keyholes").replace(/-/g, "_");
  const data = patCategories[category];

  usePageTitle(data ? `${data.title} Strategy Guide` : "Guide Not Found");

  if (!data) {
    return (
      <main className="min-h-screen bg-[var(--page-bg)] pt-24 pb-20">
        <div className="section-container max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Guide Not Found
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            No strategy guide found for "{rawCategory}".
          </p>
          <Button asChild>
            <Link to="/guides">Back to Guides</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      <div
        className="pt-24 pb-16"
        style={{
          background: `linear-gradient(135deg, ${data.color}22, ${data.color}11)`,
        }}
      >
        <div className="section-container max-w-7xl mx-auto">
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guides
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: data.color }}
            >
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                {data.title} Strategy Guide
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">PAT Section Guide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8 pb-20">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Questions",
              value: `${data.questions}`,
              color: data.color,
            },
            { label: "Target Time", value: data.targetTime, color: data.color },
            { label: "Difficulty", value: data.difficulty, color: data.color },
          ].map(stat => (
            <Card key={stat.label} className="border-[var(--border-color)]">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Description */}
        <Card className="border-[var(--border-color)] mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              What is {data.title}?
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {data.description}
            </p>
          </CardContent>
        </Card>

        {/* Strategy */}
        <Card className="border-[var(--border-color)] mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5" style={{ color: data.color }} />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Step-by-Step Strategy
              </h2>
            </div>
            <ol className="space-y-3">
              {data.strategy.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: data.color }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Common Pitfalls */}
        <Card className="border-[var(--border-color)] mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Common Pitfalls to Avoid
              </h2>
            </div>
            <ul className="space-y-2">
              {data.commonPitfalls.map((pitfall, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-0.5">&times;</span>
                  <span className="text-sm text-[var(--text-secondary)]">{pitfall}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-[var(--border-color)] mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#10B981]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Pro Tips</h2>
            </div>
            <ul className="space-y-2">
              {data.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                  <span className="text-sm text-[var(--text-secondary)]">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Example Walkthrough */}
        <Card
          className="border-[var(--border-color)] mb-8"
          style={{ borderColor: data.color }}
        >
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
              Example Walkthrough
            </h2>
            <p
              className="text-sm text-[var(--text-secondary)] leading-relaxed p-4 rounded-lg"
              style={{ backgroundColor: data.bgColor }}
            >
              {data.exampleWalkthrough}
            </p>
          </CardContent>
        </Card>

        {/* Strategy Summary Card */}
        <div className="p-6 rounded-xl bg-[var(--page-surface)] border border-[var(--border-color)] mb-8">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Strategy Summary Card</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-tertiary)] mb-1">Time per question</p>
              <p className="font-semibold text-[var(--text-primary)]">{data.targetTime}</p>
            </div>
            <div>
              <p className="text-[var(--text-tertiary)] mb-1">Target accuracy</p>
              <p className="font-semibold text-[var(--text-primary)]">80%+</p>
            </div>
            <div>
              <p className="text-[var(--text-tertiary)] mb-1">Key technique</p>
              <p className="font-semibold text-[var(--text-primary)]">{data.strategy[0]}</p>
            </div>
            <div>
              <p className="text-[var(--text-tertiary)] mb-1">Practice daily</p>
              <p className="font-semibold text-[var(--text-primary)]">20-30 questions</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            className="h-11 px-8 font-semibold"
            style={{ backgroundColor: data.color }}
            asChild
          >
            <Link to="/pat-academy/practice">
              Practice {data.title} Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
