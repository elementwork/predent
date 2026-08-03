import { parseArgs } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateProblem, getCorrectAnswer } from "../../server/lib/pat-generation/index.js";
import type { QuestionCategory, Difficulty, CLIOptions, GeneratedQuestion, GenerationResult } from "../pat-types.js";
import { ALL_CATEGORIES } from "../pat-types.js";
import { generateExplanation } from "../pat-explanations/index.js";
import { renderHTML } from "../pat-renderers/html-renderer.js";
import { renderJSON } from "../pat-renderers/json-renderer.js";

function parseDifficultyDistribution(dist: string): { easy: number; medium: number; hard: number } {
  if (dist === "uniform") {
    return { easy: 33, medium: 34, hard: 33 };
  }
  if (dist === "weighted") {
    return { easy: 50, medium: 30, hard: 20 };
  }
  // Custom: "easy:40,medium:40,hard:20"
  const parts = dist.split(",");
  const result = { easy: 33, medium: 34, hard: 33 };
  for (const part of parts) {
    const [level, pct] = part.split(":");
    if (level && pct) {
      result[level as keyof typeof result] = parseInt(pct, 10);
    }
  }
  return result;
}

function getDifficultyForIndex(
  index: number,
  total: number,
  distribution: { easy: number; medium: number; hard: number }
): Difficulty {
  const easyCount = Math.floor((total * distribution.easy) / 100);
  const mediumCount = Math.floor((total * distribution.medium) / 100);

  if (index < easyCount) return "easy";
  if (index < easyCount + mediumCount) return "medium";
  return "hard";
}

function createQuestionId(category: QuestionCategory, index: number): string {
  return `${category}-${String(index).padStart(6, "0")}`;
}

async function generateQuestions(options: CLIOptions): Promise<GenerationResult> {
  const categories = options.categories === "all" ? ALL_CATEGORIES : options.categories;
  const distribution = parseDifficultyDistribution(options.difficulty);
  const baseSeed = options.seed ?? Math.floor(Math.random() * 1000000);

  const questions: GeneratedQuestion[] = [];
  const byCategory: Record<QuestionCategory, number> = {} as Record<QuestionCategory, number>;
  const byDifficulty: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };

  for (const category of categories) {
    byCategory[category] = 0;

    for (let i = 0; i < options.count; i++) {
      const difficulty = getDifficultyForIndex(i, options.count, distribution);
      const seed = baseSeed + i * 1000 + ALL_CATEGORIES.indexOf(category) * 100000;

      const problem = generateProblem(category, { seed, difficulty });
      const correctIndex = getCorrectAnswer(category, { seed, difficulty });

      const timeTarget =
        difficulty === "easy" ? 30 : difficulty === "medium" ? 45 : 60;

      // Handle different problem shapes
      const p = problem as Record<string, unknown>;
      let questionOptions: string[];
      if (Array.isArray(p.choices)) {
        questionOptions = p.choices as string[];
      } else if (Array.isArray(p.options)) {
        // For pattern_folding, options is string[][]
        questionOptions = ["A", "B", "C", "D"];
      } else {
        questionOptions = ["A", "B", "C", "D"];
      }

      const question: GeneratedQuestion = {
        id: createQuestionId(category, i),
        category,
        difficulty,
        seed,
        correctIndex,
        timeTarget,
        options: questionOptions,
        metadata: problem as Record<string, unknown>,
      };

      if (cliOptions.explanations) {
        question.explanation = generateExplanation(
          category,
          problem,
          correctIndex,
          cliOptions.explanationDepth
        );
      }

      questions.push(question);
      byCategory[category]++;
      byDifficulty[difficulty]++;
    }
  }

  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    generator: "pat-cli",
    seed: baseSeed,
    stats: {
      total: questions.length,
      byCategory,
      byDifficulty,
    },
    questions,
  };
}

function printHelp() {
  console.log(`
Generate PAT Questions

Usage:
  npx tsx tools/pat-cli.ts generate [options]

Options:
  -n, --count <number>       Questions per category (default: 10)
  -c, --categories <list>    Comma-separated categories or "all" (default: all)
  -d, --difficulty <dist>    Distribution: uniform, weighted, or custom (default: uniform)
  -f, --format <format>      Output format: html, json, both (default: html)
  -o, --output <path>        Output path (default: ./pat-output/)
  -s, --seed <number>        Random seed for reproducibility
  -v, --validate             Validate after generation
  -t, --template <style>     Template: modern, classic, minimal (default: modern)
  --split                    Split by category into separate files
  --per-file <number>        Questions per file when splitting (default: 100)
  --no-explanations          Exclude explanations
  --explanation-depth <depth> Explanation detail: brief, detailed, full (default: detailed)
  --print                    Print-optimized output
  --page-size <size>         Paper size: a4, letter (default: a4)
  --page-numbers             Add page numbers
  --answer-key               Add answer key page
  -q, --quiet                Suppress output

Categories:
  keyholes, tfe, angle_ranking, hole_punching, cube_counting, pattern_folding

Examples:
  npx tsx tools/pat-cli.ts generate -n 100
  npx tsx tools/pat-cli.ts generate -c keyholes,angle_ranking -n 200
  npx tsx tools/pat-cli.ts generate -d weighted -f both -o ./output/
  npx tsx tools/pat-cli.ts generate -s 42 -n 50 --validate
`);
}

export async function runGenerate(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      count: { type: "string", short: "n", default: "10" },
      categories: { type: "string", short: "c", default: "all" },
      difficulty: { type: "string", short: "d", default: "uniform" },
      format: { type: "string", short: "f", default: "html" },
      output: { type: "string", short: "o", default: "./pat-output/" },
      seed: { type: "string", short: "s" },
      validate: { type: "boolean", short: "v", default: false },
      template: { type: "string", short: "t", default: "modern" },
      split: { type: "boolean", default: false },
      "per-file": { type: "string", default: "100" },
      explanations: { type: "boolean", default: true },
      "explanation-depth": { type: "string", default: "detailed" },
      print: { type: "boolean", default: false },
      "page-size": { type: "string", default: "a4" },
      "page-numbers": { type: "boolean", default: false },
      "answer-key": { type: "boolean", default: false },
      quiet: { type: "boolean", short: "q", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: false,
  });

  if (values.help) {
    printHelp();
    return;
  }

  const categories =
    values.categories === "all"
      ? "all"
      : values.categories!.split(",").map((c) => c.trim()) as QuestionCategory[];

  const options: CLIOptions = {
    count: parseInt(values.count!, 10),
    categories,
    difficulty: values.difficulty!,
    format: values.format as "html" | "json" | "both",
    output: values.output!,
    seed: values.seed ? parseInt(values.seed, 10) : undefined,
    validate: values.validate!,
    template: values.template as "modern" | "classic" | "minimal",
    split: values.split!,
    perFile: parseInt(values["per-file"]!, 10),
    explanations: values.explanations!,
    explanationDepth: values["explanation-depth"] as "brief" | "detailed" | "full",
    print: values.print!,
    pageSize: values["page-size"]!,
    pageNumbers: values["page-numbers"]!,
    answerKey: values["answer-key"]!,
    quiet: values.quiet!,
  };

  if (!options.quiet) {
    console.log("Generating PAT questions...");
    console.log(`  Categories: ${options.categories === "all" ? "all" : options.categories.join(", ")}`);
    console.log(`  Count per category: ${options.count}`);
    console.log(`  Difficulty: ${options.difficulty}`);
    console.log(`  Format: ${options.format}`);
    if (options.seed !== undefined) {
      console.log(`  Seed: ${options.seed}`);
    }
  }

  const result = await generateQuestions(options);

  // Ensure output directory exists
  await mkdir(options.output, { recursive: true });

  // Write output files
  if (options.format === "json" || options.format === "both") {
    const jsonPath = join(options.output, "questions.json");
    await writeFile(jsonPath, renderJSON(result));
    if (!options.quiet) {
      console.log(`\nJSON written to: ${jsonPath}`);
    }
  }

  if (options.format === "html" || options.format === "both") {
    const htmlPath = join(options.output, "index.html");
    await writeFile(htmlPath, renderHTML(result));
    if (!options.quiet) {
      console.log(`HTML written to: ${htmlPath}`);
    }
  }

  // Print stats
  if (!options.quiet) {
    console.log(`\nGeneration complete:`);
    console.log(`  Total questions: ${result.stats.total}`);
    for (const [cat, count] of Object.entries(result.stats.byCategory)) {
      console.log(`  ${cat}: ${count}`);
    }
  }
}
