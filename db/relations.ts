import { relations } from "drizzle-orm";
import {
  users,
  profiles,
  tasks,
  patAttempts,
  datAttempts,
  datQuestions,
  communityPosts,
  communityComments,
  communityReports,
  notifications,
  pushSubscriptions,
  adminActions,
  savedQuestions,
  flashcardReviews,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  tasks: many(tasks),
  patAttempts: many(patAttempts),
  datAttempts: many(datAttempts),
  communityPosts: many(communityPosts),
  communityComments: many(communityComments),
  communityReports: many(communityReports),
  notifications: many(notifications),
  pushSubscriptions: many(pushSubscriptions),
  adminActions: many(adminActions),
  savedQuestions: many(savedQuestions),
  flashcardReviews: many(flashcardReviews),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const patAttemptsRelations = relations(patAttempts, ({ one }) => ({
  user: one(users, {
    fields: [patAttempts.userId],
    references: [users.id],
  }),
}));

export const datQuestionsRelations = relations(datQuestions, ({ many }) => ({
  attempts: many(datAttempts),
}));

export const datAttemptsRelations = relations(datAttempts, ({ one }) => ({
  user: one(users, {
    fields: [datAttempts.userId],
    references: [users.id],
  }),
  question: one(datQuestions, {
    fields: [datAttempts.questionId],
    references: [datQuestions.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
  comments: many(communityComments),
  reports: many(communityReports),
}));

export const communityCommentsRelations = relations(communityComments, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityComments.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [communityComments.userId],
    references: [users.id],
  }),
}));

export const communityReportsRelations = relations(communityReports, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityReports.postId],
    references: [communityPosts.id],
  }),
  comment: one(communityComments, {
    fields: [communityReports.commentId],
    references: [communityComments.id],
  }),
  reporter: one(users, {
    fields: [communityReports.reporterId],
    references: [users.id],
  }),
  reviewedByUser: one(users, {
    fields: [communityReports.reviewedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

export const adminActionsRelations = relations(adminActions, ({ one }) => ({
  admin: one(users, {
    fields: [adminActions.adminId],
    references: [users.id],
  }),
}));

export const savedQuestionsRelations = relations(savedQuestions, ({ one }) => ({
  user: one(users, {
    fields: [savedQuestions.userId],
    references: [users.id],
  }),
}));

export const flashcardReviewsRelations = relations(flashcardReviews, ({ one }) => ({
  user: one(users, {
    fields: [flashcardReviews.userId],
    references: [users.id],
  }),
}));
