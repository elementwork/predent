import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  date,
  varchar,
  serial,
  jsonb,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const instant = (name: string) => timestamp(name, { withTimezone: true });

/* ─── Users (managed by OAuth auth) ─── */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    provider: varchar("provider", {
      enum: [
        "google",
        "x",
        "instagram",
        "linkedin",
        "apple",
        "discord",
        "microsoft",
        "facebook",
      ],
    })
      .default("google")
      .notNull(),
    unionId: text("unionId").notNull(),
    name: text("name"),
    email: text("email"),
    avatar: text("avatar"),
    role: varchar("role", { enum: ["user", "admin"] })
      .default("user")
      .notNull(),
    tier: varchar("tier", { enum: ["free", "premium", "premium_plus"] })
      .default("free")
      .notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),
    stripeSubscriptionStatus: text("stripe_subscription_status"),
    stripeLifetimePaymentIntentId: text("stripe_lifetime_payment_intent_id"),
    premiumUntil: instant("premium_until"),
    stripeEntitlementUpdatedAt: instant("stripe_entitlement_updated_at"),
    timezone: text("timezone").default("America/Toronto").notNull(),
    createdAt: instant("createdAt").defaultNow().notNull(),
    updatedAt: instant("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    lastSignInAt: instant("lastSignInAt").defaultNow().notNull(),
    emailTaskDue: boolean("email_task_due").default(true).notNull(),
    emailStudyReminder: boolean("email_study_reminder").default(true).notNull(),
    emailCommunity: boolean("email_community").default(true).notNull(),
    tokenVersion: integer("token_version").default(0).notNull(),
    patQuestionsGenerated: integer("pat_questions_generated")
      .default(0)
      .notNull(),
  },
  table => [
    uniqueIndex("users_provider_union_id_unique").on(
      table.provider,
      table.unionId
    ),
    uniqueIndex("users_stripe_lifetime_payment_intent_unique")
      .on(table.stripeLifetimePaymentIntentId)
      .where(sql`${table.stripeLifetimePaymentIntentId} is not null`),
  ]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ─── Profiles ─── */
export const profiles = pgTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    firstName: text("first_name"),
    lastName: text("last_name"),
    province: text("province"),
    currentGpa: text("current_gpa"),
    gpaScale: varchar("gpa_scale", { enum: ["4.0", "100"] }).default("4.0"),
    yearLevel: integer("year_level"),
    targetYear: integer("target_year"),
    degreeStatus: varchar("degree_status", {
      enum: ["in_progress", "completed"],
    }).default("in_progress"),
    undergradSchool: text("undergrad_school"),
    datTestDate: date("dat_test_date", { mode: "date" }),
    targetSchools: jsonb("target_schools").$type<string[]>(),
    createdAt: instant("created_at").defaultNow().notNull(),
    updatedAt: instant("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => [index("profiles_user_id_idx").on(table.userId)]
);

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/* ─── Tasks (Application Planner) ─── */
export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: varchar("category", {
      enum: [
        "academic",
        "dat",
        "experience",
        "application",
        "interview",
        "other",
      ],
    })
      .default("other")
      .notNull(),
    dueDate: instant("due_date"),
    status: varchar("status", {
      enum: [
        "not_started",
        "in_progress",
        "under_review",
        "complete",
        "blocked",
      ],
    })
      .default("not_started")
      .notNull(),
    priority: varchar("priority", {
      enum: ["critical", "high", "medium", "low"],
    })
      .default("medium")
      .notNull(),
    schoolId: text("school_id"),
    notes: text("notes"),
    estimatedMinutes: integer("estimatedMinutes"),
    rescheduledFrom: instant("rescheduledFrom"),
    completedAt: instant("completed_at"),
    dueNotifiedAt: instant("due_notified_at"),
    createdAt: instant("created_at").defaultNow().notNull(),
    updatedAt: instant("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => [
    index("tasks_user_id_idx").on(table.userId),
    index("tasks_status_idx").on(table.status),
    index("tasks_due_date_idx").on(table.dueDate),
    index("tasks_user_status_due_idx").on(
      table.userId,
      table.status,
      table.dueDate
    ),
    check(
      "tasks_estimated_minutes_positive",
      sql`${table.estimatedMinutes} IS NULL OR ${table.estimatedMinutes} > 0`
    ),
  ]
);

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/* ─── PAT Attempts ─── */
export const patAttempts = pgTable(
  "pat_attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    difficulty: varchar("difficulty", {
      enum: ["beginner", "intermediate", "advanced", "elite"],
    }).notNull(),
    questionId: text("question_id").notNull(),
    userAnswer: integer("user_answer"),
    isCorrect: boolean("is_correct"),
    timeSpent: integer("time_spent"),
    sessionId: text("session_id"),
    createdAt: instant("created_at").defaultNow().notNull(),
  },
  table => [
    index("pat_attempts_user_id_idx").on(table.userId),
    index("pat_attempts_category_idx").on(table.category),
    index("pat_attempts_created_at_idx").on(table.createdAt),
    index("pat_attempts_user_created_idx").on(table.userId, table.createdAt),
    index("pat_attempts_user_category_created_idx").on(
      table.userId,
      table.category,
      table.createdAt
    ),
    check(
      "pat_attempts_answer_range",
      sql`${table.userAnswer} IS NULL OR ${table.userAnswer} BETWEEN 0 AND 4`
    ),
    check(
      "pat_attempts_time_nonnegative",
      sql`${table.timeSpent} IS NULL OR ${table.timeSpent} >= 0`
    ),
  ]
);

export type PATAttempt = typeof patAttempts.$inferSelect;
export type InsertPATAttempt = typeof patAttempts.$inferInsert;

/* ─── School Stats ─── */
export const schoolStats = pgTable(
  "school_stats",
  {
    id: serial("id").primaryKey(),
    schoolId: text("school_id").notNull(),
    year: integer("year").notNull(),
    avgGpa: real("avg_gpa"),
    avgDatAa: real("avg_dat_aa"),
    avgDatPat: real("avg_dat_pat"),
    avgDatRc: real("avg_dat_rc"),
    interviewRate: real("interview_rate"),
    offerRate: real("offer_rate"),
    ipAcceptanceRate: real("ip_acceptance_rate"),
    oopAcceptanceRate: real("oop_acceptance_rate"),
    createdAt: instant("created_at").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("school_stats_school_year_unique").on(
      table.schoolId,
      table.year
    ),
  ]
);

export type SchoolStat = typeof schoolStats.$inferSelect;
export type InsertSchoolStat = typeof schoolStats.$inferInsert;

/* ─── DAT Questions ─── */
export const datQuestions = pgTable("dat_questions", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
  subject: varchar("subject", {
    enum: ["biology", "chemistry", "reading"],
  }).notNull(),
  topic: text("topic").notNull(),
  difficulty: varchar("difficulty", {
    enum: ["beginner", "intermediate", "advanced", "elite"],
  }).notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  source: varchar("source", {
    enum: ["curated", "generated", "user_contributed"],
  })
    .default("curated")
    .notNull(),
  deletedAt: instant("deleted_at"),
  createdAt: instant("created_at").defaultNow().notNull(),
});

export type DATQuestion = typeof datQuestions.$inferSelect;
export type InsertDATQuestion = typeof datQuestions.$inferInsert;

/* ─── DAT Attempts ─── */
export const datAttempts = pgTable(
  "dat_attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionId: integer("question_id")
      .notNull()
      .references(() => datQuestions.id, { onDelete: "cascade" }),
    isCorrect: boolean("is_correct").notNull(),
    timeSpent: integer("time_spent"),
    createdAt: instant("created_at").defaultNow().notNull(),
  },
  table => [
    index("dat_attempts_user_id_idx").on(table.userId),
    index("dat_attempts_created_at_idx").on(table.createdAt),
    index("dat_attempts_user_created_idx").on(table.userId, table.createdAt),
    check(
      "dat_attempts_time_nonnegative",
      sql`${table.timeSpent} IS NULL OR ${table.timeSpent} >= 0`
    ),
  ]
);

export type DATAttempt = typeof datAttempts.$inferSelect;
export type InsertDATAttempt = typeof datAttempts.$inferInsert;

/* ─── Community Posts ─── */
export const communityPosts = pgTable(
  "community_posts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", {
      enum: ["result", "question", "discussion"],
    }).notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    school: text("school"),
    program: text("program"),
    result: varchar("result", {
      enum: ["Accepted", "Interview Invite", "Waitlisted", "Rejected"],
    }),
    gpa: text("gpa"),
    datAa: text("dat_aa"),
    datPat: text("dat_pat"),
    province: varchar("province", { enum: ["IP", "OOP"] }),
    likes: integer("likes").default(0).notNull(),
    deletedAt: instant("deleted_at"),
    hiddenAt: instant("hidden_at"),
    createdAt: instant("created_at").defaultNow().notNull(),
    updatedAt: instant("updated_at").defaultNow().notNull(),
  },
  table => [
    index("community_posts_user_id_idx").on(table.userId),
    index("community_posts_type_idx").on(table.type),
    index("community_posts_deleted_at_idx").on(table.deletedAt),
    index("community_posts_hidden_at_idx").on(table.hiddenAt),
    index("community_posts_visible_created_idx")
      .on(table.createdAt, table.id)
      .where(sql`${table.deletedAt} IS NULL AND ${table.hiddenAt} IS NULL`),
  ]
);

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

/* ─── Community Comments ─── */
export const communityComments = pgTable(
  "community_comments",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    createdAt: instant("created_at").defaultNow().notNull(),
  },
  table => [
    index("community_comments_post_created_idx").on(
      table.postId,
      table.createdAt
    ),
  ]
);

/* ─── Community Reactions ─── */
export const communityReactions = pgTable(
  "community_reactions",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { enum: ["like"] })
      .default("like")
      .notNull(),
    createdAt: instant("created_at").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("community_reactions_user_post_unique").on(
      table.userId,
      table.postId
    ),
    index("community_reactions_post_idx").on(table.postId),
  ]
);

export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = typeof communityComments.$inferInsert;

/* ─── Community Reports ─── */
export const communityReports = pgTable(
  "community_reports",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => communityPosts.id, {
      onDelete: "cascade",
    }),
    commentId: integer("comment_id").references(() => communityComments.id, {
      onDelete: "cascade",
    }),
    reporterId: integer("reporter_id")
      .notNull()
      .references(() => users.id),
    reason: text("reason").notNull(),
    description: text("description"),
    status: varchar("status", {
      enum: ["pending", "reviewed", "dismissed", "actioned"],
    })
      .default("pending")
      .notNull(),
    reviewedBy: integer("reviewed_by").references(() => users.id),
    createdAt: instant("created_at").defaultNow().notNull(),
    reviewedAt: instant("reviewed_at"),
  },
  table => [
    check(
      "community_reports_exactly_one_target",
      sql`num_nonnulls(${table.postId}, ${table.commentId}) = 1`
    ),
    uniqueIndex("community_reports_reporter_post_unique")
      .on(table.reporterId, table.postId)
      .where(sql`${table.postId} IS NOT NULL`),
    uniqueIndex("community_reports_reporter_comment_unique")
      .on(table.reporterId, table.commentId)
      .where(sql`${table.commentId} IS NOT NULL`),
  ]
);

export type CommunityReport = typeof communityReports.$inferSelect;
export type InsertCommunityReport = typeof communityReports.$inferInsert;

/* ─── Notifications ─── */
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", {
      enum: ["task_due", "payment", "community", "system", "study_reminder"],
    }).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    link: text("link"),
    dedupeKey: text("dedupe_key"),
    read: boolean("read").default(false).notNull(),
    emailSent: boolean("email_sent").default(false).notNull(),
    createdAt: instant("created_at").defaultNow().notNull(),
  },
  table => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_read_idx").on(table.read),
    index("notifications_created_at_idx").on(table.createdAt),
    index("notifications_user_read_created_idx").on(
      table.userId,
      table.read,
      table.createdAt
    ),
    uniqueIndex("notifications_dedupe_key_unique").on(table.dedupeKey),
  ]
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/* ─── Stripe Webhook Events ─── */
export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull().unique(),
  type: text("type").notNull(),
  processedAt: instant("processed_at").defaultNow().notNull(),
});

export type StripeWebhookEvent = typeof stripeWebhookEvents.$inferSelect;
export type InsertStripeWebhookEvent = typeof stripeWebhookEvents.$inferInsert;

/* ─── Push Subscriptions ─── */
export const pushSubscriptions = pgTable(
  "pushSubscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("userAgent"),
    createdAt: instant("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("push_subscriptions_endpoint_unique").on(table.endpoint),
  ]
);

/* ─── Transactional Outbox ─── */
export const outboxJobs = pgTable(
  "outbox_jobs",
  {
    id: serial("id").primaryKey(),
    idempotencyKey: text("idempotency_key").notNull(),
    topic: varchar("topic", { enum: ["notification_delivery"] }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    status: varchar("status", {
      enum: ["pending", "processing", "completed", "failed"],
    })
      .default("pending")
      .notNull(),
    attempts: integer("attempts").default(0).notNull(),
    availableAt: instant("available_at").defaultNow().notNull(),
    lockedAt: instant("locked_at"),
    processedAt: instant("processed_at"),
    lastError: text("last_error"),
    createdAt: instant("created_at").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("outbox_jobs_idempotency_key_unique").on(table.idempotencyKey),
    index("outbox_jobs_status_available_idx").on(
      table.status,
      table.availableAt
    ),
    check("outbox_jobs_attempts_nonnegative", sql`${table.attempts} >= 0`),
  ]
);

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/* ─── Interview Questions ─── */
export const interviewQuestions = pgTable("interview_questions", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
  format: varchar("format", { enum: ["MMI", "Panel"] }).notNull(),
  category: text("category").notNull(),
  question: text("question").notNull(),
  modelAnswer: text("model_answer"),
  frequency: integer("frequency"),
  schoolId: text("school_id"),
  deletedAt: instant("deleted_at"),
  createdAt: instant("created_at").defaultNow().notNull(),
});

export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type InsertInterviewQuestion = typeof interviewQuestions.$inferInsert;

/* ─── Admin Action Audit Log ─── */
export const adminActions = pgTable(
  "admin_actions",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: varchar("action", {
      enum: ["delete_pat", "delete_dat", "reconcile_stripe"],
    }).notNull(),
    targetType: varchar("target_type", {
      enum: ["pat_question", "dat_question", "user"],
    }).notNull(),
    targetId: integer("target_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: instant("created_at").defaultNow().notNull(),
  },
  table => [
    index("admin_actions_admin_id_idx").on(table.adminId),
    index("admin_actions_target_idx").on(table.targetType, table.targetId),
  ]
);

export type AdminAction = typeof adminActions.$inferSelect;
export type InsertAdminAction = typeof adminActions.$inferInsert;

/* ─── Saved / Bookmarked Questions ─── */
export const savedQuestions = pgTable(
  "saved_questions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    source: varchar("source", { enum: ["pat", "dat"] }).notNull(),
    questionId: integer("question_id").notNull(),
    note: text("note"),
    createdAt: instant("created_at").defaultNow().notNull(),
  },
  table => [
    index("saved_questions_user_id_idx").on(table.userId),
    index("saved_questions_source_idx").on(table.source),
    uniqueIndex("saved_questions_user_source_question_unique").on(
      table.userId,
      table.source,
      table.questionId
    ),
  ]
);

export type SavedQuestion = typeof savedQuestions.$inferSelect;
export type InsertSavedQuestion = typeof savedQuestions.$inferInsert;

/* ─── Flashcard Reviews (Spaced Repetition) ─── */
export const flashcardReviews = pgTable(
  "flashcard_reviews",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    source: varchar("source", { enum: ["pat", "dat"] }).notNull(),
    questionId: integer("question_id").notNull(),
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
      enum: ["easy", "medium", "hard"],
    }),
    easeFactor: real("ease_factor").default(2.5).notNull(),
    interval: integer("interval").default(0).notNull(),
    repetitions: integer("repetitions").default(0).notNull(),
    nextReview: instant("next_review").defaultNow().notNull(),
    lastReview: instant("last_review").defaultNow().notNull(),
    createdAt: instant("created_at").defaultNow().notNull(),
  },
  table => [
    index("flashcard_reviews_user_id_idx").on(table.userId),
    index("flashcard_reviews_next_review_idx").on(table.nextReview),
    uniqueIndex("flashcard_reviews_user_source_question_unique").on(
      table.userId,
      table.source,
      table.questionId
    ),
    check(
      "flashcard_reviews_interval_nonnegative",
      sql`${table.interval} >= 0`
    ),
    check(
      "flashcard_reviews_repetitions_nonnegative",
      sql`${table.repetitions} >= 0`
    ),
  ]
);

export type FlashcardReview = typeof flashcardReviews.$inferSelect;
export type InsertFlashcardReview = typeof flashcardReviews.$inferInsert;
