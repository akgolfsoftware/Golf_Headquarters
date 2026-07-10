"use client";

/**
 * AK Golf HQ v2 — markedsside TURNERING-DETALJ (/turneringer/[slug]),
 * retning C, mørk. Ekte copy + datalogikk speilet fra
 * (mlegacy)/turneringer/[slug]/page.tsx (KPI-er, leaderboard, norske i
 * aksjon). Prisma-henting + JSON-LD/LiveRefresher gjøres i page.tsx.
 */
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps, StatusPill } from "@/components/v2";
import { FlagGlyph } from "@/components/stats/flag-glyph";
import { MRamme, Eyebrow, HeroT, MCta, Seksjon, useMobile } from "./marked-ramme";

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
  const mobile = useMobile();

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
    <MRamme mobile={mobile} aktiv="turneringer">
      {/* Hero */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 24 : 32 }}>
        <MCta ghost small icon="arrow-left" href="/turneringer">
          Alle turneringer
        </MCta>
        <div style={{ marginTop: 20 }}>
          <Eyebrow>{`${formaterTour(t.tour)} · ${datoStr}`}</Eyebrow>
        </div>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", alignItems: mobile ? "flex-start" : "flex-start", gap: 16 }}>
          <HeroT mobile={mobile}>{t.name}</HeroT>
          <div style={{ textAlign: mobile ? "left" : "right", flex: "none" }}>
            {t.location && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: mobile ? "flex-start" : "flex-end", fontFamily: T.ui, fontSize: 14, color: T.fg2 }}>
                <Icon name="map-pin" size={14} style={{ color: T.lime }} />
                {t.location}
              </div>
            )}
            {t.officialUrl && (
              <a
                href={t.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: mobile ? "flex-start" : "flex-end", fontFamily: T.ui, fontSize: 12.5, color: T.lime, marginTop: 6, textDecoration: "none" }}
              >
                Offisiell side <Icon name="external-link" size={12} />
              </a>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
          {erLive && <StatusPill tone="down">Pågår nå</StatusPill>}
          {erFerdig && <StatusPill tone="info">Ferdigspilt</StatusPill>}
          {erKommende && <StatusPill tone="lime">Kommende</StatusPill>}
          {t.winnerName && erFerdig && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontSize: 13, color: T.fg2, border: `1px solid ${T.borderS}`, borderRadius: 9999, padding: "5px 14px" }}>
              <Icon name="trophy" size={13} style={{ color: T.lime }} />
              Vinner: <strong style={{ color: T.fg }}>{t.winnerName}</strong>
            </span>
          )}
        </div>
      </Seksjon>

      {/* KPI-strip */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: T.gap }}>
          <Kort pad="18px 20px"><Caps>Deltakere</Caps><span style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: T.fg, marginTop: 10, display: "block" }}>{alle.length}</span></Kort>
          <Kort pad="18px 20px"><Caps>Norske</Caps><span style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: T.lime, marginTop: 10, display: "block" }}>{norske.length}</span></Kort>
          <Kort pad="18px 20px">
            <Caps>{erFerdig ? "Vinnerscore" : "Leder"}</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: T.fg, marginTop: 10, display: "block" }}>{lederToPar !== null ? formaterToPar(lederToPar) : "—"}</span>
            <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 4, display: "block" }}>{lederToPar !== null ? (erFerdig ? "Sluttresultat" : "Beste score til par") : "Ikke startet"}</span>
          </Kort>
          <Kort pad="18px 20px">
            <Caps>Runde</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: T.fg, marginTop: 10, display: "block" }}>{naavarendeRunde !== null ? `R${naavarendeRunde}` : "—"}</span>
            <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 4, display: "block" }}>{erLive ? "Pågår nå" : erFerdig ? "Fullført" : "Ikke startet"}</span>
          </Kort>
        </div>
      </Seksjon>

      {/* Norske i aksjon */}
      {norske.length > 0 && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Caps color={T.lime}>Norske i aksjon</Caps>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)", gap: T.gap, marginTop: 14 }}>
            {norske.map((e) => (
              <Kort key={e.id} tint pad="22px">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FlagGlyph code="no" size={16} />
                  <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg }}>{e.player.name}</span>
                </div>
                <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
                  {erLive && e.position !== null && (
                    <>
                      <div>
                        <Caps size={9}>Posisjon</Caps>
                        <span style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 700, color: T.lime, marginTop: 4, display: "block" }}>
                          {e.tied ? `T${e.position}` : e.position}
                        </span>
                      </div>
                      {e.scoreToPar !== null && (
                        <div>
                          <Caps size={9}>Score til par</Caps>
                          <span style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 700, marginTop: 4, display: "block", color: e.scoreToPar < 0 ? T.up : e.scoreToPar > 0 ? T.down : T.fg }}>
                            {formaterToPar(e.scoreToPar)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <Caps size={9}>{formaterTier(e.player.tier)}</Caps>
                    {e.status === "CUT" && (
                      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, background: T.panel2, borderRadius: 5, padding: "3px 8px", marginTop: 6, display: "inline-block", textTransform: "uppercase" }}>
                        Cut
                      </span>
                    )}
                  </div>
                </div>
              </Kort>
            ))}
          </div>
        </Seksjon>
      )}

      {/* Full leaderboard */}
      {alle.length > 0 && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <Caps>Leaderboard</Caps>
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg, marginTop: 6, display: "block" }}>Hele feltet: {alle.length} spillere</span>
            </div>
            {t.leaderboardSnapAt && (
              <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>
                Sist oppdatert {NB_TIME.format(t.leaderboardSnapAt)}
              </span>
            )}
          </div>

          <div style={{ overflowX: "auto", marginTop: 18 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.mono, fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.borderS}` }}>
                  <Th align="left">Pos</Th>
                  <Th align="left">Spiller</Th>
                  <Th align="left">Land</Th>
                  {erLive && <Th align="right">Til par</Th>}
                  {erLive && <Th align="right">Thru</Th>}
                  <Th align="right">Status</Th>
                </tr>
              </thead>
              <tbody>
                {alle.map((e, i) => (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${T.border}`, background: e.player.country === "NO" ? "color-mix(in srgb, " + T.lime + " 6%, transparent)" : "transparent" }}>
                    <td style={{ padding: "12px 16px 12px 0", color: i < 3 ? T.lime : T.mut, fontWeight: i < 3 ? 700 : 500 }}>
                      {e.tied && e.position !== null ? `T${e.position}` : (e.position ?? i + 1)}
                    </td>
                    <td style={{ padding: "12px 16px 12px 0", fontFamily: T.ui, fontWeight: 600, fontSize: 13.5, color: T.fg }}>
                      {e.player.name}
                      {e.player.country === "NO" && <Icon name="star" size={11} style={{ color: T.lime, marginLeft: 6 }} />}
                    </td>
                    <td style={{ padding: "12px 16px 12px 0" }}>
                      <FlagGlyph code={e.player.country?.toLowerCase() ?? "xx"} size={13} />
                    </td>
                    {erLive && (
                      <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 600, color: e.scoreToPar !== null ? (e.scoreToPar < 0 ? T.up : e.scoreToPar > 0 ? T.down : T.fg) : T.mut }}>
                        {e.scoreToPar !== null ? formaterToPar(e.scoreToPar) : "—"}
                      </td>
                    )}
                    {erLive && (
                      <td style={{ padding: "12px 0 12px 16px", textAlign: "right", color: T.mut }}>
                        {e.status === "CUT" ? "—" : e.thru === null ? "—" : e.thru >= 18 ? "F" : e.thru}
                      </td>
                    )}
                    <td style={{ padding: "12px 0", textAlign: "right" }}>
                      {e.status === "CUT" ? (
                        <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, background: T.panel2, borderRadius: 4, padding: "2px 7px" }}>Cut</span>
                      ) : (
                        <span style={{ color: T.mut, fontSize: 11 }}>{formaterTier(e.player.tier)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Seksjon>
      )}

      {/* Tom-tilstand */}
      {alle.length === 0 && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Kort pad="48px" style={{ textAlign: "center", alignItems: "center", border: `1px dashed ${T.border}` }}>
            <Icon name="trophy" size={32} style={{ color: T.mut }} />
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 14 }}>Deltakerliste oppdateres</span>
            <span style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginTop: 6 }}>Vi henter felt-listen automatisk så snart turneringen er i gang.</span>
          </Kort>
        </Seksjon>
      )}

      {/* Mersalg */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Kort tint pad={mobile ? "26px 22px" : "36px 40px"}>
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 22 : 26, color: T.fg, letterSpacing: "-0.02em" }}>
                Følger du proffene? <em style={{ fontStyle: "italic", color: T.lime }}>Lær av dem også.</em>
              </span>
              <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 480 }}>
                PlayerHQ gir deg treningsdagbok, statistikk og AI-coach. Bygd av coacher med 10+ års erfaring.
              </p>
            </div>
            <MCta icon="arrow-right" href="/auth/signup">
              Kom i gang gratis
            </MCta>
          </div>
        </Kort>
      </Seksjon>
    </MRamme>
  );
}

function Th({ children, align }: { children: React.ReactNode; align: "left" | "right" }) {
  return (
    <th style={{ padding: align === "left" ? "10px 16px 10px 0" : "10px 0", textAlign: align, fontWeight: 500, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>
      {children}
    </th>
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
