import { useCallback, useMemo, useState } from "react";
import { ANATOMY_MAP, type AnatomicalStructure } from "@/data/anatomy";

/**
 * Selection is ANATOMICAL: it survives view changes and age-group changes,
 * because it only ever holds anatomical ids.
 */
export function useBoneSelection(initial: string[] = []) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initial);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const select = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const clear = useCallback(() => setSelectedIds([]), []);

  const selectedBones = useMemo(
    () => selectedIds.map((id) => ANATOMY_MAP[id]).filter(Boolean) as AnatomicalStructure[],
    [selectedIds],
  );

  return { selectedIds, selectedBones, toggle, select, clear, setSelectedIds };
}
