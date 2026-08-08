import { z } from "zod";

export const cursorSchema = z
  .object({
    createdAt: z.string().datetime(),
    id: z.number().int().positive(),
  })
  .optional();

export type PageCursor = NonNullable<z.infer<typeof cursorSchema>>;

export function nextCursor<T extends { id: number; createdAt: Date }>(
  rows: T[],
  limit: number
) {
  if (rows.length <= limit) return null;
  const last = rows[limit - 1]!;
  return { createdAt: last.createdAt.toISOString(), id: last.id };
}
