import type { ReactNode } from "react";
import { Button } from "./ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Small modal confirmation used before irreversible-ish booking actions. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-[#1A3A35] mb-2">{title}</h2>
        {description && <div className="text-sm text-gray-600 mb-5">{description}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading} className="rounded-full">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={loading} className="rounded-full bg-[#C4622D] hover:bg-[#7A2E1A] text-white">
            {loading ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
