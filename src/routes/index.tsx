import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AgeGroupSelector } from "@/components/skeleton/AgeGroupSelector";
import { SkeletonViewer } from "@/components/skeleton/SkeletonViewer";
import { ViewSelector } from "@/components/skeleton/ViewSelector";
import { useBoneSelection } from "@/components/skeleton/useBoneSelection";
import { ANATOMY, searchAnatomy, type AnatomicalStructure } from "@/data/anatomy";
import { REGIONS, type BoneRegion } from "@/data/bones";
import { getAgeGroupIds, getVisibleIds } from "@/data/skeletonGeometry";
import type { SkeletonAgeGroup, SkeletonView } from "@/types/bone";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Interactive Human Skeleton — Four Anatomical Views" },
      {
        name: "description",
        content:
          "An anatomical bone map with anterior, posterior and lateral views where every one of the 200+ human bones is an individually clickable, searchable and keyboard-accessible SVG element.",
      },
      { property: "og:title", content: "Interactive Human Skeleton — Four Anatomical Views" },
      {
        property: "og:description",
        content:
          "Select single or multiple bones, search by name, filter by region, switch between anterior, posterior and lateral views, zoom and pan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SkeletonPage,
});

const VIEW_LABEL: Record<SkeletonView, string> = {
  anterior: "anterior view",
  posterior: "posterior view",
  "left-lateral": "left lateral view",
  "right-lateral": "right lateral view",
};

function SkeletonPage() {
  // selection is anatomical — it survives both view and age-group changes
  const { selectedIds, selectedBones, toggle, clear } = useBoneSelection();
  const [view, setView] = useState<SkeletonView>("anterior");
  const [ageGroup, setAgeGroup] = useState<SkeletonAgeGroup>("adult");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<BoneRegion | "all">("all");
  const [hovered, setHovered] = useState<AnatomicalStructure | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const visibleIds = useMemo(() => new Set(getVisibleIds(ageGroup, view)), [ageGroup, view]);
  const ageIds = useMemo(() => getAgeGroupIds(ageGroup), [ageGroup]);

  const disabledIds = useMemo(
    () => (region === "all" ? [] : ANATOMY.filter((b) => b.region !== region).map((b) => b.id)),
    [region],
  );

  const results = useMemo(() => searchAnatomy(query, ageIds), [query, ageIds]);

  const handleBoneClick = (bone: AnatomicalStructure) => {
    // Example observation payload — identity is the anatomical id; age group
    // and view are only context.
    console.log("onBoneClick", {
      boneId: bone.id,
      name: bone.name,
      region: bone.region,
      side: bone.side,
      category: bone.category,
      structureType: bone.structureType ?? "bone",
      ageGroup,
      view,
    });
    toggle(bone.id);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">Interactive Human Skeleton</h1>
          <p className="app-subtitle">
            {ageIds.size} independently selectable structures · {ageGroup} · {VIEW_LABEL[view]} ·{" "}
            {visibleIds.size} visible here
          </p>
        </div>
        <div className="header-actions">
          <span className="count-pill">{selectedIds.length} selected</span>
          <button type="button" className="btn-ghost" onClick={clear} disabled={!selectedIds.length}>
            Clear selection
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="stage-panel" aria-label="Skeleton diagram">
          <AgeGroupSelector value={ageGroup} onChange={setAgeGroup} />
          <ViewSelector value={view} onChange={setView} />
          <SkeletonViewer
            view={view}
            ageGroup={ageGroup}
            selectedIds={selectedIds}
            disabledIds={disabledIds}
            highlightedId={highlightedId}
            onBoneClick={handleBoneClick}
            onBoneHover={setHovered}
          />
        </section>


        <aside className="side-panel">
          <div className="panel-block">
            <label className="field-label" htmlFor="bone-search">
              Search bone
            </label>
            <input
              id="bone-search"
              className="text-input"
              placeholder="Search bone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <ul className="result-list">
                {results.length === 0 && <li className="result-empty">No matching bone</li>}
                {results.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      className={`result-item ${selectedIds.includes(b.id) ? "is-on" : ""}`}
                      onMouseEnter={() => setHighlightedId(b.id)}
                      onMouseLeave={() => setHighlightedId(null)}
                      onClick={() => toggle(b.id)}
                    >
                      <span>{b.name}</span>
                      <span className="result-region">{b.region}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel-block">
            <span className="field-label">Region filter</span>
            <div className="chip-row">
              <button
                type="button"
                className={`chip ${region === "all" ? "is-on" : ""}`}
                onClick={() => setRegion("all")}
              >
                All
              </button>
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`chip ${region === r.id ? "is-on" : ""}`}
                  onClick={() => setRegion(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-block grow">
            <span className="field-label">
              Selected bones {selectedBones.length > 0 && `(${selectedBones.length})`}
            </span>
            {selectedBones.length === 0 ? (
              <p className="empty-note">
                Click a bone in the diagram to add it here. Click it again to remove it.
              </p>
            ) : (
              <ul className="selected-list">
                {selectedBones.map((b) => (
                  <li key={b.id} className="selected-item">
                    <div>
                      <p className="selected-name">{b.name}</p>
                      <p className="selected-meta">
                        {b.region} · {b.side} · {b.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      aria-label={`Remove ${b.name}`}
                      onClick={() => toggle(b.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="hover-readout" aria-live="polite">
            {hovered ? hovered.name : "Hover a bone to see its anatomical name"}
          </div>
        </aside>
      </main>
    </div>
  );
}
