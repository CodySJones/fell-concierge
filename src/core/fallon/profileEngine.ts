import type { DesignProfileName, QuizSubmission } from "../../types.ts";

interface QuizQuestion {
  id: string;
  prompt: string;
  options: {
    value: string;
    label: string;
    weights: Partial<Record<DesignProfileName, number>>;
  }[];
}

const roomProfileOptions = (weight: number) => [
  { value: "traditional", label: "Traditional", weights: { Traditional: weight } },
  { value: "contemporary", label: "Contemporary", weights: { Contemporary: weight } },
  { value: "modern", label: "Modern", weights: { Modern: weight } },
  { value: "transitional", label: "Transitional", weights: { Transitional: weight } },
  { value: "mid-century", label: "Mid-Century", weights: { "Mid-Century": weight } },
  { value: "natural-minimal", label: "Natural Minimal", weights: { "Natural Minimal": weight } },
  { value: "coastal-calm", label: "Coastal Calm", weights: { "Coastal Calm": weight } },
  { value: "rustic", label: "Rustic", weights: { Rustic: weight } },
  { value: "industrial-modern", label: "Industrial Modern", weights: { "Industrial Modern": weight } },
  { value: "classic-craftsman", label: "Classic Craftsman", weights: { "Classic Craftsman": weight } }
] satisfies QuizQuestion["options"];

export const quizQuestions: QuizQuestion[] = [
  {
    id: "bathroom",
    prompt: "Which bathroom would you want to step into every morning?",
    options: roomProfileOptions(4)
  },
  {
    id: "kitchen",
    prompt: "Which kitchen would you most want to cook in?",
    options: roomProfileOptions(3)
  },
  {
    id: "living",
    prompt: "Which living room feels most natural to you?",
    options: roomProfileOptions(3)
  },
  {
    id: "dining",
    prompt: "Which dining room would you want to host dinner in?",
    options: roomProfileOptions(2)
  },
  {
    id: "materials",
    prompt: "Which material combination would you reach for first?",
    options: [
      { value: "woven-natural", label: "Natural woven texture", weights: { "Natural Minimal": 2, "Coastal Calm": 2, Rustic: 1 } },
      { value: "pale-plank", label: "Pale natural plank flooring", weights: { "Natural Minimal": 2, Contemporary: 1, "Coastal Calm": 1 } },
      { value: "warm-herringbone", label: "Warm herringbone wood flooring", weights: { Transitional: 2, "Classic Craftsman": 2, Traditional: 1 } },
      { value: "soapstone-rustic", label: "Soapstone with rustic wood", weights: { Rustic: 2, "Classic Craftsman": 2, "Industrial Modern": 1 } },
      { value: "quartzite-traditional", label: "Quartzite and traditional stone", weights: { Traditional: 2, Transitional: 2, "Coastal Calm": 1 } },
      { value: "zellige", label: "Zellige tile", weights: { "Coastal Calm": 2, "Natural Minimal": 1, Transitional: 1 } },
      { value: "travertine", label: "Travertine", weights: { Contemporary: 2, "Natural Minimal": 1, Rustic: 1 } },
      { value: "geometric-pale-tile", label: "Geometric pale tile", weights: { "Mid-Century": 2, Modern: 1, Contemporary: 1 } }
    ]
  },
  {
    id: "wall",
    prompt: "Which wall treatment feels most like you?",
    options: [
      { value: "gold-wabi-abstract", label: "Gold and wabi abstract wall", weights: { Modern: 2, Contemporary: 2, "Natural Minimal": 1 } },
      { value: "animal-line", label: "Animal line drawing wallpaper", weights: { "Mid-Century": 2, Rustic: 1, "Classic Craftsman": 1 } },
      { value: "blue-floral", label: "Blue floral wallpaper", weights: { Traditional: 2, "Coastal Calm": 2, Transitional: 1 } },
      { value: "morris-botanical", label: "Morris green botanical wallpaper", weights: { "Classic Craftsman": 2, Traditional: 2, "Natural Minimal": 1 } }
    ]
  },
  {
    id: "pattern",
    prompt: "How much pattern do you want in the room?",
    options: [
      { value: "almost-none", label: "Almost none — calm texture over pattern", weights: { "Natural Minimal": 2, Contemporary: 1, Modern: 1 } },
      { value: "a-little", label: "A little — subtle tile, fabric, or wallpaper", weights: { Transitional: 2, "Coastal Calm": 1, Contemporary: 1 } },
      { value: "some", label: "Some — one expressive feature", weights: { Traditional: 1, "Classic Craftsman": 1, "Mid-Century": 1 } },
      { value: "a-lot", label: "A lot — pattern and color are part of the point", weights: { "Mid-Century": 2, Traditional: 1, Rustic: 1 } }
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

  const tieBreakOrder = new Map<DesignProfileName, number>();
  for (const questionId of ["bathroom", "kitchen", "living", "dining"]) {
    const question = quizQuestions.find((candidate) => candidate.id === questionId);
    const answer = submission.answers.find((candidate) => candidate.startsWith(`${questionId}:`));
    const value = answer?.split(":")[1];
    const option = question?.options.find((candidate) => candidate.value === value);
    if (!option) {
      continue;
    }
    for (const profile of Object.keys(option.weights) as DesignProfileName[]) {
      if (!tieBreakOrder.has(profile)) {
        tieBreakOrder.set(profile, tieBreakOrder.size);
      }
    }
  }

  const ranked = [...scores.entries()].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }
    return (tieBreakOrder.get(a[0]) ?? 99) - (tieBreakOrder.get(b[0]) ?? 99);
  });
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
