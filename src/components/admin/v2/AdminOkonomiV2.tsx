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

import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
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
import { T } from "@/lib/v2/tokens";

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
}

const STATUS: Record<BetalingStatusKey, { label: string; tone: StatusTone }> = {
  SUCCEEDED: { label: "Betalt", tone: "up" },
  PENDING: { label: "Venter", tone: "warn" },
  FAILED: { label: "Feilet", tone: "down" },
  REFUNDED: { label: "Refundert", tone: "info" },
  PARTIALLY_REFUNDED: { label: "Delvis refundert", tone: "warn" },
};

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** nb-NO heltall med tusenskille — konsekvent «kr»-prefiks (aldri rå float). */
function kr(v: number): string {
  return `kr ${new Intl.NumberFormat("nb-NO").format(Math.round(v))}`;
}

/** Kompakt y-akse-format for trenden (12k / 900). */
function kompakt(v: number): string {
  return v >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`;
}

/** Én betalingsrad som kort-liste-innslag (mobil-vennlig, ingen tabell). */
function BetalingRad({ b, last }: { b: AdminOkonomiV2Betaling; last: boolean }) {
  const st = STATUS[b.status];
  const sub = [b.dato, b.beskrivelse ?? b.type.toLowerCase()].filter(Boolean).join(" · ");
  const refund = b.refundertKr > 0 ? ` · − ${kr(b.refundertKr)} refundert` : "";
  return (
    <Rad
      leading={<AvatarInit navn={b.navn} size={32} />}
      title={b.navn}
      sub={sub + refund}
      meta={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
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
  const maks = Math.max(1000, ...data.serie.map((m) => m.kr));
  const harTrend = data.serie.length >= 2 && data.serie.some((m) => m.kr > 0);

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{`Stripe · ${data.periodeLabel} · AgencyOS`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="i kontroll">Økonomi</Tittel>
        </div>
      </div>
      <a
        href={data.stripeHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
        className="hidden md:inline-flex"
      >
        <CTAPill icon="arrow-up-right">Åpne Stripe</CTAPill>
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
      <KpiFlis label="MRR · coaching" value={kr(data.mrrKr)} tint />
      <KpiFlis label="Innbetalt denne mnd" value={kr(data.innbetaltMndKr)} {...endringChip} />
      <KpiFlis label="Utestående" value={kr(data.utestaendeKr)} varsle={data.utestaendeKr > 0} />
      <KpiFlis label="Aktive abonnement" value={data.proAktive} />
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
        data.betalinger.map((b, i) => <BetalingRad key={b.id} b={b} last={i === data.betalinger.length - 1} />)
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}

      {/* Mobil-snarvei (skjult på desktop der den ligger i hodet) */}
      <a
        href={data.stripeHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
        className="flex md:hidden"
      >
        <CTAPill icon="arrow-up-right">Åpne Stripe</CTAPill>
      </a>

      {kpi}
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
    </div>
  );
}
