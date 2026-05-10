import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { MeldingForm } from "./form";

export default async function CoachMeldingPage() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Direkte coach-meldinger krever Pro-abonnement.
        </p>
        <Link
          href="/portal/meg/abonnement"
          className="inline-block rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Oppgrader til Pro
        </Link>
      </div>
    );
  }

  const coacher = await prisma.user.findMany({
    where: { role: "COACH" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/portal/coach"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Coach
      </Link>

      <header>
        <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Send melding</em>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Coachen får meldingen i CoachHQ og kan svare direkte tilbake.
        </p>
      </header>

      <MeldingForm coacher={coacher} />
    </div>
  );
}
