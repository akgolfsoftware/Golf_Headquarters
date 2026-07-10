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
  CTAPill,
  StatusPill,
  AvatarInit,
  TomTilstand,
  MeldingsTraad,
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

/* ── Ren hjelper ───────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tittelstørrelse). */
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
          <div className="hidden md:block">
            <CTAPill icon="send">Ny melding</CTAPill>
          </div>
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
            <div className="md:hidden">
              <CTAPill icon="send">Ny melding</CTAPill>
            </div>
          </div>
        ) : (
          <TomTilstand icon="user" title="Ingen coach koblet" sub="Coachen din vises her når dere er koblet." />
        )}
      </Kort>

      {/* Innboks + valgt tråd */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {/* Innboks */}
        <Kort eyebrow="Innboks" action={<Caps size={9}>{traader.length} tråd{traader.length !== 1 ? "er" : ""}</Caps>}>
          {traader.length > 0 ? (
            traader.map((t, i) => (
              <Link
                key={t.id}
                href={`/portal/coach/melding/${t.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <Rad
                  leading={<AvatarInit navn={t.coachNavn} size={34} />}
                  title={t.coachNavn}
                  sub={t.snippet}
                  meta={
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flex: "none" }}>
                      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, fontVariantNumeric: "tabular-nums" }}>{t.datoKort}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut }}>{t.antall}</span>
                    </span>
                  }
                  last={i === traader.length - 1}
                />
              </Link>
            ))
          ) : (
            <TomTilstand icon="message-circle" title="Ingen meldinger ennå" sub="Start en samtale med coachen din." />
          )}
        </Kort>

        {/* Valgt tråd */}
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
      </div>

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
