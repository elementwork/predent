import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowRight, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IsoCubeStack } from "./shared/IsoCube";
import { useRecordPATAttempt } from "@/hooks/useRecordPATAttempt";
import { nanoid } from "nanoid";
import {
  generateCubeCountingProblem,
  type CubeCountingProblem,
} from "./logic/cube-counting";
import { createPRNG } from "@/lib/prng";
import type { Difficulty as Diff, GeneratorConfig } from "./logic";

export interface CubeCountingGeneratorProps {
  config?: GeneratorConfig;
  onAnswer?: (result: {
    isCorrect: boolean;
    timeSpent: number;
    answerIndex: number;
  }) => void;
}

export default function CubeCountingGenerator({
  config,
  onAnswer,
}: CubeCountingGeneratorProps) {
  const controlled = !!config;
  const [difficulty, setDifficulty] = useState<Diff>(
    config?.difficulty ?? "easy"
  );
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000) + 1);
  const [problem, setProblem] = useState<CubeCountingProblem>(() =>
    config
      ? generateCubeCountingProblem(createPRNG(config.seed), config.difficulty)
      : generateCubeCountingProblem(createPRNG(seed), "easy")
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const sessionIdRef = useRef(nanoid());
  const startRef = useRef(0);
  useEffect(() => { startRef.current = Date.now(); }, []);
  const { start, recordAttempt } = useRecordPATAttempt();

  const { cubes, painted, answer, choices } = problem;

  const regenerate = useCallback(() => {
    if (controlled) {
      setProblem(generateCubeCountingProblem(createPRNG(Date.now()), difficulty));
    } else {
      const nextSeed = Math.floor(Math.random() * 1000000) + 1;
      setSeed(nextSeed);
      setProblem(generateCubeCountingProblem(createPRNG(nextSeed), difficulty));
    }
    setSelected(null);
    setResult(null);
    startRef.current = Date.now();
    start();
  }, [controlled, difficulty, start]);

  const checkAnswer = useCallback((value: number) => {
    if (result) return;
    setSelected(value);
    const isCorrect = value === answer;
    setResult(isCorrect ? "correct" : "incorrect");
    if (controlled && onAnswer) {
      const timeSpent = Math.round((Date.now() - startRef.current) / 1000);
      onAnswer({ isCorrect, timeSpent, answerIndex: choices.indexOf(value) });
    } else {
      recordAttempt("cube_counting", difficulty, seed, choices.indexOf(value), sessionIdRef.current);
    }
  }, [result, answer, controlled, onAnswer, difficulty, seed, recordAttempt, choices, sessionIdRef]);

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Cube Counting Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              How many cubes have exactly {answer} painted faces?
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
        <IsoCubeStack cubes={cubes} size={220} cubeSize={26} />
        <div className="flex-1">
          <Badge className="bg-[var(--page-muted)] text-[var(--text-secondary)] border-[var(--border-color)] mb-3">
            Question
          </Badge>
          <p className="text-[var(--text-primary)] text-lg font-medium">
            How many cubes are painted on exactly{" "}
            <span className="text-[#F59E0B]">{answer}</span> sides?
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Assume the entire stack is painted, then separated.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {choices.map(value => (
          <Button
            key={value}
            onClick={() => checkAnswer(value)}
            variant={selected === value ? "default" : "outline"}
            className={`min-w-[60px] ${
              selected === value
                ? result === "correct"
                  ? "bg-[#10B981] hover:bg-[#10B981]"
                  : result === "incorrect"
                    ? "bg-[#EF4444] hover:bg-[#EF4444]"
                    : "bg-[#2563EB]"
                : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--page-muted)]"
            }`}
            disabled={!!result}
          >
            {value}
            {selected === value && result === "correct" && (
              <Check className="w-3.5 h-3.5 ml-1" />
            )}
            {selected === value && result === "incorrect" && (
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
            ? `Correct! ${painted[answer]} cube${painted[answer] === 1 ? "" : "s"} have exactly ${answer} painted face${answer === 1 ? "" : "s"}.`
            : `Incorrect. The correct answer is ${answer} (${painted[answer]} cube${painted[answer] === 1 ? "" : "s"}).`}
        </div>
      )}

      {!controlled && (
        <Button
          onClick={regenerate}
          className="mt-4 bg-[#10B981] hover:bg-[#059669] text-white"
        >
          Next Question <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
