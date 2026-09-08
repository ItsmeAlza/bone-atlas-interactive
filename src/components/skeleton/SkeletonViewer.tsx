import { useCallback, useRef, useState, type MouseEvent, type WheelEvent } from "react";
import { VIEWBOX, type BoneShape } from "@/data/bones";
import { Skeleton, type SkeletonProps } from "./Skeleton";

type ViewerProps = Omit<SkeletonProps, "onBoneHover"> & {
  onBoneHover?: (bone: BoneShape | null) => void;
};

const MIN = 0.5;
const MAX = 6;

/** Zoom + pan wrapper around the skeleton, with a hover tooltip. */
export function SkeletonViewer({ onBoneHover, ...skeletonProps }: ViewerProps) {
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);
  const dragging = useRef<{ x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const zoomBy = (factor: number) =>
    setView((v) => ({ ...v, scale: Math.min(MAX, Math.max(MIN, v.scale * factor)) }));

  const reset = () => setView({ scale: 1, x: 0, y: 0 });

  const onWheel = (e: WheelEvent) => {
    if (!e.ctrlKey && Math.abs(e.deltaY) < 1) return;
    zoomBy(e.deltaY < 0 ? 1.08 : 0.93);
  };

  const onPointerDown = (e: MouseEvent) => {
    dragging.current = { x: e.clientX - view.x, y: e.clientY - view.y };
  };
  const onPointerMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    setView((v) => ({ ...v, x: e.clientX - dragging.current!.x, y: e.clientY - dragging.current!.y }));
  };
  const endDrag = () => {
    dragging.current = null;
  };

  const handleHover = useCallback(
    (bone: BoneShape | null, event?: MouseEvent) => {
      onBoneHover?.(bone);
      if (!bone) return setTooltip(null);
      const rect = wrapRef.current?.getBoundingClientRect();
      const cx = event?.clientX ?? 0;
      const cy = event?.clientY ?? 0;
      setTooltip({
        name: bone.name,
        x: cx - (rect?.left ?? 0),
        y: cy - (rect?.top ?? 0),
      });
    },
    [onBoneHover],
  );

  return (
    <div ref={wrapRef} className="skeleton-stage">
      <div className="skeleton-toolbar">
        <button type="button" onClick={() => zoomBy(1.25)} aria-label="Zoom in" className="tool-btn">
          +
        </button>
        <button type="button" onClick={() => zoomBy(0.8)} aria-label="Zoom out" className="tool-btn">
          –
        </button>
        <button type="button" onClick={reset} className="tool-btn tool-btn-wide">
          Reset
        </button>
        <span className="zoom-readout">{Math.round(view.scale * 100)}%</span>
      </div>

      <div
        className="skeleton-canvas"
        onWheel={onWheel}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={endDrag}
        onMouseLeave={() => {
          endDrag();
          setTooltip(null);
        }}
      >
        <svg
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          className="skeleton-svg"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
          aria-label="Interactive human skeleton"
        >
          <Skeleton {...skeletonProps} onBoneHover={handleHover} />
        </svg>

        {tooltip && (
          <div className="bone-tooltip" style={{ left: tooltip.x + 14, top: tooltip.y + 12 }} role="status">
            {tooltip.name}
          </div>
        )}
      </div>
      <p className="stage-hint">Drag to pan · scroll to zoom · Tab + Enter to select with the keyboard</p>
    </div>
  );
}
