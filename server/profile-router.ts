import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { profiles, users } from "@db/schema";
import { isValidTimeZone } from "./lib/time";

export const profileRouter = createRouter({
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.user.id),
    });
    return profile ? { ...profile, timezone: ctx.user.timezone } : null;
  }),

  upsert: authedQuery
    .input(
      z.object({
        firstName: z.string().max(100).optional(),
        lastName: z.string().max(100).optional(),
        province: z.string().max(50).optional(),
        currentGpa: z.string().optional(),
        gpaScale: z.enum(["4.0", "100"]).optional(),
        yearLevel: z.number().int().min(1).max(7).optional(),
        targetYear: z.number().int().min(2024).max(2030).optional(),
        degreeStatus: z.enum(["in_progress", "completed"]).optional(),
        undergradSchool: z.string().max(255).optional(),
        targetSchools: z.array(z.string().max(100)).max(20).optional(),
        timezone: z.string().min(1).max(100).refine(isValidTimeZone).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { timezone, ...profileInput } = input;
      return db.transaction(async tx => {
        const existing = await tx.query.profiles.findFirst({
          where: eq(profiles.userId, ctx.user.id),
        });
        if (timezone) {
          await tx
            .update(users)
            .set({ timezone })
            .where(eq(users.id, ctx.user.id));
        }
        if (existing) {
          await tx
            .update(profiles)
            .set({ ...profileInput, updatedAt: new Date() })
            .where(eq(profiles.id, existing.id));
          return { success: true, action: "updated" as const };
        }
        await tx.insert(profiles).values({
          userId: ctx.user.id,
          ...profileInput,
        });
        return { success: true, action: "created" as const };
      });
    }),
});
