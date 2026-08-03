import { parseArgs } from "node:util";
import { readFile } from "node:fs/promises";
import type { GenerationResult } from "../pat-types.js";

function printHelp() {
  console.log(`
Show Statistics about PAT Questions

Usage:
  npx tsx tools/pat-cli.ts stats -i <input> [options]

Options:
  -i, --input <file>    Input JSON file (required)
  -b, --breakdown       Detailed breakdown
  --distribution        Answer distribution
  -q, --quiet           Suppress output

Examples:
  npx tsx tools/pat-cli.ts stats -i questions.json
  npx tsx tools/pat-cli.ts stats -i questions.json --breakdown --distribution
`);
}

function printDistribution(questions: GenerationResult["questions"]): void {
  const dist = [0, 0, 0, 0];
  for (const q of questions) {
    dist[q.correctIndex]++;
  }

  console.log("\nAnswer Distribution:");
  const total = questions.length;
  for (let i = 0; i < 4; i++) {
    const pct = ((dist[i] / total) * 100).toFixed(1);
    const bar = "█".repeat(Math.round(dist[i] / total * 30));
    console.log(`  Option ${i}: ${String(dist[i]).padStart(5)} (${pct}%) ${bar}`);
  }
}

function printBreakdown(questions: GenerationResult["questions"]): void {
  const byCategory: Record<string, { total: number; correct: number; avgTime: number }> = {};
  const byDifficulty: Record<string, { total: number; correct: number }> = {};

  for (const q of questions) {
    // Category stats
    if (!byCategory[q.category]) {
      byCategory[q.category] = { total: 0, correct: 0, avgTime: 0 };
    }
    byCategory[q.category].total++;
    byCategory[q.category].avgTime += q.timeTarget;

    // Difficulty stats
    if (!byDifficulty[q.difficulty]) {
      byDifficulty[q.difficulty] = { total: 0, correct: 0 };
    }
    byDifficulty[q.difficulty].total++;
  }

  console.log("\nBy Category:");
  for (const [cat, stats] of Object.entries(byCategory)) {
    const avgTime = (stats.avgTime / stats.total).toFixed(0);
    console.log(`  ${cat.padEnd(20)} ${String(stats.total).padStart(5)} questions, ~${avgTime}s avg`);
  }

  console.log("\nBy Difficulty:");
  for (const [diff, stats] of Object.entries(byDifficulty)) {
    const pct = ((stats.total / questions.length) * 100).toFixed(1);
    console.log(`  ${diff.padEnd(10)} ${String(stats.total).padStart(5)} (${pct}%)`);
  }
}

export async function runStats(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      input: { type: "string", short: "i" },
      breakdown: { type: "boolean", short: "b", default: false },
      distribution: { type: "boolean", default: false },
      quiet: { type: "boolean", short: "q", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: false,
  });

  if (values.help || !values.input) {
    printHelp();
    return;
  }

  const jsonContent = await readFile(values.input, "utf-8");
  const data: GenerationResult = JSON.parse(jsonContent);

  if (!values.quiet) {
    console.log(`\nPAT Question Statistics`);
    console.log(`${"─".repeat(40)}`);
    console.log(`  File: ${values.input}`);
    console.log(`  Generated: ${data.generatedAt}`);
    console.log(`  Seed: ${data.seed}`);
    console.log(`  Total questions: ${data.stats.total}`);

    if (values.breakdown) {
      printBreakdown(data.questions);
    }

    if (values.distribution) {
      printDistribution(data.questions);
    }
  }
}
