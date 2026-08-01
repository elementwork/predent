import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { profiles } from "@db/schema";

export const profileRouter = createRouter({
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.user.id),
    });
    return profile ?? null;
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.profiles.findFirst({
        where: eq(profiles.userId, ctx.user.id),
      });

      if (existing) {
        await db
          .update(profiles)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, existing.id));
        return { success: true, action: "updated" };
      } else {
        await db.insert(profiles).values({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true, action: "created" };
      }
    }),
});
