export const siteContent = {
  brand: {
    name: "Fell & Co.",
    tagline: "Redesigning Remodeling."
  },
  hero: {
    headline: "the form and function of remodeling has changed",
    supporting:
      "Begin with a short design profile. Fell & Co. turns your room, taste, timing, and readiness into one clear next step.",
    primaryCta: { label: "Begin the Quiz", href: "/start" },
    secondaryCta: { label: "FAQ", href: "#faq" }
  },
  intro: {
    eyebrow: "Positioning",
    title: "A remote-first studio for kitchen and bath remodels.",
    body:
      "Fell & Co. pairs timeless design with structured delivery. The process is deliberately curated to reduce overwhelm, protect momentum, and make each decision feel clearer."
  },
  process: {
    eyebrow: "Process",
    title: "A simple path, kept in order.",
    steps: [
      { title: "Profile", body: "Share your room, style preferences, timing, and readiness." },
      { title: "Sample", body: "Use a focused sample box to compare materials before larger commitments." },
      { title: "Lock In", body: "Move into consultation, scan, render, and selections when the project is ready." }
    ]
  },
  profiles: {
    eyebrow: "Design Profiles",
    title: "Ten clear style directions.",
    body:
      "Rather than beginning with endless options, Fell & Co. starts with a defined point of view.",
    items: ["Traditional", "Contemporary", "Modern", "Transitional", "Mid-Century", "Natural Minimal", "Coastal Calm", "Rustic", "Industrial Modern", "Classic Craftsman"]
  },
  sampleBox: {
    eyebrow: "Sample Box",
    title: "Materials make the direction tangible.",
    body:
      "The sample box helps clients compare texture, tone, and finish with less second-guessing."
  },
  render: {
    eyebrow: "Lock-In Render",
    title: "Once refined, the design can be committed with confidence.",
    body:
      "Renderings and selections are used to create clarity, alignment, and momentum. They are not rushed forward before the project is ready."
  },
  services: {
    eyebrow: "Services",
    title: "A restrained set of next steps.",
    items: [
      "Color Consult",
      "Sample Box",
      "Lock-In Render",
      "Revisions",
      "Selections List",
      "Construction Documents",
      "Sample Bid"
    ]
  },
  armitage: {
    eyebrow: "Construction Path",
    title: "An understated path toward building.",
    body:
      "For clients seeking a construction path, Fell & Co. can coordinate next steps with Armitage Interiors."
  },
  faq: {
    eyebrow: "FAQ",
    title: "Before you begin.",
    items: [
      {
        question: "What happens after I take the quiz?",
        answer:
          "You receive a design profile and a recommended next step based on your room, style preferences, timeline, budget, and project readiness."
      },
      {
        question: "Is this full-service design?",
        answer:
          "No. Fell & Co. starts with a focused, productized path so each step is clear before deeper design work, renderings, selections, or construction documents begin."
      },
      {
        question: "Do I need measurements or a room scan first?",
        answer:
          "Not for the initial design profile. Later-stage recommendations wait until the right project inputs are available."
      },
      {
        question: "Why start with a sample box?",
        answer:
          "Materials are easier to trust in person. The sample box turns the profile direction into something tangible before larger commitments."
      }
    ]
  },
  closing: {
    title: "Start with the design profile.",
    body:
      "Receive a curated direction and continue only when the next step makes sense.",
    cta: { label: "Sign In / Log In", href: "/portal" }
  },
  notes: {
    spacing:
      "Adjust calm pacing in public/site/components.js by editing the section wrapper class strings and the max-width containers.",
    typography:
      "Change serif/sans tone in src/ui/publicPages.ts tailwind config and refine scale in public/site/components.js heading/body class names.",
    content:
      "Update all homepage copy in public/site/content.js without touching component structure."
  }
};
