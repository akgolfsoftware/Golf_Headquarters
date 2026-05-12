import { Download } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";

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
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Rapporter"
        titleItalic="Eksport"
        titleTrail="-rapporter"
        sub="CSV-eksport for regnskap, analyse og oppfølging."
      />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {RAPPORTER.map((r) => (
          <li
            key={r.id}
            className="flex flex-col rounded-lg border border-border bg-card p-6"
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
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Download size={16} strokeWidth={1.5} />
              Last ned CSV
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
