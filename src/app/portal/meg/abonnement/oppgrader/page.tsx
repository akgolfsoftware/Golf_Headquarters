import Link from "next/link";
import {
  Sparkles,
  Crosshair,
  Video,
  CalendarDays,
  BarChart3,
  Users,
  Check,
  ArrowRight,
  Lock,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";

const FORDELER = [
  {
    Icon: Sparkles,
    tittel: "AI-coach ubegrenset",
    desc: "Spør om swing, stats eller plan — får svar tilpasset dine TrackMan-data sekunder etterpå.",
    meta: "~847 spørsmål / spiller / år",
    featured: true,
  },
  {
    Icon: Crosshair,
    tittel: "4 coaching-credits hver måned",
    desc: "Bytt mot 1:1-time med coach, videogjennomgang eller skreddersydd treningsuke.",
    meta: "Verdi 1 200 kr / mnd",
  },
  {
    Icon: Video,
    tittel: "Videoanalyse",
    desc: "Last opp swing — coach legger inn linjer, vinkler og kommentarer.",
    meta: "10 videoer / mnd",
  },
  {
    Icon: CalendarDays,
    tittel: "Smart planlegger",
    desc: "Pyramide-balansert ukeplan med AI-foreslåtte drills — godkjenn med ett klikk.",
    meta: "Sparer ~2 t / uke",
  },
  {
    Icon: BarChart3,
    tittel: "Komplett historikk",
    desc: "Alle runder, økter og statistikk — ubegrenset tilbake i tid.",
    meta: "Fra første dag du logget",
  },
  {
    Icon: Users,
    tittel: "Familiekonto",
    desc: "Inkluder mor, far eller coach gratis — de ser plan og fremgang.",
    meta: "Opptil 3 sammenkoblinger",
  },
];

export default async function OppgraderPage() {
  await requirePortalUser();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Pro · Oppgrader"
        titleLead="Slik"
        titleItalic="løfter"
        titleTrail="Pro spillet ditt"
        sub="AI-coach hele døgnet, ubegrenset video-analyse og komplett historikk. Bygd for spillere som har en plan. Avbryt når som helst — første 30 dager er angreretten din."
      />

      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        <Lock className="h-3 w-3 text-primary" strokeWidth={2} />
        Sikker betaling · Stripe
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {FORDELER.map((f) => (
          <div
            key={f.tittel}
            className={`relative flex flex-col gap-3 rounded-2xl border p-6 shadow-sm transition-transform hover:-translate-y-0.5 ${
              f.featured
                ? "border-primary/40 bg-gradient-to-br from-accent/30 to-card"
                : "border-border bg-card"
            }`}
          >
            <div
              className={`grid h-11 w-11 place-items-center rounded-xl ${
                f.featured ? "bg-primary text-accent" : "bg-muted text-primary"
              }`}
            >
              <f.Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-base font-semibold text-foreground">
              {f.tittel}
            </h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
            <span className="mt-auto font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
              {f.meta}
            </span>
          </div>
        ))}
      </div>

      {/* Price strip */}
      <section className="grid gap-6 overflow-hidden rounded-2xl bg-primary p-8 text-accent lg:grid-cols-[1fr_280px]">
        <div>
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-accent/70">
            Din pris
          </span>
          <h2 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            300 kr / måned — alt{" "}
            <em className="font-normal italic">inkludert</em>
          </h2>
          <p className="mt-3 text-sm text-accent/80">
            Fri pause, fri avbestilling, 30 dagers full angrerett. Spar ~14 % med årlig faktura.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["AI-coach 24/7", "4 credits/mnd", "Videoanalyse", "Ubegrenset historikk", "Familiekonto"].map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em]"
              >
                <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center border-t border-accent/30 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="font-mono text-5xl font-bold tabular-nums leading-none">
            300
            <small className="ml-1 text-base font-normal text-accent/70">kr</small>
          </div>
          <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.10em] text-accent/70">
            PR MÅNED
          </div>
          <div className="mt-2 text-sm text-accent/80">
            3 600 kr / år · ingen skjulte gebyrer
          </div>
          <Link
            href="/portal/meg/abonnement/oppgrader/flyt"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-foreground transition-transform hover:-translate-y-0.5"
          >
            Start oppgradering
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>
      </section>
    </div>
  );
}
