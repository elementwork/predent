import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  categories,
  priorities,
  statuses,
  type TaskFormState,
  type CategoryType,
  type PriorityType,
  type StatusType,
} from "./types";

interface TaskFormProps {
  form: TaskFormState;
  onChange: (form: TaskFormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
  isPending: boolean;
}

export function TaskForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isPending,
}: TaskFormProps) {
  const set = (patch: Partial<TaskFormState>) =>
    onChange({ ...form, ...patch });

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {isEditing ? "Edit Task" : "New Task"}
        </h3>
        <button
          onClick={onCancel}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Input
            value={form.title}
            onChange={e => set({ title: e.target.value })}
            placeholder="Task title"
            className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
        </div>
        <div>
          <label className="text-[10px] text-[var(--text-tertiary)] mb-1 block">
            Category
          </label>
          <select
            value={form.category}
            onChange={e => set({ category: e.target.value as CategoryType })}
            className="w-full h-9 px-2 rounded-md bg-[var(--page-muted)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs"
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[var(--text-tertiary)] mb-1 block">
            Priority
          </label>
          <select
            value={form.priority}
            onChange={e => set({ priority: e.target.value as PriorityType })}
            className="w-full h-9 px-2 rounded-md bg-[var(--page-muted)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs"
          >
            {priorities.map(p => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[var(--text-tertiary)] mb-1 block">
            Due Date
          </label>
          <Input
            type="date"
            value={form.dueDate}
            onChange={e => set({ dueDate: e.target.value })}
            className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)] text-xs h-9"
          />
        </div>
        <div>
          <label className="text-[10px] text-[var(--text-tertiary)] mb-1 block">
            Status
          </label>
          <select
            value={form.status}
            onChange={e => set({ status: e.target.value as StatusType })}
            className="w-full h-9 px-2 rounded-md bg-[var(--page-muted)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs"
          >
            {statuses.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[var(--text-tertiary)] mb-1 block">
            Est. Minutes
          </label>
          <Input
            type="number"
            min={1}
            value={form.estimatedMinutes}
            onChange={e => set({ estimatedMinutes: e.target.value })}
            placeholder="Optional"
            className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)] text-xs h-9"
          />
        </div>
        {form.category === "academic" && (
          <div>
            <label className="text-[10px] text-[var(--text-tertiary)] mb-1 block">
              School ID
            </label>
            <Input
              value={form.schoolId}
              onChange={e => set({ schoolId: e.target.value })}
              placeholder="e.g. uoft"
              className="bg-[var(--page-muted)] border-[var(--border-color)] text-[var(--text-primary)] text-xs h-9"
            />
          </div>
        )}
        <div className="sm:col-span-2">
          <textarea
            value={form.notes}
            onChange={e => set({ notes: e.target.value })}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-md bg-[var(--page-muted)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs placeholder:text-[var(--text-tertiary)] resize-none"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          onClick={onSubmit}
          className="bg-[var(--dental-blue)] hover:bg-[var(--dental-blue-dark)] text-white"
          disabled={isPending}
        >
          {isEditing ? "Update" : "Create"} Task
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="border-[var(--border-color)] text-[var(--text-secondary)]"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
