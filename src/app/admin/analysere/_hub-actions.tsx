"use client";

// ============================================================
// Innsikt-hub handlinger (client-leaf for den server-rendrede
// /admin/analysere). Erstatter de døde `type="button"`-knappene.
//
//   • Eksporter      — laster ned de synlige header-tallene som CSV
//     (ekte klient-side Blob, ingen server). Det er nøyaktig dataen
//     som vises på flaten — ingen fabrikkert «server-eksport».
//   • Generer rapport — ingen rapport-generator finnes ennå, så den
//     er tydelig disablet med «Kommer» (tittel-hint).
//
// Knappestil: agBtnClass fra ui.tsx (v13-fasit).
// ============================================================

import { useCallback } from "react";
import { Download, Plus } from "lucide-react";
import { agBtnClass } from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";

export type HubExportStat = { label: string; value: string };

export function HubActions({ stats }: { stats: HubExportStat[] }) {
  const exporter = useCallback(() => {
    // CSV av de synlige tallene. Escaper feltene (komma/quote/newline).
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rows = [
      ["Nøkkeltall", "Verdi"],
      ...stats.map((s) => [s.label, s.value]),
    ];
    const csv = rows.map((r) => r.map(esc).join(",")).join("\r\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `innsikt-stall-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [stats]);

  return (
    <>
      <button className={agBtnClass("ghost")} type="button" onClick={exporter}>
        <Download size={13} strokeWidth={1.75} aria-hidden /> Eksporter
      </button>
      <button
        className={cn(agBtnClass("primary"), "cursor-not-allowed opacity-60")}
        type="button"
        disabled
        title="Kommer"
      >
        <Plus size={13} strokeWidth={2} aria-hidden /> Generer rapport
      </button>
    </>
  );
}
