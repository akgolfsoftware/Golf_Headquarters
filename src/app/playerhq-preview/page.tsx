/**
 * Preview-indeks for PlayerHQ-skjermer (offentlig, ingen auth).
 * Lenke-liste til preview-skjermene som er portet fra v10-fasiten.
 * FJERNES når skjermene kobles inn på de ekte /portal-rutene.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SCREENS = [
  {
    href: "/playerhq-preview/hjem",
    title: "Hjem",
    desc: "Spillerens daglige landing — tom-tilstand (ny GRATIS-spiller).",
  },
  {
    href: "/playerhq-preview/sg-hub",
    title: "SG-Hub",
    desc: "Strokes Gained — tom-tilstand, 4 disipliner + verktøy.",
  },
  {
    href: "/playerhq-preview/live-brief",
    title: "Live-økt · Brief",
    desc: "Pre-økt: mål, fokus, dagens drill.",
  },
  {
    href: "/playerhq-preview/live-active",
    title: "Live-økt · Aktiv",
    desc: "Fullscreen treningsmodus — timer, rep-teller, logg.",
  },
  {
    href: "/playerhq-preview/live-summary",
    title: "Live-økt · Summary",
    desc: "Etter økt: compliance, statistikk, per drill.",
  },
  {
    href: "/playerhq-preview/runder",
    title: "Runder",
    desc: "Rundeliste — tom-tilstand (ingen runder logget).",
  },
  {
    href: "/playerhq-preview/statistikk",
    title: "Statistikk",
    desc: "Nøkkeltall + metrikk-oversikt for spilleren.",
  },
  {
    href: "/playerhq-preview/analyse",
    title: "Analyse",
    desc: "Analyse-hub — innganger til SG, runder og innsikt.",
  },
  {
    href: "/playerhq-preview/meg",
    title: "Meg",
    desc: "Profil — bilde, HCP, abonnement, snarveier.",
  },
  {
    href: "/playerhq-preview/abonnement",
    title: "Abonnement",
    desc: "GRATIS / PRO + oppgrader (Stripe).",
  },
  {
    href: "/playerhq-preview/drills",
    title: "Drill-bibliotek",
    desc: "Drill-bibliotek grid/liste + søk.",
  },
  {
    href: "/playerhq-preview/tester",
    title: "Tester",
    desc: "Test-oversikt + NGF-katalog.",
  },
  {
    href: "/playerhq-preview/aarsplan",
    title: "Årsplan",
    desc: "Gantt-kart hele året, faser per pyramide-akse.",
  },
  {
    href: "/playerhq-preview/booking",
    title: "Booking",
    desc: "Book time-CTA, credits, kommende bookinger.",
  },
  // PlayerHQ — pulje-2
  {
    href: "/playerhq-preview/booking-ny",
    title: "Booking — ny",
    desc: "Booking-wizard (velg coach/anlegg/tjeneste/tid/bekreft).",
  },
  {
    href: "/playerhq-preview/drill-detalj",
    title: "Drill-detalj",
    desc: "Drill-detalj (video + beskrivelse).",
  },
  {
    href: "/playerhq-preview/innstillinger",
    title: "Innstillinger",
    desc: "Innstillinger (varsler/personvern/sikkerhet/språk).",
  },
  {
    href: "/playerhq-preview/runde-ny",
    title: "Runde — ny",
    desc: "Logg ny runde.",
  },
  {
    href: "/playerhq-preview/trackman",
    title: "TrackMan",
    desc: "TrackMan dispersjon + per-slag-data.",
  },
  {
    href: "/playerhq-preview/turnering",
    title: "Turnering-detalj",
    desc: "Turnering-detalj (bane/dato/resultat).",
  },
  {
    href: "/playerhq-preview/varsler",
    title: "Varsler",
    desc: "Varsler/notifikasjoner.",
  },
  // Auth
  {
    href: "/playerhq-preview/auth-login",
    title: "Logg inn",
    desc: "Innlogging.",
  },
  {
    href: "/playerhq-preview/auth-signup",
    title: "Registrer konto",
    desc: "Registrer konto (tier-valg).",
  },
  {
    href: "/playerhq-preview/auth-forgot",
    title: "Glemt passord",
    desc: "Tilbakestill passord.",
  },
  {
    href: "/playerhq-preview/auth-bankid",
    title: "BankID",
    desc: "BankID-verifisering.",
  },
  {
    href: "/playerhq-preview/auth-loggetut",
    title: "Logget ut",
    desc: "Logget ut-skjerm.",
  },
  {
    href: "/playerhq-preview/onboarding",
    title: "Onboarding",
    desc: "Onboarding-wizard (8 steg).",
  },
  // Forelder
  {
    href: "/playerhq-preview/forelder",
    title: "Foreldreportal",
    desc: "Foreldreportal — barnets oversikt.",
  },
  {
    href: "/playerhq-preview/foreldre-info",
    title: "Foresatt-info",
    desc: "Foresatt-info (spillerside).",
  },
  // Marketing
  {
    href: "/playerhq-preview/marketing-forside",
    title: "Marketing-forside",
    desc: "Marketing-forside (akgolf.no landing).",
  },
  // System
  {
    href: "/playerhq-preview/ikke-funnet",
    title: "404 — ikke funnet",
    desc: "404 ikke funnet-side.",
  },
] as const;

export default function PlayerHqPreviewIndex() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-10">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        PlayerHQ · Preview
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.02em] text-foreground">
        Skjerm-preview
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Skjermer portet fra v10-design. Klikk for å åpne.
      </p>

      <ul className="mt-6 space-y-2">
        {SCREENS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <span className="min-w-0">
                <span className="block font-display text-base font-semibold tracking-tight text-foreground">
                  {s.title}
                </span>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">
                  {s.desc}
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground/60"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
