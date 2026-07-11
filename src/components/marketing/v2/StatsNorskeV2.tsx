"use client";

/**
 * AK Golf HQ v2 — /stats/norske (retning C, mørk).
 * Swap av (mlegacy)/stats/norske/page.tsx → v2-utseende. Data-lag
 * (hentNorskeEntries, formaterScore/Pos/Tour/DatoRange) videreført 1:1 fra
 * legacy-siden; kun presentasjonen er byttet til StatsRamme/StatsDetalj +
 * v2-komponenter.
 */
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, TomTilstand } from "@/components/v2";
import { StatsRamme, StatsDetalj, useMobile } from "./stats-ramme";

export type NorskeSpillerRad = {
  id: string;
  name: string;
  slug: string;
  position: number | null;
  scoreToPar: number | null;
  status: string;
  rounds: number[];
};

export type NorskeTurnGruppe = {
  turnering: {
    id: string;
    name: string;
    slug: string | null;
    tour: string | null;
    status: string | null;
    startDate: string;
    endDate: string | null;
    location: string | null;
    officialUrl: string | null;
  };
  spillere: NorskeSpillerRad[];
};

function formaterScore(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n === 0) return "E";
  return n < 0 ? `${n}` : `+${n}`;
}

function formaterPos(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `T-${n}`;
}

function formaterTour(t: string | null | undefined): string {
  const labels: Record<string, string> = {
    pga: "PGA TOUR",
    opp: "PGA TOUR · OPPOSITE FIELD",
    dp: "DP WORLD TOUR",
    "korn-ferry": "KORN FERRY",
    lpga: "LPGA",
    let: "LET",
    challenge: "CHALLENGE TOUR",
    "amateur-no": "NORSK AMATØR",
    "junior-no": "JUNIOR",
    srixon: "SRIXON TOUR",
    olyo: "OLYO",
    ngc: "NGC",
    college: "COLLEGE",
  };
  if (!t) return "TOUR";
  return labels[t] ?? t.toUpperCase();
}

function formaterDatoRange(startIso: string, endIso: string | null): string {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : null;
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const startStr = start.toLocaleDateString("nb-NO", opts);
  if (!end) return startStr;
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.toLocaleDateString("nb-NO", opts)}`;
  }
  return `${startStr} – ${end.toLocaleDateString("nb-NO", opts)}`;
}

function TurnGruppeKort({ gruppe }: { gruppe: NorskeTurnGruppe }) {
  const erLive = gruppe.turnering.status === "IN_PROGRESS";
  return (
    <Kort pad="0" style={{ overflow: "hidden" }}>
      <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {erLive ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.onLime, background: T.up, borderRadius: 999, padding: "2px 8px" }}>
              LIVE
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mut, fontWeight: 600 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.mut, display: "inline-block" }} />
              KOMMENDE
            </span>
          )}
          <h2 style={{ fontFamily: T.disp, fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: "-0.015em", color: T.fg }}>
            <span style={{ display: "inline-block", marginRight: 8, padding: "1px 6px", borderRadius: 4, fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", verticalAlign: "middle", background: T.panel2, color: T.mut }}>
              NOR
            </span>
            {gruppe.turnering.slug ? (
              <Link href={`/stats/turneringer/${gruppe.turnering.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                {gruppe.turnering.name}
              </Link>
            ) : (
              gruppe.turnering.name
            )}
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontFamily: T.mono, fontSize: 11, letterSpacing: "0.05em", color: T.mut }}>
          {gruppe.turnering.tour && (
            <span style={{ background: T.panel2, padding: "2px 8px", borderRadius: 4, color: T.lime, fontWeight: 600 }}>{formaterTour(gruppe.turnering.tour)}</span>
          )}
          {gruppe.turnering.location && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon name="map-pin" size={10} /> {gruppe.turnering.location}
            </span>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="calendar" size={10} /> {formaterDatoRange(gruppe.turnering.startDate, gruppe.turnering.endDate)}
          </span>
        </div>
      </div>

      {erLive ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.mono, fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.panel2, borderBottom: `1px solid ${T.border}` }}>
                {["POS", "SPILLER", "SCORE", "RUNDER"].map((h, i) => (
                  <th key={h} style={{ padding: i === 0 ? "10px 22px" : "10px 14px", textAlign: i >= 2 ? "right" : "left", fontFamily: T.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mut, fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gruppe.spillere.map((s, i) => {
                const underPar = s.scoreToPar !== null && s.scoreToPar !== undefined && s.scoreToPar < 0;
                return (
                  <tr key={s.id} style={{ borderBottom: i < gruppe.spillere.length - 1 ? `1px solid ${T.border}` : undefined }}>
                    <td style={{ padding: "12px 22px", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: (s.position ?? 99) <= 3 ? T.lime : T.mut }}>{formaterPos(s.position)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link href={`/stats/spillere/${s.slug}`} style={{ fontFamily: T.ui, fontWeight: 500, fontSize: 13.5, color: T.fg, textDecoration: "none" }}>
                        {s.name}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <span style={{ display: "inline-block", fontVariantNumeric: "tabular-nums", fontWeight: 600, fontSize: 13, padding: "2px 8px", borderRadius: 4, background: underPar ? T.lime : T.panel2, color: underPar ? T.onLime : T.fg }}>
                        {formaterScore(s.scoreToPar)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 22px 12px 14px", textAlign: "right", color: T.mut, fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
                      {s.rounds.length > 0 ? s.rounds.join("-") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: "16px 22px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {gruppe.spillere.map((s) => (
            <Link key={s.id} href={`/stats/spillere/${s.slug}`} style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: 999, background: T.panel2, border: `1px solid ${T.border}`, fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.fg, textDecoration: "none" }}>
              {s.name}
            </Link>
          ))}
        </div>
      )}

      <div style={{ padding: "12px 22px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end" }}>
        {gruppe.turnering.slug ? (
          <Link href={`/stats/turneringer/${gruppe.turnering.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 12, letterSpacing: "0.05em", color: T.lime, textDecoration: "none", fontWeight: 500 }}>
            Se full leaderboard <Icon name="external-link" size={11} />
          </Link>
        ) : gruppe.turnering.officialUrl ? (
          <a href={gruppe.turnering.officialUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 12, letterSpacing: "0.05em", color: T.lime, textDecoration: "none", fontWeight: 500 }}>
            Se turnering <Icon name="external-link" size={11} />
          </a>
        ) : (
          <Link href="/stats/turneringer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 12, letterSpacing: "0.05em", color: T.mut, textDecoration: "none" }}>
            Se alle turneringer <Icon name="external-link" size={11} />
          </Link>
        )}
      </div>
    </Kort>
  );
}

export interface StatsNorskeV2Props {
  grupper: NorskeTurnGruppe[];
}

export function StatsNorskeV2({ grupper }: StatsNorskeV2Props) {
  const mobile = useMobile();

  const antallSpillere = new Set(grupper.flatMap((g) => g.spillere.map((s) => s.slug))).size;
  const antallTurneringer = grupper.length;
  const antallLiveNaa = grupper.filter((g) => g.turnering.status === "IN_PROGRESS").length;

  return (
    <StatsRamme mobile={mobile} aktiv="turneringer">
      <StatsDetalj
        mobile={mobile}
        eyebrow="Denne uken"
        tittel="Norske i aksjon."
        sub={
          antallSpillere > 0
            ? `${antallSpillere} spiller${antallSpillere !== 1 ? "e" : ""} på ${antallTurneringer} turnering${antallTurneringer !== 1 ? "er" : ""}.`
            : "Ingen norske spillere i aksjon denne uken."
        }
        kpis={[
          { label: "Norske i aksjon", value: antallSpillere },
          { label: "Turneringer denne uken", value: antallTurneringer },
          { label: "Live nå", value: antallLiveNaa },
        ]}
      >
        <div style={{ padding: mobile ? "0 22px 64px" : "0 64px 96px" }}>
          {grupper.length === 0 ? (
            <Kort>
              <TomTilstand icon="flag" title="Ingen norske spillere i aksjon denne uken" sub="Neste oppdatering kl. 06:00, kom tilbake da!" />
            </Kort>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              {grupper.map((gruppe) => (
                <TurnGruppeKort key={gruppe.turnering.id} gruppe={gruppe} />
              ))}
            </div>
          )}
        </div>
      </StatsDetalj>
    </StatsRamme>
  );
}
