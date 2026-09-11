import type { KeyboardEvent, MouseEvent } from "react";
import type { AnatomicalStructure } from "@/data/anatomy";
import type { SkeletonAgeGroup, SkeletonView } from "@/types/bone";

export type BoneProps = {
  bone: AnatomicalStructure;
  /** geometry for the current (age group, view) */
  d?: string;
  view?: SkeletonView;
  ageGroup?: SkeletonAgeGroup;
  selected: boolean;
  disabled?: boolean;
  highlighted?: boolean;
  /** clinical flag, e.g. a fracture recorded against this anatomical id */
  flagged?: boolean;
  onSelect: (bone: AnatomicalStructure) => void;
  onHoverStart?: (bone: AnatomicalStructure, event: MouseEvent) => void;
  onHoverEnd?: (bone: AnatomicalStructure) => void;
};

/**
 * A single, independently addressable anatomical structure. The DOM id is the
 * anatomical id (`left-femur`) in every view and every age group; view and age
 * travel as separate data attributes.
 */
export function Bone({
  bone,
  d,
  view = "anterior",
  ageGroup = "adult",
  selected,
  disabled = false,
  highlighted = false,
  flagged = false,
  onSelect,
  onHoverStart,
  onHoverEnd,
}: BoneProps) {
  const kind = bone.structureType ?? "bone";

  const handleKeyDown = (event: KeyboardEvent<SVGPathElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(bone);
    }
  };

  return (
    <path
      id={bone.id}
      data-bone-id={bone.id}
      data-view={view}
      data-age-group={ageGroup}
      data-structure-type={kind}
      data-region={bone.region}
      data-side={bone.side}
      d={d ?? bone.d}
      className={[
        "bone",
        `is-${kind}`,
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
