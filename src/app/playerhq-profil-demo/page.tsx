/**
 * PILOT — PlayerHQ Min profil
 * Bygd fra wireframe/design-files-v2/screens/16-playerhq-min-profil.html
 * URL: /playerhq-profil-demo
 *
 * Mock-data: Markus Roinås Pedersen (junior 17 år, GFGK, PRO-tier).
 * Anti-state-katalog: én produksjonsskjerm — lyst tema, junior med 2 foreldre.
 */

import {
  Pencil,
  Check,
  RefreshCw,
  AlertTriangle,
  Plus,
} from "lucide-react";

export default function PlayerHQProfilDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1180px] px-8 py-10">
        {/* Page-head */}
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            PlayerHQ · Meg · Profil
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Min profil — <em className="italic">slik andre ser deg.</em>
          </h1>
          <p className="mt-2 max-w-[640px] text-[14px] leading-[1.55] text-muted-foreground">
            Bilde, navn og kontaktinfo. Foreldrene dine har egen tilgang nederst.
          </p>
        </header>

        <div className="grid grid-cols-[280px_1fr] items-start gap-8">
          {/* LEFT — ID-card */}
          <aside className="sticky top-8 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="relative">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-primary text-white">
                <span className="font-display text-[36px] font-semibold leading-none">
                  M
                </span>
              </div>
              <button
                aria-label="Endre profilbilde"
                className="absolute -bottom-0.5 -right-0.5 grid h-8 w-8 place-items-center rounded-full border-[3px] border-card bg-primary text-white"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>

            <h2 className="text-center font-display text-[22px] font-medium leading-tight tracking-tight text-foreground">
              Markus Roinås Pedersen
            </h2>

            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
                PRO
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[11px] text-muted-foreground">
                Kategori{" "}
                <strong className="font-mono font-semibold text-foreground">
                  A
                </strong>
              </span>
            </div>

            <div className="mt-2 w-full border-t border-border pt-4">
              <IdStat label="HCP" value="+2,4" mono />
              <IdStat label="Klubb" value="GFGK" />
              <IdStat label="Coach" value="Anders K." />
              <IdStat label="Alder" value="17 år" mono />
            </div>

            <a className="mt-2 cursor-pointer text-[12px] font-medium text-primary">
              Se min offentlige profil →
            </a>
          </aside>

          {/* RIGHT — sections */}
          <div className="flex min-w-0 flex-col gap-8">
            {/* Personalia */}
            <Section title="Personalia" aux="Hvem du er">
              <FieldRow
                label="Fullt navn"
                value="Markus Roinås Pedersen"
                action="Endre"
              />
              <FieldRow
                label="Visningsnavn"
                hint="Slik andre ser deg"
                value="Markus"
                action="Endre"
              />
              <FieldRow
                label="E-post"
                value="markus@example.no"
                badge="Verifisert"
                mono
                action="Endre"
              />
              <FieldRow
                label="Mobil"
                value="+47 412 34 567"
                mono
                action="Endre"
              />
              <FieldRow
                label="Fødselsdato"
                value="8. august 2008"
                meta="17 år"
                readonly
              />
              <FieldRow
                label="Adresse"
                value="Storgata 14, 1378 Nesbru"
                action="Endre"
              />
            </Section>

            {/* Golf-info */}
            <Section title="Golf-info" aux="Synces fra GolfBox">
              <div className="grid grid-cols-[180px_1fr_auto] items-center gap-4 border-b border-border/60 px-6 py-4 last:border-b-0">
                <span className="text-[12px] text-muted-foreground">HCP</span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-[15px] font-medium text-foreground">
                    +2,4
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                    <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
                    Sist sync 14:32
                  </span>
                </span>
                <a className="cursor-pointer text-[12px] font-medium text-primary">
                  Sync nå →
                </a>
              </div>
              <FieldRow
                label="GolfBox-ID"
                value="NO-2008-MRP-1402"
                mono
                readonlyLabel="Synced"
                readonly
              />
              <FieldRow
                label="Hjemklubb"
                value="Grini-Fossum Golfklubb"
                meta="GFGK"
                action="Endre"
              />
              <FieldRow
                label="Sekundær-klubb"
                value="Bossum GK"
                action="Endre"
              />
              <FieldRow label="Dominant hånd" value="Høyre" action="Endre" />
              <FieldRow label="Kjønn" value="Mann" action="Endre" />
              <div className="grid grid-cols-[180px_1fr_auto] items-center gap-4 px-6 py-4">
                <span className="text-[12px] text-muted-foreground">
                  Spiller-kategori
                </span>
                <span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[12px] text-muted-foreground">
                    Kategori{" "}
                    <strong className="font-mono font-semibold text-foreground">
                      A
                    </strong>
                  </span>
                </span>
                <span className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  Endres av coach
                </span>
              </div>
            </Section>

            {/* Foreldre */}
            <Section
              title="Foreldre / foresatte"
              desc="Foreldrene dine kan se og styre kontoen din. Du er under 18."
            >
              <ParentRow
                initials="AP"
                name="Anne Pedersen"
                role="mor"
                contact="anne.pedersen@example.no · +47 901 23 456"
                access="Full innsyn"
                accessTone="full"
              />
              <ParentRow
                initials="TP"
                name="Tor Pedersen"
                role="far"
                contact="tor.p@example.no · +47 932 11 008"
                access="Kun fakturaer"
                accessTone="partial"
              />
              <div className="grid grid-cols-[36px_1fr_auto] items-center gap-3 bg-secondary/60 px-6 py-4">
                <div className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-border text-muted-foreground">
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-primary">
                    Legg til foresatt
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Maks 3. Krever bekreftelse fra coach.
                  </span>
                </div>
                <span />
              </div>
            </Section>

            {/* Personvern */}
            <Section title="Personvern" aux="Hva andre kan se">
              <ToggleRow
                label="Vis HCP på leaderboard"
                hint="Klubbkamerater og coach"
                on
              />
              <ToggleRow
                label="Vis runde-historikk for klubbkamerater"
                on
              />
              <ToggleRow
                label="Coach kan dele runder eksternt"
                hint="Andre coacher i nettverket kan se anonymiserte data"
              />
            </Section>

            {/* Farezone */}
            <section className="rounded-xl border border-destructive/30 bg-destructive/4 p-6">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle
                  className="h-4 w-4 text-destructive"
                  strokeWidth={1.5}
                />
                <h3 className="font-display text-[15px] font-semibold text-foreground">
                  Farlig sone
                </h3>
              </div>
              <DangerItem
                title="Eksporter alle mine data"
                desc="Du får alt — runder, helse, meldinger. Tar 2–5 minutter."
                cta="Be om eksport →"
              />
              <DangerItem
                title="Be om sletting av konto"
                desc="Sender forespørsel til coach Anders. Du må være 18 for å gjøre dette selv."
                cta="Be om sletting →"
                destructive
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function IdStat({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-1.5 text-[12px] text-muted-foreground">
      <span>{label}</span>
      <span
        className={`font-medium text-foreground ${
          mono ? "font-mono text-[13px]" : "text-[12px]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  aux,
  desc,
  children,
}: {
  title: string;
  aux?: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-baseline justify-between border-b border-border px-6 py-4">
        <h2 className="font-display text-[15px] font-semibold text-foreground">
          {title}
        </h2>
        {aux && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {aux}
          </span>
        )}
        {desc && (
          <span className="max-w-[420px] text-right text-[12px] text-muted-foreground">
            {desc}
          </span>
        )}
      </header>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function FieldRow({
  label,
  hint,
  value,
  meta,
  badge,
  mono = false,
  readonly = false,
  readonlyLabel = "Read-only",
  action,
}: {
  label: string;
  hint?: string;
  value: string;
  meta?: string;
  badge?: string;
  mono?: boolean;
  readonly?: boolean;
  readonlyLabel?: string;
  action?: string;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr_auto] items-center gap-4 border-b border-border/60 px-6 py-4 last:border-b-0">
      <span className="flex flex-col text-[12px] text-muted-foreground">
        {label}
        {hint && (
          <span className="text-[11px] text-muted-foreground/70">{hint}</span>
        )}
      </span>
      <span
        className={`flex items-center gap-2 text-foreground ${
          mono ? "font-mono text-[13px]" : "text-[13px]"
        }`}
      >
        {value}
        {meta && (
          <span className="text-[12px] text-muted-foreground/70">{meta}</span>
        )}
        {badge && (
          <span className="inline-flex items-center gap-1 rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <Check className="h-2.5 w-2.5" strokeWidth={1.5} />
            {badge}
          </span>
        )}
      </span>
      {readonly ? (
        <span className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          {readonlyLabel}
        </span>
      ) : action ? (
        <a className="cursor-pointer text-[12px] font-medium text-primary">
          {action} →
        </a>
      ) : (
        <span />
      )}
    </div>
  );
}

function ParentRow({
  initials,
  name,
  role,
  contact,
  access,
  accessTone,
}: {
  initials: string;
  name: string;
  role: string;
  contact: string;
  access: string;
  accessTone: "full" | "partial";
}) {
  const accessStyle =
    accessTone === "full"
      ? "bg-[#E5F1EA] text-[#1A7D56] border-[#1A7D56]/20"
      : "bg-[#FFF0D6] text-[#B8852A] border-[#B8852A]/25";
  return (
    <div className="grid grid-cols-[36px_1fr_auto_auto] items-center gap-3 border-b border-border/60 px-6 py-4 last:border-b-0">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/80 text-[12px] font-semibold text-white">
        {initials}
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-foreground">
          {name}{" "}
          <span className="font-normal text-muted-foreground/70">· {role}</span>
        </span>
        <span className="text-[11px] text-muted-foreground/80">{contact}</span>
      </div>
      <span
        className={`rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] ${accessStyle}`}
      >
        {access}
      </span>
      <a className="cursor-pointer text-[12px] font-medium text-primary">
        Endre →
      </a>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  on = false,
}: {
  label: string;
  hint?: string;
  on?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border/60 px-6 py-4 last:border-b-0">
      <span className="flex flex-col text-[13px] text-foreground">
        {label}
        {hint && (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        )}
      </span>
      <Toggle on={on} />
    </div>
  );
}

function Toggle({ on = false }: { on?: boolean }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        on ? "bg-primary" : "bg-secondary"
      }`}
      aria-pressed={on}
      role="switch"
    >
      <span
        className={`absolute h-4 w-4 rounded-full bg-card shadow transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

function DangerItem({
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
    <div className="flex items-center justify-between gap-6 border-t border-destructive/20 py-4 first:border-t-0 first:pt-0">
      <div className="flex min-w-0 flex-col">
        <span className="text-[13px] font-medium text-foreground">{title}</span>
        <span className="text-[12px] text-muted-foreground">{desc}</span>
      </div>
      <button
        className={`whitespace-nowrap rounded-md border px-3 py-2 text-[12px] font-medium transition-colors ${
          destructive
            ? "border-destructive/30 text-destructive hover:bg-destructive/10"
            : "border-border text-foreground hover:bg-secondary"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}
