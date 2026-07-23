"use client";

/**
 * AK Golf HQ v2 — /stats/turneringer (retning C, mørk).
 * Swap av (mlegacy)/stats/turneringer/page.tsx → v2-utseende. Data-lag
 * (hentTurneringerForListe, hentTurneringCounts, hentNorskeDenneUka,
 * formaterDatoSpenn, formaterPremie, tourEtikett) videreført 1:1 fra legacy —
 * kun presentasjonen er byttet til StatsRamme/StatsListe + v2-komponenter.
 */
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, TomTilstand } from "@/components/v2";
import { StatsRamme, StatsListe, useMobile } from "./stats-ramme";
import type { TurneringListeRad, TourFilter, TidFilter } from "@/lib/stats/turnering-queries";

const TOUR_LABELS: Record<TourFilter, string> = {
  alle: "Alle",
  pga: "PGA Tour",
  euro: "DP World",
  kft: "Korn Ferry",
  lpga: "LPGA",
  let: "LET",
  challenge: "Challenge",
  norge: "Norge",
  junior: "Junior",
  college: "College",
};

const TOUR_KEYS: TourFilter[] = ["alle", "pga", "euro", "kft", "lpga", "let", "challenge", "norge", "junior", "college"];

const TID_LABELS: Record<TidFilter, string> = {
  uke: "Denne uken",
  kommende: "Kommende",
  avsluttede: "Avsluttede",
};

const TID_KEYS: TidFilter[] = ["uke", "kommende", "avsluttede"];

function formaterDatoSpenn(start: Date, slutt: Date | null): string {
  const startFmt = start.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  if (!slutt) return startFmt;
  const sluttFmt = slutt.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  if (startFmt === sluttFmt) return startFmt;
  return `${startFmt} – ${sluttFmt}`;
}

function formaterPremie(purseUsd: number): string {
  if (purseUsd >= 1_000_000) {
    const millioner = purseUsd / 1_000_000;
    return `$${millioner % 1 === 0 ? millioner.toFixed(0) : millioner.toFixed(1)}M`;
  }
  if (purseUsd >= 1_000) return `$${(purseUsd / 1_000).toFixed(0)}K`;
  return `$${purseUsd.toLocaleString("nb-NO")}`;
}

function erLive(status: string | null): boolean {
  return status === "IN_PROGRESS";
}

function tourEtikett(tour: string | null): string {
  if (!tour) return "Tour";
  const MAP: Record<string, string> = {
    pga: "PGA TOUR",
    dp: "DP WORLD",
    "dp-world": "DP WORLD",
    "korn-ferry": "KORN FERRY",
    lpga: "LPGA",
    let: "LET",
    challenge: "CHALLENGE",
    "amateur-no": "NORSK AMATØR",
    "junior-no": "JUNIOR",
    college: "COLLEGE",
  };
  return MAP[tour.toLowerCase()] ?? tour.toUpperCase();
}

function buildUrl(overrides: Partial<{ tour: TourFilter; tid: TidFilter }>, currentTour: TourFilter, currentTid: TidFilter): string {
  const tour = overrides.tour ?? currentTour;
  const tid = overrides.tid ?? currentTid;
  const params = new URLSearchParams();
  if (tour !== "alle") params.set("tour", tour);
  if (tid !== "uke") params.set("tid", tid);
  const qs = params.toString();
  return `/stats/turneringer${qs ? `?${qs}` : ""}`;
}

function TurneringKort({ t }: { t: TurneringListeRad }) {
  const live = erLive(t.status);
  const href = t.slug ? `/stats/turneringer/${t.slug}` : "#";
  return (
    <Link href={href} aria-label={`Se detaljer for ${t.name}`} style={{ textDecoration: "none", color: "inherit" }}>
      <Kort hover style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 168 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: T.mut, fontWeight: 500 }}>
            {tourEtikett(t.tour)}
          </span>
          {live && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.up, fontWeight: 600 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.up, display: "inline-block" }} />
              LIVE
            </span>
          )}
        </div>

        <div style={{ fontFamily: T.disp, fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.25, color: T.fg }}>
          {t.shortName ?? t.name}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 11.5, color: T.mut }}>
            <Icon name="calendar" size={13} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{formaterDatoSpenn(t.startDate, t.endDate)}</span>
          </div>
          {t.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 11.5, color: T.mut }}>
              <Icon name="map-pin" size={13} />
              <span>{t.location}</span>
            </div>
          )}
        </div>

        {t.purseUsd !== null && t.purseUsd > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 11.5, color: T.mut }}>
            <Icon name="trophy" size={13} />
            <span>{formaterPremie(t.purseUsd)}</span>
          </div>
        )}

        {t.norskeAntall > 0 && (
          <div style={{ marginTop: "auto", paddingTop: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.lime, color: T.onLime, borderRadius: 999, padding: "3px 10px", fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>
              <span style={{ fontWeight: 700, letterSpacing: "0.08em", opacity: 0.85 }}>NOR</span> {t.norskeAntall} norsk{t.norskeAntall === 1 ? "" : "e"}
            </span>
          </div>
        )}
      </Kort>
    </Link>
  );
}

export interface StatsTurneringerV2Props {
  tour: TourFilter;
  tid: TidFilter;
  turneringer: TurneringListeRad[];
  counts: Record<TourFilter, number>;
  totaltNorske: number;
  antallTurneringerMedNorske: number;
  harNoenTurneringer: boolean;
}

export function StatsTurneringerV2({ tour, tid, turneringer, counts, totaltNorske, antallTurneringerMedNorske, harNoenTurneringer }: StatsTurneringerV2Props) {
  const mobile = useMobile();
  const harData = turneringer.length > 0;

  return (
    <StatsRamme mobile={mobile} aktiv="turneringer">
      <StatsListe
        mobile={mobile}
        eyebrow="AK Golf Stats · Turneringer"
        status={{
          label: harData
            ? `${turneringer.length} turneringer`
            : "Ingen turneringer i filteret",
          tone: harData ? "info" : "warn",
          meta:
            tid === "uke" && totaltNorske > 0
              ? `${totaltNorske} norske på ${antallTurneringerMedNorske} turneringer`
              : harNoenTurneringer
                ? "Filtrer tour eller tid"
                : undefined,
        }}
        tittel="Turneringer."
        tittelEm="Hele oversikten."
        lede="Alle tourer. Norske spillere fremhevet."
        meta={
          tid === "uke" && totaltNorske > 0 ? (
            <Link href="/stats/norske" style={{ color: T.lime, textDecoration: "none" }}>
              {totaltNorske} norske spiller{totaltNorske === 1 ? "" : "e"} i aksjon denne uken på {antallTurneringerMedNorske} turnering{antallTurneringerMedNorske === 1 ? "" : "er"} →
            </Link>
          ) : undefined
        }
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }} role="group" aria-label="Filtrer etter tour">
          {TOUR_KEYS.map((key) => {
            const isActive = tour === key;
            const count = counts[key] ?? 0;
            return (
              <Link
                key={key}
                href={buildUrl({ tour: key }, tour, tid)}
                aria-pressed={isActive}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 999,
                  fontFamily: T.ui,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  border: `1px solid ${isActive ? T.lime : T.borderS}`,
                  background: isActive ? T.panel2 : "transparent",
                  color: isActive ? T.fg : T.fg2,
                }}
              >
                {TOUR_LABELS[key]}
                <span style={{ fontFamily: T.mono, fontSize: 10, fontVariantNumeric: "tabular-nums", opacity: isActive ? 0.9 : 0.6 }}>{count}</span>
              </Link>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 0, marginBottom: 32, borderBottom: `1px solid ${T.border}` }} role="group" aria-label="Tidsfilter">
          {TID_KEYS.map((key) => {
            const isActive = tid === key;
            return (
              <Link
                key={key}
                href={buildUrl({ tid: key }, tour, tid)}
                aria-selected={isActive}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  fontFamily: T.ui,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: "none",
                  color: isActive ? T.lime : T.mut,
                  borderBottom: isActive ? `2px solid ${T.lime}` : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {TID_LABELS[key]}
              </Link>
            );
          })}
        </div>

        {harData ? (
          <>
            <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut, marginBottom: 16 }}>
              {turneringer.length} turnering{turneringer.length === 1 ? "" : "er"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
              {turneringer.map((t) => (
                <TurneringKort key={t.id} t={t} />
              ))}
            </div>
          </>
        ) : (
          <Kort>
            <TomTilstand
              icon={!harNoenTurneringer ? "trophy" : "calendar"}
              title={!harNoenTurneringer ? "Turneringsdata synkes snart" : "Ingen turneringer i denne perioden"}
              sub={!harNoenTurneringer ? "Kom tilbake om litt." : "Datakilder oppdateres daglig kl. 06:00."}
            />
          </Kort>
        )}
      </StatsListe>
    </StatsRamme>
  );
}
