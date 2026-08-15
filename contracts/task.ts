export type PlannerTask = {
  id: number;
  userId: number;
  title: string;
  category:
    | "academic"
    | "dat"
    | "experience"
    | "application"
    | "interview"
    | "other";
  dueDate: Date | null;
  status:
    | "not_started"
    | "in_progress"
    | "under_review"
    | "complete"
    | "blocked";
  priority: "critical" | "high" | "medium" | "low";
  schoolId: string | null;
  notes: string | null;
  estimatedMinutes: number | null;
  rescheduledFrom: Date | null;
  completedAt: Date | null;
  dueNotifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
