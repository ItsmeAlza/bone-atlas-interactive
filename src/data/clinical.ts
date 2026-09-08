/**
 * Placeholder clinical model. The skeleton UI is architected so clinical
 * records can be attached to any bone id later without touching the SVG
 * components: pass a `Record<boneId, BoneClinicalRecord>` down and render
 * status colors / badges from it.
 */

export type ConditionType =
  | "fracture"
  | "arthritis"
  | "lesion"
  | "implant"
  | "osteoporosis"
  | "other";

export type ConditionSeverity = "mild" | "moderate" | "severe";

export type BoneCondition = {
  type: ConditionType;
  severity: ConditionSeverity;
  diagnosedAt?: string;
};

export type BoneClinicalRecord = {
  boneId: string;
  conditions: BoneCondition[];
  notes?: string;
};

export type ClinicalChart = Record<string, BoneClinicalRecord>;
