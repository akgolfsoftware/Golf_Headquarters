/**
 * AK Golf HQ — Intern designsystem-dokumentasjon.
 *
 * URL: /design-system
 * Tilgang: kun interne brukere (kan beskyttes med auth senere).
 *
 * Viser alle designtokens og komponenter i bruk på plattformen.
 * Oppdateres når nye komponenter eller tokens legges til.
 */

import { Eyebrow, Tag, Button } from "@/components/athletic/golfdata";
import {
  Calendar,
  CheckCircle,
  Dumbbell,
  Flag,
  Plus,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import {
  Breadcrumb,
  Checkbox,
  EmptyState,
  Input,
  KPICard,
  ProgressBar,
  ProgressRing,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  SkeletonCard,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  Tooltip,
} from "@/components/ui";
import { OverviewCard, OverviewShell } from "@/components/shared";

export const metadata = {
  title: "Designsystem · AK Golf HQ (intern)",
};

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-6xl px-6 space-y-16">
        {/* Header */}
        <header className="space-y-2 border-b border-border pb-8">
          <Eyebrow as="span">INTERN · DOKUMENTASJON</Eyebrow>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            AK Golf HQ <em className="italic">Designsystem v2</em>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Tokens og komponenter for hele plattformen. Bruk dette som
            autoritativ referanse — aldri hardkode farger eller komponenter.
          </p>
        </header>

        {/* Tokens — Farger */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Semantiske farger</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { name: "background", className: "bg-background border-2" },
              { name: "foreground", className: "bg-foreground text-background" },
              { name: "card", className: "bg-card border-2" },
              { name: "primary", className: "bg-primary text-primary-foreground" },
              { name: "accent", className: "bg-accent text-accent-foreground" },
              { name: "secondary", className: "bg-secondary" },
              { name: "muted", className: "bg-muted" },
              { name: "muted-foreground", className: "bg-muted-foreground text-background" },
              { name: "border", className: "bg-border" },
              { name: "destructive", className: "bg-destructive text-destructive-foreground" },
              { name: "success", className: "bg-success text-success-foreground" },
              { name: "warning", className: "bg-warning text-warning-foreground" },
              { name: "info", className: "bg-info text-info-foreground" },
              { name: "ring", className: "bg-ring" },
              { name: "chart-1", className: "bg-chart-1" },
              { name: "chart-2", className: "bg-chart-2" },
            ].map((t) => (
              <div
                key={t.name}
                className={`flex h-20 items-center justify-center rounded-lg ${t.className}`}
              >
                <code className="font-mono text-xs">{t.name}</code>
              </div>
            ))}
          </div>
        </section>

        {/* Typografi */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Typografi</h2>
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h1 className="font-display text-5xl font-bold">Display · 48px Familjen Grotesk</h1>
            <h2 className="font-display text-3xl font-bold">Heading 2 · 30px</h2>
            <h3 className="font-display text-xl font-semibold">Heading 3 · 20px</h3>
            <p className="text-base">Body · 16px Inter — hovedfont for brødtekst og UI.</p>
            <p className="text-sm text-muted-foreground">Small · 14px muted</p>
            <p className="font-mono text-sm tabular-nums">Mono · 14px JetBrains 12 345.67</p>
            <Eyebrow as="span">Eyebrow · 10px mono uppercase</Eyebrow>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Buttons</h2>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-6">
            <Button variant="signal">Lime CTA</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="ghost">Ghost light</Button>
            <Button variant="ghost">Ghost dark</Button>
            <Button variant="signal" size="sm">Small</Button>
            <Button variant="signal" size="lg">Large</Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Badges</h2>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-6">
            <Tag variant="signal">Primary</Tag>
            <Tag variant="signal">Lime</Tag>
            <Tag variant="neutral">Neutral</Tag>
            <Tag variant="up">OK</Tag>
            <Tag variant="outline" style={{ color: "var(--warning)", borderColor: "var(--warning-border)" }}>Warn</Tag>
            <Tag variant="down">Urgent</Tag>
          </div>
        </section>

        {/* Form-elementer */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Form-elementer</h2>
          <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input</label>
              <Input placeholder="Skriv noe..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select</label>
              <Select>
                <option>Velg ett</option>
                <option>Alternativ 1</option>
                <option>Alternativ 2</option>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Textarea</label>
              <Textarea placeholder="Beskrivelse..." />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked readOnly />
                Checkbox (sjekket)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox readOnly />
                Checkbox (ikke sjekket)
              </label>
            </div>
            <div className="space-y-2">
              <RadioGroup>
                <label className="flex items-center gap-2 text-sm">
                  <Radio name="demo" checked readOnly />
                  Valgt
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Radio name="demo" readOnly />
                  Ikke valgt
                </label>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked readOnly />
                Switch (på)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch readOnly />
                Switch (av)
              </label>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">KPI Cards</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              eyebrow="Aktive i dag"
              value="12"
              variant="hero"
              delta={{ value: "3", direction: "up" }}
              footnote="vs i går"
            />
            <KPICard
              eyebrow="Brennende"
              value="3"
              variant="warn"
              footnote="forfaller i dag"
            />
            <KPICard
              eyebrow="Snitt-score"
              value="78"
              variant="default"
              delta={{ value: "2", direction: "down" }}
            />
            <KPICard
              eyebrow="Overdue"
              value="7"
              variant="danger"
              footnote="tester forfalt"
            />
          </div>
        </section>

        {/* Tabs */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Tabs</h2>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <Tabs defaultValue="oversikt">
              <TabList>
                <Tab value="oversikt">Oversikt</Tab>
                <Tab value="detaljer" count={12}>
                  Detaljer
                </Tab>
                <Tab value="aktivitet" count={3}>
                  Aktivitet
                </Tab>
                <Tab value="innstillinger">Innstillinger</Tab>
              </TabList>
              <TabPanel value="oversikt">
                <p className="mt-4 text-sm text-muted-foreground">Oversikt-innhold</p>
              </TabPanel>
              <TabPanel value="detaljer">
                <p className="mt-4 text-sm text-muted-foreground">Detaljer-innhold</p>
              </TabPanel>
            </Tabs>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Breadcrumb</h2>
          <div className="rounded-2xl border border-border bg-card p-6">
            <Breadcrumb
              backHref="/portal/tren"
              items={[
                { label: "Tren", href: "/portal/tren" },
                { label: "FYS-planer", href: "/portal/tren/fys-plan" },
                { label: "Vinter 2026" },
              ]}
            />
          </div>
        </section>

        {/* Progress */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Progress</h2>
          <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
            <div className="space-y-4">
              <ProgressBar value={68} showLabel label="Plan-progresjon" />
              <ProgressBar value={2} variant="warning" showLabel label="Kapasitet" />
              <ProgressBar value={95} variant="success" showLabel label="Test-dekning" />
            </div>
            <div className="flex items-center justify-around">
              <ProgressRing value={55} variant="accent" showLabel label="SESONG" size={96} />
              <ProgressRing value={82} variant="success" showLabel label="ADHERENCE" size={96} />
            </div>
          </div>
        </section>

        {/* Empty State */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Empty State</h2>
          <EmptyState
            icon={Dumbbell}
            title="Ingen øvelser ennå"
            description="Bygg din første økt for å se den her."
            action={
              <Button variant="primary">
                <Plus size={14} aria-hidden /> Ny øvelse
              </Button>
            }
          />
        </section>

        {/* Skeletons */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Skeletons</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>

        {/* Tooltip */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Tooltip</h2>
          <div className="rounded-2xl border border-border bg-card p-6">
            <Tooltip content="Dette er en tooltip">
              <button className="rounded-md border border-border bg-card px-4 py-2 text-sm">
                Hover over meg
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Overview Shell + Cards */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">OverviewShell + OverviewCard</h2>
          <div className="rounded-2xl border border-border bg-card p-6">
            <OverviewShell
              eyebrow="DEMO · INTERN"
              icon={Target}
              title={<>Bygg <em>planer</em></>}
              subtitle="Eksempel på dashboard-hub som brukes på alle 12 toppnivå-ruter."
              actions={
                <Button variant="primary">
                  <Plus size={14} aria-hidden /> Ny plan
                </Button>
              }
            >
              <OverviewCard
                href="#"
                icon={Calendar}
                eyebrow="Treningsplaner"
                title="14 aktive"
                primaryLine="6 utkast"
                secondaryLine="Sist endret 21. mai"
                badge={{ label: "3 nye", variant: "lime" }}
              />
              <OverviewCard
                href="#"
                icon={Trophy}
                eyebrow="Turneringer"
                title="3 kommende"
                primaryLine="Neste: 14. juni"
                secondaryLine="Sørlandsåpent"
              />
              <OverviewCard
                href="#"
                icon={CheckCircle}
                eyebrow="Godkjenninger"
                title="8 venter"
                primaryLine="2 urgent"
                secondaryLine="Eldste 12. mai"
                badge={{ label: "urgent", variant: "urgent" }}
              />
              <OverviewCard
                href="#"
                icon={Flag}
                eyebrow="Runder"
                title="47 logget"
                primaryLine="12 denne mnd"
                secondaryLine="Snitt: 78.4"
              />
              <OverviewCard
                href="#"
                icon={Sparkles}
                eyebrow="AI-innsikt"
                title="3 nye"
                primaryLine="2 høyt prioritert"
                secondaryLine="Sist generert 14:30"
                badge={{ label: "ny", variant: "lime" }}
              />
              <OverviewCard
                href="#"
                icon={Dumbbell}
                eyebrow="Drill-bibliotek"
                title="247 drills"
                primaryLine="12 nye denne uka"
                secondaryLine="Coach-anbefalt: 28"
              />
            </OverviewShell>
          </div>
        </section>

        {/* Skeleton helpers vs primitives */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Skeletons (primitives)</h2>
          <div className="space-y-2 rounded-2xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </section>

        <footer className="border-t border-border pt-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
            AK Golf HQ Designsystem v2 · Internt · Endre i `src/app/globals.css` + komponenter
          </p>
        </footer>
      </div>
    </div>
  );
}
