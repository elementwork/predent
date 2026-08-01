import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { categories, priorities, statuses, type FilterState, defaultFilters } from "./types";

interface TaskFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const hasFilters = filters.status || filters.category || filters.priority;
  const selectClass =
    "h-8 px-2 rounded-md bg-[var(--page-muted)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={filters.category}
        onChange={e => onChange({ ...filters, category: e.target.value })}
        className={selectClass}
      >
        <option value="">All Categories</option>
        {categories.map(c => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        value={filters.priority}
        onChange={e => onChange({ ...filters, priority: e.target.value })}
        className={selectClass}
      >
        <option value="">All Priorities</option>
        {priorities.map(p => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={e => onChange({ ...filters, status: e.target.value })}
        className={selectClass}
      >
        <option value="">All Statuses</option>
        {statuses.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      {hasFilters && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onChange(defaultFilters)}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] h-8 px-2 text-xs"
        >
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
