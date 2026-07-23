import { Text } from "@/lib/db/db";

// Describes which subset of the (unannotated) texts a run should cover.
export type RunSelection =
  | { mode: "all" }
  | { mode: "first"; n: number }
  | { mode: "last"; n: number }
  | { mode: "random"; n: number }
  | { mode: "list"; filenames: string[] };

/**
 * Apply a RunSelection to a list of candidate texts (assumed already sorted by
 * filename). Returns the chosen subset plus, for "list" mode, any pasted
 * filenames that didn't match a candidate.
 */
export function selectRunSubset(
  texts: Text[],
  selection: RunSelection
): { selected: Text[]; unmatched: string[] } {
  switch (selection.mode) {
    case "first": {
      const n = Math.max(0, Math.floor(selection.n));
      return { selected: texts.slice(0, n), unmatched: [] };
    }
    case "last": {
      const n = Math.max(0, Math.floor(selection.n));
      return {
        selected: n >= texts.length ? [...texts] : texts.slice(texts.length - n),
        unmatched: [],
      };
    }
    case "random": {
      const n = Math.max(0, Math.floor(selection.n));
      const shuffled = [...texts];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { selected: shuffled.slice(0, n), unmatched: [] };
    }
    case "list": {
      const byName = new Map(texts.map((t) => [t.filename.trim(), t]));
      const seen = new Set<string>();
      const selected: Text[] = [];
      const unmatched: string[] = [];
      for (const raw of selection.filenames) {
        const name = raw.trim();
        if (!name || seen.has(name)) continue;
        seen.add(name);
        const match = byName.get(name);
        if (match) selected.push(match);
        else unmatched.push(name);
      }
      return { selected, unmatched };
    }
    case "all":
    default:
      return { selected: [...texts], unmatched: [] };
  }
}

// Split a pasted blob of filenames (newline- or comma-separated) into a list.
export function parseFilenameList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
