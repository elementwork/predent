import { useState, useRef, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import { useRecordPATAttempt } from "@/hooks/useRecordPATAttempt";
import type { Difficulty, PatCategory, GeneratorConfig } from "../logic";
import { createPRNG, type PRNG } from "@/lib/prng";

export interface GeneratorAnswer {
  isCorrect: boolean;
  timeSpent: number;
  answerIndex: number;
}

export interface PatGeneratorProps {
  config?: GeneratorConfig;
  onAnswer?: (result: GeneratorAnswer) => void;
}

export function usePatGenerator<TProblem>(
  category: PatCategory,
  generate: (random: PRNG, difficulty: Difficulty) => TProblem,
  config?: GeneratorConfig,
  onAnswer?: (result: GeneratorAnswer) => void
) {
  const controlled = !!config;
  const [difficulty, setDifficulty] = useState<Difficulty>(
    config?.difficulty ?? "easy"
  );
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000) + 1);
  const [problem, setProblem] = useState<TProblem>(() =>
    config
      ? generate(createPRNG(config.seed), config.difficulty)
      : generate(createPRNG(seed), "easy")
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const sessionIdRef = useRef(nanoid());
  const startRef = useRef(0);
  useEffect(() => {
    startRef.current = Date.now();
  }, []);
  const { start, recordAttempt } = useRecordPATAttempt();

  const regenerate = useCallback(() => {
    if (controlled) {
      setProblem(generate(createPRNG(Date.now()), difficulty));
    } else {
      const nextSeed = Math.floor(Math.random() * 1000000) + 1;
      setSeed(nextSeed);
      setProblem(generate(createPRNG(nextSeed), difficulty));
    }
    setSelectedIndex(null);
    setResult(null);
    startRef.current = Date.now();
    start();
  }, [controlled, difficulty, generate, start]);

  const checkAnswer = useCallback(
    (index: number, correctIndex: number) => {
      if (result) return;
      setSelectedIndex(index);
      const isCorrect = index === correctIndex;
      setResult(isCorrect ? "correct" : "incorrect");
      if (controlled && onAnswer) {
        const timeSpent = Math.round((Date.now() - startRef.current) / 1000);
        onAnswer({ isCorrect, timeSpent, answerIndex: index });
      } else {
        recordAttempt(category, difficulty, seed, index, sessionIdRef.current);
      }
    },
    [result, controlled, onAnswer, category, difficulty, seed, recordAttempt, sessionIdRef]
  );

  return {
    controlled,
    difficulty,
    setDifficulty,
    seed,
    problem,
    selectedIndex,
    result,
    regenerate,
    checkAnswer,
  };
}