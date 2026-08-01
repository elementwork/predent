import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Clock, AlertTriangle, CalendarDays } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { Task } from "@db/schema";

const priorityBadgeColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-blue-500/20 text-blue-400",
  low: "bg-gray-500/20 text-gray-400",
};

const categoryBadgeColors: Record<string, string> = {
  academic: "bg-blue-500/20 text-blue-400",
  dat: "bg-purple-500/20 text-purple-400",
  experience: "bg-teal-500/20 text-teal-400",
  application: "bg-amber-500/20 text-amber-400",
  interview: "bg-rose-500/20 text-rose-400",
  other: "bg-gray-500/20 text-gray-400",
};

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="p-2 rounded-md bg-[var(--page-muted)] border border-[var(--border-color)] min-w-[140px]">
      <p className="text-[11px] font-medium text-[var(--text-primary)] leading-tight mb-1 truncate">
        {task.title}
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        <span
          className={`text-[8px] px-1 py-0.5 rounded ${categoryBadgeColors[task.category] || ""}`}
        >
          {task.category}
        </span>
        <span
          className={`text-[8px] px-1 py-0.5 rounded ${priorityBadgeColors[task.priority] || ""}`}
        >
          {task.priority}
        </span>
        {task.estimatedMinutes && (
          <span className="text-[8px] text-[var(--text-tertiary)] flex items-center gap-0.5">
            <Clock className="w-2 h-2" />
            {task.estimatedMinutes}m
          </span>
        )}
      </div>
    </div>
  );
}

export function SchedulingSuggestions() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = trpc.task.getSchedulingSuggestions.useQuery(
    undefined,
    { enabled: open }
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-lg">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 cursor-pointer">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[var(--dental-blue)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Suggested Schedule
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            {isLoading ? (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
                Loading suggestions...
              </p>
            ) : !data ? (
              <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
                No data available
              </p>
            ) : (
              <>
                {data.overdue.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <h4 className="text-xs font-semibold text-red-400">
                        Overdue ({data.overdue.length})
                      </h4>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {data.overdue.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-7 gap-2">
                  {data.schedule.map(day => {
                    const dateObj = new Date(day.date + "T12:00:00");
                    const isToday =
                      day.date === new Date().toISOString().split("T")[0];
                    return (
                      <div key={day.date} className="min-w-0">
                        <div
                          className={`text-center mb-2 py-1 rounded ${isToday ? "bg-[var(--dental-blue)]/20" : ""}`}
                        >
                          <p className="text-[10px] text-[var(--text-tertiary)]">
                            {dateObj.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </p>
                          <p
                            className={`text-xs font-medium ${isToday ? "text-[var(--dental-blue)]" : "text-[var(--text-primary)]"}`}
                          >
                            {dateObj.getDate()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          {day.tasks.slice(0, 3).map(task => (
                            <TaskCard key={task.id} task={task} />
                          ))}
                          {day.tasks.length > 3 && (
                            <p className="text-[9px] text-[var(--text-tertiary)] text-center">
                              +{day.tasks.length - 3} more
                            </p>
                          )}
                          {day.tasks.length === 0 && (
                            <p className="text-[9px] text-[var(--text-tertiary)] text-center py-2">
                              —
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
