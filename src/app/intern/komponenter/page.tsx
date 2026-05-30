import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Internt komponent-galleri — verifiseringsdemoer for athletic/AgencyOS-komponentene.
// Mock-data, ingen DB. Bør gates eller fjernes før produksjon.

const demos: { slug: string; title: string; desc: string; bolk: string }[] = [
  { slug: "hull-analyse", title: "Hull-analyse", desc: "Top-down hull-kart med kategori-markører langs shot-pathen (Tee total → Innspill → Nærspill → Putt). Trykk for SG + treningsdata per sone.", bolk: "PlayerHQ" },
  { slug: "daglig-brief", title: "Daglig brief", desc: "3-kolonne AgencyOS-dashboard (timeline · innboks · fokus-spillere) + KPI-strip.", bolk: "Pulje D" },
  { slug: "agency-kit", title: "Sidebar + Stallen", desc: "AgencySidebar (mørk, rail/utvidet) + DataTable med sortering, seleksjon og indicators.", bolk: "Bolk 1" },
  { slug: "inbox-tester", title: "Innboks + tester", desc: "Inbox-kit (filter, batch-bar, inline-expand) + TestMatrix med fargekodede celler.", bolk: "Bolk 2a" },
  { slug: "team-bookinger", title: "Team + bookinger", desc: "TeamRosterList (CBAC-roller), PlanMalCard (pyr-dist) + InlineBookingForm.", bolk: "Bolk 2b" },
  { slug: "spiller-panel", title: "Spiller-detalj", desc: "400px slide-over: KPI, pyramide faktisk-vs-plan, uke-grid, neste booking, kommunikasjon.", bolk: "Bolk 2b" },
  { slug: "forelder", title: "Foreldreportal", desc: "MinorGate (GDPR), ApprovalCard, MessageComposer + ReadReceiptList.", bolk: "Bolk 3" },
];

export default function KomponentGalleri() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto w-[960px] max-w-full">
        <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Internt · komponent-galleri
        </div>
        <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-foreground">
          AgencyOS — <em className="font-normal italic text-primary">bygde komponenter</em>
        </h1>
        <p className="mb-6 max-w-xl text-sm text-muted-foreground">
          Verifiseringsdemoer med mock-data. Hver rute viser komponentene fra én byggebolk
          mot design-preview. Internt verktøy — fjernes eller gates før launch.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {demos.map((d) => (
            <Link
              key={d.slug}
              href={`/intern/komponenter/${d.slug}`}
              className="group flex flex-col gap-2 rounded-[12px] border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">{d.bolk}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.5} />
              </div>
              <span className="font-display text-base font-bold tracking-tight text-foreground">{d.title}</span>
              <span className="text-xs leading-[1.5] text-muted-foreground">{d.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
