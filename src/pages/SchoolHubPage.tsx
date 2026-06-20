import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, GraduationCap, MapPin, Users, BookOpen,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const schools = [
  {
    id: 'uoft',
    name: 'University of Toronto',
    faculty: 'Faculty of Dentistry',
    province: 'Ontario',
    program: 'DDS',
    seats: 96,
    gpa: '3.96',
    datAA: '24',
    datPAT: '23',
    casper: true,
    interview: 'Panel',
    deadline: 'Nov 1',
    tuition: '$51,200/yr',
    color: '#002A5C',
  },
  {
    id: 'western',
    name: 'Western University',
    faculty: 'Schulich School of Medicine & Dentistry',
    province: 'Ontario',
    program: 'DDS',
    seats: 56,
    gpa: '89.85%',
    datAA: '21',
    datPAT: '21',
    casper: true,
    interview: 'Panel',
    deadline: 'Nov 1',
    tuition: '~$45,000/yr',
    color: '#4F2683',
  },
  {
    id: 'mcgill',
    name: 'McGill University',
    faculty: 'Faculty of Dental Medicine',
    province: 'Quebec',
    program: 'DMD',
    seats: 40,
    gpa: '3.83 IP / 3.92 OOP',
    datAA: 'NR',
    datPAT: 'NR',
    casper: true,
    interview: 'MMI',
    deadline: 'Nov 1',
    tuition: '~$42,000/yr',
    color: '#ED1C24',
  },
  {
    id: 'udem',
    name: 'Université de Montréal',
    faculty: 'Faculté de médecine dentaire',
    province: 'Quebec',
    program: 'DMD',
    seats: 65,
    gpa: 'NR',
    datAA: 'NR',
    datPAT: 'NR',
    casper: true,
    interview: 'MMI',
    deadline: 'Mar 1',
    tuition: '~$40,000/yr',
    color: '#0072CE',
  },
  {
    id: 'laval',
    name: 'Université Laval',
    faculty: 'Faculté de médecine dentaire',
    province: 'Quebec',
    program: 'DMD',
    seats: 55,
    gpa: 'NR',
    datAA: 'NR',
    datPAT: 'NR',
    casper: true,
    interview: 'MMI',
    deadline: 'Mar 1',
    tuition: '~$38,000/yr',
    color: '#FEC10D',
  },
  {
    id: 'ubc',
    name: 'University of British Columbia',
    faculty: 'Faculty of Dentistry',
    province: 'British Columbia',
    program: 'DMD',
    seats: 48,
    gpa: '86.24%',
    datAA: 'NR',
    datPAT: 'NR',
    casper: false,
    interview: 'MMI+SGI',
    deadline: 'Sep 10',
    tuition: '~$48,000/yr',
    color: '#002145',
  },
  {
    id: 'alberta',
    name: 'University of Alberta',
    faculty: 'School of Dentistry',
    province: 'Alberta',
    program: 'DDS',
    seats: 30,
    gpa: '3.94',
    datAA: 'NR',
    datPAT: 'NR',
    casper: true,
    interview: 'MMI',
    deadline: 'Nov 1',
    tuition: '~$44,000/yr',
    color: '#007C41',
  },
  {
    id: 'saskatchewan',
    name: 'University of Saskatchewan',
    faculty: 'College of Dentistry',
    province: 'Saskatchewan',
    program: 'DMD',
    seats: 36,
    gpa: '88.82% IP / 93.66% OOP',
    datAA: '21.88',
    datPAT: 'NR',
    casper: true,
    interview: 'MMI',
    deadline: 'Nov 15',
    tuition: '~$42,000/yr',
    color: '#00693F',
  },
  {
    id: 'manitoba',
    name: 'University of Manitoba',
    faculty: 'Dr. Gerald Niznick College of Dentistry',
    province: 'Manitoba',
    program: 'DMD',
    seats: 30,
    gpa: '3.75 IP / 4.0 OOP',
    datAA: 'NR',
    datPAT: 'NR',
    casper: false,
    interview: 'Panel',
    deadline: 'Oct 1',
    tuition: '~$40,000/yr',
    color: '#8D0044',
  },
  {
    id: 'dalhousie',
    name: 'Dalhousie University',
    faculty: 'Faculty of Dentistry',
    province: 'Nova Scotia',
    program: 'DDS',
    seats: 40,
    gpa: 'NR',
    datAA: 'NR',
    datPAT: 'NR',
    casper: false,
    interview: 'Panel',
    deadline: 'Nov 1',
    tuition: '~$43,000/yr',
    color: '#FFD400',
  },
];

const provinces = ['All', 'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Saskatchewan', 'Manitoba', 'Nova Scotia'];

export default function SchoolHubPage() {
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');

  const filtered = schools.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.province.toLowerCase().includes(search.toLowerCase());
    const matchProvince = selectedProvince === 'All' || s.province === selectedProvince;
    return matchSearch && matchProvince;
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] pt-24 pb-16">
        <div className="section-container max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Canadian Dental Schools
          </h1>
          <p className="text-white/70 max-w-2xl">
            Comprehensive profiles, admission statistics, and requirements for all 10 Canadian dental schools.
          </p>
        </div>
      </div>

      <div className="section-container max-w-7xl mx-auto -mt-8">
        {/* Search & Filters */}
        <Card className="border-[#E2E8F0] shadow-lg mb-8">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <Input
                  placeholder="Search schools..."
                  className="pl-10 h-11"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {provinces.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedProvince(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedProvince === p
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
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
              <Card className="card-hover border-[#E2E8F0] h-full cursor-pointer group">
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
                        <h3 className="text-base font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                          {school.name}
                        </h3>
                        <p className="text-xs text-[#475569]">{school.faculty}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {school.program}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      <MapPin className="w-4 h-4 text-[#94A3B8]" />
                      {school.province}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      <Users className="w-4 h-4 text-[#94A3B8]" />
                      {school.seats} seats
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      <BookOpen className="w-4 h-4 text-[#94A3B8]" />
                      Avg GPA: {school.gpa}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      <GraduationCap className="w-4 h-4 text-[#94A3B8]" />
                      DAT AA: {school.datAA}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                      {school.casper && (
                        <Badge variant="outline" className="text-[10px]">CASPer</Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">{school.interview}</Badge>
                    </div>
                    <Link
                      to={`/school/${school.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#475569]">No schools found matching your criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
}
