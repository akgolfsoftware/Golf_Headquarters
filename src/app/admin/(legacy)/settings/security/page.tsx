import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { Setup2FA } from "@/app/portal/meg/sikkerhet/setup-2fa";

export default async function AdminSecurityPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // TODO: aktive økter og innloggings-historikk når vi har audit-logg for auth
  const sistInnlogg = user.updatedAt.toLocaleString("nb-NO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Innstillinger
      </Link>

      <PageHeader
        eyebrow="Innstillinger · Sikkerhet"
        titleLead="Hvem er"
        titleItalic="logget inn"
        titleTrail="akkurat nå?"
        sub="Kontoen din virker grei. Sjekk likevel listen — første gang du ser en rar IP er ofte siste sjanse."
      />

      <Section title="Oversikt">
        <div className="grid grid-cols-2 gap-4 p-6">
          <MiniStat
            label="Konto"
            value={user.role}
            unit="rolle"
            sub={`E-post ${user.email}`}
          />
          <MiniStat
            label="Sist oppdatert"
            value={sistInnlogg}
            unit=""
            sub="Tidspunkt for siste profil-endring"
          />
        </div>
      </Section>

      <Section title="To-faktor" aux="Konfigurer for høyere sikkerhet">
        <div className="p-6">
          <Setup2FA />
        </div>
      </Section>

      <Section title="Passord">
        <div className="grid grid-cols-1 items-start gap-2 px-6 py-4 sm:grid-cols-[200px_1fr_auto] sm:gap-4">
          <div>
            <div className="text-[13px] text-muted-foreground">Endre passord</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/80">
              Krever bekreftelse via e-post
            </div>
          </div>
          <div className="text-[14px] text-foreground">
            Bruk &quot;Glemt passord&quot;-flyten for å sette nytt passord.
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-[12px] font-medium text-primary hover:underline"
          >
            Start →
          </Link>
        </div>
      </Section>

      {/* TODO: Aktive økter og innloggings-historikk når vi har auth-events */}
      <Section
        title="Aktive økter"
        aux="Kommer når vi logger auth-events"
      >
        <div className="px-6 py-8 text-center text-[13px] text-muted-foreground">
          Liste over enheter som er logget inn vises her når audit-laget er på
          plass.
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  aux,
  children,
}: {
  title: string;
  aux?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-center gap-4 border-b border-border px-6 py-4">
        <h2 className="font-display text-base font-semibold tracking-tight">
          {title}
        </h2>
        {aux && (
          <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
            {aux}
          </span>
        )}
      </header>
      <div>{children}</div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2 font-display text-[24px] font-semibold tracking-tight">
        {value}
        {unit && (
          <span className="font-mono text-[12px] font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
