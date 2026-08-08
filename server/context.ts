import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./auth/auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  requestId?: string;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
  requestId?: string
): Promise<TrpcContext> {
  const ctx: TrpcContext = {
    req: opts.req,
    resHeaders: opts.resHeaders,
    requestId:
      requestId ?? opts.req.headers.get("x-request-id") ?? crypto.randomUUID(),
  };
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
