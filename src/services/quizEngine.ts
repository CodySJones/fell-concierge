import type { DesignProfileName, QuizSubmission } from "../types.ts";

interface QuizQuestion {
  id: string;
  prompt: string;
  options: {
    value: string;
    label: string;
    weights: Partial<Record<DesignProfileName, number>>;
  }[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "mood",
    prompt: "Which bathroom mood feels most like home?",
    options: [
      { value: "heritage", label: "Crafted, storied, and rooted in tradition", weights: { "Classic Craftsman": 4, "Traditional Contemporary": 2, "Refined Rustic": 2 } },
      { value: "graphic", label: "Graphic, clever, and a little unexpected", weights: { "Vintage Modern": 4, "Traditional Contemporary": 1 } },
      { value: "quiet", label: "Quiet, tonal, and deeply calming", weights: { "Natural Minimal": 4, "Coastal Quiet": 2, "Refined Rustic": 1 } },
      { value: "tailored", label: "Tailored, polished, and timeless", weights: { "Traditional Contemporary": 4, "Classic Craftsman": 2, "Natural Minimal": 1 } }
    ]
  },
  {
    id: "materials",
    prompt: "Which material direction are you drawn to?",
    options: [
      { value: "artisan", label: "Handmade tile, oak, and warm brass", weights: { "Classic Craftsman": 4, "Refined Rustic": 2, "Traditional Contemporary": 1 } },
      { value: "stone", label: "Soft stone, plaster, and clean-lined wood", weights: { "Natural Minimal": 4, "Traditional Contemporary": 1, "Refined Rustic": 1 } },
      { value: "graphic", label: "Geometric tile, warm walnut, and edited contrast", weights: { "Vintage Modern": 4, "Traditional Contemporary": 1 } },
      { value: "coastal", label: "White zellige, pale oak, and woven textures", weights: { "Coastal Quiet": 4, "Natural Minimal": 1 } }
    ]
  },
  {
    id: "silhouette",
    prompt: "What fixture silhouette feels right?",
    options: [
      { value: "bridge", label: "Bridge and cross-handle details", weights: { "Classic Craftsman": 3, "Traditional Contemporary": 2 } },
      { value: "streamlined", label: "Streamlined with subtle sculptural edges", weights: { "Natural Minimal": 3, "Vintage Modern": 2, "Coastal Quiet": 1 } },
      { value: "architectural", label: "Architectural, substantial, and quietly modern", weights: { "Refined Rustic": 3, "Natural Minimal": 1, "Traditional Contemporary": 1 } },
      { value: "coastal", label: "Relaxed polish with soft traditional references", weights: { "Coastal Quiet": 3, "Traditional Contemporary": 1, "Classic Craftsman": 1 } }
    ]
  },
  {
    id: "palette",
    prompt: "Choose a palette family.",
    options: [
      { value: "earth", label: "Moss, cognac, cream, and clay", weights: { "Classic Craftsman": 3, "Refined Rustic": 3 } },
      { value: "ink", label: "Olive, walnut, putty, and ink", weights: { "Vintage Modern": 4, "Traditional Contemporary": 1 } },
      { value: "sand", label: "Sand, chalk, and quiet gray oak", weights: { "Natural Minimal": 4, "Coastal Quiet": 1 } },
      { value: "mist", label: "Salt white, driftwood, and mist blue", weights: { "Coastal Quiet": 4, "Traditional Contemporary": 1 } }
    ]
  },
  {
    id: "personality",
    prompt: "How adventurous should the space feel?",
    options: [
      { value: "measured", label: "Measured and elegant", weights: { "Traditional Contemporary": 3, "Natural Minimal": 2 } },
      { value: "warm", label: "Warm with visible craftsmanship", weights: { "Classic Craftsman": 3, "Refined Rustic": 3 } },
      { value: "bold", label: "Bold with color or pattern moments", weights: { "Vintage Modern": 4, "Refined Rustic": 1, "Traditional Contemporary": 1 } },
      { value: "airy", label: "Airy and softly layered", weights: { "Coastal Quiet": 3, "Natural Minimal": 1 } }
    ]
  },
  {
    id: "priority",
    prompt: "What matters most in the finished room?",
    options: [
      { value: "craft", label: "Craft details and long-term character", weights: { "Classic Craftsman": 4, "Traditional Contemporary": 1 } },
      { value: "clarity", label: "Calm, clarity, and edited restraint", weights: { "Natural Minimal": 4, "Coastal Quiet": 1 } },
      { value: "impact", label: "Distinct personality and visual impact", weights: { "Vintage Modern": 3, "Traditional Contemporary": 2, "Refined Rustic": 1 } },
      { value: "comfort", label: "Comfortable polish and softness", weights: { "Coastal Quiet": 3, "Refined Rustic": 2 } }
    ]
  }
];

export const scoreQuiz = (submission: QuizSubmission) => {
  const scores = new Map<DesignProfileName, number>();
  const rationaleParts: string[] = [];

  for (const question of quizQuestions) {
    const answer = submission.answers.find((candidate) => candidate.startsWith(`${question.id}:`));
    const value = answer?.split(":")[1];
    const option = question.options.find((candidate) => candidate.value === value);
    if (!option) {
      continue;
    }
    rationaleParts.push(option.label);
    for (const [profile, weight] of Object.entries(option.weights) as [DesignProfileName, number][]) {
      scores.set(profile, (scores.get(profile) ?? 0) + weight);
    }
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const total = ranked.reduce((sum, entry) => sum + entry[1], 0) || 1;
  const [primary, secondary] = ranked;

  return {
    primaryProfile: (primary?.[0] ?? "Natural Minimal") as DesignProfileName,
    primaryConfidence: Number(((primary?.[1] ?? 1) / total).toFixed(2)),
    secondaryProfile: (secondary?.[0] ?? null) as DesignProfileName | null,
    secondaryConfidence: secondary ? Number((secondary[1] / total).toFixed(2)) : null,
    rationale: `Profile determined from the strongest patterns in the quiz: ${rationaleParts.slice(0, 4).join(", ")}. This is directional guidance only until more project information is collected.`
  };
};
