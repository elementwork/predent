import { describe, expect, it } from "vitest";
import { assertSafePushEndpoint } from "./url-security";

const publicLookup = async () => [
  { address: "142.250.72.234", family: 4 as const },
];

describe("push endpoint egress policy", () => {
  it("accepts an approved provider resolving to a public address", async () => {
    await expect(
      assertSafePushEndpoint(
        "https://fcm.googleapis.com/send/abc",
        publicLookup
      )
    ).resolves.toBeUndefined();
  });

  it("rejects arbitrary hosts even when public", async () => {
    await expect(
      assertSafePushEndpoint("https://example.com/push", publicLookup)
    ).rejects.toThrow("not approved");
  });

  it("rejects approved hosts resolving to private space", async () => {
    const privateLookup = async () => [
      { address: "10.0.0.8", family: 4 as const },
    ];
    await expect(
      assertSafePushEndpoint(
        "https://updates.push.services.mozilla.com/wpush/v2/abc",
        privateLookup
      )
    ).rejects.toThrow("non-public");
  });
});
