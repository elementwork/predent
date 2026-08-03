import { parseArgs } from "node:util";
import { readFile } from "node:fs/promises";
import { getCorrectAnswer } from "../../server/lib/pat-generation/index.js";
import type { GenerationResult, GeneratedQuestion, QuestionCategory } from "../pat-types.js";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  checked: number;
}

function printHelp() {
  console.log(`
Validate PAT Questions

Usage:
  npx tsx tools/pat-cli.ts validate -i <input> [options]

Options:
  -i, --input <file>    Input JSON file (required)
  --fix                 Attempt to fix issues
  --report              Generate detailed report
  -q, --quiet           Suppress output

Examples:
  npx tsx tools/pat-cli.ts validate -i questions.json
  npx tsx tools/pat-cli.ts validate -i questions.json --report
`);
}

function validateQuestion(question: GeneratedQuestion): string[] {
  const errors: string[] = [];

  if (!question.id) errors.push("Missing id");
  if (!question.category) errors.push("Missing category");
  if (!question.difficulty) errors.push("Missing difficulty");
  if (typeof question.seed !== "number") errors.push("Missing or invalid seed");
  if (typeof question.correctIndex !== "number") errors.push("Missing or invalid correctIndex");
  if (question.correctIndex < 0 || question.correctIndex > 3) {
    errors.push(`Invalid correctIndex: ${question.correctIndex} (must be 0-3)`);
  }
  if (!Array.isArray(question.options) || question.options.length !== 4) {
    errors.push(`Invalid options array: expected 4 items, got ${question.options?.length ?? 0}`);
  }

  // Verify determinism
  if (question.seed && question.category) {
    try {
      const correctAnswer = getCorrectAnswer(question.category as QuestionCategory, {
        seed: question.seed,
        difficulty: question.difficulty as "easy" | "medium" | "hard",
      });

      if (correctAnswer !== question.correctIndex) {
        errors.push(
          `Correct index mismatch: stored ${question.correctIndex}, derived ${correctAnswer}`
        );
      }
    } catch (e) {
      errors.push(`Generation error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return errors;
}

async function validateFile(inputPath: string): Promise<ValidationResult> {
  const jsonContent = await readFile(inputPath, "utf-8");
  const data: GenerationResult = JSON.parse(jsonContent);

  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    checked: 0,
  };

  if (!data.questions || !Array.isArray(data.questions)) {
    result.valid = false;
    result.errors.push("Invalid JSON: missing questions array");
    return result;
  }

  for (const question of data.questions) {
    const errors = validateQuestion(question);
    if (errors.length > 0) {
      result.valid = false;
      for (const error of errors) {
        result.errors.push(`[${question.id || "unknown"}] ${error}`);
      }
    }
    result.checked++;
  }

  return result;
}

export async function runValidate(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      input: { type: "string", short: "i" },
      fix: { type: "boolean", default: false },
      report: { type: "boolean", default: false },
      quiet: { type: "boolean", short: "q", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: false,
  });

  if (values.help || !values.input) {
    printHelp();
    return;
  }

  if (!values.quiet) {
    console.log(`Validating: ${values.input}`);
  }

  const result = await validateFile(values.input);

  if (!values.quiet) {
    console.log(`\nValidation ${result.valid ? "PASSED" : "FAILED"}`);
    console.log(`  Questions checked: ${result.checked}`);

    if (result.errors.length > 0) {
      console.log(`\nErrors (${result.errors.length}):`);
      for (const error of result.errors) {
        console.log(`  ❌ ${error}`);
      }
    }

    if (result.warnings.length > 0) {
      console.log(`\nWarnings (${result.warnings.length}):`);
      for (const warning of result.warnings) {
        console.log(`  ⚠️  ${warning}`);
      }
    }
  }

  process.exit(result.valid ? 0 : 1);
}
