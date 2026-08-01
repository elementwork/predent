import { getDb } from "../server/queries/connection";
import { datQuestions } from "./schema";
import { biologyQuestions } from "./data/dat-biology";
import { chemistryQuestions } from "./data/dat-chemistry";
import { readingQuestions } from "./data/dat-reading";

const allQuestions = [
  ...biologyQuestions,
  ...chemistryQuestions,
  ...readingQuestions,
] as {
  publicId: string;
  subject: "biology" | "chemistry" | "reading";
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "elite";
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}[];

export async function seedDatQuestionsFull() {
  const db = getDb();

  // Clear existing generated questions first
  await db.delete(datQuestions);

  let inserted = 0;
  for (const q of allQuestions) {
    try {
      await db.insert(datQuestions).values({
        publicId: q.publicId,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        source: "generated",
      });
      inserted++;
    } catch (err) {
      console.error(`Failed to insert ${q.publicId}:`, err);
    }
  }

  const stats = {
    total: inserted,
    biology: allQuestions.filter((q) => q.subject === "biology").length,
    chemistry: allQuestions.filter((q) => q.subject === "chemistry").length,
    reading: allQuestions.filter((q) => q.subject === "reading").length,
  };

  console.log(`Seeded ${stats.total} DAT questions:`);
  console.log(`  Biology: ${stats.biology}`);
  console.log(`  Chemistry: ${stats.chemistry}`);
  console.log(`  Reading: ${stats.reading}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatQuestionsFull().then(() => process.exit(0));
}
