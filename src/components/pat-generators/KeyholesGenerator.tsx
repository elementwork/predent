import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowRight, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IsoCubeStack, GridSvg } from "./shared/IsoCube";
import { useRecordPATAttempt } from "@/hooks/useRecordPATAttempt";
import { nanoid } from "nanoid";
import {
  generateKeyholesProblem,
  type KeyholesProblem,
} from "./logic/keyholes";
import { createPRNG } from "@/lib/prng";
import type { Difficulty as Diff } from "./logic";
import type { GeneratorConfig } from "./logic";

export interface KeyholesGeneratorProps {
  config?: GeneratorConfig;
  onAnswer?: (result: {
    isCorrect: boolean;
    timeSpent: number;
    answerIndex: number;
  }) => void;
}

export default function KeyholesGenerator({
  config,
  onAnswer,
}: KeyholesGeneratorProps) {
  const controlled = !!config;
  const [difficulty, setDifficulty] = useState<Diff>(
    config?.difficulty ?? "easy"
  );
  const [problem, setProblem] = useState<KeyholesProblem>(() =>
    config
      ? generateKeyholesProblem(createPRNG(config.seed), config.difficulty)
      : generateKeyholesProblem(Math.random, "easy")
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const sessionIdRef = useRef(nanoid());
  const questionIdRef = useRef(nanoid());
  const startRef = useRef(0);
  useEffect(() => { startRef.current = Date.now(); }, []);
  const { start, recordAttempt } = useRecordPATAttempt();

  const { cubes, options, correctIndex } = problem;

  const regenerate = useCallback(() => {
    const random = controlled ? createPRNG(Date.now()) : Math.random;
    setProblem(generateKeyholesProblem(random, difficulty));
    setSelectedIndex(null);
    setResult(null);
    questionIdRef.current = nanoid();
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
      recordAttempt("keyholes", difficulty, questionIdRef.current, index, sessionIdRef.current);
    }
  }, [result, correctIndex, controlled, onAnswer, difficulty, recordAttempt, sessionIdRef]);

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Keyholes Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Pick the keyhole this object would pass through.
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
        <IsoCubeStack cubes={cubes} size={180} cubeSize={26} />
        <div className="flex-1">
          <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
            Which keyhole matches this object?
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Imagine pushing the object straight through the paper from this
            viewing direction.
          </p>
        </div>
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
              <GridSvg grid={grid} filledColor="#14B8A6" />
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
              <Check className="w-4 h-4" /> Correct! That silhouette matches the
              object.
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <X className="w-4 h-4" /> Incorrect. Option{" "}
              {String.fromCharCode(65 + correctIndex)} is the correct keyhole.
            </span>
          )}
        </div>
      )}

      {!controlled && (
        <Button
          onClick={regenerate}
          className="mt-4 bg-[#14B8A6] hover:bg-[#0D9488] text-white"
        >
          Next Question <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
