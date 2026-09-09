import { Skeleton, type SkeletonProps } from "./Skeleton";

/** Profile view of the patient's left side. */
export function SkeletonLeftLateral(props: Omit<SkeletonProps, "view">) {
  return <Skeleton {...props} view="left-lateral" />;
}
