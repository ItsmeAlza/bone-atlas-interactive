import { Skeleton, type SkeletonProps } from "./Skeleton";

/** Front-facing anatomical view. */
export function SkeletonAnterior(props: Omit<SkeletonProps, "view">) {
  return <Skeleton {...props} view="anterior" />;
}
