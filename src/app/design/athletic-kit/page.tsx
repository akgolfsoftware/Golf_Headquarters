import Link from "next/link";
import { ArrowLeft, Calendar, ChevronRight, Trophy } from "lucide-react";
import {
  ActionList,
  AthleticAvatar,
  AthleticBadge,
  AthleticButton,
  AthleticCard,
  AthleticEyebrow,
  AthleticGreeting,
  AthleticHero,
  DayCal,
  FeaturedCard,
  KpiCard,
  KpiStrip,
  PulseDot,
  PyramidProgress,
  QueueList,
} from "@/components/athletic";

export const metadata = {
  title: "Athletic Kit — komponentbibliotek",
  description: "Alle Athletic Performance-komponenter for PlayerHQ + CoachHQ",
};

export default function AthleticKitPage() {
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-5 py-6">
          <Link
            href="/design"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} /> Tilbake
          </Link>
          <h1 className="font-display mt-3 text-3xl font-bold leading-tight tracking-[-0.025em] md:text-4xl">
            <span className="block text-base font-medium italic text-primary">
              Athletic Performance
            </span>
            Komponentbibliotek
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
            Alle felles primitives for PlayerHQ og CoachHQ — bygget på eksisterende
            tokens (Inter Tight + JetBrains Mono, forest #005840, lime #D1F843).
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl space-y-12 px-5 py-10">
        <Section title="Eyebrow + Pulse" code="<AthleticEyebrow />, <PulseDot />">
          <div className="flex flex-wrap items-center gap-6">
            <AthleticEyebrow>Default eyebrow</AthleticEyebrow>
            <AthleticEyebrow tone="lime">Lime eyebrow</AthleticEyebrow>
            <div className="rounded bg-primary px-3 py-1.5">
              <AthleticEyebrow tone="light">På mørk bg</AthleticEyebrow>
            </div>
            <div className="flex items-center gap-2">
              <PulseDot />
              <span className="text-sm">Live signal</span>
            </div>
          </div>
        </Section>

        <Section title="Badges" code="<AthleticBadge />">
          <div className="flex flex-wrap items-center gap-2">
            <AthleticBadge>PRO</AthleticBadge>
            <AthleticBadge variant="lime">Aktiv</AthleticBadge>
            <AthleticBadge variant="neutral">Standard</AthleticBadge>
            <AthleticBadge variant="ok">Godkjent</AthleticBadge>
            <AthleticBadge variant="warn">Venter</AthleticBadge>
            <AthleticBadge variant="urgent">Forsinket</AthleticBadge>
          </div>
        </Section>

        <Section title="Buttons" code="<AthleticButton />">
          <div className="flex flex-wrap items-center gap-3">
            <AthleticButton variant="lime">Start økt</AthleticButton>
            <AthleticButton variant="primary">Se plan</AthleticButton>
            <AthleticButton variant="ghost-light">Avbryt</AthleticButton>
            <AthleticButton variant="lime" size="sm">
              Kort
            </AthleticButton>
            <AthleticButton variant="lime" size="lg">
              Stor CTA <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </AthleticButton>
          </div>
        </Section>

        <Section title="Avatar med status" code="<AthleticAvatar />">
          <div className="flex flex-wrap items-end gap-5">
            <AthleticAvatar initials="MR" size="sm" />
            <AthleticAvatar initials="AK" size="md" status="online" />
            <AthleticAvatar initials="ØR" size="lg" status="online" />
            <AthleticAvatar initials="NK" size="xl" status="offline" />
          </div>
        </Section>

        <Section title="Hero med eyebrow + weather" code="<AthleticHero />">
          <AthleticHero
            eyebrow="GFGK · TIRSDAG 18. MAI"
            weather={{ label: "14°C · LETT BRIS · SOL", pulse: true }}
            height="md"
          />
        </Section>

        <Section title="Greeting" code="<AthleticGreeting />">
          <div className="rounded-2xl border border-border bg-card p-5">
            <AthleticGreeting
              avatar={{ initials: "AK", status: "online" }}
              italicEyebrow="God morgen,"
              title="Anders Kristiansen"
              lede="Du har 3 øktforespørsler og 2 spillerrapporter klare. Dagen din starter kl. 08:15."
              metaItems={[
                <span key="1" className="font-mono text-[11px]">
                  +3 økter denne uken
                </span>,
                <span key="2" className="font-mono text-[11px] text-primary font-semibold">
                  HCP 4.2
                </span>,
              ]}
            />
          </div>
        </Section>

        <Section title="KPI-strip" code="<KpiStrip /> + <KpiCard />">
          <KpiStrip columns={4}>
            <KpiCard
              label="Snitt SG"
              value="+1.2"
              trend={{ value: "↑ 0.4 vs forrige", tone: "positive" }}
            />
            <KpiCard
              label="Runder"
              value="14"
              unit="stk"
              trend={{ value: "+3 siste uke", tone: "positive" }}
            />
            <KpiCard
              label="Putt"
              value="29.4"
              trend={{ value: "↓ 1.1 — bedre", tone: "positive" }}
            />
            <KpiCard
              label="HCP"
              value="4.2"
              trend={{ value: "↓ 0.3 mot mål", tone: "positive" }}
            />
          </KpiStrip>
        </Section>

        <Section title="Featured-card (signatur)" code="<FeaturedCard />">
          <div className="grid gap-4 md:grid-cols-2">
            <FeaturedCard
              eyebrow="DAGENS FOKUS"
              showPulse
              title="Putting fra 3–6m — kontroll"
              description="60 min · Performance Studio · 6 putter per distanse, måle break vs intent"
              action={
                <AthleticButton variant="lime">
                  Start økt <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </AthleticButton>
              }
            />
            <FeaturedCard
              eyebrow="NESTE TURNERING"
              title="Sørlandsåpent — 21 dager"
              description="Q-skole · Bossum GK · 4 spillere ennå uten plan"
              action={
                <AthleticButton variant="lime">
                  <Trophy className="h-4 w-4" strokeWidth={2} /> Se plan
                </AthleticButton>
              }
            />
          </div>
        </Section>

        <Section title="AthleticCard" code="<AthleticCard />">
          <div className="grid gap-4 md:grid-cols-2">
            <AthleticCard label="Pyramide-progresjon" showPulse>
              <PyramidProgress
                rows={[
                  { label: "Mental", fillPercent: 78, value: "78%" },
                  { label: "Score", fillPercent: 62, value: "62%" },
                  { label: "Strategi", fillPercent: 55, value: "55%" },
                  { label: "Teknikk", fillPercent: 81, value: "81%" },
                  { label: "Fysisk", fillPercent: 90, value: "90%", tone: "accent" },
                ]}
              />
            </AthleticCard>
            <AthleticCard
              label="3 godkjenninger venter"
              action={
                <AthleticButton variant="ghost-light" size="sm">
                  Se alle
                </AthleticButton>
              }
            >
              <ActionList
                variant="on-light"
                items={[
                  { key: "a", numeric: "1", title: "Markus R. Pedersen — ukerapport", meta: "08:42" },
                  { key: "b", numeric: "2", title: "Aksel Lind — plan-godkjenning", meta: "07:55" },
                  { key: "c", numeric: "3", title: "Fredrik K. Hovland — booking", meta: "I går" },
                ]}
              />
            </AthleticCard>
          </div>
        </Section>

        <Section title="Action-list på mørk bg" code="<ActionList variant='on-dark' />">
          <div className="rounded-2xl bg-primary p-5 text-white">
            <div className="mb-3 flex items-center gap-2">
              <PulseDot size="sm" />
              <AthleticEyebrow tone="lime">DAGENS PRIORITERINGER</AthleticEyebrow>
            </div>
            <ActionList
              variant="on-dark"
              items={[
                { key: "1", numeric: "1", title: "Sende ukerapport til foreldre", meta: "5 min" },
                { key: "2", numeric: "2", title: "Godkjenne plan for Markus", meta: "10 min" },
                { key: "3", numeric: "3", title: "Booking-bekreftelse Bossum", meta: "2 min", tone: "neutral" },
              ]}
            />
          </div>
        </Section>

        <Section title="QueueList — spillere/oppgaver" code="<QueueList />">
          <AthleticCard label="Forespørsler">
            <QueueList
              items={[
                {
                  key: "1",
                  name: "Markus R. Pedersen",
                  detail: "Plan-godkjenning · 08:42 · GFGK",
                  status: { label: "URGENT", variant: "urgent" },
                  avatar: { initials: "MR" },
                },
                {
                  key: "2",
                  name: "Aksel Lind",
                  detail: "Ukerapport · 07:55 · Mulligan",
                  status: { label: "VENTER", variant: "warn" },
                  avatar: { initials: "AL" },
                },
                {
                  key: "3",
                  name: "Fredrik K. Hovland",
                  detail: "Booking bekreftet · I går",
                  status: { label: "OK", variant: "ok" },
                  avatar: { initials: "FH" },
                },
              ]}
            />
          </AthleticCard>
        </Section>

        <Section title="DayCal — dagskalender" code="<DayCal />">
          <AthleticCard
            label="I dag · 18. mai"
            action={
              <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <Calendar className="h-3 w-3" strokeWidth={1.75} /> 4 økter
              </span>
            }
          >
            <DayCal
              startHour={8}
              endHour={18}
              nowHour={11.5}
              events={[
                { key: "1", startHour: 9, endHour: 10, title: "Markus R. — Putting", meta: "09:00" },
                { key: "2", startHour: 10.5, endHour: 12, title: "Aksel L. — Iron play", meta: "10:30" },
                { key: "3", startHour: 13, endHour: 14, title: "Lunch + planlegging" },
                {
                  key: "4",
                  startHour: 14.5,
                  endHour: 16,
                  title: "Fredrik H. — Full session",
                  meta: "14:30",
                  tone: "accent",
                },
              ]}
            />
          </AthleticCard>
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  code,
  children,
}: {
  title: string;
  code: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-bold tracking-[-0.015em] md:text-2xl">{title}</h2>
        <code className="hidden font-mono text-[10px] text-muted-foreground md:inline">{code}</code>
      </div>
      {children}
    </section>
  );
}
