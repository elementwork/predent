import { describe, it, expect, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePageTitle } from "../usePageTitle";

describe("usePageTitle", () => {
  const originalTitle = document.title;

  afterEach(() => {
    document.title = originalTitle;
  });

  it("sets document.title on mount", () => {
    renderHook(() => usePageTitle("Dashboard"));

    expect(document.title).toBe("Dashboard | PreDent Canada");
  });

  it("restores previous title on unmount", () => {
    document.title = "Original Title";
    const { unmount } = renderHook(() => usePageTitle("Dashboard"));

    unmount();

    expect(document.title).toBe("Original Title");
  });

  it("formats title as 'X | PreDent Canada'", () => {
    renderHook(() => usePageTitle("PAT Practice"));

    expect(document.title).toBe("PAT Practice | PreDent Canada");
  });

  it("uses base title when empty string passed", () => {
    renderHook(() => usePageTitle(""));

    expect(document.title).toBe("PreDent Canada");
  });

  it("updates title when prop changes", () => {
    const { rerender } = renderHook(
      ({ title }) => usePageTitle(title),
      { initialProps: { title: "Page 1" } }
    );

    expect(document.title).toBe("Page 1 | PreDent Canada");

    rerender({ title: "Page 2" });

    expect(document.title).toBe("Page 2 | PreDent Canada");
  });
});
