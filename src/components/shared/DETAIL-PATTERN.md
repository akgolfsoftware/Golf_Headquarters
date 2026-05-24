# Detalj-side-mønster (DetailShell)

Felles mønster for alle ~30 detalj-sider på plattformen. Implementert i
`src/components/shared/detail-shell.tsx`.

Live demo: `/detail-pattern-demo` (intern dok-rute).

## Når brukes DetailShell

Alle sider som vises hver gang du klikker fra en hub eller liste til én
spesifikk instans (én plan, én spiller, én turnering, etc.). Eksempler:

- `/admin/spillere/[id]` — spiller-detalj
- `/admin/plans/[planId]` — plan-detalj
- `/admin/tournaments/[id]` — turnering-detalj
- `/admin/tester/[id]` — test-detalj
- `/portal/tren/teknisk-plan/[planId]` — teknisk plan-detalj
- `/portal/mal/goal/[id]` — mål-detalj
- `/portal/tren/[sessionId]` — sesjons-detalj
- `/portal/booking/[bookingId]` — booking-detalj

## Anatomi (alltid samme rekkefølge)

```
┌─────────────────────────────────────────────────┐
│ ← Breadcrumb: Tren / FYS-planer / [navn]        │  ← Lucide:ChevronLeft + parent
├─────────────────────────────────────────────────┤
│                                                 │
│  Tittel italic    [STATUS]      [Del] [Rediger] │  ← Hero
│  Subtitle med metadata                          │
│                                                 │
├─────────────────────────────────────────────────┤
│  [KPI 1]   [KPI 2]   [KPI 3]   [KPI 4]          │  ← Maks 4 KPI-cards
├─────────────────────────────────────────────────┤
│  Oversikt · Detaljer · Aktivitet · Innstillinger│  ← Tabs (count optional)
├─────────────────────────────────────────────────┤
│                                                 │
│   Innhold for aktiv tab (rendert inline)        │
│                                                 │
├─────────────────────────────────────────────────┤
│  ✓ Autosave    [Slett] [Dupliser] [+ Ny økt]    │  ← Sticky bottom (optional)
└─────────────────────────────────────────────────┘
```

## Bruksmønster

```tsx
import { DetailShell } from "@/components/shared/detail-shell";
import { KPICard, Tab, TabList, TabPanel, Tabs } from "@/components/ui";
import { AthleticBadge, AthleticButton } from "@/components/athletic";

<DetailShell
  breadcrumb={[
    { label: "Tren", href: "/portal/tren" },
    { label: "FYS-planer", href: "/portal/tren/fys-plan" },
    { label: plan.navn }, // siste = ingen href, blir bold
  ]}
  backHref="/portal/tren/fys-plan"

  title={<>{plan.navn} <em className="text-primary">· {periode}</em></>}
  subtitle={`${antOkter} økter · sist endret ${dato} av ${coach}`}

  statusPill={<AthleticBadge variant="ok">AKTIV</AthleticBadge>}

  actions={
    <>
      <AthleticButton variant="ghost-light" size="sm">Del</AthleticButton>
      <AthleticButton variant="primary" size="sm">Rediger</AthleticButton>
    </>
  }

  kpiRow={
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard eyebrow="Periode" value="Uke 21 / 30" variant="hero" />
      <KPICard eyebrow="CS-progresjon" value="+2.1 mph" delta={{ value: "0.3", direction: "up" }} />
      <KPICard eyebrow="TM hit-rate" value="68%" />
      <KPICard eyebrow="Adherence" value="92%" delta={{ value: "4", direction: "up" }} />
    </div>
  }

  tabs={
    <Tabs defaultValue="oversikt">
      <TabList>
        <Tab value="oversikt">Oversikt</Tab>
        <Tab value="detaljer" count={12}>Økter</Tab>
        <Tab value="aktivitet" count={3}>Aktivitet</Tab>
        <Tab value="innstillinger">Innstillinger</Tab>
      </TabList>
      <TabPanel value="oversikt">{/* innhold */}</TabPanel>
      <TabPanel value="detaljer">{/* innhold */}</TabPanel>
      <TabPanel value="aktivitet">{/* innhold */}</TabPanel>
      <TabPanel value="innstillinger">{/* innhold */}</TabPanel>
    </Tabs>
  }

  stickyActions={
    <>
      <div className="flex items-center gap-2">
        <CheckCircle size={16} className="text-success" />
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
          Sist autosave: nå
        </span>
      </div>
      <div className="flex items-center gap-2">
        <AthleticButton variant="ghost-light" size="sm">Slett</AthleticButton>
        <AthleticButton variant="lime" size="sm">+ Ny økt</AthleticButton>
      </div>
    </>
  }
>
  {/* children — sjelden brukt med tabs. Hvis du har ekstra content under, plasser det her. */}
</DetailShell>
```

## Regler

1. **Breadcrumb alltid** — minst 2 nivåer. Siste = current (ingen `href`).
2. **Tittel kan inneholde italic** — bruk `<em>` for visuell variasjon (matche hub-tittel-stil).
3. **Status-pill kun hvis relevant** — bruk `AthleticBadge` med `variant="ok|warn|urgent|lime|primary|neutral"`.
4. **Maks 3 actions** — flere blir overveldende. Bruk ellipsis-meny for resten.
5. **KPI-rad maks 4 cards** — bruk `KPICard` med `variant="hero"` på ÉN (viktigste).
6. **Tabs er valgfrie** — hvis siden er enkel, dropp tabs og bruk children.
7. **Sticky actions** — kun hvis siden har lagrings-state eller frekvente handlinger.

## Hva som IKKE skal skje

- ❌ Egen breadcrumb-implementasjon (bruk komponentet)
- ❌ Hardkodede farger på status (bruk Badge-variants)
- ❌ Tabs som ny rute (bruk inline TabPanel)
- ❌ Action-knapper som ikoner uten label (alltid label)
- ❌ Manglende focus-states (DetailShell håndterer automatisk)
- ❌ Bryte 8pt-grid (alle spacing er multiplum av 8px)

## Refaktorering — hvor er vi

| Side | Bruker DetailShell | Notat |
|---|---|---|
| `/detail-pattern-demo` | ✅ Demo | Referanse-implementasjon |
| `/admin/spillere/[id]` | ⏳ | Kompleks, mange tabs |
| `/admin/plans/[planId]` | ⏳ | Plan-builder-flow |
| `/admin/tournaments/[id]` | ⏳ | Med deltager-liste |
| `/admin/tester/[id]` | ⏳ | Med resultat-graf |
| `/portal/tren/teknisk-plan/[planId]` | ⏳ | Uke-visning |
| `/portal/mal/goal/[id]` | ⏳ | Med milepæl-tracker |
| `/portal/booking/[bookingId]` | ⏳ | Med betalingsstatus |

⏳ = venter på refaktorering. Når Anders har bash, kan vi refaktorere disse
sekvensielt med tsc-verifisering mellom hver.

## Tids-estimat for full refaktorering

~5 min per side × ~30 sider = ~2.5 timer Claude-arbeid. Når bash fungerer
kan dette gjøres som batch.
