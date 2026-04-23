import type { DesignProfileSeed } from "../types.ts";

const placeholder = ["Placeholder vendor to be confirmed"];

export const designProfiles: DesignProfileSeed[] = [
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
  },
  {
    name: "Vintage Modern",
    description: "Graphic shapes, edited color, and a bridge between mid-century ease and historic charm.",
    style_cues: ["geometric tile", "saturated accent moments", "slim silhouettes", "warm walnut", "statement mirror"],
    approved_vendors: {
      tile: ["Concrete Collaborative"],
      plumbing_fixtures: ["Watermark"],
      lighting: ["Cedar & Moss"],
      vanities: ["Semihandmade with custom tops"],
      mirrors: ["Bower Studios", "Rejuvenation"],
      flooring: ["Hakwood", "Madera"],
      hardware: placeholder,
      wallpaper: ["House of Hackney"],
      rugs: placeholder
    },
    palette_material_direction: ["walnut", "olive", "ink", "putty", "playful geometry"],
    avoid_notes: ["fussy traditional molding", "flat all-white schemes", "farmhouse distressing"]
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
    name: "Traditional Contemporary",
    description: "Classic proportions and polish, refined through current silhouettes and edited detailing.",
    style_cues: ["framed mirrors", "tailored millwork", "layered sconces", "elevated stone", "balanced symmetry"],
    approved_vendors: {
      tile: ["Ann Sacks"],
      plumbing_fixtures: ["Rohl"],
      lighting: ["Visual Comfort"],
      vanities: ["Kallista", "Waterworks"],
      mirrors: ["Restoration Hardware"],
      flooring: ["Somerset", "Hallmark Floors"],
      hardware: ["Emtek"],
      wallpaper: placeholder,
      rugs: placeholder
    },
    palette_material_direction: ["ivory", "taupe", "deep navy", "polished nickel", "marble accents"],
    avoid_notes: ["overly rustic reclaimed textures", "novelty tile layouts", "boho styling cues"]
  },
  {
    name: "Refined Rustic",
    description: "Textural and soulful, with handcrafted character elevated into a polished final composition.",
    style_cues: ["reclaimed wood warmth", "textured plaster", "forged hardware", "stone-forward materials", "organic asymmetry"],
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
    avoid_notes: ["high-gloss lacquer", "ultra-minimal blankness", "cool corporate grays"]
  },
  {
    name: "Coastal Quiet",
    description: "Airy, tonal, and soft-edged, with a calm resort sensibility and a restrained beach influence.",
    style_cues: ["white zellige", "light wire-brushed oak", "soft blue-gray", "linen texture", "relaxed polish"],
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
  }
];

export const designProfileMap = new Map(designProfiles.map((profile) => [profile.name, profile]));
