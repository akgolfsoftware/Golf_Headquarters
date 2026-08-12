"use client";

/**
 * AgencyOS · AK-stigen — junior-stigen Mini → Elite.
 * Paper-fasit: agencyos-ak-stigen.html. Lys/mørk via T.*.
 */

import Link from "next/link";
import { T, Caps, Tittel, Kort, Rad, StatusPill, Icon } from "@/components/v2";

const TRINN = [
  { id: "mini", navn: "Mini", alder: "6–8", fokus: "Lek, motorikk, ballfølelse" },
  { id: "knott", navn: "Knøtt", alder: "9–10", fokus: "Grunnslag, enkle baner" },
  { id: "basis", navn: "Basis", alder: "11–12", fokus: "Teknikk + enkel periodisering" },
  { id: "utvikling", navn: "Utvikling", alder: "13–15", fokus: "Spesialisering, SG, turnering" },
  { id: "elite", navn: "Elite", alder: "16+", fokus: "Full stige, prestasjon, liv" },
] as const;

export type AkStigenGruppe = {
  trinnId: (typeof TRINN)[number]["id"];
  antall: number;
  manglerPlan: number;
};

export function AkStigenV2({ grupper = [] }: { grupper?: AkStigenGruppe[] }) {
  const antall = (id: string) => grupper.find((g) => g.trinnId === id)?.antall ?? 0;
  const mangler = (id: string) => grupper.find((g) => g.trinnId === id)?.manglerPlan ?? 0;
  const trengerOppfolging = grupper.reduce((n, g) => n + g.manglerPlan, 0);

  return (
    <div
      data-paper-agencyos-ak-stigen
      data-paper-wave-f="ak-stigen"
      data-od-id="agencyos-ak-stigen" data-paper-slug="agencyos-ak-stigen"
      style={{ display: "flex", flexDirection: "column", gap: T.gap, width: "100%" }}
    >
      <div>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>AK-stigen</h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
          Junior · Mini → Knøtt → Basis → Utvikling → Elite
        </span>
      </div>

      {trengerOppfolging > 0 && (
        <Kort
          pad="16px 18px"
          style={{
            border: `1px solid color-mix(in srgb, ${T.handling} 35%, ${T.border})`,
            background: `color-mix(in srgb, ${T.handling} 6%, ${T.panel})`,
          }}
        >
          <Caps size={9} color={T.handling}>
            Én ting nå
          </Caps>
          <div style={{ marginTop: 8, fontFamily: T.disp, fontSize: 18, fontWeight: 600, color: T.fg }}>
            Se de fire gruppene
          </div>
          <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.45 }}>
            {trengerOppfolging} junior{trengerOppfolging === 1 ? "" : "er"} mangler plan eller trinn.
          </p>
          <Link
            href="/admin/spillere?filter=junior"
            className="v2-press v2-focus"
            style={{
              marginTop: 14,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              minHeight: 56,
              padding: "10px 16px",
              borderRadius: 12,
              background: T.handling,
              color: T.onHandling,
              fontFamily: T.ui,
              fontSize: 14,
              fontWeight: 600,
            }}
            data-paper-en-ting="true"
          >
            Åpne i Spillere
          </Link>
        </Kort>
      )}

      <Kort eyebrow="Trinn">
        {TRINN.map((trinn, i) => {
          const n = antall(trinn.id);
          const m = mangler(trinn.id);
          return (
            <Rad
              key={trinn.id}
              leading={
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: T.panel3,
                    border: `1px solid ${T.border}`,
                    fontFamily: T.mono,
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.fg2,
                  }}
                >
                  {i + 1}
                </span>
              }
              title={trinn.navn}
              sub={`${trinn.alder} · ${trinn.fokus}`}
              meta={
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg }}>
                    {n}
                  </span>
                  {m > 0 ? (
                    <StatusPill tone="warn">{m} mangler</StatusPill>
                  ) : (
                    <StatusPill tone="up">OK</StatusPill>
                  )}
                </span>
              }
              trailing={<Icon name="chevron-right" size={14} style={{ color: T.mut }} />}
              last={i === TRINN.length - 1}
            />
          );
        })}
      </Kort>

      {trengerOppfolging === 0 && (
        <Link
          href="/admin/spillere"
          className="v2-press v2-focus"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 56,
            borderRadius: 12,
            background: T.handling,
            color: T.onHandling,
            fontFamily: T.ui,
            fontSize: 14,
            fontWeight: 600,
          }}
          data-paper-en-ting="true"
        >
          Åpne i Spillere
        </Link>
      )}
    </div>
  );
}
