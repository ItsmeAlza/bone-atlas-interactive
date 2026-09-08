import type { KeyboardEvent, MouseEvent } from "react";
import type { BoneShape } from "@/data/bones";

export type BoneProps = {
  bone: BoneShape;
  selected: boolean;
  disabled?: boolean;
  highlighted?: boolean;
  onSelect: (bone: BoneShape) => void;
  onHoverStart?: (bone: BoneShape, event: MouseEvent) => void;
  onHoverEnd?: (bone: BoneShape) => void;
};

/**
 * A single, independently addressable bone. Holds no selection state:
 * everything is driven by props from the owning <Skeleton />.
 */
export function Bone({
  bone,
  selected,
  disabled = false,
  highlighted = false,
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
      id={bone.id}
      data-bone-id={bone.id}
      data-region={bone.region}
      data-side={bone.side}
      d={bone.d}
      className={[
        "bone",
        selected ? "is-selected" : "",
        disabled ? "is-disabled" : "",
        highlighted ? "is-highlighted" : "",
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
