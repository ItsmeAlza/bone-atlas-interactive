import type { MouseEvent } from "react";
import { BONES, VIEWBOX, type BoneRegion, type BoneShape } from "@/data/bones";
import { Bone } from "./Bone";

export type SkeletonProps = {
  selectedIds: string[];
  disabledIds?: string[];
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

function RegionGroup({
  region,
  bones,
  ...rest
}: { region: BoneRegion; bones: BoneShape[] } & Omit<SkeletonProps, "onBoneHover"> & {
    onBoneHover?: SkeletonProps["onBoneHover"];
  }) {
  const { selectedIds, disabledIds = [], highlightedId, onBoneClick, onBoneHover } = rest;
  return (
    <g data-region-group={region}>
      {bones.map((bone) => (
        <Bone
          key={bone.id}
          bone={bone}
          selected={selectedIds.includes(bone.id)}
          disabled={disabledIds.includes(bone.id)}
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
  bones,
  mirrored,
  props,
}: {
  bones: BoneShape[];
  mirrored: boolean;
  props: SkeletonProps;
}) {
  return (
    <g
      transform={mirrored ? `translate(${VIEWBOX.width},0) scale(-1,1)` : undefined}
      data-layer={mirrored ? "left" : "right-and-midline"}
    >
      {REGION_ORDER.map((region) => {
        const regionBones = bones.filter((b) => b.region === region);
        if (!regionBones.length) return null;
        return <RegionGroup key={region} region={region} bones={regionBones} {...props} />;
      })}
    </g>
  );
}

/** The full skeleton: every bone is its own <path> with a unique DOM id. */
export function Skeleton(props: SkeletonProps) {
  const rightAndMid = BONES.filter((b) => !b.mirrored);
  const left = BONES.filter((b) => b.mirrored);

  return (
    <g role="group" aria-label="Human skeleton">
      <Layer bones={rightAndMid} mirrored={false} props={props} />
      <Layer bones={left} mirrored props={props} />
    </g>
  );
}
