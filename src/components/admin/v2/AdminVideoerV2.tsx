"use client";

/**
 * AgencyOS v2 — Coaching-videoer (`/admin/videoer`, AgencyOS Bølge 3.10,
 * 2026-07-14). Port fra `(legacy)/videoer/page.tsx` + `video-upload-form.tsx`
 * + `video-card.tsx` — samme `SessionVideo`-datamodell og
 * `uploadVideo`/`getSignedVideoUrl`/`deleteVideo`-kontrakt.
 */

import { useRef, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T, KpiFlis } from "@/components/v2";
import { uploadVideo, deleteVideo, getSignedVideoUrl } from "@/lib/storage/video";

const ACCEPT = "video/mp4,video/quicktime,video/webm";
const MAX_MB = 500;

export interface AdminVideoV2Row {
  id: string;
  title: string;
  tag: string | null;
  status: string;
  datoTekst: string;
  storrelseTekst: string | null;
  spillerNavn: string;
  spillerId: string;
  coachNavn: string;
  kanSlette: boolean;
}

export interface AdminVideoerV2Data {
  totalt: number;
  sisteUke: number;
  unikeSpillere: number;
  lagringGbTekst: string;
  spillere: { id: string; name: string }[];
  videoer: AdminVideoV2Row[];
}

const feltStil: CSSProperties = {
  width: "100%", boxSizing: "border-box", appearance: "none",
  background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11,
  padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, outline: "none",
};

function VideoOpplastingV2({ spillere, onLastetOpp }: { spillere: { id: string; name: string }[]; onLastetOpp: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [suksess, setSuksess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const settFil = (f: File | null) => {
    setFeil(null);
    setSuksess(false);
    if (!f) { setFile(null); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setFeil(`Filen er for stor. Maks ${MAX_MB} MB.`); setFile(null); return; }
    if (!ACCEPT.split(",").includes(f.type)) { setFeil("Ugyldig format. Bruk mp4, mov eller webm."); setFile(null); return; }
    setFile(f);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(f);
      fileRef.current.files = dt.files;
      settFil(f);
    }
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeil(null);
    setSuksess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await uploadVideo(formData);
        setSuksess(true);
        formRef.current?.reset();
        setFile(null);
        onLastetOpp();
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Opplasting feilet.");
      }
    });
  };

  return (
    <Kort>
      <form ref={formRef} onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <Tittel em="ny video">Last opp</Tittel>
          <p style={{ marginTop: 4, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Maks {MAX_MB} MB · mp4 · mov · webm</p>
        </div>

        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
            borderRadius: 16, border: `2px dashed ${dragging || file ? T.lime : T.borderS}`,
            background: dragging || file ? `color-mix(in srgb, ${T.lime} 8%, transparent)` : T.panel2,
            padding: "40px 24px", textAlign: "center",
          }}
        >
          <input ref={fileRef} type="file" name="file" accept={ACCEPT} onChange={(e) => settFil(e.target.files?.[0] ?? null)} required style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
          {file ? (
            <>
              <span style={{ width: 48, height: 48, borderRadius: 9999, background: `color-mix(in srgb, ${T.lime} 15%, transparent)`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="video" size={20} style={{ color: T.lime }} /></span>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>{file.name}</div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{(file.size / 1024 / 1024).toFixed(1)} MB · {file.type}</div>
              <button type="button" onClick={(e) => { e.preventDefault(); if (fileRef.current) fileRef.current.value = ""; settFil(null); }} style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel3, padding: "6px 14px", fontFamily: T.ui, fontSize: 11.5, color: T.mut, cursor: "pointer" }}>
                <Icon name="x" size={12} /> Fjern
              </button>
            </>
          ) : (
            <>
              <span style={{ width: 48, height: 48, borderRadius: 9999, background: T.panel3, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="upload" size={20} style={{ color: T.fg2 }} /></span>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>Slipp videofilen her</div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>eller klikk for å velge fra maskinen</div>
            </>
          )}
        </label>

        {pending && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.mono, fontSize: 11, color: T.mut, marginBottom: 6 }}><span>Laster opp …</span><span>vennligst vent</span></div>
            <div style={{ height: 6, borderRadius: 9999, background: T.panel3, overflow: "hidden" }}><div style={{ width: "50%", height: "100%", borderRadius: 9999, background: T.lime }} /></div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <label style={{ display: "block" }}>
            <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Tittel</Caps>
            <input name="title" required placeholder="F.eks. Sving-analyse — bunker" style={feltStil} />
          </label>
          <label style={{ display: "block" }}>
            <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Spiller</Caps>
            <select name="playerId" required defaultValue="" style={feltStil}>
              <option value="" disabled>Velg spiller …</option>
              {spillere.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label style={{ display: "block" }}>
            <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Tag (valgfri)</Caps>
            <input name="tag" placeholder="sving / putt / chip" style={feltStil} />
          </label>
          <label style={{ display: "block" }}>
            <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Booking-ID (valgfri)</Caps>
            <input name="bookingId" placeholder="cm…" style={feltStil} />
          </label>
        </div>
        <label style={{ display: "block" }}>
          <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Notater til spilleren (valgfri)</Caps>
          <textarea name="notes" rows={3} style={{ ...feltStil, resize: "vertical" }} />
        </label>

        {feil && <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 8, borderRadius: 10, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${T.down} 40%, transparent)`, padding: "12px 14px", fontFamily: T.ui, fontSize: 13, color: T.down }}><Icon name="alert-triangle" size={15} />{feil}</div>}
        {suksess && <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10, background: `color-mix(in srgb, ${T.up} 12%, transparent)`, padding: "10px 14px", fontFamily: T.ui, fontSize: 13, color: T.up }}><Icon name="check-circle" size={15} /> Video lastet opp og delt med spilleren.</div>}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>Spilleren får varsel når videoen er klar.</span>
          <Knapp icon="upload" type="submit" disabled={pending || !file}>{pending ? "Laster opp …" : "Last opp og send"}</Knapp>
        </div>
      </form>
    </Kort>
  );
}

function VideoKortV2({ v, onSlettet }: { v: AdminVideoV2Row; onSlettet: () => void }) {
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const spillAv = async () => {
    setFeil(null);
    try {
      const url = await getSignedVideoUrl(v.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Kunne ikke åpne video");
    }
  };

  const slett = () => {
    if (!confirm(`Slett videoen «${v.title}»? Kan ikke angres.`)) return;
    startTransition(async () => {
      try { await deleteVideo(v.id); onSlettet(); }
      catch (err) { setFeil(err instanceof Error ? err.message : "Sletting feilet"); }
    });
  };

  return (
    <Kort style={{ gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon name="video" size={16} style={{ color: T.lime }} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 13.5, color: T.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Link href={`/admin/spillere/${v.spillerId}`} style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, textDecoration: "none" }}>{v.spillerNavn}</Link>
            <span style={{ color: T.mut, fontSize: 11 }}>·</span>
            <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>{v.coachNavn}</span>
            {v.tag && <StatusPill tone="info">{v.tag}</StatusPill>}
          </div>
        </div>
        {v.status !== "READY" && <StatusPill tone="warn">{v.status}</StatusPill>}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{v.datoTekst}{v.storrelseTekst ? ` · ${v.storrelseTekst}` : ""}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <Knapp ghost icon="play" onClick={spillAv} disabled={v.status !== "READY"}>Åpne</Knapp>
          {v.kanSlette && <Knapp ghost icon="trash" onClick={slett} disabled={pending} />}
        </div>
      </div>

      {feil && <div role="alert" style={{ fontFamily: T.ui, fontSize: 11.5, color: T.down }}>{feil}</div>}
    </Kort>
  );
}

export function AdminVideoerV2({ totalt, sisteUke, unikeSpillere, lagringGbTekst, spillere, videoer }: AdminVideoerV2Data) {
  const router = useRouter();
  const [rader, setRader] = useState(videoer);
  const oppdater = () => router.refresh();
  const fjernLokalt = (id: string) => setRader((r) => r.filter((x) => x.id !== id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps size={9}>AgencyOS · Coaching-videoer</Caps>
        <Tittel em="del">Last opp og</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4 }}>med spillerne · {totalt} videoer totalt. Maks 500 MB per video — mp4, mov eller webm.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: T.gap }}>
        <KpiFlis label="Videoer totalt" value={totalt} instant />
        <KpiFlis label="Siste 7 dgr" value={sisteUke} instant />
        <KpiFlis label="Unike spillere" value={unikeSpillere} instant />
        <KpiFlis label="Lagring" value={lagringGbTekst} instant />
      </div>

      <VideoOpplastingV2 spillere={spillere} onLastetOpp={oppdater} />

      <div>
        <Tittel em="videoer">Opplastede</Tittel>
        {rader.length === 0 ? (
          <Kort style={{ marginTop: 14 }}>
            <div style={{ padding: "34px 10px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen videoer ennå. Bruk skjemaet over for å laste opp første video.</div>
          </Kort>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: T.gap, marginTop: 14 }}>
            {rader.map((v) => <VideoKortV2 key={v.id} v={v} onSlettet={() => fjernLokalt(v.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
}
