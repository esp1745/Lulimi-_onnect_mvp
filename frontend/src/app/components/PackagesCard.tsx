import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import api from "@/lib/api";
import type { TeacherPackage } from "@/types";

const EMPTY = { title: "", description: "", hours: "", price: "", savings: "" };

/**
 * Add / remove the teacher's pricing bundles.
 *
 * Shared by the edit-profile page and the dashboard so both stay in step —
 * the dashboard is where teachers spend their time, and packages were
 * previously buried one page away.
 */
export function PackagesCard({
  packages,
  onChanged,
  description,
}: {
  /** Current packages. Omit to have the card load them itself. */
  packages?: TeacherPackage[];
  /** Called after an add or remove so the parent can refetch. */
  onChanged?: () => void | Promise<void>;
  description?: string;
}) {
  const controlled = packages !== undefined;
  const [own, setOwn] = useState<TeacherPackage[]>([]);
  const [draft, setDraft] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const list = controlled ? packages : own;

  const loadOwn = async () => {
    try {
      const { data } = await api.get("/api/teachers/packages/");
      setOwn(data);
    } catch {
      /* an empty list is a fine starting point */
    }
  };

  useEffect(() => {
    if (!controlled) loadOwn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled]);

  const refresh = async () => {
    if (!controlled) await loadOwn();
    await onChanged?.();
  };

  const handleAdd = async () => {
    if (!draft.title.trim() || !draft.hours || !draft.price) {
      toast.error("A package needs a title, hours and a price.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/teachers/packages/", {
        title: draft.title,
        description: draft.description,
        hours: draft.hours,
        price: draft.price,
        savings: draft.savings || null,
      });
      setDraft(EMPTY);
      await refresh();
      toast.success("Package added.");
    } catch {
      toast.error("Could not add package.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await api.delete(`/api/teachers/packages/${id}/`);
      await refresh();
    } catch {
      toast.error("Could not remove package.");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Packages</CardTitle>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {list.length > 0 ? (
          <div className="space-y-2">
            {list.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3 rounded-xl border border-[#1A3A35]/10 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1A3A35]">
                    {p.title} · {p.hours}h · ${p.price}
                    {p.savings && <span className="text-[#2D5A45]"> (save ${p.savings})</span>}
                  </p>
                  {p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(p.id)}
                  aria-label={`Remove ${p.title}`}
                  className="text-gray-400 hover:text-red-500 shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No packages yet. Bundles give learners a reason to book more than one lesson.</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Input
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. 10-hour package"
            className="col-span-2"
          />
          <Input
            value={draft.description}
            onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
            placeholder="Description (optional)"
            className="col-span-2"
          />
          <Input
            type="number"
            min={1}
            value={draft.hours}
            onChange={(e) => setDraft((p) => ({ ...p, hours: e.target.value }))}
            placeholder="Hours"
          />
          <Input
            type="number"
            min={0}
            value={draft.price}
            onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))}
            placeholder="Price ($)"
          />
          <Input
            type="number"
            min={0}
            value={draft.savings}
            onChange={(e) => setDraft((p) => ({ ...p, savings: e.target.value }))}
            placeholder="Savings ($, optional)"
            className="col-span-2"
          />
        </div>

        <Button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="bg-[#1A3A35] hover:bg-[#2D5A45] text-white rounded-full"
        >
          {saving ? "Adding…" : "Add package"}
        </Button>
      </CardContent>
    </Card>
  );
}
