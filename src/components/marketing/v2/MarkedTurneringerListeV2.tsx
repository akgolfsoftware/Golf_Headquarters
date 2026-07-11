"use client";

/**
 * AK Golf HQ v2 — markedsside TURNERINGER-LISTE (/turneringer), retning C,
 * mørk. Ekte copy + datalogikk speilet fra (mlegacy)/turneringer/page.tsx.
 * Data (DataGolf/NGF-sync via cron) hentes server-side i page.tsx.
 */
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps, StatusPill } from "@/components/v2";
import { FlagGlyph } from "@/components/stats/flag-glyph";
import { MRamme, HeroT, SeksT, Lede, MCta, Seksjon, useMobile } from "./marked-ramme";

export type Tab = "alle" | "norske" | "norge" | "pro";

export type TurneringKortData = {
  id: string;
  slug: string | null;
  name: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  tour: string | null;
  status: string | null;
  norskeCount: number;
};

export type NorskeEntry = {
  id: string;
  status: string;
  position: number | null;
  scoreToPar: number | null;
  player: { id: string; name: string; slug: string; tier: string; photoUrl: string | null };
  tournament: { id: string; name: string; slug: string | null; startDate: Date; tour: string | null; status: string | null; location: string | null };
};

export type Counts = { alle: number; norge: number; pro: number; norske: number };

const NB = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" });

const TABS: { id: Tab; l: string }[] = [
  { id: "alle", l: "Alle" },
  { id: "norske", l: "Med nordmenn" },
  { id: "norge", l: "Norge" },
  { id: "pro", l: "Pro" },
];

export function MarkedTurneringerListeV2({
  tab,
  tournaments,
  norskeDenneUka,
  counts,
}: {
  tab: Tab;
  tournaments: TurneringKortData[];
  norskeDenneUka: NorskeEntry[];
  counts: Counts;
}) {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="turneringer">
      {/* Hero */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 24 : 40 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: T.mono,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: T.fg2,
            background: T.panel2,
            border: `1px solid ${T.border}`,
            borderRadius: 9999,
            padding: "6px 12px",
            marginBottom: 18,
          }}
        >
          <Icon name="trophy" size={13} style={{ color: T.lime }} />
          Oppdateres automatisk hver dag
        </span>
        <HeroT mobile={mobile} em="Hele oversikten.">Turneringer.</HeroT>
        <Lede style={{ marginTop: 18 }}>
          PGA, DP World, LPGA, LET, Challenge, Korn Ferry, norske amatør- og junior-turneringer. Følg nordmenn live på ett sted, ingen logg-inn.
        </Lede>
      </Seksjon>

      {/* Norske denne uka */}
      {norskeDenneUka.length > 0 && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0, paddingBottom: 0 }}>
          <Caps color={T.lime}>Nordmenn denne uka</Caps>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10, marginTop: 14 }}>
            {norskeDenneUka.map((e) => (
              <div
                key={e.id}
                style={{
                  flex: "none",
                  minWidth: 220,
                  background: T.panel,
                  border: `1px solid ${T.borderS}`,
                  borderRadius: T.rCard,
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FlagGlyph code="no" size={14} />
                  <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg }}>{e.player.name}</span>
                </div>
                <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {e.tournament.name}
                </div>
                {e.tournament.status === "IN_PROGRESS" && e.position !== null && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.lime }}>{e.position}.</span>
                    {e.scoreToPar !== null && (
                      <span style={{ fontFamily: T.mono, fontSize: 12, color: T.fg2 }}>{formaterToPar(e.scoreToPar)}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Seksjon>
      )}

      {/* Tab-bar */}
      <Seksjon mobile={mobile} style={{ paddingTop: 24, paddingBottom: 0 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TABS.map((t) => {
            const aktiv = tab === t.id;
            const count = counts[t.id];
            return (
              <Link
                key={t.id}
                href={`/turneringer?tab=${t.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: T.ui,
                  fontSize: 13,
                  fontWeight: 600,
                  color: aktiv ? T.onLime : T.fg2,
                  background: aktiv ? T.lime : T.panel2,
                  border: `1px solid ${aktiv ? "transparent" : T.border}`,
                  borderRadius: 9999,
                  padding: "8px 14px",
                  textDecoration: "none",
                }}
              >
                {t.l}
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    color: aktiv ? T.onLime : T.mut,
                    background: aktiv ? "rgba(13,14,13,0.18)" : T.panel3,
                    borderRadius: 9999,
                    padding: "2px 7px",
                  }}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </Seksjon>

      {/* Liste */}
      <Seksjon mobile={mobile}>
        {tournaments.length === 0 ? (
          <Kort pad="48px" style={{ textAlign: "center", alignItems: "center", border: `1px dashed ${T.border}` }}>
            <Icon name="trophy" size={32} style={{ color: T.mut }} />
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 14 }}>Ingen turneringer i denne kategorien</span>
            <span style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginTop: 6 }}>Vi henter data daglig. Kom tilbake om en stund.</span>
          </Kort>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
            {tournaments.map((t) => (
              <TurneringKort key={t.id} t={t} />
            ))}
          </div>
        )}
      </Seksjon>

      {/* Mersalg */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Kort tint pad={mobile ? "26px 22px" : "36px 40px"}>
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <SeksT mobile={mobile} em="Lær av dem også.">Følger du proffene?</SeksT>
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

function TurneringKort({ t }: { t: TurneringKortData }) {
  const datoTekst = t.endDate ? `${NB.format(t.startDate)}–${NB.format(t.endDate)}` : NB.format(t.startDate);
  const erLive = t.status === "IN_PROGRESS";
  return (
    <Link href={t.slug ? `/turneringer/${t.slug}` : "/turneringer"} style={{ textDecoration: "none" }}>
      <Kort pad="22px" hover style={{ height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <Caps>{formaterTour(t.tour)}</Caps>
          {erLive && <StatusPill tone="down">Live</StatusPill>}
        </div>
        <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 10, display: "block", letterSpacing: "-0.015em", lineHeight: 1.25 }}>
          {t.name}
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>
            <Icon name="calendar" size={13} style={{ color: T.mut }} />
            {datoTekst}
          </span>
          {t.location && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>
              <Icon name="map-pin" size={13} style={{ color: T.mut }} />
              {t.location}
            </span>
          )}
        </div>
        {t.norskeCount > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 16,
              width: "fit-content",
              fontFamily: T.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.lime,
              background: "color-mix(in srgb, " + T.lime + " 12%, transparent)",
              borderRadius: 9999,
              padding: "5px 10px",
            }}
          >
            <FlagGlyph code="no" size={11} />
            {t.norskeCount} {t.norskeCount === 1 ? "norsk spiller" : "norske spillere"}
          </div>
        )}
      </Kort>
    </Link>
  );
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
    case "college": return "College";
    default: return "Turnering";
  }
}
