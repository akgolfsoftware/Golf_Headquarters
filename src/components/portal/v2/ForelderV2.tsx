"use client";

/**
 * Foreldreportal · Oversikt — v2 Presis + B-pakke (status først, én grønn CTA).
 * Lese-først ukerapport for ÉT barn. Kun v2 + T.*. Enklere foreldre-språk.
 * Data: hentForelderUkerapport — ingen fabrikkerte tall.
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
  HjelpTips,
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
          <Caps>{`Uke ${ukenummer} · ${childName}${alderTekst}`}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em={`${childFirstName}.`}>
              Slik gikk uka for
            </Tittel>
          </div>
        </div>
        <StatusPill tone={consentActive ? "up" : "warn"}>
          {consentActive ? "Alt i orden" : "Trenger samtykke"}
        </StatusPill>
      </div>

      {/* KPI-stripe — status først (B) */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: T.gap }}>
        <KpiFlis
          label="Oppmøte"
          value={oppmotePct != null ? `${oppmotePct} %` : "–"}
        />
        <KpiFlis label="Økter gjort" value={`${oktFullfort} / ${oktPlanlagt}`} />
        <KpiFlis
          label="Timer trent"
          value={trentTimer > 0 ? komma(trentTimer) : "–"}
        />
        <KpiFlis label="På rad" value={streak} />
      </div>

      {/* Én primær CTA (B) — samtykke hvis mangler, ellers barnets side */}
      {!consentActive ? (
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
                Godkjenn kontoen til {childFirstName}
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
                {childFirstName} er under 18 og trenger ditt ja for å bruke appen
                fullt ut. Trening kan fortsette mens du ser gjennom.
              </p>
              <Knapp icon="arrow-right" onClick={gaaTil("/forelder/samtykke")}>
                Gå til samtykke
              </Knapp>
            </div>
          </div>
        </Kort>
      ) : (
        <div>
          <Knapp icon="arrow-right" full={mobile} onClick={gaaTil("/forelder/barn")}>
            Se mer om {childFirstName}
          </Knapp>
        </div>
      )}

      {/* Form + melding fra coach */}
      <div
        className="grid grid-cols-1 md:grid-cols-[3fr_2fr]"
        style={{ gap: T.gap }}
      >
        <Kort
          tint
          eyebrow={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Form denne uka
              <HjelpTips k="sgTotal" size={11} />
            </span>
          }
        >
          {ukeSg != null || visTrend ? (
            <>
              <TallHero
                label="Spillnivå (SG)"
                value={sgVerdi}
                delta={sgDelta}
                dir={sgDir}
                sub="snitt per runde denne uka"
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
                    Utvikling · uker med spilte runder
                  </span>
                </div>
              )}
            </>
          ) : (
            <TomTilstand
              icon="bar-chart"
              title="Ingen runder ennå"
              sub={`${childFirstName} har ikke registrert runder denne perioden. Tallene fylles inn når runder legges inn.`}
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
              sub="Når coachen skriver noe, dukker det opp her."
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
              title="Ingen testresultat ennå"
              sub="Beste tester dukker opp her når de er logget."
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
              sub={`Når ${childFirstName} trener, ser du hva det gikk mest i her.`}
            />
          )}
        </Kort>
      </div>

      {/* Sekundære snarveier */}
      <Kort eyebrow="Mer">
        <Rad
          leading={<Icon name="calendar" size={16} style={{ color: T.fg2 }} />}
          title="Bookinger"
          sub="Kommende timer"
          onClick={gaaTil("/forelder/bookinger")}
        />
        <Rad
          leading={<Icon name="credit-card" size={16} style={{ color: T.fg2 }} />}
          title="Økonomi"
          sub="Fakturaer og betaling"
          onClick={gaaTil("/forelder/okonomi")}
        />
        <Rad
          leading={
            <Icon name="message-circle" size={16} style={{ color: T.fg2 }} />
          }
          title="Coach"
          sub="Kontakt og siste melding"
          onClick={gaaTil("/forelder/coach")}
          last
        />
      </Kort>
    </div>
  );
}
