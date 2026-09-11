import type { MouseEvent } from "react";
import { VIEWBOX, type BoneRegion } from "@/data/bones";
import { ANATOMY_MAP, type AnatomicalStructure } from "@/data/anatomy";
import { getGeometry } from "@/data/skeletonGeometry";
import type { SkeletonAgeGroup, SkeletonView, ViewShape } from "@/types/bone";
import { Bone } from "./Bone";

export type SkeletonProps = {
  view?: SkeletonView;
  ageGroup?: SkeletonAgeGroup;
  selectedIds: string[];
  disabledIds?: string[];
  flaggedIds?: string[];
  highlightedId?: string | null;
  onBoneClick: (bone: AnatomicalStructure) => void;
  onBoneHover?: (bone: AnatomicalStructure | null, event?: MouseEvent) => void;
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

type Resolved = { shape: ViewShape; bone: AnatomicalStructure };

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
    ageGroup = "adult",
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
          ageGroup={ageGroup}
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
 * Renders one (age group, view) pair. Every structure is its own <path>,
 * carrying the age- and view-independent anatomical id in `data-bone-id`.
 */
export function Skeleton(props: SkeletonProps) {
  const view = props.view ?? "anterior";
  const ageGroup = props.ageGroup ?? "adult";
  const resolved: Resolved[] = getGeometry(ageGroup, view)
    .map((shape) => ({ shape, bone: ANATOMY_MAP[shape.id] }))
    .filter((r): r is Resolved => Boolean(r.bone));

  const far = resolved.filter((r) => r.shape.layer === "far");
  const near = resolved.filter((r) => r.shape.layer === "near");

  return (
    <g
      role="group"
      aria-label={`Human skeleton — ${ageGroup}, ${view.replace("-", " ")} view`}
      data-view={view}
      data-age-group={ageGroup}
    >
      <g className="bone-layer-far">
        <Layer items={far} mirrored={false} props={props} label="far" />
      </g>
      <Layer items={near.filter((r) => !r.shape.mirrored)} mirrored={false} props={props} label="primary" />
      <Layer items={near.filter((r) => r.shape.mirrored)} mirrored props={props} label="mirrored" />
    </g>
  );
}
