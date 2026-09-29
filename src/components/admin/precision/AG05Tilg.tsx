"use client";

/**
 * AG-05 fane «Tilgjengelighet» — fast ukemønster. Se tilg-data.ts for omfanget:
 * ett vindu per dag kan slås av/på her; alt annet (nye vinduer, flere steder,
 * dato-unntak, årsplan) gjøres på /admin/availability.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KnappLenke, Meta } from "@/components/precision/pa";
import { Bryter, Kort } from "@/components/precision/pa-a4";
import { settUkedagAktiv } from "@/app/admin/kalender/tilg-actions";
import type { UkedagRad } from "@/app/admin/kalender/tilg-data";

export function AG05Tilg({ rader }: { rader: UkedagRad[] }) {
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const router = useRouter();

  const veksle = (slotId: string, paa: boolean) => {
    start(async () => {
      try {
        await settUkedagAktiv({ slotId, paa });
        setFeil(null);
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Tilgjengeligheten kunne ikke lagres.");
      }
    });
  };

  return (
    <Kort>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <span className="kicker">Fast ukemønster</span>
        <Meta>GJELDER I DAG</Meta>
      </div>
      {feil && <p role="alert" className="a4-feil">{feil}</p>}
      {rader.map((r, i) => (
        <div key={r.ukedag} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none", flexWrap: "wrap" }}>
          <span style={{ font: "500 14px/1 var(--font-sans)", width: 88 }}>{r.navn}</span>
          <span style={{ font: "var(--type-num-s)", color: r.paa ? "var(--text-primary)" : "var(--text-muted)", flex: "1 1 80px", minWidth: 0 }}>
            {r.tekst ?? (r.antall > 1 ? `${r.antall} vinduer` : "—")}
          </span>
          {r.slotId ? (
            <Bryter checked={r.paa} onChange={(v) => veksle(r.slotId!, v)} label={pending ? "Lagrer …" : r.paa ? "Ledig" : "Stengt"} />
          ) : (
            <KnappLenke href="/admin/availability" variant="ghost" size="sm">{r.antall > 1 ? "Endre" : "Legg til"}</KnappLenke>
          )}
        </div>
      ))}
      <div style={{ paddingTop: 12 }}>
        <KnappLenke href="/admin/availability" variant="secondary">Steder, unntak og årsplan</KnappLenke>
      </div>
    </Kort>
  );
}
