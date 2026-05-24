/**
 * Detalj-side-mønster-demo (intern)
 *
 * URL: /detail-pattern-demo
 *
 * Demonstrerer felles DetailShell-mønster (plan Del 7) som alle ~30 detalj-sider
 * skal refaktoreres til. Bruk denne som mal når du skriver/oppdaterer en
 * detalj-side.
 *
 * Anatomi:
 * 1. Breadcrumb (Lucide:ChevronLeft + parent-rute)
 * 2. Hero: tittel + subtitle + status-pill + actions (3 maks)
 * 3. KPI-rad: 4 cards med eyebrow + stort tall + delta
 * 4. Tabs for delseksjoner (Oversikt, Detaljer, Aktivitet, Innstillinger)
 * 5. Innhold per tab rendert inline (ikke ny rute)
 * 6. Sticky aksjons-linje ved bunn (Rediger / Slett / Del)
 */

import {
  Calendar,
  CheckCircle,
  PenSquare,
  Plus,
  Share2,
  Trash2,
  Trophy,
} from "lucide-react";
import { AthleticBadge } from "@/components/athletic/badge";
import { AthleticButton } from "@/components/athletic/button";
import { DetailShell } from "@/components/shared/detail-shell";
import { KPICard, Tab, TabList, TabPanel, Tabs } from "@/components/ui";

export const metadata = {
  title: "Detalj-mønster demo · AK Golf HQ (intern)",
};

export default function DetailPatternDemoPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-6xl px-6">
        <DetailShell
          breadcrumb={[
            { label: "Tren", href: "/portal/tren" },
            { label: "FYS-planer", href: "/portal/tren/fys-plan" },
            { label: "Vinter 2026" },
          ]}
          backHref="/portal/tren/fys-plan"
          title={
            <>
              Vinter 2026 <em className="text-primary">· grunntrening</em>
            </>
          }
          subtitle="Spesialisering · 12 økter planlagt · sist endret 22. mai av Markus R.P."
          statusPill={<AthleticBadge variant="ok">AKTIV</AthleticBadge>}
          actions={
            <>
              <AthleticButton variant="ghost-light" size="sm">
                <Share2 size={14} strokeWidth={1.75} aria-hidden />
                Del
              </AthleticButton>
              <AthleticButton variant="primary" size="sm">
                <PenSquare size={14} strokeWidth={1.75} aria-hidden />
                Rediger
              </AthleticButton>
            </>
          }
          kpiRow={
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                eyebrow="Periode"
                value="Uke 21 / 30"
                variant="hero"
                footnote="70% gjennomført"
              />
              <KPICard
                eyebrow="CS-progresjon"
                value="+2.1 mph"
                variant="default"
                delta={{ value: "0.3", direction: "up" }}
                footnote="109.9 → 112.0"
              />
              <KPICard
                eyebrow="TM hit-rate"
                value="68%"
                variant="default"
                footnote="spread 6.2m → 5.1m"
              />
              <KPICard
                eyebrow="Adherence"
                value="92%"
                variant="default"
                delta={{ value: "4", direction: "up" }}
                footnote="vs forrige periode"
              />
            </div>
          }
          tabs={
            <Tabs defaultValue="oversikt">
              <TabList>
                <Tab value="oversikt">Oversikt</Tab>
                <Tab value="detaljer" count={12}>
                  Økter
                </Tab>
                <Tab value="aktivitet" count={3}>
                  Aktivitet
                </Tab>
                <Tab value="innstillinger">Innstillinger</Tab>
              </TabList>
              <TabPanel value="oversikt">
                <div className="mt-6 space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-display text-lg font-bold mb-3">
                      Coach Anders sin kommentar
                    </h2>
                    <p className="text-sm text-foreground leading-relaxed">
                      Hold fokus på P3-P4 i swingsekvensen. Vi øker bag-volum
                      til 6× per uke for Sørlandsåpent. Putt-økter 3× per uke
                      fortsatt.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="font-display text-lg font-bold mb-3">
                      Neste milepæl
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                        <Trophy
                          size={18}
                          strokeWidth={1.75}
                          className="text-primary"
                          aria-hidden
                        />
                      </span>
                      <div>
                        <p className="font-display font-semibold">
                          Sørlandsåpent
                        </p>
                        <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground mt-0.5">
                          14. juni · 21 dager igjen
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel value="detaljer">
                <div className="mt-6 rounded-2xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">
                    12 økter — liste vises her (eksempel).
                  </p>
                </div>
              </TabPanel>
              <TabPanel value="aktivitet">
                <div className="mt-6 space-y-2">
                  {[
                    { who: "Anders K.", action: "logget økt", time: "I dag 14:32" },
                    { who: "Markus R.P.", action: "endret plan-mal", time: "I går 09:14" },
                    { who: "AI Caddie", action: "foreslo nytt drill", time: "21. mai 11:00" },
                  ].map((act, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                    >
                      <div>
                        <span className="font-medium">{act.who}</span>
                        <span className="text-muted-foreground"> {act.action}</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {act.time}
                      </span>
                    </div>
                  ))}
                </div>
              </TabPanel>
              <TabPanel value="innstillinger">
                <div className="mt-6 rounded-2xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">
                    Innstillinger for denne planen (eksempel).
                  </p>
                </div>
              </TabPanel>
            </Tabs>
          }
          stickyActions={
            <>
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={16}
                  strokeWidth={1.75}
                  className="text-success"
                  aria-hidden
                />
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Sist autosave: nå
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AthleticButton variant="ghost-light" size="sm">
                  <Trash2 size={14} strokeWidth={1.75} aria-hidden />
                  Slett
                </AthleticButton>
                <AthleticButton variant="ghost-light" size="sm">
                  <Calendar size={14} strokeWidth={1.75} aria-hidden />
                  Dupliser
                </AthleticButton>
                <AthleticButton variant="lime" size="sm">
                  <Plus size={14} strokeWidth={1.75} aria-hidden />
                  Ny økt
                </AthleticButton>
              </div>
            </>
          }
        >
          <div className="text-sm text-muted-foreground">
            {/* Hovedinnhold — vises under tabs. Tabs rendrer sine egne panels
                ovenfor, så children-slot er sjelden brukt sammen med tabs.
                Bruk den når siden trenger ekstra-content under tabs. */}
            Ekstra-content vises her hvis siden trenger noe under tabs-panelet.
          </div>
        </DetailShell>

        <footer className="border-t border-border pt-8 mt-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
            Detalj-mønster demo · plan Del 7 · alle detalj-sider refaktoreres til denne malen
          </p>
        </footer>
      </div>
    </div>
  );
}
