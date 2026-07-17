"use client";

/**
 * PlayerHQ Innstillinger · Integrasjoner — v2 (retning C «Presis»).
 * v2-port 17. juli 2026: erstatter athletic-versjonen (inkl. de hardkodede
 * brand-SVG-logoene med 14 rå hex — nå token-baserte Icon-emblemer, 0 hex).
 *
 * Ærlighet bevart 1:1 fra originalen:
 *  - Kun TrackMan og Google Calendar har ekte backing i databasen; status
 *    kommer fra faktiske rader (page.tsx). Resten vises som «tilgjengelig».
 *  - Ingen oppdiktede sync-tidspunkter eller datapunkt-tall.
 *  - Ingen selvbetjent connect-flyt finnes ennå → «Be om tilgang» og
 *    «Administrer» går ærlig til support, aldri en falsk koble-til-knapp.
 *
 * Kun v2-komponenter fra "@/components/v2" + T.*-tokens. Ingen rå hex.
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { T, Caps, Tittel, Kort, StatusPill, CTAPill, TomTilstand, Icon } from "@/components/v2";

/* ── Datakontrakt (kun ekte data fra page.tsx) ─────────────────────── */

export type InnstillingerIntegrasjonerData = {
  tm: {
    tilkoblet: boolean;
    /** Ferdigformatert «Sist synket» (nb-NO), eller «Ikke synket enda». */
    sistSynket: string;
    /** «N slag · kilde» for siste økt, eller null uten data. */
    sisteOkt: string | null;
  };
  gcal: {
    tilkoblet: boolean;
    sistSynket: string;
    /** «Aktiv» eller rå status-verdi, null uten tilkobling. */
    status: string | null;
  };
  /** Klokkeslett for siste TrackMan-synk (nb-NO), null uten synk. */
  sistSynkTid: string | null;
  /** Dato for siste TrackMan-synk (nb-NO), null uten synk. */
  sistSynkDato: string | null;
};

/* ── Katalog-typer ─────────────────────────────────────────────────── */

type Integrasjon = {
  navn: string;
  kategori: string;
  beskrivelse: string;
  /** Icon-navn fra v2-MAP-en — brand-logoer er erstattet med tokenbaserte emblemer. */
  ikon: string;
  tilkoblet: boolean;
  data?: { k: string; v: string }[];
  proBadge?: boolean;
};

/* ── Hjelpere ──────────────────────────────────────────────────────── */

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

/** Kvadratisk tjeneste-emblem (erstatter brand-SVG-ene — kun T.*-tokens). */
function Emblem({ ikon, aktiv }: { ikon: string; aktiv?: boolean }) {
  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: aktiv ? `color-mix(in srgb, ${T.lime} 10%, transparent)` : T.panel3,
        border: `1px solid ${T.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={ikon} size={18} style={{ color: aktiv ? T.lime : T.fg2 }} />
    </span>
  );
}

/** Nøytral «ikke tilkoblet»-pille (StatusPill-tonene er signal-farger). */
function IkkeTilkobletPill() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: T.mono,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: T.mut,
        background: T.panel2,
        border: `1px solid ${T.border}`,
        borderRadius: 9999,
        padding: "4px 9px",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: 9999, background: `color-mix(in srgb, ${T.mut} 55%, transparent)` }} />
      Ikke tilkoblet
    </span>
  );
}

function IntegrasjonKort({ integrasjon }: { integrasjon: Integrasjon }) {
  const { navn, kategori, beskrivelse, ikon, tilkoblet, data, proBadge } = integrasjon;
  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Emblem ikon={ikon} aktiv={tilkoblet} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{navn}</div>
          <Caps size={9} style={{ marginTop: 3 }}>{kategori}</Caps>
        </div>
        {proBadge && <StatusPill tone="lime">Pro</StatusPill>}
      </div>

      <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0" }}>
        {beskrivelse}
      </p>

      {data && data.length > 0 && (
        <dl
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            margin: "12px 0 0",
            padding: "10px 12px",
            borderRadius: 12,
            background: T.panel2,
            border: `1px solid ${T.border}`,
          }}
        >
          {data.map((d) => (
            <div key={d.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <dt style={{ margin: 0 }}>
                <Caps size={9} style={{ display: "inline" }}>{d.k}</Caps>
              </dt>
              <dd
                style={{
                  margin: 0,
                  fontFamily: T.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.fg,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {d.v}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
        {tilkoblet ? (
          <>
            <StatusPill tone="lime">Tilkoblet</StatusPill>
            {/* Tilkoblede kilder synkes automatisk (TrackMan fra studio-økter,
                kalender via coach-flyten). Spilleren har ingen egen re-synk-/
                administrasjons-action her ennå, så «Administrer» går ærlig til
                support i stedet for å være en død knapp. */}
            <span style={{ marginLeft: "auto" }}>
              <Link href="/portal/meg/help/kontakt" style={{ textDecoration: "none" }}>
                <CTAPill ghost>Administrer</CTAPill>
              </Link>
            </span>
          </>
        ) : (
          <>
            <IkkeTilkobletPill />
            {/* Spillere har foreløpig ingen ekte selvbetjent connect-flyt for
                disse kildene (Google Calendar-OAuth-en er coach-/admin-flyten —
                den pusher kun coachens kalender og lander på en admin-side, så
                den skal IKKE gjenbrukes her). Knappen er derfor en ærlig
                «be om tilgang»-lenke til support, ikke en falsk koble-til. */}
            <span style={{ marginLeft: "auto" }}>
              <Link href="/portal/meg/help/kontakt" style={{ textDecoration: "none" }}>
                <CTAPill icon="plug">Be om tilgang</CTAPill>
              </Link>
            </span>
          </>
        )}
      </div>
    </Kort>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function InnstillingerIntegrasjonerV2({ data }: { data: InnstillingerIntegrasjonerData }) {
  const mobile = useMobile();

  const tilkoblet: Integrasjon[] = [];
  const tilgjengelig: Integrasjon[] = [];

  // ── TrackMan (ekte backing: trackManSession) ──────────────────────
  if (data.tm.tilkoblet) {
    tilkoblet.push({
      navn: "TrackMan Performance Studio",
      kategori: "Shot-data · Range-økter",
      beskrivelse:
        "Klubb-data, ballhastighet, launch og spin per slag fra studio-økter ved AK Golf-anlegget.",
      ikon: "radar",
      tilkoblet: true,
      data: [
        { k: "Sist synket", v: data.tm.sistSynket },
        { k: "Siste økt", v: data.tm.sisteOkt ?? "—" },
      ],
    });
  } else {
    tilgjengelig.push({
      navn: "TrackMan Connect",
      kategori: "Range-økter · Shot-data",
      beskrivelse:
        "Klubb-data, ballhastighet, launch og spin per slag. Kobles automatisk fra studio-økter ved AK Golf-anlegget.",
      ikon: "radar",
      tilkoblet: false,
    });
  }

  // ── Google Calendar (ekte backing: googleCalendarConnection) ──────
  if (data.gcal.tilkoblet) {
    tilkoblet.push({
      navn: "Google Calendar",
      kategori: "Kalender-synk",
      beskrivelse:
        "Planlagte og fullførte økter skyves til Google Calendar. Synkroniseringen går én vei (PlayerHQ → kalender).",
      ikon: "calendar",
      tilkoblet: true,
      data: [
        { k: "Sist synket", v: data.gcal.sistSynket },
        { k: "Status", v: data.gcal.status ?? "—" },
      ],
    });
  } else {
    tilgjengelig.push({
      navn: "Google Calendar",
      kategori: "Kalender-synk",
      beskrivelse:
        "Skyv planlagte og fullførte økter til din personlige kalender. Synkroniseringen går én vei (PlayerHQ → kalender).",
      ikon: "calendar",
      tilkoblet: false,
    });
  }

  // ── Tilgjengelig (uten backing — alltid «koble til») ──────────────
  tilgjengelig.push(
    {
      navn: "GolfBox",
      kategori: "Handicap · Runder",
      beskrivelse:
        "Handicap, registrerte runder og klubb-medlemskap fra norske golfklubber synkes automatisk.",
      ikon: "flag",
      tilkoblet: false,
    },
    {
      navn: "Apple Health",
      kategori: "Søvn · Puls · HRV",
      beskrivelse:
        "Søvnkvalitet, hvilepuls og HRV fra iPhone og Apple Watch — brukes til form- og restitusjons-trender.",
      ikon: "heart",
      tilkoblet: false,
    },
    {
      navn: "Strava",
      kategori: "Kondisjon · Løping · Sykling",
      beskrivelse:
        "Kondisjons-økter (løping, sykling, tur) logges som FYS-økter i pyramiden din.",
      ikon: "activity",
      tilkoblet: false,
    },
    {
      navn: "Garmin Connect",
      kategori: "Steg · Treningsintensitet",
      beskrivelse:
        "Daglige steg, hvilepuls, body-battery og treningsbelastning fra Garmin-klokken.",
      ikon: "footprints",
      tilkoblet: false,
    },
    {
      navn: "Spotify",
      kategori: "Treningsplaylister",
      beskrivelse:
        "Knytt egne playlister til økt-typer. Starter automatisk når du trykker «Start økt».",
      ikon: "play",
      tilkoblet: false,
      proBadge: true,
    },
  );

  const antallTilkoblet = tilkoblet.length;
  const totalt = tilkoblet.length + tilgjengelig.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Tittel mobile={mobile} em="data finnes">Koble til der</Tittel>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6, margin: "-8px 0 0" }}>
        Samle handicap, runder, shot-data, søvn og puls ett sted — uten manuell jobb.
      </p>

      {/* Status-strip */}
      <Kort pad="0">
        <div className="grid grid-cols-2">
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 20px", borderRight: `1px solid ${T.border}` }}>
            <Caps size={9}>Tilkoblet</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.fg, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {antallTilkoblet}
              <span style={{ fontSize: 12, color: T.mut, marginLeft: 4 }}>/ {totalt}</span>
            </span>
            <Caps size={9} color={T.mut}>aktive kilder</Caps>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 20px" }}>
            <Caps size={9}>Sist synket</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.fg, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {data.sistSynkTid ?? "—"}
            </span>
            <Caps size={9} color={T.mut}>{data.sistSynkDato ?? "ingen synk enda"}</Caps>
          </div>
        </div>
      </Kort>

      {/* Tilkoblet */}
      <div>
        <Caps size={9} style={{ margin: "0 4px 8px" }}>
          Tilkoblet · {antallTilkoblet > 0 ? `${antallTilkoblet} aktive` : "ingen enda"}
        </Caps>
        {antallTilkoblet > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tilkoblet.map((integrasjon) => (
              <IntegrasjonKort key={integrasjon.navn} integrasjon={integrasjon} />
            ))}
          </div>
        ) : (
          <Kort>
            <TomTilstand
              icon="plug"
              title="Ingen kilder tilkoblet"
              sub="Koble til en tjeneste nedenfor så samles dataene dine her automatisk."
            />
          </Kort>
        )}
      </div>

      {/* Tilgjengelig */}
      <div>
        <Caps size={9} style={{ margin: "0 4px 8px" }}>
          Tilgjengelig · {tilgjengelig.length} ikke tilkoblet
        </Caps>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12, alignItems: "start" }}>
          {tilgjengelig.map((integrasjon) => (
            <IntegrasjonKort key={integrasjon.navn} integrasjon={integrasjon} />
          ))}
        </div>
      </div>

      {/* Hjelp */}
      <Kort tint>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Emblem ikon="help-circle" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
              Får du ikke koblet til?
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.6, margin: "5px 0 0" }}>
              Vi har en kort guide for hver tjeneste — eller send oss et spørsmål, vi svarer innen 4
              timer på hverdager.
            </p>
            <div style={{ marginTop: 12 }}>
              <Link href="/portal/meg/help/kontakt" style={{ textDecoration: "none" }}>
                <CTAPill ghost icon="arrow-right">Kontakt support</CTAPill>
              </Link>
            </div>
          </div>
        </div>
      </Kort>
    </div>
  );
}
