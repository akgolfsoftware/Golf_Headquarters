/**
 * PILOT — PlayerHQ Round Insight (modal)
 * Bygd direkte fra wireframe/design-files-v2/modaler-D/d02-round-insight.html
 * URL: /round-insight-demo
 *
 * Mock-data: Insight-agent rapporterer fra runde Borre 1. mai 2026.
 */

import { X, Sparkles, TrendingUp, TrendingDown, Target, Compass, ArrowRight } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

export default function RoundInsightDemo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[720px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* AI-stripe */}
        <div className="h-1 bg-gradient-to-r from-primary to-accent" />

        {/* Head */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 pb-5 pt-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-primary">
                <Sparkles className="h-2.5 w-2.5" strokeWidth={2} />
                Insight-agent
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
                Konfidens 87 % · 2 min siden
              </span>
            </div>
            <h2 className="mt-2 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Innsikt fra runden
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Borre Golfklubb · 1. mai 2026 · 74 (−1) · 18 hull
            </p>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        {/* Body */}
        <div className="px-8 pb-2">
          <Section
            tone="good"
            icon={<TrendingUp className="h-5 w-5" strokeWidth={1.75} />}
            label="Hva gikk bra"
            heading="Putting var sterkeste del — sterk lesning av breaks fra venstre"
            body="28 putts totalt og SG putting på +1,1 — det er ditt nest beste resultat siste 12 runder. På hull 8 og 14 leverte du single-putts fra over 2 m, og hull 2/11 viser at lesing av brekk fra venstre side er låst inne."
            pills={[
              { label: "+1,1 SG putting", tone: "up", icon: <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.2} /> },
              { label: "8 av 10 single-putts", tone: "up" },
              { label: "28 putts · −3 vs snitt" },
            ]}
          />

          <Section
            tone="warn"
            icon={<Target className="h-5 w-5" strokeWidth={1.75} />}
            label="Hva kan bli bedre"
            heading="Driver-konsistens svinger — tempo brytes på lange hull"
            body="FIR falt fra 79 % på første 9 til 64 % på siste 9. To spesifikke utslag — hull 7 (230 m off-line, høyre rough) og hull 12 (200 m off-line, venstre semi) — peker mot at tempo brytes når du står på par-5 og lange par-4."
            pills={[
              { label: "Hull 7 · 230 m off-line", tone: "down", icon: <TrendingDown className="h-2.5 w-2.5" strokeWidth={2.2} /> },
              { label: "Hull 12 · 200 m off-line", tone: "down" },
              { label: "79 % → 64 % FIR" },
            ]}
          />

          <Section
            tone="rec"
            icon={<Compass className="h-5 w-5" strokeWidth={1.75} />}
            label="Anbefaling for neste økt"
            heading="30 min driver-tempo i blokk 2 av neste TEK-økt"
            body="Bruk Mevo for kalibrering. Fokuser på 8/10-tempo, måles via ball-speed-konsistens (mål: stdev < 3 m/s over 12 baller). Hvis konsistensen holder, kan du øke til full-swing siste 10 min."
            quote={{
              text: "Markus, dette stemmer godt med det jeg har sett. Ta tempo-blokken først — ikke gå rett på full swing. Si fra hvis Mevo bråker.",
              who: "Anders Kristiansen · NGF Trener IV",
            }}
            cta={{ label: "Bok TEK-økt — onsdag 06. mai" }}
            last
          />
        </div>

        {/* Foot */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Avbryt
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Be Anders utdype
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Godkjenn anbefaling
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

interface Pill {
  label: string;
  tone?: "up" | "down";
  icon?: React.ReactNode;
}

function Section({
  tone,
  icon,
  label,
  heading,
  body,
  pills,
  quote,
  cta,
  last,
}: {
  tone: "good" | "warn" | "rec";
  icon: React.ReactNode;
  label: string;
  heading: string;
  body: string;
  pills?: Pill[];
  quote?: { text: string; who: string };
  cta?: { label: string };
  last?: boolean;
}) {
  const iconCls =
    tone === "good"
      ? "bg-[rgba(22,163,74,0.12)] text-[#16A34A]"
      : tone === "warn"
        ? "bg-[rgba(244,196,48,0.18)] text-[#B8860B]"
        : "bg-primary/10 text-primary";
  return (
    <section className={`flex gap-4.5 py-5.5 ${last ? "" : "border-b border-border"}`} style={{ gap: 18, paddingTop: 22, paddingBottom: 22 }}>
      <div className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl ${iconCls}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </div>
        <div className="mb-2 font-display text-[17px] font-semibold leading-snug -tracking-[0.005em] text-foreground">
          {heading}
        </div>
        <p className="mb-3 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
        {pills && (
          <div className="flex flex-wrap gap-2">
            {pills.map((p, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-2.5 py-1.5 font-mono text-[11px] font-semibold tabular-nums ${
                  p.tone === "up"
                    ? "border-[rgba(22,163,74,0.4)] bg-[rgba(22,163,74,0.08)] text-[#16A34A]"
                    : p.tone === "down"
                      ? "border-[rgba(197,48,48,0.4)] bg-[rgba(197,48,48,0.06)] text-[#a83232]"
                      : "border-border bg-card text-muted-foreground"
                }`}
              >
                {p.icon}
                {p.label}
              </span>
            ))}
          </div>
        )}
        {quote && (
          <blockquote className="mt-3.5 rounded-r-md border-l-[3px] border-primary bg-card px-4 py-3 font-display text-[14px] italic leading-relaxed text-muted-foreground">
            {quote.text}
            <span className="mt-2 block font-mono text-[10px] font-bold not-italic uppercase tracking-[0.06em] text-muted-foreground">
              {quote.who}
            </span>
          </blockquote>
        )}
        {cta && (
          <a
            href="#"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-primary-foreground no-underline"
          >
            <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.2} />
            {cta.label}
          </a>
        )}
      </div>
    </section>
  );
}
