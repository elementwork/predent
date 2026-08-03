import { parseArgs } from "node:util";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { GenerationResult } from "../pat-types.js";
import { renderHTMLFiles } from "../pat-renderers/html-renderer.js";

function printHelp() {
  console.log(`
Convert JSON to HTML

Usage:
  npx tsx tools/pat-cli.ts convert -i <input> [options]

Options:
  -i, --input <file>          Input JSON file (required)
  -o, --output <path>         Output path (default: ./pat-output/)
  -t, --template <style>      Template: modern, classic, minimal, print (default: modern)
  --split                     Split by category
  --per-file <number>         Questions per file (default: 100)
  --filter-categories <list>  Filter by categories
  --filter-difficulty <list>  Filter by difficulties
  --page-title <title>        Custom page title (default: PAT Question Bank)
  --no-explanations           Exclude explanations
  --show-answers              Pre-show answers
  --print                     Print format
  --page-size <size>          Paper size: a4, letter (default: a4)
  --page-numbers              Add page numbers
  --answer-key                Add answer key page
  -q, --quiet                 Suppress output

Examples:
  npx tsx tools/pat-cli.ts convert -i questions.json -o review.html
  npx tsx tools/pat-cli.ts convert -i questions.json --filter-categories keyholes
  npx tsx tools/pat-cli.ts convert -i questions.json --print --answer-key
`);
}

export async function runConvert(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      input: { type: "string", short: "i" },
      output: { type: "string", short: "o", default: "./pat-output/" },
      template: { type: "string", short: "t", default: "modern" },
      split: { type: "boolean", default: false },
      "per-file": { type: "string", default: "100" },
      "filter-categories": { type: "string" },
      "filter-difficulty": { type: "string" },
      "page-title": { type: "string", default: "PAT Question Bank" },
      explanations: { type: "boolean", default: true },
      "show-answers": { type: "boolean", default: false },
      print: { type: "boolean", default: false },
      "page-size": { type: "string", default: "a4" },
      "page-numbers": { type: "boolean", default: false },
      "answer-key": { type: "boolean", default: false },
      quiet: { type: "boolean", short: "q", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: false,
  });

  if (values.help || !values.input) {
    printHelp();
    return;
  }

  if (!values.quiet) {
    console.log(`Reading JSON from: ${values.input}`);
  }

  const jsonContent = await readFile(values.input, "utf-8");
  const data: GenerationResult = JSON.parse(jsonContent);

  // Apply filters
  let questions = data.questions;

  if (values["filter-categories"]) {
    const cats = values["filter-categories"].split(",").map((c) => c.trim());
    questions = questions.filter((q) => cats.includes(q.category));
  }

  if (values["filter-difficulty"]) {
    const diffs = values["filter-difficulty"].split(",").map((d) => d.trim());
    questions = questions.filter((q) => diffs.includes(q.difficulty));
  }

  const filteredData: GenerationResult = {
    ...data,
    stats: {
      ...data.stats,
      total: questions.length,
    },
    questions,
  };

  await mkdir(values.output!, { recursive: true });
  const files = renderHTMLFiles(filteredData, {
    template: values.template as "modern" | "classic" | "minimal" | "print",
    pageSize: values["page-size"] as "a4" | "letter",
    pageNumbers: values["page-numbers"]!,
    answerKey: values["answer-key"]!,
    showAnswers: values["show-answers"]!,
    pageTitle: values["page-title"]!,
    noExplanations: !values.explanations,
    split: values.split!,
    perFile: parseInt(values["per-file"]!, 10),
  });
  for (const file of files) {
    const htmlPath = join(values.output!, file.path);
    await writeFile(htmlPath, file.content);
    if (!values.quiet) {
      console.log(`HTML written to: ${htmlPath}`);
    }
  }
}
