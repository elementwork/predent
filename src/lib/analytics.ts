import { posthog, isAnalyticsEnabled } from "@/lib/posthog-client";

export function capture(event: string, properties?: Record<string, unknown>) {
  if (!isAnalyticsEnabled) return;
  posthog.capture(event, properties);
}

export const events = {
  patQuestionAnswered: (category: string, difficulty: string, isCorrect: boolean) =>
    capture("pat_question_answered", { category, difficulty, isCorrect }),

  datQuestionAnswered: (subject: string, difficulty: string, isCorrect: boolean) =>
    capture("dat_question_answered", { subject, difficulty, isCorrect }),

  taskCreated: (category: string, priority: string) =>
    capture("task_created", { category, priority }),

  taskCompleted: (category: string) =>
    capture("task_completed", { category }),

  communityPostCreated: (type: string) =>
    capture("community_post_created", { type }),

  communityPostLiked: () =>
    capture("community_post_liked"),

  schoolViewed: (schoolId: string) =>
    capture("school_viewed", { schoolId }),

  calculatorUsed: (calculator: string) =>
    capture("calculator_used", { calculator }),

  upgradeClicked: (plan: string) =>
    capture("upgrade_clicked", { plan }),

  signupCompleted: () =>
    capture("signup_completed"),
};
