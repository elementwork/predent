export const PAT_QUESTION_COUNTS: Record<string, number> = {
  keyholes: 60,
  tfe: 60,
  angle_ranking: 60,
  hole_punching: 60,
  cube_counting: 60,
  pattern_folding: 60,
};

export const PAT_TOTAL_QUESTION_COUNT = Object.values(
  PAT_QUESTION_COUNTS
).reduce((sum, count) => sum + count, 0);
