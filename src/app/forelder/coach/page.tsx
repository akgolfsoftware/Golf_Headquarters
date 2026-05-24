// Foreldreportal — Coach. Meldinger med coach (kun offentlige — ikke private notater).
// Mock-data i versjon 1 — kobles til Prisma Message-modell i neste sprint.

import {
  MessageSquare,
  User,
  Send,
  Info,
  ArrowRight,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ForelderHero } from "@/components/forelder/forelder-hero";

export const dynamic = "force-dynamic";

type MockMelding = {
  id: string;
  avsender: "forelder" | "coach";
  navn: string;
  tekst: string;
  tid: string;
  ulest: boolean;
};

const MOCK_MELDINGER: MockMelding[] = [
  {
    id: "m1",
    avsender: "coach",
    navn: "Markus R.P.",
    tekst: "Hei! Markus hadde en flott runde i dag. Puttingen er merkbart bedre — god progresjon med linjebeholdet.",
    tid: "i dag · 17:48",
    ulest: true,
  },
  {
    id: "m2",
    avsender: "forelder",
    navn: "Deg",
    tekst: "Tusen takk! Han nevnte at han jobbet mye med startlinja denne uka.",
    tid: "i dag · 18:02",
    ulest: false,
  },
  {
    id: "m3",
    avsender: "coach",
    navn: "Markus R.P.",
    tekst: "Neste uke: tirsdag kl. 15 og torsdag kl. 14. Planlegger driver + short game.",
    tid: "i går · 09:15",
    ulest: false,
  },
  {
    id: "m4",
    avsender: "coach",
    navn: "Markus R.P.",
    tekst: "Påminnelse: Husk at Markus skal bringe ekstra hansker til treningsleiren 3. juni.",
    tid: "22. mai · 11:30",
    ulest: false,
  },
];

const ulesttall = MOCK_MELDINGER.filter((m) => m.ulest && m.avsender === "coach").length;

export default async function ForelderCoach() {
  await requirePortalUser({ allow: ["PARENT"] });

  return (
    <div className="space-y-8">
      <ForelderHero
        eyebrow="Foreldreportal · Coach"
        titleLead="Dialog med"
        titleItalic="coach"
        sub="Se meldinger fra coachen og svar direkte. Private notater er ikke synlige her."
      />

      {/* Info-banner: hva er synlig */}
      <section
        aria-label="Personvern-informasjon"
        className="rounded-xl border border-primary/20 bg-primary/5 p-4"
      >
        <div className="flex items-start gap-3 text-sm">
          <Info
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
            strokeWidth={1.75}
            aria-hidden
          />
          <div>
            <p className="font-semibold text-foreground">
              Du ser kun delte meldinger
            </p>
            <p className="mt-1 text-muted-foreground">
              Coachs private notater og interne planer er ikke synlige i foreldreportalen. Kun meldinger coach har merket som delt med foreldre vises her.
            </p>
          </div>
        </div>
      </section>

      {/* Coach-info-card */}
      <section
        aria-labelledby="coach-info-overskrift"
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground"
          >
            M
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="coach-info-overskrift"
              className="font-display text-lg font-semibold tracking-tight"
            >
              Markus Roinas-Pedersen
            </h2>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Hovedcoach · GFGK · PGA-sertifisert
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Online
            </div>
          </div>
        </div>
      </section>

      {/* Meldingstrad */}
      <section aria-labelledby="meldinger-overskrift" className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="meldinger-overskrift"
            className="inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight"
          >
            <MessageSquare
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
            Meldinger
            {ulesttall > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] text-primary-foreground">
                {ulesttall} NYE
              </span>
            )}
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {MOCK_MELDINGER.length} meldinger
          </span>
        </div>

        <ul className="divide-y divide-border">
          {MOCK_MELDINGER.map((m) => {
            const erForelder = m.avsender === "forelder";
            return (
              <li
                key={m.id}
                className={`flex gap-4 px-6 py-4 text-sm ${
                  m.ulest && !erForelder ? "bg-primary/5" : ""
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full ${
                    erForelder
                      ? "bg-secondary text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {erForelder ? (
                    <User className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <span className="font-display text-xs font-semibold">M</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold">{m.navn}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {m.tid}
                    </span>
                    {m.ulest && !erForelder && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                        Ulest
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground">{m.tekst}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Svar-boks (stub — ikke funksjonell i v1) */}
        <div className="border-t border-border p-4">
          <label htmlFor="melding-svar" className="sr-only">
            Skriv svar til coach
          </label>
          <div className="flex gap-3">
            <input
              id="melding-svar"
              type="text"
              disabled
              placeholder="Skriv svar... (aktiveres i Spor 1)"
              className="min-w-0 flex-1 rounded-md border border-input bg-muted px-4 py-2 text-sm text-muted-foreground placeholder:text-muted-foreground/60 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled
              aria-label="Send melding"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Send
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Meldinger er krypterte og kun synlige for deg og coachen.
          </p>
        </div>
      </section>

      {/* Hurtigtilgang */}
      <section aria-label="Hurtigtilgang" className="rounded-xl border border-border bg-card p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Relatert
        </div>
        <ul className="mt-4 space-y-2">
          <li>
            <a
              href="/forelder/barn"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              Se barnets treningsprofil
            </a>
          </li>
          <li>
            <a
              href="/forelder/bookinger"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              Se kommende bookinger
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
