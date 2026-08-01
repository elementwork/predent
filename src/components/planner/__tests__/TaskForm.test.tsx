import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { TaskForm } from "../TaskForm";
import { defaultFormState } from "../types";

afterEach(() => {
  cleanup();
});

describe("TaskForm", () => {
  it("renders form with correct header", () => {
    const { unmount } = render(
      <TaskForm
        form={defaultFormState}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isEditing={false}
        isPending={false}
      />
    );

    expect(screen.getByText("New Task")).toBeInTheDocument();
    unmount();
  });

  it("renders edit header when isEditing", () => {
    const { unmount } = render(
      <TaskForm
        form={{ ...defaultFormState, title: "Existing" }}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isEditing={true}
        isPending={false}
      />
    );

    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    unmount();
  });

  it("renders submit and cancel buttons", () => {
    const { unmount } = render(
      <TaskForm
        form={defaultFormState}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isEditing={false}
        isPending={false}
      />
    );

    expect(screen.getByText("Create Task")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    unmount();
  });

  it("calls onSubmit when submit button clicked", () => {
    const onSubmit = vi.fn();
    const { unmount } = render(
      <TaskForm
        form={defaultFormState}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isEditing={false}
        isPending={false}
      />
    );

    fireEvent.click(screen.getByText("Create Task"));
    expect(onSubmit).toHaveBeenCalled();
    unmount();
  });

  it("calls onCancel when cancel button clicked", () => {
    const onCancel = vi.fn();
    const { unmount } = render(
      <TaskForm
        form={defaultFormState}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={onCancel}
        isEditing={false}
        isPending={false}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
    unmount();
  });

  it("disables submit when isPending", () => {
    const { unmount } = render(
      <TaskForm
        form={defaultFormState}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isEditing={false}
        isPending={true}
      />
    );

    expect(screen.getByText("Create Task")).toBeDisabled();
    unmount();
  });

  it("renders select dropdowns", () => {
    const { unmount } = render(
      <TaskForm
        form={defaultFormState}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isEditing={false}
        isPending={false}
      />
    );

    expect(screen.getAllByRole("combobox").length).toBeGreaterThanOrEqual(3);
    unmount();
  });

  it("shows School ID when category is academic", () => {
    const { unmount } = render(
      <TaskForm
        form={{ ...defaultFormState, category: "academic" }}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isEditing={false}
        isPending={false}
      />
    );

    expect(screen.getByText("School ID")).toBeInTheDocument();
    unmount();
  });

  it("hides School ID when category is not academic", () => {
    const { unmount } = render(
      <TaskForm
        form={{ ...defaultFormState, category: "dat" }}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isEditing={false}
        isPending={false}
      />
    );

    expect(screen.queryByText("School ID")).not.toBeInTheDocument();
    unmount();
  });
});
