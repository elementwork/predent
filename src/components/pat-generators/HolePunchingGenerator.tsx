import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecordPATAttempt } from "@/hooks/useRecordPATAttempt";
import { useTheme } from "@/providers/theme";
import { nanoid } from "nanoid";
import {
  generateHolePunchingProblem,
  type HolePunchingProblem,
  type Punch,
} from "./logic/hole-punching";
import { createPRNG } from "@/lib/prng";
import type { Difficulty as Diff, GeneratorConfig } from "./logic";

function PaperCanvas({
  fold,
  folds,
  punch,
}: {
  fold: string;
  folds: number;
  punch: Punch;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 180;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const margin = 14;
    const paperSize = size - margin * 2;
    const isDark = document.documentElement.classList.contains("dark");

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = isDark ? "#1E293B" : "#FFFFFF";
    ctx.fillRect(margin, margin, paperSize, paperSize);

    ctx.strokeStyle = isDark ? "#F59E0B" : "#D97706";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    if (fold === "horizontal") {
      ctx.moveTo(margin, margin + paperSize / 2);
      ctx.lineTo(margin + paperSize, margin + paperSize / 2);
    } else if (fold === "vertical") {
      ctx.moveTo(margin + paperSize / 2, margin);
      ctx.lineTo(margin + paperSize / 2, margin + paperSize);
    } else {
      ctx.moveTo(margin, margin + paperSize);
      ctx.lineTo(margin + paperSize, margin);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = isDark ? "#94A3B8" : "#475569";
    ctx.lineWidth = 1;
    ctx.strokeRect(margin, margin, paperSize, paperSize);

    const px = margin + punch.x * paperSize;
    const py = margin + punch.y * paperSize;
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.arc(px + 1, py + 1, 5, 0, Math.PI * 2);
    ctx.fill();
  }, [fold, folds, punch, resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border border-[var(--border-color)] bg-[var(--page-muted)]"
    />
  );
}

function UnfoldedOption({
  holes,
  isSelected,
  isCorrect,
  showResult,
}: {
  holes: Punch[];
  isSelected: boolean;
  isCorrect: boolean;
  showResult: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 120;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const margin = 10;
    const paperSize = size - margin * 2;
    const isDark = document.documentElement.classList.contains("dark");

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = isDark ? "#1E293B" : "#FFFFFF";
    ctx.fillRect(margin, margin, paperSize, paperSize);
    ctx.strokeStyle = isDark ? "#94A3B8" : "#475569";
    ctx.lineWidth = 1;
    ctx.strokeRect(margin, margin, paperSize, paperSize);

    for (const h of holes) {
      const px = margin + h.x * paperSize;
      const py = margin + h.y * paperSize;
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [holes, resolvedTheme]);

  let borderColor = "var(--border-color)";
  if (showResult && isCorrect) borderColor = "#10B981";
  else if (showResult && isSelected && !isCorrect) borderColor = "#EF4444";
  else if (isSelected) borderColor = "#2563EB";

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{ border: `2px solid ${borderColor}` }}
    >
      <canvas ref={canvasRef} className="bg-[var(--page-muted)]" />
      {showResult && isCorrect && (
        <div className="absolute top-1 right-1 bg-[#10B981] text-white text-[10px] px-1.5 rounded">
          Correct
        </div>
      )}
    </div>
  );
}

export interface HolePunchingGeneratorProps {
  config?: GeneratorConfig;
  onAnswer?: (result: {
    isCorrect: boolean;
    timeSpent: number;
    answerIndex: number;
  }) => void;
}

export default function HolePunchingGenerator({
  config,
  onAnswer,
}: HolePunchingGeneratorProps) {
  const controlled = !!config;
  const [difficulty, setDifficulty] = useState<Diff>(
    config?.difficulty ?? "easy"
  );
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000) + 1);
  const [problem, setProblem] = useState<HolePunchingProblem>(() =>
    config
      ? generateHolePunchingProblem(createPRNG(config.seed), config.difficulty)
      : generateHolePunchingProblem(createPRNG(seed), "easy")
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const sessionIdRef = useRef(nanoid());
  const startRef = useRef(0);
  useEffect(() => { startRef.current = Date.now(); }, []);
  const { start, recordAttempt } = useRecordPATAttempt();

  const { foldProblem, options, correctIndex } = problem;

  const regenerate = useCallback(() => {
    if (controlled) {
      setProblem(generateHolePunchingProblem(createPRNG(Date.now()), difficulty));
    } else {
      const nextSeed = Math.floor(Math.random() * 1000000) + 1;
      setSeed(nextSeed);
      setProblem(generateHolePunchingProblem(createPRNG(nextSeed), difficulty));
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
      recordAttempt("hole_punching", difficulty, seed, index, sessionIdRef.current);
    }
  }, [result, correctIndex, controlled, onAnswer, difficulty, seed, recordAttempt, sessionIdRef]);

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Hole Punching Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Choose the unfolded paper pattern.
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
        <div className="text-center">
          <PaperCanvas
            fold={foldProblem.fold}
            folds={foldProblem.folds}
            punch={foldProblem.punch}
          />
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Folded paper with hole punch
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
            Which option shows the unfolded paper?
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {foldProblem.fold === "horizontal" &&
              "Folded in half horizontally."}
            {foldProblem.fold === "vertical" && "Folded in half vertically."}
            {foldProblem.fold === "diagonal" && "Folded diagonally."}
            {foldProblem.folds === 2 && " Then folded a second time."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {options.map((holes, i) => (
          <button
            key={i}
            onClick={() => checkAnswer(i)}
            disabled={!!result}
            className="text-left"
          >
            <UnfoldedOption
              holes={holes}
              isSelected={selectedIndex === i}
              isCorrect={i === correctIndex}
              showResult={!!result}
            />
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
          {result === "correct"
            ? "Correct! You traced the hole(s) through the fold(s)."
            : `Incorrect. Option ${String.fromCharCode(65 + correctIndex)} shows the correct unfolded pattern.`}
        </div>
      )}

      {!controlled && (
        <Button
          onClick={regenerate}
          className="mt-4 bg-[#F43F5E] hover:bg-[#E11D48] text-white"
        >
          Next Question <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
