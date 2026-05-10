import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function PortalHome() {
  const user = await requirePortalUser();

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Hjem
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Velkommen,</em>{" "}
          {user.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Treningsplan, dagens økt og pyramide bygges i Fase 1.5. For nå ser du
          spillerprofilen din slik den er registrert.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label="HCP"
          value={user.hcp != null ? user.hcp.toFixed(1) : "—"}
        />
        <Stat label="Tier" value={user.tier} />
        <Stat
          label="Hjemmeklubb"
          value={user.homeClub ?? "Ikke satt"}
        />
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Min ambisjon
        </span>
        {user.ambition ? (
          <p className="mt-2 text-base text-foreground">{user.ambition}</p>
        ) : (
          <p className="mt-2 text-base italic text-muted-foreground">
            Du har ikke satt en ambisjon ennå. Du kan oppdatere profilen i
            innstillingene.
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-base font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}
