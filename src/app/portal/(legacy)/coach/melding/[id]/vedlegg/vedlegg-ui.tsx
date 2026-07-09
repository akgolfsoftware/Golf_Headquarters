"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";
import { lastOppVedlegg, slettVedlegg } from "./actions";

export type VedleggItem = {
  id: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string; // ISO
  url: string; // signed URL
};

// Kategori avledet fra MIME-type. "fil" = ukjent/annet (vises uten egen chip).
type AttType = "image" | "pdf" | "audio" | "fil";

const FILTERS: { key: "all" | AttType; label: string; icon?: typeof ImageIcon }[] = [
  { key: "all", label: "Alle" },
  { key: "image", label: "Bilder", icon: ImageIcon },
  { key: "pdf", label: "PDF", icon: FileText },
  { key: "audio", label: "Lyd", icon: Mic },
];

function typeOf(mime: string | null): AttType {
  if (!mime) return "fil";
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("audio/")) return "audio";
  return "fil";
}

function extOf(fileName: string, mime: string | null): string {
  if (fileName.includes(".")) return fileName.split(".").pop()!.toUpperCase();
  if (mime) return (mime.split("/").pop() ?? "FIL").toUpperCase();
  return "FIL";
}

function formaterBytes(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1).replace(".", ",")} MB`;
}

const datoFmt = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
});

function gruppeFor(iso: string): string {
  const d = new Date(iso);
  const idag = new Date();
  const igår = new Date();
  igår.setDate(idag.getDate() - 1);
  const sammeDag = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sammeDag(d, idag)) return `I dag · ${datoFmt.format(d)}`;
  if (sammeDag(d, igår)) return `I går · ${datoFmt.format(d)}`;
  return datoFmt.format(d);
}

export function VedleggUi({
  sessionId,
  vedlegg,
}: {
  sessionId: string;
  vedlegg: VedleggItem[];
}) {
  const [filter, setFilter] = useState<"all" | AttType>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: vedlegg.length };
    for (const v of vedlegg) {
      const t = typeOf(v.fileType);
      c[t] = (c[t] ?? 0) + 1;
    }
    return c;
  }, [vedlegg]);

  const visible = useMemo(
    () =>
      vedlegg.filter((v) => filter === "all" || typeOf(v.fileType) === filter),
    [vedlegg, filter],
  );

  // Grupper på dato (bevart rekkefølge — listen kommer nyeste først fra serveren).
  const groups = useMemo(() => {
    const m = new Map<string, VedleggItem[]>();
    for (const v of visible) {
      const g = gruppeFor(v.createdAt);
      if (!m.has(g)) m.set(g, []);
      m.get(g)!.push(v);
    }
    return m;
  }, [visible]);

  return (
    <>
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-2 px-6 py-4">
          <h1 className="font-display text-[22px] font-semibold -tracking-[0.01em]">
            Vedlegg{" "}
            <em className="font-display italic font-normal text-primary">galleri</em>
          </h1>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
            {vedlegg.length} {vedlegg.length === 1 ? "fil" : "filer"}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                    filter === f.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-muted-foreground"
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />}
                  {f.label}
                  <span
                    className={`font-mono text-[10px] ${
                      filter === f.key
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {counts[f.key] ?? 0}
                  </span>
                </button>
              );
            })}
            <OpplastingsForm sessionId={sessionId} />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1200px] space-y-10 px-6 py-10">
        {vedlegg.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
            <Paperclip
              className="mx-auto h-7 w-7 text-muted-foreground"
              strokeWidth={1.5}
            />
            <h3 className="mt-3 font-display text-[18px] font-semibold">
              Ingen vedlegg ennå
            </h3>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Last opp bilder, PDF eller lydfiler med knappen øverst.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
            <h3 className="font-display text-[18px] font-semibold">
              Ingen vedlegg av denne typen
            </h3>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Prøv et annet filter.
            </p>
          </div>
        ) : (
          Array.from(groups.entries()).map(([group, items]) => (
            <section key={group}>
              <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
                {group}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((v) => (
                  <AttachmentCard key={v.id} v={v} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}

function OpplastingsForm({ sessionId }: { sessionId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function onValgt(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    setFeil(null);
    const fd = new FormData();
    fd.set("file", fil);
    startTransition(async () => {
      const res = await lastOppVedlegg(sessionId, fd);
      if (!res.ok) setFeil(res.feil);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf,audio/*"
        className="hidden"
        onChange={onValgt}
        disabled={pending}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-4 py-1.5 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
        ) : (
          <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
        {pending ? "Laster opp…" : "Last opp"}
      </button>
      {feil && (
        <span className="font-mono text-[10.5px] text-destructive" role="alert">
          {feil}
        </span>
      )}
    </div>
  );
}

function AttachmentCard({ v }: { v: VedleggItem }) {
  const type = typeOf(v.fileType);
  const ext = extOf(v.fileName, v.fileType);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function onSlett() {
    setFeil(null);
    startTransition(async () => {
      const res = await slettVedlegg(v.id);
      if (!res.ok) setFeil(res.feil);
    });
  }

  return (
    <div className="group flex flex-col gap-2 rounded-xl border border-border bg-card transition-all hover:-translate-y-px hover:border-primary">
      <a
        href={v.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[4/3] overflow-hidden rounded-t-xl"
      >
        {type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.url}
            alt={v.fileName}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <ThumbBg type={type} />
        )}
        <span
          className={`absolute left-2 top-2 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] ${
            type === "pdf"
              ? "bg-destructive text-destructive-foreground"
              : type === "audio"
                ? "bg-primary text-accent"
                : "bg-card/85 text-foreground"
          }`}
        >
          {ext}
        </span>
        <span
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-card/85 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Åpne / last ned"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        {type === "pdf" && (
          <FileText
            className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.25}
          />
        )}
        {type === "fil" && (
          <Paperclip
            className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.25}
          />
        )}
      </a>
      <div className="flex items-start gap-2 px-4 pb-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="truncate text-[12.5px] font-semibold">{v.fileName}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
            {formaterBytes(v.fileSize)}
          </div>
          {feil && (
            <span className="font-mono text-[10px] text-destructive" role="alert">
              {feil}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onSlett}
          disabled={pending}
          className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          aria-label="Slett vedlegg"
          title="Slett vedlegg"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
          ) : (
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </div>
  );
}

function ThumbBg({ type }: { type: AttType }) {
  if (type === "audio") {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-foreground">
        <Mic
          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-accent"
          strokeWidth={1.5}
        />
      </div>
    );
  }
  if (type === "pdf") {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
    );
  }
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary to-accent/30" />
  );
}
