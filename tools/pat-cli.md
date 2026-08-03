# PAT Question Generator CLI

A command-line tool for generating, validating, and exporting DAT PAT (Perceptual Ability Test) practice questions. Works entirely offline using deterministic algorithms — no database or network required.

## Requirements

- **Node.js 24+** (project engine requirement)
- **tsx** (project dev dependency — use `npx tsx`)

```bash
# Verify Node.js is installed
node --version  # v24+ required

# From project root
cd /path/to/predent
npm install
```

## Quick Start

```bash
# Generate 10 questions per category as interactive HTML
npx tsx tools/pat-cli.ts generate -n 10

# Open in browser
open ./pat-output/index.html

# Generate JSON for programmatic use
npx tsx tools/pat-cli.ts generate -n 50 -f json -o ./output/

# Build a single-file offline practice page (no dev tools needed)
npx tsx tools/pat-cli.ts standalone -n 60 -o pat-practice.html
```

## Commands Overview

| Command | Description |
|---------|-------------|
| `generate` | Generate PAT questions (HTML/JSON) |
| `convert` | Convert JSON to interactive HTML |
| `validate` | Validate questions for correctness |
| `stats` | Show statistics about questions |
| `benchmark` | Test generator performance |
| `standalone` | Build a self-contained offline practice HTML file |

```bash
npx tsx tools/pat-cli.ts <command> [options]
npx tsx tools/pat-cli.ts <command> --help  # Command-specific help
```

---

## `generate` — Generate PAT Questions

The primary command for creating new PAT practice questions.

### Basic Usage

```bash
npx tsx tools/pat-cli.ts generate -n 100
```

Generates 100 questions per category (600 total) as interactive HTML in `./pat-output/`.

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--count` | `-n` | Questions per category | `10` |
| `--categories` | `-c` | Comma-separated categories or `"all"` | `all` |
| `--difficulty` | `-d` | Difficulty distribution: `uniform`, `weighted`, or custom | `uniform` |
| `--format` | `-f` | Output format: `html`, `json`, `both` | `html` |
| `--output` | `-o` | Output directory path | `./pat-output/` |
| `--seed` | `-s` | Base seed for reproducibility | random |
| `--validate` | `-v` | Validate after generation (exit 1 on failure) | `false` |
| `--template` | `-t` | HTML template: `modern`, `classic`, `minimal`, `print` | `modern` |
| `--split` | | Split by category into separate files | `false` |
| `--per-file` | | Questions per file when splitting | `100` |
| `--no-explanations` | | Exclude explanations | include |
| `--explanation-depth` | | Depth: `brief`, `detailed`, `full` | `detailed` |
| `--print` | | Print-optimized output (single column, print CSS) | `false` |
| `--page-size` | | Paper size: `a4`, `letter` | `a4` |
| `--page-numbers` | | Add page rules with page numbers | `false` |
| `--answer-key` | | Append a printable answer key | `false` |
| `--show-answers` | | Pre-show correct answers and explanations | `false` |
| `--quiet` | `-q` | Suppress output | `false` |

### Categories

| Category | Description |
|----------|-------------|
| `keyholes` | 3D object rotation and silhouette matching |
| `tfe` | Top-Front-End view relationships |
| `angle_ranking` | Compare and rank angles |
| `hole_punching` | Paper folding and hole punching |
| `cube_counting` | Count exposed faces on cube stacks |
| `pattern_folding` | 2D net to 3D cube folding |

```bash
# Generate all categories (default)
npx tsx tools/pat-cli.ts generate -n 100

# Generate specific categories
npx tsx tools/pat-cli.ts generate -c keyholes,angle_ranking -n 200

# Generate only hole punching
npx tsx tools/pat-cli.ts generate -c hole_punching -n 50
```

### Difficulty Distribution

**Uniform** (default): Equal distribution — 33% easy, 34% medium, 33% hard

```bash
npx tsx tools/pat-cli.ts generate -d uniform
```

**Weighted**: Easier skew — 50% easy, 30% medium, 20% hard

```bash
npx tsx tools/pat-cli.ts generate -d weighted
```

**Custom**: Specify exact percentages

```bash
npx tsx tools/pat-cli.ts generate -d "easy:40,medium:40,hard:20"
npx tsx tools/pat-cli.ts generate -d "easy:10,medium:20,hard:70"
```

### Output Formats

**HTML only** (default) — interactive web page:

```bash
npx tsx tools/pat-cli.ts generate -f html
```

**JSON only** — raw data for programmatic use (written to `<output>/questions.json`):

```bash
npx tsx tools/pat-cli.ts generate -f json -o ./output/
```

**Both HTML and JSON**:

```bash
npx tsx tools/pat-cli.ts generate -f both -o ./output/
```

### Reproducible Generation

Use a seed to get identical questions every time:

```bash
# Same base seed = same questions
npx tsx tools/pat-cli.ts generate -s 42 -n 100
npx tsx tools/pat-cli.ts generate -s 42 -n 100  # Identical output
```

Each question's seed is derived from the base seed as
`seed = baseSeed + i * 1000 + categoryIndex * 100000`, where `i` is the per-category
question index and `categoryIndex` is the category position in
`keyholes, tfe, angle_ranking, hole_punching, cube_counting, pattern_folding`.

### Split Output by Category

Generate separate HTML files per category:

```bash
npx tsx tools/pat-cli.ts generate --split --per-file 50
# Creates: index.html (overview), keyholes.html, tfe.html, angle_ranking.html, etc.
# When a category has more than per-file questions: keyholes-1.html, keyholes-2.html, ...
```

### Print-Optimized Output

Generate paper-friendly output with answer key:

```bash
npx tsx tools/pat-cli.ts generate \
  -n 50 \
  --print \
  --answer-key \
  --page-numbers \
  --page-size a4 \
  -o ./print/
```

### Generate and Validate

Validate questions immediately after generation (exits non-zero on failure — safe for CI):

```bash
npx tsx tools/pat-cli.ts generate -n 500 --validate
```

---

## `convert` — Convert JSON to HTML

Convert existing JSON question data to interactive HTML with filtering and customization.

### Basic Usage

```bash
npx tsx tools/pat-cli.ts convert -i questions.json
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Input JSON file (required) | — |
| `--output` | `-o` | Output directory path | `./pat-output/` |
| `--template` | `-t` | HTML template: `modern`, `classic`, `minimal`, `print` | `modern` |
| `--split` | | Split by category | `false` |
| `--per-file` | | Questions per file when splitting | `100` |
| `--filter-categories` | | Comma-separated category filter | all |
| `--filter-difficulty` | | Comma-separated difficulty filter | all |
| `--page-title` | | Custom page title | `PAT Question Bank` |
| `--no-explanations` | | Exclude explanations | include |
| `--show-answers` | | Pre-show correct answers and explanations | `false` |
| `--print` | | Print-optimized format | `false` |
| `--page-size` | | Paper size: `a4`, `letter` | `a4` |
| `--page-numbers` | | Add page numbers | `false` |
| `--answer-key` | | Add answer key page | `false` |
| `--quiet` | `-q` | Suppress output | `false` |

### Examples

**Filter by category and difficulty**:

```bash
npx tsx tools/pat-cli.ts convert \
  -i questions.json \
  --filter-categories keyholes,tfe \
  --filter-difficulty medium,hard
```

**Custom title for review session**:

```bash
npx tsx tools/pat-cli.ts convert \
  -i questions.json \
  --page-title "July 2026 PAT Practice"
```

**Print format with answer key**:

```bash
npx tsx tools/pat-cli.ts convert \
  -i questions.json \
  --print \
  --answer-key \
  --page-numbers
```

---

## `validate` — Validate Questions

Check questions for structural correctness and deterministic regeneration.

### Basic Usage

```bash
npx tsx tools/pat-cli.ts validate -i questions.json
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Input JSON file (required) | — |
| `--fix` | | Accepted (reserved) — currently no-op | `false` |
| `--report` | | Accepted (reserved) — errors are always printed in detail | `false` |
| `--quiet` | `-q` | Suppress output (only exit code) | `false` |

### What Gets Validated

| Check | Description |
|-------|-------------|
| Required fields | `id`, `category`, `difficulty`, `seed`, `correctIndex` present |
| Correct index | Value is between 0 and 3 |
| Options array | Exactly 4 options |
| Determinism | Re-deriving the answer from the seed matches `correctIndex` |
| No errors | Question regenerates without throwing |

### Examples

**Basic validation**:

```bash
npx tsx tools/pat-cli.ts validate -i questions.json
# Output: Validation PASSED / FAILED (with per-question error list)
```

**Exit code**: Returns `0` if valid, `1` if any errors found. Use in scripts:

```bash
npx tsx tools/pat-cli.ts validate -i questions.json && echo "OK" || echo "FAILED"
```

---

## `stats` — Show Statistics

Display statistics about generated questions.

### Basic Usage

```bash
npx tsx tools/pat-cli.ts stats -i questions.json
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Input JSON file (required) | — |
| `--breakdown` | `-b` | Detailed breakdown by category/difficulty | `false` |
| `--distribution` | | Answer index distribution | `false` |
| `--quiet` | `-q` | Suppress output | `false` |

### Examples

**Basic stats**:

```bash
npx tsx tools/pat-cli.ts stats -i questions.json
# Shows: file, generatedAt, base seed, total questions
```

**Full breakdown**:

```bash
npx tsx tools/pat-cli.ts stats -i questions.json --breakdown --distribution
# Shows: per-category counts with avg time target, difficulty distribution, answer distribution
```

---

## `benchmark` — Performance Testing

Measure generator speed for each category.

### Basic Usage

```bash
npx tsx tools/pat-cli.ts benchmark
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--iterations` | `-n` | Iterations per category | `1000` |
| `--categories` | `-c` | Comma-separated categories or `"all"` | `all` |
| `--difficulty` | `-d` | Difficulty level: `easy`, `medium`, `hard` | `medium` |
| `--quiet` | `-q` | Suppress output | `false` |

### Examples

**Quick benchmark**:

```bash
npx tsx tools/pat-cli.ts benchmark -n 100
```

**Full benchmark**:

```bash
npx tsx tools/pat-cli.ts benchmark -n 5000
```

**Category-specific**:

```bash
npx tsx tools/pat-cli.ts benchmark -c keyholes,angle_ranking -d hard
```

### Sample Output (varies by hardware)

```
PAT Generator Benchmark
────────────────────────────────────────
  Iterations: 1000
  Difficulty: medium
  Categories: keyholes, tfe, angle_ranking, hole_punching, cube_counting, pattern_folding

  keyholes                66592 ops/sec (0.02ms/op)
  tfe                     48273 ops/sec (0.02ms/op)
  angle_ranking           62054 ops/sec (0.02ms/op)
  hole_punching          152329 ops/sec (0.01ms/op)
  cube_counting           27395 ops/sec (0.04ms/op)
  pattern_folding        228346 ops/sec (0.00ms/op)

────────────────────────────────────────
  Total time: 99ms
```

---

## `standalone` — Build a Self-Contained Offline Practice Page

Builds a **single HTML file** with the full PAT engine embedded (bundled with esbuild as an
IIFE exposing `window.PAT_ENGINE`), pre-generated questions, and an inline "Regenerate"
button. No server, internet, or dev tools required — open it in any browser.

### Basic Usage

```bash
npx tsx tools/pat-cli.ts standalone -n 60 -o pat-practice.html
open pat-practice.html
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--output` | `-o` | Output HTML file path | `./pat-standalone.html` |
| `--count` | `-n` | Questions per category | `10` |
| `--categories` | `-c` | Comma-separated categories or `"all"` | `all` |
| `--difficulty` | `-d` | Difficulty distribution | `uniform` |
| `--seed` | `-s` | Base seed for reproducibility | random |
| `--template` | `-t` | HTML template: `modern`, `classic`, `minimal`, `print` | `modern` |
| `--page-title` | | Custom page title | `PAT Practice — Standalone` |
| `--show-answers` | | Pre-show correct answers and explanations | `false` |
| `--no-explanations` | | Exclude explanations | include |
| `--answer-key` | | Add answer key page | `false` |
| `--page-numbers` | | Add page numbers | `false` |
| `--page-size` | | Paper size: `a4`, `letter` | `a4` |
| `--quiet` | `-q` | Suppress output | `false` |

### How It Works

- The PAT engine (`tools/pat-standalone/entry.ts`) is bundled into the page as
  `window.PAT_ENGINE` with `generateProblem`, `getCorrectAnswer`,
  `generateExplanation`, and `renderQuestionCard`.
- Questions are generated at build time from seeds and rendered as interactive cards.
- The "Regenerate Questions" button re-derives every card in the browser
  (`seed + 7919 * n` per card) and rebuilds the answer key — fully deterministic
  and offline.

### Examples

```bash
# Practice page for two categories, reproducible
npx tsx tools/pat-cli.ts standalone -c cube_counting,angle_ranking -n 20 -s 42

# Print-ready worksheet with answer key
npx tsx tools/pat-cli.ts standalone -n 50 --print --answer-key --page-numbers -o worksheet.html
```

---

## Output Formats

### HTML Output

Interactive web page with:

- Question cards with inline SVG diagrams (real rendered diagrams per category)
- Clickable answer options (A/B/C/D) with correct/incorrect feedback
- Show/hide answer toggle per question
- Filter by category and difficulty
- "Show All Answers" button
- Optional answer key page (`--answer-key`)
- Optional page rules with page numbers (`--page-numbers`)
- Responsive design (mobile-friendly)
- Dark mode support (modern template)
- Print-optimized layout (`--print` / `print` template)
- Every card carries `data-seed`, `data-category`, `data-difficulty` attributes

### JSON Output

Machine-readable data format:

```json
{
  "version": "1.0",
  "generatedAt": "2026-08-01T12:00:00Z",
  "generator": "pat-cli",
  "seed": 42,
  "stats": {
    "total": 600,
    "byCategory": {
      "keyholes": 100,
      "tfe": 100,
      "angle_ranking": 100,
      "hole_punching": 100,
      "cube_counting": 100,
      "pattern_folding": 100
    },
    "byDifficulty": {
      "easy": 200,
      "medium": 200,
      "hard": 200
    }
  },
  "questions": [
    {
      "id": "keyholes-000042",
      "category": "keyholes",
      "difficulty": "medium",
      "seed": 4242000,
      "correctIndex": 2,
      "timeTarget": 45,
      "options": ["A", "B", "C", "D"],
      "metadata": { "...problem shape...": "..." },
      "explanation": {
        "summary": "Identify which keyhole silhouette matches...",
        "correct": "Option C correctly shows...",
        "concepts": ["3D visualization", "Mental rotation"],
        "tips": ["Mentally rotate the object...", "Focus on silhouette shape"]
      }
    }
  ]
}
```

Notes:

- `id` format: `{category}-{6-digit per-category index}` (e.g. `keyholes-000042`).
- `timeTarget`: `30` easy, `45` medium, `60` hard seconds.
- `options` is always `["A", "B", "C", "D"]`; the actual option content lives in `metadata`
  (problem shapes differ per category — `choices`, `options`, `angles`, `foldProblem`, etc.).
- `explanation` is present unless `--no-explanations` was passed.

---

## Explanations

Each question can include detailed explanations with three depth levels:

| Depth | Content |
|-------|---------|
| `brief` | Summary only |
| `detailed` | Summary + correct answer explanation |
| `full` | All including distractors, concepts, tips |

```bash
# Brief explanations
npx tsx tools/pat-cli.ts generate -n 100 --explanation-depth brief

# Full explanations with all details
npx tsx tools/pat-cli.ts generate -n 100 --explanation-depth full

# No explanations
npx tsx tools/pat-cli.ts generate -n 100 --no-explanations
```

### Explanation Structure

- **Summary**: Brief overview of the problem type
- **Correct**: Why the correct answer is right
- **Distractors**: Why other options are wrong (full depth only)
- **Concepts**: Key PAT concepts involved (e.g., "3D visualization", "Mental rotation")
- **Tips**: Strategies for solving similar problems

---

## Use Cases

### Daily Practice

```bash
# Generate 200 questions per category
npx tsx tools/pat-cli.ts generate -n 200 -o ./practice/
open ./practice/index.html
```

### Print Worksheets

```bash
# Generate print-optimized with answer key
npx tsx tools/pat-cli.ts generate \
  -n 50 \
  --print \
  --answer-key \
  --page-numbers \
  -o ./print/
open ./print/index.html  # Then print from browser
```

### Offline Practice File (Shareable)

```bash
# Single self-contained file — email it, put it on a USB stick, open on any machine
npx tsx tools/pat-cli.ts standalone -n 60 -o pat-practice.html
```

### Targeted Practice (Specific Categories)

```bash
# Focus on weak areas
npx tsx tools/pat-cli.ts generate \
  -c hole_punching,pattern_folding \
  -n 100 \
  -d "easy:20,medium:50,hard:30" \
  -o ./targeted/
```

### Automated Quality Gate (CI)

```bash
# 1. Generate JSON
npx tsx tools/pat-cli.ts generate -n 500 -f json -o ./output/

# 2. Validate — fails the build on any issue
npx tsx tools/pat-cli.ts validate -i ./output/questions.json

# 3. Check stats
npx tsx tools/pat-cli.ts stats -i ./output/questions.json --breakdown
```

### Review Session with Filters

```bash
# Generate full set, then convert filtered subset
npx tsx tools/pat-cli.ts generate -n 200 -f both -o ./full/
npx tsx tools/pat-cli.ts convert \
  -i ./full/questions.json \
  --filter-categories keyholes,tfe \
  --filter-difficulty medium,hard \
  --page-title "Keyholes & TFE Review" \
  -o ./review/
```

### Reproducible Question Sets

```bash
# Same seed = same questions (useful for sharing/reviewing)
npx tsx tools/pat-cli.ts generate -s 42 -n 100 -f both -o ./set-a/
npx tsx tools/pat-cli.ts generate -s 42 -n 100 -f both -o ./set-b/
# set-a/ and set-b/ contain identical questions
```

---

## Technical Details

### Shared Generation Engine

The CLI uses the **same generator code as the production web app**:

- Source of truth: `server/lib/pat-generation/` (mulberry32 PRNG + 6 category generators).
- The web app's browser generators (`src/components/pat-generators/logic/`) mirror the
  server logic so answers can be re-derived on either side.
- `tools/pat-types.ts` holds the CLI's shared types (categories, difficulties, options).

### Deterministic Generation

All questions use a seeded PRNG (mulberry32):

- Same seed always produces the same question
- Reproducible across platforms (macOS, Linux, Windows)
- No randomness — purely deterministic given the seed
- Seed is embedded in each question for re-derivation

### Question ID Format

```
{category}-{6-digit per-category index}
```

Example: `keyholes-000042`, `tfe-000003`, `hole_punching-000199`

### Performance

Measured on a modern MacBook (Apple Silicon), 1000 iterations per category, `medium`
difficulty — all six categories generate in well under 1 ms per question:

| Category | Speed (approx.) |
|----------|-----------------|
| `pattern_folding` | ~200K+ ops/sec |
| `hole_punching` | ~150K ops/sec |
| `keyholes` | ~60K ops/sec |
| `angle_ranking` | ~60K ops/sec |
| `tfe` | ~50K ops/sec |
| `cube_counting` | ~25K ops/sec |

For 1000 questions per category, expect ~1-3 seconds total including HTML rendering.

---

## Troubleshooting

### "Cannot find module" Error

Run from project root:

```bash
cd /path/to/predent
npx tsx tools/pat-cli.ts generate -n 10
```

### Slow Generation

Use `--quiet` for large batches to suppress progress output:

```bash
npx tsx tools/pat-cli.ts generate -n 5000 --quiet
```

### Validation Errors

Validation errors are always printed in detail with the failing question id:

```bash
npx tsx tools/pat-cli.ts validate -i questions.json
```

### Memory Issues (Very Large Batches)

Split into multiple runs by category:

```bash
npx tsx tools/pat-cli.ts generate -n 500 -c keyholes -o ./batch1/
npx tsx tools/pat-cli.ts generate -n 500 -c tfe -o ./batch2/
npx tsx tools/pat-cli.ts generate -n 500 -c angle_ranking -o ./batch3/
```

### "tsx: command not found"

Install tsx globally or use npx:

```bash
npm install -g tsx
# or use npx (no install needed)
npx tsx tools/pat-cli.ts generate -n 10
```

---

## FAQ

**Q: Does this require internet?**
A: No. The CLI works entirely offline. All questions are generated mathematically.

**Q: Are questions unique?**
A: Each (seed, category, difficulty) triple produces one question. Different seeds = different questions. Same seed = same question.

**Q: Can I customize question content?**
A: You can control category, difficulty, distribution, and count. The generation algorithms are fixed in `server/lib/pat-generation/`.

**Q: How do I add new categories?**
A: Create a generator in `server/lib/pat-generation/`, mirror it in `src/components/pat-generators/logic/`, and update the CLI types in `tools/pat-types.ts`. Both server and client sides must stay in sync.

**Q: Can I import CLI questions into the web app?**
A: No import is needed — the web app generates questions from the same seeds on the fly. There is no PAT question bank in the database. The CLI shares the server's generation engine, so a question generated with `-s 42` is identical to what the app derives from seed 42.

**Q: What's the difference between `generate` and `convert`?**
A: `generate` creates new questions from seeds. `convert` takes existing JSON data and renders it as HTML (with filtering/customization).

**Q: Why use seeds instead of storing questions?**
A: Deterministic generation means unlimited questions with zero storage. The same seed regenerates the exact same question on any device — the app, the CLI, and the standalone page all agree.
