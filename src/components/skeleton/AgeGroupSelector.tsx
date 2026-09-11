import { SKELETON_AGE_GROUPS, type SkeletonAgeGroup } from "@/types/bone";

/** Age group is an independent axis: it changes the drawing, never the ids. */
export function AgeGroupSelector({
  value,
  onChange,
}: {
  value: SkeletonAgeGroup;
  onChange: (age: SkeletonAgeGroup) => void;
}) {
  return (
    <div className="age-selector" role="tablist" aria-label="Skeletal age group">
      {SKELETON_AGE_GROUPS.map((a) => (
        <button
          key={a.id}
          type="button"
          role="tab"
          aria-selected={value === a.id}
          className={`age-btn ${value === a.id ? "is-on" : ""}`}
          onClick={() => onChange(a.id)}
        >
          <span className="age-btn-label">{a.label}</span>
          <span className="age-btn-note">{a.note}</span>
        </button>
      ))}
    </div>
  );
}
