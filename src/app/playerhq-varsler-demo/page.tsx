/**
 * PILOT — PlayerHQ Varsler
 * Bygd fra wireframe/design-files-v2/screens/18-playerhq-varsler.html
 * URL: /playerhq-varsler-demo
 *
 * Mock-data: Markus Roinås Pedersen (PRO). 13 varselskategorier × 3 kanaler.
 * Anti-state-katalog: én produksjonsskjerm — alle 3 kanaler aktive (default).
 */

import {
  Bell,
  Mail,
  MessageSquare,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MessageCircle,
  Trophy,
  Sparkles,
  HeartPulse,
  BarChart3,
  CreditCard,
  AlertTriangle,
  Plus,
} from "lucide-react";

export default function PlayerHQVarslerDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1180px] px-8 py-10">
        {/* Page-head */}
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            PlayerHQ · Varsler
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Hvilke varsler vil du ha — <em className="italic">og hvor?</em>
          </h1>
          <p className="mt-2 max-w-[640px] text-[14px] leading-[1.55] text-muted-foreground">
            Push i appen, e-post, eller SMS. Skru av enkeltkategorier eller hele
            kanaler. Stille perioder respekteres for alle.
          </p>
        </header>

        {/* Kanaler */}
        <Section
          title="Kanaler"
          aux="Master-brytere — overstyrer alt under"
        >
          <div className="grid grid-cols-3 gap-3 p-6">
            <ChannelCard
              icon={<Bell className="h-4 w-4" strokeWidth={1.5} />}
              label="Push i appen"
              meta="Aktiv · iOS Safari · siden 4. mar 2026"
              info="Sendes til denne enheten. Klikk på et varsel åpner riktig skjerm i PlayerHQ."
              on
            />
            <ChannelCard
              icon={<Mail className="h-4 w-4" strokeWidth={1.5} />}
              label="E-post"
              meta="Verifisert · markus@example.no"
              metaVerified
              info="Daglig sammendrag kl 07:00 hvis flere varsler i samme kategori."
              on
            />
            <ChannelCard
              icon={<MessageSquare className="h-4 w-4" strokeWidth={1.5} />}
              label="SMS"
              meta="Verifisert · +47 412 34 567"
              metaVerified
              info="Brukes kun for kritiske varsler — booking-endring, faktura forfalt."
              on
            />
          </div>
        </Section>

        <div className="h-8" />

        {/* Matrise */}
        <Section
          title="Varsler per kategori"
          aux="13 kategorier · klikk for å skru på/av per kanal"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  Kategori
                </th>
                <th className="px-3 py-3">
                  <ColHead
                    icon={<Bell className="h-3 w-3" strokeWidth={1.5} />}
                    label="Push"
                  />
                </th>
                <th className="px-3 py-3">
                  <ColHead
                    icon={<Mail className="h-3 w-3" strokeWidth={1.5} />}
                    label="E-post"
                  />
                </th>
                <th className="px-3 py-3">
                  <ColHead
                    icon={
                      <MessageSquare
                        className="h-3 w-3"
                        strokeWidth={1.5}
                      />
                    }
                    label="SMS"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <GroupRow label="Booking & timeplan" />
              <CatRow
                icon={<Check className="h-3 w-3" strokeWidth={1.5} />}
                label="Booking bekreftet"
                desc="Etter at coach godkjenner"
                push={true}
                email={true}
                sms={false}
              />
              <CatRow
                icon={<XCircle className="h-3 w-3" strokeWidth={1.5} />}
                label="Booking avlyst"
                desc="Av coach eller deg selv"
                push={true}
                email={true}
                sms={true}
              />
              <CatRow
                icon={<Clock className="h-3 w-3" strokeWidth={1.5} />}
                label="Påminnelse 24t før"
                desc="Husk å være i form"
                push={true}
                email={false}
                sms={false}
              />
              <CatRow
                icon={<Clock className="h-3 w-3" strokeWidth={1.5} />}
                label="Påminnelse 1t før"
                desc="Pakk vesken"
                push={true}
                email={false}
                sms={false}
              />

              <GroupRow label="Coaching" />
              <CatRow
                icon={
                  <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                }
                label="Ny coach-melding"
                desc="Anders sender deg noe"
                push={true}
                email={true}
                sms={false}
              />
              <CatRow
                icon={<Calendar className="h-3 w-3" strokeWidth={1.5} />}
                label="Plan oppdatert"
                desc="Coach justerer denne uken"
                push={true}
                email={false}
                sms={false}
              />
              <CatRow
                icon={
                  <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />
                }
                label="Tester forfaller"
                desc="Putting, drive, fysisk"
                push={true}
                email={true}
                sms={false}
              />

              <GroupRow label="Betaling" />
              <CatRow
                icon={<CreditCard className="h-3 w-3" strokeWidth={1.5} />}
                label="Faktura sendt"
                desc="Månedlig + drop-in"
                push={false}
                email={true}
                sms={false}
              />
              <CatRow
                icon={
                  <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
                }
                label="Faktura forfalt"
                desc="Foreldre får også varsel"
                push={true}
                email={true}
                sms={true}
              />

              <GroupRow label="Innsikt & spill" />
              <CatRow
                icon={<Trophy className="h-3 w-3" strokeWidth={1.5} />}
                label="Leaderboard-endring (positiv)"
                desc="Når du flyttes opp i pulje A"
                push={true}
                email={false}
                sms={false}
              />
              <CatRow
                icon={<Sparkles className="h-3 w-3" strokeWidth={1.5} />}
                label="Coach-anbefaling (AI)"
                desc="Foreslåtte øvelser fra agenten"
                push={true}
                email={false}
                sms={false}
              />
              <CatRow
                icon={<HeartPulse className="h-3 w-3" strokeWidth={1.5} />}
                label="Skade-påminnelse (rehab)"
                desc="Daglig huskeliste mens du heler"
                push={true}
                email={false}
                sms={false}
              />
              <CatRow
                icon={<BarChart3 className="h-3 w-3" strokeWidth={1.5} />}
                label="Sesong-oppsummering (mnd)"
                desc="PDF + nøkkeltall til foreldre"
                push={false}
                email={true}
                sms={false}
              />
            </tbody>
          </table>
        </Section>

        <div className="h-8" />

        {/* Stille perioder */}
        <Section
          title="Stille perioder"
          aux="Push og SMS holdes tilbake — e-post går alltid"
        >
          <QuietRow
            title="Ikke forstyrr — natt"
            desc="Hver kveld · alle dager"
            range="22:00 → 07:00"
            days={[true, true, true, true, true, true, true]}
            on
          />
          <QuietRow
            title="Stille søndager"
            desc="Hele dagen"
            range="00:00 → 24:00"
            days={[false, false, false, false, false, false, true]}
          />
          <div className="flex items-center justify-center border-t border-border/60 bg-secondary/40 px-6 py-3">
            <a className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-primary">
              <Plus className="h-3 w-3" strokeWidth={1.5} />
              Legg til stille periode
            </a>
          </div>
        </Section>

        <div className="h-8" />

        {/* Markedsføring */}
        <Section title="Markedsføring og tips" aux="Frivillig — alle av som default">
          <ToggleRow
            label="Månedlig nyhetsbrev"
            hint="Hva som skjer i AK Golf-økosystemet"
          />
          <ToggleRow
            label="Tips og artikler"
            hint="Trener-tips, øvelses-videoer"
          />
          <ToggleRow
            label="Tilbud og kampanjer"
            hint="Rabatter på Pro"
          />
          <ToggleRow
            label="Klubb-informasjon — GFGK"
            hint="Klubb-arrangementer, baneinfo"
            on
          />
        </Section>
      </div>
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
        <h2 className="font-display text-[15px] font-semibold text-foreground">
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

function ChannelCard({
  icon,
  label,
  meta,
  metaVerified = false,
  info,
  on,
}: {
  icon: React.ReactNode;
  label: string;
  meta: string;
  metaVerified?: boolean;
  info: string;
  on: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/8 text-primary">
            {icon}
          </div>
          <span className="font-display text-[14px] font-semibold text-foreground">
            {label}
          </span>
        </div>
        <Toggle on={on} />
      </div>
      <div className="font-mono text-[11px] text-muted-foreground">
        {metaVerified ? (
          <span className="inline-flex items-center gap-1">
            <span className="inline-flex items-center gap-1 text-[#1A7D56]">
              <Check className="h-3 w-3" strokeWidth={1.5} />
              {meta.split(" · ")[0]}
            </span>
            <span> · {meta.split(" · ").slice(1).join(" · ")}</span>
          </span>
        ) : (
          meta
        )}
      </div>
      <div className="text-[12px] leading-[1.5] text-muted-foreground">
        {info}
      </div>
    </div>
  );
}

function ColHead({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5 font-mono text-[11px] font-medium text-muted-foreground">
      {icon}
      {label}
    </span>
  );
}

function GroupRow({ label }: { label: string }) {
  return (
    <tr>
      <td
        colSpan={4}
        className="bg-secondary/60 px-6 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
      >
        {label}
      </td>
    </tr>
  );
}

function CatRow({
  icon,
  label,
  desc,
  push,
  email,
  sms,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  push: boolean;
  email: boolean;
  sms: boolean;
}) {
  return (
    <tr className="border-b border-border/60 last:border-b-0">
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-5 w-5 place-items-center rounded-sm bg-secondary text-muted-foreground">
            {icon}
          </span>
          <span className="flex flex-col">
            <span className="text-[13px] font-medium text-foreground">
              {label}
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              {desc}
            </span>
          </span>
        </div>
      </td>
      <td className="px-3 py-3.5 text-center">
        <Toggle on={push} />
      </td>
      <td className="px-3 py-3.5 text-center">
        <Toggle on={email} />
      </td>
      <td className="px-3 py-3.5 text-center">
        <Toggle on={sms} />
      </td>
    </tr>
  );
}

function QuietRow({
  title,
  desc,
  range,
  days,
  on = false,
}: {
  title: string;
  desc: string;
  range: string;
  days: boolean[];
  on?: boolean;
}) {
  const dayLabels = ["M", "T", "O", "T", "F", "L", "S"];
  return (
    <div className="flex items-center justify-between border-b border-border/60 px-6 py-4 last:border-b-0">
      <div className="flex items-center gap-3.5">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/8 text-primary">
          <Clock className="h-4 w-4" strokeWidth={1.5} />
        </div>
        <div>
          <div className="text-[13px] font-medium text-foreground">{title}</div>
          <div className="text-[11px] text-muted-foreground/70">{desc}</div>
        </div>
      </div>
      <div className="flex items-center gap-3.5">
        <span className="font-mono text-[13px] font-medium text-foreground">
          {range}
        </span>
        <div className="flex gap-1">
          {days.map((active, i) => (
            <span
              key={i}
              className={`grid h-5 w-5 place-items-center rounded-sm font-mono text-[9px] font-semibold ${
                active
                  ? "bg-primary text-accent"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {dayLabels[i]}
            </span>
          ))}
        </div>
        <Toggle on={on} />
      </div>
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
      role="switch"
      aria-checked={on}
    >
      <span
        className={`absolute h-4 w-4 rounded-full bg-card shadow transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

