"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2 } from "lucide-react";
import { uploadVideo } from "@/lib/storage/video";

type Spiller = { id: string; name: string; email: string };

export function VideoUploadForm({ spillere }: { spillere: Spiller[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [filnavn, setFilnavn] = useState<string | null>(null);

  function valgFil(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    setFilnavn(fil ? `${fil.name} (${(fil.size / 1024 / 1024).toFixed(1)} MB)` : null);
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
        setFilnavn(null);
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
      className="space-y-4 rounded-lg border border-border bg-card p-6"
    >
      <h2 className="font-display text-base font-semibold tracking-tight">
        Last opp ny video
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Felt label="Tittel" name="title" placeholder="F.eks. Sving-analyse — bunker" required />
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

      <label className="block">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Videofil (mp4, mov, webm — maks 500 MB)
        </span>
        <input
          type="file"
          name="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={valgFil}
          required
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90"
        />
        {filnavn && (
          <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
            {filnavn}
          </span>
        )}
      </label>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
          Video lastet opp og delt med spilleren.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
        {pending ? "Laster opp …" : "Last opp"}
      </button>
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
        className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
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
        className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
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
        className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}
