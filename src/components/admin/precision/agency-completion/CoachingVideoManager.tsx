"use client";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, Video, Play, Trash2, RefreshCw } from "lucide-react";
import { Knapp, KnappLenke, StatusPille, TomTilstand } from "@/components/precision/pa";
import { SideHode, Dialogboks } from "@/components/precision/pa-a4";
import { createVideoUploadTicket, confirmVideoUpload, getSignedVideoUrl, deleteVideo, type VideoUploadMetadata } from "@/lib/storage/video";
import { uploadSignedVideo } from "@/lib/storage/direct-video-client";
import { completeCoachingVideoUpload, validateCoachingVideo, type CoachingUploadAttempt } from "./coaching-video-upload";
import styles from "./CoachingVideoManager.module.css";
export type CoachingVideoData = {
  players: Array<{ id: string; name: string }>;
  bookings: Array<{ id: string; playerId: string; label: string }>;
  videos: Array<{ id: string; title: string; playerId: string; playerName: string; coachName: string; status: string; createdLabel: string; sizeLabel: string | null; tag: string | null; notes: string | null; canConfirm: boolean; canDelete: boolean }>;
  total: number; page: number; pageSize: number; initialPlayerId: string;
};
function safeError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  if (error.message === "unauthenticated") return "Du må logge inn på nytt. Filen og feltene er beholdt her.";
  if (/forbidden|not-found/.test(error.message)) return "Tilgangen kunne ikke bekreftes. Prøv igjen eller gå tilbake til spilleren.";
  return error.message || fallback;
}
function VideoRow({ video }: { video: CoachingVideoData["videos"][number] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const busy = useRef(false);
  const run = (action: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true; setError(null);
    start(async () => { try { await action(); } catch (err) { setError(safeError(err, "Handlingen kunne ikke bekreftes. Prøv igjen.")); } finally { busy.current = false; } });
  };
  if (deleted) return null;
  const ready = video.status === "READY";
  return <li className={styles.row} aria-busy={pending}>
    <div><h3>{video.title}</h3><p><Link href={`/admin/spillere/${video.playerId}`}>{video.playerName}</Link> · {video.coachName}</p>
      <p className={styles.hint}>{video.createdLabel}{video.sizeLabel ? ` · ${video.sizeLabel}` : ""}{video.tag ? ` · ${video.tag}` : ""}</p></div>
    {video.notes && <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{video.notes}</p>}
    {!ready && <StatusPille tone="warn">{video.status === "FAILED" ? "Opplasting feilet" : "Lagring er ikke bekreftet"}</StatusPille>}
    <div className={styles.actions}>
      {ready && <Knapp variant="secondary" icon={Play} disabled={pending} onClick={() => run(async () => {
        const url = await getSignedVideoUrl(video.id);
        if (!url) throw new Error("Avspillingen kunne ikke åpnes. Prøv igjen.");
        setSrc(url);
      })}>{src ? "Forny avspilling" : "Spill av"}</Knapp>}
      {!ready && video.canConfirm && <Knapp variant="secondary" icon={RefreshCw} disabled={pending} onClick={() => run(async () => {
        const receipt = await confirmVideoUpload(video.id);
        if (receipt.ok !== true || receipt.videoId !== video.id) throw new Error("Lagringen kunne ikke bekreftes.");
        router.refresh();
      })}>Kontroller lagring</Knapp>}
      {video.canDelete && <Knapp variant="ghost" icon={Trash2} disabled={pending} onClick={() => setConfirmDelete(true)}>Slett video</Knapp>}
    </div>
    {src && <video className={styles.player} src={src} controls playsInline preload="metadata" aria-label={`Coachingvideo: ${video.title}`} onError={() => { setSrc(null); setError("Avspillingen kunne ikke lastes. Trykk Spill av for å hente ny tilgang."); }} />}
    {error && <p className={styles.error} role="alert">{error}</p>}
    <Dialogboks open={confirmDelete} title="Slett denne videoen?" onClose={() => { if (!pending) setConfirmDelete(false); }} footer={<>
      <Knapp variant="ghost" disabled={pending} onClick={() => setConfirmDelete(false)}>Behold videoen</Knapp>
      <Knapp loading={pending} loadingText="Sletter …" onClick={() => run(async () => {
        const receipt = await deleteVideo(video.id);
        if (receipt.ok !== true) throw new Error("Slettingen kunne ikke bekreftes.");
        setSrc(null); setConfirmDelete(false); setDeleted(true); router.refresh();
      })}>Slett video</Knapp>
    </>}><p>«{video.title}» fjernes fra deg og spilleren. Dette kan ikke angres.</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </Dialogboks>
  </li>;
}
export function CoachingVideoManager({ data }: { data: CoachingVideoData }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const attempt = useRef<CoachingUploadAttempt | null>(null);
  const busy = useRef(false);
  const [pending, start] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [playerId, setPlayerId] = useState(data.initialPlayerId);
  const [bookingId, setBookingId] = useState("");
  const [tag, setTag] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [phase, setPhase] = useState("");
  const [hasAttempt, setHasAttempt] = useState(false);
  const bookings = data.bookings.filter(b => b.playerId === playerId);
  const chooseFile = (selected: File | null) => { setFile(selected); setSuccess(null); setError(selected ? validateCoachingVideo(selected) : null); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); if (busy.current) return;
    setError(null); setSuccess(null);
    if (!file) { setError("Velg en videofil."); return; }
    if (!title.trim()) { setError("Skriv en tittel på videoen."); return; }
    if (!data.players.some(p => p.id === playerId)) { setError("Velg en spiller du har coachingtilgang til."); return; }
    if (bookingId && !bookings.some(b => b.id === bookingId)) { setError("Velg en av dine bookinger for denne spilleren, eller velg uten booking."); return; }
    if (validateCoachingVideo(file)) { setError(validateCoachingVideo(file)); return; }
    const metadata: VideoUploadMetadata = { title: title.trim(), playerId, bookingId: bookingId || undefined, tag: tag.trim() || undefined, notes: notes.trim() || undefined, sizeBytes: file.size, mimeType: file.type as VideoUploadMetadata["mimeType"] };
    busy.current = true;
    start(async () => {
      try {
        const receipt = await completeCoachingVideoUpload(file, metadata, attempt.current, { createTicket: createVideoUploadTicket, upload: uploadSignedVideo, confirm: confirmVideoUpload }, a => { attempt.current = a; setHasAttempt(true); }, setPhase);
        setSuccess(`«${metadata.title}» er bekreftet lagret og tilgjengelig for spilleren.`);
        attempt.current = null; setHasAttempt(false); setFile(null); setTitle(""); setBookingId(""); setTag(""); setNotes("");
        if (fileInput.current) fileInput.current.value = "";
        if (receipt.ok) { if (data.page > 1) router.replace("/admin/videoer"); router.refresh(); }
      } catch (err) { setError(safeError(err, "Videoen kunne ikke lagres. Filen og feltene er beholdt. Prøv igjen.")); }
      finally { busy.current = false; setPhase(""); }
    });
  };
  return <>
    <SideHode title="Coachingvideoer" sub="Videoer til dine spillere. Filen deles først når lagringen er bekreftet." />
    <div className={styles.grid}>
      <section className={styles.form} aria-label="Last opp coachingvideo"><h2>Last opp en video</h2>
        {!data.players.length ? <TomTilstand icon={Video} title="Ingen spillere med coachingtilgang" text="Koble en spiller til coachingen før du kan dele en video." actions={<KnappLenke href="/admin/spillere" variant="secondary">Åpne stallen</KnappLenke>} /> : <form onSubmit={submit} aria-busy={pending}>
          <fieldset disabled={pending}>
            <div className={styles.file}>
              <input ref={fileInput} type="file" hidden accept="video/mp4,video/quicktime,video/webm" onChange={e => chooseFile(e.target.files?.[0] ?? null)} />
              <Knapp variant="secondary" icon={Upload} onClick={() => fileInput.current?.click()}>Velg videofil</Knapp>
              <p>{file ? `${file.name} · ${(file.size / (1024 * 1024)).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} MB` : "Ingen fil valgt"}</p><p className={styles.hint}>MP4, MOV eller WEBM · maks 500 MB. Filen sendes direkte til privat lagring.</p>
            </div>
            <div className={styles.fields}>
              <label className={styles.field}>Tittel<input value={title} required onChange={e => setTitle(e.target.value)} /></label>
              <label className={styles.field}>Spiller<select value={playerId} required onChange={e => { setPlayerId(e.target.value); setBookingId(""); }}><option value="">Velg spiller</option>{data.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              <label className={styles.field}>Booking, valgfri<select value={bookingId} onChange={e => setBookingId(e.target.value)}><option value="">Uten booking</option>{bookings.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}</select></label>
              <label className={styles.field}>Tema, valgfritt<input value={tag} onChange={e => setTag(e.target.value)} /></label>
            </div>
            <label className={styles.field}>Notat til spilleren, valgfritt<textarea value={notes} onChange={e => setNotes(e.target.value)} /></label>
            <Knapp type="submit" icon={Upload} loading={pending} loadingText={phase || "Lagrer videoen …"} disabled={!file}>Last opp og del</Knapp>
          </fieldset>
          {phase && <p role="status">{phase}</p>}{error && <p className={styles.error} role="alert">{error} Filen og feltene er beholdt.</p>}
          {error && hasAttempt && <Knapp variant="ghost" disabled={pending} onClick={() => { attempt.current = null; setHasAttempt(false); setError(null); }}>Start opplastingen på nytt med samme fil</Knapp>}
          {success && <p role="status">{success}</p>}
        </form>}
      </section>
      <section className={styles.list} aria-label="Lagrede coachingvideoer"><h2>Videoer</h2>
        {data.total === 0 ? <TomTilstand icon={Video} title="Ingen coachingvideoer ennå" text="Last opp en video og velg spilleren som skal få den." /> : <><p className={styles.hint}>Viser {(data.page - 1) * data.pageSize + 1}–{Math.min((data.page - 1) * data.pageSize + data.videos.length, data.total)} av {data.total} videoer</p><ul className={styles.rows}>{data.videos.map(v => <VideoRow key={v.id} video={v} />)}</ul>
          <nav className={styles.actions} aria-label="Videosider">{data.page > 1 && <KnappLenke variant="secondary" href={`/admin/videoer?page=${data.page - 1}`}>Forrige side</KnappLenke>}{data.page * data.pageSize < data.total && <KnappLenke variant="secondary" href={`/admin/videoer?page=${data.page + 1}`}>Neste side</KnappLenke>}</nav>
        </>}
      </section>
    </div>
  </>;
}
