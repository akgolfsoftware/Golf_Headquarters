"use client";

/**
 * AgencyOS — Talent · Kohort-analyse, v2-port 17. juli 2026. Rekomponerer
 * den gamle /admin/(legacy)/talent/kohort-skjermen i v2-idiomet med IDENTISK
 * datakontrakt: TalentTracking gruppert per nivå (U10..Senior), snitt-radar
 * (5 akser 1–10), total-snitt og antall inkludert siste 90 dager.
 * Bygget kun av v2-biblioteket — ingen fabrikerte tall, «—» der data mangler.
 */

import { Caps, Tittel, Kort, StatusPill, DataTabell, TomTilstand, T } from "@/components/v2";
import type { DataTabellColumn, DataTabellRow } from "@/components/v2";
import { HjelpTips } from "@/components/v2/hjelp";

// ── Datakontrakt (aggregeres i ruten) ───────────────────────────
export interface KohortAkse {
  key: string;
  label: string;
}
export interface KohortRadV2 {
  niva: string;
  antall: number;
  /** Snitt per akse, justert 1:1 mot `akser` (null = ingen data). */
  snitt: (number | null)[];
  /** Snitt av alle akse-snittene (null = ingen data). */
  total: number | null;
  /** Antall inkludert i tracking siste 90 dager. */
  progresjon: number;
}
export interface AdminTalentKohortV2Data {
  totalSpillere: number;
  akser: KohortAkse[];
  kohorter: KohortRadV2[];
}

function kd(v: number | null, d = 1): string {
  return v == null ? "—" : v.toFixed(d).replace(".", ",");
}

export function AdminTalentKohortV2({ data }: { data: AdminTalentKohortV2Data }) {
  const hode = (
    <div>
      <Caps>Talent · Kohort-analyse</Caps>
      <div style={{ marginTop: 10 }}>
        <Tittel em="nivå.">Kohorter på</Tittel>
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 520 }}>
        {data.totalSpillere} talent fordelt på U10–Senior. Snitt-radar og 90-dagers
        progresjon per nivå.
      </p>
    </div>
  );

  if (data.totalSpillere === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen talent registrert"
            sub="Talent-spillere må registreres via TalentTracking før kohort-analyse er meningsfull."
          />
        </Kort>
      </div>
    );
  }

  // ── Kohort-kort (én flis per nivå) ─────────────────────────────
  const fliser = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" style={{ gap: T.gap }}>
      {data.kohorter.map((k) => (
        <Kort key={k.niva} tint={k.antall === 0} pad="14px 16px">
          <Caps size={9}>{k.niva}</Caps>
          <div
            style={{
              marginTop: 8,
              fontFamily: T.mono,
              fontSize: T.numMd,
              fontWeight: 700,
              lineHeight: 1,
              color: k.antall > 0 ? T.fg : T.mut,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {k.antall}
          </div>
          <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
            snitt {kd(k.total)}/10
          </div>
          {k.progresjon > 0 && (
            <div style={{ marginTop: 8 }}>
              <StatusPill tone="up">+{k.progresjon} siste 90d</StatusPill>
            </div>
          )}
        </Kort>
      ))}
    </div>
  );

  // ── Tabell: nivå × dimensjoner ─────────────────────────────────
  const columns: DataTabellColumn[] = [
    { key: "niva", label: "Nivå" },
    { key: "antall", label: "Antall", mono: true, align: "right", sortable: true },
    ...data.akser.map((a) => ({
      key: a.key,
      label: a.label,
      mono: true,
      align: "right" as const,
      sortable: true,
    })),
    { key: "total", label: "Total", mono: true, align: "right", sortable: true },
    { key: "progresjon", label: "90d", mono: true, align: "right" },
  ];
  const rows: DataTabellRow[] = data.kohorter.map((k) => {
    const rad: DataTabellRow = {
      niva: k.niva,
      antall: k.antall,
      total: k.total == null ? null : Number(k.total.toFixed(1)),
      progresjon: `+${k.progresjon}`,
    };
    data.akser.forEach((a, i) => {
      const v = k.snitt[i];
      rad[a.key] = v == null ? null : Number(v.toFixed(1));
    });
    return rad;
  });

  const tabell = (
    <Kort
      eyebrow="Snitt-radar per nivå (1–10)"
      action={<HjelpTips k="talentVurdering" align="right" />}
    >
      <div style={{ overflowX: "auto" }}>
        <DataTabell columns={columns} rows={rows} sortKey="antall" sortDir="desc" />
      </div>
    </Kort>
  );

  const harRadarData = data.kohorter.some((k) => k.total != null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {fliser}
      {tabell}
      {!harRadarData && (
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, margin: 0 }}>
          Ingen radar-data registrert ennå — tabellen viser kun nivå-fordeling.
        </p>
      )}
    </div>
  );
}
