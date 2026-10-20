"use client";

/**
 * TrackMan og video (AG-18) i nytt design: /admin/trackman, /admin/trackman/[sessionId],
 * /admin/recording, /admin/videoer. Tre faner: Økter, Video og Opptak.
 * Verdiene er snitt av slagene i økta for kølla med flest slag; manglende verdier vises som «—».
 * Tegning: canvaset «AgencyOS nøkkelskjermer», raden «Turnering, TrackMan og runder».
 */

import { useMemo, useState } from "react";
import { Feil, Knapp, KnappLenke, Laster, Nokkelverdier, Seksjon, Tom, Topp } from "@/components/admin/agencyos-ny/ny";
import { formaterTall } from "@/lib/format-tall";
import "@/styles/agencyos-ny-mer.css";
import "@/styles/agencyos-ny-trackman.css";

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


type FaneId = "okter" | "video" | "opptak";
const FANER: FaneId[] = ["okter", "video", "opptak"];
const INGRESS = "Økter på tvers av spillere. Verdiene er snitt av slagene i økta for kølla med flest slag.";

export function AG18TrackManVideo({ tilstand = "data", data = TOM_DATA, startFane = "okter", startOktId }: AG18TrackManVideoProps) {
  const [fane, setFane] = useState<FaneId>(FANER.includes(startFane as FaneId) ? (startFane as FaneId) : "okter");
  const [valgtOktId, setValgtOktId] = useState<string | null>(startOktId ?? data.tmSessions[0]?.id ?? null);
  const [valgtVideoId, setValgtVideoId] = useState<string | null>(null);
  const erTom = tilstand === "tom";

  const okter = useMemo(() => (erTom ? [] : data.tmSessions), [data.tmSessions, erTom]);
  const videoer = useMemo(() => (erTom ? [] : data.videos), [data.videos, erTom]);
  const aktivOkt = useMemo(() => (okter.length ? okter.find((o) => o.id === valgtOktId) || okter[0] : null), [okter, valgtOktId]);
  const videoerForOkt = useMemo(() => (aktivOkt ? videoer.filter((v) => v.s === aktivOkt.id) : []), [videoer, aktivOkt]);
  const aktivVideo = useMemo(() => (valgtVideoId ? videoer.find((v) => v.id === valgtVideoId) ?? null : null), [videoer, valgtVideoId]);

  const topp = <Topp dato="Spillere · TrackMan" tittel="TrackMan og video" ingress={INGRESS} handlinger={fane !== "opptak" ? <Knapp variant="sek" onClick={() => setFane("opptak")}>Nytt opptak</Knapp> : undefined} />;

  if (tilstand === "laster") return <div className="agn-s">{topp}<Laster tekst="Henter TrackMan-økter …" /></div>;
  if (tilstand === "feil") {
    return <div className="agn-s">{topp}<Feil tittel="TrackMan-øktene kunne ikke hentes" tekst="Prøv igjen om litt." kode="TRACKMAN" onProv={() => window.location.reload()} /></div>;
  }

  const navn: Record<FaneId, string> = {
    okter: erTom ? "Økter" : `Økter · ${okter.length}`,
    video: erTom ? "Video" : `Video · ${videoer.length}`,
    opptak: "Opptak",
  };

  const videoliste = (liste: VideoOpptak[]) => (
    <div className="liste">
      {liste.map((v) => (
        <button key={v.id} type="button" className="drift-rad" aria-pressed={valgtVideoId === v.id} onClick={() => setValgtVideoId(v.id)}>
          <span><b>{v.title}</b><span className="kilde">{v.player} · {v.at}</span></span>
          <span aria-hidden />
          <span className="mono kilde">{v.len ?? "—"}</span>
        </button>
      ))}
    </div>
  );

  const videospiller = (v: VideoOpptak) => (
    <Seksjon tittel={v.title} kilde={`Video · ${v.len ?? "—"}`}>
      <div className="kort">
        <Nokkelverdier rader={[["Spiller", v.player], ["Lagt opp", `${v.at} · ${v.by ?? "—"}`], ["Merknad", v.note || "—"]]} />
        <div className="knapper">
          <Knapp variant="sek" disabled>Tegn på video</Knapp>
          <Knapp variant="sek" disabled>Del med spiller</Knapp>
          <p className="kilde">Ikke koblet ennå.</p>
        </div>
      </div>
    </Seksjon>
  );

  const oktdetalj = (okt: TrackManOkt) => (
    <div className="agn-s-stack">
      <Seksjon tittel={`${okt.who} · ${okt.club ?? "—"} · ${okt.shots} slag`} kilde={`TrackMan · ${okt.bay ?? "Miljø ikke registrert"} · ${okt.date}`}>
        <div className="tm-metrikker">
          {okt.rows.map(([k, u, val]) => (
            <div key={k} className="teller">
              <span className="e">{k}</span>
              <b className="t">{formaterTrackManVerdi(k, val)}{u && val != null ? <span className="kilde"> {u}</span> : null}</b>
            </div>
          ))}
        </div>
        <div className="knapper"><KnappLenke href={`/admin/trackman/${okt.id}`}>Åpne økta (spredning)</KnappLenke></div>
      </Seksjon>
      <Seksjon tittel="Video fra økta" kilde={videoerForOktTekst(videoerForOkt.length)}>
        {videoerForOkt.length > 0 ? videoliste(videoerForOkt) : <p className="forklar">Ingen video fra denne økta.</p>}
      </Seksjon>
      {aktivVideo && videospiller(aktivVideo)}
    </div>
  );

  return (
    <div className="agn-s" data-testid="ag18-trackman-video">
      {topp}

      <div className="teller-rad">
        <div className="teller"><span className="e">TrackMan-økter</span><b className="t">{erTom ? "—" : okter.length}</b></div>
        <div className="teller"><span className="e">Videoer</span><b className="t">{erTom ? "—" : videoer.length}</b></div>
        <div className="teller"><span className="e">Økter med video</span><b className="t">{erTom ? "—" : okter.filter((o) => (o.video ?? 0) > 0).length}</b></div>
      </div>

      <nav className="valg" aria-label="TrackMan og video">
        {FANER.map((f) => <button key={f} type="button" aria-pressed={fane === f} onClick={() => { setFane(f); setValgtVideoId(null); }}>{navn[f]}</button>)}
      </nav>

      {tilstand === "tom" && fane !== "opptak" && (
        <Tom tittel="Ingen TrackMan-økter" tekst="Økter vises her når de er importert." handling={<Knapp onClick={() => setFane("opptak")}>Nytt opptak</Knapp>} />
      )}

      {tilstand === "data" && fane === "okter" && (
        <div className="to-del bred-v">
          <Seksjon tittel="TrackMan-økter" kilde="Siste 20, på tvers av spillere">
            <div className="liste">
              {okter.map((o) => (
                <button key={o.id} type="button" className="drift-rad" aria-pressed={aktivOkt?.id === o.id} onClick={() => setValgtOktId(o.id)}>
                  <span><b>{o.who}</b><span className="kilde">{o.date} · {o.club ?? "—"}</span></span>
                  <span className="mono kilde">{o.shots} slag</span>
                  <span className="mono kilde">{o.video ? `${o.video} video` : "—"}</span>
                </button>
              ))}
            </div>
          </Seksjon>
          {aktivOkt ? oktdetalj(aktivOkt) : <span aria-hidden />}
        </div>
      )}

      {tilstand === "data" && fane === "video" && (
        <div className="to-del bred-v">
          <Seksjon tittel="Videoopptak" kilde={`${videoer.length} opptak`}>{videoliste(videoer)}</Seksjon>
          {aktivVideo ? videospiller(aktivVideo) : <span aria-hidden />}
        </div>
      )}

      {fane === "opptak" && (
        <Seksjon tittel="Nytt opptak" kilde="Studio · kamera 1 og 2">
          <Tom tittel="Opptak fra studio er ikke koblet ennå" tekst="Opptak og samtykkesjekk kobles til kameraene senere. Videoer som er lagt opp fra før, ligger under Video." />
          <div className="knapper">
            <Knapp disabled>Start opptak</Knapp>
            <p className="kilde">Ikke koblet ennå.</p>
          </div>
          <p className="kilde">Video av spillere under 18 krever samtykke fra forelder.</p>
        </Seksjon>
      )}
    </div>
  );
}

function videoerForOktTekst(n: number) {
  return n ? `${n} opptak` : "—";
}
