import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { schools, provinces } from "@contracts/schools";
import {
  Search,
  GraduationCap,
  MapPin,
  Users,
  BookOpen,
  ChevronRight,
  School,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const hubSchools = schools.map(s => ({
  id: s.id,
  name: s.name,
  faculty: s.faculty,
  province: s.province,
  program: s.program,
  seats: s.seats,
  gpa: s.avgAdmittedGpa,
  datAA: s.avgDatAa,
  datPAT: s.avgDatPat,
  casper: s.casperRequired,
  interview: s.interviewFormat,
  deadline: s.applicationDeadline,
  tuition: s.tuitionDomestic,
  color: s.color,
}));

export default function SchoolHubPage() {
  usePageTitle("Canadian Dental Schools");

  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("All");

  const filtered = hubSchools.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.province.toLowerCase().includes(search.toLowerCase());
    const matchProvince =
      selectedProvince === "All" || s.province === selectedProvince;
    return matchSearch && matchProvince;
  });

  return (
    <main className="min-h-screen bg-[var(--page-bg)]">
      {/* Header */}
      <div className="pt-20 pb-12 bg-gradient-to-br from-[var(--page-bg)] to-[var(--page-surface)]">
        <div className="section-container max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center">
              <School className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                Canadian Dental Schools
              </h1>
              <p className="text-[var(--text-secondary)]">
                Comprehensive profiles, admission statistics, and requirements.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8">
        {/* Search & Filters */}
        <Card className="border-[var(--border-color)] shadow-lg mb-8">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <Input
                  placeholder="Search schools..."
                  className="pl-10 h-11"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {provinces.map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedProvince(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedProvince === p
                        ? "bg-[#2563EB] text-white"
                        : "bg-[var(--page-muted)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School Grid */}
        <div className="grid md:grid-cols-2 gap-4 pb-20">
          {filtered.map((school, i) => (
            <motion.div
              key={school.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/school/${school.id}`}>
                <Card className="card-hover border-[var(--border-color)] h-full cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
                          style={{ backgroundColor: school.color }}
                        >
                          {school.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[#2563EB] transition-colors">
                            {school.name}
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {school.faculty}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="shrink-0 bg-[#DCFCE7] text-xs text-[#14532D]"
                      >
                        {school.program}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
                        {school.province}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Users className="w-4 h-4 text-[var(--text-tertiary)]" />
                        {school.seats} seats
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <BookOpen className="w-4 h-4 text-[var(--text-tertiary)]" />
                        Avg GPA: {school.gpa}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <GraduationCap className="w-4 h-4 text-[var(--text-tertiary)]" />
                        DAT AA: {school.datAA}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                      <div className="flex items-center gap-2">
                        {school.casper && (
                          <Badge variant="outline" className="text-[10px]">
                            CASPer
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          {school.interview}
                        </Badge>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-medium text-[#1D4ED8]">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--text-secondary)]">
              No schools found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
