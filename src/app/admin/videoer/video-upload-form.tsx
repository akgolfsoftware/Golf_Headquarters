"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, FileVideo, X, AlertCircle } from "lucide-react";
import { uploadVideo } from "@/lib/storage/video";

type Spiller = { id: string; name: string; email: string };

const ACCEPT = "video/mp4,video/quicktime,video/webm";
const MAX_MB = 500;

export function VideoUploadForm({ spillere }: { spillere: Spiller[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

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

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    settFil(e.target.files?.[0] ?? null);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(f);
      fileRef.current.files = dt.files;
      settFil(f);
    }
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await uploadVideo(formData);
        setSuccess(true);
        formRef.current?.reset();
        setFile(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Opplasting feilet.");
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="space-y-6 rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Last opp <em className="font-normal italic text-primary">ny video</em>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Maks {MAX_MB} MB · mp4 · mov · webm
          </p>
        </div>
      </div>

      {/* Drop-zone */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : file
              ? "border-primary/50 bg-primary/5"
              : "border-border bg-background hover:border-primary/40"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          name="file"
          accept={ACCEPT}
          onChange={onFileChange}
          required
          className="sr-only"
        />
        {file ? (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <FileVideo size={20} strokeWidth={1.75} />
            </span>
            <div className="font-display text-sm font-semibold">{file.name}</div>
            <div className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {(file.size / 1024 / 1024).toFixed(1)} MB · {file.type}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (fileRef.current) fileRef.current.value = "";
                settFil(null);
              }}
              className="mt-2 inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
            >
              <X size={12} strokeWidth={1.75} /> Fjern
            </button>
          </>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-foreground">
              <Upload size={20} strokeWidth={1.75} />
            </span>
            <div className="font-display text-sm font-semibold">
              Slipp videofilen her
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              eller klikk for å velge fra maskinen
            </div>
          </>
        )}
      </label>

      {/* Progress (visuelt under opplasting) */}
      {pending && (
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>Laster opp …</span>
            <span className="tabular-nums">vennligst vent</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Felt
          label="Tittel"
          name="title"
          placeholder="F.eks. Sving-analyse — bunker"
          required
        />
        <FeltSelect label="Spiller" name="playerId" required>
          <option value="">Velg spiller …</option>
          {spillere.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </FeltSelect>
        <Felt label="Tag (valgfri)" name="tag" placeholder="sving / putt / chip" />
        <Felt label="Booking-ID (valgfri)" name="bookingId" placeholder="cm…" />
      </div>

      <FeltTextarea label="Notater til spilleren (valgfri)" name="notes" />

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
          Video lastet opp og delt med spilleren.
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] text-muted-foreground">
          Spilleren får varsel når videoen er klar.
        </p>
        <button
          type="submit"
          disabled={pending || !file}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
          {pending ? "Laster opp …" : "Last opp og send"}
        </button>
      </div>
    </form>
  );
}

function Felt({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        type="text"
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

function FeltSelect({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <select
        name={name}
        required={required}
        className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
      >
        {children}
      </select>
    </label>
  );
}

function FeltTextarea({ label, name }: { label: string; name: string }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <textarea
        name={name}
        rows={3}
        className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}
