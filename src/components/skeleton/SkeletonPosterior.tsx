import { Skeleton, type SkeletonProps } from "./Skeleton";

/** Back-facing anatomical view: spinous processes, scapulae, calcanei. */
export function SkeletonPosterior(props: Omit<SkeletonProps, "view">) {
  return <Skeleton {...props} view="posterior" />;
}
