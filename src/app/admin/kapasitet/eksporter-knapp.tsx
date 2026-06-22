"use client";

/**
 * AgencyOS — Eksporter-knapp for /admin/kapasitet.
 *
 * Klient-side CSV-eksport av nøyaktig de tallene heatmapen viser
 * (fasilitet × time × belegg-% + snitt). Følger samme mønster som
 * `admin/spillere/spillere-tabell.tsx`: BOM-prefiks, «;»-separator,
 * text/csv-Blob og nedlasting via syntetisk <a>. Ingen tall fabrikeres
 * her — radene kommer ferdig beregnet fra page.tsx (server).
 */

import { Download } from "lucide-react";

export type KapasitetEksportRad = {
  fasilitet: string;
  lokasjon: string;
  /** Belegg i prosent per time, i samme rekkefølge som `timer`. */
  pcts: number[];
  snitt: number;
};

export function EksporterKnapp({
  rader,
  timer,
  ukeNr,
}: {
  rader: KapasitetEksportRad[];
  timer: string[];
  ukeNr: number;
}) {
  function eksporter() {
    const header = [
      "Fasilitet",
      "Lokasjon",
      ...timer.map((t) => `${t}:00`),
      "Snitt",
    ];
    const lines = rader.map((r) =>
      [
        r.fasilitet,
        r.lokasjon,
        ...r.pcts.map((p) => String(p)),
        String(r.snitt),
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(";"),
    );
    const blob = new Blob(["﻿" + [header.join(";"), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const dato = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kapasitet-uke-${ukeNr}-${dato}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={eksporter}
      disabled={rader.length === 0}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      Eksporter
    </button>
  );
}
