"use client";

/**
 * PlayerHQ Coach Meldinger — v2 (retning C «Presis»). Rekomponerer den ekte
 * skjermen (src/app/portal/coach/melding/page.tsx + /[id]): meldingsinnboks
 * (tråd-liste) + valgt tråd med chat-bobler. EKTE data fra CoachingSession
 * (kind DIRECT) — montert i (v2preview)/v2-coach-melding/page.tsx.
 *
 * Kun v2-komponenter fra "@/components/v2"; ingen ad-hoc UI, ingen rå hex
 * (kun T.*). Ærlighet: tom innboks / tom tråd får ærlig tom-tilstand — ingen
 * fabrikkert historikk. Ordbok låst (Situasjon/økt/Nærspill). Norsk bokmål.
 *
 * Mobil (M3, bølge 3): master/detail. På mobil vises trådlista full bredde;
 * valg av den innlastede tråden åpner tråd-visningen med tilbake-lenke og et
 * tommelvennlig komponer-felt forankret nederst i samtale-kortet (safe-area).
 * Desktop-oppførsel er uendret (innboks + valgt tråd side-om-side).
 *
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  Knapp,
  CTAPill,
  StatusPill,
  AvatarInit,
  TomTilstand,
  MeldingsTraad,
  Skrivefelt,
  ForslagRad,
  Icon,
  type Melding,
} from "@/components/v2";

/* ── Datakontrakt (speil av CoachingSession-innboksen) ─────────────── */

export type MeldingTraad = {
  id: string;
  coachNavn: string;
  antall: number;
  snippet: string;
  /** Forhåndsformatert kort dato (dd.MM) — serverberegnet. */
  datoKort: string;
};

export type CoachMeldingerData = {
  /** true = tier GRATIS (Pro-gate på direkte coach-meldinger). */
  gratis: boolean;
  hovedcoach: { navn: string } | null;
  traader: MeldingTraad[];
  /** Én ekte tråd (nyeste med innhold) for forhåndsvisning. */
  valgt: { id: string; coachNavn: string; meldinger: Melding[] } | null;
};

/* Hurtigsvar-maler — SAMME copy som komposisjons-flyten (HURTIGVALG i
   CoachMeldingNyV2.tsx). Ingen ny UI-tekst diktes opp her; malene gjenbrukes
   verbatim slik at spilleren møter samme raske svar begge steder. */
const HURTIGSVAR = ["Kan vi bytte tid?", "Sett meg opp på range", "Se siste TrackMan-økt"];

/* ── Ren hjelper ───────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px. */
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

export function CoachMeldingerV2({ data }: { data: CoachMeldingerData }) {
  const mobile = useMobile();
  const { gratis, hovedcoach, traader, valgt } = data;

  // Mobil master/detail: hvilken visning som er åpen + presentasjons-utkast.
  const [visTraad, setVisTraad] = useState(false);
  const [utkast, setUtkast] = useState("");

  const fornavn = hovedcoach?.navn.split(" ")[0] ?? "coach";

  // Pro-gate — direkte coach-meldinger krever PlayerHQ Pro (uendret regel).
  if (gratis) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>Coach · Meldinger</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="Pro">Krever</Tittel>
          </div>
        </div>
        <Kort tint>
          <TomTilstand
            icon="lock"
            title="Direkte coach-meldinger er en Pro-funksjon"
            sub="Meldinger til coachen din er en del av PlayerHQ Pro (299 kr/mnd)."
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <Link href="/portal/meg/abonnement" style={{ textDecoration: "none" }}>
              <CTAPill icon="arrow-right">Oppgrader til Pro</CTAPill>
            </Link>
          </div>
        </Kort>
      </div>
    );
  }

  // ── Mobil tråd-visning (detail) ─────────────────────────────────────
  // Kun tilgjengelig for den innlastede tråden (valgt) — andre tråder
  // navigerer til sin egen rute fra lista.
  if (mobile && visTraad && valgt) {
    const coachFornavn = valgt.coachNavn.split(" ")[0];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Knapp ghost icon="arrow-left" onClick={() => setVisTraad(false)}>
            Innboks
          </Knapp>
        </div>

        <Kort
          pad="0"
          style={{ overflow: "hidden", maxHeight: "calc(100vh - 240px)", minHeight: 320 }}
        >
          {/* Coach-hode */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "14px 16px",
              borderBottom: `1px solid ${T.border}`,
              flex: "none",
            }}
          >
            <AvatarInit navn={valgt.coachNavn} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 700, color: T.fg }}>{valgt.coachNavn}</div>
              <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 2 }}>Hovedcoach · GFGK</div>
            </div>
            <StatusPill tone="up">Pålogget</StatusPill>
          </div>

          {/* Bobler (scroller) */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 16px" }}>
            <MeldingsTraad meldinger={valgt.meldinger} />
          </div>

          {/* Komponer-felt — forankret nederst i samtale-kortet, safe-area-padding.
              Presentasjon: send tømmer utkastet (denne skjermen endrer ikke data —
              persistert send skjer i /portal/coach/melding/ny). */}
          <div
            style={{
              flex: "none",
              position: "sticky",
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              borderTop: `1px solid ${T.border}`,
              background: T.panel,
              padding: "12px 14px calc(12px + env(safe-area-inset-bottom))",
            }}
          >
            <ForslagRad items={HURTIGSVAR} onPick={(s) => setUtkast(s)} />
            <Skrivefelt
              value={utkast}
              onChange={setUtkast}
              onSend={() => setUtkast("")}
              placeholder={`Svar ${coachFornavn} …`}
            />
          </div>
        </Kort>
      </div>
    );
  }

  // ── Delt hode + mottaker (desktop og mobil liste-visning) ───────────
  const innboksKort = (
    <Kort eyebrow="Innboks" action={<Caps size={9}>{traader.length} tråd{traader.length !== 1 ? "er" : ""}</Caps>}>
      {traader.length > 0 ? (
        traader.map((t, i) => {
          const leading = <AvatarInit navn={t.coachNavn} size={34} />;
          const meta = (
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flex: "none" }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, fontVariantNumeric: "tabular-nums" }}>{t.datoKort}</span>
              <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut }}>{t.antall}</span>
            </span>
          );
          // På mobil åpner den innlastede tråden detail-visningen i appen;
          // øvrige tråder navigerer til sin egen rute (som på desktop).
          const åpnesLokalt = mobile && !!valgt && t.id === valgt.id;
          const rad = (
            <Rad
              leading={leading}
              title={t.coachNavn}
              sub={t.snippet}
              meta={meta}
              last={i === traader.length - 1}
              onClick={åpnesLokalt ? () => setVisTraad(true) : undefined}
            />
          );
          if (åpnesLokalt) return <div key={t.id}>{rad}</div>;
          return (
            <Link
              key={t.id}
              href={`/portal/coach/melding/${t.id}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              {rad}
            </Link>
          );
        })
      ) : (
        <TomTilstand icon="message-circle" title="Ingen meldinger ennå" sub="Start en samtale med coachen din." />
      )}
    </Kort>
  );

  const valgtKort = (
    <Kort eyebrow={valgt ? `Samtale · ${valgt.coachNavn}` : "Samtale"}>
      {valgt ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 11, paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.border}` }}>
            <AvatarInit navn={valgt.coachNavn} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 700, color: T.fg }}>{valgt.coachNavn}</div>
              <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 2 }}>Hovedcoach · GFGK</div>
            </div>
            <StatusPill tone="up">Pålogget</StatusPill>
          </div>
          <MeldingsTraad meldinger={valgt.meldinger} />
        </>
      ) : (
        <TomTilstand icon="message-circle" title="Ingen tråd valgt" sub="Velg en samtale i innboksen for å lese meldingene." />
      )}
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>Coach · Meldinger</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile}>Meldinger</Tittel>
          </div>
        </div>
        {hovedcoach && (
          <Link href="/portal/coach/melding/ny" className="hidden md:block" style={{ textDecoration: "none" }}>
            <CTAPill icon="send">Ny melding</CTAPill>
          </Link>
        )}
      </div>

      {/* Mottaker / ny melding */}
      <Kort eyebrow="Til">
        {hovedcoach ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AvatarInit navn={hovedcoach.navn} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 700, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {hovedcoach.navn}
              </div>
              <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>Hovedcoach</div>
            </div>
            <Link href="/portal/coach/melding/ny" className="md:hidden" style={{ textDecoration: "none" }}>
              <CTAPill icon="send">Ny melding</CTAPill>
            </Link>
          </div>
        ) : (
          <TomTilstand icon="user" title="Ingen coach koblet" sub="Coachen din vises her når dere er koblet." />
        )}
      </Kort>

      {/* Innboks (+ valgt tråd på desktop). Mobil: innboks full bredde;
          tråd-visningen åpnes fra lista (master/detail over). */}
      {mobile ? (
        innboksKort
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]" style={{ gap: T.gap, alignItems: "start" }}>
          {innboksKort}
          {valgtKort}
        </div>
      )}

      {/* Q&A — spørsmål direkte til coachen */}
      <Kort eyebrow={`Q&A med ${fornavn}`}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <Icon name="help-circle" size={18} style={{ color: T.lime, flex: "none", marginTop: 2 }} />
          <p style={{ flex: 1, minWidth: 180, fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
            Still spørsmål direkte til coachen din. Coachen svarer typisk innen 4 timer på hverdager.
          </p>
          <Link href="/portal/coach/sporsmal/ny" style={{ textDecoration: "none" }}>
            <CTAPill icon="send">Still spørsmål</CTAPill>
          </Link>
        </div>
      </Kort>
    </div>
  );
}
