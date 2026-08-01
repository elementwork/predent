import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Edit3 } from "lucide-react";
import type { Task } from "@db/schema";
import type { FilterState } from "./types";
import { trpc } from "@/providers/trpc";

const priorityColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-blue-500",
  low: "bg-gray-400",
};

const priorityBadgeColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-blue-500/20 text-blue-400",
  low: "bg-gray-500/20 text-gray-400",
};

const categoryLabels: Record<string, string> = {
  academic: "Academic",
  dat: "DAT",
  experience: "Experience",
  application: "Application",
  interview: "Interview",
  other: "Other",
};

interface CalendarViewProps {
  filters: FilterState;
  onEditTask: (task: Task) => void;
}

export function CalendarView({ filters, onEditTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  const { data: tasks } = trpc.task.listFiltered.useQuery({
    category: (filters.category || undefined) as
      | "academic"
      | "dat"
      | "experience"
      | "application"
      | "interview"
      | "other"
      | undefined,
    priority: (filters.priority || undefined) as
      | "critical"
      | "high"
      | "medium"
      | "low"
      | undefined,
    status: (filters.status || undefined) as
      | "not_started"
      | "in_progress"
      | "under_review"
      | "complete"
      | "blocked"
      | undefined,
    dueAfter: startOfMonth.toISOString().split("T")[0],
    dueBefore: endOfMonth.toISOString().split("T")[0],
    limit: 100,
  });

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks || []) {
      if (!t.dueDate) continue;
      const key = new Date(t.dueDate).toISOString().split("T")[0];
      const arr = map.get(key) || [];
      arr.push(t);
      map.set(key, arr);
    }
    return map;
  }, [tasks]);

  const selectedDateKey = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : "";
  const selectedDayTasks = selectedDateKey
    ? tasksByDate.get(selectedDateKey) || []
    : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-shrink-0">
        <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentMonth(new Date())}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              Today
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md"
            components={{
              Day: ({ day, ...props }) => {
                const key = day.date.toISOString().split("T")[0];
                const dayTasks = tasksByDate.get(key) || [];
                return (
                  <div {...props}>
                    <span className="text-xs">{day.date.getDate()}</span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 justify-center">
                        {dayTasks.slice(0, 3).map((t, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${priorityColors[t.priority] || "bg-gray-400"}`}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[8px] text-[var(--text-tertiary)]">
                            +{dayTasks.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              },
            }}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {selectedDate ? (
          <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            {selectedDayTasks.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
                No tasks for this day
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDayTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg bg-[var(--page-muted)] border border-[var(--border-color)] hover:border-[var(--text-tertiary)] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-xs font-medium text-[var(--text-primary)] flex-1">
                        {task.title}
                      </p>
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-0.5 rounded hover:bg-[var(--page-surface)] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="w-3 h-3 text-[var(--text-tertiary)]" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        className={`text-[9px] px-1.5 py-0.5 ${priorityBadgeColors[task.priority] || ""}`}
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-[9px] text-[var(--text-tertiary)]">
                        {categoryLabels[task.category] || task.category}
                      </span>
                      {task.estimatedMinutes && (
                        <span className="text-[9px] text-[var(--text-tertiary)] flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {task.estimatedMinutes}m
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-lg p-8 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              Select a day to view tasks
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
