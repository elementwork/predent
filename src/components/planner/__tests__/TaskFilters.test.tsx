import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { TaskFilters } from "../TaskFilters";

afterEach(() => {
  cleanup();
});

describe("TaskFilters", () => {
  it("renders three dropdowns", () => {
    const { unmount } = render(
      <TaskFilters filters={{ status: "", category: "", priority: "" }} onChange={vi.fn()} />
    );

    expect(screen.getAllByRole("combobox")).toHaveLength(3);
    unmount();
  });

  it("shows clear button when category active", () => {
    const { unmount } = render(
      <TaskFilters filters={{ status: "", category: "dat", priority: "" }} onChange={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    unmount();
  });

  it("shows clear button when priority active", () => {
    const { unmount } = render(
      <TaskFilters filters={{ status: "", category: "", priority: "high" }} onChange={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    unmount();
  });

  it("shows clear button when status active", () => {
    const { unmount } = render(
      <TaskFilters filters={{ status: "complete", category: "", priority: "" }} onChange={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    unmount();
  });

  it("calls onChange on category change", () => {
    const onChange = vi.fn();
    const { unmount } = render(
      <TaskFilters filters={{ status: "", category: "", priority: "" }} onChange={onChange} />
    );

    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "dat" } });
    expect(onChange).toHaveBeenCalled();
    unmount();
  });

  it("calls onChange on priority change", () => {
    const onChange = vi.fn();
    const { unmount } = render(
      <TaskFilters filters={{ status: "", category: "", priority: "" }} onChange={onChange} />
    );

    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: "high" } });
    expect(onChange).toHaveBeenCalled();
    unmount();
  });

  it("calls onChange on status change", () => {
    const onChange = vi.fn();
    const { unmount } = render(
      <TaskFilters filters={{ status: "", category: "", priority: "" }} onChange={onChange} />
    );

    fireEvent.change(screen.getAllByRole("combobox")[2], { target: { value: "complete" } });
    expect(onChange).toHaveBeenCalled();
    unmount();
  });

  it("clears filters when clear clicked", () => {
    const onChange = vi.fn();
    const { unmount } = render(
      <TaskFilters
        filters={{ category: "dat", priority: "high", status: "complete" }}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith({ category: "", priority: "", status: "" });
    unmount();
  });

  it("reflects filter values", () => {
    const { unmount } = render(
      <TaskFilters
        filters={{ category: "dat", priority: "high", status: "complete" }}
        onChange={vi.fn()}
      />
    );

    const selects = screen.getAllByRole("combobox");
    expect(selects[0]).toHaveValue("dat");
    expect(selects[1]).toHaveValue("high");
    expect(selects[2]).toHaveValue("complete");
    unmount();
  });
});
