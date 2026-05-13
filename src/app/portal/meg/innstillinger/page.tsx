import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { PageHeader } from "@/components/shared/page-header";
import { NotifToggles } from "./notif-toggles";
import { requestAccountDeletion, requestDataExport } from "./actions";

export default async function InnstillingerPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const user = await requirePortalUser();
  const prefs = lesPreferences(user);
  const sp = await searchParams;
  const ok = sp?.ok;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Innstillinger"
        titleLead="Slik portalen"
        titleItalic="oppfører seg"
        sub="Endringer lagres automatisk."
      />

      {/* Lokalisering */}
      <Section title="Lokalisering" aux="Format og språk">
        <FieldRow label="Tidssone" value="Europe/Oslo" meta="UTC+1 (sommertid UTC+2)" readonly />
        <FieldRow label="Datoformat" value="14. mai 2026" mono readonly />
        <FieldRow label="Tallformat" value="1 600,50" meta="Mellomrom + komma (NO)" mono readonly />
        <FieldRow label="Førstedag i uka" value="Mandag" readonly />
      </Section>

      {/* Notifikasjoner + språk (klient-komponent) */}
      <Section
        title="Notifikasjoner og språk"
        aux="Lagres automatisk"
      >
        <div className="p-6">
          <NotifToggles initial={prefs} />
        </div>
      </Section>

      {/* Tema — TODO: kobles til faktisk theme-switcher senere */}
      <Section title="Tema" aux="Lyst tema er default">
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            Mørk modus aktiveres automatisk basert på systeminnstillinger.
            Manuell tema-velger kommer i v2.
            {/* TODO: kobles til ThemeSwitcher senere */}
          </p>
        </div>
      </Section>

      {/* Farlig sone */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" strokeWidth={1.5} />
          <h3 className="font-display text-base font-semibold text-foreground">
            Farlig sone
          </h3>
        </div>
        {ok === "eksport" && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={1.5} />
            Forespørsel om eksport mottatt. Du får svar på e-post.
          </div>
        )}
        {ok === "sletting" && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={1.5} />
            Forespørsel om sletting mottatt. Du får svar på e-post.
          </div>
        )}
        <form action={requestDataExport}>
          <DangerRow
            title="Eksporter alle mine data (GDPR)"
            desc="Du får en zip med alt. Tar 2–10 minutter."
            cta="Be om eksport"
          />
        </form>
        <form action={requestAccountDeletion}>
          <DangerRow
            title="Slett konto"
            desc="Sender forespørsel til coach. Permanent — kan ikke angres."
            cta="Be om sletting"
            destructive
          />
        </form>
      </section>
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
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-baseline justify-between border-b border-border px-6 py-4">
        <h2 className="font-display text-base font-semibold text-foreground">
          {title}
        </h2>
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

function FieldRow({
  label,
  value,
  meta,
  mono = false,
  readonly = false,
}: {
  label: string;
  value: string;
  meta?: string;
  mono?: boolean;
  readonly?: boolean;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr_auto] items-center gap-4 border-b border-border/60 px-6 py-4 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`flex items-center gap-3 text-sm text-foreground ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
        {meta && (
          <span className="text-xs text-muted-foreground/70">{meta}</span>
        )}
      </span>
      {readonly && (
        <span className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Read-only
        </span>
      )}
    </div>
  );
}

function DangerRow({
  title,
  desc,
  cta,
  destructive = false,
}: {
  title: string;
  desc: string;
  cta: string;
  destructive?: boolean;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 border-t border-destructive/20 py-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </div>
      <button
        type="submit"
        className={`whitespace-nowrap rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
          destructive
            ? "border-destructive/30 text-destructive hover:bg-destructive/10"
            : "border-border text-foreground hover:bg-secondary"
        }`}
      >
        {cta} →
      </button>
    </div>
  );
}
