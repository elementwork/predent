# PAT Generator — Usage Guide

> Last updated: 2026-07-31T17:30:00-04:00

## Overview

`PAT_Generator.py` is a standalone Python script that generates DAT-style Perceptual Ability Test (PAT) questions with SVG diagrams. It produces HTML files containing interactive question banks for all 6 PAT categories.

**This is a development/prototyping tool**, not part of the main application. The production app uses TypeScript generators in `server/lib/pat-generation/` and `src/components/pat-generators/logic/`.

## Categories

| Code | Category | Default Count | Description |
|------|----------|---------------|-------------|
| PF | Pattern Folding | 4,000 | Fold 2D nets into 3D cubes with irregular patterns |
| KH | Keyholes | 1,500 | Identify which aperture allows a 3D object to pass through |
| TFE | Top-Front-End | 1,500 | Interpret hidden lines in orthographic projections |
| AR | Angle Ranking | 1,000 | Rank angles from smallest to largest |
| HP | Hole Punching | 1,000 | Predict unfolded hole patterns after folding |
| CC | Cube Counting | 1,000 | Count cubes in irregular 3D stacks |

**Total:** 10,000 questions across all categories.

## Requirements

- Python 3.8+
- No external dependencies (uses only `random`, `math`, `json` from stdlib)

## Usage

### Generate All Categories

```bash
cd tools/
python PAT_Generator.py
```

This generates 6 HTML files in the current directory:
- `pf.html` — Pattern Folding questions
- `kh.html` — Keyholes questions
- `tfe.html` — Top-Front-End questions
- `ar.html` — Angle Ranking questions
- `hp.html` — Hole Punching questions
- `cc.html` — Cube Counting questions

### Generate a Single Category

Edit the `if __name__ == '__main__':` block at the bottom of the file to comment out unwanted categories, or import individual generator functions:

```python
from PAT_Generator import gen_pf_question, gen_kh_question

# Generate 10 Pattern Folding questions
for i in range(10):
    q = gen_pf_question(i + 1)
    print(q['id'], q['question'])
```

### Custom Question Counts

Modify the `TARGET_TOTALS` dictionary at the top of the file:

```python
TARGET_TOTALS = {
    'PF': 100,   # Reduce to 100 for testing
    'KH': 100,
    'TFE': 100,
    'AR': 100,
    'HP': 100,
    'CC': 100,
}
```

## Output Format

Each HTML file contains a self-contained question bank with:

- **SVG diagrams** — inline SVG with isometric 3D views, patterns, and shading
- **4 multiple-choice options** (A-D) per question
- **Answer reveal** — click "Show Answer" to see the correct answer and explanation
- **Responsive layout** — works on desktop and mobile

### Question Data Structure

Each question is a dictionary with:

```python
{
    'id': 'PF-0001',           # Category code + sequential number
    'svg': '<svg>...</svg>',   # Inline SVG diagram
    'question': 'Which cube...', # Question text
    'options': ['A', 'B', 'C', 'D'],  # Answer options
    'answer': 'A',             # Correct answer letter
    'explanation': '...'       # Explanation of correct answer
}
```

## SVG Patterns

The generator defines 14 shading patterns used across categories:

| Pattern | Description |
|---------|-------------|
| `stripe` | Vertical black stripes |
| `dots` | Black dot grid |
| `cross` | X-shaped crosses |
| `wave` | Red wavy lines |
| `plus` | Green plus signs |
| `diag` | Blue diagonal lines |
| `grid` | Black grid lines |
| `hatch` | Diagonal hatching |
| `circle_tl` | Black circle (top-left) |
| `diag_split` | Diagonal split |
| `quarter_circle` | Quarter circle |
| `striped_angle` | Striped angle pattern |
| `dots_halved` | Halved dot pattern |
| `cross_halved` | Halved cross pattern |

## Relationship to Production Code

| Aspect | PAT_Generator.py | Production (TypeScript) |
|--------|------------------|------------------------|
| Language | Python | TypeScript |
| Execution | Standalone script | Runs in browser/server |
| SVG generation | String concatenation | React components |
| Question storage | HTML files (client-side) | Seeded PRNG (on-the-fly) |
| Persistence | Static HTML | No persistence (regenerated) |
| Answer security | Visible in HTML | Server-side re-derivation |

The production app uses a seeded PRNG (`mulberry32`) to generate questions deterministically from a seed value, avoiding the need to store questions in the database. This Python script was the original prototype that informed the TypeScript implementation.

## Troubleshooting

### "No module named..." errors
This script uses only Python stdlib. No `pip install` needed.

### HTML files not opening
Open the generated `.html` files in any modern browser. They are self-contained with inline SVG and CSS.

### Slow generation
Generating 10,000 questions takes ~30-60 seconds depending on your machine. Reduce `TARGET_TOTALS` for faster iteration.

---

*For the production TypeScript generators, see `server/lib/pat-generation/` and `src/components/pat-generators/logic/`.*
