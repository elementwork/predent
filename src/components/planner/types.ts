export type CategoryType =
  | "academic"
  | "dat"
  | "experience"
  | "application"
  | "interview"
  | "other";
export type PriorityType = "critical" | "high" | "medium" | "low";
export type StatusType =
  | "not_started"
  | "in_progress"
  | "under_review"
  | "complete"
  | "blocked";

export interface TaskFormState {
  title: string;
  category: CategoryType;
  dueDate: string;
  status: StatusType;
  priority: PriorityType;
  notes: string;
  estimatedMinutes: string;
  schoolId: string;
}

export const defaultFormState: TaskFormState = {
  title: "",
  category: "other",
  dueDate: "",
  status: "not_started",
  priority: "medium",
  notes: "",
  estimatedMinutes: "",
  schoolId: "",
};

export interface FilterState {
  status: string;
  category: string;
  priority: string;
}

export const defaultFilters: FilterState = {
  status: "",
  category: "",
  priority: "",
};

export const categories = [
  { value: "academic", label: "Academic" },
  { value: "dat", label: "DAT" },
  { value: "experience", label: "Experience" },
  { value: "application", label: "Application" },
  { value: "interview", label: "Interview" },
  { value: "other", label: "Other" },
] as const;

export const priorities = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

export const statuses = [
  { id: "not_started", name: "Not Started" },
  { id: "in_progress", name: "In Progress" },
  { id: "under_review", name: "Under Review" },
  { id: "complete", name: "Complete" },
  { id: "blocked", name: "Blocked" },
] as const;
