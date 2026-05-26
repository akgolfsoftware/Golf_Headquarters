"use client";

// Standalone popover for shot-annotasjoner (feature #12).
//
// HVORDAN BRUKE: Komponenten tar imot listen av eksisterende annotasjoner for
// ett spesifikt slag (filtrert med trackmanSessionId + clubId + shotNumber),
// pluss flagget canEdit (true = coach med relasjon, false = spiller/parent som
// kun leser).
//
// HVOR DEN SKAL KALLES FRA: Slag-tabellen i
// `src/app/portal/mal/sg-hub/[club]/page.tsx` (advanced-modus, "Slag-statistikk").
// Hver tr-rad i tabellen får en cell med <ShotAnnotationPopover ... />
// Annotasjons-data hentes server-side med
// `prisma.shotAnnotation.findMany({ where: { trackmanSessionId, clubId }})`
// og grupperes per shotNumber før de sendes inn.
//
// Coach-modus (`/portal/mal/sg-hub/coach/[spillerId]/[club]`) gjenbruker
// samme komponent med canEdit=true.

import { useState, useTransition } from "react";
import {
  Loader2,
  MessageCircle,
  MessageCirclePlus,
  Pencil,
  Trash2,
  Video,
  X,
} from "lucide-react";

import {
  addAnnotation,
  deleteAnnotation,
  editAnnotation,
} from "@/app/portal/mal/sg-hub/[club]/annotations/actions";
import { safeUrl } from "@/lib/security/safe-url";

export type ShotAnnotationRow = {
  id: string;
  body: string;
  videoUrl: string | null;
  coachName: string;
  createdAt: string; // ISO
};

type Props = {
  trackmanSessionId: string;
  clubId: string;
  shotNumber: number;
  annotations: ShotAnnotationRow[];
  canEdit: boolean;
};

export function ShotAnnotationPopover({
  trackmanSessionId,
  clubId,
  shotNumber,
  annotations,
  canEdit,
}: Props) {
  const [open, setOpen] = useState(false);
  const hasAnnotation = annotations.length > 0;

  if (!hasAnnotation && !canEdit) {
    // Skjul helt for spiller hvis ingen notat finnes.
    return null;
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        aria-label={
          hasAnnotation
            ? `${annotations.length} coach-notat for slag ${shotNumber}`
            : `Legg til notat på slag ${shotNumber}`
        }
      >
        {hasAnnotation ? (
          <MessageCircle className="h-3.5 w-3.5 text-primary" />
        ) : (
          <MessageCirclePlus className="h-3.5 w-3.5" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 w-80 rounded-xl border border-border bg-popover p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Slag {shotNumber} · {clubId}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Lukk"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {annotations.map((a) => (
              <AnnotationRow
                key={a.id}
                annotation={a}
                canEdit={canEdit}
                onChanged={() => setOpen(false)}
              />
            ))}

            {canEdit && (
              <AddAnnotationForm
                trackmanSessionId={trackmanSessionId}
                clubId={clubId}
                shotNumber={shotNumber}
                onDone={() => setOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AnnotationRow({
  annotation,
  canEdit,
  onChanged,
}: {
  annotation: ShotAnnotationRow;
  canEdit: boolean;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(annotation.body);
  const [videoUrl, setVideoUrl] = useState(annotation.videoUrl ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await editAnnotation({
        id: annotation.id,
        body,
        videoUrl: videoUrl || undefined,
      });
      if (!res.ok) {
        setError(res.error);
      } else {
        setEditing(false);
        onChanged();
      }
    });
  }

  function handleDelete() {
    if (!confirm("Slette dette notatet?")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAnnotation({ id: annotation.id });
      if (!res.ok) setError(res.error);
      else onChanged();
    });
  }

  if (editing) {
    return (
      <div className="rounded-md border border-border bg-card p-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:border-ring focus:outline-none"
        />
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Videolink (valgfri)"
          className="mt-2 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:border-ring focus:outline-none"
        />
        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            {pending && <Loader2 className="h-3 w-3 animate-spin" />}
            Lagre
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full bg-secondary px-3 py-1 text-xs"
          >
            Avbryt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-sm">{annotation.body}</p>
      {safeUrl(annotation.videoUrl) && (
        <a
          href={safeUrl(annotation.videoUrl)!}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Video className="h-3 w-3" />
          Se video
        </a>
      )}
      <div className="mt-2 flex items-center justify-between">
        <p className="font-mono text-[10px] text-muted-foreground">
          {annotation.coachName} · {formatDate(annotation.createdAt)}
        </p>
        {canEdit && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Rediger"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="text-muted-foreground hover:text-destructive disabled:opacity-50"
              aria-label="Slett"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

function AddAnnotationForm({
  trackmanSessionId,
  clubId,
  shotNumber,
  onDone,
}: {
  trackmanSessionId: string;
  clubId: string;
  shotNumber: number;
  onDone: () => void;
}) {
  const [body, setBody] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await addAnnotation({
        trackmanSessionId,
        clubId,
        shotNumber,
        body: body.trim(),
        videoUrl: videoUrl || undefined,
      });
      if (!res.ok) {
        setError(res.error);
      } else {
        setBody("");
        setVideoUrl("");
        onDone();
      }
    });
  }

  return (
    <div className="rounded-md border border-dashed border-border p-3">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        Legg til notat
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Hva bør spilleren legge merke til på dette slaget?"
        className="w-full resize-none rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:border-ring focus:outline-none"
      />
      <input
        type="url"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Videolink (valgfri)"
        className="mt-2 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:border-ring focus:outline-none"
      />
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
      <button
        type="button"
        onClick={handleAdd}
        disabled={pending || !body.trim()}
        className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
      >
        {pending && <Loader2 className="h-3 w-3 animate-spin" />}
        Lagre notat
      </button>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("nb-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
