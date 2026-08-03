import { parseArgs } from "node:util";
import { generateProblem } from "../../server/lib/pat-generation/index.js";
import type { QuestionCategory, Difficulty } from "../pat-types.js";
import { ALL_CATEGORIES } from "../pat-types.js";

function printHelp() {
  console.log(`
Benchmark PAT Question Generators

Usage:
  npx tsx tools/pat-cli.ts benchmark [options]

Options:
  -n, --iterations <number>  Iterations per category (default: 1000)
  -c, --categories <list>    Comma-separated categories or "all" (default: all)
  -d, --difficulty <level>   Difficulty: easy, medium, hard (default: medium)
  -q, --quiet                Suppress output

Examples:
  npx tsx tools/pat-cli.ts benchmark -n 100
  npx tsx tools/pat-cli.ts benchmark -c keyholes,angle_ranking -d hard
  npx tsx tools/pat-cli.ts benchmark -n 5000
`);
}

async function benchmarkCategory(
  category: QuestionCategory,
  difficulty: Difficulty,
  iterations: number
): Promise<{ time: number; opsPerSec: number }> {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    const seed = i + 1;
    generateProblem(category, { seed, difficulty });
  }

  const elapsed = performance.now() - start;
  const opsPerSec = (iterations / elapsed) * 1000;

  return { time: elapsed, opsPerSec };
}

export async function runBenchmark(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      iterations: { type: "string", short: "n", default: "1000" },
      categories: { type: "string", short: "c", default: "all" },
      difficulty: { type: "string", short: "d", default: "medium" },
      quiet: { type: "boolean", short: "q", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: false,
  });

  if (values.help) {
    printHelp();
    return;
  }

  const iterations = parseInt(values.iterations!, 10);
  const difficulty = values.difficulty as Difficulty;
  const categories =
    values.categories === "all"
      ? ALL_CATEGORIES
      : values.categories!.split(",").map((c) => c.trim()) as QuestionCategory[];

  if (!values.quiet) {
    console.log(`\nPAT Generator Benchmark`);
    console.log(`${"─".repeat(40)}`);
    console.log(`  Iterations: ${iterations}`);
    console.log(`  Difficulty: ${difficulty}`);
    console.log(`  Categories: ${categories.join(", ")}`);
    console.log("");
  }

  const results: Array<{
    category: QuestionCategory;
    time: number;
    opsPerSec: number;
  }> = [];

  for (const category of categories) {
    const result = await benchmarkCategory(category, difficulty, iterations);
    results.push({ category, ...result });

    if (!values.quiet) {
      const timePerOp = (result.time / iterations).toFixed(2);
      console.log(
        `  ${category.padEnd(20)} ${String(Math.round(result.opsPerSec)).padStart(8)} ops/sec (${timePerOp}ms/op)`
      );
    }
  }

  if (!values.quiet) {
    console.log(`\n${"─".repeat(40)}`);

    const totalTime = results.reduce((sum, r) => sum + r.time, 0);
    const totalOps = results.reduce((sum, r) => sum + r.opsPerSec * r.time / 1000, 0);
    const avgOpsPerSec = totalOps / results.length;

    console.log(`  Total time: ${totalTime.toFixed(0)}ms`);
    console.log(`  Avg ops/sec: ${Math.round(avgOpsPerSec)}`);
  }
}
