"use client";

/**
 * Foreldreportal · Økonomi — v2 (retning C «Presis», mørk først). Lese-først
 * innsyn i barnas økonomi: utestående, betalt totalt, aktive pakker + abonnement
 * per barn (tier, credits, neste trekk) + siste betalinger. Full historikk ligger
 * på /forelder/fakturaer — denne flaten er sammendraget (som den ekte skjermen
 * src/app/forelder/okonomi/page.tsx).
 *
 * Komponert KUN av v2-komponenter fra "@/components/v2" (ingen ad-hoc UI-primitiver,
 * ingen rå hex — kun T.*-tokens). ALL data kommer typet inn via {data}, avledet av
 * barnas EKTE Prisma-rader i route-loaderen (v2-forelder-okonomi/page.tsx). Ingen
 * tall fabrikeres: mangler et felt vises ærlig tom-tilstand. V2Shell eier chrome-en;
 * denne komponenten rendrer bare den indre innholds-stacken. Beløp i øre (Int).
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  T,
  Caps,
  Tittel,
  Kort,
  TallHero,
  StatusPill,
  Rad,
  AvatarInit,
  Knapp,
  TomTilstand,
  Icon,
  type StatusTone,
} from "@/components/v2";
import type {
  PaymentStatus,
  SubscriptionStatus,
  Tier,
} from "@/generated/prisma/client";

/* ── Datakontrakt (serialiserbar — datoer som ISO-strenger) ───────────── */

export interface OkonomiAbonnement {
  childId: string;
  fornavn: string;
  tier: Tier;
  status: SubscriptionStatus | null;
  currentPeriodEndISO: string | null;
  monthlyCredits: number;
  creditsRemaining: number;
}

export interface OkonomiBetaling {
  id: string;
  tittel: string;
  datoISO: string;
  amountOre: number;
  status: PaymentStatus;
}

export interface ForelderOkonomiData {
  barnAntall: number;
  utestaaendeOre: number;
  betaltOre: number;
  aktivePakker: number;
  ubetalteAntall: number;
  abonnement: OkonomiAbonnement[];
  sistePayments: OkonomiBetaling[];
}

/* ── Rene hjelpere ────────────────────────────────────────────────────── */

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const NB_DAG_MND = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

/** «2 400 kr» — norsk valuta uten desimaler (fra øre). */
function kr(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(ore / 100);
}

function tierLabel(tier: Tier): string {
  return tier === "PRO" ? "PlayerHQ PRO" : "Gratis";
}

/** Abonnement-status → label + tone (klarspråk, aldri sperre-språk). */
function abonnementStatus(s: SubscriptionStatus): { l: string; tone: StatusTone } {
  if (s === "ACTIVE") return { l: "Aktivt", tone: "up" };
  if (s === "TRIALING") return { l: "Prøveperiode", tone: "info" };
  if (s === "PAST_DUE") return { l: "Forfalt", tone: "warn" };
  return { l: "Avsluttet", tone: "lime" };
}

/** Betalings-status → pille-label + tone. */
function betalingStatus(s: PaymentStatus): { l: string; tone: StatusTone } {
  if (s === "SUCCEEDED") return { l: "Betalt", tone: "up" };
  if (s === "FAILED") return { l: "Feilet", tone: "down" };
  if (s === "REFUNDED" || s === "PARTIALLY_REFUNDED")
    return { l: "Refundert", tone: "info" };
  return { l: "Forfaller", tone: "warn" };
}

/** true på klient etter mount når viewport < 768px (styrer kun tittelstørrelse). */
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

/* Mono-tall til høyre i en Rad (beløp/verdi). */
function MonoVerdi({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 14,
        fontWeight: 700,
        color: T.fg,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* ── Skjerm ───────────────────────────────────────────────────────────── */

export function ForelderOkonomiV2({ data }: { data: ForelderOkonomiData }) {
  const mobile = useMobile();
  const router = useRouter();
  const gaaTil = (href: string) => () => router.push(href);

  const {
    barnAntall,
    utestaaendeOre,
    betaltOre,
    aktivePakker,
    ubetalteAntall,
    abonnement,
    sistePayments,
  } = data;

  // Tomtilstand — ingen barn koblet.
  if (barnAntall === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Hode mobile={mobile} sub="Status for abonnement, fakturaer og kommende trekk." />
        <Kort>
          <TomTilstand
            icon="credit-card"
            title="Ingen barn koblet til kontoen din"
            sub="Be spilleren sende en invitasjon, eller kontakt coachen din."
          />
        </Kort>
      </div>
    );
  }

  const harUtestaaende = ubetalteAntall > 0;
  const statusSub = harUtestaaende
    ? `${ubetalteAntall} betaling${ubetalteAntall === 1 ? "" : "er"} forfaller${
        barnAntall > 1 ? ` · ${barnAntall} barn` : ""
      }`
    : `Alt er betalt${barnAntall > 1 ? ` · ${barnAntall} barn` : ""}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Hode
        mobile={mobile}
        sub={
          barnAntall === 1
            ? "Status for abonnement, credits og kommende trekk."
            : `Økonomi-oversikt for ${barnAntall} barn.`
        }
        pill={
          <StatusPill tone={harUtestaaende ? "warn" : "up"}>
            {harUtestaaende ? "Forfaller" : "Ajour"}
          </StatusPill>
        }
      />

      {/* Betalingsstatus (hero) + nøkkeltall */}
      <div
        className="grid grid-cols-1 md:grid-cols-[3fr_2fr]"
        style={{ gap: T.gap }}
      >
        <Kort tint={harUtestaaende} eyebrow="Betalingsstatus">
          <TallHero
            label="Utestående"
            value={kr(utestaaendeOre)}
            sub={statusSub}
            size={mobile ? 40 : 48}
            action={
              <StatusPill tone={harUtestaaende ? "warn" : "up"}>
                {harUtestaaende ? "Forfaller" : "Ajour"}
              </StatusPill>
            }
          />
          {harUtestaaende && (
            <div style={{ marginTop: 16 }}>
              <Knapp icon="arrow-right" onClick={gaaTil("/forelder/fakturaer")}>
                Se fakturaer
              </Knapp>
            </div>
          )}
        </Kort>

        <Kort eyebrow="Nøkkeltall">
          <Rad
            title="Betalt totalt"
            sub="Alle registrerte betalinger"
            trailing={<MonoVerdi>{kr(betaltOre)}</MonoVerdi>}
          />
          <Rad
            title="Aktive pakker"
            sub="Coaching-pakker med credits"
            trailing={<MonoVerdi>{aktivePakker}</MonoVerdi>}
            last
          />
        </Kort>
      </div>

      {/* Abonnement per barn — kort-liste, stabler på mobil */}
      <div>
        <Caps>Abonnement</Caps>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: T.gap,
          }}
        >
          {abonnement.map((a) => (
            <AbonnementKort key={a.childId} a={a} />
          ))}
        </div>
      </div>

      {/* Siste betalinger */}
      <Kort
        eyebrow="Siste betalinger"
        action={
          sistePayments.length > 0 ? (
            <Knapp icon="arrow-right" ghost onClick={gaaTil("/forelder/fakturaer")}>
              Se alle
            </Knapp>
          ) : undefined
        }
      >
        {sistePayments.length === 0 ? (
          <TomTilstand
            icon="credit-card"
            title="Ingen betalinger registrert ennå"
            sub="Betalinger dukker opp her når det er registrert trekk."
          />
        ) : (
          <div>
            {sistePayments.map((p, i) => {
              const st = betalingStatus(p.status);
              return (
                <Rad
                  key={p.id}
                  title={p.tittel}
                  sub={NB_DAG_MND.format(new Date(p.datoISO))}
                  last={i === sistePayments.length - 1}
                  trailing={
                    <span
                      style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
                    >
                      <MonoVerdi>{kr(p.amountOre)}</MonoVerdi>
                      <StatusPill tone={st.tone}>{st.l}</StatusPill>
                    </span>
                  }
                />
              );
            })}
          </div>
        )}
      </Kort>

      {/* Lesemodus-notis */}
      <Kort>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Icon
            name="info"
            size={16}
            style={{ color: T.mut, flex: "none", marginTop: 2 }}
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
            Abonnement og betaling administreres av spilleren selv. Foreldreportalen
            gir innsyn — kontakt coachen din ved spørsmål om fakturering.
          </p>
        </div>
      </Kort>
    </div>
  );
}

/* ── Delkomponenter ───────────────────────────────────────────────────── */

function Hode({
  mobile,
  sub,
  pill,
}: {
  mobile: boolean;
  sub: string;
  pill?: React.ReactNode;
}) {
  return (
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
        <Caps>Foreldreportal · økonomi</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="og betaling">
            Abonnement
          </Tittel>
        </div>
        <span
          style={{
            fontFamily: T.ui,
            fontSize: 12.5,
            color: T.mut,
            display: "block",
            marginTop: 8,
          }}
        >
          {sub}
        </span>
      </div>
      {pill}
    </div>
  );
}

function AbonnementKort({ a }: { a: OkonomiAbonnement }) {
  const st = a.status ? abonnementStatus(a.status) : null;
  const visCredits = a.tier === "PRO" && a.monthlyCredits > 0;
  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <AvatarInit navn={a.fornavn} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: T.disp,
              fontWeight: 700,
              fontSize: 15,
              color: T.fg,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {a.fornavn}
          </div>
          <Caps size={9} style={{ marginTop: 3 }}>
            {tierLabel(a.tier)}
          </Caps>
        </div>
        {st ? (
          <StatusPill tone={st.tone}>{st.l}</StatusPill>
        ) : (
          <StatusPill tone="lime">Ingen</StatusPill>
        )}
      </div>

      {visCredits && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 4,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <Rad
            leading={<Icon name="sparkles" size={15} style={{ color: T.lime }} />}
            title="Credits igjen"
            trailing={
              <MonoVerdi>
                {a.creditsRemaining}
                <span style={{ color: T.mut, fontWeight: 400 }}>
                  {" "}
                  / {a.monthlyCredits}
                </span>
              </MonoVerdi>
            }
          />
          <Rad
            leading={<Icon name="calendar" size={15} style={{ color: T.fg2 }} />}
            title="Neste trekk"
            trailing={
              <MonoVerdi>
                {a.currentPeriodEndISO
                  ? NB_DATO.format(new Date(a.currentPeriodEndISO))
                  : "—"}
              </MonoVerdi>
            }
            last
          />
        </div>
      )}
    </Kort>
  );
}
