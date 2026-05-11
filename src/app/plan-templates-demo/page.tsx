/**
 * PILOT - CoachHQ Plan-templates
 * Bygd direkte fra wireframe/design-files-v2/coachhq-A/05-plan-templates.html
 * URL: /plan-templates-demo
 *
 * Maler for treningsplaner. 8 maler + ett "Bygg egen mal"-kort.
 */

import { Search, Plus, Users, Star } from "lucide-react";

type PyrKey = "fys" | "tek" | "slag" | "spill" | "turn";

const PYR_COLOR: Record<PyrKey, string> = {
  fys: "var(--color-pyr-fys, #005840)",
  tek: "var(--color-pyr-tek, #1A7D56)",
  slag: "var(--color-pyr-slag, #D1F843)",
  spill: "var(--color-pyr-spill, #B8852A)",
  turn: "var(--color-pyr-turn, #5E5C57)",
};

type Template = {
  category: string;
  byInitials: string;
  byName: string;
  emTitle: string;
  restTitle: string;
  sub: string;
  thumbGradient: string;
  donutGradient: string;
  meta: { value: string; label: string }[];
  desc: string;
  pyr: { key: PyrKey; value: number }[];
  legendEntries?: { key: PyrKey; value: number }[];
  usedCount: number;
  rating: string;
  featured?: boolean;
};

const TEMPLATES: Template[] = [
  {
    category: "Anbefalt",
    byInitials: "AK",
    byName: "AK Performance",
    emTitle: "Turnerings-",
    restTitle: "prep · 8 u",
    sub: "Klassisk peaking til hovedmål",
    thumbGradient: "linear-gradient(135deg, #005840 0%, #006B4F 100%)",
    donutGradient:
      "conic-gradient(var(--color-pyr-fys, #005840) 0 36deg, var(--color-pyr-tek, #1A7D56) 36deg 90deg, var(--color-pyr-slag, #D1F843) 90deg 216deg, var(--color-pyr-spill, #B8852A) 216deg 324deg, var(--color-pyr-turn, #5E5C57) 324deg 360deg)",
    meta: [
      { value: "8 u", label: "periode" },
      { value: "32", label: "økter" },
      { value: "5", label: "faser" },
      { value: "Elite", label: "" },
    ],
    desc: "For spillere med konkret turneringsmål. Base, Forberedelse, Spesifikk, Taper, Peak. SLAG og SPILL øker progressivt mot turneringsdato.",
    pyr: [
      { key: "fys", value: 18 },
      { key: "tek", value: 27 },
      { key: "slag", value: 25 },
      { key: "spill", value: 20 },
      { key: "turn", value: 10 },
    ],
    usedCount: 34,
    rating: "4,8",
    featured: true,
  },
  {
    category: "Turneringsprep",
    byInitials: "AK",
    byName: "AK Performance",
    emTitle: "Sprint-",
    restTitle: "prep · 3 u",
    sub: "Når peak er nær",
    thumbGradient: "linear-gradient(135deg, #2D7A5C 0%, #4A9670 100%)",
    donutGradient:
      "conic-gradient(var(--color-pyr-fys, #005840) 0 72deg, var(--color-pyr-tek, #1A7D56) 72deg 162deg, var(--color-pyr-slag, #D1F843) 162deg 252deg, var(--color-pyr-spill, #B8852A) 252deg 324deg, var(--color-pyr-turn, #5E5C57) 324deg 360deg)",
    meta: [
      { value: "3 u", label: "periode" },
      { value: "12", label: "økter" },
      { value: "3", label: "faser" },
      { value: "Klubb+", label: "" },
    ],
    desc: "Kort, intensiv tilnærming. Skipper base-fasen — for spillere som allerede er i form og trenger turnerings-spesifikk skjerping.",
    pyr: [
      { key: "fys", value: 8 },
      { key: "tek", value: 17 },
      { key: "slag", value: 30 },
      { key: "spill", value: 25 },
      { key: "turn", value: 20 },
    ],
    usedCount: 22,
    rating: "4,6",
  },
  {
    category: "Comeback",
    byInitials: "AK",
    byName: "AK Performance",
    emTitle: "Comeback",
    restTitle: "fra skade · 6 u",
    sub: "Trygg progresjon",
    thumbGradient: "linear-gradient(135deg, #B8852A 0%, #D4A04A 100%)",
    donutGradient:
      "conic-gradient(var(--color-pyr-fys, #005840) 0 144deg, var(--color-pyr-tek, #1A7D56) 144deg 252deg, var(--color-pyr-slag, #D1F843) 252deg 324deg, var(--color-pyr-spill, #B8852A) 324deg 360deg)",
    meta: [
      { value: "6 u", label: "periode" },
      { value: "18", label: "økter" },
      { value: "4", label: "faser" },
      { value: "Alle", label: "" },
    ],
    desc: "Tilbake-til-spill etter skade eller lang pause. FYS-tung start, gradvis volum-progresjon, hands-off uker bakt inn for restitusjon.",
    pyr: [
      { key: "fys", value: 40 },
      { key: "tek", value: 30 },
      { key: "slag", value: 20 },
      { key: "spill", value: 10 },
      { key: "turn", value: 0 },
    ],
    usedCount: 11,
    rating: "4,7",
  },
  {
    category: "Off-season",
    byInitials: "NB",
    byName: "Norges Golfforbund",
    emTitle: "Off-season",
    restTitle: "fundament · 12 u",
    sub: "Bygg fysisk grunnmur",
    thumbGradient: "linear-gradient(135deg, #16A34A 0%, #4FB872 100%)",
    donutGradient:
      "conic-gradient(var(--color-pyr-fys, #005840) 0 162deg, var(--color-pyr-tek, #1A7D56) 162deg 270deg, var(--color-pyr-slag, #D1F843) 270deg 324deg, var(--color-pyr-spill, #B8852A) 324deg 360deg)",
    meta: [
      { value: "12 u", label: "periode" },
      { value: "48", label: "økter" },
      { value: "3", label: "faser" },
      { value: "Junior+", label: "" },
    ],
    desc: "Vintermånedene som mulighet. Tung vekt på FYS og TEK, lite spill. Anbefales etter siste turnering for sesongen.",
    pyr: [
      { key: "fys", value: 45 },
      { key: "tek", value: 30 },
      { key: "slag", value: 15 },
      { key: "spill", value: 10 },
      { key: "turn", value: 0 },
    ],
    usedCount: 87,
    rating: "4,9",
  },
  {
    category: "Vinter",
    byInitials: "AK",
    byName: "AK Performance",
    emTitle: "Innendørs-",
    restTitle: "vinter · 10 u",
    sub: "TrackMan + simulator-fokus",
    thumbGradient: "linear-gradient(135deg, #29261B 0%, #5E5C57 100%)",
    donutGradient:
      "conic-gradient(var(--color-pyr-fys, #005840) 0 90deg, var(--color-pyr-tek, #1A7D56) 90deg 234deg, var(--color-pyr-slag, #D1F843) 234deg 324deg, var(--color-pyr-spill, #B8852A) 324deg 360deg)",
    meta: [
      { value: "10 u", label: "periode" },
      { value: "40", label: "økter" },
      { value: "3", label: "faser" },
      { value: "Alle", label: "" },
    ],
    desc: "Når banen er stengt. Tung TEK-fase med video og TrackMan, kombinert med FYS. Simulator-runder erstatter banespill.",
    pyr: [
      { key: "fys", value: 25 },
      { key: "tek", value: 40 },
      { key: "slag", value: 25 },
      { key: "spill", value: 10 },
      { key: "turn", value: 0 },
    ],
    usedCount: 45,
    rating: "4,5",
  },
  {
    category: "Junior",
    byInitials: "AK",
    byName: "AK Performance",
    emTitle: "Junior-",
    restTitle: "grunnpakke · 16 u",
    sub: "Bredt fundament 12-15 år",
    thumbGradient: "linear-gradient(135deg, #006B4F 0%, #D1F843 100%)",
    donutGradient:
      "conic-gradient(var(--color-pyr-fys, #005840) 0 108deg, var(--color-pyr-tek, #1A7D56) 108deg 234deg, var(--color-pyr-slag, #D1F843) 234deg 306deg, var(--color-pyr-spill, #B8852A) 306deg 360deg)",
    meta: [
      { value: "16 u", label: "periode" },
      { value: "48", label: "økter" },
      { value: "4", label: "faser" },
      { value: "Junior", label: "" },
    ],
    desc: "Generell utvikling for unge spillere. Balansert pyramide med moderat tidsbruk, leke-orientert progresjon.",
    pyr: [
      { key: "fys", value: 30 },
      { key: "tek", value: 35 },
      { key: "slag", value: 20 },
      { key: "spill", value: 15 },
      { key: "turn", value: 0 },
    ],
    usedCount: 62,
    rating: "4,8",
  },
  {
    category: "Putte-fokus",
    byInitials: "AK",
    byName: "Anders Kristiansen",
    emTitle: "Putte-",
    restTitle: "spesialisering · 4 u",
    sub: "SG-putt under +0",
    thumbGradient: "linear-gradient(135deg, #DC2626 0%, #F87171 100%)",
    donutGradient:
      "conic-gradient(var(--color-pyr-slag, #D1F843) 0 252deg, var(--color-pyr-tek, #1A7D56) 252deg 306deg, var(--color-pyr-spill, #B8852A) 306deg 360deg)",
    meta: [
      { value: "4 u", label: "periode" },
      { value: "20", label: "økter" },
      { value: "2", label: "faser" },
      { value: "Alle", label: "" },
    ],
    desc: "Når putt drar ned SG. Daglige korte putte-økter, 6/10/20-fots drill, blandet med distance-control på lange putts.",
    pyr: [
      { key: "fys", value: 5 },
      { key: "tek", value: 15 },
      { key: "slag", value: 70 },
      { key: "spill", value: 10 },
      { key: "turn", value: 0 },
    ],
    legendEntries: [
      { key: "slag", value: 70 },
      { key: "tek", value: 15 },
      { key: "spill", value: 10 },
    ],
    usedCount: 8,
    rating: "4,3",
  },
  {
    category: "Maintenance",
    byInitials: "AK",
    byName: "AK Performance",
    emTitle: "Vedlikehold",
    restTitle: "sesong · rullerende",
    sub: "Mellom turneringer",
    thumbGradient: "linear-gradient(135deg, #4A2D6A 0%, #7A5BAA 100%)",
    donutGradient:
      "conic-gradient(var(--color-pyr-fys, #005840) 0 72deg, var(--color-pyr-tek, #1A7D56) 72deg 162deg, var(--color-pyr-slag, #D1F843) 162deg 252deg, var(--color-pyr-spill, #B8852A) 252deg 342deg, var(--color-pyr-turn, #5E5C57) 342deg 360deg)",
    meta: [
      { value: "rullerende", label: "" },
      { value: "~4", label: "økter/uke" },
      { value: "1", label: "fase" },
      { value: "Klubb+", label: "" },
    ],
    desc: "Ikke periodisert — for spillere uten konkret peak. Balansert ukestruktur som holder formen jevn gjennom sesongen.",
    pyr: [
      { key: "fys", value: 20 },
      { key: "tek", value: 25 },
      { key: "slag", value: 25 },
      { key: "spill", value: 25 },
      { key: "turn", value: 5 },
    ],
    usedCount: 119,
    rating: "4,6",
  },
];

export default function PlanTemplatesDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Treningsplaner · Maler
        </span>
        <h1 className="mt-2 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
          <em className="font-medium italic">Maler</em> for treningsplaner
        </h1>
        <p className="mt-2 max-w-[720px] text-[13px] leading-[1.5] text-muted-foreground">
          Bruk maler som utgangspunkt for nye planer. Hver mal definerer faseinndeling,
          pyramide-allokasjon og økt-skjelett som tilpasses spilleren automatisk.
        </p>
      </header>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative max-w-[360px] flex-1">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <input
            type="search"
            placeholder="Søk i maler …"
            className="w-full rounded-md border border-border bg-card px-4 py-2 pl-10 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <span className="px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Kategori
        </span>
        <Chip active>
          Alle <span className="ml-2 opacity-60 tabular-nums">14</span>
        </Chip>
        <Chip>
          Turneringsprep <span className="ml-2 opacity-60 tabular-nums">5</span>
        </Chip>
        <Chip>
          Comeback <span className="ml-2 opacity-60 tabular-nums">2</span>
        </Chip>
        <Chip>
          Off-season <span className="ml-2 opacity-60 tabular-nums">3</span>
        </Chip>
        <Chip>
          Vinter <span className="ml-2 opacity-60 tabular-nums">4</span>
        </Chip>
        <span className="ml-auto" />
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Ny mal fra bunn
        </button>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-3 gap-4">
        {TEMPLATES.map((tpl) => (
          <TemplateCard key={`${tpl.emTitle}${tpl.restTitle}`} tpl={tpl} />
        ))}

        {/* New-card */}
        <article className="flex min-h-[380px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-card">
          <div className="px-8 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Plus className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 font-display text-[18px] font-semibold leading-tight">
              Bygg egen mal
            </h3>
            <p className="text-[13px] leading-[1.5] text-muted-foreground">
              Start fra bunn eller dupliser en eksisterende plan som mal for fremtiden.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

function Chip({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`inline-flex items-center rounded-full border px-4 py-2 text-[12px] font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function TemplateCard({ tpl }: { tpl: Template }) {
  const legend = tpl.legendEntries ?? tpl.pyr;
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-lg bg-card transition-transform hover:-translate-y-0.5 hover:shadow-md ${
        tpl.featured ? "border-2 border-accent" : "border border-border"
      }`}
    >
      {/* Thumb */}
      <div
        className="relative flex aspect-[16/9] flex-col justify-between overflow-hidden p-6"
        style={{ background: tpl.thumbGradient }}
      >
        <div className="z-10 flex items-start justify-between">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${
              tpl.featured
                ? "bg-accent text-accent-foreground"
                : "bg-white/85 text-foreground backdrop-blur"
            }`}
          >
            {tpl.featured && <Star className="h-3 w-3" strokeWidth={1.5} />}
            {tpl.category}
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-medium text-white/85">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/25 font-mono text-[9px] font-bold text-white">
              {tpl.byInitials}
            </span>
            {tpl.byName}
          </span>
        </div>

        {/* Mini donut */}
        <div
          className="absolute bottom-6 right-6 z-10 h-16 w-16 rounded-full shadow-md"
          style={{ background: tpl.donutGradient }}
        >
          <div className="absolute inset-[14px] rounded-full bg-card/90" />
        </div>

        <div className="z-10">
          <div className="font-display text-[22px] font-bold leading-tight tracking-tight text-white">
            <em className="font-medium italic">{tpl.emTitle}</em>
            <br />
            {tpl.restTitle}
          </div>
          <div className="mt-1 text-[12px] font-medium leading-snug text-white/80">
            {tpl.sub}
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.15) 100%)",
          }}
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap gap-4 text-[12px] text-muted-foreground">
          {tpl.meta.map((m) => (
            <span key={`${m.value}${m.label}`}>
              <b className="mr-1 font-mono font-semibold tabular-nums text-foreground">
                {m.value}
              </b>
              {m.label}
            </span>
          ))}
        </div>

        <p className="text-[13px] leading-[1.5] text-muted-foreground">{tpl.desc}</p>

        <div>
          <div className="flex h-2 gap-0.5 overflow-hidden rounded-sm bg-secondary">
            {tpl.pyr.map((p) => (
              <div
                key={p.key}
                style={{ width: `${p.value}%`, background: PYR_COLOR[p.key] }}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] text-muted-foreground">
            {legend.map((p) => (
              <span key={p.key}>
                {p.key.toUpperCase()}{" "}
                <b className="font-semibold text-foreground">{p.value}%</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-background px-6 py-2">
        <div className="flex gap-4 text-[11px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
            <b className="font-mono font-semibold text-foreground">{tpl.usedCount}</b>
            brukt
          </span>
          <span className="inline-flex items-center gap-2">
            <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
            <b className="font-mono font-semibold text-foreground">{tpl.rating}</b>
          </span>
        </div>
        <button className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          Bruk mal
        </button>
      </div>
    </article>
  );
}
