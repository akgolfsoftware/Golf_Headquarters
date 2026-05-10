import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function PortalHome() {
  const user = await requirePortalUser();

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-2 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        PlayerHQ · Forhåndsvisning
      </div>
      <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
        Velkommen, <em className="font-normal text-primary md:italic">{user.name}</em>
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Portal-shell (sidebar, header, dagens økt) bygges i Fase 1.4.
        Innloggingen din er aktiv — du er klar til å fortsette der vi slipper.
      </p>

      <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Rolle" value={user.role} />
        <Stat label="Tier" value={user.tier} />
        <Stat label="E-post" value={user.email} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-display text-base font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}
