import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { ArrowRight, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AngleSvg } from "./shared/IsoCube";
import { useRecordPATAttempt } from "@/hooks/useRecordPATAttempt";
import { nanoid } from "nanoid";
import {
  generateAngleRankingProblem,
  type AngleRankingProblem,
} from "./logic/angle-ranking";
import { createPRNG } from "@/lib/prng";
import type { Difficulty as Diff, GeneratorConfig } from "./logic";

export interface AngleRankingGeneratorProps {
  config?: GeneratorConfig;
  onAnswer?: (result: {
    isCorrect: boolean;
    timeSpent: number;
    answerIndex: number;
  }) => void;
}

export default function AngleRankingGenerator({
  config,
  onAnswer,
}: AngleRankingGeneratorProps) {
  const controlled = !!config;
  const [difficulty, setDifficulty] = useState<Diff>(
    config?.difficulty ?? "easy"
  );
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000) + 1);
  const [problem, setProblem] = useState<AngleRankingProblem>(() =>
    config
      ? generateAngleRankingProblem(createPRNG(config.seed), config.difficulty)
      : generateAngleRankingProblem(createPRNG(seed), "easy")
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const sessionIdRef = useRef(nanoid());
  const startRef = useRef(0);
  useEffect(() => { startRef.current = Date.now(); }, []);
  const { start, recordAttempt } = useRecordPATAttempt();

  const { angles, correctIndex } = problem;
  const labels = useMemo(() => ["A", "B", "C", "D"], []);

  const sorted = useMemo(() => [...angles].sort((a, b) => a - b), [angles]);

  const regenerate = useCallback(() => {
    if (controlled) {
      setProblem(generateAngleRankingProblem(createPRNG(Date.now()), difficulty));
    } else {
      const nextSeed = Math.floor(Math.random() * 1000000) + 1;
      setSeed(nextSeed);
      setProblem(generateAngleRankingProblem(createPRNG(nextSeed), difficulty));
    }
    setSelected(null);
    setResult(null);
    startRef.current = Date.now();
    start();
  }, [controlled, difficulty, start]);

  const checkAnswer = useCallback((label: string) => {
    if (result) return;
    setSelected(label);
    const idx = labels.indexOf(label);
    const isCorrect = idx === correctIndex;
    setResult(isCorrect ? "correct" : "incorrect");
    if (controlled && onAnswer) {
      const timeSpent = Math.round((Date.now() - startRef.current) / 1000);
      onAnswer({ isCorrect, timeSpent, answerIndex: idx });
    } else {
      recordAttempt("angle_ranking", difficulty, seed, idx, sessionIdRef.current);
    }
  }, [result, correctIndex, controlled, onAnswer, difficulty, seed, recordAttempt, sessionIdRef, labels]);

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Angle Ranking Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Identify the smallest angle from four choices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["easy", "medium", "hard"] as Diff[]).map(d => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(d);
                  regenerate();
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                  difficulty === d
                    ? "bg-[#2563EB] text-white"
                    : "bg-[var(--page-muted)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                }`}
              >
                {d}
              </button>
            ))}
            <button
              onClick={regenerate}
              className="p-1.5 rounded bg-[var(--page-muted)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {angles.map((angle, i) => (
          <div
            key={`${angle}-${i}`}
            className="flex flex-col items-center gap-1"
          >
            <AngleSvg angle={angle} />
            <Badge className="bg-[var(--page-muted)] text-[var(--text-secondary)] border-[var(--border-color)]">
              {labels[i]}
            </Badge>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {labels.map(label => (
          <Button
            key={label}
            onClick={() => checkAnswer(label)}
            variant={selected === label ? "default" : "outline"}
            className={`min-w-[60px] ${
              selected === label
                ? result === "correct"
                  ? "bg-[#10B981] hover:bg-[#10B981]"
                  : result === "incorrect"
                    ? "bg-[#EF4444] hover:bg-[#EF4444]"
                    : "bg-[#2563EB]"
                : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--page-muted)]"
            }`}
            disabled={!!result}
          >
            {label}
            {selected === label && result === "correct" && (
              <Check className="w-3.5 h-3.5 ml-1" />
            )}
            {selected === label && result === "incorrect" && (
              <X className="w-3.5 h-3.5 ml-1" />
            )}
          </Button>
        ))}
      </div>

      {result && (
        <div
          className={`p-3 rounded-lg text-sm ${result === "correct" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}
        >
          {result === "correct"
            ? "Correct! You identified the smallest angle."
            : `Incorrect. The smallest angle was ${labels[correctIndex]} (${sorted[0]}°).`}
        </div>
      )}

      {!controlled && (
        <Button
          onClick={regenerate}
          className="mt-4 bg-[#F59E0B] hover:bg-[#D97706] text-white"
        >
          Next Question <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
