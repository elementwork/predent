import { parseArgs } from "node:util";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { build } from "esbuild";
import type { QuestionCategory } from "../pat-types.js";
import { generateQuestions } from "./generate.js";
import { renderHTML } from "../pat-renderers/html-renderer.js";

const TOOLS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

function printHelp() {
  console.log(`
Build a Self-Contained PAT Practice HTML File

Creates a single .html file with all question generation, rendering, and
answer logic embedded — no server, internet, or dev tools required.

Usage:
  npx tsx tools/pat-cli.ts standalone [options]

Options:
  -o, --output <path>         Output file (default: ./pat-standalone.html)
  -n, --count <number>        Questions per category (default: 10)
  -c, --categories <list>     Comma-separated categories or "all" (default: all)
  -d, --difficulty <dist>     Distribution: uniform, weighted, or custom (default: uniform)
  -s, --seed <number>         Random seed for reproducibility
  -t, --template <style>      Template: modern, classic, minimal, print (default: modern)
  --page-title <title>        Custom page title (default: PAT Practice — Standalone)
  --show-answers              Pre-show correct answers and explanations
  --no-explanations           Exclude explanations
  --answer-key                Add answer key page
  --page-numbers              Add page numbers
  --page-size <size>          Paper size: a4, letter (default: a4)
  -q, --quiet                 Suppress output

Examples:
  npx tsx tools/pat-cli.ts standalone -n 60 -o pat-practice.html
  npx tsx tools/pat-cli.ts standalone -c cube_counting,angle_ranking -n 20
  npx tsx tools/pat-cli.ts standalone -s 42 --show-answers --answer-key
`);
}

const STANDALONE_INIT = `
<script>
(function () {
  function makeCard(oldCard, seed, counter) {
    var category = oldCard.getAttribute('data-category') || 'keyholes';
    var difficulty = oldCard.getAttribute('data-difficulty') || 'easy';
    var newSeed = seed + 7919 * (counter + 1);
    var problem = window.PAT_ENGINE.generateProblem(category, { seed: newSeed, difficulty: difficulty });
    var correctIndex = window.PAT_ENGINE.getCorrectAnswer(category, { seed: newSeed, difficulty: difficulty });
    var hasExplanation = oldCard.querySelector('.explanation') !== null;
    var explanation = hasExplanation
      ? window.PAT_ENGINE.generateExplanation(category, problem, correctIndex, 'detailed')
      : undefined;
    var question = {
      id: oldCard.getAttribute('data-question-id') || '',
      category: category,
      difficulty: difficulty,
      seed: newSeed,
      correctIndex: correctIndex,
      timeTarget: 0,
      options: [],
      metadata: problem,
      explanation: explanation,
    };
    var wrapper = document.createElement('div');
    wrapper.innerHTML = window.PAT_ENGINE.renderQuestionCard(question, 0, { noExplanations: !hasExplanation, showAnswers: false });
    var newCard = wrapper.firstElementChild;
    var oldNumber = oldCard.querySelector('.question-number');
    var newNumber = newCard.querySelector('.question-number');
    if (oldNumber && newNumber) newNumber.textContent = oldNumber.textContent;
    newCard.setAttribute('data-seed', String(newSeed));
    return newCard;
  }

  function regenerateAll() {
    var counter = 0;
    document.querySelectorAll('.question-card').forEach(function (card) {
      var seed = parseInt(card.getAttribute('data-seed'), 10) || 1;
      card.parentNode.replaceChild(makeCard(card, seed, counter), card);
      counter += 1;
    });
    document.getElementById('scoreAnswered').textContent = '0';
    document.getElementById('scoreCorrect').textContent = '0';
    if (typeof hideAllAnswers === 'function') hideAllAnswers();
    if (typeof buildAnswerKey === 'function') buildAnswerKey();
    var btn = document.getElementById('btnRegenerate');
    if (btn) btn.textContent = 'Regenerate (seed +' + (7919 * counter) + ')';
  }

  function init() {
    var controls = document.querySelector('.controls');
    if (!controls) return;
    var button = document.createElement('button');
    button.id = 'btnRegenerate';
    button.textContent = 'Regenerate Questions';
    button.onclick = regenerateAll;
    controls.appendChild(button);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
`;

export async function runStandalone(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      output: { type: "string", short: "o", default: "./pat-standalone.html" },
      count: { type: "string", short: "n", default: "10" },
      categories: { type: "string", short: "c", default: "all" },
      difficulty: { type: "string", short: "d", default: "uniform" },
      seed: { type: "string", short: "s" },
      template: { type: "string", short: "t", default: "modern" },
      "page-title": { type: "string", default: "PAT Practice — Standalone" },
      "show-answers": { type: "boolean", default: false },
      explanations: { type: "boolean", default: true },
      "answer-key": { type: "boolean", default: false },
      "page-numbers": { type: "boolean", default: false },
      "page-size": { type: "string", default: "a4" },
      quiet: { type: "boolean", short: "q", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: false,
  });

  if (values.help) {
    printHelp();
    return;
  }

  if (!values.quiet) {
    console.log("Bundling PAT engine...");
  }

  const bundle = await build({
    entryPoints: [join(TOOLS_DIR, "pat-standalone/entry.ts")],
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    target: "es2020",
    minify: true,
    logLevel: "silent",
  });
  const engineJs = bundle.outputFiles[0].text;

  const categories =
    values.categories === "all"
      ? "all"
      : (values.categories!.split(",").map((c) => c.trim()) as QuestionCategory[]);

  const result = await generateQuestions({
    count: parseInt(values.count!, 10),
    categories,
    difficulty: values.difficulty!,
    format: "html",
    output: "./",
    seed: values.seed ? parseInt(values.seed, 10) : undefined,
    validate: false,
    template: values.template as "modern" | "classic" | "minimal" | "print",
    split: false,
    perFile: 100,
    explanations: values.explanations!,
    explanationDepth: "detailed",
    print: false,
    pageSize: values["page-size"]!,
    pageNumbers: values["page-numbers"]!,
    answerKey: values["answer-key"]!,
    showAnswers: values["show-answers"]!,
    quiet: values.quiet!,
  });

  const pageHtml = renderHTML(result, {
    template: values.template as "modern" | "classic" | "minimal" | "print",
    pageSize: values["page-size"] as "a4" | "letter",
    pageNumbers: values["page-numbers"]!,
    answerKey: values["answer-key"]!,
    showAnswers: values["show-answers"]!,
    pageTitle: values["page-title"]!,
    noExplanations: !values.explanations,
  });

  const html = pageHtml
    .replace(
      "</body>",
      `<script>${engineJs}</script>${STANDALONE_INIT}</body>`
    )
    .replace(
      /<p class="footer-note">[^<]*<\/p>/,
      '<p class="footer-note">Standalone PAT practice — questions are generated in your browser (seed-based, deterministic).</p>'
    );

  await writeFile(values.output!, html);

  if (!values.quiet) {
    console.log(`Standalone HTML written to: ${values.output}`);
    console.log(`  Questions: ${result.stats.total}`);
    console.log(`  File size: ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
    console.log("  Open it in any browser. Works fully offline.");
  }
}
