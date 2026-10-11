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
  Send,
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
  /** Kølla med flest slag; null når økta ikke har lagrede slag. */
  club: string | null;
  shots: number;
  video?: number | null;
  /** Miljø slik det er lagret på økta; null når det ikke er registrert. */
  bay: string | null;
  rows: TrackManRad[];
};

export type VideoOpptak = {
  id: string;
  s: string; // Session ID
  title: string;
  /** Spilleren videoen tilhører. */
  player: string;
  /** Coachen som la opp videoen; null når den ikke er kjent. */
  by: string | null;
  at: string;
  /** «m:ss», eller null når varigheten ikke er lagret. */
  len: string | null;
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
};

const formaterTrackManVerdi = (k: string, v: number | null | undefined): string => {
  if (v == null) return "—";
  if (k === "Spin Rate") {
    return formaterTall(Math.round(v), 0);
  }
  const desimaler = k === "Smash Factor" ? 2 : 1;
  return formaterTall(v, desimaler, true);
};

const TOM_DATA: AG18Data = { tmSessions: [], videos: [] };

export function AG18TrackManVideo({
  tilstand = "data",
  data = TOM_DATA,
  startFane = "okter",
  startOktId,
}: AG18TrackManVideoProps) {
  const [fane, setFane] = useState(startFane);
  const [valgtOktId, setValgtOktId] = useState<string | null>(startOktId ?? data.tmSessions[0]?.id ?? null);
  const [valgtVideoId, setValgtVideoId] = useState<string | null>(null);

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
      render: (r) => r.club ?? "—",
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
          <span className="pa-a18-videokort-tid">{v.len ?? "—"}</span>
        </span>
        <span className="pa-a18-videokort-info">
          <span style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{v.title}</span>
          <Meta>{v.player.toUpperCase()} · {v.at}</Meta>
        </span>
      </button>
    );
  }

  /* Videospiller rendering */
  function renderVideospiller(v: VideoOpptak) {
    return (
      <Kort>
        <div className="pa-a18-spiller-ramme">
          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Ikon icon={PlayCircle} size={44} />
            <Meta>VIDEO · {v.len ?? "—"}</Meta>
          </span>
        </div>

        <div style={{ fontWeight: 600, fontSize: 15 }}>{v.title}</div>

        <Nokkelverdi
          items={[
            ["Spiller", v.player],
            ["Lagt opp", `${v.at} · ${v.by ?? "—"}`],
            ["Merknad", v.note || "—"],
          ]}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 44, alignItems: "center" }}>
          <Knapp size="sm" variant="secondary" icon={PenLine} disabled style={{ minHeight: 44, minWidth: 44 }}>
            Tegn på video
          </Knapp>
          <Knapp size="sm" variant="ghost" icon={Send} disabled style={{ minHeight: 44, minWidth: 44 }}>
            Del med spiller
          </Knapp>
          <Meta>IKKE KOBLET ENNÅ</Meta>
        </div>
      </Kort>
    );
  }

  /* Detaljpanel for TrackMan-økt */
  function renderOktDetaljPanel(okt: TrackManOkt) {
    const kildeLabel = `TRACKMAN · ${(okt.bay ?? "MILJØ IKKE REGISTRERT").toUpperCase()} · ${okt.date}`;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Kort>
          <KortHode
            tittel={`${okt.who} · ${okt.club ?? "—"} · ${okt.shots} slag`}
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
        <KortHode tittel="Nytt opptak" aside="STUDIO · KAMERA 1 OG 2" />

        <TomTilstand
          icon={Video}
          title="Opptak fra studio er ikke koblet ennå"
          text="Opptak og samtykkesjekk kobles til kameraene senere. Videoer som er lagt opp fra før, ligger under Video."
        />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", minHeight: 44 }}>
          <Knapp variant="primary" icon={Circle} disabled style={{ minHeight: 44, minWidth: 44 }}>
            Start opptak
          </Knapp>
          <Meta>IKKE KOBLET ENNÅ</Meta>
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
        sub="Økter på tvers av spillere. Verdiene er snitt av slagene i økta for kølla med flest slag."
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

      {/* Tilstander */}
      {tilstand === "laster" && <LasterTilstand text="Henter TrackMan-økter …" />}

      {tilstand === "feil" && (
        <FeilTilstand
          icon={Crosshair}
          title="TrackMan-øktene kunne ikke hentes"
          text="Prøv igjen om litt."
          code="TRACKMAN"
          retry={<Knapp variant="secondary" onClick={() => window.location.reload()}>Prøv igjen</Knapp>}
        />
      )}

      {tilstand === "tom" && fane !== "opptak" && (
        <TomTilstand
          icon={Crosshair}
          title="Ingen TrackMan-økter"
          text="Økter vises her når de er importert."
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
                  caption="TrackMan-økter på tvers av spillere · siste 20"
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
            tittel={`${aktivOkt.who} · ${aktivOkt.club ?? "—"}`}
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
