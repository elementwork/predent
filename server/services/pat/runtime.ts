import {
  createPatRuntime,
  type GenerateRequest,
  type GeneratedPatQuestion,
  type PrivatePatQuestionRecord,
  type PublicPatQuestion,
  type PatSolutionPayload,
  type PatRuntimeInfo,
} from "../../../vendor/manipat/runtime/dist/index.js";

export interface PatRuntimeBoundary {
  getEngineInfo(): PatRuntimeInfo;
  generateQuestion(request: GenerateRequest): Promise<GeneratedPatQuestion>;
  generateCandidateGroup(
    request: GenerateRequest,
    maximumCount?: number
  ): Promise<readonly GeneratedPatQuestion[]>;
}

let runtimePromise: Promise<PatRuntimeBoundary> | undefined;

export type {
  PatRuntimeInfo,
  PatSolutionPayload,
  PrivatePatQuestionRecord,
  PublicPatQuestion,
};

const ALLOWED_EXPLANATION_TAG = /^<\/?(?:p|strong|h4|ul|li)>$/u;
const HTML_TAG = /<[^>]*>/gu;
const ALLOWED_EXPLANATION_TAGS = /<\/?(?:p|strong|h4|ul|li)>/gu;

/**
 * ManipAT explanations are deterministic HTML generated from escaped geometry
 * facts. Predent still validates the final markup at the trust boundary so a
 * future ManipAT change cannot silently introduce executable or attributed HTML.
 */
export const sanitizePatExplanationHtml = (html: string): string => {
  for (const match of html.matchAll(HTML_TAG)) {
    if (!ALLOWED_EXPLANATION_TAG.test(match[0])) {
      throw new Error(`ManipAT explanation contains disallowed markup: ${match[0]}`);
    }
  }

  const textOnly = html.replace(ALLOWED_EXPLANATION_TAGS, "");
  if (/[<>]/u.test(textOnly)) {
    throw new Error("ManipAT explanation contains malformed markup");
  }
  return html;
};

export const sanitizePatSolution = (
  solution: PatSolutionPayload
): PatSolutionPayload => ({
  ...solution,
  explanationHtml: sanitizePatExplanationHtml(solution.explanationHtml),
});

export const sanitizePrivatePatRecord = (
  record: PrivatePatQuestionRecord
): PrivatePatQuestionRecord => ({
  ...record,
  solution: sanitizePatSolution(record.solution),
});

const sanitizeGeneratedQuestion = (
  generated: GeneratedPatQuestion
): GeneratedPatQuestion => ({
  publicQuestion: generated.publicQuestion,
  privateRecord: sanitizePrivatePatRecord(generated.privateRecord),
});

export const getPatRuntime = (): Promise<PatRuntimeBoundary> => {
  runtimePromise ??= createPatRuntime().then(runtime => ({
    getEngineInfo: () => runtime.getEngineInfo(),
    generateQuestion: async request =>
      sanitizeGeneratedQuestion(await runtime.generateQuestion(request)),
    generateCandidateGroup: async (request, maximumCount) =>
      (
        await runtime.generateCandidateGroup(request, maximumCount)
      ).map(sanitizeGeneratedQuestion),
  }));
  return runtimePromise;
};
