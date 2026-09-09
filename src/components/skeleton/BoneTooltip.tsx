export type BoneTooltipProps = { name: string; x: number; y: number };

/** Floating anatomical-name label that follows the pointer. */
export function BoneTooltip({ name, x, y }: BoneTooltipProps) {
  return (
    <div className="bone-tooltip" style={{ left: x + 14, top: y + 12 }} role="status">
      {name}
    </div>
  );
}
