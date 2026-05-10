import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function AdminHub() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Hub
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Hei,</em> {user.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Dagens timer, spillerliste og periodisering bygges i Fase 1.5. For nå
          har du tilgang til CoachHQ med rollen{" "}
          <strong className="text-foreground">{user.role}</strong>.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="Spillere i dag" value="—" hint="Krever Booking-modeller" />
        <Card label="Aktive plans" value="—" hint="Krever Plan-modeller" />
        <Card label="Ubesvart" value="—" hint="Krever Message-modeller" />
      </section>
    </div>
  );
}

function Card({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold text-foreground">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}
