# PAT Authentic Format Research

Research notes for the PAT generator redesign (all 6 categories, app + CLI).
Goal: questions that match the structure, layout, and visual style of the real
Canadian/American DAT PAT section.

> Last updated: 2026-08-03T22:40:00-04:00

## Sources

| Source | URL | Covered |
| --- | --- | --- |
| Erudition Prep PAT guide (root) | https://eruditionprep.com/dat/pat/ | Section overview, scoring |
| Erudition — test structure | https://eruditionprep.com/dat/pat/test-structure/ | Order, counts, timing, scale |
| Erudition — Keyholes | https://eruditionprep.com/dat/pat/resources/keyhole-problems/ | KH rules, views, strategies |
| Erudition — Top Front End | https://eruditionprep.com/dat/pat/resources/top-front-end-problems/ | TFE rules, projections, conventions |
| Erudition — Angle Ranking | https://eruditionprep.com/dat/pat/resources/angle-ranking-problems/ | AR rules, answer format, strategy |
| Erudition — Hole Punching | https://eruditionprep.com/dat/pat/resources/hole-punching-problems/ | HP rules, grid, folds, answers |
| Erudition — Cube Counting | https://eruditionprep.com/dat/pat/resources/cube-counting-problems/ | CC rules, scoring, strategy |
| Erudition — Pattern Folding | https://eruditionprep.com/dat/pat/resources/pattern-folding-problems/ | PF rules, nets, 3D figures |
| ADA 2026 DAT Candidate Guide (PDF) | https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/education/dat/dat_candidate_guide.pdf | Official names, scale, timing |
| Kaplan — Angle Ranking strategy | https://www.kaptest.com/study/dat/dat-perceptual-ability-angle-ranking-strategy/ | AR answer format, elimination |
| DAT Bootcamp — PAT guide | https://datbootcamp.com/blog/dat-pat-guide/ | Subsection order, counts |
| Varsity Tutors — Pattern Folding sample | https://www.varsitytutors.com/dat-perceptual-ability-help/pattern-folding | PF stem format, choices |
| OpenExamPrep — free PAT quiz | https://openexamprep.com/free-dat-practice-tests/pat/ | Scoring scale, averages |

## Global structure

- 90 items, 60 minutes (30 seconds per question average).
- Six subtests of **15 items each**, in **fixed order**:
  1. Keyholes (items 1–15)
  2. Top Front End (items 16–30)
  3. Angle Ranking (items 31–45)
  4. Hole Punching (items 46–60)
  5. Cube Counting (items 61–75)
  6. Pattern Folding (items 76–90)
- Scaled score range **200–600** (average ≈ 400, standard deviation ≈ 20).
  PAT score is **excluded** from the Academic Average.
- No penalty for wrong answers; every question has exactly one correct answer.
- Official ADA names: Apertures (Keyholes), View Recognition (TFE),
  Angle Discrimination (Angle Ranking), Paper Folding (Hole Punching),
  Cube Counting, Pattern Folding.
- Answer choices per subtest: Keyholes **5**, TFE **4**, Angle Ranking **4**,
  Hole Punching **5**, Cube Counting **5**, Pattern Folding **4**.

## 1. Keyholes / Apertures (items 1–15, 5 choices)

- Stem: one 3D object (solid, "made of one solid piece") plus **five** flat
  silhouettes (apertures).
- The object must pass through the aperture in a **straight-line path**
  ("without rotating or turning").
- The object may be **rotated in space before entry** — the aperture is the
  silhouette of *some* orientation of the object, not just the front view.
- The opening must match the object's silhouette **exactly in shape and size**
  (no scaling; passing through at any angle is allowed but the whole object
  must fit).
- Distractors: silhouette from the wrong axis/orientation, silhouette with an
  extra bump/notch, silhouette missing a feature, mirror/symmetry mistakes.
- Real tests draw the object with hidden edges dashed or as plain solids;
  silhouettes are solid filled shapes.
- Generation model: produce an object (or assemble from primitives) and
  compute its orthogonal silhouettes; distractors are mutated versions
  (extra notch, missing feature, wrong-axis projection).

## 2. Top Front End / View Recognition (items 16–30, 4 choices)

- Stem: a 3D object drawn in 3/4 perspective; the **TOP** view is drawn
  upper-left, the **FRONT** view lower-left, the **END** (right-side) view is
  **missing**; the test-taker picks the missing view.
- Wait: some guides describe the missing view being *one of three* — the
  authentic format: two views given (Top + Front, or Top + End, or
  Front + End), one missing. Erudition: "you will be given the Top, Front and
  End views of the figure with one view missing".
- **Third-angle projection** conventions:
  - Solid lines = visible edges.
  - **Dotted lines = hidden edges** (this is the key discriminator; many
    distractors change only hidden lines).
  - The 2D views show the true shapes of the faces in projection.
- Objects may include curved/smooth features (cylinders, holes, rounded
  corners) — the views must show the correct silhouettes, including hidden
  edges *behind* the curved surfaces.
- Distractors: wrong hidden-line pattern, mirrored view, swapped view
  (Front drawn where End belongs), extra/missing edge.
- Generation model: represent the object as a set of orthogonal edge lists
  (visible/hidden); derive all three views; omit one and shuffle as 4 options.

## 3. Angle Ranking / Angle Discrimination (items 31–45, 4 choices)

- Stem: **four angles, labeled 1, 2, 3, 4**, drawn at the top of the screen.
- Task: rank them **smallest to largest**.
- Answer choices are **permutation strings** of the labels, e.g. `2-1-4-3`
  (Kaplan confirms choices are strings of numbers, e.g. "2-1-4-3").
- Real angles differ by small amounts (commonly 3–5°, at least ~1° apart);
  the difficulty comes from distinguishing close angles.
- Angle geometry: both rays anchored at the vertex; the angles are drawn
  similarly oriented (same vertex region) so the eyes must judge the opening.
- Distractors: other permutations of the same four labels (reversed,
  swapped adjacent, etc.).
- Generation model: pick 4 angles ≥1° apart, choose a true ordering, and
  generate plausible wrong permutations (e.g. reverse, swap-adjacent).

## 4. Hole Punching / Paper Folding (items 46–60, 5 choices)

- Stem: a square sheet of paper shown with **fold lines**; the paper is folded
  (up to 3 folds) and a hole is punched; the answer shows the **unfolded**
  paper with the hole positions.
- Grid: the paper is a **4×4 grid = 16 fixed square positions** (16 punch
  sites). Folds are along grid lines — horizontal, vertical, or **diagonal at
  45°** (through grid squares).
- The fold-sequence images show the paper with a **dotted line marking where
  the fold was made** (and the folded part is drawn overlaid).
- The punch is a **white circle** on the folded paper; unfolded answers are
  filled black circles on the 16-position grid.
- With a 45° diagonal fold the hole lands on the *other side* of the diagonal
  (mirrored across the fold axis); several grids in one answer can be filled.
- All five choices are unfolded grids; exactly one is correct; distractors are
  grids with one or more dots misplaced (wrong mirror position, wrong count).
- Generation model: random fold sequence (h/v/diagonal, 1–3 folds), punch a
  cell, reflect through each fold line to get the unfolded dot set; ensure
  uniqueness of the correct dot set vs distractors.

## 5. Cube Counting (items 61–75, 5 choices)

- Stem: a 3D isometric figure built from identical small cubes, with **hidden
  cubes implied** (visible cubes that "float" imply support underneath).
- Question: **"How many cubes have exactly N sides painted?"** where N is
  shown in the stem (0–3 typically; the figure is resting on the floor so
  bottom faces are unpainted; exposed faces are painted).
- Answer choices are **five numbers** (e.g. 1, 2, 3, 4, 5+); the correct
  answer is never zero in the real test (the count for the asked N is ≥1).
- Distractors: nearby numbers, the count for a different N, totals miscounted
  (ignoring hidden cubes or double-counting).
- Generation model: build a stack of cubes (columns), count exposed faces per
  cube (top = 1, sides exposed = up to 4, bottom never painted), compute the
  histogram for each N, ask for an N whose count ≥1, present 5 numeric choices
  around the true value.

## 6. Pattern Folding (items 76–90, 4 choices)

- Stem: a **flat net** on the left (2D outline with faces marked) that is
  folded (mentally) into a 3D object; the four choices are **isometric 3D
  drawings** of the folded figure, one correct.
- Faces may be **blank, shaded (solid), or patterned** (symbols like dot,
  square, triangle) — the markings appear on the folded figure in the correct
  places.
- Real nets: cube nets (6 faces), "dove" (triangular) prism nets, stepped
  (L-shaped) solids, rectangular boxes.
- Only faces that are visible in the isometric drawing need markings.
- Distractors: correct shape but wrong marking placement, marking on the wrong
  face, mirror (folding the net the wrong way), one face rotated.
- Generation model: a small set of net topologies (cube, dove prism, stepped
  solid); mark 1–2 faces with shading/symbols; fold programmatically (or use
  precomputed folding tables) to know which faces touch; draw isometric views
  with correct marks; distractors permute marks.

## Drawing / visual conventions (applies to all)

- Authentic PAT art is **black on white**: thin black linework, no pastel
  fills; silhouette answers are solid black fills (or solid white on black,
  depending on the booklet).
- Hidden edges = **dashed lines**; visible edges = solid lines.
- Folding diagrams use the grid + dotted fold line; the punched hole is drawn
  as a small circle.
- Cube counting figures use isometric projection with visible edges only
  (hidden cubes are implied, not drawn).
- Pattern folding uses a 2D net (left) and isometric 3D figures (choices).
- Font/size: labels (1–4 for angles; lettered choices A–E) in plain type.

## Implications for the generators (deliberate deviations, documented)

- The app keeps its 60-per-category fixed set and 4-option limit only where
  authentic (TFE/AR/PF = 4 choices); KH/HP/CC must become **5 choices**.
- AR changes from "which is smallest?" (diagram options) to authentic
  "rank all four, pick the permutation string".
- HP changes from a single fold to full fold sequences (up to 3 folds,
  diagonal folds) with a 16-position answer grid.
- TFE must drop the colored heightmap in favor of view-edge line art with
  dotted hidden lines (curved edges supported).
- All renderers (CLI SVG + React) move to black-on-white technical line art.
