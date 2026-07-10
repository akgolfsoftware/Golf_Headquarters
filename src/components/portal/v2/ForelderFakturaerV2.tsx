"use client";

/**
 * Foreldreportal · Økonomi/Fakturaer — v2 (retning C «Presis», mørk først).
 * Lese-først faktura-oversikt for foreldre, komponert utelukkende av
 * v2-komponenter fra "@/components/v2" (ingen ad-hoc UI, ingen rå hex — kun
 * T.*-tokens). Mobil-først: KPI stables på 375px, betalings-lista er en
 * kort-liste (Rad), aldri en tabell.
 *
 * Funksjon + datakontrakt bevart 1:1 fra den ekte skjermen
 * (src/app/forelder/fakturaer/page.tsx):
 *   - 2 KPI-er: «Betalt hittil» (sum betalte fakturaer) + «Neste forfall»
 *     (beløp + dato på første ubetalte, ellers «Ingen utestående»).
 *   - Fakturahistorikk: beskrivelse · spiller · dato · beløp · status.
 *   - Kontakt-note (betalinger administreres via coaching-avtalen).
 *
 * Ærlige tomrom: ingen fabrikerte tall — tom liste → TomTilstand, «—» der
 * data mangler. Beløp vises alltid som brutto «kr»-heltall (aldri rå float).
 * V2Shell (montert i (v2preview)/v2-forelder-fakturaer/page.tsx) eier chrome-en.
 */

import { useEffect, useState } from "react";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  TallHero,
  StatusPill,
  TomTilstand,
  Icon,
  type StatusTone,
} from "@/components/v2";

/* ── Datakontrakt (mappes fra Prisma i ruten) ─────────────────────── */

export type FakturaStatus =
  | "SUCCEEDED"
  | "PENDING"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface ForelderFakturaRad {
  id: string;
  beskrivelse: string;
  /** Barnets navn (fakturaen tilhører). Null hvis ukjent. */
  spillerNavn: string | null;
  belopOre: number;
  status: FakturaStatus;
  /** Ferdigformatert dato, nb-NO (f.eks. «2. jul»). */
  dato: string;
}

export interface ForelderFakturaerData {
  fakturaer: ForelderFakturaRad[];
}

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

const STATUS: Record<FakturaStatus, { label: string; tone: StatusTone }> = {
  SUCCEEDED: { label: "Betalt", tone: "up" },
  PENDING: { label: "Venter", tone: "warn" },
  FAILED: { label: "Feilet", tone: "down" },
  REFUNDED: { label: "Refundert", tone: "info" },
  PARTIALLY_REFUNDED: { label: "Delvis refundert", tone: "warn" },
};

const UBETALT: FakturaStatus[] = ["PENDING", "FAILED"];

/** nb-NO heltall med tusenskille — konsekvent «kr»-prefiks (aldri rå float). */
function kr(ore: number): string {
  return `kr ${new Intl.NumberFormat("nb-NO").format(Math.round(ore / 100))}`;
}

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
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

/** Én faktura som kort-liste-innslag (mobil-vennlig, ingen tabell). */
function FakturaRad({ f, last }: { f: ForelderFakturaRad; last: boolean }) {
  const st = STATUS[f.status];
  const sub = [f.spillerNavn, f.dato].filter(Boolean).join(" · ");
  return (
    <Rad
      leading={
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: T.panel3,
            border: `1px solid ${T.border}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <Icon name="file-text" size={16} style={{ color: T.fg2 }} />
        </span>
      }
      title={f.beskrivelse}
      sub={sub}
      meta={
        <span
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 5,
            flex: "none",
          }}
        >
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 13.5,
              fontWeight: 700,
              color: T.fg,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {kr(f.belopOre)}
          </span>
          <StatusPill tone={st.tone}>{st.label}</StatusPill>
        </span>
      }
      trailing={null}
      last={last}
    />
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderFakturaerV2({ data }: { data: ForelderFakturaerData }) {
  const mobile = useMobile();
  const { fakturaer } = data;

  // KPI-aggregater — avledet av den ekte lista (identisk logikk som ekte skjerm).
  const betaltHittilOre = fakturaer
    .filter((f) => f.status === "SUCCEEDED")
    .reduce((s, f) => s + f.belopOre, 0);
  const neste = fakturaer.find((f) => UBETALT.includes(f.status)) ?? null;

  const heroSize = mobile ? 34 : 40;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>Foreldreportal · økonomi</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="økonomi">
            Fakturaer &amp;
          </Tittel>
        </div>
      </div>

      {/* KPI-stripe — stables på 375px, to-kol fra sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: T.gap }}>
        <Kort tint>
          <TallHero
            label="Betalt hittil"
            value={kr(betaltHittilOre)}
            sub="Sum betalte fakturaer"
            size={heroSize}
          />
        </Kort>

        {neste ? (
          <Kort tint>
            <TallHero
              label="Neste forfall"
              value={kr(neste.belopOre)}
              sub={`Forfaller ${neste.dato}`}
              size={heroSize}
              action={<StatusPill tone="warn">Venter</StatusPill>}
            />
          </Kort>
        ) : (
          <Kort>
            <TallHero
              label="Neste forfall"
              value="—"
              sub="Ingen utestående"
              size={heroSize}
            />
          </Kort>
        )}
      </div>

      {/* Fakturahistorikk — kort-liste, aldri tabell */}
      <Kort
        eyebrow="Fakturahistorikk"
        action={
          fakturaer.length > 0 ? (
            <Caps size={9}>{`${fakturaer.length} fakturaer`}</Caps>
          ) : undefined
        }
      >
        {fakturaer.length > 0 ? (
          fakturaer.map((f, i) => (
            <FakturaRad key={f.id} f={f} last={i === fakturaer.length - 1} />
          ))
        ) : (
          <TomTilstand
            icon="file-text"
            title="Ingen fakturaer ennå"
            sub="Fakturaer dukker opp her når det er registrert betalinger."
          />
        )}
      </Kort>

      {/* Kontakt-note */}
      <Kort>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Icon
            name="info"
            size={16}
            style={{ color: T.fg2, flex: "none", marginTop: 2 }}
          />
          <p
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.fg2,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Betalinger administreres via coaching-avtalen. Spørsmål om fakturaer?
            Kontakt{" "}
            <a
              href="mailto:hei@akgolf.no"
              style={{ color: T.lime, fontWeight: 600, textDecoration: "none" }}
            >
              hei@akgolf.no
            </a>
            .
          </p>
        </div>
      </Kort>
    </div>
  );
}
