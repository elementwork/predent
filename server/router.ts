import { authRouter } from "./auth-router";
import { profileRouter } from "./profile-router";
import { taskRouter } from "./task-router";
import { patRouter } from "./pat-router";
import { toolsRouter } from "./tools-router";
import { interviewRouter } from "./interview-router";
import { paymentRouter } from "./payment-router";
import { datRouter } from "./dat-router";
import { adminRouter } from "./admin-router";
import { communityRouter } from "./community-router";
import { notificationRouter } from "./notification-router";
import { savedRouter } from "./saved-router";
import { flashcardRouter } from "./flashcard-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  profile: profileRouter,
  task: taskRouter,
  pat: patRouter,
  tools: toolsRouter,
  interview: interviewRouter,
  payment: paymentRouter,
  dat: datRouter,
  admin: adminRouter,
  community: communityRouter,
  notification: notificationRouter,
  saved: savedRouter,
  flash: flashcardRouter,
});

export type AppRouter = typeof appRouter;
