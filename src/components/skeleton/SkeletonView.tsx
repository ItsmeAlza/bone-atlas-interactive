import type { SkeletonAgeGroup, SkeletonView as View } from "@/types/bone";
import type { SkeletonProps } from "./Skeleton";
import { SkeletonAnterior } from "./SkeletonAnterior";
import { SkeletonPosterior } from "./SkeletonPosterior";
import { SkeletonLeftLateral } from "./SkeletonLeftLateral";
import { SkeletonRightLateral } from "./SkeletonRightLateral";

export type SkeletonViewProps = Omit<SkeletonProps, "view"> & {
  view: View;
  ageGroup?: SkeletonAgeGroup;
};

/** Picks the anatomically correct drawing for the requested view and age group. */
export function SkeletonView({ view, ...rest }: SkeletonViewProps) {
  switch (view) {
    case "posterior":
      return <SkeletonPosterior {...rest} />;
    case "left-lateral":
      return <SkeletonLeftLateral {...rest} />;
    case "right-lateral":
      return <SkeletonRightLateral {...rest} />;
    default:
      return <SkeletonAnterior {...rest} />;
  }
}
