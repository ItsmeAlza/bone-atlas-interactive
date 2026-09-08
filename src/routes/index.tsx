import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SkeletonViewer } from "@/components/skeleton/SkeletonViewer";
import { useBoneSelection } from "@/components/skeleton/useBoneSelection";
import { BONES, REGIONS, searchBones, type BoneRegion, type BoneShape } from "@/data/bones";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Interactive Human Skeleton — Clickable Bone Map" },
      {
        name: "description",
        content:
          "An anatomical bone map where every one of the 200+ human bones is an individually clickable, searchable and keyboard-accessible SVG element.",
      },
      { property: "og:title", content: "Interactive Human Skeleton — Clickable Bone Map" },
      {
        property: "og:description",
        content:
          "Select single or multiple bones, search by name, filter by region, zoom and pan an anatomically laid-out SVG skeleton.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SkeletonPage,
});

function SkeletonPage() {
  const { selectedIds, selectedBones, toggle, clear } = useBoneSelection();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<BoneRegion | "all">("all");
  const [hovered, setHovered] = useState<BoneShape | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const disabledIds = useMemo(
    () => (region === "all" ? [] : BONES.filter((b) => b.region !== region).map((b) => b.id)),
    [region],
  );

  const results = useMemo(() => searchBones(query), [query]);

  const handleBoneClick = (bone: BoneShape) => {
    // Example callback payload — { id, name, region, side, category }
    console.log("onBoneClick", {
      id: bone.id,
      name: bone.name,
      region: bone.region,
      side: bone.side,
      category: bone.category,
    });
    toggle(bone.id);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">Interactive Human Skeleton</h1>
          <p className="app-subtitle">
            {BONES.length} independently selectable bones · anterior view
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
          <SkeletonViewer
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
