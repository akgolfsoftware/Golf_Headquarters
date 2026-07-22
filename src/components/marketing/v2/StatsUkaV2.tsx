"use client";

/**
 * AK Golf HQ v2 — /stats/uka (retning C, mørk).
 * Swap av (mlegacy)/stats/uka/page.tsx → v2-utseende. Ekte ukesdata
 * (getUkesData: norske resultater, ukens spiller/runde, kommende turneringer)
 * hentes 1:1 server-side i page.tsx og formateres til strenger der.
 */
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps, KpiFlis, DataTabell, TomTilstand } from "@/components/v2";
import type { DataTabellRow } from "@/components/v2";
import { StatsRamme, StatsStatusBar, useMobile } from "./stats-ramme";
import { Eyebrow, HeroT, SeksT, MCta, Seksjon } from "./marked-ramme";

export interface StatsUkaResultat {
  id: string;
  tour: string;
  spiller: string;
  spillerSlug: string;
  turnering: string;
  posisjonTekst: string;
  scoreTekst: string;
}

export interface StatsUkaKommende {
  id: string;
  dato: string;
  navn: string;
  tour: string | null;
  norske: number | null;
}

export interface StatsUkaV2Props {
  ukeNummer: number;
  aar: number;
  fraTilTekst: string;
  antallSpillere: number;
  antallTurneringer: number;
  antallResultater: number;
  ukensSpiller: { navn: string; turnering: string; posisjonTekst: string; scoreTekst: string; slug: string } | null;
  ukensRunde: { score: string; turnering: string; spiller: string; tour: string } | null;
  resultater: StatsUkaResultat[];
  pullquote: string;
  kommende: StatsUkaKommende[];
}

export function StatsUkaV2({
  ukeNummer,
  aar,
  fraTilTekst,
  antallSpillere,
  antallTurneringer,
  antallResultater,
  ukensSpiller,
  ukensRunde,
  resultater,
  pullquote,
  kommende,
}: StatsUkaV2Props) {
  const mobile = useMobile();

  const resultatRader: DataTabellRow[] = resultater.slice(0, 25).map((r) => ({
    tour: r.tour,
    spiller: r.spiller,
    turnering: r.turnering,
    pos: r.posisjonTekst,
    score: r.scoreTekst,
  }));

  return (
    <StatsRamme mobile={mobile}>
      {/* Hero */}
      <Seksjon mobile={mobile}>
        <Eyebrow>
          Uke {ukeNummer} · {aar} · {fraTilTekst}
        </Eyebrow>
        <StatsStatusBar
          label={
            antallSpillere > 0
              ? `${antallSpillere} norske spilte`
              : "Ingen resultater ennå"
          }
          tone={antallSpillere > 0 ? "up" : "info"}
          meta={`${antallTurneringer} turneringer · ${antallResultater} resultater`}
        />
        <HeroT mobile={mobile} em="denne uken.">
          Norsk golf
        </HeroT>
        <p style={{ fontFamily: T.ui, fontSize: 15, color: T.fg2, marginTop: 18, maxWidth: 520, lineHeight: 1.6 }}>
          Alle norske resultater, ukens spiller og hva som venter neste uke, på 60 sekunder.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
          <MCta icon="arrow-right" href="/stats/norske">
            Se norske i aksjon
          </MCta>
          <MCta ghost href="/stats/spillere">
            Hele databasen
          </MCta>
        </div>
      </Seksjon>

      {/* KPI-strip */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: T.gap }}>
          <KpiFlis label="Norske spillere · spilte denne uka" value={antallSpillere} />
          <KpiFlis label="Turneringer · på tvers av tourer" value={antallTurneringer} />
          <KpiFlis label="Resultater registrert" value={antallResultater} tint />
        </div>
      </Seksjon>

      {/* Ukens spiller */}
      {ukensSpiller && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Caps style={{ marginBottom: 16 }}>Ukens spiller</Caps>
          <Kort tint pad={mobile ? "22px" : "32px 36px"}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 24 : 32, color: T.fg, letterSpacing: "-0.01em" }}>{ukensSpiller.navn}</div>
            <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, marginTop: 12, lineHeight: 1.6, maxWidth: 560 }}>
              Beste norske i {ukensSpiller.turnering}: posisjon {ukensSpiller.posisjonTekst} med totalscore {ukensSpiller.scoreTekst}.
            </p>
            <Link href={`/stats/spillere/${ukensSpiller.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 18, fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.lime, textDecoration: "none" }}>
              Se hele profilen <Icon name="arrow-right" size={13} />
            </Link>
          </Kort>
        </Seksjon>
      )}

      {/* Ukens runde */}
      {ukensRunde && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Caps style={{ marginBottom: 16 }}>Ukens runde</Caps>
          <Kort pad={mobile ? "22px" : "32px 36px"}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, flexWrap: "wrap" }}>
              <span style={{ fontFamily: T.mono, fontSize: 56, fontWeight: 700, lineHeight: 1, color: T.lime, fontVariantNumeric: "tabular-nums" }}>{ukensRunde.score}</span>
              <div>
                <div style={{ fontFamily: T.disp, fontSize: 18, fontWeight: 700, color: T.fg }}>{ukensRunde.turnering}</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 4 }}>
                  av {ukensRunde.spiller} · {ukensRunde.tour}
                </div>
              </div>
            </div>
          </Kort>
        </Seksjon>
      )}

      {/* Resultatliste */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Caps>Alle norske</Caps>
        <div style={{ marginTop: 14, marginBottom: 20 }}>
          <SeksT mobile={mobile} em="denne uken.">
            Resultater
          </SeksT>
        </div>
        {resultatRader.length === 0 ? (
          <Kort>
            <TomTilstand icon="calendar" title="Ingen norske resultater ennå" sub="Resultater dukker opp her fortløpende gjennom uken." />
          </Kort>
        ) : (
          <Kort pad={mobile ? "16px" : "20px 22px"}>
            <DataTabell
              columns={[
                { key: "tour", label: "Tour" },
                { key: "spiller", label: "Spiller" },
                { key: "turnering", label: "Turnering" },
                { key: "pos", label: "Pos", align: "right" },
                { key: "score", label: "Score", mono: true, align: "right" },
              ]}
              rows={resultatRader}
              sortKey="pos"
              sortDir="asc"
              mobilKort
            />
          </Kort>
        )}
      </Seksjon>

      {/* Pullquote */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Kort pad={mobile ? "26px 22px" : "40px 48px"} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: T.disp, fontSize: mobile ? 20 : 26, fontWeight: 600, color: T.fg, lineHeight: 1.4, fontStyle: "italic", maxWidth: 640, margin: "0 auto" }}>
            &ldquo;{pullquote}&rdquo;
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, marginTop: 18 }}>
            AK Golf Stats redaksjon · uke {ukeNummer}
          </div>
        </Kort>
      </Seksjon>

      {/* Kommende uke */}
      {kommende.length > 0 && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Caps>Kommende uke</Caps>
          <div style={{ marginTop: 14, marginBottom: 20 }}>
            <SeksT mobile={mobile} em="neste uke?">
              Hva skjer
            </SeksT>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: T.gap }}>
            {kommende.map((t) => (
              <Kort key={t.id}>
                <Caps size={9}>{t.dato}</Caps>
                <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg, marginTop: 10, lineHeight: 1.3 }}>{t.navn}</div>
                {t.tour && <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.lime, marginTop: 6, letterSpacing: "0.04em" }}>{t.tour}</div>}
                {t.norske != null && t.norske > 0 && (
                  <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 4 }}>{t.norske} norske</div>
                )}
              </Kort>
            ))}
          </div>
        </Seksjon>
      )}

      {/* Nyhetsbrev CTA */}
      <Seksjon mobile={mobile}>
        <Kort tint pad={mobile ? "26px 22px" : "36px 40px"} style={{ display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>Få ukens roundup i innboksen.</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, marginTop: 8 }}>
              Hver mandag morgen · 60 sekunder å lese · gratis
            </div>
          </div>
          <form action="/api/newsletter/subscribe" method="POST" style={{ display: "flex", gap: 10, width: mobile ? "100%" : "auto" }}>
            <input
              type="email"
              name="email"
              placeholder="din@epost.no"
              required
              aria-label="E-postadresse for nyhetsbrev"
              style={{
                flex: mobile ? 1 : "none",
                width: mobile ? undefined : 220,
                boxSizing: "border-box",
                background: T.panel2,
                border: `1px solid ${T.borderS}`,
                borderRadius: 9999,
                padding: "11px 16px",
                fontFamily: T.ui,
                fontSize: 13.5,
                color: T.fg,
                outline: "none",
              }}
            />
            <MCta small icon="arrow-right">
              Meld på
            </MCta>
          </form>
        </Kort>
      </Seksjon>

      {/* Footer */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Link href="/stats" style={{ fontFamily: T.mono, fontSize: 12.5, color: T.mut, textDecoration: "none" }}>
          Tilbake til Stats Hub
        </Link>
      </Seksjon>
    </StatsRamme>
  );
}
