"use client";

/**
 * AG-05 fane «Tilgjengelighet» — fast ukemønster, ett vindu per dag. Se
 * tilg-data.ts for hvorfor omfanget er begrenset (dato-unntak, flere steder
 * og årsvisning lever videre på /admin/availability).
 */
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { KnappLenke, Meta } from "@/components/precision/pa";
import { Bryter, Kort } from "@/components/precision/pa-a4";
import { settUkedagAktiv } from "@/app/admin/kalender/tilg-actions";
import type { UkedagRad } from "@/app/admin/kalender/tilg-data";

export function AG05Tilg({ rader }: { rader: UkedagRad[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const veksle = (rad: UkedagRad, paa: boolean) => {
    start(async () => {
      await settUkedagAktiv({ weekday: rad.ukedag, slotId: rad.slotId, paa, range: rad.range });
      router.refresh();
    });
  };

  return (
    <Kort>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <span className="kicker">Fast ukemønster</span>
        <Meta>GJELDER TIL DU ENDRER DET</Meta>
      </div>
      {rader.map((r, i) => (
        <div key={r.ukedag} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none", flexWrap: "wrap" }}>
          <span style={{ font: "500 14px/1 var(--font-sans)", width: 88 }}>{r.navn}</span>
          <span style={{ font: "var(--type-num-s)", color: r.paa ? "var(--text-primary)" : "var(--text-muted)", flex: 1 }}>{r.paa ? r.range : "—"}</span>
          <Bryter checked={r.paa} onChange={(v) => veksle(r, v)} label={pending ? "Lagrer …" : r.paa ? "Ledig" : "Stengt"} />
        </div>
      ))}
      <div style={{ paddingTop: 12 }}>
        <KnappLenke href="/admin/availability" variant="secondary">Steder, unntak og årsplan</KnappLenke>
      </div>
    </Kort>
  );
}
