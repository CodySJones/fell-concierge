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
      { value: "classic", label: "Classic, collected, and rooted in tradition", weights: { Traditional: 4, Transitional: 2, "Classic Craftsman": 2 } },
      { value: "clean", label: "Clean, current, and softly edited", weights: { Contemporary: 4, Modern: 2, "Natural Minimal": 1 } },
      { value: "calm", label: "Quiet, airy, and deeply calming", weights: { "Natural Minimal": 4, "Coastal Calm": 3, Transitional: 1 } },
      { value: "bold", label: "Graphic, expressive, and a little architectural", weights: { "Mid-Century": 3, "Industrial Modern": 3, Rustic: 1 } }
    ]
  },
  {
    id: "materials",
    prompt: "Which material direction are you drawn to?",
    options: [
      { value: "tailored", label: "Painted millwork, marble, and polished metal", weights: { Traditional: 4, Transitional: 2, Contemporary: 1 } },
      { value: "walnut", label: "Walnut, graphic tile, and warm contrast", weights: { "Mid-Century": 4, Modern: 1, "Industrial Modern": 1 } },
      { value: "organic", label: "Plaster, pale wood, and tactile stone", weights: { "Natural Minimal": 4, Rustic: 2, "Coastal Calm": 1 } },
      { value: "structural", label: "Steel, concrete, oak, and darker finishes", weights: { "Industrial Modern": 4, Modern: 2, Rustic: 1 } }
    ]
  },
  {
    id: "silhouette",
    prompt: "What fixture silhouette feels right?",
    options: [
      { value: "ornate", label: "Bridge, cross-handle, or more decorative details", weights: { Traditional: 3, "Classic Craftsman": 3, Transitional: 1 } },
      { value: "tailored", label: "Tailored and timeless, but not too formal", weights: { Transitional: 4, Contemporary: 2, "Coastal Calm": 1 } },
      { value: "minimal", label: "Streamlined, sculptural, and quietly modern", weights: { Modern: 4, "Natural Minimal": 2, Contemporary: 1 } },
      { value: "graphic", label: "Distinctive, retro, or industrial with personality", weights: { "Mid-Century": 3, "Industrial Modern": 3, Rustic: 1 } }
    ]
  },
  {
    id: "palette",
    prompt: "Choose a palette family.",
    options: [
      { value: "soft-classic", label: "Ivory, mushroom, taupe, and gentle contrast", weights: { Traditional: 3, Transitional: 3, Contemporary: 1 } },
      { value: "earth", label: "Moss, cognac, clay, and aged brass", weights: { "Classic Craftsman": 3, Rustic: 3, "Mid-Century": 1 } },
      { value: "minimal", label: "Chalk, sand, pale oak, and quiet stone", weights: { "Natural Minimal": 4, Contemporary: 2, "Coastal Calm": 1 } },
      { value: "moody", label: "Ink, charcoal, walnut, and blackened metals", weights: { Modern: 3, "Industrial Modern": 3, "Mid-Century": 1 } }
    ]
  },
  {
    id: "personality",
    prompt: "How adventurous should the space feel?",
    options: [
      { value: "reserved", label: "Reserved, elegant, and quietly tailored", weights: { Traditional: 2, Transitional: 3, Contemporary: 2 } },
      { value: "warm", label: "Warm, human, and visibly crafted", weights: { Rustic: 3, "Classic Craftsman": 3, "Coastal Calm": 1 } },
      { value: "graphic", label: "Distinctive and visually strong", weights: { Modern: 2, "Mid-Century": 3, "Industrial Modern": 3 } },
      { value: "soft", label: "Soft, easy, and low-drama", weights: { "Natural Minimal": 3, "Coastal Calm": 3, Transitional: 1 } }
    ]
  },
  {
    id: "priority",
    prompt: "What matters most in the finished room?",
    options: [
      { value: "timeless", label: "A timeless room that will age gracefully", weights: { Traditional: 3, Transitional: 3, "Classic Craftsman": 2 } },
      { value: "clarity", label: "Calm, clarity, and edited restraint", weights: { "Natural Minimal": 4, Modern: 2, Contemporary: 1 } },
      { value: "character", label: "Character, texture, and lived-in warmth", weights: { Rustic: 3, "Classic Craftsman": 3, "Coastal Calm": 1 } },
      { value: "presence", label: "Distinct style and a strong visual point of view", weights: { "Mid-Century": 3, "Industrial Modern": 3, Contemporary: 1 } }
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
    primaryProfile: (primary?.[0] ?? "Transitional") as DesignProfileName,
    primaryConfidence: Number(((primary?.[1] ?? 1) / total).toFixed(2)),
    secondaryProfile: (secondary?.[0] ?? null) as DesignProfileName | null,
    secondaryConfidence: secondary ? Number((secondary[1] / total).toFixed(2)) : null,
    rationale: `Profile determined from the strongest patterns in the quiz: ${rationaleParts.slice(0, 4).join(", ")}. This is directional guidance only until more project information is collected.`
  };
};
