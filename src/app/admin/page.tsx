import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function AdminHome() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-2 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        CoachHQ · Forhåndsvisning
      </div>
      <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
        Hei, <em className="font-normal text-primary md:italic">{user.name}</em>
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        CoachHQ-shell (sidebar, dagens timer, spillerliste) bygges i Fase 1.4.
        Du er logget inn som <strong className="text-foreground">{user.role}</strong>.
      </p>
    </div>
  );
}
