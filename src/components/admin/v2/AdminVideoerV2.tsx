"use client";

/**
 * AgencyOS Coaching-videoer — v2 (retning C «Presis», mørk først). Coach/ADMIN
 * laster opp video til en spiller og ser alle opplastede videoer. Rekomponert
 * fra den hånd-bygde golfdata-skjermen (video-upload-form.tsx + video-card.tsx)
 * — kun v2-primitiver fra "@/components/v2", ingen rå hex (kun T.*).
 *
 * Funksjon/datakontrakt bevart 1:1 fra den gamle skjermen:
 *   - Opplasting via uploadVideo(FormData) — samme feltnavn (file, title,
 *     playerId, tag, bookingId, notes), samme klientvalidering (maks 500 MB,
 *     mp4/mov/webm), refresh etter suksess.
 *   - «Åpne» henter signert URL (getSignedVideoUrl) og åpner i ny fane.
 *   - «Slett» (deleteVideo) med confirm-vakt — kun for eier/ADMIN (canDelete
 *     beregnes serverside som før).
 * Ingen fabrikerte tall — ærlig tom-tilstand når ingen videoer finnes.
 * Dropzone-mønsteret finnes ikke i v2-kanon — komponert av T-tokens (se gap).
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uploadVideo, deleteVideo, getSignedVideoUrl } from "@/lib/storage/video";
import {
  T,
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  Knapp,
  Rad,
  StatusPill,
  TomTilstand,
  Icon,
  Inndata,
  Velger,
  TekstOmraade,
  Dropzone,
  type VelgerIdValg,
} from "@/components/v2";

/* ── Datakontrakt (mappes fra Prisma i ruten) ──────────────────────────── */

export interface AdminVideoSpiller {
  id: string;
  name: string;
}

export interface AdminVideoRad {
  id: string;
  title: string;
  tag: string | null;
  status: string;
  /** Ferdig formatert dato, f.eks. «12. jul». */
  dato: string;
  playerName: string;
  playerId: string;
  coachName: string;
  /** Ferdig formatert størrelse, f.eks. «480 MB» — null når ukjent. */
  storrelse: string | null;
  canDelete: boolean;
}

export interface AdminVideoerV2Data {
  kpis: {
    totalt: number;
    sisteUke: number;
    unikeSpillere: number;
    /** Ferdig formatert, f.eks. «12,4 GB». */
    lagring: string;
  };
  spillere: AdminVideoSpiller[];
  videoer: AdminVideoRad[];
}

/* ── Klientvalidering (uendret fra gammel skjerm) ──────────────────────── */

const ACCEPT = "video/mp4,video/quicktime,video/webm";
const MAX_MB = 500;

/* ── Opplastingsskjema ─────────────────────────────────────────────────── */

function OpplastingsSkjema({ spillere }: { spillere: AdminVideoSpiller[] }) {
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [tag, setTag] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [notes, setNotes] = useState("");

  function settFil(f: File | null) {
    setError(null);
    setSuccess(false);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Filen er for stor. Maks ${MAX_MB} MB.`);
      setFile(null);
      return;
    }
    if (!ACCEPT.split(",").includes(f.type)) {
      setError("Ugyldig format. Bruk mp4, mov eller webm.");
      setFile(null);
      return;
    }
    setFile(f);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!file) return;
    if (!title.trim()) {
      setError("Skriv en tittel på videoen.");
      return;
    }
    if (!playerId) {
      setError("Velg hvilken spiller videoen skal deles med.");
      return;
    }
    // Samme feltnavn og payload som det gamle <form>-innsendte skjemaet.
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("playerId", playerId);
    formData.append("tag", tag);
    formData.append("bookingId", bookingId);
    formData.append("notes", notes);
    startTransition(async () => {
      try {
        await uploadVideo(formData);
        setSuccess(true);
        setFile(null);
        setTitle("");
        setPlayerId("");
        setTag("");
        setBookingId("");
        setNotes("");
        setResetKey((k) => k + 1);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Opplasting feilet.");
      }
    });
  }

  const spillerValg: VelgerIdValg[] = [
    { value: "", label: "Velg spiller …" },
    ...spillere.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <Kort
      eyebrow="Last opp ny video"
      action={<Caps size={9}>Maks {MAX_MB} MB · mp4 · mov · webm</Caps>}
    >
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Dropzone
          key={resetKey}
          file={file}
          onFile={settFil}
          accept={ACCEPT}
          valgtIkon="video"
          idleTittel="Slipp videofilen her"
          idleSub="eller klikk for å velge fra maskinen"
        />

        {/* Fremdrift under opplasting */}
        {pending && (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>Laster opp …</span>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>vennligst vent</span>
            </div>
            <div style={{ height: 6, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
              <div className="animate-pulse" style={{ height: "100%", width: "50%", borderRadius: 9999, background: T.lime }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14 }}>
          <Inndata label="Tittel" value={title} onChange={setTitle} placeholder="F.eks. Sving-analyse — bunker" />
          <Velger label="Spiller" options={spillerValg} value={playerId} onChange={setPlayerId} />
          <Inndata label="Tag (valgfri)" value={tag} onChange={setTag} placeholder="sving / putt / chip" />
          <Inndata label="Booking-ID (valgfri)" value={bookingId} onChange={setBookingId} placeholder="cm…" mono />
        </div>

        <TekstOmraade label="Notater til spilleren (valgfri)" value={notes} onChange={setNotes} rows={3} placeholder="" />

        {error && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.down,
              background: `color-mix(in srgb, ${T.down} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`,
              borderRadius: 11,
              padding: "10px 13px",
              lineHeight: 1.5,
            }}
          >
            <Icon name="alert-triangle" size={14} style={{ color: T.down, flex: "none", marginTop: 1 }} />
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.up,
              background: `color-mix(in srgb, ${T.up} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${T.up} 30%, transparent)`,
              borderRadius: 11,
              padding: "10px 13px",
            }}
          >
            <Icon name="check-circle" size={14} style={{ color: T.up, flex: "none" }} />
            Video lastet opp og delt med spilleren.
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>
            Spilleren får varsel når videoen er klar.
          </span>
          <Knapp type="submit" icon="upload" disabled={pending || !file}>
            {pending ? "Laster opp …" : "Last opp og send"}
          </Knapp>
        </div>
      </form>
    </Kort>
  );
}

/* ── Video-rad (Åpne / Slett) ──────────────────────────────────────────── */

function VideoRad({ video, last }: { video: AdminVideoRad; last: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const klar = video.status === "READY";

  async function spillAv() {
    setError(null);
    try {
      const url = await getSignedVideoUrl(video.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke åpne video");
    }
  }

  function slett() {
    if (!confirm(`Slett videoen «${video.title}»? Kan ikke angres.`)) return;
    startTransition(async () => {
      try {
        await deleteVideo(video.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sletting feilet");
      }
    });
  }

  return (
    <div>
      <Rad
        last={last && !error}
        leading={
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: `color-mix(in srgb, ${T.lime} 10%, transparent)`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="video" size={15} style={{ color: T.lime }} />
          </span>
        }
        title={video.title}
        sub={
          <>
            <Link href={`/admin/spillere/${video.playerId}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 }}>
              {video.playerName}
            </Link>
            {" · "}
            {video.coachName}
            {video.tag ? ` · ${video.tag}` : ""}
          </>
        }
        meta={
          <span className="hidden sm:inline" style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {video.dato}
            {video.storrelse ? ` · ${video.storrelse}` : ""}
          </span>
        }
        trailing={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flex: "none" }}>
            {!klar && <StatusPill tone="warn">{video.status}</StatusPill>}
            <Knapp ghost icon="external-link" disabled={!klar} onClick={spillAv} style={{ padding: "7px 13px" }}>
              Åpne
            </Knapp>
            {video.canDelete && (
              <Knapp ghost icon="trash" disabled={pending} onClick={slett} style={{ padding: "7px 11px", color: T.down }} />
            )}
          </span>
        }
      />
      {error && (
        <div
          role="alert"
          style={{
            fontFamily: T.ui,
            fontSize: 12,
            color: T.down,
            background: `color-mix(in srgb, ${T.down} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`,
            borderRadius: 10,
            padding: "6px 10px",
            margin: "6px 0 10px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────────── */

export function AdminVideoerV2({ data }: { data: AdminVideoerV2Data }) {
  const { kpis, spillere, videoer } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>AgencyOS · Coaching-videoer</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="del med spillerne">Last opp og</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.55, margin: "10px 0 0" }}>
          {kpis.totalt} videoer totalt. Maks {MAX_MB} MB per video — mp4, mov eller webm.
        </p>
      </div>

      {/* KPI-rad */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
        <KpiFlis label="Videoer totalt" value={kpis.totalt} instant />
        <KpiFlis label="Siste 7 dager" value={kpis.sisteUke} instant />
        <KpiFlis label="Unike spillere" value={kpis.unikeSpillere} instant />
        <KpiFlis label="Lagring brukt" value={kpis.lagring} instant />
      </div>

      <OpplastingsSkjema spillere={spillere} />

      {/* Opplastede videoer */}
      <Kort
        eyebrow="Opplastede videoer"
        action={
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
            {videoer.length} stk
          </span>
        }
      >
        {videoer.length === 0 ? (
          <TomTilstand
            icon="video"
            title="Ingen videoer ennå"
            sub="Bruk skjemaet over for å laste opp første video."
          />
        ) : (
          <div>
            {videoer.map((v, i) => (
              <VideoRad key={v.id} video={v} last={i === videoer.length - 1} />
            ))}
          </div>
        )}
      </Kort>
    </div>
  );
}
