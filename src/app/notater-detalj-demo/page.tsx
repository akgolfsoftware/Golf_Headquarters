/**
 * DEMO — PlayerHQ Notat-detalj
 * Spec: design2.0/06-playerhq-B/spec.md (Pakke 5/5)
 * URL: /notater-detalj-demo
 *
 * Default state: Notatet-tab, ulest, lyst tema. Ingen sidebar/shell.
 */

import {
  Check,
  Share2,
  Highlighter,
  ArrowUpRight,
  Quote,
  ChevronRight,
  Tag,
  Send,
  MessageCircle,
} from "lucide-react";

const TABS = ["Notatet", "Relaterte", "Kommentarer", "Vedlegg"] as const;

const ACTIONABLES = [
  "Tren 4 × 15 min pitch fra 75 m hver dag denne uka",
  "Logg refleksjon etter hver runde i appen",
];

const TAGS = ["TEK", "SLAG", "pitch-konsistens"];

export default function NotaterDetaljDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1180px] px-8 py-10">
        {/* Header */}
        <header className="mb-6">
          <button className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
            Coach-notater
          </button>

          <div className="flex flex-wrap items-start gap-5">
            <div className="relative shrink-0">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary font-mono text-[18px] font-semibold text-primary-foreground">
                AK
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-sm bg-foreground px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-background">
                Coach
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Notat fra Anders K
              </span>
              <h1 className="mt-1 font-display text-[24px] font-semibold leading-snug tracking-tight">
                Pitch 50–100 m: konsistens-fokus
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Skrevet av Anders K · 8. mai 16:42 · Knyttet til økt 8. mai 14:00
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatPill label="Lest" value="0 ganger" tone="warning" />
                <StatPill label="Relaterte" value="3 notater" />
                <StatPill label="Knytt til økt" value="09.05" />
                <StatPill label="Actionable" value="2" tone="accent" />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-foreground transition-opacity hover:opacity-90">
                <Check size={16} strokeWidth={1.5} />
                Marker som lest
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                <Share2 size={16} strokeWidth={1.5} />
                Del med foresatte
              </button>
            </div>
          </div>
        </header>

        {/* Status-banner */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F4C430]/40 bg-[#FFF0D6] px-3.5 py-1.5 text-[12px] font-medium text-[#B8852A]">
          <span className="h-2 w-2 rounded-full bg-[#B8852A]" />
          Ulest siden 8. mai 16:42
        </div>

        {/* Tabs */}
        <nav className="mb-8 flex gap-1 border-b border-border">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`relative px-4 py-3 text-[13px] font-medium transition-colors ${
                i === 0
                  ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-12 gap-6">
          {/* Body */}
          <section className="col-span-12 lg:col-span-8">
            <article className="rounded-lg border border-border bg-card p-8">
              <div className="space-y-4 text-[16px] leading-[1.7] text-foreground">
                <p>
                  Markus, vi gikk gjennom pitch-økten fra 50–100 m i dag. Du traff
                  middel-distansen (75 m) konsekvent, men spredningen i landings-punkt
                  økte med 60 % når vi gikk til 100 m. Det er for mye å la stå.
                </p>

                <blockquote className="my-6 border-l-2 border-accent pl-5 font-display text-[18px] italic leading-snug text-foreground">
                  «Konsistens i mellom-pitch er det som skiller en runde på 71 fra en
                  på 68. Gjør drillen i hovedfokus denne uka — alt annet er sekundært.»
                </blockquote>

                <p>
                  Vi setter to konkrete handlinger denne uka. Logg refleksjon etter
                  hver runde slik at vi ser om kontroll-følelsen følger statistikken.
                </p>

                <div className="mt-6 rounded-md bg-[#FFFBEA] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Highlighter size={14} strokeWidth={1.5} className="text-[#B8852A]" />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#B8852A]">
                      Actionable · 2 punkter
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {ACTIONABLES.map((a) => (
                      <li key={a} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-sm border border-[#B8852A] bg-card">
                          <span className="h-1.5 w-1.5 rounded-[1px] bg-transparent" />
                        </span>
                        <span className="text-[14px] leading-snug text-foreground">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p>
                  Ta med refleksjonene til neste live-økt 11. mai. Da kjører vi TPI-
                  oppfølging i tillegg.
                </p>
              </div>
            </article>
          </section>

          {/* Sidebar */}
          <aside className="col-span-12 space-y-4 lg:col-span-4">
            {/* Knyttet til økt */}
            <a
              href="#"
              className="block rounded-lg border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-center gap-2">
                <Quote size={14} strokeWidth={1.5} className="text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Knyttet til økt
                </span>
              </div>
              <div className="mt-3">
                <div className="text-[14px] font-semibold leading-snug">TEK 1:1 Pitch 50–100 m</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  8. mai 2026 · 14:00 – 15:30
                </div>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-foreground">
                Åpne økten
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </span>
            </a>

            {/* Coach */}
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary font-mono text-[12px] font-semibold text-primary-foreground">
                  AK
                </div>
                <div>
                  <div className="text-[13px] font-semibold leading-none">Anders Kristiansen</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">Hovedcoach</div>
                </div>
              </div>
              <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                <Send size={14} strokeWidth={1.5} />
                Send svar
              </button>
            </div>

            {/* Tags */}
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Tag size={14} strokeWidth={1.5} className="text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Tags
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Relaterte preview */}
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <MessageCircle size={14} strokeWidth={1.5} className="text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  3 relaterte notater
                </span>
              </div>
              <ul className="space-y-3">
                <RelatedRow title="Pitch 75 m baseline-test" date="3. mai" />
                <RelatedRow title="Sand-shot 30 m progresjon" date="29. apr" />
                <RelatedRow title="Wedge-distance-kalibrering" date="22. apr" />
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "accent" | "warning";
}) {
  const styles: Record<NonNullable<typeof tone>, string> = {
    muted: "bg-secondary text-foreground border-border",
    accent: "bg-accent/30 text-foreground border-accent/40",
    warning: "bg-[#FFF0D6] text-[#B8852A] border-[#F4C430]/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] ${styles[tone]}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold tabular-nums">{value}</span>
    </span>
  );
}

function RelatedRow({ title, date }: { title: string; date: string }) {
  return (
    <li>
      <a
        href="#"
        className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2 transition-colors hover:bg-secondary"
      >
        <span className="truncate text-[13px] font-medium">{title}</span>
        <span className="font-mono text-[11px] text-muted-foreground">{date}</span>
      </a>
    </li>
  );
}
