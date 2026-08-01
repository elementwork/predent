export type GpaScale = "4.0" | "100";

export interface SchoolYearStat {
  year: number;
  avgGpa?: number;
  avgDatAa?: number;
  avgDatPat?: number;
  avgDatRc?: number;
  applications?: number;
  offers?: number;
}

export interface School {
  id: string;
  name: string;
  faculty: string;
  province: string;
  city: string;
  program: "DDS" | "DMD";
  seats: number;
  seatsIp?: number;
  seatsOop?: number;
  seatsInternational?: number;
  color: string;
  website: string;

  // Admission snapshot
  minGpa: string;
  gpaMethod: string;
  avgAdmittedGpa: string;
  avgAdmittedGpaNumeric: number;
  gpaScale: GpaScale;
  minDat: string;
  avgDatAa: string;
  avgDatPat: string;
  avgDatRc: string;
  casperRequired: boolean;
  casperDetails?: string;
  interviewFormat: string;
  interviewTiming?: string;
  degreeRequired: string;
  prerequisites: string[];
  applicationFee: string;
  applicationOpens: string;
  applicationDeadline: string;
  tuitionDomestic: string;
  tuitionInternational: string;

  // Acceptance stats
  applicationSeatRatio: string;
  interviewRate: number;
  offerRate: number;
  ipAcceptanceRate: number;
  oopAcceptanceRate: number;

  // Detailed content
  overview: string;
  highlights: string[];
  campusLife: string;
  admissionsTips: string[];
  trendStats: SchoolYearStat[];
}

export const schools: School[] = [
  {
    id: "uoft",
    name: "University of Toronto",
    faculty: "Faculty of Dentistry",
    province: "Ontario",
    city: "Toronto",
    program: "DDS",
    seats: 96,
    seatsIp: 80,
    seatsOop: 16,
    color: "#002A5C",
    website: "https://www.dentistry.utoronto.ca/",

    minGpa: "3.0 (4.0 scale)",
    gpaMethod:
      "Lowest year dropped (if 4+ years completed); best 2 years if 3 years",
    avgAdmittedGpa: "3.96",
    avgAdmittedGpaNumeric: 3.96,
    gpaScale: "4.0",
    minDat: "Not specified",
    avgDatAa: "24",
    avgDatPat: "23",
    avgDatRc: "22",
    casperRequired: true,
    casperDetails: "Required — write by November 1 for the current cycle",
    interviewFormat: "Panel",
    interviewTiming: "Typically February",
    degreeRequired:
      "3 full years of university education (4-year degree strongly preferred)",
    prerequisites: [
      "Biochemistry (1 semester)",
      "Physiology (1 semester)",
      "Life Sciences (4 semesters)",
      "Humanities/Social Sciences (2 semesters)",
    ],
    applicationFee: "$350 CAD",
    applicationOpens: "July 2",
    applicationDeadline: "November 1",
    tuitionDomestic: "$51,200/yr",
    tuitionInternational: "$92,000/yr",

    applicationSeatRatio: "9.4:1",
    interviewRate: 35,
    offerRate: 22,
    ipAcceptanceRate: 24,
    oopAcceptanceRate: 4,

    overview:
      "The University of Toronto Faculty of Dentistry is Canada's largest dental school and one of the most research-intensive dental faculties in North America. Located in downtown Toronto, it offers unparalleled clinical exposure due to its high patient volume and affiliation with major teaching hospitals. The DDS program emphasizes evidence-based dentistry, research, and community service, producing graduates who consistently rank among the most competitive applicants for specialty programs.",
    highlights: [
      "Largest dental school in Canada with 96 first-year seats",
      "Strongest research output and specialty placement rates",
      "Located in downtown Toronto with diverse patient population",
      "State-of-the-art simulation clinics and digital dentistry curriculum",
    ],
    campusLife:
      "UofT Dentistry is situated in the heart of Toronto's Discovery District, surrounded by hospitals, research institutes, and food/culture options. Students have access to the full University of Toronto campus amenities, including athletics, libraries, and over 1,000 student clubs. The dental student society is very active and organizes mentorship, wellness, and networking events throughout the year.",
    admissionsTips: [
      "Aim for a 3.9+ GPA and 23+ PAT to be competitive — averages are among the highest in Canada.",
      "Take prerequisites early so you can write the DAT by the summer before applying.",
      "CASPer is required; prepare with realistic scenarios and practice typing under time pressure.",
      "The panel interview focuses on motivation, ethics, and knowledge of the profession — prepare concrete personal stories.",
    ],
    trendStats: [
      { year: 2021, avgGpa: 3.94, avgDatAa: 24, avgDatPat: 23 },
      { year: 2022, avgGpa: 3.95, avgDatAa: 24, avgDatPat: 23 },
      { year: 2023, avgGpa: 3.96, avgDatAa: 24, avgDatPat: 23 },
      { year: 2024, avgGpa: 3.96, avgDatAa: 24, avgDatPat: 23 },
      { year: 2025, avgGpa: 3.96, avgDatAa: 24, avgDatPat: 23 },
    ],
  },
  {
    id: "western",
    name: "Western University",
    faculty: "Schulich School of Medicine & Dentistry",
    province: "Ontario",
    city: "London",
    program: "DDS",
    seats: 56,
    seatsIp: 44,
    seatsOop: 12,
    color: "#4F2683",
    website: "https://www.schulich.uwo.ca/dentistry/",

    minGpa: "80% (best 2 years)",
    gpaMethod: "Best 2 academic years (minimum 10 full courses across 2 years)",
    avgAdmittedGpa: "89.85%",
    avgAdmittedGpaNumeric: 89.85,
    gpaScale: "100",
    minDat: "19 (AA, PAT, RC each)",
    avgDatAa: "21",
    avgDatPat: "21",
    avgDatRc: "21",
    casperRequired: true,
    casperDetails: "Required — must be taken in the current admissions cycle",
    interviewFormat: "Panel",
    interviewTiming: "Late February",
    degreeRequired: "4-year bachelor's degree (or expected by program start)",
    prerequisites: [
      "Biochemistry (1 semester)",
      "Physiology (1 semester)",
      "Organic Chemistry (recommended but not required)",
    ],
    applicationFee: "$375 CAD",
    applicationOpens: "September",
    applicationDeadline: "November 1",
    tuitionDomestic: "$45,000/yr",
    tuitionInternational: "$85,000/yr",

    applicationSeatRatio: "8:1",
    interviewRate: 40,
    offerRate: 25,
    ipAcceptanceRate: 28,
    oopAcceptanceRate: 6,

    overview:
      "Western's Schulich School of Medicine & Dentistry offers a DDS program known for its collegial culture, strong clinical training, and emphasis on professionalism. Western uses a best-2-years GPA calculation, which benefits students who had a weaker first year. The program integrates early clinical exposure and small-group learning in London, Ontario.",
    highlights: [
      "Best-2-years GPA policy is forgiving of a weak first year",
      "Small class size of ~56 students creates tight-knit community",
      "Strong clinical preparation and rural/community outreach rotations",
      "Beautiful campus with excellent student life facilities",
    ],
    campusLife:
      "Western's main campus in London features modern residences, athletic facilities, and a vibrant student community. The dental school is located near University Hospital and Victoria Hospital, giving students exposure to diverse patient cases. London offers a lower cost of living than Toronto while still providing big-city amenities.",
    admissionsTips: [
      "Maximize your best 2 years — focus on getting the highest possible grades in your strongest years.",
      "Meet the minimum DAT of 19 in every section; competitive applicants score 21+ across the board.",
      "A 4-year degree is required — plan your undergrad timeline accordingly.",
      "The panel interview often asks about teamwork and professionalism — emphasize collaborative experiences.",
    ],
    trendStats: [
      { year: 2021, avgGpa: 89.5, avgDatAa: 21, avgDatPat: 21 },
      { year: 2022, avgGpa: 89.7, avgDatAa: 21, avgDatPat: 21 },
      { year: 2023, avgGpa: 89.8, avgDatAa: 21, avgDatPat: 21 },
      { year: 2024, avgGpa: 89.85, avgDatAa: 21, avgDatPat: 21 },
      { year: 2025, avgGpa: 89.85, avgDatAa: 21, avgDatPat: 21 },
    ],
  },
  {
    id: "mcgill",
    name: "McGill University",
    faculty: "Faculty of Dental Medicine",
    province: "Quebec",
    city: "Montreal",
    program: "DMD",
    seats: 40,
    seatsIp: 28,
    seatsOop: 12,
    color: "#ED1C24",
    website: "https://www.mcgill.ca/dentistry/",

    minGpa: "Not reported",
    gpaMethod: "Cumulative GPA (all university coursework)",
    avgAdmittedGpa: "3.83 IP / 3.92 OOP",
    avgAdmittedGpaNumeric: 3.875,
    gpaScale: "4.0",
    minDat: "Not specified",
    avgDatAa: "22",
    avgDatPat: "21",
    avgDatRc: "21",
    casperRequired: true,
    casperDetails:
      "Required for out-of-province applicants; strongly recommended for Quebec residents",
    interviewFormat: "MMI",
    interviewTiming: "February-March",
    degreeRequired: "Bachelor's degree (or expected by program start)",
    prerequisites: [
      "Biology (2 semesters with labs)",
      "General Chemistry (2 semesters with labs)",
      "Physics (2 semesters)",
      "Organic Chemistry (1 semester)",
    ],
    applicationFee: "Varies (~$200 CAD)",
    applicationOpens: "September",
    applicationDeadline: "November 1",
    tuitionDomestic: "$42,000/yr (QC residents lower)",
    tuitionInternational: "$78,000/yr",

    applicationSeatRatio: "7:1",
    interviewRate: 30,
    offerRate: 18,
    ipAcceptanceRate: 22,
    oopAcceptanceRate: 5,

    overview:
      "McGill's Faculty of Dental Medicine in Montreal is one of Canada's most prestigious dental schools, with a strong emphasis on research, global health, and interprofessional education. The DMD program is bilingual-friendly and attracts applicants from across Canada and internationally. McGill uses an MMI format and values well-rounded applicants with diverse experiences.",
    highlights: [
      "Prestigious global reputation and research opportunities",
      "MMI interview format assesses communication and critical thinking",
      "Located in vibrant, bilingual Montreal",
      "Strong emphasis on global health and community outreach",
    ],
    campusLife:
      "McGill is located at the base of Mount Royal in downtown Montreal, offering a unique blend of historic architecture and modern facilities. Students enjoy Montreal's renowned food scene, festivals, and affordable cost of living. The Faculty of Dental Medicine is part of the McGill University Health Centre network, providing diverse clinical experiences.",
    admissionsTips: [
      "Out-of-province applicants need very strong stats (3.9+ GPA typical).",
      "Prepare thoroughly for the MMI — practice ethical scenarios, communication stations, and role plays.",
      "French language skills are helpful for community rotations but not required for admission.",
      "Highlight research, leadership, and community service experiences in your application.",
    ],
    trendStats: [
      { year: 2021, avgGpa: 3.82, avgDatAa: 22, avgDatPat: 21 },
      { year: 2022, avgGpa: 3.84, avgDatAa: 22, avgDatPat: 21 },
      { year: 2023, avgGpa: 3.86, avgDatAa: 22, avgDatPat: 21 },
      { year: 2024, avgGpa: 3.87, avgDatAa: 22, avgDatPat: 21 },
      { year: 2025, avgGpa: 3.875, avgDatAa: 22, avgDatPat: 21 },
    ],
  },
  {
    id: "udem",
    name: "Université de Montréal",
    faculty: "Faculté de médecine dentaire",
    province: "Quebec",
    city: "Montreal",
    program: "DMD",
    seats: 65,
    seatsIp: 52,
    seatsOop: 13,
    color: "#0072CE",
    website: "https://medecinedentaire.umontreal.ca/",

    minGpa: "Not reported",
    gpaMethod: "Cumulative university GPA",
    avgAdmittedGpa: "~3.7",
    avgAdmittedGpaNumeric: 3.7,
    gpaScale: "4.0",
    minDat: "Not specified",
    avgDatAa: "20",
    avgDatPat: "20",
    avgDatRc: "20",
    casperRequired: true,
    casperDetails: "Required for non-Quebec applicants",
    interviewFormat: "MMI",
    interviewTiming: "Winter",
    degreeRequired: "Bachelor's degree or equivalent",
    prerequisites: [
      "Biology (2 semesters)",
      "Chemistry (2 semesters)",
      "Physics (2 semesters)",
      "French proficiency required for program delivery",
    ],
    applicationFee: "Varies",
    applicationOpens: "September",
    applicationDeadline: "March 1",
    tuitionDomestic: "$40,000/yr (QC residents lower)",
    tuitionInternational: "$75,000/yr",

    applicationSeatRatio: "6:1",
    interviewRate: 30,
    offerRate: 20,
    ipAcceptanceRate: 24,
    oopAcceptanceRate: 5,

    overview:
      "Université de Montréal's Faculté de médecine dentaire is the largest French-language dental school in North America. The DMD program is taught in French and serves a diverse patient population across Montreal. It is an excellent option for bilingual students and those interested in practicing in Quebec.",
    highlights: [
      "Largest French-language dental school in North America",
      "65 first-year seats — one of the larger programs",
      "Strong clinical training in Montreal's diverse communities",
      "Later application deadline (March 1) gives more preparation time",
    ],
    campusLife:
      "The faculty is located on the university's main campus on the northern slope of Mount Royal. Montreal offers a vibrant student life with affordable housing, excellent public transit, and a rich cultural scene. Note that the program is delivered in French, so fluency is essential for success.",
    admissionsTips: [
      "French fluency is required — both for admission and for the program itself.",
      "Prepare for the MMI with scenario-based practice in French if possible.",
      "Quebec residents and CEGEP graduates have a distinct admissions pathway.",
      "The March deadline means you can write a winter DAT and still apply.",
    ],
    trendStats: [
      { year: 2021, avgGpa: 3.68, avgDatAa: 20, avgDatPat: 20 },
      { year: 2022, avgGpa: 3.69, avgDatAa: 20, avgDatPat: 20 },
      { year: 2023, avgGpa: 3.7, avgDatAa: 20, avgDatPat: 20 },
      { year: 2024, avgGpa: 3.7, avgDatAa: 20, avgDatPat: 20 },
      { year: 2025, avgGpa: 3.7, avgDatAa: 20, avgDatPat: 20 },
    ],
  },
  {
    id: "laval",
    name: "Université Laval",
    faculty: "Faculté de médecine dentaire",
    province: "Quebec",
    city: "Quebec City",
    program: "DMD",
    seats: 55,
    seatsIp: 45,
    seatsOop: 10,
    color: "#005EB8",
    website: "https://www.fmd.ulaval.ca/",

    minGpa: "Not reported",
    gpaMethod: "Cumulative GPA",
    avgAdmittedGpa: "~3.7",
    avgAdmittedGpaNumeric: 3.7,
    gpaScale: "4.0",
    minDat: "Not specified",
    avgDatAa: "20",
    avgDatPat: "20",
    avgDatRc: "20",
    casperRequired: true,
    casperDetails: "Required for out-of-province applicants",
    interviewFormat: "MMI",
    interviewTiming: "Winter",
    degreeRequired: "Bachelor's degree or equivalent",
    prerequisites: [
      "Biology (2 semesters)",
      "Chemistry (2 semesters)",
      "Physics (2 semesters)",
      "French proficiency required",
    ],
    applicationFee: "Varies",
    applicationOpens: "September",
    applicationDeadline: "March 1",
    tuitionDomestic: "$38,000/yr (QC residents lower)",
    tuitionInternational: "$72,000/yr",

    applicationSeatRatio: "5.5:1",
    interviewRate: 30,
    offerRate: 20,
    ipAcceptanceRate: 24,
    oopAcceptanceRate: 5,

    overview:
      "Université Laval's Faculté de médecine dentaire in Quebec City is the oldest dental school in Canada and a leader in oral health research. The DMD program is delivered in French and emphasizes a humanistic, patient-centered approach to dentistry. Its historic campus and close-knit academic community attract students from across Quebec and beyond.",
    highlights: [
      "Oldest dental faculty in Canada (founded 1904)",
      "Beautiful historic campus in Quebec City",
      "Strong research culture and community partnerships",
      "French-language program with a collegial atmosphere",
    ],
    campusLife:
      "Laval's campus in Quebec City combines historic architecture with modern facilities. The city is known for its safety, affordability, and European charm. Students enjoy winter sports, cultural festivals, and a tight-knit francophone academic community.",
    admissionsTips: [
      "Strong French skills are essential for the program and patient care.",
      "Prepare for MMI stations that may include ethical dilemmas and communication tasks.",
      "Quebec residents have a significant admissions advantage.",
      "Research experience and community involvement strengthen your application.",
    ],
    trendStats: [
      { year: 2021, avgGpa: 3.68, avgDatAa: 20, avgDatPat: 20 },
      { year: 2022, avgGpa: 3.69, avgDatAa: 20, avgDatPat: 20 },
      { year: 2023, avgGpa: 3.7, avgDatAa: 20, avgDatPat: 20 },
      { year: 2024, avgGpa: 3.7, avgDatAa: 20, avgDatPat: 20 },
      { year: 2025, avgGpa: 3.7, avgDatAa: 20, avgDatPat: 20 },
    ],
  },
  {
    id: "ubc",
    name: "University of British Columbia",
    faculty: "Faculty of Dentistry",
    province: "British Columbia",
    city: "Vancouver",
    program: "DMD",
    seats: 48,
    seatsIp: 36,
    seatsOop: 12,
    color: "#002145",
    website: "https://www.dentistry.ubc.ca/",

    minGpa: "70% (2.8 on 4.0 scale)",
    gpaMethod: "Lowest year dropped (if 4+ years completed)",
    avgAdmittedGpa: "86.24%",
    avgAdmittedGpaNumeric: 86.24,
    gpaScale: "100",
    minDat: "Not specified",
    avgDatAa: "22",
    avgDatPat: "21",
    avgDatRc: "21",
    casperRequired: false,
    interviewFormat: "MMI + Small Group Interview",
    interviewTiming: "October-December",
    degreeRequired: "Not specified; bachelor's strongly recommended",
    prerequisites: [
      "Biology (2 semesters)",
      "General Chemistry (2 semesters)",
      "Biochemistry (1 semester)",
    ],
    applicationFee: "Varies",
    applicationOpens: "July",
    applicationDeadline: "September 10",
    tuitionDomestic: "$48,000/yr",
    tuitionInternational: "$88,000/yr",

    applicationSeatRatio: "7:1",
    interviewRate: 38,
    offerRate: 24,
    ipAcceptanceRate: 28,
    oopAcceptanceRate: 7,

    overview:
      "UBC's Faculty of Dentistry in Vancouver offers a DMD program known for its innovative curriculum, early clinical exposure, and stunning West Coast location. UBC does not require CASPer and uses a unique MMI plus small-group interview format. The school values well-rounded applicants and offers strong research and global outreach opportunities.",
    highlights: [
      "No CASPer required — one less admissions hurdle",
      "Unique MMI + Small Group Interview format",
      "Early clinical exposure and strong community health focus",
      "Beautiful Vancouver campus with mild climate",
    ],
    campusLife:
      "UBC's Vancouver campus is one of the most beautiful university campuses in the world, surrounded by forest and ocean. Students have access to excellent athletics, recreation, and outdoor activities. Vancouver offers a diverse, cosmopolitan environment but has a higher cost of living than most Canadian cities.",
    admissionsTips: [
      "Apply early — the September 10 deadline is much earlier than most schools.",
      "BC residents receive a significant admissions advantage.",
      "Practice both traditional MMI stations and small-group discussion formats.",
      "Emphasize teamwork, community service, and leadership experiences.",
    ],
    trendStats: [
      { year: 2021, avgGpa: 85.8, avgDatAa: 22, avgDatPat: 21 },
      { year: 2022, avgGpa: 86.0, avgDatAa: 22, avgDatPat: 21 },
      { year: 2023, avgGpa: 86.1, avgDatAa: 22, avgDatPat: 21 },
      { year: 2024, avgGpa: 86.24, avgDatAa: 22, avgDatPat: 21 },
      { year: 2025, avgGpa: 86.24, avgDatAa: 22, avgDatPat: 21 },
    ],
  },
  {
    id: "alberta",
    name: "University of Alberta",
    faculty: "School of Dentistry",
    province: "Alberta",
    city: "Edmonton",
    program: "DDS",
    seats: 30,
    seatsIp: 22,
    seatsOop: 8,
    color: "#007C41",
    website: "https://www.ualberta.ca/dentistry/index.html",

    minGpa: "3.5 (4.0 scale)",
    gpaMethod: "Most recent 2 years (minimum 24 credits each)",
    avgAdmittedGpa: "3.94",
    avgAdmittedGpaNumeric: 3.94,
    gpaScale: "4.0",
    minDat: "Not specified",
    avgDatAa: "23",
    avgDatPat: "22",
    avgDatRc: "22",
    casperRequired: true,
    casperDetails: "Required — must be written in the admissions cycle",
    interviewFormat: "MMI",
    interviewTiming: "February-March",
    degreeRequired: "Bachelor's degree strongly recommended",
    prerequisites: [
      "Biology (2 semesters with labs)",
      "General Chemistry (2 semesters with labs)",
      "Organic Chemistry (1 semester)",
      "Biochemistry (1 semester)",
    ],
    applicationFee: "Varies",
    applicationOpens: "September",
    applicationDeadline: "November 1",
    tuitionDomestic: "$44,000/yr",
    tuitionInternational: "$82,000/yr",

    applicationSeatRatio: "7.5:1",
    interviewRate: 32,
    offerRate: 20,
    ipAcceptanceRate: 24,
    oopAcceptanceRate: 5,

    overview:
      "The University of Alberta School of Dentistry in Edmonton is a research-intensive institution with a strong reputation for clinical excellence and community service. The DDS program uses an MMI interview format and considers the most recent two years of university coursework, giving students a chance to demonstrate upward academic trends.",
    highlights: [
      "Most-recent-2-years GPA calculation rewards improvement",
      "Strong research and specialty training opportunities",
      "Smaller class size allows individualized attention",
      "Edmonton offers affordable living and a strong healthcare hub",
    ],
    campusLife:
      "The U of A's main campus is located in the heart of Edmonton, near the river valley — the largest urban parkland in North America. Students enjoy a lively campus with excellent recreation facilities, a vibrant arts scene, and easy access to outdoor activities year-round.",
    admissionsTips: [
      "Focus on acing your most recent two years — older coursework matters less.",
      "DAT scores of 22+ AA and 21+ PAT are competitive.",
      "Prepare for MMI scenarios involving ethics, communication, and problem solving.",
      "Alberta residents have a meaningful admissions advantage.",
    ],
    trendStats: [
      { year: 2021, avgGpa: 3.92, avgDatAa: 22, avgDatPat: 21 },
      { year: 2022, avgGpa: 3.93, avgDatAa: 22, avgDatPat: 21 },
      { year: 2023, avgGpa: 3.94, avgDatAa: 23, avgDatPat: 22 },
      { year: 2024, avgGpa: 3.94, avgDatAa: 23, avgDatPat: 22 },
      { year: 2025, avgGpa: 3.94, avgDatAa: 23, avgDatPat: 22 },
    ],
  },
  {
    id: "saskatchewan",
    name: "University of Saskatchewan",
    faculty: "College of Dentistry",
    province: "Saskatchewan",
    city: "Saskatoon",
    program: "DMD",
    seats: 36,
    seatsIp: 28,
    seatsOop: 8,
    color: "#00693F",
    website: "https://medicine.usask.ca/dentistry/",

    minGpa: "75% (4.0 scale equivalent)",
    gpaMethod: "Best 2 years or cumulative (verify current cycle policy)",
    avgAdmittedGpa: "88.82% IP / 93.66% OOP",
    avgAdmittedGpaNumeric: 88.82,
    gpaScale: "100",
    minDat: "Not specified",
    avgDatAa: "21.88",
    avgDatPat: "21",
    avgDatRc: "21",
    casperRequired: true,
    casperDetails: "Required for current cycle applicants",
    interviewFormat: "MMI",
    interviewTiming: "February",
    degreeRequired: "Bachelor's degree or expected completion",
    prerequisites: [
      "Biology (2 semesters)",
      "Chemistry (2 semesters)",
      "Physics (2 semesters)",
      "Organic Chemistry (1 semester)",
    ],
    applicationFee: "Varies",
    applicationOpens: "September",
    applicationDeadline: "November 15",
    tuitionDomestic: "$42,000/yr",
    tuitionInternational: "$78,000/yr",

    applicationSeatRatio: "6:1",
    interviewRate: 45,
    offerRate: 28,
    ipAcceptanceRate: 32,
    oopAcceptanceRate: 8,

    overview:
      "The University of Saskatchewan College of Dentistry in Saskatoon is known for its supportive learning environment and strong ties to rural and Indigenous oral health. The DMD program emphasizes community-based education and produces graduates who are well-prepared for practice across Saskatchewan and beyond.",
    highlights: [
      "Strong focus on rural and Indigenous oral health",
      "High interview and offer rates relative to other schools",
      "Supportive, collegial learning environment",
      "Saskatchewan residents enjoy a large IP advantage",
    ],
    campusLife:
      "The U of S campus in Saskatoon is known for its beautiful collegiate Gothic architecture and friendly atmosphere. Saskatoon offers a low cost of living, a growing arts and food scene, and easy access to prairie landscapes and outdoor recreation.",
    admissionsTips: [
      "Saskatchewan residents have one of the strongest IP advantages in Canada.",
      "OOP applicants need exceptional stats — 93%+ GPA reported for recent cycles.",
      "MMI preparation should include rural health and Indigenous health awareness.",
      "Community service and leadership are valued highly.",
    ],
    trendStats: [
      { year: 2021, avgGpa: 88.5, avgDatAa: 21.5, avgDatPat: 21 },
      { year: 2022, avgGpa: 88.6, avgDatAa: 21.7, avgDatPat: 21 },
      { year: 2023, avgGpa: 88.7, avgDatAa: 21.8, avgDatPat: 21 },
      { year: 2024, avgGpa: 88.82, avgDatAa: 21.88, avgDatPat: 21 },
      { year: 2025, avgGpa: 88.82, avgDatAa: 21.88, avgDatPat: 21 },
    ],
  },
  {
    id: "manitoba",
    name: "University of Manitoba",
    faculty: "Dr. Gerald Niznick College of Dentistry",
    province: "Manitoba",
    city: "Winnipeg",
    program: "DMD",
    seats: 30,
    seatsIp: 24,
    seatsOop: 6,
    color: "#8D0044",
    website: "https://umanitoba.ca/dentistry",

    minGpa: "Not reported",
    gpaMethod: "Cumulative GPA or best years (verify current cycle)",
    avgAdmittedGpa: "3.75 IP / 4.0 OOP",
    avgAdmittedGpaNumeric: 3.875,
    gpaScale: "4.0",
    minDat: "Not specified",
    avgDatAa: "21",
    avgDatPat: "20",
    avgDatRc: "21",
    casperRequired: false,
    interviewFormat: "Panel",
    interviewTiming: "February-March",
    degreeRequired: "Bachelor's degree or expected completion",
    prerequisites: [
      "Biology (2 semesters)",
      "Chemistry (2 semesters)",
      "Physics (2 semesters)",
      "Organic Chemistry (1 semester)",
    ],
    applicationFee: "Varies",
    applicationOpens: "September",
    applicationDeadline: "October 1",
    tuitionDomestic: "$40,000/yr",
    tuitionInternational: "$76,000/yr",

    applicationSeatRatio: "6:1",
    interviewRate: 42,
    offerRate: 26,
    ipAcceptanceRate: 30,
    oopAcceptanceRate: 7,

    overview:
      "The Dr. Gerald Niznick College of Dentistry at the University of Manitoba in Winnipeg offers a DMD program with a strong clinical focus and a commitment to serving Manitoba's diverse communities. The college does not require CASPer and uses a panel interview format, making it attractive for students who prefer traditional interviews.",
    highlights: [
      "No CASPer required",
      "Panel interview format",
      "Strong clinical training and community outreach",
      "October 1 deadline is earlier than most schools",
    ],
    campusLife:
      "The U of M's Bannatyne Campus is located near downtown Winnipeg and the Health Sciences Centre, one of Canada's largest healthcare complexes. Winnipeg offers affordable housing, a vibrant arts scene, and a friendly Midwestern atmosphere with distinct seasons.",
    admissionsTips: [
      "The October 1 deadline is early — prepare your application during the summer.",
      "Manitoba residents have a strong IP advantage.",
      "Panel interviews focus on motivation, self-awareness, and knowledge of dentistry.",
      "Emphasize community involvement and experiences with diverse populations.",
    ],
    trendStats: [
      { year: 2021, avgGpa: 3.8, avgDatAa: 21, avgDatPat: 20 },
      { year: 2022, avgGpa: 3.82, avgDatAa: 21, avgDatPat: 20 },
      { year: 2023, avgGpa: 3.85, avgDatAa: 21, avgDatPat: 20 },
      { year: 2024, avgGpa: 3.87, avgDatAa: 21, avgDatPat: 20 },
      { year: 2025, avgGpa: 3.875, avgDatAa: 21, avgDatPat: 20 },
    ],
  },
  {
    id: "dalhousie",
    name: "Dalhousie University",
    faculty: "Faculty of Dentistry",
    province: "Nova Scotia",
    city: "Halifax",
    program: "DDS",
    seats: 40,
    seatsIp: 30,
    seatsOop: 10,
    color: "#222222",
    website: "https://www.dal.ca/faculty/dentistry.html",

    minGpa: "Not reported",
    gpaMethod: "Cumulative GPA or best years (verify current cycle)",
    avgAdmittedGpa: "~3.85",
    avgAdmittedGpaNumeric: 3.85,
    gpaScale: "4.0",
    minDat: "Not specified",
    avgDatAa: "21",
    avgDatPat: "20",
    avgDatRc: "21",
    casperRequired: false,
    interviewFormat: "Panel",
    interviewTiming: "February-March",
    degreeRequired: "Bachelor's degree or expected completion",
    prerequisites: [
      "Biology (2 semesters)",
      "Chemistry (2 semesters)",
      "Physics (2 semesters)",
      "Organic Chemistry (1 semester)",
    ],
    applicationFee: "Varies",
    applicationOpens: "September",
    applicationDeadline: "November 1",
    tuitionDomestic: "$43,000/yr",
    tuitionInternational: "$80,000/yr",

    applicationSeatRatio: "6:1",
    interviewRate: 35,
    offerRate: 22,
    ipAcceptanceRate: 26,
    oopAcceptanceRate: 6,

    overview:
      "Dalhousie University's Faculty of Dentistry in Halifax is the only dental school in Atlantic Canada and serves a vital role for the region. The DDS program emphasizes comprehensive patient care, research, and service to underserved communities. It does not require CASPer and uses a panel interview, appealing to students who prefer conversational interviews.",
    highlights: [
      "Only dental school in Atlantic Canada",
      "No CASPer required",
      "Panel interview format",
      "Strong focus on community service and Atlantic Canada health needs",
    ],
    campusLife:
      "Dalhousie is located in Halifax, a historic coastal city known for its friendly people, vibrant music scene, and maritime culture. The campus is walkable and close to the waterfront, with a lower cost of living than Toronto or Vancouver. Students enjoy a tight-knit dental class and strong regional alumni network.",
    admissionsTips: [
      "Atlantic Canadian residents (NS, NB, PEI, NL) receive IP preference.",
      "Prepare for panel questions about motivation and community commitment.",
      "Clinical exposure and volunteering in underserved settings is valued.",
      "Apply broadly — OOP seats are limited.",
    ],
    trendStats: [
      { year: 2021, avgGpa: 3.82, avgDatAa: 21, avgDatPat: 20 },
      { year: 2022, avgGpa: 3.83, avgDatAa: 21, avgDatPat: 20 },
      { year: 2023, avgGpa: 3.84, avgDatAa: 21, avgDatPat: 20 },
      { year: 2024, avgGpa: 3.85, avgDatAa: 21, avgDatPat: 20 },
      { year: 2025, avgGpa: 3.85, avgDatAa: 21, avgDatPat: 20 },
    ],
  },
];

export const schoolById = new Map(schools.map(s => [s.id, s]));

export function getSchoolById(id: string): School | undefined {
  return schoolById.get(id);
}

export function getAllSchools(): School[] {
  return schools;
}

export function getSchoolsByProvince(province: string): School[] {
  return schools.filter(s => s.province === province);
}

export const provinces = [
  "All",
  "Ontario",
  "Quebec",
  "British Columbia",
  "Alberta",
  "Saskatchewan",
  "Manitoba",
  "Nova Scotia",
];
