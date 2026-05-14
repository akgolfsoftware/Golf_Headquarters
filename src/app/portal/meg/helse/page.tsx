import { AlertTriangle, Plus, Activity } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { PageHeader } from "@/components/shared/page-header";
import { HelseForm } from "./helse-form";

type Helsedata = { restingHr?: number; sleep?: number };

export default async function HelsePage() {
  const user = await requirePortalUser();
  const prefs = lesPreferences(user);
  const helse =
    (prefs as unknown as { helse?: Helsedata }).helse ?? {};

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Helse"
        titleLead="Kroppen din,"
        titleItalic="dataen din"
        sub="Manuelle helse-data brukes til å justere treningsbelastning. Apple Health og Garmin-integrasjoner kommer i v2."
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Pågående skader"
          value="0"
          sub="Ingen registrert"
        />
        <Kpi
          label="Hvilepuls"
          value={helse.restingHr != null ? String(helse.restingHr) : "—"}
          unit={helse.restingHr != null ? "bpm" : undefined}
          sub={helse.restingHr != null ? "Sist oppdatert" : "Logg manuelt under"}
        />
        <Kpi
          label="Søvn (siste logg)"
          value={helse.sleep != null ? String(helse.sleep).replace(".", ",") : "—"}
          unit={helse.sleep != null ? "t" : undefined}
          sub={helse.sleep != null ? "Manuelt registrert" : "Logg manuelt under"}
        />
        <Kpi
          label="Avlyste økter"
          value="—"
          sub="Helse-relatert · v2"
        />
      </div>

      {/* Integrasjoner */}
      <Section title="Integrasjoner" aux="Apple Health, Garmin · v2">
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <Integration
            navn="Apple Health"
            beskrivelse="iOS Health-data automatisk"
          />
          <Integration
            navn="Garmin"
            beskrivelse="Hvilepuls + søvn fra klokke"
          />
        </div>
      </Section>

      {/* Skader — TODO: kobles til Injury-modell senere */}
      <Section
        title="Skader"
        aux="Sortert nyest først"
        rightAction={
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground opacity-60"
            title="Tilgjengelig i v2"
          >
            <Plus className="h-3 w-3" strokeWidth={1.5} />
            Logg ny skade
          </button>
        }
      >
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Activity className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-muted-foreground">
            Ingen registrerte skader. Skade-logging kommer i v2.
          </p>
          {/* TODO: kobles til Injury-modell senere */}
        </div>
      </Section>

      {/* Manuell helse-logg */}
      <Section title="Daglig logg" aux="Manuelt — coach leser">
        <div className="p-6">
          <HelseForm initial={helse} />
        </div>
      </Section>

      {/* Coach-tilgang — TODO: kobles til detaljerte tilganger senere */}
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <header className="flex items-baseline justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            Coach-tilgang til helsedata
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            v2
          </span>
        </header>
        <div className="flex items-center gap-4 px-6 py-6">
          <AlertTriangle
            className="h-4 w-4 flex-shrink-0 text-muted-foreground"
            strokeWidth={1.5}
          />
          <p className="text-sm text-muted-foreground">
            Detaljert kontroll over hva coach ser kommer i v2. Inntil videre ser
            tilknyttet coach all helse-logg.
          </p>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  aux,
  rightAction,
  children,
}: {
  title: string;
  aux?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div className="flex items-baseline gap-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            {title}
          </h2>
          {aux && (
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {aux}
            </span>
          )}
        </div>
        {rightAction}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-4 font-mono text-3xl font-medium leading-none tracking-tight text-foreground">
        {value}
        {unit && (
          <span className="ml-1 text-sm text-muted-foreground/70">{unit}</span>
        )}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Integration({
  navn,
  beskrivelse,
}: {
  navn: string;
  beskrivelse: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{navn}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          v2
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{beskrivelse}</p>
    </div>
  );
}
