import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { UpgradeButton, ManageButton } from "./upgrade-button";

type Search = { ok?: string; cancelled?: string };

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requirePortalUser();
  const params = await searchParams;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  const erPro = user.tier === "PRO";
  const periodEnd = subscription?.currentPeriodEnd;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Abonnement"
        titleLead="Din plan, betaling og"
        titleItalic="faktura"
        sub={
          erPro
            ? "Du er på Pro. Du ser planen din, neste belastning og fakturahistorikken her."
            : "Du står på Gratis-planen. Oppgrader til Pro for AI-coach, egendefinerte økter og direkte kontakt med coach."
        }
      />
      {params.ok === "1" && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
          Velkommen til Pro! Endringen kan ta noen sekunder før den synes overalt.
        </div>
      )}
      {params.cancelled === "1" && (
        <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Oppgraderingen ble avbrutt. Du står fortsatt på {user.tier}.
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Nåværende abonnement
        </span>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="font-display text-3xl font-semibold tracking-tight">
            {user.tier === "PRO" ? "Pro" : "Gratis"}
          </span>
          {erPro && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
              {subscription?.status ?? "Aktiv"}
            </span>
          )}
        </div>
        {erPro ? (
          <p className="mt-2 text-sm text-muted-foreground">
            300 kr per måned ·{" "}
            {periodEnd
              ? `neste betaling ${periodEnd.toLocaleDateString("nb-NO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}`
              : "abonnement aktivt"}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Du har full tilgang til basis-funksjoner. Oppgrader for AI-coach,
            egendefinerte økter og direkte kontakt med tilknyttet coach.
          </p>
        )}
      </section>

      <section className="space-y-3">
        {erPro ? (
          <ManageButton />
        ) : (
          <>
            <h3 className="font-display text-lg font-semibold tracking-tight">
              Oppgrader til Pro
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>· Ubegrenset bruk av AI-coach (Claude)</li>
              <li>· Lag egendefinerte økter med Live Session-tapper</li>
              <li>· Direkte kontakt med tilknyttet coach</li>
              <li>· Full SG-analyse og pyramide-progresjon</li>
              <li>· Coach-laget treningsplaner</li>
            </ul>
            <div className="pt-2">
              <UpgradeButton />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
