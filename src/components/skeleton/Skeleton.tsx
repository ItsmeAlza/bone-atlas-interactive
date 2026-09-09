import type { MouseEvent } from "react";
import { BONE_MAP, VIEWBOX, type BoneRegion, type BoneShape } from "@/data/bones";
import { getViewShapes } from "@/data/skeletonViews";
import type { SkeletonView, ViewShape } from "@/types/bone";
import { Bone } from "./Bone";

export type SkeletonProps = {
  view?: SkeletonView;
  selectedIds: string[];
  disabledIds?: string[];
  flaggedIds?: string[];
  highlightedId?: string | null;
  onBoneClick: (bone: BoneShape) => void;
  onBoneHover?: (bone: BoneShape | null, event?: MouseEvent) => void;
};

const REGION_ORDER: BoneRegion[] = [
  "pelvis",
  "thorax",
  "spine",
  "skull",
  "upper-limb",
  "hand",
  "lower-limb",
  "foot",
];

type Resolved = { shape: ViewShape; bone: BoneShape };

function RegionGroup({
  region,
  items,
  props,
}: {
  region: BoneRegion;
  items: Resolved[];
  props: SkeletonProps;
}) {
  const {
    view = "anterior",
    selectedIds,
    disabledIds = [],
    flaggedIds = [],
    highlightedId,
    onBoneClick,
    onBoneHover,
  } = props;
  return (
    <g data-region-group={region}>
      {items.map(({ shape, bone }) => (
        <Bone
          key={`${shape.layer}-${bone.id}`}
          bone={bone}
          d={shape.d}
          view={view}
          selected={selectedIds.includes(bone.id)}
          disabled={disabledIds.includes(bone.id)}
          flagged={flaggedIds.includes(bone.id)}
          highlighted={highlightedId === bone.id}
          onSelect={onBoneClick}
          onHoverStart={(b, e) => onBoneHover?.(b, e)}
          onHoverEnd={() => onBoneHover?.(null)}
        />
      ))}
    </g>
  );
}

function Layer({
  items,
  mirrored,
  props,
  label,
}: {
  items: Resolved[];
  mirrored: boolean;
  props: SkeletonProps;
  label: string;
}) {
  if (!items.length) return null;
  return (
    <g
      transform={mirrored ? `translate(${VIEWBOX.width},0) scale(-1,1)` : undefined}
      data-layer={label}
    >
      {REGION_ORDER.map((region) => {
        const regionItems = items.filter((i) => i.bone.region === region);
        if (!regionItems.length) return null;
        return <RegionGroup key={region} region={region} items={regionItems} props={props} />;
      })}
    </g>
  );
}

/**
 * Renders one anatomical view. Every bone is its own <path>, carrying the
 * view-independent anatomical id in `data-bone-id`.
 */
export function Skeleton(props: SkeletonProps) {
  const view = props.view ?? "anterior";
  const resolved: Resolved[] = getViewShapes(view)
    .map((shape) => ({ shape, bone: BONE_MAP[shape.id] }))
    .filter((r): r is Resolved => Boolean(r.bone));

  const far = resolved.filter((r) => r.shape.layer === "far");
  const near = resolved.filter((r) => r.shape.layer === "near");

  return (
    <g role="group" aria-label={`Human skeleton — ${view.replace("-", " ")} view`} data-view={view}>
      <g className="bone-layer-far">
        <Layer items={far} mirrored={false} props={props} label="far" />
      </g>
      <Layer items={near.filter((r) => !r.shape.mirrored)} mirrored={false} props={props} label="primary" />
      <Layer items={near.filter((r) => r.shape.mirrored)} mirrored props={props} label="mirrored" />
    </g>
  );
}
