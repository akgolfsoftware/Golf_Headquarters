"use client";

/**
 * PlayerHQ Talent-hub — v2 Presis + B-pakke (nivå-status + én vei til min plan).
 * Pre-beta merket ærlig. T.* only.
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  Bit,
  TomTilstand,
  HjelpTips,
  RingMaaler,
  ProgresjonsBar,
  VarmeKart,
  NivaStige,
  BenchmarkBadge,
  CTAPill,
} from "@/components/v2";

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export type TalentData = {
  navn: string;
  niva: string;
  nivaLabel: string;
  /** Reisen Klubb→Tour: trinn øverst = høyest, naa = gjeldende trinn. */
  reiseTrinn: string[];
  reiseNaa: string;
  ringer: { label: string; pct: number; level: number }[];
  maal: { id: string; title: string; pct: number; current: number; target: number | null }[];
  /** 14 dager, eldst først — true = trent den dagen. */
  streak14: boolean[];
  aktiveDager: number;
  sgPercentil: number | null;
  /** Nivåstige (pre-beta demo-innhold). */
  stigeTrinn: string[];
  stigeNaa: string;
  stigeBeskrivelser: Record<string, string>;
};

const UNDERSIDER = [
  { href: "/portal/talent/mitt-niva", label: "Mitt nivå", sub: "Nåværende vurdering" },
  { href: "/portal/talent/min-plan", label: "Min plan", sub: "Fokusområder og mål" },
  { href: "/portal/talent/roadmap", label: "Roadmap", sub: "12 måneder framover" },
  { href: "/portal/talent/sammenligning", label: "Sammenligning", sub: "Mot kohort" },
];

export function TalentV2({ data }: { data: TalentData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>Talent · {data.navn}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="utviklingsvei">Din</Tittel>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <StatusPill tone="lime">Nivå {data.niva}</StatusPill>
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>{data.nivaLabel}</span>
        </div>
      </div>

      {/* PRE-BETA — ærlig merking av demo-data */}
      <Kort pad="12px 18px">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusPill tone="warn">Pre-beta</StatusPill>
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>
            Delvis demo-data — kobles helt til databasen etter beta.
          </span>
        </div>
      </Kort>

      {/* B: én primær vei */}
      <Link href="/portal/talent/min-plan" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="target" full>
          Åpne min plan
        </CTAPill>
      </Link>

      {/* Reisen */}
      <Kort eyebrow="Reisen — klubb til tour">
        <NivaStige trinn={data.reiseTrinn} naa={data.reiseNaa} beskrivelser={{}} />
      </Kort>

      {/* Mastery-ringer */}
      <Kort
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Vurdering per område <HjelpTips k="talentVurdering" size={11} />
          </span>
        }
      >
        <div className="grid grid-cols-3" style={{ gap: T.gap }}>
          {data.ringer.map((r) => (
            <div key={r.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <RingMaaler label={r.label} value={r.pct} min={0} max={100} unit="%" size={92} />
            </div>
          ))}
        </div>
      </Kort>

      {/* Målfremgang */}
      <Kort eyebrow="Målfremgang">
        {data.maal.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TomTilstand
              icon="target"
              title="Ingen aktive mål"
              sub="Sett mål for å se fremgang her."
            />
            <Link href="/portal/mal/bygger" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill ghost full icon="plus">
                Sett mål
              </CTAPill>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {data.maal.map((g) => (
              <ProgresjonsBar
                key={g.id}
                variant="bar"
                value={g.pct}
                max={100}
                label={
                  g.target != null ? `${g.title} · ${g.current} / ${g.target}` : g.title
                }
              />
            ))}
          </div>
        )}
      </Kort>

      {/* Streak + percentil */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: T.gap }}>
        <Kort
          eyebrow={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Streak <HjelpTips k="streak" size={11} />
            </span>
          }
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: T.mono, fontSize: 38, fontWeight: 700, color: T.lime, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {data.aktiveDager}
            </span>
            <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>dager på rad</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <VarmeKart
              rows={["Uke 1", "Uke 2"]}
              cols={["M", "T", "O", "T", "F", "L", "S"]}
              values={[
                data.streak14.slice(0, 7).map((on) => (on ? 1 : 0)),
                data.streak14.slice(7).map((on) => (on ? 1 : 0)),
              ]}
              cell={20}
              fmt={(v) => (v > 0 ? "Trent" : "Hvile")}
            />
          </div>
        </Kort>

        <Kort
          eyebrow={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              SG-percentil <HjelpTips k="sgTotal" size={11} />
            </span>
          }
        >
          {data.sgPercentil != null ? (
            <BenchmarkBadge
              nivaa={data.niva}
              percentil={data.sgPercentil}
              label="SG total"
              sammenheng="av spillere i din kategori"
            />
          ) : (
            <TomTilstand
              icon="trending-up"
              title="Ingen SG-data ennå"
              sub="Logg runder med Strokes Gained for å se percentilen din."
            />
          )}
        </Kort>
      </div>

      {/* Nivåstige */}
      <Kort eyebrow="Nivåstige">
        <NivaStige trinn={data.stigeTrinn} naa={data.stigeNaa} beskrivelser={data.stigeBeskrivelser} />
      </Kort>

      {/* Undersider */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: T.gap }}>
        {UNDERSIDER.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <Kort hover pad="14px 18px">
              <Rad last title={<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Bit icon="star">{item.label}</Bit></span>} sub={item.sub} />
            </Kort>
          </Link>
        ))}
      </div>
    </div>
  );
}
