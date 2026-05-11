/**
 * DEMO — PlayerHQ Coach-detalj
 * Spec: design2.0/06-playerhq-B/spec.md (Pakke 1/5)
 * URL: /coach-detalj-demo
 *
 * Default state: Om-tab, lyst tema. Ingen sidebar/shell.
 */

import {
  ArrowUpRight,
  Send,
  Calendar,
  MessageSquare,
  Star,
  Award,
  Quote,
  ChevronRight,
} from "lucide-react";

const TABS = ["Om", "Mine økter", "Meldinger", "Notater", "Plan"] as const;

const CERTIFICATIONS = [
  { name: "NGF Trener IV", org: "Norges Golfforbund", year: "2018" },
  { name: "TPI Level 3", org: "Titleist Performance Institute", year: "2020" },
  { name: "TrackMan Master Coach", org: "TrackMan A/S", year: "2021" },
  { name: "Mac O'Grady MORAD", org: "MORAD Institute", year: "2019" },
];

const SPECIALTIES = ["TEK · sving-mekanikk", "SLAG · pitch & wedge", "SPILL · banespill"];

export default function CoachDetaljDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <button className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
            Tilbake til portal
          </button>

          <div className="flex flex-wrap items-start gap-6">
            <div className="relative shrink-0">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary font-mono text-[22px] font-semibold text-primary-foreground">
                AK
              </div>
              <span
                className="absolute right-0 bottom-0 h-[14px] w-[14px] rounded-full border-2 border-background bg-[#1A7D56]"
                aria-label="online"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Din coach
              </span>
              <h1 className="mt-1 font-display text-[32px] font-semibold leading-[1.05] tracking-tight">
                Anders Kristiansen
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Hovedcoach · NGF Trener IV · 12 år erfaring · <span className="text-[#1A7D56] font-medium">Online nå</span>
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatPill label="28 økter sammen" />
                <StatPill label="2 uleste meldinger" tone="warning" />
                <StatPill label="14:00 neste økt i dag" tone="accent" />
                <StatPill label="4,9 snitt-fokus / 5" icon={<Star size={12} strokeWidth={1.5} />} />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                <Calendar size={16} strokeWidth={1.5} />
                Be om økt
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                <Send size={16} strokeWidth={1.5} />
                Send melding
              </button>
            </div>
          </div>
        </header>

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

        <div className="grid grid-cols-12 gap-4">
          {/* Bio */}
          <section className="col-span-12 rounded-lg border border-border bg-card p-8 lg:col-span-8">
            <Quote size={24} strokeWidth={1.5} className="text-accent" />
            <p className="mt-3 font-display text-[22px] italic leading-snug text-foreground">
              «Vi jobber ikke med teknikk for teknikkens skyld. Vi jobber med det som
              gir lavest score når det betyr noe.»
            </p>
            <div className="mt-6 space-y-3 text-[14px] leading-[1.7] text-foreground">
              <p>
                Anders har coachet golfere i 12 år, fra rangejunior til pro-tour. Han
                bygger AK Golf Academy rundt en pyramide-modell — fundament før spiss,
                konsistens før spektakulært.
              </p>
              <p>
                Spesialitet: tek-omlegginger som faktisk tas i bruk på banen. Bruker
                TrackMan og Mac O&apos;Grady MORAD som rammer. 280+ spillere har vært
                gjennom programmet siden 2014.
              </p>
              <p>
                Markus, du har vært under Anders i 2 år. 28 økter loggført, snitt-fokus
                4,9 av 5. Du ligger nå Kat A · Elite.
              </p>
            </div>
          </section>

          {/* Stat-rich */}
          <section className="col-span-12 lg:col-span-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="grid gap-4">
                <Stat label="Erfaring" value="12 år" />
                <Stat label="Spillere coachet" value="280+" />
                <Stat label="Snitt-rating" value="4,9" suffix=" / 5" />
              </div>
              <button className="mt-5 inline-flex w-full items-center justify-center gap-1 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                Andre coacher du kan booke
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </button>
            </div>
          </section>

          {/* Spesialiteter */}
          <section className="col-span-12 rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Pyramide-fokus
                </div>
                <h3 className="mt-1 font-display text-[16px] font-semibold leading-snug">
                  Spesialiteter
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground">Klikk for å filtrere notater</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  className="rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-accent/30"
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Sertifiseringer */}
          <section className="col-span-12 rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Award size={16} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Sertifiseringer
              </span>
            </div>
            <ul className="divide-y divide-border rounded-md border border-border">
              {CERTIFICATIONS.map((c) => (
                <li
                  key={c.name}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-secondary/60"
                >
                  <div>
                    <div className="text-[14px] font-semibold leading-none">{c.name}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{c.org}</div>
                  </div>
                  <span className="font-mono text-[12px] tabular-nums text-muted-foreground">{c.year}</span>
                  <button className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <ArrowUpRight size={14} strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Andre coacher preview */}
          <section className="col-span-12">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare size={14} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Andre coacher du har tilgang til
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SubCoachCard initials="TH" name="Tom Hansen" role="Putt-spesialist" sessions={6} />
              <SubCoachCard initials="SL" name="Sara Lien" role="Mental coach" sessions={3} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  tone = "muted",
  icon,
}: {
  label: string;
  tone?: "muted" | "warning" | "accent";
  icon?: React.ReactNode;
}) {
  const styles: Record<NonNullable<typeof tone>, string> = {
    muted: "bg-secondary text-foreground border-border",
    accent: "bg-accent/30 text-foreground border-accent/40",
    warning: "bg-[#FFF0D6] text-[#B8852A] border-[#F4C430]/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium ${styles[tone]}`}
    >
      {icon}
      {label}
    </span>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-[22px] font-semibold tabular-nums leading-none">
        {value}
        {suffix ? <span className="text-[14px] text-muted-foreground">{suffix}</span> : null}
      </div>
    </div>
  );
}

function SubCoachCard({
  initials,
  name,
  role,
  sessions,
}: {
  initials: string;
  name: string;
  role: string;
  sessions: number;
}) {
  return (
    <article className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[14px] font-semibold text-foreground">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold leading-none">{name}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {role} · {sessions} økter
        </div>
      </div>
      <button className="rounded-full border border-border bg-transparent px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
        Bytt til denne
      </button>
    </article>
  );
}
