/**
 * Developmental structures that only exist in the growing skeleton.
 *
 * These are NOT variants of adult bones: a growth plate is a clinically
 * distinct structure, so it gets its own stable anatomical id
 * (`left-distal-femoral-physis`) and its own metadata. Ids never encode the
 * age group or the view.
 */
import type { Bone, BoneRegion } from "@/data/bones";

type SideDef = {
  base: string;
  name: string;
  region: BoneRegion;
  category: string;
  parentBase: string;
  ageGroups: readonly ("infant" | "child" | "adolescent")[];
};

const PHYSES: SideDef[] = [
  {
    base: "proximal-humeral-physis",
    name: "Proximal Humeral Physis",
    region: "upper-limb",
    category: "physis",
    parentBase: "humerus",
    ageGroups: ["infant", "child", "adolescent"],
  },
  {
    base: "distal-radial-physis",
    name: "Distal Radial Physis",
    region: "upper-limb",
    category: "physis",
    parentBase: "radius",
    ageGroups: ["infant", "child", "adolescent"],
  },
  {
    base: "distal-femoral-physis",
    name: "Distal Femoral Physis",
    region: "lower-limb",
    category: "physis",
    parentBase: "femur",
    ageGroups: ["infant", "child", "adolescent"],
  },
  {
    base: "proximal-tibial-physis",
    name: "Proximal Tibial Physis",
    region: "lower-limb",
    category: "physis",
    parentBase: "tibia",
    ageGroups: ["infant", "child", "adolescent"],
  },
  {
    base: "distal-tibial-physis",
    name: "Distal Tibial Physis",
    region: "lower-limb",
    category: "physis",
    parentBase: "tibia",
    ageGroups: ["infant", "child", "adolescent"],
  },
  {
    base: "triradiate-cartilage",
    name: "Triradiate Cartilage",
    region: "pelvis",
    category: "growth-cartilage",
    parentBase: "ilium",
    ageGroups: ["infant", "child", "adolescent"],
  },
  {
    base: "capital-femoral-ossification-center",
    name: "Capital Femoral Ossification Centre",
    region: "lower-limb",
    category: "ossification-center",
    parentBase: "femur",
    ageGroups: ["infant", "child"],
  },
];

const MIDLINE: Bone[] = [
  {
    id: "anterior-fontanelle",
    name: "Anterior Fontanelle",
    region: "skull",
    side: "midline",
    category: "fontanelle",
    structureType: "fontanelle",
    parentId: "frontal",
    ageGroups: ["infant"],
  },
  {
    id: "posterior-fontanelle",
    name: "Posterior Fontanelle",
    region: "skull",
    side: "midline",
    category: "fontanelle",
    structureType: "fontanelle",
    parentId: "occipital",
    ageGroups: ["infant"],
  },
  {
    id: "metopic-suture",
    name: "Metopic Suture",
    region: "skull",
    side: "midline",
    category: "suture",
    structureType: "fontanelle",
    parentId: "frontal",
    ageGroups: ["infant", "child"],
  },
];

export const PEDIATRIC_STRUCTURES: Bone[] = [
  ...MIDLINE,
  ...PHYSES.flatMap((p) =>
    (["right", "left"] as const).map<Bone>((side) => ({
      id: `${side}-${p.base}`,
      name: `${side === "left" ? "Left" : "Right"} ${p.name}`,
      region: p.region,
      side,
      category: p.category,
      parentId: `${side}-${p.parentBase}`,
      structureType: p.category === "ossification-center" ? "ossification-center" : "physis",
      ageGroups: p.ageGroups,
    })),
  ),
];

export const PEDIATRIC_STRUCTURE_IDS = new Set(PEDIATRIC_STRUCTURES.map((s) => s.id));
