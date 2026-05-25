"use client";

/**
 * FAB (Floating Action Button) — primær handling på mobile Workbench.
 *
 * Inspirasjon: referanse-design fra 2026-05-25 (task-apper).
 * Plassert bottom-right, alltid synlig på mobile, skjult på desktop (sidebar dekker).
 *
 * Forest green (#005840) med lime accent, ikke svart/blå (matcher brand).
 */

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Plus, X, CalendarPlus, Flag, Play, MessageSquare, ClipboardCheck } from "lucide-react";

type FabAction = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const DEFAULT_ACTIONS: FabAction[] = [
  { label: "Logg runde", href: "/portal/mal/runder/ny", icon: <Flag /> },
  { label: "Start økt", href: "/portal/tren/ny-okt", icon: <Play /> },
  { label: "Ny booking", href: "/portal/booking/ny", icon: <CalendarPlus /> },
  { label: "Ny test", href: "/portal/tren/tester/ny", icon: <ClipboardCheck /> },
  { label: "Spør coach", href: "/portal/coach/melding/ny", icon: <MessageSquare /> },
];

export function FabButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="fixed bottom-20 right-4 z-30 md:hidden"
      // bottom-20 = over bottom-nav (h-16). md:hidden = kun på mobile.
    >
      {/* Sub-actions (slide opp når open) */}
      {open && (
        <ul className="mb-3 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {DEFAULT_ACTIONS.map((action) => (
            <li key={action.href}>
              <Link
                href={action.href}
                onClick={() => setOpen(false)}
                className="flex h-11 items-center gap-2 rounded-full bg-card pl-4 pr-3 shadow-md border border-border text-sm font-medium text-foreground hover:border-primary transition-colors"
              >
                <span>{action.label}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
                  <span className="[&>svg]:h-4 [&>svg]:w-4" aria-hidden>
                    {action.icon}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* FAB main */}
      <button
        type="button"
        aria-label={open ? "Lukk meny" : "Åpne snarvei-meny"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2} />
        ) : (
          <Plus className="h-6 w-6" strokeWidth={2} />
        )}
      </button>
    </div>
  );
}
