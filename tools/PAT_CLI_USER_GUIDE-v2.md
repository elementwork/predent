PAT Question Generator CLI - User Guide
Overview
The PAT Question Generator CLI is a tool for generating, validating, and exporting DAT PAT (Perceptual Ability Test) practice questions. It generates questions offline using deterministic algorithms, ensuring reproducibility and correctness.

Environment Setup
Option 1: Node.js (Required for CLI)
Install Node.js:

# macOS (using Homebrew)
brew install node

# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Windows (using Chocolatey)
choco install nodejs

# Or download from https://nodejs.org/
Verify installation:

node --version  # Should be v18+ (v20+ recommended)
npm --version
Install project dependencies:

cd /path/to/predent
npm install
Option 2: Standalone Web Version (No Node.js Required)
If you don't have Node.js installed, you can use the standalone web generator:

# Generate a single HTML file that works offline
npx tsx tools/pat-cli.ts standalone -o pat-generator.html
This creates a self-contained HTML file that:

Works in any modern browser (Chrome, Firefox, Safari, Edge)
Requires no installation or server
Can be opened by double-clicking the file
Includes all 6 PAT categories
Supports unlimited question generation
Usage:

Open pat-generator.html in your browser
Select categories and difficulty
Click "Generate" to create questions
Print or save as PDF for offline practice
Quick Start
# Generate 100 questions per category as HTML
npx tsx tools/pat-cli.ts generate -n 100

# Generate standalone HTML file (no Node.js needed)
npx tsx tools/pat-cli.ts standalone -o generator.html

# Generate with both HTML and JSON output
npx tsx tools/pat-cli.ts generate -n 200 --format both -o ./output/

# Convert existing JSON to HTML
npx tsx tools/pat-cli.ts convert -i questions.json -o review.html

# Validate questions
npx tsx tools/pat-cli.ts validate -i questions.json

# Show statistics
npx tsx tools/pat-cli.ts stats -i questions.json
# Generate 100 questions per category as HTML
npx tsx tools/pat-cli.ts generate -n 100

# Generate with both HTML and JSON output
npx tsx tools/pat-cli.ts generate -n 200 --format both -o ./output/

# Convert existing JSON to HTML
npx tsx tools/pat-cli.ts convert -i questions.json -o review.html

# Validate questions
npx tsx tools/pat-cli.ts validate -i questions.json

# Show statistics
npx tsx tools/pat-cli.ts stats -i questions.json
Commands
generate - Generate PAT Questions
The primary command for creating new PAT questions.

Basic Usage
npx tsx tools/pat-cli.ts generate -n 100
This generates 100 questions per category (600 total) as HTML files in ./pat-output/.

Options
Option	Short	Description	Default
--count	-n	Questions per category	10
--categories	-c	Comma-separated categories	all
--difficulty	-d	Difficulty distribution	uniform
--format	-f	Output format	html
--output	-o	Output path	./pat-output/
--seed	-s	Random seed	random
--validate	-v	Validate after generation	false
--template	-t	HTML template style	modern
--split		Split by category	false
--per-file		Questions per file	100
--explanations		Include explanations	true
--explanation-depth		Explanation detail level	detailed
--print		Print-optimized output	false
--page-size		Paper size (with --print)	a4
--page-numbers		Add page numbers	false
--answer-key		Add answer key page	false
--quiet	-q	Suppress output	false
Categories
Category	Description
keyholes	3D object rotation and silhouette matching
tfe	Top-Front-End view relationships
angle_ranking	Compare and rank angles
hole_punching	Paper folding and hole punching
cube_counting	Count exposed faces on cube stacks
pattern_folding	2D net to 3D cube folding
Use all to generate all categories, or specify specific ones:

npx tsx tools/pat-cli.ts generate -c keyholes,angle_ranking -n 200
Difficulty Distribution
Uniform (default): Equal distribution across easy/medium/hard

npx tsx tools/pat-cli.ts generate -d uniform
Weighted: 50% easy, 30% medium, 20% hard

npx tsx tools/pat-cli.ts generate -d weighted
Custom: Specify exact percentages

npx tsx tools/pat-cli.ts generate -d "easy:40,medium:40,hard:20"
Output Formats
HTML only (default):

npx tsx tools/pat-cli.ts generate -f html
JSON only (for programmatic use):

npx tsx tools/pat-cli.ts generate -f json -o questions.json
Both HTML and JSON:

npx tsx tools/pat-cli.ts generate -f both -o ./output/
Templates
Modern (default): Clean, interactive design with dark mode support

npx tsx tools/pat-cli.ts generate -t modern
Classic: Traditional exam format

npx tsx tools/pat-cli.ts generate -t classic
Minimal: Simple, no frills

npx tsx tools/pat-cli.ts generate -t minimal
Print: Optimized for paper (A4/Letter)

npx tsx tools/pat-cli.ts generate --print
Advanced Options
Reproducible generation (same seed = same questions):

npx tsx tools/pat-cli.ts generate -s 42
Split by category (separate HTML files per category):

npx tsx tools/pat-cli.ts generate --split --per-file 100
Print-optimized with answer key:

npx tsx tools/pat-cli.ts generate --print --answer-key --page-numbers
Generate and validate:

npx tsx tools/pat-cli.ts generate -n 500 --validate
convert - Convert JSON to HTML
Convert existing JSON question data to interactive HTML.

Basic Usage
npx tsx tools/pat-cli.ts convert -i questions.json -o review.html
Options
Option	Short	Description	Default
--input	-i	Input JSON file	required
--output	-o	Output path	./pat-output/
--template	-t	HTML template	modern
--split		Split by category	false
--per-file		Questions per file	100
--filter-categories		Filter categories	all
--filter-difficulty		Filter difficulties	all
--page-title		Custom page title	PAT Question Bank
--explanations		Include explanations	true
--show-answers		Pre-show answers	false
--print		Print format	false
Examples
Convert with filters:

npx tsx tools/pat-cli.ts convert \
  -i questions.json \
  --filter-categories keyholes \
  --filter-difficulty medium,hard
Convert with custom title:

npx tsx tools/pat-cli.ts convert \
  -i questions.json \
  -o review.html \
  --page-title "July 2026 PAT Practice"
Convert to print format with answer key:

npx tsx tools/pat-cli.ts convert \
  -i questions.json \
  --print \
  --answer-key
validate - Validate Questions
Check questions for correctness and consistency.

Basic Usage
npx tsx tools/pat-cli.ts validate -i questions.json
Options
Option	Short	Description	Default
--input	-i	Input JSON file	required
--fix		Attempt to fix issues	false
--report		Generate detailed report	false
What Gets Validated
✅ Required fields (id, category, difficulty, seed, correctIndex)
✅ Correct index range (0-3)
✅ Options array length (exactly 4)
✅ Deterministic output (same seed = same question)
✅ No generation errors
Examples
Basic validation:

npx tsx tools/pat-cli.ts validate -i questions.json
Detailed report:

npx tsx tools/pat-cli.ts validate -i questions.json --report
stats - Show Statistics
Display statistics about generated questions.

Basic Usage
npx tsx tools/pat-cli.ts stats -i questions.json
Options
Option	Short	Description	Default
--input	-i	Input JSON file	required
--breakdown	-b	Detailed breakdown	false
--distribution		Answer distribution	false
Examples
Basic stats:

npx tsx tools/pat-cli.ts stats -i questions.json
Full stats with breakdown:

npx tsx tools/pat-cli.ts stats -i questions.json --breakdown --distribution
benchmark - Performance Testing
Test generator performance.

Basic Usage
npx tsx tools/pat-cli.ts benchmark
Options
Option	Short	Description	Default
--iterations	-n	Iterations per category	1000
--categories	-c	Categories to test	all
--difficulty	-d	Difficulty to test	medium
Examples
Quick benchmark:

npx tsx tools/pat-cli.ts benchmark -n 100
Full benchmark:

npx tsx tools/pat-cli.ts benchmark -n 5000
Category-specific benchmark:

npx tsx tools/pat-cli.ts benchmark -c keyholes,angle_ranking -d hard
Output Formats
HTML Output
HTML files are interactive and include:

Question display with SVG placeholders
Clickable answer options
Filter controls (by category/difficulty)
Show all answers button
Export selected questions
Responsive design
Print-optimized CSS (with --print)
JSON Output
JSON files contain raw question data:

{
  "version": "1.0",
  "generatedAt": "2026-07-31T21:00:00Z",
  "generator": "pat-cli",
  "seed": 42,
  "stats": {
    "total": 600,
    "byCategory": { "keyholes": 100, ... },
    "byDifficulty": { "easy": 200, "medium": 200, "hard": 200 }
  },
  "questions": [
    {
      "id": "keyholes-000042",
      "category": "keyholes",
      "difficulty": "medium",
      "seed": 42,
      "correctIndex": 2,
      "timeTarget": 60,
      "options": [...],
      "metadata": {...},
      "explanation": {...}
    }
  ]
}
Explanations
Each question includes detailed explanations with:

Summary: Brief overview of the problem
Correct: Why the correct answer is right
Distractors: Why other options are wrong (with --explanation-depth full)
Concepts: Key PAT concepts involved
Tips: Strategies for solving similar problems
Explanation Depths
Depth	Content
brief	Summary only
detailed	Summary + correct answer
full	All including distractors, concepts, tips
Use Cases
For Practice
# Generate 200 questions per category for daily practice
npx tsx tools/pat-cli.ts generate -n 200 -o ./practice/

# Open in browser
open ./practice/index.html
For Printing
# Generate print-optimized questions with answer key
npx tsx tools/pat-cli.ts generate \
  -n 50 \
  --print \
  --answer-key \
  --page-numbers \
  -o ./print/

# Print the generated HTML
open ./print/index.html
For Review
# Generate questions and review in browser
npx tsx tools/pat-cli.ts generate -n 100 -o ./review/
open ./review/index.html
For Database Import
# Generate JSON for database import
npx tsx tools/pat-cli.ts generate -n 500 -f json -o questions.json

# Validate before import
npx tsx tools/pat-cli.ts validate -i questions.json

# Import to database (custom script)
node import-to-db.js questions.json
For Batch Processing
# Generate, validate, and get stats
npx tsx tools/pat-cli.ts generate -n 1000 -f both -o ./batch/ --validate
npx tsx tools/pat-cli.ts stats -i ./batch/questions.json --breakdown
Troubleshooting
"Cannot find module" Error
Ensure you're running from the project root:

cd /path/to/predent
npx tsx tools/pat-cli.ts generate -n 10
Slow Generation
For large batches (1000+), use --quiet to suppress progress output:

npx tsx tools/pat-cli.ts generate -n 5000 --quiet
Invalid Questions
If validation fails, check the JSON file for missing fields:

npx tsx tools/pat-cli.ts validate -i questions.json --report
Memory Issues
For very large generations, split into multiple runs:

npx tsx tools/pat-cli.ts generate -n 500 -c keyholes -o ./batch1/
npx tsx tools/pat-cli.ts generate -n 500 -c tfe -o ./batch2/
Technical Details
Deterministic Generation
All questions are generated using a seeded PRNG (mulberry32), ensuring:

Same seed always produces the same question
Questions are reproducible across platforms
No randomness in output given the same seed
Question Validation
The validation process:

Checks all required fields exist
Validates field types and ranges
Regenerates questions from seed to verify determinism
Reports any inconsistencies
Performance
Typical performance (M1 MacBook):

Category	Time/Question	Questions/Second
Keyholes	0.4ms	2,500
TFE	0.4ms	2,500
Angle Ranking	0.15ms	6,667
Hole Punching	0.3ms	3,333
Cube Counting	0.3ms	3,333
Pattern Folding	0.25ms	4,000
FAQ
Q: Can I use this offline? A: Yes! The CLI works entirely offline with no database required.

Q: Are the questions unique? A: Yes, each question is generated from a unique seed. Same seed = same question.

Q: Can I customize the questions? A: You can control category, difficulty, and count. The generation logic is fixed.

Q: How do I add new categories? A: Extend the generators in server/lib/pat-generation/ and update the CLI.

Q: Can I import questions to the web app? A: Yes, export as JSON and use the database import scripts.

Support
For issues or feature requests, please refer to the project documentation or create an issue in the repository.