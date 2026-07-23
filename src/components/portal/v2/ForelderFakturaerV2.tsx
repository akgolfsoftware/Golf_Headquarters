"use client";

/**
 * Foreldreportal · Fakturaer — v2 Presis + B-pakke (status + én vei).
 * Kun v2 + T.*. Enklere foreldre-språk.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Knapp,
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
  const router = useRouter();
  const { fakturaer } = data;

  // KPI-aggregater — avledet av den ekte lista (identisk logikk som ekte skjerm).
  const betaltHittilOre = fakturaer
    .filter((f) => f.status === "SUCCEEDED")
    .reduce((s, f) => s + f.belopOre, 0);
  const neste = fakturaer.find((f) => UBETALT.includes(f.status)) ?? null;

  const heroSize = mobile ? 34 : 40;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode + status */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Caps>Økonomi</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="fakturaer">
              Mine
            </Tittel>
          </div>
        </div>
        <StatusPill tone={neste ? "warn" : "up"}>
          {neste ? "Noe forfaller" : "Alt betalt"}
        </StatusPill>
      </div>

      {/* Status-stripe */}
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

      {/* Én primær CTA (B) */}
      <div>
        {neste ? (
          <Knapp
            icon="mail"
            full={mobile}
            onClick={() => {
              window.location.href =
                "mailto:hei@akgolf.no?subject=" +
                encodeURIComponent("Spørsmål om faktura");
            }}
          >
            Spør om betaling
          </Knapp>
        ) : (
          <Knapp
            icon="arrow-right"
            full={mobile}
            onClick={() => router.push("/forelder/okonomi")}
          >
            Se abonnement
          </Knapp>
        )}
      </div>

      {/* Fakturahistorikk */}
      <Kort
        eyebrow="Alle fakturaer"
        action={
          fakturaer.length > 0 ? (
            <Caps size={9}>{`${fakturaer.length} stk`}</Caps>
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
            sub="Når det kommer en betaling, ser du den her. Spør coachen ved tvil."
          />
        )}
      </Kort>

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
            Betaling følger coaching-avtalen. Spørsmål? Skriv til{" "}
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
