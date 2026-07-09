"use client";

/**
 * AgencyOS Stall-analyse — v2 (retning C «Presis»). Rekomponerer den ekte
 * skjermen src/app/admin/analyse/page.tsx i v2-idiomet, men med IDENTISK
 * funksjon + datakontrakt: stall-SG-analyse på tvers —
 *   1) 4 KPI-er (treningstimer 30 d · snitt SG-utvikling · økt-oppmøte ·
 *      inaktive 7+ dg), alle med delta mot forrige vindu,
 *   2) pyramide-fordeling for hele stallen (andel fullførte økter per akse),
 *   3) per gruppe (spillere · timer/uke · snitt SG).
 *
 * Bygget utelukkende av v2-komponentbiblioteket (src/components/v2) — ingen
 * ad-hoc UI, ingen rå hex (kun T.*). Ærlige tomrom: uten datagrunnlag vises
 * «—» / tom-tilstand, aldri fabrikerte tall. Innsikt er klarspråk, aldri sperre.
 *
 * Mobil: KPI 4→2-kol, 2-kols-grid stables, per gruppe-DataTabell → kort-liste.
 */

import {
  Caps,
  Tittel,
  Kort,
  Rad,
  TallHero,
  FordelingRad,
  InnsiktChip,
  TomTilstand,
  AvatarInit,
  DataTabell,
  type DataTabellColumn,
  type DataTabellRow,
} from "@/components/v2";
import { T, fmtSg, type AkseKey } from "@/lib/v2/tokens";

// ── Datakontrakt (mappes fra den ekte loaderen i ruten) ─────────
export interface AnalyseV2Kpi {
  label: string;
  /** Display-verdi, «—» ved manglende datagrunnlag. */
  value: string;
  unit?: string;
  /** Signert delta-chip mot forrige vindu (f.eks. «+3 t»). */
  delta?: string;
  dir?: "up" | "down";
  /** Kontekst-linje (brukes der delta er tekst, ikke chip). */
  sub?: string;
  /** Lime-aksent på hero-tallet (positiv SG-utvikling). */
  accent?: boolean;
}
export interface AnalyseV2Dist {
  /** Akse-nøkkel for kategorifarge (FYS/TEK/SLAG/SPILL/TURN). */
  akse: AkseKey;
  /** Norsk aksenavn (ordbok). */
  label: string;
  /** Andel av fullførte økter, i prosent. */
  pct: number;
  /** Antall fullførte økter på aksen (mengde bak andelen). */
  okter: number;
}
export interface AnalyseV2Gruppe {
  id: string;
  navn: string;
  n: number;
  /** Timer/uke per spiller, siste 30 d. null = ingen økter. */
  timer: number | null;
  /** Snitt SG-total over medlemmenes runder siste 90 d. null = ingen. */
  sg: number | null;
}
export interface AnalyseV2Data {
  nSpillere: number;
  kpis: AnalyseV2Kpi[];
  /** Finnes fullførte økter å fordele? */
  harPyr: boolean;
  dist: AnalyseV2Dist[];
  /** Klarspråk-innsikt om fordelingen (aldri sperre). */
  innsikt: string;
  grupper: AnalyseV2Gruppe[];
}

// Per gruppe-tabell (desktop): tett sorterbar v2-DataTabell.
const GRUPPE_KOLONNER: DataTabellColumn[] = [
  { key: "navn", label: "Gruppe" },
  { key: "spillere", label: "Spillere", mono: true, align: "right", sortable: true },
  { key: "timer", label: "Timer/uke", mono: true, align: "right", sortable: true },
  { key: "sg", label: "Snitt SG", mono: true, delta: true, align: "right", sortable: true },
];

export function AdminAnalyseV2({ data }: { data: AnalyseV2Data }) {
  const { nSpillere, kpis, harPyr, dist, innsikt, grupper } = data;

  // ── Hode ────────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Analysere · Stall-analyse</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="i tall.">Stallen</Tittel>
        </div>
      </div>
      <div className="hidden md:block">
        <Caps size={9}>
          {nSpillere === 1 ? "1 spiller" : `${nSpillere} spillere`}
        </Caps>
      </div>
    </div>
  );

  // ── KPI-strip (4) ───────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      {kpis.map((k) => (
        <Kort key={k.label}>
          <TallHero
            label={k.label}
            value={k.value}
            unit={k.unit}
            delta={k.delta}
            dir={k.dir}
            sub={k.sub}
            accent={k.accent}
            size={34}
          />
        </Kort>
      ))}
    </div>
  );

  // ── Pyramide-fordeling · stall ──────────────────────────────────
  const pyramide = (
    <Kort eyebrow="Pyramide-fordeling · stall" action={<Caps size={9}>Andel av økter</Caps>}>
      {harPyr ? (
        <>
          <div>
            {dist.map((d, i) => (
              <FordelingRad
                key={d.akse}
                label={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 9999, background: T.ax[d.akse], flex: "none" }} />
                    {d.label}
                  </span>
                }
                pct={d.pct}
                value={String(d.okter)}
                last={i === dist.length - 1}
              />
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <InnsiktChip>{innsikt}</InnsiktChip>
          </div>
        </>
      ) : (
        <TomTilstand
          icon="bar-chart"
          title="Ingen fullførte økter ennå"
          sub="Fordelingen vises når stallen begynner å logge trening."
        />
      )}
    </Kort>
  );

  // ── Per gruppe ──────────────────────────────────────────────────
  const tabellRader: DataTabellRow[] = grupper.map((g) => ({
    navn: g.navn,
    spillere: g.n,
    timer: g.timer,
    sg: g.sg,
  }));

  const perGruppe = (
    <Kort eyebrow="Per gruppe" action={grupper.length > 0 ? <Caps size={9}>{grupper.length === 1 ? "1 gruppe" : `${grupper.length} grupper`}</Caps> : undefined}>
      {grupper.length === 0 ? (
        <TomTilstand icon="users" title="Ingen grupper ennå" sub="Opprett grupper for å analysere stallen per gruppe." />
      ) : (
        <>
          {/* Desktop: tett sorterbar tabell */}
          <div className="hidden md:block" style={{ margin: "-4px -4px 0" }}>
            <DataTabell columns={GRUPPE_KOLONNER} rows={tabellRader} sortKey="sg" sortDir="desc" />
          </div>
          {/* Mobil: kort-liste (én rad per gruppe) */}
          <div className="md:hidden">
            {grupper.map((g, i) => (
              <Rad
                key={g.id}
                leading={<AvatarInit navn={g.navn} size={34} />}
                title={g.navn}
                sub={`${g.n === 1 ? "1 spiller" : `${g.n} spillere`} · ${g.timer != null ? `${g.timer.toFixed(1).replace(".", ",")} t/uke` : "— t/uke"}`}
                meta={
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 15,
                      fontWeight: 700,
                      color: g.sg == null ? T.mut : g.sg < 0 ? T.down : T.up,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {g.sg == null ? "—" : fmtSg(g.sg)}
                  </span>
                }
                trailing={null}
                last={i === grupper.length - 1}
              />
            ))}
          </div>
        </>
      )}
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
        {pyramide}
        {perGruppe}
      </div>
    </div>
  );
}
