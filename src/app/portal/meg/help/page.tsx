import { requirePortalUser } from "@/lib/auth/requirePortalUser";

const FAQ: { sporsmaal: string; svar: string }[] = [
  {
    sporsmaal: "Hva er pyramide-systemet?",
    svar: "AK Golf-pyramiden består av fem områder: FYS (fysisk), TEK (teknisk), SLAG (slag — korthold/pitch/putt), SPILL (spill — banetilpasning) og TURN (turnering). Treningsplanen din fordeler tid mellom disse for å bygge balansert utvikling.",
  },
  {
    sporsmaal: "Hvordan fungerer AI-coach?",
    svar: "AI-coach bruker profilen din (HCP, ambisjon, hjemmeklubb), aktive treningsplaner og siste 5 runder som kontekst når den svarer. Den er en støtte, ikke erstatning for menneskelig coach. Krever Pro-abonnement.",
  },
  {
    sporsmaal: "Hva betyr SG-tallene?",
    svar: "Strokes Gained (SG) måler hvor mange slag du sparer eller taper sammenlignet med en referanse-spiller. Positive tall = bedre enn snitt. Vi splitter på OTT (drives), APP (innspill), ARG (rundt green) og PUTT.",
  },
  {
    sporsmaal: "Kan jeg endre HCP manuelt?",
    svar: "Ja — gå til Profil og oppdater HCP-feltet. I v2 kobles dette automatisk til norsk handicap-system.",
  },
  {
    sporsmaal: "Hvordan kansellerer jeg Pro-abonnementet?",
    svar: "Gå til Abonnement → 'Administrer abonnement'. Du blir sendt til Stripe Customer Portal hvor du kan kansellere når som helst.",
  },
  {
    sporsmaal: "Hva er Streak?",
    svar: "Antall dager på rad du har fullført minst én treningsøkt. Vi måler over siste 14 dager. Achievements (STREAK_7, STREAK_14) låses opp automatisk.",
  },
];

export default async function HelpPage() {
  await requirePortalUser();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          Hjelp & support
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Vanlige spørsmål. Trenger du noe annet, send e-post.
        </p>
      </div>

      <ul className="space-y-3">
        {FAQ.map((q, i) => (
          <li
            key={i}
            className="rounded-lg border border-border bg-card p-5"
          >
            <details>
              <summary className="cursor-pointer font-medium text-foreground">
                {q.sporsmaal}
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{q.svar}</p>
            </details>
          </li>
        ))}
      </ul>

      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-display text-base font-semibold tracking-tight">
          Kontakt support
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Får du ikke svar i FAQ-en? Send e-post til support, så svarer vi
          innen 24 timer på hverdager.
        </p>
        <a
          href="mailto:support@akgolf.no"
          className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          support@akgolf.no
        </a>
      </section>
    </div>
  );
}
