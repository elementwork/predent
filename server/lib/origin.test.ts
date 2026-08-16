import { afterEach, describe, expect, it } from "vitest";
import {
  getPublicAppOrigin,
  isTrustedRequestOrigin,
  parsePublicAppOrigin,
} from "./origin";

const originalNodeEnv = process.env.NODE_ENV;
const originalPublicAppUrl = process.env.PUBLIC_APP_URL;

afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalPublicAppUrl === undefined) delete process.env.PUBLIC_APP_URL;
  else process.env.PUBLIC_APP_URL = originalPublicAppUrl;
});

describe("public application origin", () => {
  it("rejects credentials, paths, query strings, and non-HTTP schemes", () => {
    expect(() => parsePublicAppOrigin("javascript:alert(1)")).toThrow();
    expect(() => parsePublicAppOrigin("https://user@example.com")).toThrow();
    expect(() => parsePublicAppOrigin("https://example.com/app")).toThrow();
    expect(() => parsePublicAppOrigin("https://example.com?x=1")).toThrow();
  });

  it("requires an HTTPS configured origin in production", () => {
    process.env.NODE_ENV = "production";
    process.env.PUBLIC_APP_URL = "https://predent.vercel.app";
    expect(getPublicAppOrigin("https://attacker.example/path")).toBe(
      "https://predent.vercel.app"
    );
    expect(
      isTrustedRequestOrigin({
        origin: "https://predent.vercel.app",
        requestUrl: "https://attacker.example/api/trpc/task.create",
      })
    ).toBe(true);
    expect(
      isTrustedRequestOrigin({
        origin: "https://attacker.example",
        requestUrl: "https://predent.vercel.app/api/trpc/task.create",
      })
    ).toBe(false);
    expect(
      isTrustedRequestOrigin({
        origin: undefined,
        requestUrl: "https://predent.vercel.app/api/trpc/task.create",
      })
    ).toBe(false);
  });
});
