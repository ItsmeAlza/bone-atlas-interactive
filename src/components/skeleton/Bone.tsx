import type { KeyboardEvent, MouseEvent } from "react";
import type { BoneShape, SkeletonView } from "@/types/bone";

export type BoneProps = {
  bone: BoneShape;
  /** view-specific geometry; falls back to the anterior geometry in the metadata */
  d?: string;
  /** which anatomical view this instance belongs to (metadata only — the id never changes) */
  view?: SkeletonView;
  selected: boolean;
  disabled?: boolean;
  highlighted?: boolean;
  /** clinical flag, e.g. a fracture recorded against this bone id */
  flagged?: boolean;
  onSelect: (bone: BoneShape) => void;
  onHoverStart?: (bone: BoneShape, event: MouseEvent) => void;
  onHoverEnd?: (bone: BoneShape) => void;
};

/**
 * A single, independently addressable bone. Holds no selection state:
 * everything is driven by props from the owning skeleton view.
 */
export function Bone({
  bone,
  d,
  view = "anterior",
  selected,
  disabled = false,
  highlighted = false,
  flagged = false,
  onSelect,
  onHoverStart,
  onHoverEnd,
}: BoneProps) {
  const handleKeyDown = (event: KeyboardEvent<SVGPathElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(bone);
    }
  };

  return (
    <path
      id={`${view}-${bone.id}`}
      data-bone-id={bone.id}
      data-view={view}
      data-region={bone.region}
      data-side={bone.side}
      d={d ?? bone.d}
      className={[
        "bone",
        selected ? "is-selected" : "",
        disabled ? "is-disabled" : "",
        highlighted ? "is-highlighted" : "",
        flagged ? "is-flagged" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={bone.name}
      aria-pressed={selected}
      aria-disabled={disabled}
      onClick={() => !disabled && onSelect(bone)}
      onKeyDown={handleKeyDown}
      onMouseEnter={(e) => onHoverStart?.(bone, e)}
      onMouseMove={(e) => onHoverStart?.(bone, e)}
      onMouseLeave={() => onHoverEnd?.(bone)}
      onFocus={() => onHoverStart?.(bone, { clientX: 0, clientY: 0 } as MouseEvent)}
      onBlur={() => onHoverEnd?.(bone)}
    />
  );
}
