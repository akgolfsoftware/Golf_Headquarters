import { LeadForm } from "@/components/marketing/lead-form";

export const metadata = {
  title: "Book demo — AK Golf",
  description:
    "30 minutter med oss — vi viser plattformen og svarer på spørsmål om bruk for klubb eller coach.",
};

export default function BookDemo() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Book demo
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal text-primary md:italic">30 minutter</em> som kan endre klubben din
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Vi viser plattformen live, går gjennom hvordan deres klubb kan
            implementere AK Golf, og svarer på alle spørsmål om priser,
            integrasjon og oppstart.
          </p>

          <h2 className="mt-12 font-display text-xl font-semibold leading-tight">
            Hva får du på 30 minutter?
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              { t: "Live demo av PlayerHQ + CoachHQ", d: "Vi går gjennom de viktigste skjermene fra spillerens og coachens perspektiv." },
              { t: "Skreddersydd brukerflyt", d: "Vi diskuterer hvordan deres klubb-spesifikke flyter passer inn." },
              { t: "Transparent priser", d: "Plattformkostnad, revenue-share-modell og hva som er inkludert." },
              { t: "Tidslinje for oppstart", d: "Hvor lang tid det tar å lansere — fra signering til første spiller." },
            ].map((p) => (
              <li key={p.t} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{p.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
              Send forespørsel
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Vi tar kontakt innen 24 timer på hverdager.
            </p>
            <div className="mt-6">
              <LeadForm
                source="demo-request"
                cta="Be om demo"
                visNavn={true}
                takkemelding="Vi tar kontakt innen 24 timer."
              />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Foretrekker du å booke direkte? Send e-post til{" "}
              <a href="mailto:hei@akgolf.no" className="text-primary hover:underline">
                hei@akgolf.no
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
