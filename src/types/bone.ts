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

/** Geometry for one bone inside one view. `id` matches the central bone metadata. */
export type ViewShape = {
  id: string;
  d: string;
  /** rendered inside the mirrored group (used by anterior/posterior only) */
  mirrored: boolean;
  /** far-side structures in lateral views are drawn behind, at lower contrast */
  layer: "near" | "far";
};
