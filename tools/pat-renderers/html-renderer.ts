import type { GenerationResult, GeneratedQuestion } from "../pat-types.js";
import { renderSVGPlaceholder } from "./html-core.js";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderQuestionCard(question: GeneratedQuestion, index: number): string {
  const svg = renderSVGPlaceholder(question, 200);
  const difficultyClass =
    question.difficulty === "easy"
      ? "diff-easy"
      : question.difficulty === "medium"
      ? "diff-medium"
      : "diff-hard";

  let explanationHtml = "";
  if (question.explanation) {
    explanationHtml = `
      <div class="explanation" style="display:none;">
        <p><strong>Summary:</strong> ${escapeHtml(question.explanation.summary)}</p>
        <p><strong>Correct Answer:</strong> ${escapeHtml(question.explanation.correct)}</p>
        ${
          question.explanation.concepts?.length
            ? `<p><strong>Concepts:</strong> ${question.explanation.concepts.map(escapeHtml).join(", ")}</p>`
            : ""
        }
        ${
          question.explanation.tips?.length
            ? `<p><strong>Tips:</strong> ${question.explanation.tips.map(escapeHtml).join("; ")}</p>`
            : ""
        }
      </div>
    `;
  }

  return `
    <div class="question-card" data-category="${question.category}" data-difficulty="${question.difficulty}">
      <div class="question-header">
        <span class="question-number">#${index + 1}</span>
        <span class="question-category">${question.category.replace(/_/g, " ")}</span>
        <span class="question-difficulty ${difficultyClass}">${question.difficulty}</span>
      </div>
      <div class="question-body">
        <div class="question-svg">${svg}</div>
        <div class="question-options">
          ${question.options
            .map(
              (opt, i) => `
            <button class="option-btn" data-index="${i}" onclick="selectAnswer(this, ${i})">
              <span class="option-letter">${String.fromCharCode(65 + i)}</span>
              <span class="option-text">${escapeHtml(opt)}</span>
            </button>
          `
            )
            .join("")}
        </div>
      </div>
      ${explanationHtml}
      <div class="question-footer">
        <button class="btn-show-answer" onclick="toggleExplanation(this)">Show Explanation</button>
        <span class="time-target">Target: ${question.timeTarget}s</span>
      </div>
    </div>
  `;
}

function renderFilterBar(): string {
  return `
    <div class="filter-bar">
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
      </div>
    </div>
  `;
}

export function renderHTML(data: GenerationResult): string {
  const questions = data.questions;

  const questionsHtml = questions.map((q, i) => renderQuestionCard(q, i)).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PAT Question Bank</title>
  <style>
    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --text: #1e293b;
      --text-secondary: #64748b;
      --border: #e2e8f0;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --easy: #22c55e;
      --medium: #eab308;
      --hard: #ef4444;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 2rem;
    }

    header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .stats-bar {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .filter-bar {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
      padding: 1rem;
      background: var(--surface);
      border-radius: 8px;
      border: 1px solid var(--border);
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
      border-radius: 6px;
      background: var(--surface);
      cursor: pointer;
      font-size: 0.9rem;
    }

    button:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .questions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .question-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }

    .question-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .question-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.85rem;
    }

    .question-number {
      font-weight: 700;
      color: var(--primary);
    }

    .question-category {
      flex: 1;
      text-transform: capitalize;
      color: var(--text-secondary);
    }

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

    .question-body {
      padding: 1rem;
    }

    .question-svg {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .question-svg svg {
      max-width: 100%;
      height: auto;
    }

    .question-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .option-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    }

    .option-btn:hover {
      border-color: var(--primary);
      background: #eff6ff;
    }

    .option-btn.selected {
      border-color: var(--primary);
      background: #dbeafe;
    }

    .option-letter {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--bg);
      font-weight: 600;
      font-size: 0.85rem;
    }

    .explanation {
      padding: 1rem;
      background: #f0f9ff;
      border-top: 1px solid var(--border);
      font-size: 0.9rem;
    }

    .question-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--border);
      font-size: 0.85rem;
    }

    .btn-show-answer {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      font-weight: 500;
    }

    .time-target {
      color: var(--text-secondary);
    }

    @media print {
      .filter-bar, .btn-show-answer { display: none; }
      .question-card { break-inside: avoid; }
      .explanation { display: block !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>PAT Question Bank</h1>
      <div class="stats-bar">
        <span>${data.stats.total} questions</span>
        <span>Seed: ${data.seed}</span>
        <span>Generated: ${new Date(data.generatedAt).toLocaleDateString()}</span>
      </div>
    </header>

    ${renderFilterBar()}

    <div class="questions-grid" id="questionsGrid">
      ${questionsHtml}
    </div>
  </div>

  <script>
    function selectAnswer(btn, index) {
      const card = btn.closest('.question-card');
      card.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    }

    function toggleExplanation(btn) {
      const card = btn.closest('.question-card');
      const explanation = card.querySelector('.explanation');
      if (explanation) {
        const isHidden = explanation.style.display === 'none';
        explanation.style.display = isHidden ? 'block' : 'none';
        btn.textContent = isHidden ? 'Hide Explanation' : 'Show Explanation';
      }
    }

    function showAllAnswers() {
      document.querySelectorAll('.explanation').forEach(e => e.style.display = 'block');
      document.querySelectorAll('.btn-show-answer').forEach(b => b.textContent = 'Hide Explanation');
    }

    function hideAllAnswers() {
      document.querySelectorAll('.explanation').forEach(e => e.style.display = 'none');
      document.querySelectorAll('.btn-show-answer').forEach(b => b.textContent = 'Show Explanation');
    }

    function filterQuestions() {
      const category = document.getElementById('filterCategory').value;
      const difficulty = document.getElementById('filterDifficulty').value;

      document.querySelectorAll('.question-card').forEach(card => {
        const matchCat = category === 'all' || card.dataset.category === category;
        const matchDiff = difficulty === 'all' || card.dataset.difficulty === difficulty;
        card.style.display = matchCat && matchDiff ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;
}
