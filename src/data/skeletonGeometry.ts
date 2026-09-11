/**
 * Geometry registry: (age group, view) -> shapes.
 *
 * Identity, age group, view and SVG geometry are four separate concepts.
 * This module is the only place that maps the last three onto the first.
 */
import { VIEW_GEOMETRY } from "@/data/skeletonViews";
import { PEDIATRIC_GEOMETRY } from "@/data/pediatricViews";
import type { SkeletonAgeGroup, SkeletonView, ViewShape } from "@/types/bone";

export const GEOMETRY: Record<SkeletonAgeGroup, Record<SkeletonView, ViewShape[]>> = {
  adult: VIEW_GEOMETRY,
  infant: PEDIATRIC_GEOMETRY.infant,
  child: PEDIATRIC_GEOMETRY.child,
  adolescent: PEDIATRIC_GEOMETRY.adolescent,
};

export const getGeometry = (ageGroup: SkeletonAgeGroup, view: SkeletonView): ViewShape[] =>
  GEOMETRY[ageGroup]?.[view] ?? GEOMETRY.adult.anterior;

/** Structures actually drawn — and therefore selectable — for this age + view. */
export const getVisibleIds = (ageGroup: SkeletonAgeGroup, view: SkeletonView): string[] =>
  Array.from(new Set(getGeometry(ageGroup, view).map((s) => s.id)));

/** Structures that exist anywhere in this age group, across all four views. */
export const getAgeGroupIds = (ageGroup: SkeletonAgeGroup): Set<string> => {
  const set = new Set<string>();
  (Object.values(GEOMETRY[ageGroup]) as ViewShape[][]).forEach((shapes) =>
    shapes.forEach((s) => set.add(s.id)),
  );
  return set;
};
