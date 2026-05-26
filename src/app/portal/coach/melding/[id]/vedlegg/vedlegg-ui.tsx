"use client";

import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Mic,
  Play,
  Video,
} from "lucide-react";

type AttType = "image" | "video" | "pdf" | "audio";

type Attachment = {
  name: string;
  type: AttType;
  ext: string;
  size: string;
  meta?: string;
  group: string;
  duration?: string;
  audioBars?: number[];
};

const ATTACHMENTS: Attachment[] = [
  { name: "trackman-p3-overlay.png", type: "image", ext: "PNG", size: "1,2 MB", meta: "1920×1080", group: "I dag · 19. mai" },
  { name: "door-jam-demo.mp4", type: "video", ext: "MP4", size: "14,8 MB", meta: "720p", group: "I dag · 19. mai", duration: "0:31" },
  { name: "swing-still-dtl-001.jpg", type: "image", ext: "JPG", size: "2,1 MB", meta: "3024×4032", group: "I dag · 19. mai" },
  { name: "swing-still-fo-002.jpg", type: "image", ext: "JPG", size: "2,3 MB", meta: "3024×4032", group: "I dag · 19. mai" },
  { name: "trackman-1422.png", type: "image", ext: "PNG", size: "240 KB", meta: "1280×720", group: "Tirsdag · 18. mai" },
  { name: "treningsplan-mai.pdf", type: "pdf", ext: "PDF", size: "148 KB", meta: "2 sider", group: "Tirsdag · 18. mai" },
  { name: "swing-analyse-dtl.mp4", type: "video", ext: "MP4", size: "9,4 MB", meta: "1080p", group: "Tirsdag · 18. mai", duration: "0:24" },
  { name: "referanse-p2.jpg", type: "image", ext: "JPG", size: "1,8 MB", meta: "2048×2048", group: "Tirsdag · 18. mai" },
  {
    name: "taleopptak-feedback.m4a",
    type: "audio",
    ext: "M4A",
    size: "1,4 MB",
    meta: "Hans Brennum",
    group: "15. – 12. mai",
    duration: "1:42",
    audioBars: [30, 55, 75, 40, 90, 60, 35, 80, 50, 70, 45, 85, 30, 55, 65],
  },
  { name: "range-session-data.png", type: "image", ext: "PNG", size: "980 KB", meta: "1440×900", group: "15. – 12. mai" },
  { name: "putting-stroke-vis.mp4", type: "video", ext: "MP4", size: "6,2 MB", meta: "720p", group: "15. – 12. mai", duration: "0:18" },
  { name: "hjemmeoppgaver.pdf", type: "pdf", ext: "PDF", size: "284 KB", meta: "4 sider", group: "15. – 12. mai" },
  { name: "grip-position-1.jpg", type: "image", ext: "JPG", size: "1,5 MB", meta: "2048×1536", group: "15. – 12. mai" },
  { name: "flightscope-summary.png", type: "image", ext: "PNG", size: "620 KB", meta: "1600×900", group: "15. – 12. mai" },
];

type Filter = "all" | AttType;

const FILTERS: { key: Filter; label: string; icon?: typeof ImageIcon }[] = [
  { key: "all", label: "Alle" },
  { key: "image", label: "Bilder", icon: ImageIcon },
  { key: "video", label: "Videoer", icon: Video },
  { key: "pdf", label: "PDF", icon: FileText },
  { key: "audio", label: "Lyd", icon: Mic },
];

export function VedleggUi() {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: ATTACHMENTS.length };
    for (const a of ATTACHMENTS) c[a.type] = (c[a.type] ?? 0) + 1;
    return c;
  }, []);

  const visible = useMemo(
    () => ATTACHMENTS.filter((a) => filter === "all" || a.type === filter),
    [filter],
  );

  const groups = useMemo(() => {
    const m = new Map<string, Attachment[]>();
    for (const a of visible) {
      if (!m.has(a.group)) m.set(a.group, []);
      m.get(a.group)!.push(a);
    }
    return m;
  }, [visible]);

  return (
    <>
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-2 px-6 py-4">
          <h1 className="font-display text-[22px] font-semibold -tracking-[0.01em]">
            Vedlegg <em className="font-display italic font-normal text-primary">galleri</em>
          </h1>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
            14 filer · Hans Brennum
          </span>
          <div className="ml-auto flex flex-wrap gap-1.5">
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
                      filter === f.key ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {counts[f.key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1200px] space-y-10 px-6 py-10">
        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
            <h3 className="font-display text-[18px] font-semibold">
              Ingen vedlegg av denne typen
            </h3>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Prøv et annet filter — eller spør Hans om materiale du mangler.
            </p>
          </div>
        ) : (
          Array.from(groups.entries()).map(([group, items]) => (
            <section key={group}>
              <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
                {group}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((a) => (
                  <AttachmentCard key={a.name} a={a} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}

function AttachmentCard({ a }: { a: Attachment }) {
  return (
    <button
      type="button"
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card text-left transition-all hover:-translate-y-px hover:border-primary"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
        <ThumbBg type={a.type} />
        <span
          className={`absolute left-2 top-2 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] ${
            a.type === "video"
              ? "bg-foreground/80 text-accent"
              : a.type === "pdf"
                ? "bg-destructive text-destructive-foreground"
                : a.type === "audio"
                  ? "bg-primary text-accent"
                  : "bg-card/85 text-foreground"
          }`}
        >
          {a.ext}
        </span>
        <span
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-card/85 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Last ned"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        {a.type === "video" && (
          <>
            <span className="absolute inset-0 bg-foreground/20" />
            <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-foreground/70">
              <Play className="h-5 w-5 fill-accent text-accent" />
            </span>
            {a.duration && (
              <span className="absolute bottom-2 right-2 rounded bg-foreground/85 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                {a.duration}
              </span>
            )}
          </>
        )}
        {a.type === "audio" && a.audioBars && (
          <div className="absolute inset-x-3 bottom-3 flex h-12 items-end justify-between gap-[3px]">
            {a.audioBars.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm bg-accent/70"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        )}
        {a.type === "pdf" && (
          <div className="absolute inset-4 rounded bg-card shadow-inner" />
        )}
      </div>
      <div className="flex flex-col gap-1 px-4 pb-2">
        <div className="truncate text-[12.5px] font-semibold">{a.name}</div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
          <span>{a.size}</span>
          {a.meta && (
            <>
              <span>·</span>
              <span>{a.meta}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

function ThumbBg({ type }: { type: AttType }) {
  if (type === "audio") {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-foreground">
        <Mic className="absolute left-1/2 top-1/3 h-8 w-8 -translate-x-1/2 text-accent" strokeWidth={1.5} />
      </div>
    );
  }
  if (type === "pdf") {
    return <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />;
  }
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary to-accent/30" />
  );
}
