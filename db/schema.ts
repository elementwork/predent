import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  varchar,
  serial,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

/* ─── Users (managed by OAuth auth) ─── */
export const users = pgTable("users", {
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
  unionId: text("unionId").notNull().unique(),
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
  premiumUntil: timestamp("premium_until"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
  emailTaskDue: boolean("email_task_due").default(true).notNull(),
  emailStudyReminder: boolean("email_study_reminder").default(true).notNull(),
  emailCommunity: boolean("email_community").default(true).notNull(),
  tokenVersion: integer("token_version").default(0).notNull(),
  patQuestionsGenerated: integer("pat_questions_generated").default(0).notNull(),
});

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
    datTestDate: timestamp("dat_test_date"),
    targetSchools: jsonb("target_schools").$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
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
    dueDate: timestamp("due_date"),
    status: varchar("status", {
      enum: ["not_started", "in_progress", "under_review", "complete", "blocked"],
    })
      .default("not_started")
      .notNull(),
    priority: varchar("priority", { enum: ["critical", "high", "medium", "low"] })
      .default("medium")
      .notNull(),
    schoolId: text("school_id"),
    notes: text("notes"),
    estimatedMinutes: integer("estimatedMinutes"),
    rescheduledFrom: timestamp("rescheduledFrom"),
    completedAt: timestamp("completed_at"),
    dueNotifiedAt: timestamp("due_notified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => [
    index("tasks_user_id_idx").on(table.userId),
    index("tasks_status_idx").on(table.status),
    index("tasks_due_date_idx").on(table.dueDate),
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [
    index("pat_attempts_user_id_idx").on(table.userId),
    index("pat_attempts_category_idx").on(table.category),
    index("pat_attempts_created_at_idx").on(table.createdAt),
  ]
);

export type PATAttempt = typeof patAttempts.$inferSelect;
export type InsertPATAttempt = typeof patAttempts.$inferInsert;

/* ─── PAT Questions ─── */
export const patQuestions = pgTable("pat_questions", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
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
  source: varchar("source", { enum: ["curated", "generated", "user_contributed"] })
    .default("curated")
    .notNull(),
  questionData: jsonb("question_data")
    .$type<{
      prompt: string;
      diagram: string;
      options: string[];
    }>()
    .notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanationL1: text("explanation_l1").notNull(),
  explanationL2: text("explanation_l2").notNull(),
  explanationL3: text("explanation_l3").notNull(),
  concepts: jsonb("concepts").$type<string[]>().notNull(),
  timeTarget: integer("time_target").notNull(),
  correctRate: real("correct_rate"),
  avgTime: real("avg_time"),
  timesUsed: integer("times_used").default(0).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type PATQuestion = typeof patQuestions.$inferSelect;
export type InsertPATQuestion = typeof patQuestions.$inferInsert;

/* ─── School Stats ─── */
export const schoolStats = pgTable("school_stats", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  source: varchar("source", { enum: ["curated", "generated", "user_contributed"] })
    .default("curated")
    .notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [
    index("dat_attempts_user_id_idx").on(table.userId),
    index("dat_attempts_created_at_idx").on(table.createdAt),
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
    deletedAt: timestamp("deleted_at"),
    hiddenAt: timestamp("hidden_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => [
    index("community_posts_user_id_idx").on(table.userId),
    index("community_posts_type_idx").on(table.type),
    index("community_posts_deleted_at_idx").on(table.deletedAt),
    index("community_posts_hidden_at_idx").on(table.hiddenAt),
  ]
);

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

/* ─── Community Comments ─── */
export const communityComments = pgTable("community_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = typeof communityComments.$inferInsert;

/* ─── Community Reports ─── */
export const communityReports = pgTable("community_reports", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

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
    read: boolean("read").default(false).notNull(),
    emailSent: boolean("email_sent").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_read_idx").on(table.read),
    index("notifications_created_at_idx").on(table.createdAt),
  ]
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/* ─── Stripe Webhook Events ─── */
export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull().unique(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
});

export type StripeWebhookEvent = typeof stripeWebhookEvents.$inferSelect;
export type InsertStripeWebhookEvent = typeof stripeWebhookEvents.$inferInsert;

/* ─── Push Subscriptions ─── */
export const pushSubscriptions = pgTable("pushSubscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

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
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
    action: varchar("action", { enum: ["delete_pat", "delete_dat"] })
      .notNull(),
    targetType: varchar("target_type", { enum: ["pat_question", "dat_question"] })
      .notNull(),
    targetId: integer("target_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [
    index("saved_questions_user_id_idx").on(table.userId),
    index("saved_questions_source_idx").on(table.source),
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
    easeFactor: real("ease_factor").default(2.5).notNull(),
    interval: integer("interval").default(0).notNull(),
    repetitions: integer("repetitions").default(0).notNull(),
    nextReview: timestamp("next_review").defaultNow().notNull(),
    lastReview: timestamp("last_review").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [
    index("flashcard_reviews_user_id_idx").on(table.userId),
    index("flashcard_reviews_next_review_idx").on(table.nextReview),
  ]
);

export type FlashcardReview = typeof flashcardReviews.$inferSelect;
export type InsertFlashcardReview = typeof flashcardReviews.$inferInsert;
