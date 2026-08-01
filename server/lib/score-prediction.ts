/**
 * Weighted predicted score algorithm for PAT and DAT practice.
 *
 * Factors:
 * 1. Overall accuracy (40% weight)
 * 2. Recency — last 20 attempts weighted 2x (25% weight)
 * 3. Difficulty — hard/advanced questions weighted 1.5x, elite 2x (20% weight)
 * 4. Consistency — bonus for stable accuracy across categories (15% weight)
 *
 * Returns a score on the 1–30 scale with a confidence percentage.
 */
export function computePredictedScore(
  attempts: {
    isCorrect: boolean | null;
    difficulty?: string | null;
    category?: string;
    createdAt?: Date | null;
  }[],
): { score: number; confidence: number } {
  if (attempts.length === 0) return { score: 15, confidence: 0 };

  // --- 1. Overall accuracy ---
  const totalCorrect = attempts.filter(a => a.isCorrect === true).length;
  const overallAccuracy = totalCorrect / attempts.length;

  // --- 2. Recency weighting ---
  const sorted = [...attempts].sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  );
  const recentWindow = sorted.slice(0, 20);
  const olderAttempts = sorted.slice(20);
  const recentAcc =
    recentWindow.length > 0
      ? recentWindow.filter(a => a.isCorrect === true).length / recentWindow.length
      : overallAccuracy;
  const olderAcc =
    olderAttempts.length > 0
      ? olderAttempts.filter(a => a.isCorrect === true).length / olderAttempts.length
      : overallAccuracy;
  const recencyScore = recentAcc * 0.67 + olderAcc * 0.33;

  // --- 3. Difficulty weighting ---
  const difficultyMultiplier: Record<string, number> = {
    easy: 0.8,
    beginner: 0.8,
    medium: 1.0,
    intermediate: 1.0,
    hard: 1.5,
    advanced: 1.5,
    elite: 2.0,
  };
  let weightedCorrect = 0;
  let weightedTotal = 0;
  for (const a of attempts) {
    const mult = difficultyMultiplier[a.difficulty ?? "medium"] ?? 1.0;
    weightedTotal += mult;
    if (a.isCorrect === true) weightedCorrect += mult;
  }
  const difficultyScore = weightedCorrect / weightedTotal;

  // --- 4. Consistency across categories ---
  const catMap: Record<string, { correct: number; total: number }> = {};
  for (const a of attempts) {
    const cat = a.category ?? "unknown";
    if (!catMap[cat]) catMap[cat] = { correct: 0, total: 0 };
    catMap[cat].total++;
    if (a.isCorrect === true) catMap[cat].correct++;
  }
  const catAccuracies = Object.values(catMap).map(c => c.correct / c.total);
  const catStdDev =
    catAccuracies.length > 1
      ? Math.sqrt(
          catAccuracies.reduce(
            (sum, acc) =>
              sum +
              (acc -
                catAccuracies.reduce((s, v) => s + v, 0) /
                  catAccuracies.length) **
                2,
            0,
          ) / catAccuracies.length,
        )
      : 0;
  // Lower std dev = more consistent = higher score
  const consistencyScore = Math.max(0, 1 - catStdDev * 2);

  // --- Composite score ---
  const composite =
    overallAccuracy * 0.4 +
    recencyScore * 0.25 +
    difficultyScore * 0.2 +
    consistencyScore * 0.15;

  // Map 0–1 composite to 1–30 score
  const predictedScore = Math.round(1 + composite * 29);

  // --- Confidence ---
  // Based on sample size + consistency
  const sampleConfidence = Math.min(70, (attempts.length / 200) * 70);
  const consistencyConfidence = consistencyScore * 30;
  const confidence = Math.round(sampleConfidence + consistencyConfidence);

  return {
    score: Math.min(30, Math.max(1, predictedScore)),
    confidence: Math.min(95, Math.max(0, confidence)),
  };
}
