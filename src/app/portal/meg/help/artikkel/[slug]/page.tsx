// NB: Innholdet i hjelpe-artiklene under (brødtekst + eventuelle eksempeltall)
// er redaksjonelt illustrasjonsmateriale for hjelpesenteret — ikke spillerens
// egne data. Det er bevisst statisk og skal ikke forveksles med ekte tall.
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { DelKnapp } from "./del-knapp";
import { ArtikkelFeedback } from "./feedback";

type Artikkel = {
  slug: string;
  tittelLead: string;
  tittelItalic: string;
  eyebrow: string;
  forfatter: { initialer: string; navn: string; rolle: string };
  oppdatert: string;
  lesetid: number;
  toc: { id: string; tittel: string }[];
};

const ARTIKLER: Record<string, Artikkel> = {
  "pyramide-systemet": {
    slug: "pyramide-systemet",
    tittelLead: "Hva er",
    tittelItalic: "pyramide-systemet",
    eyebrow: "Trening · Artikkel · 5 min lesetid",
    forfatter: {
      initialer: "AK",
      navn: "Anders Kristiansen",
      rolle: "Head Coach · AK Golf",
    },
    oppdatert: "12. mai 2026",
    lesetid: 5,
    toc: [
      { id: "h1", tittel: "Hvorfor en pyramide?" },
      { id: "h2", tittel: "De fem disiplinene" },
      { id: "h3", tittel: "Slik balanseres uka" },
      { id: "h4", tittel: "Når balansen tipper" },
    ],
  },
};

export default async function ArtikkelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requirePortalUser();
  const { slug } = await params;
  const a = ARTIKLER[slug];
  if (!a) notFound();

  return (
    <div className="mx-auto grid max-w-[1240px] gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_220px]">
      <article className="max-w-[720px] space-y-6">
        <Link
          href="/portal/meg/help"
          className="inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Hjelp-hub
        </Link>

        <header className="space-y-2">
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {a.eyebrow}
          </span>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            {a.tittelLead}{" "}
            <em className="font-normal italic text-primary">{a.tittelItalic}</em>?
          </h1>
        </header>

        <div className="flex flex-wrap items-center gap-4 border-y border-border py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-accent">
              {a.forfatter.initialer}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {a.forfatter.navn}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {a.forfatter.rolle}
              </div>
            </div>
          </div>
          <span className="h-4 w-px bg-border" />
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            <Clock className="h-3 w-3" strokeWidth={2} />
            <strong className="text-foreground">{a.lesetid}</strong> MIN LESETID
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            <Calendar className="h-3 w-3" strokeWidth={2} />
            OPPDATERT <strong className="text-foreground">{a.oppdatert}</strong>
          </span>
          <DelKnapp tittel={`${a.tittelLead} ${a.tittelItalic}?`} />
        </div>

        <div className="prose-content space-y-6 text-base leading-relaxed text-foreground/90">
          <h2 id="h1" className="!mt-8 font-display text-2xl font-semibold tracking-tight">
            Hvorfor en pyramide?
          </h2>
          <p>
            Pyramide-systemet er måten vi i AK Golf tenker om <strong>hvor tid brukes</strong>{" "}
            over en treningsuke. I bunnen ligger <code>FYS</code> og <code>TEK</code> — basisen for alt.
            Lenger opp kommer <code>SLAG</code>, <code>SPILL</code> og til toppen <code>TURN</code> —
            alt som er turneringsspesifikt mentalt og taktisk.
          </p>
          <p>
            Hvis du legger 80% av tida på toppen og lar bunnen forfalle, spiller du oppå et grunnlag
            som smuldrer. Hvis du legger 100% i bunnen blir du sterk og solid — men aldri
            turneringsklar.
          </p>

          <div className="my-8 rounded-2xl border border-border bg-card p-6">
            <svg viewBox="0 0 360 240" className="mx-auto h-auto w-full max-w-md">
              <polygon points="40,200 320,200 290,165 70,165" fill="#1A4D2E" />
              <polygon points="70,165 290,165 264,130 96,130" fill="#005840" />
              <polygon points="96,130 264,130 238,95 122,95" fill="#2C7D52" />
              <polygon points="122,95 238,95 212,60 148,60" fill="#88B45A" />
              <polygon points="148,60 212,60 180,20" fill="#D1F843" />
              <text x="180" y="190" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" fill="#D1F843" textAnchor="middle" letterSpacing="2">FYS · 15%</text>
              <text x="180" y="155" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" fill="#D1F843" textAnchor="middle" letterSpacing="2">TEK · 28%</text>
              <text x="180" y="120" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing="2">SLAG · 32%</text>
              <text x="180" y="85" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" fill="#0A1F17" textAnchor="middle" letterSpacing="2">SPILL · 17%</text>
              <text x="180" y="50" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" fill="#0A1F17" textAnchor="middle" letterSpacing="2">TURN · 8%</text>
            </svg>
            <p className="mt-2 text-center font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
              Pyramiden ideal-fordelt — mai 2026, A1-spiller
            </p>
          </div>

          <h2 id="h2" className="!mt-10 font-display text-2xl font-semibold tracking-tight">
            De fem disiplinene
          </h2>
          <p>Hver disiplin har sin egen rolle i bygget.</p>

          <h3 className="!mt-6 font-display text-lg font-semibold">FYS · Fysisk</h3>
          <p>
            Beinbøy, hofterotasjon, core-stabilitet, mobilitet i overkropp. Bunnen — kapasiteten du har <em>under</em>{" "}
            svingen.
          </p>

          <h3 className="!mt-6 font-display text-lg font-semibold">TEK · Teknikk</h3>
          <p>
            Bevegelse, impact, biomekanikk. Drillene her bruker som regel <em>ikke</em> ball — eller bruker ball i kontrollerte settings.
          </p>

          <h3 className="!mt-6 font-display text-lg font-semibold">SLAG · Slag-trening</h3>
          <p>
            Når du faktisk slår ball mot et resultat. Approach-distanser, putting-pace, chip-landing, bunker-pop.
          </p>

          <h3 className="!mt-6 font-display text-lg font-semibold">SPILL · Bane-spill</h3>
          <p>
            På bane, ikke på range. 9-hulls simuleringer, par-3-blokker, scoring-konkurranser.
          </p>

          <h3 className="!mt-6 font-display text-lg font-semibold">TURN · Turneringsspesifikt</h3>
          <p>
            Mental, taktisk, ritualer. Pre-shot-rutinen. Pust-protokollen mellom hull.
          </p>

          <h2 id="h3" className="!mt-10 font-display text-2xl font-semibold tracking-tight">
            Slik balanseres uka
          </h2>
          <p>
            En typisk uke for en A1-spiller fordeler seg på <strong>6–8 økter</strong> totalt.
          </p>

          <div className="my-6 space-y-2 rounded-xl border border-border bg-card p-6">
            {[
              { label: "TURN", pct: 8, target: 10, color: "hsl(var(--accent))" },
              { label: "SPILL", pct: 17, target: 15, color: "hsl(var(--accent))" },
              { label: "SLAG", pct: 32, target: 30, color: "hsl(var(--success))" },
              { label: "TEK", pct: 28, target: 30, color: "hsl(var(--primary))" },
              { label: "FYS", pct: 15, target: 15, color: "hsl(var(--primary))" },
            ].map((p) => (
              <div key={p.label} className="grid grid-cols-[60px_1fr_80px] items-center gap-2">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                  {p.label}
                </span>
                <div className="h-3 overflow-hidden rounded-sm bg-muted">
                  <div
                    className="h-full rounded-sm"
                    style={{ width: `${p.pct}%`, background: p.color }}
                  />
                </div>
                <span className="text-right font-mono text-xs tabular-nums text-foreground">
                  {p.pct}%{" "}
                  <span className="text-muted-foreground/70">/ {p.target}%</span>
                </span>
              </div>
            ))}
            <p className="mt-2 text-center font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
              Øyvind, mai 2026 — pyramide-treff <strong className="text-foreground">72%</strong>
            </p>
          </div>

          <div className="flex gap-2 rounded-xl border border-primary/30 bg-primary/[0.04] p-6">
            <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md bg-accent text-foreground">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <p className="text-sm">
              <strong>Tips fra Anders:</strong> Hvis du ser at en uke har 0% i én disiplin — det er ikke krise.
              Men hvis det går 3 uker uten en farge, vil pyramide-treffet falle merkbart.
            </p>
          </div>

          <h2 id="h4" className="!mt-10 font-display text-2xl font-semibold tracking-tight">
            Hva skjer når balansen tipper?
          </h2>
          <p>
            Pyramide-treff under <code>60%</code> betyr at hovedcoach varsles. Du får da to forslag:
            enten justere planen, eller akseptere midlertidig skjevhet.
          </p>
        </div>

        {/* Feedback */}
        <section className="space-y-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-base font-semibold text-foreground">
            Var dette nyttig?
          </h3>
          <ArtikkelFeedback />
        </section>

        {/* Coach CTA */}
        <section className="relative grid gap-4 overflow-hidden rounded-2xl bg-primary p-6 text-accent">
          <div>
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-accent/70">
              Fant du ikke svaret?
            </span>
            <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              Snakk med <em className="font-normal italic">coach direkte</em>
            </h3>
            <p className="mt-1 text-sm text-accent/80">
              Anders K og resten av coach-teamet svarer innen 4 timer på hverdager. Helt fritt for Pro-medlemmer.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/portal/coach/melding/ny"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
            >
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={2} />
              Send melding
            </Link>
            <Link
              href="/portal/meg/abonnement/oppgrader"
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-6 py-2.5 text-sm font-semibold text-accent hover:bg-accent/10"
            >
              Se Pro-medlemskap
            </Link>
          </div>
        </section>
      </article>

      {/* TOC */}
      <aside className="hidden lg:block">
        <div className="sticky top-8 border-l border-border pl-4">
          <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            I denne artikkelen
          </div>
          <nav className="flex flex-col gap-1 text-sm">
            {a.toc.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                {t.tittel}
              </a>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}
