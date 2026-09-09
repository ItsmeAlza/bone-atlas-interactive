import { Skeleton, type SkeletonProps } from "./Skeleton";

/** Profile view of the patient's right side. */
export function SkeletonRightLateral(props: Omit<SkeletonProps, "view">) {
  return <Skeleton {...props} view="right-lateral" />;
}
