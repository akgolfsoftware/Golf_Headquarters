import { requirePortalUser } from "@/lib/auth/requirePortalUser";

const RAPPORTER = [
  {
    id: "spillere",
    navn: "Spilleroversikt",
    beskrivelse: "Liste over alle spillere med HCP, tier og siste innlogging.",
    href: "/api/admin/reports/spillere.csv",
  },
  {
    id: "runder",
    navn: "Runder siste 90 dager",
    beskrivelse: "Alle registrerte runder med SG-data og bane.",
    href: "/api/admin/reports/runder.csv",
  },
  {
    id: "okter",
    navn: "Treningsøkter",
    beskrivelse: "Loggførte treningsøkter med CS-rating og notater.",
    href: "/api/admin/reports/okter.csv",
  },
  {
    id: "abonnement",
    navn: "Abonnement-status",
    beskrivelse: "Pro-abonnenter med Stripe-status og periode.",
    href: "/api/admin/reports/abonnement.csv",
  },
];

export default async function Rapporter() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Rapporter
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Eksport</em>-rapporter
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          CSV-eksport for regnskap, analyse og oppfølging.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {RAPPORTER.map((r) => (
          <li
            key={r.id}
            className="flex flex-col rounded-lg border border-border bg-card p-5"
          >
            <h3 className="font-display text-base font-semibold text-foreground">
              {r.navn}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              {r.beskrivelse}
            </p>
            <a
              href={r.href}
              download
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Last ned CSV
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
