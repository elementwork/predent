import {
  generateProblem,
  getCorrectAnswer,
} from "../../server/lib/pat-generation/index.js";
import { generateExplanation } from "../pat-explanations/index.js";
import { renderQuestionCard } from "../pat-renderers/question-card.js";
import { ALL_CATEGORIES } from "../pat-types.js";

declare global {
  interface Window {
    PAT_ENGINE: {
      generateProblem: typeof generateProblem;
      getCorrectAnswer: typeof getCorrectAnswer;
      generateExplanation: typeof generateExplanation;
      renderQuestionCard: typeof renderQuestionCard;
      ALL_CATEGORIES: typeof ALL_CATEGORIES;
    };
  }
}

window.PAT_ENGINE = {
  generateProblem,
  getCorrectAnswer,
  generateExplanation,
  renderQuestionCard,
  ALL_CATEGORIES,
};
