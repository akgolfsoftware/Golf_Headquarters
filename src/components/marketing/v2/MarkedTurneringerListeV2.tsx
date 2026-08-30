/**
 * AK Golf HQ — markedsside TURNERINGER-LISTE (/turneringer), Paper.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html
 * (§filterrad + §kat) — retematchet med pk-tokens, tab-rad = filterrad-mønster.
 * Ekte copy + datalogikk speilet fra (mlegacy)/turneringer/page.tsx. Data
 * (DataGolf/NGF-sync via cron) hentes server-side i page.tsx.
 */
import Link from "next/link";
import { Icon, StatusPill } from "@/components/v2";
import { FlagGlyph } from "@/components/stats/flag-glyph";
import { PkShell } from "./kit/PkShell";
import { PkSek, PkEyebrow, PkHero, PkIng, PkCta, PkKat, PkTom } from "./kit/PkPrimitives";

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
  return (
    <PkShell aktiv="/turneringer" dataSlug="marketing-turneringer-liste">
      <PkSek>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--tl-font-mono)",
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--tl-mute)",
            background: "var(--tl-dock)",
            border: "1px solid var(--tl-hair)",
            borderRadius: 9999,
            padding: "6px 12px",
            marginBottom: 18,
          }}
        >
          <Icon name="trophy" size={13} style={{ color: "var(--tl-warm)" }} />
          Oppdateres automatisk hver dag
        </span>
        <PkHero>Turneringer. Hele oversikten.</PkHero>
        <PkIng>
          PGA, DP World, LPGA, LET, Challenge, Korn Ferry, norske amatør- og junior-turneringer. Følg
          nordmenn live på ett sted, ingen logg-inn.
        </PkIng>
      </PkSek>

      {norskeDenneUka.length > 0 && (
        <PkSek notop style={{ paddingBottom: 0 }}>
          <PkEyebrow>Nordmenn denne uka</PkEyebrow>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10, marginTop: 14 }}>
            {norskeDenneUka.map((e) => (
              <div key={e.id} className="pk-kort pk-kort-pad" style={{ flex: "none", minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FlagGlyph code="no" size={14} />
                  <span style={{ fontFamily: "var(--tl-font-sans)", fontWeight: 600, fontSize: 14.5, color: "var(--tl-text)" }}>{e.player.name}</span>
                </div>
                <div style={{ fontFamily: "var(--tl-font-sans)", fontSize: 11.5, color: "var(--tl-mute)", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {e.tournament.name}
                </div>
                {e.tournament.status === "IN_PROGRESS" && e.position !== null && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                    <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 18, fontWeight: 700, color: "var(--tl-warm)" }}>{e.position}.</span>
                    {e.scoreToPar !== null && <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 12, color: "var(--tl-mute)" }}>{formaterToPar(e.scoreToPar)}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </PkSek>
      )}

      <PkSek notop style={{ paddingBottom: 0 }}>
        <div className="pk-filterrad" role="group" aria-label="Filtrer turneringer">
          {TABS.map((t) => {
            const aktiv = tab === t.id;
            return (
              <Link key={t.id} href={`/turneringer?tab=${t.id}`} aria-current={aktiv ? "true" : undefined}>
                {t.l} · {counts[t.id]}
              </Link>
            );
          })}
        </div>
      </PkSek>

      <PkSek>
        {tournaments.length === 0 ? (
          <PkTom title="Ingen turneringer i denne kategorien" description="Vi henter data daglig. Kom tilbake om en stund." />
        ) : (
          <PkKat>
            {tournaments.map((t) => (
              <TurneringKort key={t.id} t={t} />
            ))}
          </PkKat>
        )}
      </PkSek>

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

function TurneringKort({ t }: { t: TurneringKortData }) {
  const datoTekst = t.endDate ? `${NB.format(t.startDate)}–${NB.format(t.endDate)}` : NB.format(t.startDate);
  const erLive = t.status === "IN_PROGRESS";
  return (
    <Link href={t.slug ? `/turneringer/${t.slug}` : "/turneringer"} className="pk-kort pk-kort-hover">
      <div className="pk-kort-body">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span className="pk-eyebrow">{formaterTour(t.tour)}</span>
          {erLive && <StatusPill tone="down">Live</StatusPill>}
        </div>
        <span className="pk-navn" style={{ marginTop: 10, fontSize: 17 }}>
          {t.name}
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--tl-font-sans)", fontSize: 12, color: "var(--tl-mute)" }}>
            <Icon name="calendar" size={13} />
            {datoTekst}
          </span>
          {t.location && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--tl-font-sans)", fontSize: 12, color: "var(--tl-mute)" }}>
              <Icon name="map-pin" size={13} />
              {t.location}
            </span>
          )}
        </div>
        {t.norskeCount > 0 && (
          <div style={{ marginTop: 14 }}>
            <span className="pk-tag pk-tag-accent" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <FlagGlyph code="no" size={11} />
              {t.norskeCount} {t.norskeCount === 1 ? "norsk spiller" : "norske spillere"}
            </span>
          </div>
        )}
      </div>
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
