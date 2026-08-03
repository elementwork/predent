import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowRight, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GridSvg, IsoCubeStack } from "./shared/IsoCube";
import { useRecordPATAttempt } from "@/hooks/useRecordPATAttempt";
import { nanoid } from "nanoid";
import { generateTFEProblem, type TFEProblem } from "./logic/tfe";
import { createPRNG } from "@/lib/prng";
import type { Difficulty as Diff, GeneratorConfig } from "./logic";

function ViewGrid({ grid, label }: { grid: boolean[][]; label?: string }) {
  return (
    <div className="text-center">
      <GridSvg grid={grid} filledColor="#6366F1" />
      {label && (
        <p className="text-xs text-[var(--text-tertiary)] mt-1">{label}</p>
      )}
    </div>
  );
}

export interface TopFrontEndGeneratorProps {
  config?: GeneratorConfig;
  onAnswer?: (result: {
    isCorrect: boolean;
    timeSpent: number;
    answerIndex: number;
  }) => void;
}

export default function TopFrontEndGenerator({
  config,
  onAnswer,
}: TopFrontEndGeneratorProps) {
  const controlled = !!config;
  const [difficulty, setDifficulty] = useState<Diff>(
    config?.difficulty ?? "easy"
  );
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000) + 1);
  const [problem, setProblem] = useState<TFEProblem>(() =>
    config
      ? generateTFEProblem(createPRNG(config.seed), config.difficulty)
      : generateTFEProblem(createPRNG(seed), "easy")
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const sessionIdRef = useRef(nanoid());
  const startRef = useRef(0);
  useEffect(() => { startRef.current = Date.now(); }, []);
  const { start, recordAttempt } = useRecordPATAttempt();

  const { shape, missingView, givenViews, options, correctIndex } = problem;

  const regenerate = useCallback(() => {
    if (controlled) {
      setProblem(generateTFEProblem(createPRNG(Date.now()), difficulty));
    } else {
      const nextSeed = Math.floor(Math.random() * 1000000) + 1;
      setSeed(nextSeed);
      setProblem(generateTFEProblem(createPRNG(nextSeed), difficulty));
    }
    setSelectedIndex(null);
    setResult(null);
    startRef.current = Date.now();
    start();
  }, [controlled, difficulty, start]);

  const checkAnswer = useCallback((index: number) => {
    if (result) return;
    setSelectedIndex(index);
    const isCorrect = index === correctIndex;
    setResult(isCorrect ? "correct" : "incorrect");
    if (controlled && onAnswer) {
      const timeSpent = Math.round((Date.now() - startRef.current) / 1000);
      onAnswer({ isCorrect, timeSpent, answerIndex: index });
    } else {
      recordAttempt("tfe", difficulty, seed, index, sessionIdRef.current);
    }
  }, [result, correctIndex, controlled, onAnswer, difficulty, seed, recordAttempt, sessionIdRef]);

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Top-Front-End Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Find the missing orthographic view.
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

      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        <IsoCubeStack cubes={shape.cubes} size={160} cubeSize={22} />
        <div className="flex gap-3">
          {givenViews.map(view => (
            <ViewGrid
              key={view}
              grid={shape[view]}
              label={view.charAt(0).toUpperCase() + view.slice(1)}
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
          Which is the <span className="text-[#6366F1]">{missingView}</span>{" "}
          view?
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">
          Given the top, front, and end projections of the same object, select
          the missing view.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {options.map((grid, i) => (
          <button
            key={i}
            onClick={() => checkAnswer(i)}
            disabled={!!result}
            className="text-left"
          >
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: `2px solid ${
                  result && i === correctIndex
                    ? "#10B981"
                    : selectedIndex === i && result === "incorrect"
                      ? "#EF4444"
                      : selectedIndex === i
                        ? "#2563EB"
                        : "var(--border-color)"
                }`,
              }}
            >
              <GridSvg grid={grid} filledColor="#6366F1" />
            </div>
            <p className="text-center text-xs text-[var(--text-tertiary)] mt-1">
              {String.fromCharCode(65 + i)}
            </p>
          </button>
        ))}
      </div>

      {result && (
        <div
          className={`p-3 rounded-lg text-sm ${result === "correct" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}
        >
          {result === "correct" ? (
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Correct! You matched the missing{" "}
              {missingView} view.
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <X className="w-4 h-4" /> Incorrect. Option{" "}
              {String.fromCharCode(65 + correctIndex)} is the correct{" "}
              {missingView} view.
            </span>
          )}
        </div>
      )}

      {!controlled && (
        <Button
          onClick={regenerate}
          className="mt-4 bg-[#6366F1] hover:bg-[#4F46E5] text-white"
        >
          Next Question <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
