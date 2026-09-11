/**
 * Placeholder clinical model.
 *
 * Records are keyed by the ANATOMICAL id only (`left-femur`,
 * `left-distal-femoral-physis`). Age group and view are context on the
 * observation, never part of its identity — never store SVG path ids, DOM
 * ids, view-specific ids, coordinates or screen positions.
 */
import type { SkeletonAgeGroup, SkeletonView } from "@/types/bone";

export type ConditionType =
  | "fracture"
  | "arthritis"
  | "lesion"
  | "implant"
  | "osteoporosis"
  | "growth-arrest"
  | "developmental"
  | "other";

export type ConditionSeverity = "mild" | "moderate" | "severe";

export type BoneCondition = {
  type: ConditionType;
  severity: ConditionSeverity;
  diagnosedAt?: string;
};

/** Context an observation was recorded in — descriptive, not identifying. */
export type ObservationContext = {
  ageGroup?: SkeletonAgeGroup;
  view?: SkeletonView;
  recordedAt?: string;
};

export type BoneClinicalRecord = {
  /** anatomical id, stable across every view and age group */
  boneId: string;
  conditions: BoneCondition[];
  context?: ObservationContext;
  notes?: string;
};

export type ClinicalChart = Record<string, BoneClinicalRecord>;
