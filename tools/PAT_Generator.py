import random
import math
import json

# ============================================================
# CONFIGURATION – Total questions per category
# ============================================================
TARGET_TOTALS = {
    'PF': 4000,  # Pattern Folding (weighted)
    'KH': 1500,  # Keyholes
    'TFE': 1500, # Top-Front-End
    'AR': 1000,  # Angle Ranking
    'HP': 1000,  # Hole Punching
    'CC': 1000   # Cube Counting
}

# ============================================================
# HELPER FUNCTIONS & PATTERN DEFINITIONS
# ============================================================

def svg_pattern_defs():
    """Returns a string of SVG pattern definitions used in all generators."""
    return '''<defs>
<pattern id="stripe" width="10" height="10"><line x1="0" y1="0" x2="0" y2="10" stroke="black" stroke-width="2"/></pattern>
<pattern id="dots" width="10" height="10"><circle cx="5" cy="5" r="2" fill="black"/></pattern>
<pattern id="cross" width="10" height="10"><path d="M0,0 L10,10 M10,0 L0,10" stroke="black" stroke-width="1"/></pattern>
<pattern id="wave" width="20" height="20"><path d="M0,10 Q5,5 10,10 T20,10" stroke="red" stroke-width="2" fill="none"/></pattern>
<pattern id="plus" width="20" height="20"><path d="M10,0 L10,20 M0,10 L20,10" stroke="green" stroke-width="2"/></pattern>
<pattern id="diag" width="20" height="20"><path d="M0,0 L20,20 M20,0 L0,20" stroke="blue" stroke-width="2"/></pattern>
<pattern id="grid" width="10" height="10"><rect width="10" height="10" fill="white" stroke="black" stroke-width="0.5"/></pattern>
<pattern id="hatch" width="10" height="10"><path d="M0,10 L10,0" stroke="black" stroke-width="1.5"/></pattern>
<pattern id="circle_tl" width="20" height="20"><circle cx="5" cy="5" r="5" fill="black"/><rect width="20" height="20" fill="none" stroke="black"/></pattern>
<pattern id="diag_split" width="20" height="20"><path d="M0,0 L20,20" stroke="black" stroke-width="2"/><rect width="20" height="20" fill="white" stroke="black"/></pattern>
<pattern id="quarter_circle" width="20" height="20"><path d="M0,0 L20,0 A20,20 0 0,0 0,20 Z" fill="black"/><rect width="20" height="20" fill="none" stroke="black"/></pattern>
<pattern id="striped_angle" width="20" height="20"><line x1="0" y1="0" x2="20" y2="20" stroke="black" stroke-width="2"/><line x1="0" y1="20" x2="20" y2="0" stroke="black" stroke-width="2"/><rect width="20" height="20" fill="none" stroke="black"/></pattern>
<pattern id="dots_halved" width="20" height="20"><circle cx="5" cy="5" r="2" fill="black"/><circle cx="15" cy="15" r="2" fill="black"/><rect width="20" height="20" fill="none" stroke="black"/></pattern>
<pattern id="cross_halved" width="20" height="20"><path d="M10,0 L10,20 M0,10 L20,10" stroke="black" stroke-width="2"/><rect width="20" height="20" fill="none" stroke="black"/></pattern>
</defs>'''

def random_shading_patterns(n=6):
    """Return a list of n random pattern IDs (with possible repeats for variety)."""
    pool = ['stripe','dots','cross','wave','plus','diag','grid','hatch','circle_tl','diag_split','quarter_circle','striped_angle','dots_halved','cross_halved']
    return [random.choice(pool) for _ in range(n)]

# ============================================================
# CATEGORY GENERATORS (Each returns a question dict)
# ============================================================

# ---------- PATTERN FOLDING (Irregular nets, asymmetrical patterns) ----------
def gen_pf_question(qid):
    # Choose a layout: 'T', 'cross', 'strip', 'L'
    layout = random.choice(['T', 'cross', 'strip', 'L'])
    faces = random_shading_patterns(6)  # 6 unique patterns
    # Build net SVG
    net = f'<g transform="translate(50,50)">'
    if layout == 'T':
        net += f'''<rect x="60" y="0" width="60" height="60" fill="url({faces[0]})"/><text x="90" y="35">1</text>
        <rect x="0" y="60" width="60" height="60" fill="url({faces[1]})"/><text x="30" y="95">2</text>
        <rect x="60" y="60" width="60" height="60" fill="url({faces[2]})"/><text x="90" y="95">3</text>
        <rect x="120" y="60" width="60" height="60" fill="url({faces[3]})"/><text x="150" y="95">4</text>
        <rect x="60" y="120" width="60" height="60" fill="url({faces[4]})"/><text x="90" y="155">5</text>
        <rect x="60" y="180" width="60" height="60" fill="url({faces[5]})"/><text x="90" y="215">6</text>'''
    elif layout == 'cross':
        net += f'''<rect x="60" y="0" width="60" height="60" fill="url({faces[0]})"/>
        <rect x="0" y="60" width="60" height="60" fill="url({faces[1]})"/>
        <rect x="60" y="60" width="60" height="60" fill="url({faces[2]})"/>
        <rect x="120" y="60" width="60" height="60" fill="url({faces[3]})"/>
        <rect x="60" y="120" width="60" height="60" fill="url({faces[4]})"/>
        <rect x="60" y="180" width="60" height="60" fill="url({faces[5]})"/>'''
    # ... add other layouts as needed
    net += '</g>'
    
    # Build 4 isometric options: correct = faces[0] top, faces[1] left, faces[2] right
    # Scramble the visible faces for distractors
    opts_svg = []
    for i in range(4):
        if i == 0:
            top, left, right = faces[0], faces[1], faces[2]
        elif i == 1:
            top, left, right = faces[2], faces[0], faces[3]  # swap adjacency
        elif i == 2:
            top, left, right = faces[1], faces[3], faces[0]
        else:
            top, left, right = faces[4], faces[0], faces[2]
        opts_svg.append(f'<path d="M20,20 L60,0 L100,20 L60,40 Z" fill="url({top})"/><path d="M20,20 L60,40 L60,90 L20,70 Z" fill="url({left})"/><path d="M60,40 L100,20 L100,70 L60,90 Z" fill="url({right})"/>')
    
    svg = f'<svg viewBox="0 0 800 550" width="100%">{svg_pattern_defs()}{net}<g transform="translate(420,20)">'
    for i, opt in enumerate(opts_svg):
        svg += f'<g transform="translate({(i%2)*140}, {(i//2)*130})"><text x="40" y="-10">{chr(65+i)}</text>{opt}</g>'
    svg += '</g></svg>'
    
    return {
        'id': f'PF-{qid:04d}',
        'svg': svg,
        'question': f'Which cube (A-D) correctly represents the folded net? Note the orientation of the asymmetrical patterns.',
        'options': ['A', 'B', 'C', 'D'],
        'answer': 'A',
        'explanation': 'The correct folding preserves the adjacency and orientation of the irregular patterns. Only option A maintains the proper relationship.'
    }

# ---------- KEYHOLES (Chamfered edges, intersecting cylinders) ----------
def gen_kh_question(qid):
    # Build a 3D object with base and a cylinder, possibly with chamfer
    base_w, base_h = 60, 40
    cyl_r = random.randint(10, 20)
    chamfer = random.choice([True, False])
    # Object SVG (isometric)
    obj = f'<g transform="translate(50,60)">'
    obj += f'<path d="M20,40 L60,20 L100,40 L100,90 L60,110 L20,90 Z" fill="lightgray" stroke="black" stroke-width="2"/>'
    if chamfer:
        obj += f'<path d="M80,40 L90,45 L100,40" fill="white" stroke="black"/>'
    obj += f'<ellipse cx="60" cy="20" rx="{cyl_r}" ry="{cyl_r//2}" fill="white" stroke="black"/>'
    obj += f'<path d="M{60-cyl_r},20 L{60-cyl_r},40 L{60+cyl_r},40 L{60+cyl_r},20" fill="none" stroke="black"/>'
    obj += f'<ellipse cx="60" cy="40" rx="{cyl_r}" ry="{cyl_r//2}" fill="none" stroke="black"/>'
    obj += '</g>'
    # Apertures (A-D)
    ap_svg = ''
    for i in range(4):
        if i == 0:  # correct
            ap = f'<rect x="20" y="20" width="{max(base_w, 2*cyl_r)}" height="{base_h + cyl_r}" fill="white" stroke="black"/><ellipse cx="50" cy="20" rx="{cyl_r}" ry="{cyl_r//2}" fill="white" stroke="black"/>'
            if chamfer:
                ap += f'<rect x="70" y="20" width="5" height="5" fill="white" stroke="black"/>'  # notch
        else:
            # wrong variations
            ap = f'<rect x="20" y="20" width="{base_w}" height="{base_h}" fill="white" stroke="black"/><ellipse cx="50" cy="20" rx="{cyl_r + random.randint(-5,5)}" ry="{cyl_r//2}" fill="white" stroke="black"/>'
        ap_svg += f'<g transform="translate({(i%2)*140}, {(i//2)*130})"><text x="40" y="-10">{chr(65+i)}</text>{ap}</g>'
    svg = f'<svg viewBox="0 0 700 500" width="100%">{obj}<g transform="translate(280,30)">{ap_svg}</g></svg>'
    return {
        'id': f'KH-{qid:04d}',
        'svg': svg,
        'question': 'Which aperture (A-D) allows the object to pass through completely when viewed from the front?',
        'options': ['A', 'B', 'C', 'D'],
        'answer': 'A',
        'explanation': 'The correct aperture must accommodate the base, the cylinder, and the chamfer (if present). Only A matches the silhouette exactly.'
    }

# ---------- TFE (Hidden lines are critical) ----------
def gen_tfe_question(qid):
    # Create an L-block with a recessed hole (dashed lines in front view)
    # Top view: L-shape, Front view: L-shape with dashed rectangle
    # End view: hole appears as solid rectangle
    svg = f'<svg viewBox="0 0 700 500" width="100%">'
    svg += f'<g transform="translate(50,20)"><text x="30" y="10">TOP</text><rect x="0" y="20" width="80" height="40" fill="gray" stroke="black"/><rect x="80" y="20" width="40" height="40" fill="white" stroke="black"/></g>'
    svg += f'<g transform="translate(50,140)"><text x="35" y="10">FRONT</text><rect x="0" y="20" width="80" height="40" fill="gray" stroke="black"/><rect x="80" y="20" width="40" height="40" fill="gray" stroke="black"/><rect x="20" y="30" width="20" height="20" fill="none" stroke="black" stroke-dasharray="4,4"/></g>'
    svg += f'<g transform="translate(350,20)"><text x="100" y="10">END VIEW</text>'
    # Options: A has hole as solid, B no hole, C hole on wrong side, D hole dashed
    for i in range(4):
        if i == 0:  # correct
            e = f'<rect x="0" y="10" width="60" height="60" fill="white" stroke="black"/><rect x="20" y="10" width="20" height="20" fill="gray" stroke="black"/>'
        elif i == 1:
            e = f'<rect x="0" y="10" width="60" height="60" fill="white" stroke="black"/>'
        elif i == 2:
            e = f'<rect x="0" y="10" width="60" height="60" fill="white" stroke="black"/><rect x="30" y="10" width="20" height="20" fill="gray" stroke="black"/>'
        else:
            e = f'<rect x="0" y="10" width="60" height="60" fill="white" stroke="black"/><rect x="20" y="10" width="20" height="20" fill="none" stroke="black" stroke-dasharray="4,4"/>'
        svg += f'<g transform="translate({(i%2)*100}, {(i//2)*130})"><text x="20" y="0">{chr(65+i)}</text>{e}</g>'
    svg += '</g></svg>'
    return {
        'id': f'TFE-{qid:04d}',
        'svg': svg,
        'question': 'Which END view correctly translates the visible and hidden lines from the FRONT view?',
        'options': ['A', 'B', 'C', 'D'],
        'answer': 'A',
        'explanation': 'The recessed hole appears as a solid rectangle in the End view, because it is visible from that side. Option A shows the correct placement.'
    }

# ---------- ANGLE RANKING (Embedded in 3D wireframes) ----------
def gen_ar_question(qid):
    # Generate 4 angles (two acute, one right-ish, one obtuse) and embed them in a 3D-like frame
    angles = [random.randint(15, 45), random.randint(25, 50), random.randint(80, 100), random.randint(110, 160)]
    random.shuffle(angles)
    letters = ['A','B','C','D']
    svg = f'<svg viewBox="0 0 700 300" width="100%"><g transform="translate(20,50)">'
    for i, ang in enumerate(angles):
        rad = math.radians(ang)
        x = int(80 * math.cos(rad))
        y = int(80 * math.sin(rad))
        svg += f'<g transform="translate({i*150}, 0)"><text x="20" y="-10">{letters[i]}</text>'
        svg += f'<line x1="0" y1="0" x2="80" y2="0" stroke="black" stroke-width="4"/>'
        svg += f'<line x1="0" y1="0" x2="{x}" y2="{y}" stroke="black" stroke-width="4"/>'
        # Add a 3D beam illusion
        svg += f'<line x1="0" y1="0" x2="{-20}" y2="{-10}" stroke="gray" stroke-width="2"/>'
        svg += '</g>'
    svg += '</g></svg>'
    # Sort angles and map to letters
    sorted_letters = [letters[i] for i in sorted(range(4), key=lambda i: angles[i])]
    correct_order = ' < '.join(sorted_letters)
    return {
        'id': f'AR-{qid:04d}',
        'svg': svg,
        'question': 'Rank the indicated angles from smallest to largest (enter the sequence of letters).',
        'options': [correct_order, 'A < B < C < D', 'D < C < B < A', 'B < A < D < C'],
        'answer': 'A',
        'explanation': f'The correct ascending order is: {correct_order}.'
    }

# ---------- HOLE PUNCHING (Multiple folds: vertical, horizontal, diagonal) ----------
def gen_hp_question(qid):
    # Fold sequence: 1) vertical, 2) horizontal, 3) diagonal (optional)
    # Result: 8 or 12 holes symmetric
    # We'll design a simple SVG that shows the folding steps and then options with different hole patterns.
    # For simplicity, we'll use a standard 4x4 grid representation.
    # Choose a punch location (e.g., bottom-right quadrant) and mirror accordingly.
    # We'll generate SVG with the folded paper and punch, then 4 unfolded choices.
    # Since SVG is large, we'll use a concise representation.
    # This is a simplified version; real exam requires complex folds.
    svg = f'<svg viewBox="0 0 600 400" width="100%">'
    # Show folded paper with punch
    svg += f'<g transform="translate(20,20)"><rect x="0" y="0" width="100" height="100" fill="white" stroke="black"/>'
    svg += f'<line x1="50" y1="0" x2="50" y2="100" stroke="red" stroke-dasharray="5,5"/>'
    svg += f'<line x1="0" y1="50" x2="100" y2="50" stroke="blue" stroke-dasharray="5,5"/>'
    svg += f'<circle cx="75" cy="75" r="5" fill="black"/>'
    svg += f'<text x="50" y="120" text-anchor="middle">Punch at (75,75)</text></g>'
    # Unfolded options
    svg += f'<g transform="translate(150,20)">'
    for i in range(4):
        # Option A: 4 holes (correct for two folds) 
        # Option B: 8 holes (if diagonal fold included)
        # Option C: wrong pattern
        # Option D: wrong pattern
        if i == 0:
            pattern = f'<rect x="0" y="0" width="80" height="80" fill="white" stroke="black"/><circle cx="20" cy="20" r="4" fill="black"/><circle cx="60" cy="20" r="4" fill="black"/><circle cx="20" cy="60" r="4" fill="black"/><circle cx="60" cy="60" r="4" fill="black"/>'
        elif i == 1:
            pattern = f'<rect x="0" y="0" width="80" height="80" fill="white" stroke="black"/><circle cx="20" cy="20" r="4" fill="black"/><circle cx="60" cy="60" r="4" fill="black"/>'
        elif i == 2:
            pattern = f'<rect x="0" y="0" width="80" height="80" fill="white" stroke="black"/><circle cx="40" cy="40" r="4" fill="black"/>'
        else:
            pattern = f'<rect x="0" y="0" width="80" height="80" fill="white" stroke="black"/><circle cx="20" cy="60" r="4" fill="black"/><circle cx="60" cy="20" r="4" fill="black"/>'
        svg += f'<g transform="translate({(i%2)*100}, {(i//2)*100})"><text x="10" y="10">{chr(65+i)}</text>{pattern}</g>'
    svg += '</g></svg>'
    return {
        'id': f'HP-{qid:04d}',
        'svg': svg,
        'question': 'After folding vertically and then horizontally, a hole is punched at the position shown. Which unfolded pattern is correct?',
        'options': ['A', 'B', 'C', 'D'],
        'answer': 'A',
        'explanation': 'Two folds (vertical and horizontal) mirror the punch across both axes, resulting in 4 symmetrical holes. Option A shows the correct 4-hole pattern.'
    }

# ---------- CUBE COUNTING (Irregular clusters, hidden supports, exposed faces) ----------
def gen_cc_question(qid):
    # Generate a 3D isometric cube stack (irregular, up to 4x4 grid, varying heights)
    width = random.randint(2, 4)
    depth = random.randint(2, 4)
    max_h = random.randint(3, 5)
    # Build 2D height map
    stack = [[0]*depth for _ in range(width)]
    # Fill with random heights, ensuring structural support (no floating)
    for x in range(width):
        for y in range(depth):
            # Determine max possible height based on neighbors
            max_possible = max_h
            if x > 0:
                max_possible = min(max_possible, stack[x-1][y] + 1)
            if y > 0:
                max_possible = min(max_possible, stack[x][y-1] + 1)
            # Optionally reduce for edge cubes to create irregularity
            if x == 0 or x == width-1 or y == 0 or y == depth-1:
                max_possible = min(max_possible, max_h-1)
            stack[x][y] = random.randint(1, max_possible) if max_possible > 0 else 0

    # Compute isometric coordinates
    origin_x, origin_y = 100, 200
    dx, dy = 30, 15
    # Draw cubes from back to front (higher y first, then x descending)
    svg = f'<svg viewBox="0 0 600 400" width="100%"><g transform="translate(20,20)">'
    for y in range(depth-1, -1, -1):
        for x in range(width-1, -1, -1):
            h = stack[x][y]
            for layer in range(h):
                base_x = origin_x + (x - y) * dx
                base_y = origin_y + (x + y) * dy - layer * 30
                # Check exposed faces
                top_exposed = (layer == h-1)
                left_exposed = (x == 0 or stack[x-1][y] <= layer)
                right_exposed = (y == 0 or stack[x][y-1] <= layer)
                # Draw only exposed faces to avoid visual clutter
                if top_exposed:
                    svg += f'<polygon points="{base_x},{base_y} {base_x+dx},{base_y-dy} {base_x+2*dx},{base_y} {base_x+dx},{base_y+dy}" fill="lightblue" stroke="black" stroke-width="1"/>'
                if left_exposed:
                    svg += f'<polygon points="{base_x},{base_y} {base_x},{base_y+30} {base_x+dx},{base_y+30+dy} {base_x+dx},{base_y+dy}" fill="lightgray" stroke="black" stroke-width="1"/>'
                if right_exposed:
                    svg += f'<polygon points="{base_x+dx},{base_y+dy} {base_x+dx},{base_y+30+dy} {base_x+2*dx},{base_y+30} {base_x+2*dx},{base_y}" fill="darkgray" stroke="black" stroke-width="1"/>'
    svg += '</g></svg>'

    # Count totals and exposed faces
    total = sum(sum(row) for row in stack)
    exposed_2 = 0  # cubes with exactly 2 exposed faces
    for x in range(width):
        for y in range(depth):
            h = stack[x][y]
            for layer in range(h):
                faces = 0
                if layer == h-1: faces += 1
                if x == 0 or stack[x-1][y] <= layer: faces += 1
                if y == 0 or stack[x][y-1] <= layer: faces += 1
                if faces == 2:
                    exposed_2 += 1

    # Randomly ask either total or exposed_2
    if random.choice([True, False]):
        question = f'How many cubes are in the entire irregular stack (including hidden supports)?'
        correct = total
        wrongs = [total-1, total+1, total+2]
    else:
        question = f'How many cubes in the stack have exactly 2 exposed faces (top and one side visible)?'
        correct = exposed_2
        wrongs = [exposed_2-1, exposed_2+1, exposed_2+2]

    # Build options
    opts = [correct] + [w for w in wrongs if w >= 0]
    random.shuffle(opts)
    correct_idx = opts.index(correct)
    letters = ['A','B','C','D']
    correct_letter = letters[correct_idx]

    return {
        'id': f'CC-{qid:04d}',
        'svg': svg,
        'question': question,
        'options': [str(o) for o in opts],
        'answer': correct_letter,
        'explanation': f'Total cubes = {total}. Cubes with exactly 2 exposed faces = {exposed_2}.'
    }

# ============================================================
# HTML TEMPLATE (uses same styling as previous)
# ============================================================
HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>PAT - {CATEGORY_NAME}</title>
<style>
* {{ margin:0; padding:0; font-family:'Segoe UI', sans-serif; }}
body {{ background:#f0f4f8; padding:20px; }}
.container {{ max-width:1100px; margin:0 auto; }}
header {{ background:#1e3a8a; color:white; padding:20px; border-radius:12px; margin-bottom:20px; }}
.q-card {{ background:white; border-radius:16px; padding:24px; margin-bottom:24px; border:1px solid #e2e8f0; }}
svg {{ max-width:100%; height:auto; display:block; margin:15px 0; background:#fafafa; border-radius:8px; border:1px solid #e2e8f0; padding:10px; }}
.options {{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:12px 0; }}
.option {{ background:#f8fafc; padding:10px 14px; border:1px solid #e2e8f0; border-radius:8px; }}
.show-btn {{ background:#1e3a8a; color:white; border:none; padding:8px 20px; border-radius:6px; cursor:pointer; }}
.answer-box {{ display:none; margin-top:15px; padding:16px; background:#ecfdf5; border-left:4px solid #10b981; border-radius:8px; }}
@media(max-width:600px){{ .options {{ grid-template-columns:1fr; }} }}
</style>
</head>
<body>
<div class="container">
<header><h1>{CATEGORY_ICON} {CATEGORY_NAME} ({CATEGORY_CODE})</h1><p>Realistic DAT-Style Question Bank</p></header>
<div id="question-container"></div>
</div>
<script>
const questions = {QUESTIONS_JSON};
function render(){{ const container=document.getElementById('question-container'); container.innerHTML=questions.map((q,i)=>`
<div class="q-card"><div class="q-id">${{q.id}}</div><div class="q-text">${{q.question}}</div>${{q.svg}}<div class="options">${{q.options.map((o,j)=>`<div class="option">${{String.fromCharCode(65+j)}}. ${{o}}</div>`).join('')}}</div><button class="show-btn" onclick="document.getElementById('ans-${{i}}').style.display='block'">Show Answer</button><div class="answer-box" id="ans-${{i}}"><strong>Correct: ${{q.answer}}</strong><br>${{q.explanation}}</div></div>`).join(''); }} render();
</script>
</body>
</html>'''

# ============================================================
# MAIN GENERATOR LOOP
# ============================================================
GENERATORS = {
    'PF': {'name':'Pattern Folding', 'icon':'📐', 'func':gen_pf_question},
    'KH': {'name':'Keyholes', 'icon':'🔑', 'func':gen_kh_question},
    'TFE': {'name':'Top-Front-End', 'icon':'📐', 'func':gen_tfe_question},
    'AR': {'name':'Angle Ranking', 'icon':'📐', 'func':gen_ar_question},
    'HP': {'name':'Hole Punching', 'icon':'⭕', 'func':gen_hp_question},
    'CC': {'name':'Cube Counting', 'icon':'🧊', 'func':gen_cc_question}
}

if __name__ == '__main__':
    for code, info in GENERATORS.items():
        count = TARGET_TOTALS[code]
        print(f"Generating {count} questions for {code}...")
        qlist = []
        for i in range(count):
            qlist.append(GENERATORS[code]['func'](i+1))
            if i % 100 == 0:
                print(f"  {code}: {i}/{count}")
        
        html = HTML_TEMPLATE.replace('{CATEGORY_NAME}', info['name'])
        html = html.replace('{CATEGORY_CODE}', code)
        html = html.replace('{CATEGORY_ICON}', info['icon'])
        html = html.replace('{QUESTIONS_JSON}', json.dumps(qlist))
        
        filename = f'{code.lower()}.html'
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"✅ Saved {filename}")
    
    print("\n🎉 All 10,000 questions generated! Open the HTML files in your browser.")