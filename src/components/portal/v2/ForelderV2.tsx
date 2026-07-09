"use client";

/**
 * Foreldreportal · Oversikt — v2 (retning C «Presis»). Lese-først ukerapport for
 * ÉT fokus-barn, komponert kun av v2-komponenter fra "@/components/v2" (ingen
 * ad-hoc UI-primitiver, ingen rå hex — kun T.*-tokens). Auth-profil-mockupen har
 * ingen forelder-spesifikk skjerm, så språket lånes 1:1 fra de generelle v2-
 * idiomene: Kort / Rad / TallHero / KpiFlis / StatusPill / Trend / InnsiktChip.
 *
 * ALL data kommer fra hentForelderUkerapport (src/lib/forelder.ts) — avledet av
 * barnets EKTE Prisma-data. Ingen tall fabrikeres: mangler et felt vises ærlig
 * tom-tilstand. V2Shell (montert i (v2preview)/v2-forelder/page.tsx) eier chrome-en;
 * denne komponenten rendrer bare den indre innholds-stacken.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ForelderUkerapport } from "@/lib/forelder";
import {
  T,
  fmtSg,
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  TallHero,
  StatusPill,
  Trend,
  Rad,
  InnsiktChip,
  TomTilstand,
  Knapp,
  Icon,
  type StatusTone,
} from "@/components/v2";

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

/** «4,5» — komma-desimal for norsk visning. */
function komma(n: number): string {
  return n.toString().replace(".", ",");
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

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderV2({ data }: { data: ForelderUkerapport }) {
  const mobile = useMobile();
  const router = useRouter();

  const {
    childFirstName,
    childName,
    childAge,
    consentActive,
    ukenummer,
    oktFullfort,
    oktPlanlagt,
    fokusOmrade,
    sgRetning,
    oppmotePct,
    sgTrendDelta,
    streak,
    trend8uker,
    coachNote,
    trentTimer,
    ukeSg,
    hoydepunkt,
  } = data;

  // Retnings-pille for SG-utviklingen (klarspråk, aldri sperre-språk).
  const retning: { l: string; tone: StatusTone } | null =
    sgRetning === "opp"
      ? { l: "Stigende", tone: "up" }
      : sgRetning === "ned"
        ? { l: "Synkende", tone: "down" }
        : sgRetning === "stabil"
          ? { l: "Stabil", tone: "info" }
          : null;

  // SG-delta som fortegns-chip (kun når vi faktisk har et delta).
  let sgDelta: string | undefined;
  let sgDir: "up" | "down" | undefined;
  if (sgTrendDelta != null && Math.abs(sgTrendDelta) >= 0.1) {
    sgDelta = fmtSg(sgTrendDelta);
    sgDir = sgTrendDelta > 0 ? "up" : "down";
  }

  // 8-ukers SG-form: bruk kun uker med faktiske runder (normaliserte høyder > 0),
  // slik at «ingen runde» ikke feiltolkes som et fall til bunn. Krever ≥2 punkter
  // med spredning for en meningsfull linje.
  const trendPar = trend8uker
    .map((h, i) => ({ h, uke: ukenummer - (7 - i) }))
    .filter((p) => p.h > 0);
  const trendSerie = trendPar.map((p) => p.h);
  const visTrend =
    trendSerie.length >= 2 && Math.max(...trendSerie) !== Math.min(...trendSerie);

  const sgVerdi = ukeSg != null ? fmtSg(ukeSg) : "–";

  // Snarvei-navigasjon (ekte forelder-ruter).
  const gaaTil = (href: string) => () => router.push(href);

  const alderTekst = childAge != null ? ` · ${childAge} år` : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
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
          <Caps>{`Uke ${ukenummer} · forelderrapport`}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em={`${childFirstName}.`}>
              Ukerapport for
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
            {childName}
            {alderTekst}
          </span>
        </div>
        <StatusPill tone={consentActive ? "up" : "warn"}>
          {consentActive ? "Samtykke aktivt" : "Venter på samtykke"}
        </StatusPill>
      </div>

      {/* Samtykke-banner (kun når samtykke ikke er aktivt — anbefaling, ikke sperre) */}
      {!consentActive && (
        <Kort tint>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Icon
              name="shield"
              size={18}
              style={{ color: T.warn, flex: "none", marginTop: 2 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: T.disp,
                  fontWeight: 700,
                  fontSize: 15,
                  color: T.fg,
                }}
              >
                Godkjenn barnets konto
              </div>
              <p
                style={{
                  fontFamily: T.ui,
                  fontSize: 12.5,
                  color: T.fg2,
                  lineHeight: 1.55,
                  margin: "6px 0 12px",
                }}
              >
                {childFirstName} er under 18, og trenger ditt samtykke for å bruke
                appen fullt ut. {childFirstName} kan trene mens dere venter.
              </p>
              <Knapp icon="arrow-right" onClick={gaaTil("/forelder/samtykke")}>
                Gå til samtykke
              </Knapp>
            </div>
          </div>
        </Kort>
      )}

      {/* KPI-stripe — barnets uke i tall */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: T.gap }}>
        <KpiFlis
          label="Oppmøte · uke"
          value={oppmotePct != null ? `${oppmotePct} %` : "–"}
        />
        <KpiFlis label="Økter fullført" value={`${oktFullfort} / ${oktPlanlagt}`} />
        <KpiFlis
          label="Timer trent"
          value={trentTimer > 0 ? komma(trentTimer) : "–"}
        />
        <KpiFlis label="Aktiv streak" value={streak} />
      </div>

      {/* SG-form + melding fra coach */}
      <div
        className="grid grid-cols-1 md:grid-cols-[3fr_2fr]"
        style={{ gap: T.gap }}
      >
        <Kort tint eyebrow="Strokes gained · form">
          {ukeSg != null || visTrend ? (
            <>
              <TallHero
                label="SG denne uka"
                value={sgVerdi}
                delta={sgDelta}
                dir={sgDir}
                sub="snitt strokes gained per runde denne uka"
                size={mobile ? 42 : 50}
                action={
                  retning ? (
                    <StatusPill tone={retning.tone}>{retning.l}</StatusPill>
                  ) : undefined
                }
              />
              {visTrend && (
                <div style={{ marginTop: 12 }}>
                  <Trend
                    series={trendSerie}
                    height={78}
                    baseline={null}
                    fmt={() => ""}
                    xLabels={trendPar.map((p) => `U${p.uke}`)}
                  />
                  <span
                    style={{
                      fontFamily: T.ui,
                      fontSize: 11,
                      color: T.mut,
                      display: "block",
                      marginTop: 8,
                    }}
                  >
                    Relativ SG-utvikling · uker med spilte runder
                  </span>
                </div>
              )}
            </>
          ) : (
            <TomTilstand
              icon="bar-chart"
              title="Ingen runder ennå"
              sub={`${childFirstName} har ikke registrert runder denne perioden. Strokes gained fylles ut når runder legges inn.`}
            />
          )}
        </Kort>

        <Kort eyebrow="Melding fra coach">
          {coachNote ? (
            <div>
              <Caps size={9}>{coachNote.author}</Caps>
              <p
                style={{
                  fontFamily: T.ui,
                  fontSize: 13.5,
                  color: T.fg,
                  lineHeight: 1.6,
                  margin: "12px 0 0",
                }}
              >
                {coachNote.body}
              </p>
            </div>
          ) : (
            <TomTilstand
              icon="message-circle"
              title="Ingen ny melding"
              sub="Coachen har ikke lagt igjen en melding denne uka."
            />
          )}
        </Kort>
      </div>

      {/* Høydepunkt + fokusområde */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap }}>
        <Kort eyebrow="Ukens høydepunkt">
          {hoydepunkt ? (
            <Rad
              leading={
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: T.panel3,
                    border: `1px solid ${T.border}`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                  }}
                >
                  <Icon name="trophy" size={16} style={{ color: T.lime }} />
                </span>
              }
              title={hoydepunkt.testNavn}
              sub="Beste testresultat"
              trailing={
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 16,
                    fontWeight: 700,
                    color: T.fg,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {komma(hoydepunkt.score)}
                </span>
              }
              last
            />
          ) : (
            <TomTilstand
              icon="trophy"
              title="Ingen testresultat"
              sub="Høydepunkter dukker opp når det er registrert tester."
            />
          )}
        </Kort>

        <Kort eyebrow="Mest trent denne uka">
          {fokusOmrade ? (
            <div>
              <span
                style={{
                  fontFamily: T.disp,
                  fontWeight: 700,
                  fontSize: mobile ? 22 : 26,
                  letterSpacing: "-0.02em",
                  color: T.fg,
                  textTransform: "capitalize",
                }}
              >
                {fokusOmrade}
              </span>
              <div style={{ marginTop: 12 }}>
                <InnsiktChip>
                  {childFirstName} har brukt mest tid på {fokusOmrade} denne uka.
                </InnsiktChip>
              </div>
            </div>
          ) : (
            <TomTilstand
              icon="target"
              title="Ingen økter denne uka"
              sub="Fokusområdet regnes ut fra øvelsene i ukas økter."
            />
          )}
        </Kort>
      </div>

      {/* Snarveier — ekte forelder-ruter */}
      <Kort eyebrow="Snarveier">
        <Rad
          leading={<Icon name="users" size={16} style={{ color: T.fg2 }} />}
          title="Barnets side"
          sub="Profil, nivå og full oversikt"
          onClick={gaaTil("/forelder/barn")}
        />
        <Rad
          leading={<Icon name="credit-card" size={16} style={{ color: T.fg2 }} />}
          title="Økonomi og fakturaer"
          sub="Se fakturaer og betaling"
          onClick={gaaTil("/forelder/okonomi")}
        />
        <Rad
          leading={
            <Icon name="message-circle" size={16} style={{ color: T.fg2 }} />
          }
          title="Meldinger med coach"
          sub="Skriv til eller les fra coachen"
          onClick={gaaTil("/forelder/coach")}
          last
        />
      </Kort>
    </div>
  );
}
