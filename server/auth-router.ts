import * as cookie from "cookie";
import { eq, sql } from "drizzle-orm";
import { Session } from "@contracts/constants";
import {
  getSessionCookieName,
  getSessionCookieOptions,
} from "./lib/cookies";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { getPlanFromPrice } from "./lib/stripe";

export const authRouter = createRouter({
  me: authedQuery.query(({ ctx }) => ({
    id: ctx.user.id,
    name: ctx.user.name,
    email: ctx.user.email,
    avatar: ctx.user.avatar,
    role: ctx.user.role,
    tier: ctx.user.tier,
    premiumUntil: ctx.user.premiumUntil,
    plan: ctx.user.stripePriceId
      ? getPlanFromPrice(ctx.user.stripePriceId)
      : null,
  })),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db
      .update(users)
      .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
      .where(eq(users.id, ctx.user.id));

    const opts = getSessionCookieOptions(ctx.req.headers);
    const expiredCookie = (name: string) =>
      cookie.serialize(name, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      });
    ctx.resHeaders.append("set-cookie", expiredCookie(getSessionCookieName()));
    if (getSessionCookieName() !== Session.cookieName) {
      ctx.resHeaders.append("set-cookie", expiredCookie(Session.cookieName));
    }
    return { success: true };
  }),
});
