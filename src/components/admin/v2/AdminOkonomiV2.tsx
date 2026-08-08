"use client";

/**
 * AgencyOS Økonomi — v2 (retning C «Presis»). Coach/ADMIN sitt business-
 * kontrolltårn for penger. Ingen mockup fantes — komponert utelukkende av
 * v2-biblioteket (src/components/v2), ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart fra de to ekte skjermene (src/app/admin/okonomi +
 * src/app/admin/agencyos/okonomi):
 *   - 4 KPI-er: MRR coaching · Innbetalt denne mnd (+ endring vs forrige) ·
 *     Utestående · Aktive abonnement.
 *   - Inntektstrend siste 6 måneder (Trend-graf, ekte sum innbetalt per mnd).
 *   - Betalings-liste (kunde/beskrivelse/dato/beløp/status) — siste transaksjoner,
 *     med refusjons-note per rad der det finnes.
 *   - Sidekolonne: MRR-sammensetning (PRO-abonnement × 299 kr) + utestående-flagg
 *     med oppfølgingslenke.
 *   - Snarvei «Åpne Stripe» (ekstern).
 *
 * Mobil: KPI 2-kol, alt stables, betalings-lista er en kort-liste (Rad) — ingen
 * tabell. Desktop: 2-kol grid (liste | sidekolonne).
 *
 * Ærlige tomrom: ingen fabrikerte tall — MRR 0 + tomstate ved 0 PRO-abonnement,
 * tom liste ved 0 betalinger, «—» der data mangler.
 */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  PillTabs,
  TallHero,
  StatusPill,
  CTAPill,
  AvatarInit,
  Trend,
  TomTilstand,
  InnsiktChip,
  Icon,
  type StatusTone,
} from "@/components/v2";
import { T, TOM_TALL } from "@/lib/v2/tokens";

// ── Datakontrakt (mappes fra Prisma i ruten) ────────────────────
export type BetalingStatusKey =
  | "SUCCEEDED"
  | "PENDING"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface AdminOkonomiV2Betaling {
  id: string;
  navn: string;
  beskrivelse: string | null;
  type: string;
  belopKr: number;
  refundertKr: number;
  dato: string;
  status: BetalingStatusKey;
}

export interface AdminOkonomiV2Data {
  periodeLabel: string;
  mrrKr: number;
  proAktive: number;
  innbetaltMndKr: number;
  endringPct: number | null;
  utestaendeKr: number;
  utestaendeAntall: number;
  betalteAntall: number;
  serie: { label: string; kr: number }[];
  betalinger: AdminOkonomiV2Betaling[];
  stripeHref: string;
  oppfolgHref: string;
  /** Belegg denne uka (bookede min / tilgjengelige coach-min). Null = ingen
   *  kapasitet registrert → KPI-en viser «—» framfor et tall vi ikke kan stå for. */
  beleggPct: number | null;
  bookingerUka: number;
  /** Spillere uten abonnement (GRATIS). ELITE finnes ikke. */
  gratisSpillere: number;
  tjenesterHref: string;
}

const STATUS: Record<BetalingStatusKey, { label: string; tone: StatusTone }> = {
  SUCCEEDED: { label: "Betalt", tone: "up" },
  PENDING: { label: "Venter", tone: "warn" },
  FAILED: { label: "Feilet", tone: "down" },
  REFUNDED: { label: "Refundert", tone: "info" },
  PARTIALLY_REFUNDED: { label: "Delvis refundert", tone: "warn" },
};

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** md-breakpoint-speil (matcher V2Shell/AdminBookingerV2). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/** nb-NO heltall med tusenskille — konsekvent «kr»-prefiks (aldri rå float). */
function kr(v: number): string {
  return `kr ${new Intl.NumberFormat("nb-NO").format(Math.round(v))}`;
}

/** Kompakt y-akse-format for trenden (12k / 900). */
function kompakt(v: number): string {
  return v >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`;
}

/** Én betalingsrad som kort-liste-innslag (mobil-vennlig, ingen tabell).
 *  Mobil: beløp over status-pille (smal meta-kolonne → mer plass til navn/tekst). */
function BetalingRad({ b, last, mobile }: { b: AdminOkonomiV2Betaling; last: boolean; mobile: boolean }) {
  const st = STATUS[b.status];
  const sub = [b.dato, b.beskrivelse ?? b.type.toLowerCase()].filter(Boolean).join(" · ");
  const refund = b.refundertKr > 0 ? ` · − ${kr(b.refundertKr)} refundert` : "";
  return (
    <Rad
      leading={<AvatarInit navn={b.navn} size={32} />}
      title={b.navn}
      sub={sub + refund}
      meta={
        <span
          style={{
            display: "inline-flex",
            flexDirection: mobile ? "column" : "row",
            alignItems: mobile ? "flex-end" : "center",
            gap: mobile ? 4 : 10,
          }}
        >
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 13,
              fontWeight: 700,
              color: T.fg,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {kr(b.belopKr)}
          </span>
          <StatusPill tone={st.tone}>{st.label}</StatusPill>
        </span>
      }
      trailing={null}
      last={last}
    />
  );
}

export function AdminOkonomiV2({ data }: { data: AdminOkonomiV2Data }) {
  const mobile = useMobile();
  const [fane, setFane] = useState("oversikt");
  const maks = Math.max(1000, ...data.serie.map((m) => m.kr));
  const harTrend = data.serie.length >= 2 && data.serie.some((m) => m.kr > 0);

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{`Mer · Økonomi · ${data.periodeLabel}`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile}>Økonomi</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0", maxWidth: "52ch", lineHeight: 1.5 }}>
          Penger og kapasitet — ikke sportstall. Innsikt eier SG og progresjon.
        </p>
      </div>
      <a
        href={data.stripeHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
        className="hidden md:inline-flex"
      >
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "10px 16px",
          borderRadius: 10, background: T.handling, color: T.onHandling, fontFamily: T.ui, fontSize: 13, fontWeight: 600,
        }}>Åpne Stripe</span>
      </a>
    </div>
  );

  // ── KPI-flis (4) ──────────────────────────────────────────────
  const endringChip =
    data.endringPct != null && data.endringPct !== 0
      ? { delta: `${data.endringPct > 0 ? "+" : "−"}${Math.abs(data.endringPct)} %`, dir: data.endringPct >= 0 ? ("up" as const) : ("down" as const) }
      : {};
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiFlis label="Belegg uke" value={data.beleggPct == null ? null : `${data.beleggPct} %`} instant />
      <KpiFlis label="Innbetalt denne mnd" value={kr(data.innbetaltMndKr)} {...endringChip} />
      <KpiFlis label="Åpne fakturaer" value={data.utestaendeAntall} varsle={data.utestaendeAntall > 0} instant />
      <KpiFlis label="PRO · MRR" value={kr(data.mrrKr)} tint instant />
    </div>
  );

  // ── Inntektstrend (6 mnd) ─────────────────────────────────────
  const trendKort = (
    <Kort eyebrow="Inntekt · siste 6 måneder" action={<Caps size={9}>kr · sum innbetalt per mnd</Caps>}>
      {harTrend ? (
        <Trend
          series={data.serie.map((m) => m.kr)}
          xLabels={data.serie.map((m) => m.label)}
          yMin={0}
          yMax={maks * 1.1}
          baseline={null}
          height={128}
          fmt={kompakt}
        />
      ) : (
        <TomTilstand icon="bar-chart" title="Ingen innbetalinger ennå" sub="Trenden tegnes når det finnes betalinger å summere." />
      )}
    </Kort>
  );

  // ── Betalings-liste ───────────────────────────────────────────
  const liste = (
    <Kort
      eyebrow="Siste betalinger"
      action={data.betalinger.length > 0 ? <Caps size={9}>{pl(data.betalinger.length, "rad", "rader")}</Caps> : undefined}
      pad="4px 20px"
    >
      {data.betalinger.length === 0 ? (
        <div style={{ padding: "16px 0" }}>
          <TomTilstand icon="credit-card" title="Ingen transaksjoner ennå" sub="Betalinger dukker opp her når spillere blir fakturert." />
        </div>
      ) : (
        data.betalinger.map((b, i) => <BetalingRad key={b.id} b={b} last={i === data.betalinger.length - 1} mobile={mobile} />)
      )}
    </Kort>
  );

  // ── Sidekolonne: MRR-sammensetning + utestående ───────────────
  const mrrKort = (
    <Kort tint eyebrow="MRR-sammensetning">
      <TallHero label="Løpende per måned" value={kr(data.mrrKr)} accent size={44} sub="fra coaching-abonnement" />
      <div style={{ marginTop: 16 }}>
        {data.proAktive > 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "11px 13px",
              borderRadius: T.rRow,
              background: T.panel2,
              border: `1px solid ${T.border}`,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: T.fg2,
                  background: T.panel2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 5,
                  padding: "3px 6px",
                }}
              >
                PRO
              </span>
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
                {pl(data.proAktive, "abonnement", "abonnement")}
              </span>
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
              {kr(data.mrrKr)}
            </span>
          </div>
        ) : (
          <TomTilstand icon="repeat" title="Ingen PRO-abonnement ennå" sub="MRR vokser når spillere oppgraderer til 299 kr/mnd." />
        )}
      </div>
    </Kort>
  );

  const utestaendeKort =
    data.utestaendeKr > 0 ? (
      <Kort>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Icon name="flag" size={13} style={{ color: T.warn }} />
          <Caps color={T.warn}>Utestående</Caps>
        </div>
        <TallHero
          value={kr(data.utestaendeKr)}
          size={38}
          sub={pl(data.utestaendeAntall, "faktura venter", "fakturaer venter")}
        />
        <div style={{ marginTop: 14 }}>
          <Link href={data.oppfolgHref} style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="arrow-right">Følg opp</CTAPill>
          </Link>
        </div>
      </Kort>
    ) : null;

  // ── AI-innsikt ────────────────────────────────────────────────
  const innsiktTekst =
    data.utestaendeKr > 0
      ? `${kr(data.utestaendeKr)} står ute fordelt på ${pl(data.utestaendeAntall, "faktura", "fakturaer")} — følg dem opp for å sikre innbetalingen.`
      : `${pl(data.betalteAntall, "betaling", "betalinger")} innfridd denne måneden. MRR ${kr(data.mrrKr)} løpende fra ${pl(data.proAktive, "PRO-abonnement", "PRO-abonnement")}.`;

  // ── Faner (fasit okonomi.html: seks faner, Oversikt først) ────
  // Fanene bytter panel lokalt — ingen ny rute, ingen ny meny-rad.
  const linje = (k: string, v: ReactNode) => (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>{k}</span>
      <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{v}</span>
    </div>
  );
  const beleggTekst = data.beleggPct == null ? TOM_TALL : `${data.beleggPct} %`;

  const merHer = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", paddingTop: 4 }}>
      <Caps size={9}>Mer her</Caps>
      <Link href={data.tjenesterHref} style={{ textDecoration: "none" }}>
        <CTAPill ghost icon="credit-card">Tjenester og priser</CTAPill>
      </Link>
      <a href={data.stripeHref} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        <CTAPill ghost icon="arrow-up-right">Stripe-dashboard</CTAPill>
      </a>
    </div>
  );

  const paneler: Record<string, ReactNode> = {
    oversikt: (
      <>
        {trendKort}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
          {liste}
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            {mrrKort}
            {utestaendeKort}
          </div>
        </div>
        <a href={data.stripeHref} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <InnsiktChip cta="Åpne Stripe">{innsiktTekst}</InnsiktChip>
        </a>
        {merHer}
      </>
    ),
    belegg: (
      <Kort eyebrow="Belegg · booking og kapasitet">
        {linje("Denne uka", beleggTekst)}
        {linje("Bookinger denne uka", data.bookingerUka)}
        {data.beleggPct == null && (
          <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, margin: "12px 0 0", lineHeight: 1.5 }}>
            Belegg krever registrerte tilgjengelighets-vinduer på coach. Uten dem finnes ingen
            kapasitet å måle mot — derfor {TOM_TALL} og ikke et anslag.
          </p>
        )}
        <div style={{ marginTop: 14 }}>
          <Link href="/admin/availability" style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="calendar">Tilgjengelighet</CTAPill>
          </Link>
        </div>
      </Kort>
    ),
    inntekt: (
      <>
        {trendKort}
        <Kort eyebrow="Inntekt · måned for måned">
          {data.serie.map((m) => linje(m.label, kr(m.kr)))}
        </Kort>
      </>
    ),
    abo: (
      <Kort eyebrow="Abonnement · GRATIS / PRO">
        {linje("PRO aktive", data.proAktive)}
        {linje("MRR", kr(data.mrrKr))}
        {linje("GRATIS-spillere", data.gratisSpillere)}
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, margin: "12px 0 0", lineHeight: 1.5 }}>
          Churn og fornyelser krever abonnementshistorikk som ikke lagres ennå — derfor ikke vist.
        </p>
      </Kort>
    ),
    faktura: liste,
    rapport: (
      <Kort eyebrow="Rapporter">
        <TomTilstand
          icon="download"
          title="Eksport kommer"
          sub="Månedsrapport, klubb-eksport og CSV. Sjeldent brukt — derfor fane, ikke egen Mer-rad."
        />
        <div style={{ marginTop: 6, display: "flex", justifyContent: "center" }}>
          <a href={data.stripeHref} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="arrow-up-right">Eksporter i Stripe</CTAPill>
          </a>
        </div>
      </Kort>
    ),
  };

  return (
    <div data-paper-agencyos-okonomi style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 960, margin: "0 auto", width: "100%", background: "var(--v2-bg)" }}>
      {hode}

      {/* Mobil-snarvei (skjult på desktop der den ligger i hodet) */}
      <a
        href={data.stripeHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
        className="flex md:hidden"
      >
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "10px 16px",
          borderRadius: 10, background: T.handling, color: T.onHandling, fontFamily: T.ui, fontSize: 13, fontWeight: 600,
        }}>Åpne Stripe</span>
      </a>

      {kpi}

      <PillTabs
        tabs={[
          { id: "oversikt", l: "Oversikt" },
          { id: "belegg", l: "Belegg" },
          { id: "inntekt", l: "Inntekt" },
          { id: "abo", l: "Abonnement" },
          { id: "faktura", l: "Faktura" },
          { id: "rapport", l: "Rapporter" },
        ]}
        value={fane}
        onChange={setFane}
      />

      {paneler[fane]}
    </div>
  );
}
