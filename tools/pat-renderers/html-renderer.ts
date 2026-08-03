import type { GenerationResult } from "../pat-types.js";
import { renderQuestionCard, renderAnswerEntry } from "./question-card.js";
import { renderPageScript } from "./page-script.js";

export type TemplateStyle = "modern" | "classic" | "minimal" | "print";

export interface RenderOptions {
  template?: TemplateStyle;
  pageSize?: "a4" | "letter";
  pageNumbers?: boolean;
  answerKey?: boolean;
  showAnswers?: boolean;
  pageTitle?: string;
  noExplanations?: boolean;
  startIndex?: number;
  split?: boolean;
  perFile?: number;
}

export interface RenderedFile {
  path: string;
  content: string;
}

const TEMPLATE_CSS: Record<TemplateStyle, string> = {
  modern: `
    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --text: #1e293b;
      --text-secondary: #64748b;
      --text-tertiary: #94a3b8;
      --border: #e2e8f0;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --primary-soft: #eff6ff;
      --correct: #10b981;
      --incorrect: #ef4444;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    body { background: var(--bg); }
    .question-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .question-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .option-btn { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; }
    .option-btn:hover { border-color: var(--primary); background: var(--primary-soft); }
    .option-btn.selected { border-color: var(--primary); background: #dbeafe; }
    select, button { border-radius: 6px; }
    .btn-show-answer { color: var(--primary); }
  `,
  classic: `
    :root {
      --bg: #ffffff;
      --surface: #ffffff;
      --text: #111827;
      --text-secondary: #374151;
      --text-tertiary: #6b7280;
      --border: #9ca3af;
      --primary: #1f2937;
      --primary-hover: #374151;
      --primary-soft: #f3f4f6;
      --correct: #047857;
      --incorrect: #b91c1c;
      --font: Georgia, "Times New Roman", serif;
    }
    body { background: var(--bg); }
    .question-card { background: var(--surface); border: 1px solid var(--border); border-radius: 0; }
    .option-btn { background: var(--surface); border: 1px solid var(--border); border-radius: 0; }
    .option-btn:hover { background: var(--primary-soft); }
    .option-btn.selected { border-color: var(--text); background: var(--primary-soft); }
    select, button { border-radius: 0; }
    .btn-show-answer { color: var(--text); text-decoration: underline; }
    .question-difficulty { border: 1px solid var(--border); }
  `,
  minimal: `
    :root {
      --bg: #ffffff;
      --surface: #ffffff;
      --text: #1a1a1a;
      --text-secondary: #404040;
      --text-tertiary: #737373;
      --border: #d4d4d4;
      --primary: #1a1a1a;
      --primary-hover: #404040;
      --primary-soft: #f5f5f5;
      --correct: #166534;
      --incorrect: #991b1b;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    body { background: var(--bg); }
    .question-card { background: var(--surface); border: 1px solid var(--border); border-radius: 0; }
    .question-body { padding: 0.5rem 0.75rem; }
    .option-btn { background: var(--surface); border: none; border-bottom: 1px solid var(--border); border-radius: 0; }
    .option-btn:hover { background: var(--primary-soft); }
    .option-btn.selected { background: var(--primary-soft); }
    select, button { border-radius: 0; }
    .btn-show-answer { color: var(--text); }
  `,
  print: `
    :root {
      --bg: #ffffff;
      --surface: #ffffff;
      --text: #111827;
      --text-secondary: #374151;
      --text-tertiary: #6b7280;
      --border: #b0b7bf;
      --primary: #1f2937;
      --primary-hover: #374151;
      --primary-soft: #f3f4f6;
      --correct: #047857;
      --incorrect: #b91c1c;
      --font: Georgia, "Times New Roman", serif;
    }
    body { background: var(--bg); font-size: 0.95rem; }
    .questions-grid { grid-template-columns: 1fr; max-width: 800px; }
    .question-card { background: var(--surface); border: 1px solid var(--border); border-radius: 0; break-inside: avoid; }
    .option-btn { background: var(--surface); border: 1px solid var(--border); border-radius: 0; }
    .option-btn:hover { background: var(--primary-soft); }
    .option-btn.selected { border-color: var(--text); background: var(--primary-soft); }
    select, button { border-radius: 0; }
    .btn-show-answer { color: var(--text); text-decoration: underline; }
  `,
};

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font);
    color: var(--text);
    line-height: 1.6;
    padding: 2rem;
  }

  .container { max-width: 1200px; margin: 0 auto; }

  header { text-align: center; margin-bottom: 1.5rem; }

  header h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }

  .stats-bar, .score-bar {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .score-bar {
    margin-top: 0.5rem;
    font-weight: 600;
  }

  .score-bar .score-value { color: var(--primary); }

  .controls {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  select, button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text);
    font-family: var(--font);
  }

  button:hover { background: var(--primary); color: white; border-color: var(--primary); }

  .questions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 1.5rem;
  }

  .question-card { overflow: hidden; transition: box-shadow 0.2s; }

  .question-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
    font-size: 0.85rem;
  }

  .question-number { font-weight: 700; color: var(--primary); }

  .question-category { flex: 1; text-transform: capitalize; color: var(--text-secondary); }

  .question-difficulty {
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .diff-easy { background: #dcfce7; color: #166534; }
  .diff-medium { background: #fef9c3; color: #854d0e; }
  .diff-hard { background: #fee2e2; color: #991b1b; }

  .question-prompt {
    padding: 0.75rem 1rem 0;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .question-body { padding: 0.75rem 1rem; }

  .question-stem { display: flex; justify-content: center; margin-bottom: 0.75rem; }

  .stem-tfe { display: flex; align-items: center; gap: 1rem; }

  .stem-views { display: flex; gap: 0.5rem; }

  .view-grid { text-align: center; }

  .view-grid span { font-size: 0.7rem; color: var(--text-tertiary); display: block; margin-top: 0.15rem; }

  .stem-angles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }

  .diagram-svg { max-width: 100%; height: auto; }

  .question-options { display: flex; flex-direction: column; gap: 0.5rem; }

  .option-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.75rem;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
  }

  .option-btn.selected.correct-answer { border-color: var(--correct); background: #ecfdf5; }
  .option-btn.selected.wrong-answer { border-color: var(--incorrect); background: #fef2f2; }
  .question-card.revealed .option-btn[data-correct="true"] { border-color: var(--correct); background: #ecfdf5; }

  .option-letter {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--primary-soft);
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text);
    flex-shrink: 0;
  }

  .option-content { display: flex; align-items: center; justify-content: center; flex: 1; min-width: 0; }

  .option-content .diagram-svg { width: 100%; max-width: 140px; }

  .option-check { color: var(--correct); font-weight: 700; width: 1rem; flex-shrink: 0; }

  .option-number { font-size: 1.25rem; font-weight: 700; }

  .question-feedback {
    padding: 0.5rem 1rem;
    margin: 0 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .question-card.correct .question-feedback { background: #ecfdf5; color: var(--correct); }
  .question-card.incorrect .question-feedback { background: #fef2f2; color: var(--incorrect); }

  .explanation {
    padding: 1rem;
    background: var(--primary-soft);
    border-top: 1px solid var(--border);
    font-size: 0.9rem;
  }

  .question-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--border);
    font-size: 0.85rem;
    flex-wrap: wrap;
  }

  .btn-show-answer {
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
    padding: 0;
  }

  .btn-check {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .btn-check:disabled { opacity: 0.5; cursor: default; }

  .time-target { color: var(--text-tertiary); margin-left: auto; }

  .answer-key {
    margin-top: 3rem;
    padding: 1.5rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .answer-key h2 { margin-bottom: 1rem; }

  .answer-key table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }

  .answer-key th, .answer-key td {
    text-align: left;
    padding: 0.5rem;
    border-bottom: 1px solid var(--border);
  }

  .answer-key th { color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; }

  .answer-key .answer-letter { font-weight: 700; color: var(--primary); }

  .footer-note {
    text-align: center;
    margin-top: 3rem;
    font-size: 0.8rem;
    color: var(--text-tertiary);
  }

  @media print {
    .controls, .score-bar { display: none !important; }
    .explanation { display: block !important; }
    .answer-key { display: block !important; }
    .question-card { break-inside: avoid; }
    body { padding: 0; }
  }
`;

function templateCss(template: TemplateStyle): string {
  return `${BASE_CSS}\n${TEMPLATE_CSS[template]}`;
}

function renderFilterBar(): string {
  return `
    <div class="filter-group">
      <label>Category:</label>
      <select id="filterCategory" onchange="filterQuestions()">
        <option value="all">All Categories</option>
        <option value="keyholes">Keyholes</option>
        <option value="tfe">Top-Front-End</option>
        <option value="angle_ranking">Angle Ranking</option>
        <option value="hole_punching">Hole Punching</option>
        <option value="cube_counting">Cube Counting</option>
        <option value="pattern_folding">Pattern Folding</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Difficulty:</label>
      <select id="filterDifficulty" onchange="filterQuestions()">
        <option value="all">All Difficulties</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>
    <div class="filter-group">
      <button onclick="showAllAnswers()">Show All Answers</button>
      <button onclick="hideAllAnswers()">Hide All Answers</button>
      <button onclick="toggleAnswerKey()">Show Answer Key</button>
      <button onclick="window.print()">Print</button>
    </div>`;
}

export function renderHTML(data: GenerationResult, options: RenderOptions = {}): string {
  const template: TemplateStyle = options.template ?? "modern";
  const pageSize = options.pageSize ?? "a4";
  const pageTitle = options.pageTitle ?? "PAT Question Bank";
  const pageNumbers = options.pageNumbers ?? false;
  const answerKey = options.answerKey ?? false;
  const startIndex = options.startIndex ?? 0;

  const questionsHtml = data.questions
    .map((q, i) =>
      renderQuestionCard(q, startIndex + i, {
        noExplanations: options.noExplanations,
        showAnswers: options.showAnswers,
      })
    )
    .join("\n");

  const answerKeyHtml = answerKey
    ? `
    <div class="answer-key" style="${options.showAnswers ? "display:block;" : "display:none;"}">
      <h2>Answer Key</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Category</th><th>Difficulty</th><th>Answer</th><th>Summary</th></tr>
        </thead>
        <tbody>
          ${data.questions.map((q, i) => renderAnswerEntry(q, startIndex + i)).join("\n")}
        </tbody>
      </table>
    </div>`
    : "";

  const pageRules = pageNumbers
    ? `@page { size: ${pageSize}; margin: 2cm; @bottom-center { content: "Page " counter(page) " of " counter(pages); color: #6b7280; font-size: 9pt; } }`
    : `@page { size: ${pageSize}; margin: 2cm; }`;

  return `<!DOCTYPE html>
<html lang="en" data-template="${template}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <style>
    ${templateCss(template)}
    ${pageRules}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${pageTitle}</h1>
      <div class="stats-bar">
        <span>${data.stats?.total ?? data.questions.length} questions</span>
        <span>Seed: ${data.seed ?? "—"}</span>
        <span>Generated: ${new Date(data.generatedAt ?? Date.now()).toLocaleDateString()}</span>
      </div>
      <div class="score-bar">
        <span>Answered: <span class="score-value" id="scoreAnswered">0</span></span>
        <span>Correct: <span class="score-value" id="scoreCorrect">0</span></span>
        <span>Visible: <span class="score-value" id="visibleCount">${data.questions.length}</span></span>
      </div>
    </header>

    <div class="controls">
      ${renderFilterBar()}
    </div>

    <div class="questions-grid" id="questionsGrid">
      ${questionsHtml}
    </div>

    ${answerKeyHtml}

    <p class="footer-note">Generated with pat-cli (PAT Question Generator)</p>
  </div>

  <script>
${renderPageScript()}
  </script>
</body>
</html>`;
}

export function renderHTMLFiles(data: GenerationResult, options: RenderOptions = {}): RenderedFile[] {
  if (!options.split) {
    return [{ path: "index.html", content: renderHTML(data, options) }];
  }

  const perFile = Math.max(1, options.perFile ?? 100);
  const byCategory = new Map<string, GenerationResult["questions"]>();
  for (const q of data.questions) {
    const list = byCategory.get(q.category) ?? [];
    list.push(q);
    byCategory.set(q.category, list);
  }

  const files: RenderedFile[] = [];
  const links: string[] = [];
  let globalIndex = 0;

  for (const [category, questions] of byCategory) {
    const chunks: GenerationResult["questions"][] = [];
    for (let i = 0; i < questions.length; i += perFile) {
      chunks.push(questions.slice(i, i + perFile));
    }
    const categoryLabel = category.replace(/_/g, " ");

    chunks.forEach((chunk, ci) => {
      const path =
        chunks.length > 1 ? `${category}-${ci + 1}.html` : `${category}.html`;
      const chunkData: GenerationResult = {
        ...data,
        stats: { ...data.stats, total: chunk.length },
        questions: chunk,
      };
      files.push({
        path,
        content: renderHTML(chunkData, {
          ...options,
          split: false,
          startIndex: globalIndex,
          pageTitle: `${pageTitleFor(options)} — ${categoryLabel}`,
        }),
      });
      links.push(
        `<li><a href="${path}">${categoryLabel} — Part ${ci + 1} (${chunk.length} questions)</a></li>`
      );
      globalIndex += chunk.length;
    });
  }

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitleFor(options)} — Question Sets</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 3rem; }
    .container { max-width: 640px; margin: 0 auto; }
    h1 { margin-bottom: 1rem; }
    ul { list-style: none; padding: 0; }
    li { margin: 0.5rem 0; }
    a { color: #3b82f6; text-decoration: none; font-size: 1.05rem; }
    a:hover { text-decoration: underline; }
    .stats-bar { color: #64748b; margin-bottom: 2rem; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${pageTitleFor(options)} — Question Sets</h1>
    <div class="stats-bar">${data.stats?.total ?? data.questions.length} questions total · ${byCategory.size} categories</div>
    <ul>
      ${links.join("\n")}
    </ul>
  </div>
</body>
</html>`;

  files.unshift({ path: "index.html", content: indexHtml });
  return files;
}

function pageTitleFor(options: RenderOptions): string {
  return options.pageTitle ?? "PAT Question Bank";
}
