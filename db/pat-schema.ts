import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./schema";

const instant = (name: string) => timestamp(name, { withTimezone: true });

export const patSessions = pgTable(
  "pat_sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mode: varchar("mode", {
      enum: ["quick", "category", "timed", "mixed", "exam"],
    }).notNull(),
    category: varchar("category", {
      enum: [
        "keyholes",
        "tfe",
        "angle_ranking",
        "hole_punching",
        "cube_counting",
        "pattern_folding",
      ],
    }),
    difficulty: varchar("difficulty", {
      enum: ["beginner", "intermediate", "advanced", "elite"],
    }).notNull(),
    questionCount: integer("question_count").notNull(),
    timeLimitSeconds: integer("time_limit_seconds"),
    engineVersion: text("engine_version").notNull(),
    startedAt: instant("started_at").notNull(),
    deadlineAt: instant("deadline_at"),
    submittedAt: instant("submitted_at"),
    abandonedAt: instant("abandoned_at"),
    createdAt: instant("created_at").defaultNow().notNull(),
    updatedAt: instant("updated_at").defaultNow().notNull(),
  },
  table => [
    index("pat_sessions_user_created_idx").on(table.userId, table.createdAt),
    uniqueIndex("pat_sessions_one_active_per_user")
      .on(table.userId)
      .where(
        sql`${table.submittedAt} IS NULL AND ${table.abandonedAt} IS NULL`
      ),
    check(
      "pat_sessions_question_count_range",
      sql`${table.questionCount} BETWEEN 1 AND 90`
    ),
    check(
      "pat_sessions_time_limit_positive",
      sql`${table.timeLimitSeconds} IS NULL OR ${table.timeLimitSeconds} > 0`
    ),
  ]
);

export const patQuestionInstances = pgTable(
  "pat_question_instances",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => patSessions.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    category: varchar("category", {
      enum: [
        "keyholes",
        "tfe",
        "angle_ranking",
        "hole_punching",
        "cube_counting",
        "pattern_folding",
      ],
    }).notNull(),
    difficulty: varchar("difficulty", {
      enum: ["beginner", "intermediate", "advanced", "elite"],
    }).notNull(),
    difficultyBand: integer("difficulty_band").notNull(),
    canonicalQuestionId: text("canonical_question_id").notNull(),
    publicQuestion: jsonb("public_question")
      .$type<Record<string, unknown>>()
      .notNull(),
    privateRecord: jsonb("private_record")
      .$type<Record<string, unknown>>()
      .notNull(),
    userAnswer: integer("user_answer"),
    timeSpent: integer("time_spent").default(0).notNull(),
    flagged: boolean("flagged").default(false).notNull(),
    createdAt: instant("created_at").defaultNow().notNull(),
    updatedAt: instant("updated_at").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("pat_question_instances_session_position_unique").on(
      table.sessionId,
      table.position
    ),
    uniqueIndex("pat_question_instances_session_question_unique").on(
      table.sessionId,
      table.canonicalQuestionId
    ),
    index("pat_question_instances_session_idx").on(table.sessionId),
    check(
      "pat_question_instances_difficulty_band_range",
      sql`${table.difficultyBand} BETWEEN 1 AND 5`
    ),
    check(
      "pat_question_instances_answer_range",
      sql`${table.userAnswer} IS NULL OR ${table.userAnswer} BETWEEN 0 AND 4`
    ),
    check(
      "pat_question_instances_time_nonnegative",
      sql`${table.timeSpent} >= 0`
    ),
  ]
);

export type PatSession = typeof patSessions.$inferSelect;
export type InsertPatSession = typeof patSessions.$inferInsert;
export type PatQuestionInstance = typeof patQuestionInstances.$inferSelect;
export type InsertPatQuestionInstance = typeof patQuestionInstances.$inferInsert;
