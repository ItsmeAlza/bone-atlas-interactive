/**
 * The single anatomical registry.
 *
 * Anatomical identity (id, name, region, side) lives here and here only.
 * Geometry lives in the view/age-group geometry modules and is looked up by
 * this id, so a clinical record written against `left-femur` stays valid for
 * every view and every age group.
 */
import { BONES, type Bone, type BoneShape } from "@/data/bones";
import { PEDIATRIC_STRUCTURES } from "@/data/pediatricStructures";
import type { SkeletonAgeGroup } from "@/types/bone";

/** A selectable anatomical structure: an adult bone or a developmental structure. */
export type AnatomicalStructure = Bone & { d?: string; mirrored?: boolean };

export const ANATOMY: AnatomicalStructure[] = [...BONES, ...PEDIATRIC_STRUCTURES];

export const ANATOMY_MAP: Record<string, AnatomicalStructure> = Object.fromEntries(
  ANATOMY.map((s) => [s.id, s]),
);

export const getStructure = (id: string): AnatomicalStructure | undefined => ANATOMY_MAP[id];

export const structureType = (s: AnatomicalStructure) => s.structureType ?? "bone";

/** True when the structure exists at all in the given age group. */
export const existsInAgeGroup = (s: AnatomicalStructure, age: SkeletonAgeGroup) =>
  !s.ageGroups || s.ageGroups.includes(age);

export const searchAnatomy = (query: string, within?: Set<string>): AnatomicalStructure[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ANATOMY.filter(
    (s) =>
      (!within || within.has(s.id)) &&
      (s.name.toLowerCase().includes(q) ||
        s.id.includes(q.replace(/\s+/g, "-")) ||
        s.category.includes(q)),
  ).slice(0, 40);
};

export type { BoneShape };
