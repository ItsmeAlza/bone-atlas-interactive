/**
 * Shared anatomical types.
 *
 * A bone's identity (`left-femur`) is ANATOMICAL and never encodes a view.
 * The view is separate metadata held by the viewer.
 */
export type { Bone, BoneShape, BoneRegion, BoneSide } from "@/data/bones";

export type SkeletonView = "anterior" | "posterior" | "left-lateral" | "right-lateral";

export const SKELETON_VIEWS: { id: SkeletonView; label: string }[] = [
  { id: "anterior", label: "Anterior" },
  { id: "posterior", label: "Posterior" },
  { id: "left-lateral", label: "Left Lateral" },
  { id: "right-lateral", label: "Right Lateral" },
];

/**
 * Age group is a third, independent axis. It never changes an anatomical id:
 * `left-femur` is the same clinical structure for an infant and an adult.
 */
export type SkeletonAgeGroup = "infant" | "child" | "adolescent" | "adult";

export const SKELETON_AGE_GROUPS: { id: SkeletonAgeGroup; label: string; note: string }[] = [
  { id: "infant", label: "Infant", note: "0–1 y" },
  { id: "child", label: "Child", note: "2–9 y" },
  { id: "adolescent", label: "Adolescent", note: "10–17 y" },
  { id: "adult", label: "Adult", note: "18 y +" },
];

/** A drawing is addressed by (age group, view). Identity is addressed by id only. */
export type GeometryKey = { ageGroup: SkeletonAgeGroup; view: SkeletonView };

/** Kinds of independently selectable anatomical structures. */
export type StructureType = "bone" | "physis" | "ossification-center" | "fontanelle";

/** Geometry for one bone inside one view. `id` matches the central bone metadata. */
export type ViewShape = {
  id: string;
  d: string;
  /** rendered inside the mirrored group (used by anterior/posterior only) */
  mirrored: boolean;
  /** far-side structures in lateral views are drawn behind, at lower contrast */
  layer: "near" | "far";
};
