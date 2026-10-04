"use client";

/**
 * Precision Athletics — TrackMan og video (AG-18).
 *
 * Kilde: Claude Design AG-18 (arkiv/2026-09-30/agencyos/screens/AG-18.jsx).
 * Ruter: /admin/trackman, /admin/trackman/[sessionId], /admin/recording, /admin/videoer.
 *
 * 3 faner:
 * 1. okter: TrackMan-økter på tvers av spillere med radarmetrikker, video fra økta og avspiller
 * 2. video: Videogalleri for analyse, tegneverktøy og deling
 * 3. opptak: Studio 1 & 2 to-kameraoppsett med foreldresamtykkesjekk
 */

import { useState, useMemo } from "react";
import {
  Circle,
  Crosshair,
  PenLine,
  Play,
  PlayCircle,
  Radio,
  Send,
  Square,
  Video,
} from "lucide-react";
import {
  FeilTilstand,
  Ikon,
  Knapp,
  LasterTilstand,
  Meta,
  Sidehode,
  TomTilstand,
} from "@/components/precision/pa";
import {
  Ark,
  Faner,
  InlineVarsel,
  Kort,
  KortHode,
  Nokkelverdi,
  Tabell,
  type Kolonne,
} from "@/components/precision/pa-a5";
import { formaterTall } from "@/lib/format-tall";
import "@/styles/precision-a18.css";

export type TrackManRad = [string, string, number | null]; // [parameter, enhet, verdi]

export type TrackManOkt = {
  id: string;
  date: string;
  who: string;
  club: string;
  shots: number;
  video?: number | null;
  bay: string;
  rows: TrackManRad[];
};

export type VideoOpptak = {
  id: string;
  s: string; // Session ID
  title: string;
  by: string;
  at: string;
  len: string;
  note?: string;
};

export type AG18Data = {
  tmSessions: TrackManOkt[];
  videos: VideoOpptak[];
};

export type AG18Tilstand = "data" | "tom" | "laster" | "feil";

export type AG18TrackManVideoProps = {
  tilstand?: AG18Tilstand;
  data?: AG18Data;
  startFane?: string;
  startOktId?: string;
  onDelVideo?: (videoId: string) => void;
};

const formaterTrackManVerdi = (k: string, v: number | null | undefined): string => {
  if (v == null) return "—";
  if (k === "Spin Rate") {
    return formaterTall(Math.round(v), 0);
  }
  const desimaler = k === "Smash Factor" ? 2 : 1;
  return formaterTall(v, desimaler, true);
};

const STANDARD_DATA: AG18Data = {
  tmSessions: [
    {
      id: "m1",
      date: "04.10.2026",
      who: "Tobias Lindvik",
      club: "7-jern",
      shots: 42,
      video: 2,
      bay: "Studio 1",
      rows: [
        ["Club Speed", "mph", 91.4],
        ["Ball Speed", "mph", 124.6],
        ["Smash Factor", "", 1.36],
        ["Launch Angle", "°", 17.2],
        ["Spin Rate", "rpm", 6450],
        ["Club Path", "°", 2.1],
        ["Face Angle", "°", -0.8],
        ["Carry", "m", 158.4],
      ],
    },
    {
      id: "m2",
      date: "03.10.2026",
      who: "Henrik Simonsen",
      club: "Driver",
      shots: 28,
      video: 1,
      bay: "Studio 1",
      rows: [
        ["Club Speed", "mph", 112.8],
        ["Ball Speed", "mph", 168.2],
        ["Smash Factor", "", 1.49],
        ["Launch Angle", "°", 11.4],
        ["Spin Rate", "rpm", 2280],
        ["Club Path", "°", 1.4],
        ["Face Angle", "°", -0.2],
        ["Carry", "m", 262.1],
      ],
    },
    {
      id: "m3",
      date: "02.10.2026",
      who: "Kasper Thorsen",
      club: "Pitching Wedge",
      shots: 35,
      video: null,
      bay: "Studio 2",
      rows: [
        ["Club Speed", "mph", 83.2],
        ["Ball Speed", "mph", 102.5],
        ["Smash Factor", "", 1.23],
        ["Launch Angle", "°", 24.1],
        ["Spin Rate", "rpm", 9120],
        ["Club Path", "°", -0.5],
        ["Face Angle", "°", 0.4],
        ["Carry", "m", 118.2],
      ],
    },
    {
      id: "m4",
      date: "01.10.2026",
      who: "Magnus Berntsen",
      club: "5-jern",
      shots: 50,
      video: 1,
      bay: "Studio 1",
      rows: [
        ["Club Speed", "mph", 96.1],
        ["Ball Speed", "mph", 135.2],
        ["Smash Factor", "", 1.41],
        ["Launch Angle", "°", 14.8],
        ["Spin Rate", "rpm", 5180],
        ["Club Path", "°", 3.2],
        ["Face Angle", "°", 1.1],
        ["Carry", "m", 182.7],
      ],
    },
  ],
  videos: [
    {
      id: "v1",
      s: "m1",
      title: "Face-on · full sving 7-jern",
      by: "Anders Kristiansen",
      at: "04.10.2026 14:15",
      len: "0:08",
      note: "P6 hofterotasjon og senkning av skaftplan.",
    },
    {
      id: "v2",
      s: "m1",
      title: "Down-the-line · takeaway og topp",
      by: "Anders Kristiansen",
      at: "04.10.2026 14:18",
      len: "0:06",
      note: "Sjekk posisjon i P3 og håndleddsvinkel.",
    },
    {
      id: "v3",
      s: "m2",
      title: "Driver · angrepsvinkel og launch",
      by: "Anders Kristiansen",
      at: "03.10.2026 16:30",
      len: "0:07",
      note: "Oppvinkling +2.8 grader i treff.",
    },
    {
      id: "v4",
      s: "m4",
      title: "5-jern · impact og release",
      by: "Anders Kristiansen",
      at: "01.10.2026 11:20",
      len: "0:09",
      note: "God kompresjon og balansert finish.",
    },
  ],
};

export function AG18TrackManVideo({
  tilstand = "data",
  data = STANDARD_DATA,
  startFane = "okter",
  startOktId,
  onDelVideo,
}: AG18TrackManVideoProps) {
  const [fane, setFane] = useState(startFane);
  const [valgtOktId, setValgtOktId] = useState<string | null>(startOktId ?? data.tmSessions[0]?.id ?? null);
  const [valgtVideoId, setValgtVideoId] = useState<string | null>(null);
  const [tarOpp, setTarOpp] = useState(false);
  const [varselTekst, setVarselTekst] = useState<{ tittel: string; meta?: string } | null>(null);

  const erTom = tilstand === "tom";

  const okter = useMemo(() => (erTom ? [] : data.tmSessions), [data.tmSessions, erTom]);
  const videoer = useMemo(() => (erTom ? [] : data.videos), [data.videos, erTom]);

  const aktivOkt = useMemo(() => {
    if (!okter.length) return null;
    return okter.find((o) => o.id === valgtOktId) || okter[0];
  }, [okter, valgtOktId]);

  const videoerForAktivOkt = useMemo(() => {
    if (!aktivOkt) return [];
    return videoer.filter((v) => v.s === aktivOkt.id);
  }, [videoer, aktivOkt]);

  const aktivVideo = useMemo(() => {
    if (!videoer.length || !valgtVideoId) return null;
    return videoer.find((v) => v.id === valgtVideoId) || null;
  }, [videoer, valgtVideoId]);

  const faner = [
    { value: "okter", label: "Økter", count: erTom ? undefined : okter.length },
    { value: "video", label: "Video", count: erTom ? undefined : videoer.length },
    { value: "opptak", label: "Opptak" },
  ];

  /* Tabellkolonner for TrackMan-økter */
  const kolonner: Kolonne<TrackManOkt>[] = [
    {
      key: "date",
      label: "Dato",
      mono: true,
      render: (r) => r.date,
    },
    {
      key: "who",
      label: "Spiller",
      render: (r) => (
        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.who}</span>
      ),
    },
    {
      key: "club",
      label: "Kølle",
      mono: true,
      render: (r) => r.club,
    },
    {
      key: "shots",
      label: "Slag",
      mono: true,
      align: "right",
      render: (r) => r.shots,
    },
    {
      key: "video",
      label: "Video",
      mono: true,
      align: "right",
      render: (r) => (r.video ? `${r.video} video` : "—"),
    },
  ];

  /* Videokort rendering */
  function renderVideokort(v: VideoOpptak) {
    const erValgt = valgtVideoId === v.id;

    return (
      <button
        key={v.id}
        type="button"
        onClick={() => setValgtVideoId(v.id)}
        aria-pressed={erValgt}
        className="pa-a18-videokort"
        style={{ minHeight: 44 }}
      >
        <span className="pa-a18-videokort-preview">
          <Ikon icon={Play} size={22} />
          <span className="pa-a18-videokort-tid">{v.len}</span>
        </span>
        <span className="pa-a18-videokort-info">
          <span style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{v.title}</span>
          <Meta>{v.by.toUpperCase()} · {v.at}</Meta>
        </span>
      </button>
    );
  }

  /* Videospiller rendering */
  function renderVideospiller(v: VideoOpptak) {
    const tilhorendeOkt = data.tmSessions.find((s) => s.id === v.s);

    return (
      <Kort>
        <div className="pa-a18-spiller-ramme">
          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Ikon icon={PlayCircle} size={44} />
            <Meta>VIDEO · {v.len}</Meta>
          </span>
        </div>

        <div style={{ fontWeight: 600, fontSize: 15 }}>{v.title}</div>

        <Nokkelverdi
          items={[
            ["Spiller", tilhorendeOkt ? tilhorendeOkt.who : "Ukjent utøver"],
            ["Tatt opp", `${v.at} · ${v.by}`],
            ["Merknad", v.note || "Ingen merknader"],
          ]}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 44, alignItems: "center" }}>
          <Knapp
            size="sm"
            variant="secondary"
            icon={PenLine}
            onClick={() => setVarselTekst({ tittel: "Tegneverktøy åpnet", meta: "LINJER OG VINKLER LAGRES PÅ VIDEOEN" })}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            Tegn på video
          </Knapp>
          <Knapp
            size="sm"
            variant="ghost"
            icon={Send}
            onClick={() => {
              onDelVideo?.(v.id);
              setVarselTekst({ tittel: "Utkast til spilleren", meta: "IKKE SENDT FØR DU TRYKKER SEND" });
            }}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            Del med spiller
          </Knapp>
        </div>
      </Kort>
    );
  }

  /* Detaljpanel for TrackMan-økt */
  function renderOktDetaljPanel(okt: TrackManOkt) {
    const kildeLabel = `TRACKMAN · ${okt.bay.toUpperCase()} · ${okt.date}`;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Kort>
          <KortHode
            tittel={`${okt.who} · ${okt.club} · ${okt.shots} slag`}
            aside={kildeLabel}
          />

          <div className="pa-a18-metrikk-grid">
            {okt.rows.map(([k, u, val]) => (
              <div key={k} className="pa-a18-metrikk-kort">
                <span className="pa-a18-metrikk-label">{k}</span>
                <span className="pa-a18-metrikk-verdi">
                  {formaterTrackManVerdi(k, val)}
                  {u && <span className="pa-a18-metrikk-enhet">{u}</span>}
                </span>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 8 }}>
            <KortHode
              tittel="Video fra økta"
              aside={videoerForAktivOkt.length ? `${videoerForAktivOkt.length} OPPTAK` : "—"}
            />

            {videoerForAktivOkt.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))",
                  gap: 8,
                  paddingTop: 8,
                }}
              >
                {videoerForAktivOkt.map(renderVideokort)}
              </div>
            ) : (
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                Ingen video fra denne økta.
              </p>
            )}
          </div>
        </Kort>

        {aktivVideo && renderVideospiller(aktivVideo)}
      </div>
    );
  }

  /* Opptaksfane rendering */
  function renderOpptaksfane() {
    return (
      <Kort style={{ maxWidth: 720 }}>
        <KortHode tittel="Nytt opptak" aside="STUDIO 1 · KAMERA 1 OG 2" />

        <div className="pa-a18-opptak-kameraer">
          <div className={`pa-a18-kamera-boks ${tarOpp ? "pa-a18-kamera-boks--aktiv" : ""}`}>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Ikon icon={Video} size={28} />
              <Meta>FACE-ON · KAMERA 1</Meta>
            </span>
          </div>
          <div className={`pa-a18-kamera-boks ${tarOpp ? "pa-a18-kamera-boks--aktiv" : ""}`}>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Ikon icon={Video} size={28} />
              <Meta>DOWN-THE-LINE · KAMERA 2</Meta>
            </span>
          </div>
        </div>

        <Nokkelverdi
          items={[
            ["Spiller", "Tobias Lindvik"],
            ["Samtykke video", "Ja", "HANNE LINDVIK · BANKID · 26.09.2026"],
            ["Knyttes til", "TrackMan-økt 04.10 · Studio 1"],
          ]}
        />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", minHeight: 44 }}>
          <Knapp
            variant={tarOpp ? "signal" : "primary"}
            icon={tarOpp ? Square : Circle}
            onClick={() => {
              const nyStatus = !tarOpp;
              setTarOpp(nyStatus);
              setVarselTekst(
                nyStatus
                  ? { tittel: "Opptak startet", meta: "TRYKK IGJEN FOR Å STOPPE" }
                  : { tittel: "Opptaket er lagret", meta: "KNYTTET TIL TRACKMAN-ØKTA" }
              );
            }}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            {tarOpp ? "Stopp og lagre" : "Start opptak"}
          </Knapp>

          {tarOpp && (
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center", color: "var(--signal)" }}>
              <Ikon icon={Radio} size={16} />
              <Meta style={{ color: "inherit", fontWeight: 600 }}>TAR OPP · 0:04</Meta>
            </span>
          )}
        </div>

        <Meta>VIDEO AV SPILLERE UNDER 18 KREVER SAMTYKKE FRA FORELDER</Meta>
      </Kort>
    );
  }

  return (
    <div className="pa-a18-side">
      <Sidehode
        kicker="TrackMan og video"
        title="TrackMan og video"
        sub="Økter på tvers av spillere, én økt i detalj og video. Parametere står slik TrackMan viser dem."
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Faner faner={faner} value={fane} onChange={(t) => { setFane(t); setValgtVideoId(null); }} />
        {fane !== "opptak" && (
          <Knapp
            variant="secondary"
            size="sm"
            icon={Video}
            onClick={() => setFane("opptak")}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            Nytt opptak
          </Knapp>
        )}
      </div>

      {varselTekst && (
        <InlineVarsel tone="ok" tittel={varselTekst.tittel}>
          {varselTekst.meta}
        </InlineVarsel>
      )}

      {/* Tilstander */}
      {tilstand === "laster" && <LasterTilstand text="Henter TrackMan-økter …" />}

      {tilstand === "feil" && (
        <FeilTilstand
          icon={Crosshair}
          title="TrackMan svarer ikke"
          text="Øktene er lagret hos TrackMan og hentes når koblingen er tilbake."
          code="TRACKMAN API · 504"
          retry={<Knapp variant="secondary" onClick={() => window.location.reload()}>Prøv igjen</Knapp>}
        />
      )}

      {tilstand === "tom" && fane !== "opptak" && (
        <TomTilstand
          icon={Crosshair}
          title="Ingen TrackMan-økter denne uka"
          text="Økter fra Studio 1 og 2 hentes automatisk. Start et opptak for å knytte video til en økt."
          actions={
            <Knapp variant="primary" icon={Video} onClick={() => setFane("opptak")} style={{ minHeight: 44, minWidth: 44 }}>
              Nytt opptak
            </Knapp>
          }
        />
      )}

      {tilstand === "data" && (
        <>
          {fane === "okter" && (
            <div className="pa-a18-layout">
              <div>
                <Tabell
                  caption="TrackMan-økter på tvers av spillere · siste 7 dager"
                  columns={kolonner}
                  rows={okter}
                  selected={valgtOktId}
                  onSelect={(r) => setValgtOktId(r.id)}
                />
              </div>

              {aktivOkt && (
                <div className="pa-desktop-only">
                  {renderOktDetaljPanel(aktivOkt)}
                </div>
              )}
            </div>
          )}

          {fane === "video" && (
            <div className="pa-a18-layout">
              <div>
                <Kort>
                  <KortHode tittel="Videoopptak" aside={`${videoer.length} OPPTAK`} />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))",
                      gap: 12,
                      paddingTop: 8,
                    }}
                  >
                    {videoer.map(renderVideokort)}
                  </div>
                </Kort>
              </div>

              {aktivVideo && (
                <div className="pa-desktop-only">
                  {renderVideospiller(aktivVideo)}
                </div>
              )}
            </div>
          )}

          {fane === "opptak" && renderOpptaksfane()}
        </>
      )}

      {/* Mobil Ark / Sheet for aktiv økt eller video */}
      {aktivOkt && fane === "okter" && (
        <div className="pa-mobile-only">
          <Ark
            open={!!aktivOkt}
            onClose={() => setValgtOktId(null)}
            kicker="TrackMan-økt"
            tittel={`${aktivOkt.who} · ${aktivOkt.club}`}
          >
            {renderOktDetaljPanel(aktivOkt)}
          </Ark>
        </div>
      )}

      {aktivVideo && fane === "video" && (
        <div className="pa-mobile-only">
          <Ark
            open={!!aktivVideo}
            onClose={() => setValgtVideoId(null)}
            kicker="Video"
            tittel={aktivVideo.title}
          >
            {renderVideospiller(aktivVideo)}
          </Ark>
        </div>
      )}
    </div>
  );
}
