import { SKELETON_VIEWS, type SkeletonView } from "@/types/bone";

export function ViewSelector({
  value,
  onChange,
}: {
  value: SkeletonView;
  onChange: (view: SkeletonView) => void;
}) {
  return (
    <div className="view-selector" role="tablist" aria-label="Skeleton view">
      {SKELETON_VIEWS.map((v) => (
        <button
          key={v.id}
          type="button"
          role="tab"
          aria-selected={value === v.id}
          className={`view-btn ${value === v.id ? "is-on" : ""}`}
          onClick={() => onChange(v.id)}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
