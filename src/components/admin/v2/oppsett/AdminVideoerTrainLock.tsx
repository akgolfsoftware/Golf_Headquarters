"use client";

/**
 * AgencyOS Coaching-videoer — Train-lock (T13-restside, 27.08.2026, se
 * docs/natt/D-LYS-OG-5T-BESLUTNING.md §0.8).
 *
 * Mønster-port av `AdminVideoerV2` (Paper) — samme datakontrakt
 * (AdminVideoerV2Data/AdminVideoRad/AdminVideoSpiller) og SAMME server
 * actions (uploadVideo, deleteVideo, getSignedVideoUrl). Ingen egen fasit
 * tegner denne skjermen — port med tl-kit-primitiver + lokale form-felt
 * (samme idiom som AdminProfilTrainLock).
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uploadVideo, deleteVideo, getSignedVideoUrl } from "@/lib/storage/video";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TlCaps, TlKnapp, TlKort, TlRad, TlTittel, TlTomTilstand, TL_PRESS } from "./tl-kit";

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

const ACCEPT = "video/mp4,video/quicktime,video/webm";
const MAX_MB = 500;

function TlFelt({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}><TlCaps size={10}>{label}</TlCaps></div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 44,
          padding: "0 14px",
          borderRadius: TL.radius.field,
          background: TL.dock,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          color: TL.text,
          fontSize: 14,
          fontFamily: mono ? TL.font.mono : TL.font.sans,
          border: "none",
        }}
      />
    </div>
  );
}

function TlSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}><TlCaps size={10}>{label}</TlCaps></div>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            height: 44,
            padding: "0 38px 0 14px",
            borderRadius: TL.radius.field,
            background: TL.dock,
            boxShadow: `inset 0 0 0 1px ${TL.hair}`,
            color: TL.text,
            fontSize: 14,
            fontFamily: TL.font.sans,
            border: "none",
            appearance: "none",
            cursor: "pointer",
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Icon name="chevron-down" size={14} style={{ color: TL.mute }} />
        </span>
      </div>
    </div>
  );
}

function TlTekstOmraade({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}><TlCaps size={10}>{label}</TlCaps></div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: TL.radius.field,
          background: TL.dock,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          color: TL.text,
          fontSize: 14,
          fontFamily: TL.font.sans,
          border: "none",
          resize: "vertical",
        }}
      />
    </div>
  );
}

function mb(n: number): string {
  return (n / 1024 / 1024).toFixed(1).replace(".", ",");
}

/** Dropsone for videofil — kontrollert komponent, eieren validerer i onFile. */
function TlDropzone({ file, onFile }: { file: File | null; onFile: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const aktiv = dragging || !!file;

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files?.[0] ?? null); }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        textAlign: "center",
        padding: "34px 20px",
        borderRadius: 14,
        boxShadow: `inset 0 0 0 1.5px ${aktiv ? TL.warm : TL.hair}`,
        background: TL.dock,
        cursor: "pointer",
        position: "relative",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, overflow: "hidden" }}
      />
      <span style={{ width: 46, height: 46, borderRadius: 9999, background: TL.dim, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={file ? "file" : "upload"} size={19} style={{ color: file ? TL.warm : TL.mute }} />
      </span>
      {file ? (
        <>
          <span style={{ fontWeight: 700, fontSize: 14, color: TL.text }}>{file.name}</span>
          <span style={{ fontSize: 11, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{mb(file.size)} MB · {file.type || "ukjent format"}</span>
          <TlKnapp
            variant="tertiaer"
            icon="x"
            onClick={() => { if (inputRef.current) inputRef.current.value = ""; onFile(null); }}
          >
            Fjern
          </TlKnapp>
        </>
      ) : (
        <>
          <span style={{ fontWeight: 700, fontSize: 14, color: TL.text }}>Slipp videofilen her</span>
          <span style={{ fontSize: 11, color: TL.mute }}>eller klikk for å velge fra maskinen</span>
        </>
      )}
    </label>
  );
}

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

  const spillerValg = [{ value: "", label: "Velg spiller …" }, ...spillere.map((s) => ({ value: s.id, label: s.name ?? "Uten navn" }))];

  return (
    <TlKort eyebrow="Last opp ny video" action={<TlCaps size={9}>Maks {MAX_MB} MB · mp4 · mov · webm</TlCaps>} pad="18px 20px">
      <form key={resetKey} onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TlDropzone file={file} onFile={settFil} />

        {pending && (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: TL.mute }}>Laster opp …</span>
              <span style={{ fontSize: 11, color: TL.mute }}>vennligst vent</span>
            </div>
            <div style={{ height: 6, borderRadius: 9999, background: TL.dim, overflow: "hidden" }}>
              <div className="animate-pulse" style={{ height: "100%", width: "50%", borderRadius: 9999, background: TL.warm }} />
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <TlFelt label="Tittel" value={title} onChange={setTitle} placeholder="F.eks. Sving-analyse — bunker" />
          <TlSelect label="Spiller" value={playerId} onChange={setPlayerId} options={spillerValg} />
          <TlFelt label="Tag (valgfri)" value={tag} onChange={setTag} placeholder="sving / putt / chip" />
          <TlFelt label="Booking-ID (valgfri)" value={bookingId} onChange={setBookingId} placeholder="cm…" mono />
        </div>

        <TlTekstOmraade label="Notater til spilleren (valgfri)" value={notes} onChange={setNotes} rows={3} />

        {error && (
          <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: TL.danger, boxShadow: `inset 0 0 0 1px ${TL.danger}`, borderRadius: 11, padding: "10px 13px", lineHeight: 1.5 }}>
            <Icon name="alert-triangle" size={14} style={{ color: TL.danger, flex: "none", marginTop: 1 }} />
            {error}
          </div>
        )}
        {success && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: TL.ok, boxShadow: `inset 0 0 0 1px ${TL.ok}`, borderRadius: 11, padding: "10px 13px" }}>
            <Icon name="check-circle" size={14} style={{ color: TL.ok, flex: "none" }} />
            Video lastet opp og delt med spilleren.
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: TL.mute }}>Spilleren får varsel når videoen er klar.</span>
          <TlKnapp variant="primaer" icon="upload" type="submit" disabled={pending || !file}>
            {pending ? "Laster opp …" : "Last opp og send"}
          </TlKnapp>
        </div>
      </form>
    </TlKort>
  );
}

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
      <TlRad
        last={last && !error}
        chevron={false}
        title={video.title}
        sub={
          <>
            <Link href={`/admin/spillere/${video.playerId}`} className={TL_PRESS} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 }}>
              {video.playerName}
            </Link>
            {" · "}
            {video.coachName}
            {video.tag ? ` · ${video.tag}` : ""}
          </>
        }
        meta={
          <span style={{ fontSize: 10.5, color: TL.mute, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {video.dato}
            {video.storrelse ? ` · ${video.storrelse}` : ""}
          </span>
        }
        trailing={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flex: "none" }}>
            {!klar && (
              <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: TL.warn, boxShadow: `inset 0 0 0 1px ${TL.warnHair}` }}>
                {video.status}
              </span>
            )}
            <TlKnapp variant="tertiaer" icon="external-link" disabled={!klar} onClick={spillAv} style={{ height: 36, padding: "0 13px" }}>
              Åpne
            </TlKnapp>
            {video.canDelete && (
              <TlKnapp variant="tertiaer" icon="trash" disabled={pending} onClick={slett} style={{ height: 36, padding: "0 11px", color: TL.danger }} />
            )}
          </span>
        }
      />
      {error && (
        <div role="alert" style={{ fontSize: 12, color: TL.danger, boxShadow: `inset 0 0 0 1px ${TL.danger}`, borderRadius: 10, padding: "6px 10px", margin: "6px 0 10px" }}>
          {error}
        </div>
      )}
    </div>
  );
}

export function AdminVideoerTrainLock({ data }: { data: AdminVideoerV2Data }) {
  const { kpis, spillere, videoer } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <TlTittel sub="AgencyOS">Videoer</TlTittel>
          <p style={{ fontSize: 13, color: TL.mute, lineHeight: 1.55, margin: "10px 0 0" }}>
            {kpis.totalt} videoer totalt. Maks {MAX_MB} MB per video — mp4, mov eller webm.
          </p>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: kpis.totalt > 0 ? TL.text : TL.warn, boxShadow: `inset 0 0 0 1px ${kpis.totalt > 0 ? TL.hair : TL.warnHair}` }}>
          {kpis.totalt === 0 ? "Ingen videoer" : `${kpis.totalt} totalt`}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Videoer totalt", value: kpis.totalt },
          { label: "Siste 7 dager", value: kpis.sisteUke },
          { label: "Unike spillere", value: kpis.unikeSpillere },
          { label: "Lagring brukt", value: kpis.lagring },
        ].map((k) => (
          <div key={k.label} style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "16px 18px" }}>
            <TlCaps size={10}>{k.label}</TlCaps>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text, fontVariantNumeric: "tabular-nums" }}>{k.value}</div>
          </div>
        ))}
      </div>

      <OpplastingsSkjema spillere={spillere} />

      <TlKort eyebrow="Opplastede videoer" action={<TlCaps size={9}>{videoer.length} stk</TlCaps>} pad="4px 20px">
        {videoer.length === 0 ? (
          <TlTomTilstand icon="video" title="Ingen videoer ennå" sub="Bruk skjemaet over for å laste opp første video." />
        ) : (
          <div>
            {videoer.map((v, i) => (
              <VideoRad key={v.id} video={v} last={i === videoer.length - 1} />
            ))}
          </div>
        )}
      </TlKort>
    </div>
  );
}
