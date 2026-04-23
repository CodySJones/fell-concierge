export const siteContent = {
  brand: {
    name: "Fell & Co.",
    tagline: "Redesigning Remodeling."
  },
  hero: {
    headline: "A calmer start to remodeling.",
    supporting:
      "Take the Fell & Co. design profile to identify your style direction and the clearest next step for your kitchen or bath remodel.",
    primaryCta: { label: "Begin the Quiz", href: "/start" },
    secondaryCta: { label: "How It Works", href: "#process" }
  },
  intro: {
    eyebrow: "Positioning",
    title: "A remote-first studio for kitchen and bath remodels.",
    body:
      "Fell & Co. pairs timeless design with structured delivery. The process is deliberately curated to reduce overwhelm, protect momentum, and make each decision feel clearer."
  },
  process: {
    eyebrow: "Process",
    title: "A calmer sequence, quietly kept in order.",
    steps: [
      { title: "Discover", body: "Take the design profile and tell us about your space." },
      { title: "Curate", body: "Receive a tailored direction and optional sample box." },
      { title: "Scan", body: "Capture your room so the design can take shape." },
      { title: "Refine", body: "Review finishes, layouts, and visual options." },
      { title: "Lock In", body: "Finalize your rendering and selections." },
      { title: "Move Forward", body: "Purchase documents, materials, or a bid comparison." }
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
    title: "Abstract decisions become easier when materials are in hand.",
    body:
      "The sample box turns design direction into something tangible. It helps clients compare texture, tone, and finish with less second-guessing."
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
  closing: {
    title: "Start with the design profile.",
    body:
      "Begin with a design profile, receive a curated direction, and continue through a remodel process that feels considered from the outset.",
    cta: { label: "Begin the Quiz", href: "/start" }
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
