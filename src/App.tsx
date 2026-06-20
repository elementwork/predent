import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import SchoolHubPage from './pages/SchoolHubPage';
import GPACalculatorPage from './pages/GPACalculatorPage';
import StudySchedulesPage from './pages/StudySchedulesPage';
import DATGuidePage from './pages/DATGuidePage';
import PATStrategyPage from './pages/PATStrategyPage';
import CASPerGuidePage from './pages/CASPerGuidePage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import PATAcademyPage from './pages/PATAcademyPage';
import PATPracticePage from './pages/PATPracticePage';
import PATGeneratorsPage from './pages/PATGeneratorsPage';
import PATAnalyticsPage from './pages/PATAnalyticsPage';
import PlaceholderPage from './pages/PlaceholderPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/schools" element={<SchoolHubPage />} />
          <Route path="/school/:id" element={<PlaceholderPage />} />

          {/* PAT Academy - Step 4 */}
          <Route path="/pat-academy" element={<PATAcademyPage />} />
          <Route path="/pat-academy/practice" element={<PATPracticePage />} />
          <Route path="/pat-academy/generators" element={<PATGeneratorsPage />} />
          <Route path="/pat-academy/analytics" element={<PATAnalyticsPage />} />

          <Route path="/dat-academy" element={<PlaceholderPage />} />

          {/* SEO Content Pages - Step 3 */}
          <Route path="/guides/dat-study-schedules" element={<StudySchedulesPage />} />
          <Route path="/guides/canadian-dat-guide" element={<DATGuidePage />} />
          <Route path="/guides/pat-keyholes" element={<PATStrategyPage />} />
          <Route path="/guides/pat-tfe" element={<PATStrategyPage />} />
          <Route path="/guides/pat-angle-ranking" element={<PATStrategyPage />} />
          <Route path="/guides/pat-hole-punching" element={<PATStrategyPage />} />
          <Route path="/guides/pat-cube-counting" element={<PATStrategyPage />} />
          <Route path="/guides/pat-pattern-folding" element={<PATStrategyPage />} />
          <Route path="/guides/casper-dental-school" element={<CASPerGuidePage />} />
          <Route path="/guides/dental-school-interview" element={<InterviewPrepPage />} />
          <Route path="/tools/gpa-calculator" element={<GPACalculatorPage />} />
          <Route path="/tools/competitiveness" element={<PlaceholderPage />} />
          <Route path="/community" element={<PlaceholderPage />} />
          <Route path="/compare" element={<PlaceholderPage />} />
          <Route path="/blog" element={<PlaceholderPage />} />
          <Route path="/auth/login" element={<PlaceholderPage />} />
          <Route path="/auth/register" element={<PlaceholderPage />} />
          <Route path="/pricing" element={<PlaceholderPage />} />
          <Route path="/dashboard" element={<PlaceholderPage />} />
          <Route path="*" element={<PlaceholderPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
