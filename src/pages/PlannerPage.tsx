import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Target,
  Trash2,
  Edit3,
  Check,
  AlertTriangle,
  Clock,
  LayoutGrid,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { events } from "@/lib/analytics";
import { TaskForm } from "@/components/planner/TaskForm";
import { TaskFilters } from "@/components/planner/TaskFilters";
import {
  type TaskFormState,
  defaultFormState,
  type CategoryType,
  type StatusType,
  type FilterState,
  defaultFilters,
} from "@/components/planner/types";
import { CalendarView } from "@/components/planner/CalendarView";
import { SchedulingSuggestions } from "@/components/planner/SchedulingSuggestions";
import type { Task } from "@db/schema";

const columns = [
  { id: "not_started", name: "Not Started", color: "#94A3B8" },
  { id: "in_progress", name: "In Progress", color: "#2563EB" },
  { id: "under_review", name: "Under Review", color: "#F59E0B" },
  { id: "complete", name: "Complete", color: "#10B981" },
  { id: "blocked", name: "Blocked", color: "#EF4444" },
] as const;

const categories = [
  { value: "academic", label: "Academic", color: "#2563EB" },
  { value: "dat", label: "DAT", color: "#8B5CF6" },
  { value: "experience", label: "Experience", color: "#14B8A6" },
  { value: "application", label: "Application", color: "#F59E0B" },
  { value: "interview", label: "Interview", color: "#F43F5E" },
  { value: "other", label: "Other", color: "#94A3B8" },
];

const priorities = [
  { value: "critical", label: "Critical", color: "#EF4444" },
  { value: "high", label: "High", color: "#F59E0B" },
  { value: "medium", label: "Medium", color: "#2563EB" },
  { value: "low", label: "Low", color: "#10B981" },
];

type ViewMode = "board" | "calendar";

export default function PlannerPage() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const hasFilters = filters.status || filters.category || filters.priority;

  const { data: allTasks, isLoading } = trpc.task.list.useQuery();
  const { data: filteredTasks } = trpc.task.listFiltered.useQuery(
    {
      category: (filters.category || undefined) as CategoryType | undefined,
      priority: (filters.priority || undefined) as
        | "critical"
        | "high"
        | "medium"
        | "low"
        | undefined,
      status: (filters.status || undefined) as StatusType | undefined,
      limit: 100,
    },
    { enabled: !!hasFilters }
  );

  const tasks = hasFilters ? filteredTasks : allTasks;

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => utils.task.invalidate(),
  });
  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => utils.task.invalidate(),
  });
  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => utils.task.invalidate(),
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [form, setForm] = useState<TaskFormState>(defaultFormState);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title,
      category: form.category,
      dueDate: form.dueDate || undefined,
      status: form.status,
      priority: form.priority,
      notes: form.notes || undefined,
      schoolId: form.schoolId || undefined,
      estimatedMinutes: form.estimatedMinutes
        ? parseInt(form.estimatedMinutes, 10)
        : undefined,
    };
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask, ...payload });
      setEditingTask(null);
    } else {
      await createTask.mutateAsync(payload);
      events.taskCreated(form.category, form.priority);
    }
    setShowAdd(false);
    setForm(defaultFormState);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this task?")) {
      await deleteTask.mutateAsync({ id });
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const task = tasks?.find(t => t.id === id);
    await updateTask.mutateAsync({
      id,
      status: newStatus as StatusType,
    });
    if (newStatus === "complete" && task) {
      events.taskCompleted(task.category);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task.id);
    setForm({
      title: task.title,
      category: task.category as CategoryType,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      status: task.status as StatusType,
      priority: task.priority as "critical" | "high" | "medium" | "low",
      notes: task.notes || "",
      estimatedMinutes: task.estimatedMinutes?.toString() || "",
      schoolId: task.schoolId || "",
    });
    setShowAdd(true);
  };

  const getPriorityColor = (p: string) =>
    priorities.find(pr => pr.value === p)?.color || "#94A3B8";
  const getCategoryColor = (c: string) =>
    categories.find(cat => cat.value === c)?.color || "#94A3B8";

  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[var(--page-bg)] pt-20">
      <div className="section-container max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Target className="w-6 h-6 text-[var(--accent)]" />
              Application Planner
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[var(--page-muted)] rounded-lg border border-[var(--border-color)] p-0.5">
              <button
                onClick={() => setViewMode("board")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "board"
                    ? "bg-[var(--page-surface)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Board
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "calendar"
                    ? "bg-[var(--page-surface)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Calendar
              </button>
            </div>
            <Button
              onClick={() => {
                setShowAdd(true);
                setEditingTask(null);
              }}
              className="bg-[var(--dental-blue)] hover:bg-[var(--dental-blue-dark)] text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Task
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {[
                "Foundation",
                "Building",
                "DAT Prep",
                "Application",
                "Interviews",
                "Decision",
              ].map((phase, i) => (
                <div
                  key={phase}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= 2
                        ? "bg-[var(--dental-blue)] text-white"
                        : "bg-[var(--page-muted)] text-[var(--text-tertiary)]"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)] hidden sm:block">
                    {phase}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="mb-4">
          <TaskFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Scheduling Suggestions (board view only) */}
        {viewMode === "board" && (
          <div className="mb-4">
            <SchedulingSuggestions />
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <TaskForm
                form={form}
                onChange={setForm}
                onSubmit={handleSubmit}
                onCancel={() => setShowAdd(false)}
                isEditing={!!editingTask}
                isPending={createTask.isPending || updateTask.isPending}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {viewMode === "calendar" ? (
          <CalendarView filters={filters} onEditTask={startEdit} />
        ) : isLoading ? (
          <div className="text-center py-20 text-[var(--text-tertiary)] text-sm">
            Loading tasks...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {columns.map(col => {
              const colTasks = (tasks || []).filter(t => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-[var(--page-muted)] rounded-xl border border-[var(--border-color)] p-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: col.color }}
                      />
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {col.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-tertiary)] bg-[var(--page-surface)] px-1.5 py-0.5 rounded">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {colTasks.map(task => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-3 rounded-lg bg-[var(--page-surface)] border border-[var(--border-color)] hover:border-[var(--text-tertiary)] transition-all group ${
                          isOverdue(task.dueDate) && col.id !== "complete"
                            ? "border-l-2 border-l-red-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="text-xs font-medium text-[var(--text-primary)] leading-tight flex-1">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(task)}
                              className="p-0.5 rounded hover:bg-[var(--page-muted)]"
                            >
                              <Edit3 className="w-3 h-3 text-[var(--text-tertiary)]" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-0.5 rounded hover:bg-[var(--page-muted)]"
                            >
                              <Trash2 className="w-3 h-3 text-red-400/60" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: `${getCategoryColor(task.category)}20`,
                              color: getCategoryColor(task.category),
                            }}
                          >
                            {
                              categories.find(c => c.value === task.category)
                                ?.label
                            }
                          </span>

                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: `${getPriorityColor(task.priority)}20`,
                              color: getPriorityColor(task.priority),
                            }}
                          >
                            {
                              priorities.find(p => p.value === task.priority)
                                ?.label
                            }
                          </span>
                        </div>

                        {task.dueDate && (
                          <div
                            className={`flex items-center gap-1 mt-1.5 ${isOverdue(task.dueDate) && col.id !== "complete" ? "text-red-400" : "text-[var(--text-tertiary)]"}`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span className="text-[9px]">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            {isOverdue(task.dueDate) &&
                              col.id !== "complete" && (
                                <AlertTriangle className="w-2.5 h-2.5" />
                              )}
                          </div>
                        )}

                        {task.estimatedMinutes && (
                          <div className="flex items-center gap-1 mt-1 text-[var(--text-tertiary)]">
                            <Clock className="w-2.5 h-2.5" />
                            <span className="text-[9px]">
                              {task.estimatedMinutes} min
                            </span>
                          </div>
                        )}

                        {/* Quick status buttons */}
                        <div className="flex gap-1 mt-2">
                          {col.id !== "complete" && (
                            <button
                              onClick={() =>
                                handleStatusChange(task.id, "complete")
                              }
                              className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            >
                              <Check className="w-2.5 h-2.5 inline mr-0.5" />
                              Done
                            </button>
                          )}
                          {col.id === "not_started" && (
                            <button
                              onClick={() =>
                                handleStatusChange(task.id, "in_progress")
                              }
                              className="text-[9px] px-2 py-0.5 rounded bg-[var(--page-muted)] text-[#2563EB] hover:bg-[var(--border-color)] transition-colors"
                            >
                              Start
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="text-center py-4 text-[var(--text-tertiary)] text-[10px]">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
