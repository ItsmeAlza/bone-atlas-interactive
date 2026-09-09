/**
 * Central bone definitions for the interactive skeleton.
 *
 * - `Bone` is the pure metadata model (no rendering concerns).
 * - `BoneShape` adds the SVG geometry used by the <Bone /> component.
 * - Unilateral bones are authored ONCE for the right side (viewer's left,
 *   x < 200). The left side reuses the same path inside a mirrored group,
 *   which keeps left/right perfectly symmetric and independently selectable.
 */

export type BoneRegion =
  | "skull"
  | "spine"
  | "thorax"
  | "upper-limb"
  | "hand"
  | "pelvis"
  | "lower-limb"
  | "foot";

export type BoneSide = "left" | "right" | "midline" | "bilateral";

export type Bone = {
  id: string;
  name: string;
  region: BoneRegion;
  side: BoneSide;
  category: string;
  parentId?: string;
};

export type BoneShape = Bone & {
  /** SVG path data. */
  d: string;
  /** True when the path must be rendered inside the mirrored (left) group. */
  mirrored: boolean;
};

export const VIEWBOX = { width: 400, height: 940 };
const M = 200; // midline

/* ------------------------------------------------------------------ */
/* geometry helpers                                                    */
/* ------------------------------------------------------------------ */

export const n = (v: number) => Math.round(v * 100) / 100;

/** rounded blob (ellipse-like) */
export const blob = (cx: number, cy: number, rx: number, ry: number) =>
  `M${n(cx - rx)},${n(cy)} a${n(rx)},${n(ry)} 0 1 0 ${n(rx * 2)},0 a${n(rx)},${n(ry)} 0 1 0 ${n(-rx * 2)},0 Z`;

/** tapered shaft between two points with half-widths w1/w2 */
export const shaft = (x1: number, y1: number, w1: number, x2: number, y2: number, w2: number) => {
  const my = (y1 + y2) / 2;
  return (
    `M${n(x1 - w1)},${n(y1)} C${n(x1 - w1 - 1)},${n(my)} ${n(x2 - w2 - 1)},${n(my)} ${n(x2 - w2)},${n(y2)} ` +
    `L${n(x2 + w2)},${n(y2)} C${n(x2 + w2 + 1)},${n(my)} ${n(x1 + w1 + 1)},${n(my)} ${n(x1 + w1)},${n(y1)} Z`
  );
};


/** vertebral body seen from the front */
const vertebra = (y: number, w: number, h: number) =>
  `M${n(M - w)},${n(y + 2)} L${n(M - w + 2)},${n(y)} L${n(M + w - 2)},${n(y)} L${n(M + w)},${n(y + 2)} ` +
  `L${n(M + w)},${n(y + h - 2)} L${n(M + w - 2)},${n(y + h)} L${n(M - w + 2)},${n(y + h)} L${n(M - w)},${n(y + h - 2)} Z` +
  ` ${blob(M - w - 4, y + h / 2, 3.5, 2.4)} ${blob(M + w + 4, y + h / 2, 3.5, 2.4)}`;

/** one rib of the right hemithorax (x < 200) */
const ribPath = (i: number) => {
  const y0 = 208 + i * 9.6;
  const spread = 26 + Math.sin(((i + 1) / 13) * Math.PI) * 46;
  const xOut = 193 - spread;
  let xf: number;
  let yf: number;
  if (i < 7) {
    xf = 190;
    yf = 216 + i * 7.5;
  } else if (i < 10) {
    xf = 180 - (i - 7) * 9;
    yf = 272 + (i - 7) * 9;
  } else {
    xf = xOut + 16;
    yf = y0 + 22;
  }
  const t = 4.6;
  return (
    `M193,${n(y0)} C${n(193 - spread * 0.55)},${n(y0 - 7)} ${n(xOut - 3)},${n(y0 + (yf - y0) * 0.45)} ${n(xf)},${n(yf)} ` +
    `L${n(xf)},${n(yf + t)} C${n(xOut + 2)},${n(y0 + (yf - y0) * 0.45 + t)} ${n(193 - spread * 0.5)},${n(y0 - 7 + t + 2)} 193,${n(y0 + t + 1)} Z`
  );
};

/* ------------------------------------------------------------------ */
/* midline bones (full coordinates)                                    */
/* ------------------------------------------------------------------ */

type MidlineDef = Omit<Bone, "side"> & { d: string };

const midline: MidlineDef[] = [
  // --- skull ---
  {
    id: "frontal",
    name: "Frontal Bone",
    region: "skull",
    category: "flat-bone",
    d: "M166,48 C168,27 182,16 200,16 C218,16 232,27 234,48 L234,64 C220,71 180,71 166,64 Z",
  },
  {
    id: "occipital",
    name: "Occipital Bone",
    region: "skull",
    category: "flat-bone",
    d: "M184,20 C192,14 208,14 216,20 C208,26 192,26 184,20 Z",
  },
  {
    id: "sphenoid",
    name: "Sphenoid Bone",
    region: "skull",
    category: "irregular-bone",
    d: "M182,78 C190,72 210,72 218,78 C210,86 190,86 182,78 Z",
  },
  {
    id: "ethmoid",
    name: "Ethmoid Bone",
    region: "skull",
    category: "irregular-bone",
    d: "M196,80 L204,80 L204,92 L196,92 Z",
  },
  {
    id: "vomer",
    name: "Vomer",
    region: "skull",
    category: "flat-bone",
    d: "M197.5,94 L202.5,94 L201.5,108 L198.5,108 Z",
  },
  {
    id: "mandible",
    name: "Mandible",
    region: "skull",
    category: "irregular-bone",
    d: "M177,106 C180,128 220,128 223,106 L217.5,105 C215,120 185,120 182.5,105 Z",
  },
  {
    id: "hyoid",
    name: "Hyoid Bone",
    region: "skull",
    category: "irregular-bone",
    d: "M188,132 C194,127 206,127 212,132 L211,136.5 C205,132.5 195,132.5 189,136.5 Z",
  },
  // --- sternum ---
  {
    id: "sternum",
    name: "Sternum",
    region: "thorax",
    category: "flat-bone",
    d: "M192,206 L208,206 L206.5,224 L204,258 L200,272 L196,258 L193.5,224 Z",
  },
  // --- sacrum / coccyx ---
  {
    id: "sacrum",
    name: "Sacrum",
    region: "spine",
    category: "irregular-bone",
    d: "M184,404 L216,404 L212,432 L200,442 L188,432 Z",
  },
  {
    id: "coccyx",
    name: "Coccyx",
    region: "spine",
    category: "irregular-bone",
    d: "M195.5,443 L204.5,443 L202.5,457 L197.5,457 Z",
  },
];

// vertebrae
const cervical = Array.from({ length: 7 }, (_, i) => ({
  id: `c${i + 1}`,
  name: `Cervical Vertebra C${i + 1}`,
  region: "spine" as const,
  category: "vertebra",
  d: vertebra(140 + i * 8, 9, 6.5),
}));

const thoracic = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i + 1}`,
  name: `Thoracic Vertebra T${i + 1}`,
  region: "spine" as const,
  category: "vertebra",
  d: vertebra(198 + i * 11, 11 + i * 0.3, 9),
}));

const lumbar = Array.from({ length: 5 }, (_, i) => ({
  id: `l${i + 1}`,
  name: `Lumbar Vertebra L${i + 1}`,
  region: "spine" as const,
  category: "vertebra",
  d: vertebra(332 + i * 14, 16, 12),
}));

midline.push(...cervical, ...thoracic, ...lumbar);

/* ------------------------------------------------------------------ */
/* unilateral bones (authored for the RIGHT side, x < 200)             */
/* ------------------------------------------------------------------ */

type SideDef = {
  base: string;
  name: string;
  region: BoneRegion;
  category: string;
  parentBase?: string;
  d: string;
};

const side: SideDef[] = [
  // --- skull ---
  {
    base: "parietal",
    name: "Parietal Bone",
    region: "skull",
    category: "flat-bone",
    d: "M167,42 C158,50 157,66 162.5,79 L175,74 C170.5,62 169,52 171,46 Z",
  },
  {
    base: "temporal",
    name: "Temporal Bone",
    region: "skull",
    category: "irregular-bone",
    d: "M162.5,79 C161.5,91 168,99 177,101 L180.5,89 C174,87 170,83 169,76 Z",
  },
  { base: "nasal", name: "Nasal Bone", region: "skull", category: "flat-bone", d: "M193.5,80 L197.5,80 L197.5,95 L191.5,95 Z" },
  { base: "lacrimal", name: "Lacrimal Bone", region: "skull", category: "flat-bone", d: blob(186, 86, 3.2, 3.8) },
  {
    base: "zygomatic",
    name: "Zygomatic Bone",
    region: "skull",
    category: "irregular-bone",
    d: "M175,90 C182,88 190,93 190,99 L180,104 C175.5,101 173,94 175,90 Z",
  },
  { base: "maxilla", name: "Maxilla", region: "skull", category: "irregular-bone", d: "M187,97 L197.5,97 L197.5,112 L185,109 Z" },
  { base: "palatine", name: "Palatine Bone", region: "skull", category: "irregular-bone", d: blob(193, 113, 4, 2.8) },

  // --- shoulder girdle ---
  {
    base: "clavicle",
    name: "Clavicle",
    region: "upper-limb",
    category: "long-bone",
    d: "M196,192 C182,185 166,183 150,186 L149,191.5 C166,188.5 182,190.5 196,197.5 Z",
  },
  {
    base: "scapula",
    name: "Scapula",
    region: "upper-limb",
    category: "flat-bone",
    d: "M149,192 C130,194 118,202 116,213 C118,233 132,249 142.5,251 C147,236 151,213 149,192 Z",
  },

  // --- arm ---
  {
    base: "humerus",
    name: "Humerus",
    region: "upper-limb",
    category: "long-bone",
    d: `${blob(124, 211, 9.5, 8.5)} ${shaft(122, 215, 6.5, 117, 336, 5.5)} ${blob(117, 341, 8.5, 6.5)}`,
  },
  {
    base: "ulna",
    name: "Ulna",
    region: "upper-limb",
    category: "long-bone",
    d: `${blob(123, 349, 6.5, 5.5)} ${shaft(122, 352, 5, 120, 447, 4)}`,
  },
  {
    base: "radius",
    name: "Radius",
    region: "upper-limb",
    category: "long-bone",
    d: `${blob(108, 357, 4.6, 4.6)} ${shaft(108, 358, 3.6, 106, 448, 5.6)}`,
  },

  // --- carpals ---
  { base: "scaphoid", name: "Scaphoid", region: "hand", category: "carpal", d: blob(110, 456, 5, 4) },
  { base: "lunate", name: "Lunate", region: "hand", category: "carpal", d: blob(118, 455, 4.5, 4) },
  { base: "triquetrum", name: "Triquetrum", region: "hand", category: "carpal", d: blob(124.5, 459, 4, 3.5) },
  { base: "pisiform", name: "Pisiform", region: "hand", category: "carpal", d: blob(129, 463, 3, 2.6) },
  { base: "trapezium", name: "Trapezium", region: "hand", category: "carpal", d: blob(105, 466, 4.5, 4) },
  { base: "trapezoid", name: "Trapezoid", region: "hand", category: "carpal", d: blob(112, 467, 4, 3.5) },
  { base: "capitate", name: "Capitate", region: "hand", category: "carpal", d: blob(118.5, 466, 5, 4.4) },
  { base: "hamate", name: "Hamate", region: "hand", category: "carpal", d: blob(125.5, 469, 4.5, 4) },
];

// metacarpals + finger phalanges
const ROMAN = ["I", "II", "III", "IV", "V"] as const;
const DIGIT_NAMES = ["Thumb", "Index Finger", "Middle Finger", "Ring Finger", "Little Finger"] as const;

const mcGeom = [
  { x1: 100, y1: 472, w1: 4, x2: 92, y2: 492, w2: 3.4 },
  { x1: 110, y1: 472, w1: 3.6, x2: 106, y2: 502, w2: 3 },
  { x1: 117, y1: 473, w1: 3.6, x2: 115, y2: 504, w2: 3 },
  { x1: 123, y1: 474, w1: 3.3, x2: 123, y2: 502, w2: 2.8 },
  { x1: 128.5, y1: 476, w1: 3, x2: 130, y2: 498, w2: 2.6 },
];

const fingerPhalanx = [
  // [prox, mid, dist] each: x1,y1,x2,y2
  [
    [91, 494, 86, 508],
    null,
    [85.5, 510, 82.5, 520],
  ],
  [
    [105.5, 504, 103.5, 522],
    [103.5, 524, 102.5, 534],
    [102.5, 536, 101.5, 544],
  ],
  [
    [114.5, 506, 113.5, 526],
    [113.5, 528, 112.5, 538],
    [112.5, 540, 111.5, 548],
  ],
  [
    [123, 504, 123, 522],
    [123, 524, 123, 534],
    [123, 536, 123, 543],
  ],
  [
    [130.5, 500, 131.5, 514],
    [131.5, 516, 132.5, 524],
    [132.5, 526, 133.5, 532],
  ],
] as (number[] | null)[][];

mcGeom.forEach((g, i) => {
  side.push({
    base: `metacarpal-${i + 1}`,
    name: `Metacarpal ${ROMAN[i]}`,
    region: "hand",
    category: "metacarpal",
    d: shaft(g.x1, g.y1, g.w1, g.x2, g.y2, g.w2),
  });
});

const PHX_LABEL = ["Proximal", "Middle", "Distal"] as const;
const PHX_KEY = ["proximal", "middle", "distal"] as const;
const PHX_W = [3, 2.6, 2.3];

/** builds a phalanx shaft from a [x1,y1,x2,y2] segment */
const phalanxPath = (seg: number[], pi: number, slim: number) => {
  const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = seg;
  const w = (PHX_W[pi] ?? 2.4) - slim;
  return shaft(x1, y1, w, x2, y2, w - 0.4);
};

fingerPhalanx.forEach((digit, di) => {
  digit.forEach((seg, pi) => {
    if (!seg) return;
    side.push({
      base: `${PHX_KEY[pi]}-phalanx-hand-${di + 1}`,
      name: `${PHX_LABEL[pi]} Phalanx ${ROMAN[di]} (${DIGIT_NAMES[di]})`,
      region: "hand",
      category: "phalanx",
      parentBase: `metacarpal-${di + 1}`,
      d: phalanxPath(seg, pi, 0),
    });
  });
});

// --- pelvis + leg ---
side.push(
  {
    base: "ilium",
    name: "Ilium",
    region: "pelvis",
    category: "flat-bone",
    d: "M188,400 C168,395 146,404 140,420 C142,432 152,441 166,443 C180,437 190,421 190,406 Z",
  },
  {
    base: "ischium",
    name: "Ischium",
    region: "pelvis",
    category: "irregular-bone",
    d: "M158,443 C150,453 152,467 164,469 C172,465 176.5,455 174,447 Z",
  },
  {
    base: "pubis",
    name: "Pubis",
    region: "pelvis",
    category: "irregular-bone",
    d: "M176,446 C186,450 196,455 197,462 C188,468 176,464.5 170,458 Z",
  },
  {
    base: "femur",
    name: "Femur",
    region: "lower-limb",
    category: "long-bone",
    d: `${blob(181, 452, 9, 9)} ${shaft(173, 460, 8.5, 167, 624, 7.5)} ${blob(161, 633, 10, 9)} ${blob(176, 633, 9, 8.5)}`,
  },
  { base: "patella", name: "Patella", region: "lower-limb", category: "sesamoid", d: blob(169, 645, 8, 9) },
  {
    base: "tibia",
    name: "Tibia",
    region: "lower-limb",
    category: "long-bone",
    d: `${blob(172, 660, 13, 6.5)} ${shaft(172, 662, 10.5, 175, 794, 6)} ${blob(177, 799, 7.5, 6)}`,
  },
  {
    base: "fibula",
    name: "Fibula",
    region: "lower-limb",
    category: "long-bone",
    d: `${blob(154, 664, 5, 5)} ${shaft(154, 666, 4, 158, 794, 4.2)} ${blob(158.5, 800, 5, 6)}`,
  },
  // tarsals
  { base: "talus", name: "Talus", region: "foot", category: "tarsal", d: blob(168, 812, 10, 7) },
  { base: "calcaneus", name: "Calcaneus", region: "foot", category: "tarsal", d: blob(163, 831, 12, 10) },
  { base: "navicular", name: "Navicular", region: "foot", category: "tarsal", d: blob(177, 824, 6, 5) },
  { base: "cuboid", name: "Cuboid", region: "foot", category: "tarsal", d: blob(153, 831, 7, 6) },
  { base: "medial-cuneiform", name: "Medial Cuneiform", region: "foot", category: "tarsal", d: blob(183, 836, 5, 4.2) },
  { base: "intermediate-cuneiform", name: "Intermediate Cuneiform", region: "foot", category: "tarsal", d: blob(174.5, 839, 4.6, 4) },
  { base: "lateral-cuneiform", name: "Lateral Cuneiform", region: "foot", category: "tarsal", d: blob(166, 841, 4.6, 4) },
);

const mtGeom = [
  { x1: 184, y1: 844, w1: 4.5, x2: 186, y2: 876, w2: 4 },
  { x1: 176, y1: 846, w1: 3.6, x2: 178, y2: 882, w2: 3 },
  { x1: 168, y1: 848, w1: 3.6, x2: 170, y2: 880, w2: 3 },
  { x1: 160, y1: 848, w1: 3.3, x2: 162, y2: 876, w2: 2.8 },
  { x1: 152, y1: 846, w1: 3.6, x2: 154, y2: 872, w2: 3 },
];

const TOE_NAMES = ["Hallux", "2nd Toe", "3rd Toe", "4th Toe", "5th Toe"] as const;

const toePhalanx = [
  [
    [186, 878, 187, 892],
    null,
    [187, 894, 188, 902],
  ],
  [
    [178, 884, 179, 894],
    [179, 896, 179, 901],
    [179, 903, 180, 908],
  ],
  [
    [170, 882, 171, 892],
    [171, 894, 171, 899],
    [171, 901, 172, 906],
  ],
  [
    [162, 878, 163, 888],
    [163, 890, 163, 895],
    [163, 897, 164, 901],
  ],
  [
    [154, 874, 155, 884],
    [155, 886, 155, 890],
    [155, 892, 156, 896],
  ],
] as (number[] | null)[][];

mtGeom.forEach((g, i) => {
  side.push({
    base: `metatarsal-${i + 1}`,
    name: `Metatarsal ${ROMAN[i]}`,
    region: "foot",
    category: "metatarsal",
    d: shaft(g.x1, g.y1, g.w1, g.x2, g.y2, g.w2),
  });
});

toePhalanx.forEach((toe, di) => {
  toe.forEach((seg, pi) => {
    if (!seg) return;
    side.push({
      base: `${PHX_KEY[pi]}-phalanx-foot-${di + 1}`,
      name: `${PHX_LABEL[pi]} Phalanx ${ROMAN[di]} (${TOE_NAMES[di]})`,
      region: "foot",
      category: "phalanx",
      parentBase: `metatarsal-${di + 1}`,
      d: phalanxPath(seg, pi, 0.2),
    });
  });
});

// ribs (both sides, generated from the right hemithorax)
Array.from({ length: 12 }).forEach((_, i) => {
  side.push({
    base: `rib-${i + 1}`,
    name: `Rib ${i + 1}`,
    region: "thorax",
    category: i < 7 ? "true-rib" : i < 10 ? "false-rib" : "floating-rib",
    d: ribPath(i),
  });
});

/* ------------------------------------------------------------------ */
/* assembled dataset                                                   */
/* ------------------------------------------------------------------ */

const midlineShapes: BoneShape[] = midline.map((b) => ({
  ...b,
  side: "midline",
  mirrored: false,
}));

const sideShapes: BoneShape[] = side.flatMap((b) =>
  (["right", "left"] as const).map((s) => ({
    id: `${s}-${b.base}`,
    name: `${s === "left" ? "Left" : "Right"} ${b.name}`,
    region: b.region,
    side: s,
    category: b.category,
    ...(b.parentBase ? { parentId: `${s}-${b.parentBase}` } : {}),
    d: b.d,
    mirrored: s === "left",
  })),
);

export const BONES: BoneShape[] = [...midlineShapes, ...sideShapes];

export const BONE_MAP: Record<string, BoneShape> = Object.fromEntries(
  BONES.map((b) => [b.id, b]),
);

export const REGIONS: { id: BoneRegion; label: string }[] = [
  { id: "skull", label: "Skull" },
  { id: "spine", label: "Spine" },
  { id: "thorax", label: "Thorax" },
  { id: "upper-limb", label: "Upper limb" },
  { id: "hand", label: "Hand" },
  { id: "pelvis", label: "Pelvis" },
  { id: "lower-limb", label: "Lower limb" },
  { id: "foot", label: "Foot" },
];

export const getBone = (id: string): BoneShape | undefined => BONE_MAP[id];

export const searchBones = (query: string): BoneShape[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return BONES.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.id.includes(q.replace(/\s+/g, "-")) ||
      b.category.includes(q),
  ).slice(0, 40);
};
