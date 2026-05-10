import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { NyOktWizard } from "./wizard";

export default async function NyOktPage() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return (
      <div className="space-y-6">
        <header>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Ny økt
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Krever</em> Pro
          </h1>
        </header>

        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground">
            Egendefinerte økter er en del av Pro-abonnementet (300 kr/mnd).
            Oppgrader for å designe dine egne treningsøkter med valgfrie drills.
          </p>
          <Link
            href="/portal/meg/abonnement"
            className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Se Pro-fordeler
          </Link>
        </div>
      </div>
    );
  }

  const exercises = await prisma.exerciseDefinition.findMany({
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Ny økt
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Egendefinert</em> trening
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bygg din egen økt på 5 steg.
        </p>
      </header>

      <NyOktWizard exercises={exercises} />
    </div>
  );
}
