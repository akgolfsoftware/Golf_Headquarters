/**
 * AK Golf HQ — markedsside TURNERING-DETALJ (/turneringer/[slug]), Paper.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html
 * (§detalj/§fakta) — retematchet med pk-tokens; KPI-strip og leaderboard er
 * egne mønstre (stats-tabell), ikke i katalog-malen, men følger samme
 * fargespråk/typografi. Ekte copy + datalogikk speilet fra
 * (mlegacy)/turneringer/[slug]/page.tsx. Prisma-henting + JSON-LD/
 * LiveRefresher gjøres i page.tsx.
 */
import { Icon, StatusPill } from "@/components/v2";
import { FlagGlyph } from "@/components/stats/flag-glyph";
import { PkShell } from "./kit/PkShell";
import { PkSek, PkEyebrow, PkHero, PkCta, PkKpi, PkTom } from "./kit/PkPrimitives";

export type EntrySpiller = { id: string; name: string; slug: string; country: string | null; tier: string; photoUrl: string | null };
export type TurneringEntry = {
  id: string;
  position: number | null;
  scoreToPar: number | null;
  status: string;
  thru: number | null;
  round: number | null;
  tied: boolean;
  player: EntrySpiller;
};

export type TurneringDetalj = {
  name: string;
  tour: string | null;
  status: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  officialUrl: string | null;
  winnerName: string | null;
  leaderboardSnapAt: Date | null;
  entries: TurneringEntry[];
};

const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" });
const NB_TIME = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function MarkedTurneringDetaljV2({ t }: { t: TurneringDetalj }) {
  const alle = t.entries;
  const norske = alle.filter((e) => e.player.country === "NO");
  const erLive = t.status === "IN_PROGRESS";
  const erFerdig = t.status === "COMPLETED";
  const erKommende = t.status === "UPCOMING";

  const medScore = alle.filter((e) => e.scoreToPar !== null);
  const lederToPar = medScore.length > 0 ? Math.min(...medScore.map((e) => e.scoreToPar as number)) : null;
  const naavarendeRunde = alle.reduce<number | null>((maks, e) => {
    if (e.round === null) return maks;
    return maks === null ? e.round : Math.max(maks, e.round);
  }, null);

  const datoStr = formaterDato(t.startDate, t.endDate);

  return (
    <PkShell aktiv="/turneringer" dataSlug="marketing-turnering-detalj">
      <PkSek>
        <PkCta href="/turneringer" ghost small icon="arrow-left">
          Alle turneringer
        </PkCta>
        <div style={{ marginTop: 20 }}>
          <PkEyebrow>{`${formaterTour(t.tour)} · ${datoStr}`}</PkEyebrow>
        </div>
        <div style={{ marginTop: 8 }}>
          <PkHero>{t.name}</PkHero>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 8, fontFamily: "var(--tl-font-sans)", fontSize: 14, color: "var(--tl-mute)" }}>
          {t.location && (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="map-pin" size={14} style={{ color: "var(--tl-warm)" }} />
              {t.location}
            </span>
          )}
          {t.officialUrl && (
            <a href={t.officialUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--tl-warm)", textDecoration: "none" }}>
              Offisiell side <Icon name="external-link" size={12} />
            </a>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
          {erLive && <StatusPill tone="down">Pågår nå</StatusPill>}
          {erFerdig && <StatusPill tone="info">Ferdigspilt</StatusPill>}
          {erKommende && <StatusPill tone="lime">Kommende</StatusPill>}
          {t.winnerName && erFerdig && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--tl-font-sans)", fontSize: 13, color: "var(--tl-mute)", border: "1px solid var(--tl-hair)", borderRadius: 9999, padding: "5px 14px" }}>
              <Icon name="trophy" size={13} style={{ color: "var(--tl-warm)" }} />
              Vinner: <strong style={{ color: "var(--tl-text)" }}>{t.winnerName}</strong>
            </span>
          )}
        </div>
      </PkSek>

      <PkSek notop>
        <div className="pk-kpirad">
          <PkKpi label="Deltakere" value={alle.length} />
          <PkKpi label="Norske" value={norske.length} />
          <PkKpi label={erFerdig ? "Vinnerscore" : "Leder"} value={lederToPar !== null ? formaterToPar(lederToPar) : "—"} sub={lederToPar !== null ? (erFerdig ? "Sluttresultat" : "Beste score til par") : "Ikke startet"} />
          <PkKpi label="Runde" value={naavarendeRunde !== null ? `R${naavarendeRunde}` : "—"} sub={erLive ? "Pågår nå" : erFerdig ? "Fullført" : "Ikke startet"} />
        </div>
      </PkSek>

      {norske.length > 0 && (
        <PkSek notop>
          <PkEyebrow>Norske i aksjon</PkEyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 14 }}>
            {norske.map((e) => (
              <div key={e.id} className="pk-kort pk-kort-tint pk-kort-pad">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FlagGlyph code="no" size={16} />
                  <span style={{ fontFamily: "var(--tl-font-sans)", fontWeight: 600, fontSize: 19, color: "var(--tl-text)" }}>{e.player.name}</span>
                </div>
                <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
                  {erLive && e.position !== null && (
                    <>
                      <div>
                        <span className="pk-eyebrow" style={{ fontSize: 9 }}>Posisjon</span>
                        <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 24, fontWeight: 700, color: "var(--tl-warm)", marginTop: 4, display: "block" }}>
                          {e.tied ? `T${e.position}` : e.position}
                        </span>
                      </div>
                      {e.scoreToPar !== null && (
                        <div>
                          <span className="pk-eyebrow" style={{ fontSize: 9 }}>Score til par</span>
                          <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 24, fontWeight: 700, marginTop: 4, display: "block", color: e.scoreToPar < 0 ? "var(--tl-ok)" : e.scoreToPar > 0 ? "var(--tl-danger)" : "var(--tl-text)" }}>
                            {formaterToPar(e.scoreToPar)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <span className="pk-eyebrow" style={{ fontSize: 9 }}>{formaterTier(e.player.tier)}</span>
                    {e.status === "CUT" && <span className="pk-tag" style={{ marginTop: 6, display: "inline-block" }}>Cut</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PkSek>
      )}

      {alle.length > 0 ? (
        <PkSek notop>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <PkEyebrow>Leaderboard</PkEyebrow>
              <span style={{ fontFamily: "var(--tl-font-sans)", fontWeight: 600, fontSize: 22, color: "var(--tl-text)", marginTop: 6, display: "block" }}>Hele feltet: {alle.length} spillere</span>
            </div>
            {t.leaderboardSnapAt && <span className="pk-eyebrow">Sist oppdatert {NB_TIME.format(t.leaderboardSnapAt)}</span>}
          </div>

          <div style={{ overflowX: "auto", marginTop: 18 }}>
            <table className="pk-tabell">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Spiller</th>
                  <th>Land</th>
                  {erLive && <th className="pk-th-right">Til par</th>}
                  {erLive && <th className="pk-th-right">Thru</th>}
                  <th className="pk-th-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {alle.map((e, i) => (
                  <tr key={e.id} className={e.player.country === "NO" ? "pk-tr-no" : undefined}>
                    <td style={{ color: i < 3 ? "var(--tl-warm)" : "var(--tl-mute)", fontWeight: i < 3 ? 700 : 500 }}>
                      {e.tied && e.position !== null ? `T${e.position}` : (e.position ?? i + 1)}
                    </td>
                    <td style={{ fontFamily: "var(--tl-font-sans)", fontWeight: 600, fontSize: 13.5, color: "var(--tl-text)" }}>
                      {e.player.name}
                      {e.player.country === "NO" && <Icon name="star" size={11} style={{ color: "var(--tl-warm)", marginLeft: 6 }} />}
                    </td>
                    <td>
                      <FlagGlyph code={e.player.country?.toLowerCase() ?? "xx"} size={13} />
                    </td>
                    {erLive && (
                      <td className="pk-td-right" style={{ fontWeight: 600, color: e.scoreToPar !== null ? (e.scoreToPar < 0 ? "var(--tl-ok)" : e.scoreToPar > 0 ? "var(--tl-danger)" : "var(--tl-text)") : "var(--tl-mute)" }}>
                        {e.scoreToPar !== null ? formaterToPar(e.scoreToPar) : "—"}
                      </td>
                    )}
                    {erLive && (
                      <td className="pk-td-right" style={{ color: "var(--tl-mute)" }}>
                        {e.status === "CUT" ? "—" : e.thru === null ? "—" : e.thru >= 18 ? "F" : e.thru}
                      </td>
                    )}
                    <td className="pk-td-right">
                      {e.status === "CUT" ? (
                        <span className="pk-tag">Cut</span>
                      ) : (
                        <span style={{ color: "var(--tl-mute)", fontSize: 11 }}>{formaterTier(e.player.tier)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PkSek>
      ) : (
        <PkSek notop>
          <PkTom title="Deltakerliste oppdateres" description="Vi henter felt-listen automatisk så snart turneringen er i gang." />
        </PkSek>
      )}

      <PkSek notop>
        <div className="pk-kort pk-kort-tint">
          <div className="pk-kort-body" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <span style={{ fontFamily: "var(--tl-font-sans)", fontWeight: 600, fontSize: 22, color: "var(--tl-text)" }}>Følger du proffene? Lær av dem også.</span>
              <p style={{ fontFamily: "var(--tl-font-sans)", fontSize: 14.5, color: "var(--tl-mute)", margin: "10px 0 0", maxWidth: 480 }}>
                PlayerHQ gir deg treningsdagbok, statistikk og AI-coach. Bygd av coacher med 10+ års erfaring.
              </p>
            </div>
            <PkCta href="/auth/signup" clay>
              Kom i gang gratis
            </PkCta>
          </div>
        </div>
      </PkSek>
    </PkShell>
  );
}

function formaterDato(start: Date, slutt: Date | null): string {
  if (!slutt) return NB_DATE.format(start);
  if (start.toDateString() === slutt.toDateString()) return NB_DATE.format(start);
  return `${NB_DATE.format(start)} – ${NB_DATE.format(slutt)}`;
}

function formaterToPar(n: number): string {
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : String(n);
}

function formaterTour(t: string | null): string {
  switch (t) {
    case "pga": return "PGA Tour";
    case "opp": return "PGA Tour · Opposite Field";
    case "euro": return "DP World Tour";
    case "kft": return "Korn Ferry Tour";
    case "alt": return "Alt-tour";
    case "champ": return "Champions Tour";
    case "lpga": return "LPGA";
    case "let": return "Ladies European Tour";
    case "amateur-no": return "Norge · Amatør";
    case "junior-no": return "Norge · Junior";
    default: return "Turnering";
  }
}

function formaterTier(t: string): string {
  switch (t) {
    case "pro-pga": return "Pro · PGA";
    case "pro-dp": return "Pro · DP World";
    case "pro-lpga": return "Pro · LPGA";
    case "amateur": return "Amatør";
    case "junior": return "Junior";
    case "college": return "College";
    default: return "Pro";
  }
}
