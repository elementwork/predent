import { and, eq, isNull, sql } from "drizzle-orm";
import { datAttempts, datQuestions, patAttempts } from "@db/schema";
import { getDb } from "../queries/connection";

type AggregateRow = {
  total: number;
  correct: number;
  avgTime: number;
};

const aggregate = {
  total: sql<number>`count(*)::int`,
  correct: sql<number>`count(*) FILTER (WHERE is_correct)::int`,
  avgTime: sql<number>`coalesce(round(avg(coalesce(time_spent, 0))), 0)::int`,
};

export async function getPatAggregates(userId: number) {
  const db = getDb();
  const [overallRows, categoryRows, heatmapRows] = await Promise.all([
    db
      .select(aggregate)
      .from(patAttempts)
      .where(eq(patAttempts.userId, userId)),
    db
      .select({ category: patAttempts.category, ...aggregate })
      .from(patAttempts)
      .where(eq(patAttempts.userId, userId))
      .groupBy(patAttempts.category),
    db
      .select({
        category: patAttempts.category,
        difficulty: patAttempts.difficulty,
        total: aggregate.total,
        correct: aggregate.correct,
      })
      .from(patAttempts)
      .where(eq(patAttempts.userId, userId))
      .groupBy(patAttempts.category, patAttempts.difficulty),
  ]);
  return {
    overall: (overallRows[0] ?? {
      total: 0,
      correct: 0,
      avgTime: 0,
    }) as AggregateRow,
    categories: categoryRows,
    heatmap: heatmapRows,
  };
}

export async function getDatAggregates(userId: number) {
  const db = getDb();
  const where = and(
    eq(datAttempts.userId, userId),
    isNull(datQuestions.deletedAt)
  );
  const base = db
    .select({
      subject: datQuestions.subject,
      difficulty: datQuestions.difficulty,
      isCorrect: datAttempts.isCorrect,
      timeSpent: datAttempts.timeSpent,
    })
    .from(datAttempts)
    .innerJoin(datQuestions, eq(datAttempts.questionId, datQuestions.id))
    .where(where)
    .as("dat_analytics");
  const derivedAggregate = {
    total: sql<number>`count(*)::int`,
    correct: sql<number>`count(*) FILTER (WHERE ${base.isCorrect})::int`,
    avgTime: sql<number>`coalesce(round(avg(coalesce(${base.timeSpent}, 0))), 0)::int`,
  };

  const [overallRows, subjectRows, heatmapRows] = await Promise.all([
    db.select(derivedAggregate).from(base),
    db
      .select({ subject: base.subject, ...derivedAggregate })
      .from(base)
      .groupBy(base.subject),
    db
      .select({
        subject: base.subject,
        difficulty: base.difficulty,
        total: derivedAggregate.total,
        correct: derivedAggregate.correct,
      })
      .from(base)
      .groupBy(base.subject, base.difficulty),
  ]);
  return {
    overall: (overallRows[0] ?? {
      total: 0,
      correct: 0,
      avgTime: 0,
    }) as AggregateRow,
    subjects: subjectRows,
    heatmap: heatmapRows,
  };
}

export function percentage(correct: number, total: number) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}
