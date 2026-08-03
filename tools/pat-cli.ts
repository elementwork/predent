#!/usr/bin/env node

import { runGenerate } from "./pat-commands/generate.js";
import { runConvert } from "./pat-commands/convert.js";
import { runValidate } from "./pat-commands/validate.js";
import { runStats } from "./pat-commands/stats.js";
import { runBenchmark } from "./pat-commands/benchmark.js";
import { runStandalone } from "./pat-commands/standalone.js";

const COMMANDS = ["generate", "convert", "validate", "stats", "benchmark", "standalone"] as const;

function printUsage() {
  console.log(`
PAT Question Generator CLI

Usage:
  npx tsx tools/pat-cli.ts <command> [options]

Commands:
  generate    Generate PAT questions (HTML/JSON)
  convert     Convert JSON to HTML
  standalone  Build a self-contained offline practice HTML file
  validate    Validate questions for correctness
  stats       Show statistics about questions
  benchmark   Test generator performance

Examples:
  npx tsx tools/pat-cli.ts generate -n 100
  npx tsx tools/pat-cli.ts convert -i questions.json -o review.html
  npx tsx tools/pat-cli.ts standalone -n 60 -o pat-practice.html
  npx tsx tools/pat-cli.ts validate -i questions.json
  npx tsx tools/pat-cli.ts stats -i questions.json
  npx tsx tools/pat-cli.ts benchmark -n 1000

Run 'npx tsx tools/pat-cli.ts <command> --help' for command-specific help.
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    printUsage();
    process.exit(0);
  }

  if (!COMMANDS.includes(command as typeof COMMANDS[number])) {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }

  try {
    switch (command) {
      case "generate":
        await runGenerate(args.slice(1));
        break;
      case "convert":
        await runConvert(args.slice(1));
        break;
      case "validate":
        await runValidate(args.slice(1));
        break;
      case "stats":
        await runStats(args.slice(1));
        break;
      case "benchmark":
        await runBenchmark(args.slice(1));
        break;
      case "standalone":
        await runStandalone(args.slice(1));
        break;
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
