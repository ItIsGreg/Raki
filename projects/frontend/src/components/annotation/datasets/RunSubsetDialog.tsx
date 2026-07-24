import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Text } from "@/lib/db/db";
import {
  RunSelection,
  selectRunSubset,
  parseFilenameList,
} from "../utils/runSelection";

type Mode = "first" | "last" | "random" | "list" | "select";

interface RunSubsetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateTexts: Text[];
  onRun: (selection: RunSelection) => void;
}

export function RunSubsetDialog({
  open,
  onOpenChange,
  candidateTexts,
  onRun,
}: RunSubsetDialogProps) {
  const [mode, setMode] = useState<Mode>("first");
  const [n, setN] = useState("10");
  const [listText, setListText] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const selection = useMemo<RunSelection>(() => {
    if (mode === "list") {
      return { mode: "list", filenames: parseFilenameList(listText) };
    }
    if (mode === "select") {
      // A checkbox list is just a filename list built by clicking.
      return { mode: "list", filenames: Array.from(checked) };
    }
    return { mode, n: parseInt(n, 10) || 0 };
  }, [mode, n, listText, checked]);

  const filtered = useMemo(
    () =>
      search.trim()
        ? candidateTexts.filter((t) =>
            t.filename.toLowerCase().includes(search.trim().toLowerCase())
          )
        : candidateTexts,
    [candidateTexts, search]
  );

  const toggle = (filename: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });

  const { selected, unmatched } = useMemo(
    () => selectRunSubset(candidateTexts, selection),
    [candidateTexts, selection]
  );

  const runNow = () => {
    onRun(selection);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-cy="run-subset-dialog">
        <DialogHeader>
          <DialogTitle>Run a subset</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label>How to select</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger data-cy="run-subset-mode-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first" data-cy="run-subset-mode-first">
                  First N
                </SelectItem>
                <SelectItem value="last" data-cy="run-subset-mode-last">
                  Last N
                </SelectItem>
                <SelectItem value="random" data-cy="run-subset-mode-random">
                  Random N
                </SelectItem>
                <SelectItem value="list" data-cy="run-subset-mode-list">
                  Paste filenames
                </SelectItem>
                <SelectItem value="select" data-cy="run-subset-mode-select">
                  Select from list
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "select" ? (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Search filenames…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-cy="run-subset-search"
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{checked.size} selected</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="underline"
                    data-cy="run-subset-select-all"
                    onClick={() =>
                      setChecked((prev) => {
                        const next = new Set(prev);
                        filtered.forEach((t) => next.add(t.filename));
                        return next;
                      })
                    }
                  >
                    Select all{search.trim() ? " (filtered)" : ""}
                  </button>
                  <button
                    type="button"
                    className="underline"
                    data-cy="run-subset-clear"
                    onClick={() => setChecked(new Set())}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <ScrollArea className="h-48 rounded-md border">
                <div
                  className="flex flex-col gap-1 p-2"
                  data-cy="run-subset-checklist"
                >
                  {filtered.map((t) => (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={checked.has(t.filename)}
                        onCheckedChange={() => toggle(t.filename)}
                        data-cy={`run-subset-check-${t.filename}`}
                      />
                      <span className="truncate">{t.filename}</span>
                    </label>
                  ))}
                  {filtered.length === 0 && (
                    <span className="text-sm text-gray-400">No matching texts.</span>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : mode !== "list" ? (
            <div className="flex flex-col gap-1">
              <Label>Number of texts</Label>
              <Input
                type="number"
                min={1}
                value={n}
                onChange={(e) => setN(e.target.value)}
                data-cy="run-subset-n"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Label>Filenames (one per line or comma-separated)</Label>
              <Textarea
                rows={5}
                value={listText}
                onChange={(e) => setListText(e.target.value)}
                placeholder="report-001.txt, report-002.txt"
                data-cy="run-subset-list"
              />
            </div>
          )}

          <p className="text-sm text-gray-500" data-cy="run-subset-count">
            Will annotate {selected.length} of {candidateTexts.length} remaining
            text{candidateTexts.length === 1 ? "" : "s"}.
            {mode === "list" && unmatched.length > 0 && (
              <span className="text-amber-600">
                {" "}
                {unmatched.length} filename
                {unmatched.length === 1 ? "" : "s"} didn&apos;t match.
              </span>
            )}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={runNow}
            disabled={selected.length === 0}
            data-cy="run-subset-confirm"
          >
            Run {selected.length} text{selected.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
