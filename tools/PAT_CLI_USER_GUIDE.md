# PAT Question Generator CLI

A command-line tool for generating, validating, and exporting DAT PAT (Perceptual Ability Test) practice questions. Works entirely offline using deterministic algorithms — no database or network required.

## Requirements

- **Node.js 18+** (v20+ recommended)
- **tsx** (bundled with project — use `npx tsx`)

```bash
# Verify Node.js is installed
node --version  # v18+ required

# From project root
cd /path/to/predent
npm install
```

## Quick Start

```bash
# Generate 100 questions per category as HTML
npx tsx tools/pat-cli.ts generate -n 100

# Open in browser
open ./pat-output/index.html

# Generate JSON for programmatic use
npx tsx tools/pat-cli.ts generate -n 500 -f json -o questions.json

# Validate generated questions
npx tsx tools/pat-cli.ts validate -i questions.json
```

## Commands Overview

| Command | Description |
|---------|-------------|
| `generate` | Generate PAT questions (HTML/JSON) |
| `convert` | Convert JSON to interactive HTML |
| `validate` | Validate questions for correctness |
| `stats` | Show statistics about questions |
| `benchmark` | Test generator performance |

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
| `--difficulty` | `-d` | Difficulty distribution | `uniform` |
| `--format` | `-f` | Output format: `html`, `json`, `both` | `html` |
| `--output` | `-o` | Output directory path | `./pat-output/` |
| `--seed` | `-s` | Random seed for reproducibility | random |
| `--validate` | `-v` | Validate after generation | `false` |
| `--template` | `-t` | HTML template: `modern`, `classic`, `minimal` | `modern` |
| `--split` | | Split by category into separate files | `false` |
| `--per-file` | | Questions per file when splitting | `100` |
| `--no-explanations` | | Exclude explanations | include |
| `--explanation-depth` | | Depth: `brief`, `detailed`, `full` | `detailed` |
| `--print` | | Print-optimized output | `false` |
| `--page-size` | | Paper size: `a4`, `letter` | `a4` |
| `--page-numbers` | | Add page numbers | `false` |
| `--answer-key` | | Add answer key page | `false` |
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

**JSON only** — raw data for programmatic use:

```bash
npx tsx tools/pat-cli.ts generate -f json -o questions.json
```

**Both HTML and JSON**:

```bash
npx tsx tools/pat-cli.ts generate -f both -o ./output/
```

### Reproducible Generation

Use a seed to get identical questions every time:

```bash
# Same seed = same questions
npx tsx tools/pat-cli.ts generate -s 42 -n 100
npx tsx tools/pat-cli.ts generate -s 42 -n 100  # Identical output
```

### Split Output by Category

Generate separate HTML files per category:

```bash
npx tsx tools/pat-cli.ts generate --split --per-file 50
# Creates: keyholes.html, tfe.html, angle_ranking.html, etc.
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

Validate questions immediately after generation:

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
| `--output` | `-o` | Output path | `./pat-output/` |
| `--template` | `-t` | HTML template | `modern` |
| `--split` | | Split by category | `false` |
| `--per-file` | | Questions per file | `100` |
| `--filter-categories` | | Comma-separated category filter | all |
| `--filter-difficulty` | | Comma-separated difficulty filter | all |
| `--page-title` | | Custom page title | `PAT Question Bank` |
| `--no-explanations` | | Exclude explanations | include |
| `--show-answers` | | Pre-show correct answers | `false` |
| `--print` | | Print-optimized format | `false` |
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
  --answer-key
```

---

## `validate` — Validate Questions

Check questions for structural correctness and deterministic generation.

### Basic Usage

```bash
npx tsx tools/pat-cli.ts validate -i questions.json
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Input JSON file (required) | — |
| `--fix` | | Attempt to fix issues | `false` |
| `--report` | | Generate detailed report | `false` |
| `--quiet` | `-q` | Suppress output | `false` |

### What Gets Validated

| Check | Description |
|-------|-------------|
| Required fields | `id`, `category`, `difficulty`, `seed`, `correctIndex` present |
| Correct index | Value is between 0 and 3 |
| Options array | Exactly 4 options |
| Determinism | Same seed regenerates the same correct answer |
| No errors | Question generates without throwing |

### Examples

**Basic validation**:

```bash
npx tsx tools/pat-cli.ts validate -i questions.json
# Output: Validation PASSED / FAILED
```

**Detailed report**:

```bash
npx tsx tools/pat-cli.ts validate -i questions.json --report
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
# Shows: total questions, generation time, seed
```

**Full breakdown**:

```bash
npx tsx tools/pat-cli.ts stats -i questions.json --breakdown --distribution
# Shows: per-category counts, difficulty distribution, answer distribution
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

### Sample Output

```
PAT Generator Benchmark
────────────────────────────────────────
  Iterations: 1000
  Difficulty: medium
  Categories: keyholes, tfe, angle_ranking, hole_punching, cube_counting, pattern_folding

  keyholes                21603 ops/sec (0.05ms/op)
  tfe                     27995 ops/sec (0.04ms/op)
  angle_ranking          123401 ops/sec (0.01ms/op)
  hole_punching           53552 ops/sec (0.02ms/op)
  cube_counting           12228 ops/sec (0.08ms/op)

────────────────────────────────────────
  Total time: 115ms
  Avg ops/sec: 47755
```

---

## Output Formats

### HTML Output

Interactive web page with:

- Question cards with SVG placeholder diagrams
- Clickable answer options (A/B/C/D)
- Show/hide answer toggle per question
- Filter by category and difficulty
- "Show All Answers" button
- Responsive design (mobile-friendly)
- Dark mode support (modern template)
- Print-optimized CSS (`--print`)

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
      "seed": 42,
      "correctIndex": 2,
      "timeTarget": 45,
      "options": ["A", "B", "C", "D"],
      "metadata": { ... },
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

### Targeted Practice (Specific Categories)

```bash
# Focus on weak areas
npx tsx tools/pat-cli.ts generate \
  -c hole_punching,pattern_folding \
  -n 100 \
  -d "easy:20,medium:50,hard:30" \
  -o ./targeted/
```

### Database Import Pipeline

```bash
# 1. Generate JSON
npx tsx tools/pat-cli.ts generate -n 500 -f json -o questions.json

# 2. Validate
npx tsx tools/pat-cli.ts validate -i questions.json

# 3. Check stats
npx tsx tools/pat-cli.ts stats -i questions.json --breakdown

# 4. Import to database (custom script)
node import-to-db.js questions.json
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

### Deterministic Generation

All questions use a seeded PRNG (mulberry32):

- Same seed always produces the same question
- Reproducible across platforms (macOS, Linux, Windows)
- No randomness — purely deterministic given the seed
- Seed is embedded in each question for re-derivation

### Question ID Format

```
{category}-{6-digit index}
```

Example: `keyholes-000042`, `tfe-000003`, `hole_punching-000199`

### Performance

Typical speed (varies by hardware):

| Category | Speed | Notes |
|----------|-------|-------|
| `angle_ranking` | ~120K ops/sec | Fastest — simple angle math |
| `hole_punching` | ~50K ops/sec | Fast — grid operations |
| `tfe` | ~28K ops/sec | Moderate — 3-view generation |
| `keyholes` | ~22K ops/sec | Moderate — silhouette rendering |
| `cube_counting` | ~12K ops/sec | Slower — 3D cube enumeration |
| `pattern_folding` | ~10K ops/sec | Slowest — 2D net generation |

For 1000 questions per category, expect ~2-5 seconds total.

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

Get detailed report to identify issues:

```bash
npx tsx tools/pat-cli.ts validate -i questions.json --report
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
A: Each seed produces a unique question. Different seeds = different questions. Same seed = same question.

**Q: Can I customize question content?**
A: You can control category, difficulty, and count. The generation algorithms are fixed in `server/lib/pat-generation/`.

**Q: How do I add new categories?**
A: Create a new generator in `server/lib/pat-generation/`, add it to the index, and update the CLI types in `tools/pat-types.ts`.

**Q: Can I import questions to the web app?**
A: Yes. Export as JSON (`-f json`), then use the database import scripts or API.

**Q: What's the difference between `generate` and `convert`?**
A: `generate` creates new questions from seeds. `convert` takes existing JSON data and renders it as HTML (with filtering/customization).

**Q: Why use seeds instead of storing questions?**
A: Deterministic generation means unlimited questions with zero storage. The same seed regenerates the exact same question on any device.
