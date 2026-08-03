import type { GeneratedQuestion } from "../pat-types.js";

export function renderSVGPlaceholder(
  question: GeneratedQuestion,
  size: number = 200
): string {
  const category = question.category;

  switch (category) {
    case "keyholes":
      return renderKeyholesSVG(question, size);
    case "tfe":
      return renderTFESVG(question, size);
    case "angle_ranking":
      return renderAngleRankingSVG(question, size);
    case "hole_punching":
      return renderHolePunchingSVG(question, size);
    case "cube_counting":
      return renderCubeCountingSVG(question, size);
    case "pattern_folding":
      return renderPatternFoldingSVG(question, size);
    default:
      return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666">${category}</text></svg>`;
  }
}

function renderKeyholesSVG(q: GeneratedQuestion, size: number): string {
  const meta = q.metadata as { shape?: string };
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8fafc" rx="8"/>
    <text x="50%" y="30%" text-anchor="middle" fill="#334155" font-size="14">Keyhole Question</text>
    <text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-size="12">3D Shape: ${meta.shape ?? "Unknown"}</text>
    <text x="50%" y="70%" text-anchor="middle" fill="#94a3b8" font-size="10">Seed: ${q.seed}</text>
  </svg>`;
}

function renderTFESVG(q: GeneratedQuestion, size: number): string {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8fafc" rx="8"/>
    <text x="50%" y="30%" text-anchor="middle" fill="#334155" font-size="14">Top-Front-End</text>
    <text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-size="12">View Relationships</text>
    <text x="50%" y="70%" text-anchor="middle" fill="#94a3b8" font-size="10">Seed: ${q.seed}</text>
  </svg>`;
}

function renderAngleRankingSVG(q: GeneratedQuestion, size: number): string {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8fafc" rx="8"/>
    <text x="50%" y="30%" text-anchor="middle" fill="#334155" font-size="14">Angle Ranking</text>
    <text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-size="12">Compare Angles</text>
    <text x="50%" y="70%" text-anchor="middle" fill="#94a3b8" font-size="10">Seed: ${q.seed}</text>
  </svg>`;
}

function renderHolePunchingSVG(q: GeneratedQuestion, size: number): string {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8fafc" rx="8"/>
    <text x="50%" y="30%" text-anchor="middle" fill="#334155" font-size="14">Hole Punching</text>
    <text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-size="12">Paper Folding</text>
    <text x="50%" y="70%" text-anchor="middle" fill="#94a3b8" font-size="10">Seed: ${q.seed}</text>
  </svg>`;
}

function renderCubeCountingSVG(q: GeneratedQuestion, size: number): string {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8fafc" rx="8"/>
    <text x="50%" y="30%" text-anchor="middle" fill="#334155" font-size="14">Cube Counting</text>
    <text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-size="12">Count Faces</text>
    <text x="50%" y="70%" text-anchor="middle" fill="#94a3b8" font-size="10">Seed: ${q.seed}</text>
  </svg>`;
}

function renderPatternFoldingSVG(q: GeneratedQuestion, size: number): string {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8fafc" rx="8"/>
    <text x="50%" y="30%" text-anchor="middle" fill="#334155" font-size="14">Pattern Folding</text>
    <text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-size="12">2D to 3D</text>
    <text x="50%" y="70%" text-anchor="middle" fill="#94a3b8" font-size="10">Seed: ${q.seed}</text>
  </svg>`;
}
