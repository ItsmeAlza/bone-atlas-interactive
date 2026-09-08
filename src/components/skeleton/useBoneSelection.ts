import { useCallback, useMemo, useState } from "react";
import { BONE_MAP, type BoneShape } from "@/data/bones";

/** Selection state lives here — never inside a <Bone />. */
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
    () => selectedIds.map((id) => BONE_MAP[id]).filter(Boolean) as BoneShape[],
    [selectedIds],
  );

  return { selectedIds, selectedBones, toggle, select, clear, setSelectedIds };
}
