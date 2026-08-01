import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { schools } from "@contracts/schools";
import {
  ArrowLeft,
  Check,
  X,
  GraduationCap,
  Scale,
  ArrowRightLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const MAX_COMPARE = 4;

export default function SchoolComparisonPage() {
  usePageTitle("Compare Canadian Dental Schools");

  const [selectedIds, setSelectedIds] = useState<string[]>([
    "uoft",
    "western",
    "ubc",
  ]);

  const toggleSchool = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const selectedSchools = useMemo(
    () =>
      selectedIds.map(id => schools.find(s => s.id === id)!).filter(Boolean),
    [selectedIds]
  );

  const allSame = (values: (string | boolean)[]) =>
    values.length > 1 && values.every(v => v === values[0]);

  const diffHighlight = (values: (string | boolean)[]) => {
    if (values.length <= 1) return false;
    return !allSame(values);
  };

  const rows = [
    { label: "Province", get: (s: (typeof schools)[0]) => s.province },
    { label: "City", get: (s: (typeof schools)[0]) => s.city },
    { label: "Program", get: (s: (typeof schools)[0]) => s.program },
    {
      label: "First-Year Seats",
      get: (s: (typeof schools)[0]) => s.seats.toString(),
    },
    { label: "Min GPA to Apply", get: (s: (typeof schools)[0]) => s.minGpa },
    { label: "GPA Calculation", get: (s: (typeof schools)[0]) => s.gpaMethod },
    {
      label: "Avg Admitted GPA",
      get: (s: (typeof schools)[0]) => s.avgAdmittedGpa,
    },
    { label: "Min DAT", get: (s: (typeof schools)[0]) => s.minDat },
    { label: "Avg DAT AA", get: (s: (typeof schools)[0]) => s.avgDatAa },
    { label: "Avg DAT PAT", get: (s: (typeof schools)[0]) => s.avgDatPat },
    { label: "Avg DAT RC", get: (s: (typeof schools)[0]) => s.avgDatRc },
    {
      label: "CASPer Required",
      get: (s: (typeof schools)[0]) => (s.casperRequired ? "Yes" : "No"),
    },
    {
      label: "Interview Format",
      get: (s: (typeof schools)[0]) => s.interviewFormat,
    },
    {
      label: "Degree Required",
      get: (s: (typeof schools)[0]) => s.degreeRequired,
    },
    {
      label: "Application Fee",
      get: (s: (typeof schools)[0]) => s.applicationFee,
    },
    {
      label: "Application Deadline",
      get: (s: (typeof schools)[0]) => s.applicationDeadline,
    },
    {
      label: "Tuition (Domestic)",
      get: (s: (typeof schools)[0]) => s.tuitionDomestic,
    },
    {
      label: "Tuition (International)",
      get: (s: (typeof schools)[0]) => s.tuitionInternational,
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      {/* Header */}
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto px-4">
          <Link
            to="/schools"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to School Hub
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                Compare Dental Schools
              </h1>
              <p className="text-[var(--text-secondary)]">
                Side-by-side comparison of Canadian dental schools.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto px-4 -mt-8 pb-20">
        {/* School Selector */}
        <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-[var(--text-primary)]">
              <Scale className="w-5 h-5 text-[#2563EB]" />
              Select Schools to Compare ({selectedIds.length}/{MAX_COMPARE})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {schools.map(school => {
                const isSelected = selectedIds.includes(school.id);
                const isDisabled =
                  !isSelected && selectedIds.length >= MAX_COMPARE;
                return (
                  <label
                    key={school.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-[#2563EB] bg-[#2563EB]/5"
                        : "border-[var(--border-color)] bg-[var(--page-bg)] hover:bg-[var(--page-muted)]"
                    } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSchool(school.id)}
                      disabled={isDisabled}
                    />
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ backgroundColor: school.color }}
                    >
                      {school.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {school.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {school.province}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {selectedSchools.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 bg-[var(--page-surface)] border border-[var(--border-color)] sticky left-0 z-10 min-w-[180px]">
                    <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                      Requirement
                    </span>
                  </th>
                  {selectedSchools.map(school => (
                    <th
                      key={school.id}
                      className="p-4 bg-[var(--page-surface)] border border-[var(--border-color)] min-w-[200px]"
                    >
                      <Link
                        to={`/school/${school.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ backgroundColor: school.color }}
                        >
                          {school.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#2563EB] transition-colors">
                            {school.name}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {school.program} • {school.seats} seats
                          </p>
                        </div>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const values = selectedSchools.map(s => row.get(s));
                  const isDiff = diffHighlight(values);
                  return (
                    <tr key={row.label}>
                      <td className="p-4 bg-[var(--page-surface)] border border-[var(--border-color)] sticky left-0 z-10">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {row.label}
                        </span>
                      </td>
                      {selectedSchools.map(school => {
                        const value = row.get(school);
                        return (
                          <td
                            key={school.id}
                            className={`p-4 border border-[var(--border-color)] text-sm text-[var(--text-secondary)] ${
                              isDiff ? "bg-[#F59E0B]/5" : "bg-[var(--page-bg)]"
                            }`}
                          >
                            {row.label === "CASPer Required" ? (
                              <span className="flex items-center gap-1.5">
                                {value === "Yes" ? (
                                  <>
                                    <Check className="w-4 h-4 text-[#10B981]" />{" "}
                                    Yes
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 text-[var(--text-tertiary)]" /> No
                                  </>
                                )}
                              </span>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Card className="bg-[var(--page-surface)] border-[var(--border-color)] p-12 text-center">
            <p className="text-[var(--text-secondary)] mb-4">
              Select at least one school to compare.
            </p>
            <Button onClick={() => setSelectedIds(["uoft", "western"])}>
              Start with UofT vs Western
            </Button>
          </Card>
        )}

        {/* Diff View Summary */}
        {selectedSchools.length >= 2 && (
          <Card className="bg-[var(--page-surface)] border-[var(--border-color)] mt-8">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-[var(--text-primary)]">
                <ArrowRightLeft className="w-5 h-5 text-[#F59E0B]" />
                Key Differences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {rows
                  .filter(row =>
                    diffHighlight(selectedSchools.map(s => row.get(s)))
                  )
                  .map(row => (
                    <li
                      key={row.label}
                      className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 text-sm"
                    >
                      <span className="font-medium text-[var(--text-primary)] min-w-[160px]">
                        {row.label}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedSchools.map(school => (
                          <Badge
                            key={school.id}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {school.name}: {row.get(school)}
                          </Badge>
                        ))}
                      </div>
                    </li>
                  ))}
                {rows.filter(row =>
                  diffHighlight(selectedSchools.map(s => row.get(s)))
                ).length === 0 && (
                  <p className="text-sm text-[var(--text-secondary)]">
                    All selected schools have identical values for these
                    requirements.
                  </p>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            className="border-[var(--border-color)]"
            asChild
          >
            <Link to="/schools">
              Browse All Schools
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            asChild
          >
            <Link to="/tools/competitiveness">
              <GraduationCap className="w-4 h-4 mr-2" />
              Calculate My Chances
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
