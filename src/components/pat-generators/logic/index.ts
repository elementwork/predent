// Type-only compatibility contract for the flashcard UI.
// PAT generation, scoring, validation, and rendering logic lives exclusively in ManipAT.
export type PatCategory =
  | "keyholes"
  | "tfe"
  | "angle_ranking"
  | "hole_punching"
  | "cube_counting"
  | "pattern_folding";
