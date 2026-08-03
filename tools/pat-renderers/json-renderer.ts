import type { GenerationResult } from "../pat-types.js";

export function renderJSON(data: GenerationResult): string {
  return JSON.stringify(data, null, 2);
}
