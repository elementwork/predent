import type { GeneratedQuestion } from "../pat-types.js";
import { renderStemSVG, renderOptionContent } from "./svg-renderer.js";

export interface CardOptions {
  noExplanations?: boolean;
  showAnswers?: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getPrompt(question: GeneratedQuestion): string {
  const meta = question.metadata as Record<string, unknown>;
  switch (question.category) {
    case "keyholes":
      return "Which keyhole matches this object?";
    case "tfe":
      return `Which is the ${String(meta.missingView ?? "missing")} view?`;
    case "angle_ranking":
      return "Rank the angles from smallest to largest.";
    case "hole_punching":
      return "Which option shows the unfolded paper?";
    case "cube_counting": {
      const answer = Number(meta.answer ?? "?");
      return `How many cubes are painted on exactly ${Number.isNaN(answer) ? "?" : answer} sides?`;
    }
    case "pattern_folding":
      return "Which cube does this net fold into?";
    default:
      return "Select the correct answer.";
  }
}

export function renderQuestionCard(
  question: GeneratedQuestion,
  index: number,
  opts: CardOptions = {}
): string {
  const difficultyClass =
    question.difficulty === "easy"
      ? "diff-easy"
      : question.difficulty === "medium"
        ? "diff-medium"
        : "diff-hard";

  const revealed = opts.showAnswers ? " revealed" : "";
  const explanationStyle = opts.showAnswers ? "display:block;" : "display:none;";
  const explanationHtml = opts.noExplanations
    ? ""
    : renderExplanation(question, explanationStyle);

  const optionsHtml = [0, 1, 2, 3]
    .map((i) => {
      const letter = String.fromCharCode(65 + i);
      const isCorrect = i === question.correctIndex;
      return `<button class="option-btn" data-index="${i}" data-correct="${isCorrect}"${opts.showAnswers && isCorrect ? " data-revealed=\"true\"" : ""} onclick="selectOption(this)">
        <span class="option-letter">${letter}</span>
        <span class="option-content">${renderOptionContent(question, i)}</span>
        <span class="option-check">${isCorrect ? "&#10003;" : ""}</span>
      </button>`;
    })
    .join("");

  return `<div class="question-card${revealed}" data-category="${question.category}" data-difficulty="${question.difficulty}" data-correct-index="${question.correctIndex}" data-seed="${question.seed}">
    <div class="question-header">
      <span class="question-number">#${index + 1}</span>
      <span class="question-category">${question.category.replace(/_/g, " ")}</span>
      <span class="question-difficulty ${difficultyClass}">${question.difficulty}</span>
    </div>
    <div class="question-prompt">${escapeHtml(getPrompt(question))}</div>
    <div class="question-body">
      <div class="question-stem">${renderStemSVG(question)}</div>
      <div class="question-options">${optionsHtml}</div>
    </div>
    <div class="question-feedback" style="display:none;"></div>
    ${explanationHtml}
    <div class="question-footer">
      <button class="btn-check" onclick="checkAnswer(this)">Check Answer</button>
      ${explanationHtml ? `<button class="btn-show-answer" onclick="toggleExplanation(this)">Show Explanation</button>` : ""}
      <span class="time-target">Target: ${question.timeTarget}s</span>
    </div>
  </div>`;
}

export function renderExplanation(
  question: GeneratedQuestion,
  style = "display:none;"
): string {
  const e = question.explanation;
  if (!e) return "";

  return `<div class="explanation" style="${style}">
    ${e.summary ? `<p><strong>Summary:</strong> ${escapeHtml(e.summary)}</p>` : ""}
    ${e.correct ? `<p><strong>Correct Answer:</strong> ${escapeHtml(e.correct)}</p>` : ""}
    ${e.distractors?.length ? `<p><strong>Distractors:</strong> ${e.distractors.map(escapeHtml).join("; ")}</p>` : ""}
    ${e.concepts?.length ? `<p><strong>Concepts:</strong> ${e.concepts.map(escapeHtml).join(", ")}</p>` : ""}
    ${e.tips?.length ? `<p><strong>Tips:</strong> ${e.tips.map(escapeHtml).join("; ")}</p>` : ""}
  </div>`;
}

export function renderAnswerEntry(
  question: GeneratedQuestion,
  index: number
): string {
  const letter = String.fromCharCode(65 + question.correctIndex);
  const summary = question.explanation?.summary ?? "";
  return `<tr>
    <td>${index + 1}</td>
    <td>${question.category.replace(/_/g, " ")}</td>
    <td>${question.difficulty}</td>
    <td class="answer-letter">${letter}</td>
    <td>${escapeHtml(summary)}</td>
  </tr>`;
}
