"use client";

import { Trash2 } from "lucide-react";

export function ConfirmDeleteButton({
  confirmMessage,
  label = "Delete",
  className,
}: {
  confirmMessage: string;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
      }
    >
      <Trash2 className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
