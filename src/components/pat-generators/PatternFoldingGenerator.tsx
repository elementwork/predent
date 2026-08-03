import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowRight, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecordPATAttempt } from "@/hooks/useRecordPATAttempt";
import { nanoid } from "nanoid";
import {
  generatePatternFoldingProblem,
  type PatternFoldingProblem,
} from "./logic/pattern-folding";
import { createPRNG } from "@/lib/prng";
import type { Difficulty as Diff, GeneratorConfig } from "./logic";

function NetSvg({ symbols }: { symbols: string[] }) {
  const cell = 38;
  const positions = [
    { x: 1, y: 1 },
    { x: 1, y: 0 },
    { x: 1, y: 2 },
    { x: 0, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 3 },
  ];

  return (
    <svg
      width={160}
      height={210}
      viewBox="0 0 160 210"
      className="max-w-full h-auto rounded-lg border border-[var(--border-color)] bg-[var(--page-muted)]"
    >
      {positions.map((p, i) => (
        <g key={i}>
          <rect
            x={12 + p.x * cell}
            y={12 + p.y * cell}
            width={cell - 3}
            height={cell - 3}
            rx={4}
            fill="var(--page-surface)"
            stroke="#8B5CF6"
            strokeWidth={1.5}
          />
          {symbols[i] && (
            <text
              x={12 + p.x * cell + cell / 2 - 1}
              y={12 + p.y * cell + cell / 2 + 7}
              fill="#8B5CF6"
              fontSize={20}
              textAnchor="middle"
            >
              {symbols[i]}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function CubeFace({
  symbol,
  x,
  y,
  size,
}: {
  symbol: string;
  x: number;
  y: number;
  size: number;
}) {
  return (
    <g>
      <polygon
        points={`${x},${y} ${x + size},${y - size * 0.5} ${x + size * 2},${y} ${x + size},${y + size * 0.5}`}
        fill="var(--page-surface)"
        stroke="#8B5CF6"
        strokeWidth={1.2}
      />
      {symbol && (
        <text
          x={x + size}
          y={y + 5}
          fill="#8B5CF6"
          fontSize={16}
          textAnchor="middle"
        >
          {symbol}
        </text>
      )}
    </g>
  );
}

function Cube3D({ symbols }: { symbols: string[] }) {
  const size = 26;
  const cx = 70;
  const cy = 80;
  const front = { x: cx - size, y: cy };
  const top = { x: cx - size, y: cy - size * 0.5 };
  const right = { x: cx, y: cy - size * 0.5 };

  return (
    <svg
      width={150}
      height={130}
      viewBox="0 0 150 130"
      className="max-w-full h-auto rounded-lg border border-[var(--border-color)] bg-[var(--page-muted)]"
    >
      <CubeFace symbol={symbols[0]} x={front.x} y={front.y} size={size} />
      <CubeFace symbol={symbols[1]} x={top.x} y={top.y} size={size} />
      <CubeFace symbol={symbols[4]} x={right.x} y={right.y} size={size} />
    </svg>
  );
}

export interface PatternFoldingGeneratorProps {
  config?: GeneratorConfig;
  onAnswer?: (result: {
    isCorrect: boolean;
    timeSpent: number;
    answerIndex: number;
  }) => void;
}

export default function PatternFoldingGenerator({
  config,
  onAnswer,
}: PatternFoldingGeneratorProps) {
  const controlled = !!config;
  const [difficulty, setDifficulty] = useState<Diff>(
    config?.difficulty ?? "easy"
  );
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000) + 1);
  const [problem, setProblem] = useState<PatternFoldingProblem>(() =>
    config
      ? generatePatternFoldingProblem(
          createPRNG(config.seed),
          config.difficulty
        )
      : generatePatternFoldingProblem(createPRNG(seed), "easy")
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const sessionIdRef = useRef(nanoid());
  const startRef = useRef(0);
  useEffect(() => { startRef.current = Date.now(); }, []);
  const { start, recordAttempt } = useRecordPATAttempt();

  const { symbols, options, correctIndex } = problem;

  const regenerate = useCallback(() => {
    if (controlled) {
      setProblem(generatePatternFoldingProblem(createPRNG(Date.now()), difficulty));
    } else {
      const nextSeed = Math.floor(Math.random() * 1000000) + 1;
      setSeed(nextSeed);
      setProblem(generatePatternFoldingProblem(createPRNG(nextSeed), difficulty));
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
      recordAttempt("pattern_folding", difficulty, seed, index, sessionIdRef.current);
    }
  }, [result, correctIndex, controlled, onAnswer, difficulty, seed, recordAttempt, sessionIdRef]);

  return (
    <div className="bg-[var(--page-surface)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
      {!controlled && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">
              Pattern Folding Generator
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Pick the 3D form that matches the 2D net.
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
        <NetSvg symbols={symbols} />
        <div className="flex-1">
          <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
            Which cube does this net fold into?
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            The visible faces in the 3D option must match the front, top, and
            right faces of the folded net.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {options.map((mapping, i) => (
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
              <Cube3D symbols={mapping} />
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
              <Check className="w-4 h-4" /> Correct! The symbols align with the
              folded net.
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <X className="w-4 h-4" /> Incorrect. Option{" "}
              {String.fromCharCode(65 + correctIndex)} is the correct folded
              form.
            </span>
          )}
        </div>
      )}

      {!controlled && (
        <Button
          onClick={regenerate}
          className="mt-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
        >
          Next Question <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
