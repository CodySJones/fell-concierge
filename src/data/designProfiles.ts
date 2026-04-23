import type { DesignProfileSeed } from "../types.ts";

const placeholder = ["Placeholder vendor to be confirmed"];

export const designProfiles: DesignProfileSeed[] = [
  {
    name: "Traditional",
    description: "Layered, graceful, and rooted in classic detailing with a polished, familiar warmth.",
    style_cues: ["framed cabinetry", "marble accents", "decorative mirrors", "polished nickel", "symmetry"],
    approved_vendors: {
      tile: ["Ann Sacks"],
      plumbing_fixtures: ["Rohl"],
      lighting: ["Visual Comfort"],
      vanities: ["Waterworks"],
      mirrors: ["Restoration Hardware"],
      flooring: ["Somerset"],
      hardware: ["Emtek"],
      wallpaper: placeholder,
      rugs: placeholder
    },
    palette_material_direction: ["ivory", "taupe", "soft charcoal", "polished nickel", "classic marble"],
    avoid_notes: ["ultra-minimal slab fronts", "industrial rawness", "overly casual beach motifs"]
  },
  {
    name: "Contemporary",
    description: "Current, refined, and clean-lined with softness rather than starkness.",
    style_cues: ["large-format tile", "thin-profile lighting", "warm neutrals", "edited silhouettes", "subtle contrast"],
    approved_vendors: {
      tile: ["Porcelanosa"],
      plumbing_fixtures: ["Brizo"],
      lighting: ["Allied Maker"],
      vanities: ["Kallista"],
      mirrors: ["Rejuvenation"],
      flooring: ["Hakwood"],
      hardware: placeholder,
      wallpaper: placeholder,
      rugs: placeholder
    },
    palette_material_direction: ["warm white", "greige", "taupe oak", "bronze", "soft stone"],
    avoid_notes: ["ornate millwork", "farmhouse distressing", "high-theme vintage styling"]
  },
  {
    name: "Modern",
    description: "Architectural and pared back, with crisp geometry and disciplined restraint.",
    style_cues: ["flush surfaces", "minimal hardware", "bold geometry", "monolithic stone", "high clarity"],
    approved_vendors: {
      tile: ["Mutina"],
      plumbing_fixtures: ["Gessi"],
      lighting: ["Juniper"],
      vanities: ["Reform"],
      mirrors: ["Bower Studios"],
      flooring: ["Dinesen"],
      hardware: placeholder,
      wallpaper: placeholder,
      rugs: placeholder
    },
    palette_material_direction: ["black", "white", "concrete", "smoked oak", "matte finishes"],
    avoid_notes: ["decorative trim", "busy pattern mixing", "traditional furniture silhouettes"]
  },
  {
    name: "Transitional",
    description: "Balanced and approachable, blending classic familiarity with cleaner updated lines.",
    style_cues: ["shaker influences", "soft contrast", "tailored lighting", "clean stone", "gentle symmetry"],
    approved_vendors: {
      tile: ["Ann Sacks"],
      plumbing_fixtures: ["California Faucets"],
      lighting: ["Visual Comfort"],
      vanities: ["James Martin"],
      mirrors: ["Rejuvenation"],
      flooring: ["Hallmark Floors"],
      hardware: ["Emtek"],
      wallpaper: placeholder,
      rugs: placeholder
    },
    palette_material_direction: ["cream", "stone", "mushroom", "warm brass", "painted wood"],
    avoid_notes: ["hard minimalism", "heavy rustic texture", "themed mid-century details"]
  },
  {
    name: "Mid-Century",
    description: "Warm, graphic, and retro-informed with sculptural forms and walnut-driven contrast.",
    style_cues: ["walnut", "graphic tile", "slim profiles", "statement mirrors", "retro silhouettes"],
    approved_vendors: {
      tile: ["Concrete Collaborative"],
      plumbing_fixtures: ["Watermark"],
      lighting: ["Cedar & Moss"],
      vanities: ["Semihandmade with custom tops"],
      mirrors: ["Bower Studios"],
      flooring: ["Madera"],
      hardware: placeholder,
      wallpaper: ["House of Hackney"],
      rugs: placeholder
    },
    palette_material_direction: ["walnut", "olive", "ochre", "ink", "warm white"],
    avoid_notes: ["ornate traditional trim", "coastal driftwood palettes", "farmhouse accents"]
  },
  {
    name: "Natural Minimal",
    description: "Quiet, tactile, and restrained with honest materials and soft architectural calm.",
    style_cues: ["limewash sensibility", "integrated storage", "low-contrast palettes", "natural stone", "soft black accents"],
    approved_vendors: {
      tile: ["Heath Ceramics"],
      plumbing_fixtures: ["Brizo (LITZE or KINSTON collections)"],
      lighting: ["In Common With"],
      vanities: ["Reform", "Kast Concrete"],
      mirrors: ["MENU", "Ferm Living"],
      flooring: ["Dinesen", "Revel Woods"],
      hardware: placeholder,
      wallpaper: placeholder,
      rugs: ["Armadillo"]
    },
    palette_material_direction: ["chalk", "sand", "warm gray oak", "matte black", "brushed nickel"],
    avoid_notes: ["busy veining", "ornate trim packages", "high-contrast glam finishes"]
  },
  {
    name: "Coastal Calm",
    description: "Airy, tonal, and softened, with a relaxed coastal sensibility that stays refined.",
    style_cues: ["white zellige", "wire-brushed oak", "soft blue-gray", "linen texture", "relaxed polish"],
    approved_vendors: {
      tile: ["Zia Tile (white zellige)"],
      plumbing_fixtures: ["Newport Brass"],
      lighting: ["Visual Comfort Coastal"],
      vanities: ["Serena & Lily"],
      mirrors: ["Serena & Lily", "Palecek"],
      flooring: ["Monarch Plank", "Kentwood"],
      hardware: ["Rocky Mountain Hardware"],
      wallpaper: placeholder,
      rugs: placeholder
    },
    palette_material_direction: ["salt white", "mist blue", "driftwood", "soft brass", "woven texture"],
    avoid_notes: ["literal nautical motifs", "heavy dark cabinetry", "high-contrast industrial detailing"]
  },
  {
    name: "Rustic",
    description: "Textured, grounded, and organic with an emphasis on warmth, patina, and natural character.",
    style_cues: ["reclaimed wood", "forged hardware", "stone-forward materials", "plaster texture", "weathered finishes"],
    approved_vendors: {
      tile: ["Fireclay Tile"],
      plumbing_fixtures: ["Waterworks"],
      lighting: ["Urban Electric Co."],
      vanities: ["deVOL"],
      mirrors: ["RH", "Wabi Home"],
      flooring: ["Pioneer Millworks", "LV Wood"],
      hardware: placeholder,
      wallpaper: placeholder,
      rugs: placeholder
    },
    palette_material_direction: ["umber", "bone", "terracotta", "weathered oak", "aged bronze"],
    avoid_notes: ["high-gloss lacquer", "strict minimalism", "cool corporate grays"]
  },
  {
    name: "Industrial Modern",
    description: "Edgy, architectural, and materially honest with steel, concrete, and darker contrast.",
    style_cues: ["blackened steel", "concrete surfaces", "linear lighting", "graphic contrast", "minimal framing"],
    approved_vendors: {
      tile: ["Cle Tile"],
      plumbing_fixtures: ["Brizo"],
      lighting: ["Apparatus"],
      vanities: ["Reform"],
      mirrors: ["CB2"],
      flooring: ["Stuga"],
      hardware: ["Rocky Mountain Hardware"],
      wallpaper: placeholder,
      rugs: placeholder
    },
    palette_material_direction: ["charcoal", "blackened bronze", "concrete gray", "walnut", "smoke glass"],
    avoid_notes: ["decorative traditional trim", "coastal softness", "storybook craftsman detailing"]
  },
  {
    name: "Classic Craftsman",
    description: "Warm, tailored craftsmanship with heritage detailing and a grounded material story.",
    style_cues: ["quartered oak", "subway or artisan field tile", "bridge faucets", "aged brass", "built-in character"],
    approved_vendors: {
      tile: ["Fireclay Tile"],
      plumbing_fixtures: ["California Faucets"],
      lighting: ["Schoolhouse"],
      vanities: ["James Martin"],
      mirrors: ["Rejuvenation", "Reframe"],
      flooring: ["Duchateau", "Carlisle Wide Plank"],
      hardware: ["Rejuvenation"],
      wallpaper: placeholder,
      rugs: placeholder
    },
    palette_material_direction: ["moss", "cream", "cognac wood tones", "aged brass", "handmade ceramic texture"],
    avoid_notes: ["overly glossy stone-look finishes", "cold chrome-heavy schemes", "minimalist slab detailing"]
  }
];

export const designProfileMap = new Map(designProfiles.map((profile) => [profile.name, profile]));
