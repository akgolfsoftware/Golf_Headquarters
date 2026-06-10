/**
 * PlayerHQ · Meg · Hjelp (/portal/meg/help).
 *
 * Portet fra fersk Claude Design-fasit (ph-screens.jsx · HjelpScreen):
 * MeSub-skall ("Hjelp & support.") → OFTE STILTE SPØRSMÅL (accordion, 4 par)
 * → TA KONTAKT (support-chat / e-post / veiledninger) → full-bredde sekundær
 * «Send forslag eller meld feil» (/portal/meg/feedback).
 *
 * FAQ-svarene følger fasiten ordrett der appens IA stemmer; coach-svaret er
 * justert til faktisk inngang (Coach-seksjonen i menyen → /portal/coach —
 * appen har ikke coach-ikon i topbaren). Server component, auth-guard beholdt.
 */
import Link from "next/link";
import { BookOpen, ExternalLink, Mail, MessageSquarePlus, MessagesSquare } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { MeSub, SetGroup, SetRow } from "@/components/portal/meg/meg-sub";
import { FaqAccordion, type FaqItem } from "./faq-accordion";

const FAQ: FaqItem[] = [
  {
    q: "Hvordan logger jeg en runde?",
    a: "Gå til Analysere → Runder → «Loggfør runde». Legg inn score hull-for-hull, så beregnes to-par og Strokes Gained automatisk.",
  },
  {
    q: "Hvor planlegger jeg trening?",
    a: "All planlegging bor i Workbench (Planlegge-fanen). Bytt mellom årsplan, treningsplan, fysplan, mål, drills og ny økt i venstre rail.",
  },
  {
    q: "Hva koster appen?",
    a: "Appen er gratis så lenge du har en aktiv coaching-pakke. Uten pakke koster den 300 kr/mnd. Det finnes ingen nivåer.",
  },
  {
    q: "Hvordan kontakter jeg coachen?",
    a: "Åpne Coach i menyen for å se meldinger, planer, videoer og AI-Caddie.",
  },
];

export default async function HelpPage() {
  await requirePortalUser();

  return (
    <MeSub
      eyebrow="MEG · HJELP"
      title="Hjelp &"
      italic="support."
      lead="Svar på vanlige spørsmål, eller ta direkte kontakt."
    >
      <SetGroup label="OFTE STILTE SPØRSMÅL">
        <FaqAccordion items={FAQ} />
      </SetGroup>

      <SetGroup label="TA KONTAKT">
        <SetRow
          icon={MessagesSquare}
          title="Chat med support"
          meta="Svarer vanligvis innen 1t"
          right={
            <Link
              href="/portal/meg/help/kontakt"
              className="inline-flex h-[34px] shrink-0 items-center justify-center rounded-xl border border-primary px-[13px] font-display text-xs font-semibold tracking-[-0.005em] text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              Åpne
            </Link>
          }
        />
        <a
          href="mailto:support@akgolf.no"
          className="block border-b border-border transition-opacity last:border-b-0 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <SetRow icon={Mail} title="support@akgolf.no" meta="E-post til teamet" />
        </a>
        <Link
          href="/portal/meg/help/kategori/komme-i-gang"
          className="block border-b border-border transition-opacity last:border-b-0 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <SetRow
            icon={BookOpen}
            title="Veiledninger"
            meta="Kom-i-gang-guider"
            right={
              <ExternalLink
                className="h-4 w-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
            }
          />
        </Link>
      </SetGroup>

      <Link
        href="/portal/meg/feedback"
        className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-primary px-[18px] font-display text-sm font-semibold tracking-[-0.005em] text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        <MessageSquarePlus className="h-4 w-4" strokeWidth={2} aria-hidden />
        Send forslag eller meld feil
      </Link>
    </MeSub>
  );
}
