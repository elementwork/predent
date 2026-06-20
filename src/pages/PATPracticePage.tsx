import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Flag, ChevronLeft, ChevronRight, Brain,
  Check, X, RotateCcw, Home, Pause, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type PracticeMode = 'setup' | 'active' | 'paused' | 'review';
type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

const modes = [
  { id: 'quick', name: 'Quick Practice', desc: '10 random questions', icon: Brain },
  { id: 'category', name: 'Category Drill', desc: 'Focus on one category', icon: Filter },
  { id: 'timed', name: 'Timed Set', desc: '15 questions, 15 minutes', icon: Clock },
  { id: 'mixed', name: 'Mixed Practice', desc: 'All categories mixed', icon: RotateCcw },
  { id: 'exam', name: 'Exam Mode', desc: '90 questions, 60 minutes', icon: Check },
];

const categories = [
  { id: 'keyholes', name: 'Keyholes', color: '#14B8A6' },
  { id: 'tfe', name: 'Top-Front-End', color: '#6366F1' },
  { id: 'angle-ranking', name: 'Angle Ranking', color: '#F59E0B' },
  { id: 'hole-punching', name: 'Hole Punching', color: '#F43F5E' },
  { id: 'cube-counting', name: 'Cube Counting', color: '#10B981' },
  { id: 'pattern-folding', name: 'Pattern Folding', color: '#8B5CF6' },
];

const difficulties: { value: Difficulty; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'ELITE', label: 'Elite' },
];

interface MockQuestion {
  id: number;
  category: string;
  categoryColor: string;
  difficulty: Difficulty;
  diagram: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  timeTarget: number;
}

function generateMockQuestions(count: number, selectedCategory?: string): MockQuestion[] {
  const questions: MockQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const cat = selectedCategory
      ? categories.find(c => c.id === selectedCategory)!
      : categories[i % categories.length];
    questions.push({
      id: i + 1,
      category: cat.name,
      categoryColor: cat.color,
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)].value,
      diagram: `${cat.name} Question ${i + 1}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `This ${cat.name.toLowerCase()} question tests your spatial reasoning ability. The correct answer is determined by carefully analyzing the geometric relationships in the diagram.`,
      timeTarget: 40,
    });
  }
  return questions;
}

/* ─── Setup Screen ─── */
function SetupScreen({ onStart }: { onStart: (config: { mode: string; category?: string; difficulty: Difficulty; count: number; timeLimit: boolean }) => void }) {
  const [selectedMode, setSelectedMode] = useState('quick');
  const [selectedCategory, setSelectedCategory] = useState<string>('keyholes');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('INTERMEDIATE');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(true);

  return (
    <div className="min-h-screen bg-[#0F172A] pt-20">
      <div className="section-container max-w-3xl mx-auto pb-20">
        <Link to="/pat-academy" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to PAT Academy
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">Practice Setup</h1>

        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Select Mode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                  selectedMode === mode.id
                    ? 'border-[#2563EB] bg-[#2563EB]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <mode.icon className={`w-5 h-5 ${selectedMode === mode.id ? 'text-[#2563EB]' : 'text-white/40'}`} />
                <div>
                  <p className={`text-sm font-medium ${selectedMode === mode.id ? 'text-white' : 'text-white/70'}`}>{mode.name}</p>
                  <p className="text-xs text-white/40">{mode.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        {selectedMode === 'category' && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Category</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                  style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Difficulty</h2>
          <div className="flex gap-2">
            {difficulties.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDifficulty(d.value)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedDifficulty === d.value
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Questions: {questionCount}</h2>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full accent-[#2563EB]"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>5</span>
            <span>50</span>
          </div>
        </div>

        {/* Time Limit Toggle */}
        <div className="mb-8 flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-sm font-medium text-white">Time Limit</p>
              <p className="text-xs text-white/40">40 seconds per question</p>
            </div>
          </div>
          <button
            onClick={() => setTimeLimit(!timeLimit)}
            className={`w-12 h-6 rounded-full transition-colors ${timeLimit ? 'bg-[#2563EB]' : 'bg-white/20'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${timeLimit ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <Button
          className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-base"
          onClick={() => onStart({ mode: selectedMode, category: selectedCategory, difficulty: selectedDifficulty, count: questionCount, timeLimit })}
        >
          Start Practice
        </Button>
      </div>
    </div>
  );
}

/* ─── Active Practice Screen ─── */
function ActiveScreen({
  questions,
  onFinish,
}: {
  questions: MockQuestion[];
  onFinish: (answers: Record<number, number>, flagged: number[], timeSpent: Record<number, number>) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(40);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<'active' | 'paused' | 'review'>('active');
  const timeSpent = useRef<Record<number, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = questions[currentIndex];
  const totalQuestions = questions.length;

  useEffect(() => {
    if (mode === 'active' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          timeSpent.current[currentIndex] = (timeSpent.current[currentIndex] || 0) + 1;
          if (prev <= 1) {
            handleNext();
            return 40;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode, currentIndex]);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setAnswers((prev) => ({ ...prev, [currentIndex]: index }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(answers[currentIndex + 1] ?? null);
      setTimeLeft(40);
    } else {
      setMode('review');
      onFinish(answers, flagged, timeSpent.current);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswer(answers[currentIndex - 1] ?? null);
      setTimeLeft(40);
    }
  };

  const handleFlag = () => {
    setFlagged((prev) => prev.includes(currentIndex) ? prev.filter((i) => i !== currentIndex) : [...prev, currentIndex]);
  };

  const handleSubmit = () => {
    setMode('review');
    onFinish(answers, flagged, timeSpent.current);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    setMode(isPaused ? 'active' : 'paused');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (mode === 'review') return;
      if (e.key >= '1' && e.key <= '4') handleAnswer(Number(e.key) - 1);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === ' ') { e.preventDefault(); handleFlag(); }
      if (e.key === 'Enter') handleNext();
      if (e.key === 'Escape') togglePause();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, answers, mode, isPaused]);

  if (mode === 'paused') {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Pause className="w-12 h-12 text-[#F59E0B] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Practice Paused</h2>
            <p className="text-sm text-white/50 mb-6">Question {currentIndex + 1} of {totalQuestions}</p>
            <div className="flex flex-col gap-3">
              <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" onClick={togglePause}>Resume</Button>
              <Button variant="outline" className="border-white/10 text-white/60 hover:text-white" onClick={() => window.location.reload()}>Quit & Restart</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#1E293B] border-b border-white/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePause} className="p-1.5 rounded-md hover:bg-white/10 transition-colors">
              <Pause className="w-4 h-4 text-white/60" />
            </button>
            <span className="text-sm text-white/60">
              {currentIndex + 1} <span className="text-white/30">/ {totalQuestions}</span>
            </span>
            <Badge style={{ backgroundColor: `${question.categoryColor}20`, color: question.categoryColor, borderColor: question.categoryColor }} variant="outline" className="text-xs">
              {question.category}
            </Badge>
            <Badge variant="outline" className="text-xs text-white/40 border-white/10">{question.difficulty}</Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 ${timeLeft <= 10 ? 'text-[#EF4444]' : 'text-white/60'}`}>
              <Clock className="w-4 h-4" />
              <span className={`text-sm font-mono font-medium ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button onClick={handleFlag} className={`p-1.5 rounded-md transition-colors ${flagged.includes(currentIndex) ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'hover:bg-white/10 text-white/40'}`}>
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-5xl mx-auto mt-2">
          <Progress value={((currentIndex + 1) / totalQuestions) * 100} className="h-1 bg-white/10" />
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          {/* Diagram Placeholder */}
          <div className="aspect-video bg-[#1E293B] rounded-xl border border-white/10 flex items-center justify-center mb-6 relative overflow-hidden">
            <div className="text-center">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${question.categoryColor}20` }}>
                <Brain className="w-10 h-10" style={{ color: question.categoryColor }} />
              </div>
              <p className="text-sm font-medium text-white/60">{question.diagram}</p>
              <p className="text-xs text-white/30 mt-1">3D diagram will appear here</p>
            </div>
            {/* Target time indicator */}
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-white/5 text-[10px] text-white/30">
              Target: {question.timeTarget}s
            </div>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedAnswer === i
                    ? 'border-[#2563EB] bg-[#2563EB]/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    selectedAnswer === i ? 'bg-[#2563EB] text-white' : 'bg-white/10 text-white/40'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-[#2563EB]' :
                    answers[i] !== undefined ? 'bg-[#10B981]' :
                    flagged.includes(i) ? 'bg-[#F59E0B]' :
                    'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button className="bg-[#10B981] hover:bg-[#059669] text-white" onClick={handleSubmit}>
                Submit
                <Check className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Results Screen ─── */
function ResultsScreen({
  questions,
  answers,
  timeSpent,
  onRestart,
}: {
  questions: MockQuestion[];
  answers: Record<number, number>;
  timeSpent: Record<number, number>;
  onRestart: () => void;
}) {
  const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
  const total = questions.length;
  const accuracy = Math.round((correct / total) * 100);
  const avgTime = Math.round(Object.values(timeSpent).reduce((a, b) => a + b, 0) / total);

  const categoryStats: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q, i) => {
    if (!categoryStats[q.category]) categoryStats[q.category] = { correct: 0, total: 0 };
    categoryStats[q.category].total++;
    if (answers[i] === q.correctAnswer) categoryStats[q.category].correct++;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] pt-20">
      <div className="section-container max-w-3xl mx-auto pb-20">
        <h1 className="text-2xl font-bold text-white mb-6">Session Results</h1>

        {/* Score Summary */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className={`text-4xl font-extrabold ${accuracy >= 80 ? 'text-[#10B981]' : accuracy >= 60 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                  {accuracy}%
                </p>
                <p className="text-xs text-white/40 mt-1">Accuracy</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white">{correct}/{total}</p>
                <p className="text-xs text-white/40 mt-1">Correct</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white">{avgTime}s</p>
                <p className="text-xs text-white/40 mt-1">Avg Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Category Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([cat, stats]) => {
                const catData = categories.find(c => c.name === cat);
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60">{cat}</span>
                      <span className="text-xs font-medium" style={{ color: catData?.color || '#fff' }}>{stats.correct}/{stats.total} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: catData?.color || '#2563EB' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Question Review</h2>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const isCorrect = answers[i] === q.correctAnswer;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${isCorrect ? 'bg-[#10B981]/10' : 'bg-[#EF4444]/10'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCorrect ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}>
                      {isCorrect ? <Check className="w-3.5 h-3.5 text-white" /> : <X className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{q.category} - Question {i + 1}</p>
                      <p className="text-xs text-white/40">Your answer: {answers[i] !== undefined ? String.fromCharCode(65 + answers[i]) : '—'} | Correct: {String.fromCharCode(65 + q.correctAnswer)}</p>
                    </div>
                    <span className="text-xs text-white/40">{timeSpent[i] || 0}s</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1 h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold" onClick={onRestart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
          <Button variant="outline" className="h-11 border-white/10 text-white/60 hover:text-white" asChild>
            <Link to="/pat-academy"><Home className="w-4 h-4 mr-2" />PAT Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function PATPracticePage() {
  const [mode, setMode] = useState<PracticeMode>('setup');
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});

  const handleStart = useCallback((config: { mode: string; category?: string; difficulty: Difficulty; count: number; timeLimit: boolean }) => {
    const qs = generateMockQuestions(config.count, config.mode === 'category' ? config.category : undefined);
    setQuestions(qs);
    setMode('active');
  }, []);

  const handleFinish = useCallback((ans: Record<number, number>, _flg: number[], ts: Record<number, number>) => {
    setAnswers(ans);
    setTimeSpent(ts);
    setMode('review');
  }, []);

  const handleRestart = useCallback(() => {
    setMode('setup');
    setQuestions([]);
    setAnswers({});
    setTimeSpent({});
  }, []);

  return (
    <AnimatePresence mode="wait">
      {mode === 'setup' && <SetupScreen key="setup" onStart={handleStart} />}
      {mode === 'active' && <ActiveScreen key="active" questions={questions} onFinish={handleFinish} />}
      {mode === 'review' && (
        <ResultsScreen
          key="review"
          questions={questions}
          answers={answers}
          timeSpent={timeSpent}
          onRestart={handleRestart}
        />
      )}
    </AnimatePresence>
  );
}
