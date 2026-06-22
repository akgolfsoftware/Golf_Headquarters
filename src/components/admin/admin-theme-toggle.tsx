"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * AgencyOS lys/mørk-toggle (Anders 2026-06-22 — AgencyOS skal kunne være lys og mørk).
 * Tema persisteres i cookie `ak-admin-theme` (leses server-side i AdminShell → ingen flash).
 * Knappen flipper `.dark`-klassen + color-scheme på #agencyos-root umiddelbart (uten reload).
 */
export function AdminThemeToggle({ initialDark }: { initialDark: boolean }) {
  const [dark, setDark] = useState(initialDark);

  function toggle() {
    const next = !dark;
    setDark(next);
    const root = document.getElementById("agencyos-root");
    if (root) {
      root.classList.toggle("dark", next);
      root.style.colorScheme = next ? "dark" : "light";
    }
    document.cookie = `ak-admin-theme=${next ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Bytt til lyst tema" : "Bytt til mørkt tema"}
      title={dark ? "Lyst tema" : "Mørkt tema"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {dark ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
      )}
    </button>
  );
}
