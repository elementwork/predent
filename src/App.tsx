import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import OnboardingModal from "./components/OnboardingModal";

const SchoolHubPage = lazy(() => import("./pages/SchoolHubPage"));
const GPACalculatorPage = lazy(() => import("./pages/GPACalculatorPage"));
const CompetitivenessCalculatorPage = lazy(
  () => import("./pages/CompetitivenessCalculatorPage")
);
const PATCalculatorPage = lazy(() => import("./pages/PATCalculatorPage"));
const StudySchedulesPage = lazy(() => import("./pages/StudySchedulesPage"));
const DATGuidePage = lazy(() => import("./pages/DATGuidePage"));
const DATAcademyPage = lazy(() => import("./pages/DATAcademyPage"));
const PATStrategyPage = lazy(() => import("./pages/PATStrategyPage"));
const CASPerGuidePage = lazy(() => import("./pages/CASPerGuidePage"));
const InterviewPrepPage = lazy(() => import("./pages/InterviewPrepPage"));
const ArticleGuidePage = lazy(() => import("./pages/ArticleGuidePage"));
const GuidesIndexPage = lazy(() => import("./pages/GuidesIndexPage"));
const ToolsIndexPage = lazy(() => import("./pages/ToolsIndexPage"));
const PATAcademyPage = lazy(() => import("./pages/PATAcademyPage"));
const PATPracticePage = lazy(() => import("./pages/PATPracticePage"));
const PATGeneratorsPage = lazy(() => import("./pages/PATGeneratorsPage"));
const PATAnalyticsPage = lazy(() => import("./pages/PATAnalyticsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PlannerPage = lazy(() => import("./pages/PlannerPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const DATPracticePage = lazy(() => import("./pages/DATPracticePage"));
const MockExamPage = lazy(() => import("./pages/MockExamPage"));
const SchoolDetailPage = lazy(() => import("./pages/SchoolDetailPage"));
const SchoolComparisonPage = lazy(
  () => import("./pages/SchoolComparisonPage")
);
const CommunityHubPage = lazy(() => import("./pages/CommunityHubPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const CommunityModerationPage = lazy(
  () => import("./pages/admin/CommunityModerationPage")
);
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NotificationSettingsPage = lazy(() => import("./pages/NotificationSettingsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FlashcardsPage = lazy(() => import("./pages/FlashcardsPage"));

function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-[#2563EB] rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/schools" element={<SchoolHubPage />} />
            <Route path="/school/:id" element={<SchoolDetailPage />} />

            {/* PAT Academy - Step 4 */}
            <Route path="/pat-academy" element={<PATAcademyPage />} />
            <Route
              path="/pat-academy/practice"
              element={<PATPracticePage />}
            />
            <Route
              path="/pat-academy/generators"
              element={<PATGeneratorsPage />}
            />
            <Route
              path="/pat-academy/analytics"
              element={<PATAnalyticsPage />}
            />

            <Route path="/dat-academy" element={<DATAcademyPage />} />
            <Route
              path="/dat-academy/practice"
              element={<DATPracticePage />}
            />
            <Route
              path="/dat-academy/mock-exam"
              element={<MockExamPage />}
            />
            <Route
              path="/flashcards"
              element={<FlashcardsPage />}
            />

            {/* SEO Content Pages - Step 3 */}
            <Route path="/guides" element={<GuidesIndexPage />} />
            <Route
              path="/guides/dat-study-schedules"
              element={<StudySchedulesPage />}
            />
            <Route
              path="/guides/canadian-dat-guide"
              element={<DATGuidePage />}
            />
            <Route
              path="/guides/pat/:category"
              element={<PATStrategyPage />}
            />
            <Route
              path="/guides/casper-dental-school"
              element={<CASPerGuidePage />}
            />
            <Route
              path="/guides/dental-school-interview"
              element={<InterviewPrepPage />}
            />
            <Route
              path="/guides/article/:slug"
              element={<ArticleGuidePage />}
            />
            <Route path="/tools" element={<ToolsIndexPage />} />
            <Route
              path="/tools/gpa-calculator"
              element={<GPACalculatorPage />}
            />
            <Route
              path="/tools/competitiveness"
              element={<CompetitivenessCalculatorPage />}
            />
            <Route
              path="/tools/pat-calculator"
              element={<PATCalculatorPage />}
            />
            <Route path="/community" element={<CommunityHubPage />} />
            <Route path="/compare" element={<SchoolComparisonPage />} />
            <Route path="/legal/:topic" element={<LegalPage />} />

            {/* Steps 5-7: Auth, Pricing, Dashboard, Planner */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/planner" element={<PlannerPage />} />
            <Route path="/dashboard/settings/notifications" element={<NotificationSettingsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/community" element={<CommunityModerationPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <OnboardingModal />
      </div>
      <Footer />
    </div>
  );
}

export default App;
