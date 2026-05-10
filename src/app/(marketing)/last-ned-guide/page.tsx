import { LeadForm } from "@/components/marketing/lead-form";

export const metadata = {
  title: "Last ned Pyramide-guiden — AK Golf",
  description:
    "Gratis PDF-guide om hvordan AK Golf-pyramiden hjelper deg med å bygge balansert spilleutvikling.",
};

export default function LastNedGuide() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Gratis guide
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight">
            <em className="font-normal text-primary md:italic">Pyramide</em>-guiden
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Hvordan AK Golf-pyramiden hjelper deg fordele treningstiden riktig
            mellom fysikk, teknikk, slag, spill og turneringserfaring.
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            {[
              "De fem områdene forklart",
              "Anbefalt fordeling per HCP-nivå",
              "Eksempel-uker for vinter og sesong",
              "10 drills per område",
              "Hvordan måle adherence over tid",
            ].map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
            Få guiden på e-post
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Vi sender lenken med en gang. Etterpå får du en kort serie med
            tips over de neste 14 dagene.
          </p>
          <div className="mt-6">
            <LeadForm
              source="guide-download"
              cta="Send guiden"
              visNavn={true}
              takkemelding="Sjekk innboksen din — guiden er på vei."
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Du kan melde deg av når som helst.
          </p>
        </div>
      </div>
    </div>
  );
}
