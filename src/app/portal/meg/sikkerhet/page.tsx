import Link from "next/link";
import { ArrowLeft, Check, Monitor, ShieldCheck } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { Setup2FA } from "./setup-2fa";

export default async function SikkerhetPage() {
  const user = await requirePortalUser();

  // Heuristikk for score — TODO: kobles til reell MFA/passord-status senere
  const score = user.email ? 65 : 40;

  return (
    <div className="space-y-8">
      <Link
        href="/portal/meg"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Min profil
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Meg · Sikkerhet"
        titleLead="Hvem er"
        titleItalic="logget inn"
        titleTrail="akkurat nå?"
        sub="Tofaktor-autentisering legger til ekstra beskyttelse — anbefales for alle som har koblet betalingskort."
      />

      {/* Oversikt */}
      <Section title="Oversikt">
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <MiniStat
            label="Sikkerhetsscore"
            value={String(score)}
            unit="/ 100"
            sub="Sterkt passord, e-post registrert. Aktiver 2FA for +20."
          />
          <MiniStat
            label="Aktive økter"
            value="—"
            unit="enheter"
            sub="Antall aktive innlogginger"
          />
          {/* TODO: kobles til Supabase auth sessions senere */}
        </div>
      </Section>

      {/* To-faktor */}
      <Section title="Tofaktor-autentisering" aux="Authenticator-app">
        <div className="p-6">
          <Setup2FA />
        </div>
      </Section>

      {/* Aktive økter — TODO: kobles til Supabase auth sessions senere */}
      <Section title="Aktive økter" aux="Under utvikling">
        <div
          aria-disabled="true"
          className="flex cursor-not-allowed items-center gap-4 px-6 py-6 opacity-50"
        >
          <div className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-muted-foreground">
            <Monitor className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">
              Denne enheten
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              Se og logg ut andre aktive enheter — kommer snart
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Check className="h-3 w-3" strokeWidth={2.5} />
            Aktiv
          </span>
        </div>
      </Section>

      {/* Innloggings-historikk — TODO: kobles til reell login-historikk senere */}
      <Section title="Innloggings-historikk" aux="Under utvikling">
        <div
          aria-disabled="true"
          className="flex cursor-not-allowed items-center gap-4 px-6 py-6 opacity-50"
        >
          <ShieldCheck
            className="h-4 w-4 text-muted-foreground"
            strokeWidth={1.5}
          />
          <p className="text-sm text-muted-foreground">
            Full innloggings-historikk med IP, enhet og tidspunkt — aktiveres snart.
          </p>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  aux,
  v2,
  children,
}: {
  title: string;
  aux?: string;
  v2?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base font-semibold text-foreground">
            {title}
          </h2>
          {v2 && (
            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              v2
            </span>
          )}
        </div>
        {aux && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
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
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2 font-display text-3xl font-semibold tracking-tight text-foreground">
        {value}
        <span className="font-mono text-xs font-normal text-muted-foreground">
          {unit}
        </span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
