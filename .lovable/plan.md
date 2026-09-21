# Medical Osteogram refinement

## Goal
Refine the existing Bone Atlas in place into a clinically oriented Osteogram foundation. Preserve stable anatomical IDs, all four views, age-specific geometry, selection, search, filters, zoom/pan, keyboard support, and future observation mapping.

## Current audit baseline
- The adult registry has 202 unique records.
- Missing from the registry: left/right malleus, incus, stapes, and inferior nasal concha (8 records).
- Adding those records produces 210 selectable adult anatomical records because each adult hip bone remains intentionally decomposed into ilium, ischium, and pubis. The interface will not present this as a conventional bone count.
- C1–C7, T1–T12, L1–L5, sacrum, coccyx, 24 ribs, complete hand sets, and complete foot sets already have stable independent IDs.
- Adult anterior and lateral views currently cover all registry IDs. Posterior currently omits frontal, sternum, and both patellae; visibility will be documented rather than silently treated as full coverage.
- Current long bones, carpals, tarsals, and many pediatric structures use generic blob/shaft/box construction and require anatomical refinement.

## Implementation

### 1. Strengthen the anatomical registry
- Add the eight missing adult skull structures with stable side-specific IDs and modern anatomical labels.
- Add metadata that distinguishes conventional adult bones from clinically selectable hip-bone components, including parent/group relationships and count classification.
- Keep all existing IDs unchanged; add validation for duplicate IDs, invalid parents, paired-side consistency, vertebral/rib sequences, hand/foot inventories, and age restrictions.
- Keep clinical records keyed only by anatomical ID, with view and age retained as observation context.

### 2. Replace generic adult geometry with anatomical paths
- Refine adult geometry region by region, prioritizing recognizable silhouettes and landmarks for skull, shoulder girdle, long bones, pelvis, hands, and feet.
- Replace generic circles, rectangles, capsules, and shaft composites in adult views with dedicated path geometry for each selectable structure.
- Keep every structure as an independent SVG path and retain stable IDs across views.
- Author posterior and lateral geometry for their actual projections; do not derive them from anterior transforms. Mirroring remains limited to contralateral instances of the same authored view geometry.
- Represent deeply hidden structures only where a defensible projection can be drawn; track non-visible structures explicitly in the audit rather than adding invisible hit areas.

### 3. Preserve and clarify pediatric anatomy
- Keep infant, child, adolescent, and adult as independent geometry axes sharing the same anatomical registry.
- Preserve current physes, ossification centers, fontanelles, and pediatric selection behavior.
- Remove misleading pediatric details where no defensible representation exists, and record remaining simplified pediatric geometry in the audit.
- Do not imply that pediatric views are anatomically complete.

### 4. Refine the clinical interface
- Rename the working surface to “Osteogram” and remove the “202 bones/structures” claim.
- Arrange controls with clear labeled View and Age segmented selectors, ordered Adult → Adolescent → Child → Infant.
- Keep search, region filters, selected structures, and clear selection in a compact clinical sidebar beside the skeleton.
- Replace text-only zoom controls with familiar icons and tooltips while keeping percentage and reset behavior.
- Use a restrained hospital-oriented neutral palette, visible borders, compact hierarchy, and no decorative background effects.
- Make selected paths use both high contrast and a stronger outline so state is not color-only.
- Preserve small-screen access to every control and readable selected-structure details.

### 5. Rendering and accessibility
- Memoize individual bone paths and use set-based state lookups so selecting one structure does not perform repeated array scans across every path.
- Preserve role, focusability, Enter/Space activation, aria-label, aria-pressed, disabled behavior, hover/focus labels, and visible focus outlines.
- Improve pointer pan handling without interfering with bone selection and retain reduced-motion support.

### 6. Provenance and audit documentation
- Record geometry/reference provenance using public-domain or CC0 sources, led by Gray’s Anatomy public-domain plates and the CC0 Human Body Diagrams skeleton template; do not import copyrighted clinical artwork.
- Add a developer-facing anatomical audit covering: total selectable records, conventional-count caveat, added and missing structures, simplified/grouped structures, per-view coverage, stable-ID consistency, pediatric status, accessibility checks, and changed files.
- State limitations plainly and never label the system “anatomically complete” without evidence.

## Validation
- Run automated registry and four-view consistency tests.
- Check every age/view combination for unique rendered IDs and valid metadata references.
- Verify selection persistence across view and age changes, search/filter behavior, zoom/pan, mouse selection, and Enter/Space selection.
- Inspect desktop and mobile layouts visually for overlap, readability, and control access.
- Confirm the current preview build reports no errors.
