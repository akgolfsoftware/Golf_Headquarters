/**
 * PILOT — CoachHQ Daglig brief
 * Bygd direkte fra wireframe/design-files-v2/01-daglig-brief-dark.html
 * URL: /daglig-brief-dark-demo
 *
 * Mock-data for onsdag 11. mai 2026. Bytt til Prisma-henting senere.
 */

import {
  Printer,
  Settings,
  Mail,
  Star,
  Bot,
  CheckCircle2,
  LayoutGrid,
  AlertTriangle,
} from "lucide-react";

export default function DagligBriefDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground px-10 py-10">
      <div className="max-w-[1200px] mx-auto">
        {/* Hero */}
        <header className="flex items-start justify-between gap-6 pb-6 mb-8 border-b border-border">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Onsdag · 11. mai 2026 · uke 19
            </div>
            <h1 className="mt-2 font-display text-[36px] font-semibold leading-[1.1] tracking-tight">
              <em className="italic">Onsdag 11. mai. 6 økter på timeplanen.</em>
            </h1>
            <div className="mt-2 text-[13px] text-muted-foreground">
              Brief generert kl 06:32 · Oppdatert nå · Sendes automatisk til{" "}
              <a href="#" className="text-primary underline-offset-2 hover:underline">
                anders@akgolf.no
              </a>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
              <Printer className="h-4 w-4" />
              Skriv ut
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
              <Mail className="h-4 w-4" />
              Send som e-post
            </button>
          </div>
        </header>

        {/* KPI-strip */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <Kpi label="Inntekt i går" value="14 280" unit="kr" delta="+8,4%" deltaTone="up" foot="vs forrige onsdag" />
          <Kpi label="Antall økter" value="7" delta="+1" deltaTone="up" foot="5 spillere · 2 grupper" />
          <Kpi label="Belegg studio" value="82" unit="%" delta="+6 pp" deltaTone="up" foot="peak 17:00–20:00" />
          <Kpi label="Nye approvals" value="3" footLink="venter på godkjenning →" />
        </div>

        {/* 01 — I går */}
        <section className="mb-10">
          <SectionNum num="01" title="I går · tirsdag 10. mai" />
          <div className="grid grid-cols-2 gap-6">
            {/* Oppmøte */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-muted-foreground mb-3.5">
                Oppmøte
              </div>
              <div className="font-display text-[22px] font-semibold tracking-tight mb-1.5">
                <span className="font-mono tabular-nums text-[#1A7D56]">5</span> trente ·{" "}
                <span className="font-mono tabular-nums text-[#B8852A]">1</span> hoppet over
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <ChipAtt initials="MP" name="Markus R" />
                <ChipAtt initials="HN" name="Henrik N" />
                <ChipAtt initials="AK" name="Anna K" />
                <ChipAtt initials="JT" name="Joachim T" />
                <ChipAtt initials="MR" name="Mads R" />
                <ChipMiss initials="LS" name="Lise S — skadet" />
              </div>
              <div className="my-5 border-t border-border" />
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[9px] bg-accent/40 text-[#005840] flex items-center justify-center shrink-0">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[13.5px] font-medium">Beste prestasjon</div>
                  <div className="text-muted-foreground text-[12.5px]">
                    Markus Roinaas Pedersen fikk{" "}
                    <b className="font-mono tabular-nums text-[#1A7D56]">+2,4 SG-tot</b> på simulator-økt
                    — pitch 50–100 m
                  </div>
                </div>
              </div>
            </div>

            {/* Pyramide */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-muted-foreground mb-3.5">
                Pyramide-fordeling i går
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-[140px] h-[140px] shrink-0">
                  <svg className="-rotate-90" width="140" height="140" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#EFEDE6" strokeWidth="6" />
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1A7D56" strokeWidth="6" strokeDasharray="38 62" strokeDashoffset="0" />
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#D1F843" strokeWidth="6" strokeDasharray="22 78" strokeDashoffset="-38" />
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#005840" strokeWidth="6" strokeDasharray="18 82" strokeDashoffset="-60" />
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#B8852A" strokeWidth="6" strokeDasharray="12 88" strokeDashoffset="-78" />
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#5E5C57" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="-90" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-mono text-[20px] font-medium tabular-nums leading-none">
                      5,2<span className="text-[11px] text-muted-foreground"> t</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mt-1">
                      Total volum
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <LegendRow color="#1A7D56" label="TEK · Teknikk" value="38 %" />
                  <LegendRow color="#D1F843" label="SLAG · Slagprogresjon" value="22 %" />
                  <LegendRow color="#005840" label="FYS · Fysisk fundament" value="18 %" />
                  <LegendRow color="#B8852A" label="SPILL · Banespill" value="12 %" />
                  <LegendRow color="#5E5C57" label="TURN · Turnering" value="10 %" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02 — Dagens timeplan */}
        <section className="mb-10">
          <SectionNum num="02" title="Dagens timeplan · 6 økter" />

          {/* Timeline rail */}
          <div className="relative h-14 bg-secondary rounded-[10px] my-2 mb-4 overflow-hidden">
            {[
              { left: "0%", label: "06" },
              { left: "12.5%", label: "08" },
              { left: "25%", label: "10" },
              { left: "37.5%", label: "12" },
              { left: "50%", label: "14" },
              { left: "62.5%", label: "16" },
              { left: "75%", label: "18" },
              { left: "87.5%", label: "20" },
              { left: "99%", label: "22" },
            ].map((t) => (
              <div key={t.label} className="absolute top-0 bottom-0 w-px bg-border" style={{ left: t.left }}>
                <span className="absolute top-1 left-1.5 font-mono text-[9.5px] text-muted-foreground">
                  {t.label}
                </span>
              </div>
            ))}
            <TimelineBlock left="18.75%" width="9.4%" top="22px" variant="tek">Markus · TEK</TimelineBlock>
            <TimelineBlock left="31.25%" width="6.25%" top="22px" variant="fys">Anna · FYS</TimelineBlock>
            <TimelineBlock left="50%" width="9.4%" top="22px" variant="slag">Henrik · SLAG</TimelineBlock>
            <TimelineBlock left="56.25%" width="9.4%" top="30px" variant="tek">Mads · TEK</TimelineBlock>
            <TimelineBlock left="62.5%" width="6.25%" top="38px" variant="tek">Lise · TEK</TimelineBlock>
            <TimelineBlock left="78%" width="9.4%" top="22px" variant="fys">Joachim · FYS</TimelineBlock>
          </div>

          {/* Schedule table */}
          <div className="rounded-[14px] border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground px-4 py-3 font-medium">Tid</th>
                  <th className="text-left font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground px-4 py-3 font-medium">Spiller</th>
                  <th className="text-left font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground px-4 py-3 font-medium">Type</th>
                  <th className="text-left font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground px-4 py-3 font-medium">Lokasjon</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[13px]">
                <SchedRow time="09:00" avBg="#1A7D56" initials="MP" name="Markus Roinaas Pedersen" pillTone="info" pillText="TEK · Teknikk" loc="Mulligan · Studio 1" />
                <SchedRow time="11:00" avBg="#005840" initials="AK" name="Anna Karlsen" pillTone="success" pillText="FYS · Fysisk" loc="WANG · Gym A" />
                <SchedRow time="14:00" avBg="#B8852A" initials="HN" name="Henrik Nilsen" pillTone="accent" pillText="SLAG · Pitch 50–100" loc="Mulligan · Studio 2" />
                <SchedRow time="15:00" avBg="#5E5C57" initials="MR" name="Mads Rønning" pillTone="info" pillText="TEK · Driver" loc="Mulligan · Studio 1" />
                <SchedRow time="16:00" avBg="#7C4A18" initials="LS" name="Lise Sandberg" pillTone="info" pillText="TEK · Putte" loc="Mulligan · Studio 2" />
                <SchedRow time="18:30" avBg="#0E5C2F" initials="JT" name="Joachim Tangen" pillTone="success" pillText="FYS · Stabilitet" loc="WANG · Gym A" />
              </tbody>
            </table>
          </div>

          <div className="mt-3.5 px-4 py-3 bg-[#FFF0D6] rounded-xl text-[13px] text-[#B8852A] flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <b>Travleste vindu:</b> 14:00–17:00 (3 økter samtidig — sjekk Studio 1+2 belegg)
            </span>
          </div>
        </section>

        {/* 03 + 04 */}
        <section className="mb-10">
          <div className="grid grid-cols-2 gap-8 items-start">
            {/* 03 Anbefalinger */}
            <div>
              <SectionNum num="03" title="Agentenes anbefalinger" />
              <div className="flex flex-col gap-3">
                <Rec icon={<Bot className="h-4 w-4" />} tone="accent" title="Periodiserings-agent · pauseuke før Sørlandsåpent" desc="Markus R viser tegn på toppform-platå. Anbefaler 6-dagers deload uke 21 før turnering uke 22." />
                <Rec icon={<CheckCircle2 className="h-4 w-4" />} tone="warn" title="Deload-agent · overbelastning hos 2 spillere" desc="Mads R og Henrik N har hatt over 14 t/uke i 3 uker. Foreslår å redusere TEK-volum med 25 % denne uka." />
                <Rec icon={<LayoutGrid className="h-4 w-4" />} tone="primary" title="Plan-watcher · justering for Lise S" desc="Skade-rehab uke 6 av 8. Forslag: gradvis re-introdusere FYS-balanseøvelser fra mandag." />
              </div>
              <div className="mt-3.5 flex justify-between items-center">
                <span className="text-muted-foreground text-[13px]">3 anbefalinger venter på godkjenning</span>
                <a href="#" className="text-primary text-[13px] font-medium hover:underline">
                  Åpne approvals-kø →
                </a>
              </div>
            </div>

            {/* 04 Oppmerksomhet */}
            <div>
              <SectionNum num="04" title="Krever oppmerksomhet" />
              <div className="rounded-xl border border-border bg-card px-6 py-2">
                <AttnRow avBg="#B8852A" avText="2" title="Nye oppgaver i oppfølgings-køen" meta="Begge gjelder foreldre-kommunikasjon · ingen frist passert" linkText="Åpne →" />
                <AttnRow avBg="#5E5C57" avText="JT" title="Faktura Joachim Tangen — 21 dager forfalt" meta="Andre påminnelse sendt · trenger manuell oppfølging" amount="2 400 kr" linkText="Følg opp →" />
                <AttnRow avBg="#005840" avText="ES" title="Treningsplan utløper · Emma Sørensen" meta="Plan «Sommer-progresjon» · gjeldende t.o.m. 14. mai" pillText="3 dager" pillTone="warning" linkText="Forleng →" />
                <AttnRow avBg="#B8852A" avText="LH" title="Treningsplan utløper · Lina Hansen" meta="Plan «Comeback etter skade» · gjeldende t.o.m. 18. mai" pillText="7 dager" pillTone="muted" linkText="Forleng →" last />
              </div>
            </div>
          </div>
        </section>

        {/* 05 — Ukens prioritet */}
        <section>
          <SectionNum num="05" title="Ukens prioritet · uke 19 av 26 i sommer-makrosyklus" />
          <div className="rounded-xl border border-border bg-card p-6 flex justify-between items-center gap-8">
            <div className="flex-1">
              <div className="font-display text-[18px] font-semibold tracking-tight mb-1.5">
                Fokus: TEK-volum opp{" "}
                <span className="font-mono tabular-nums text-[#005840]">+12 %</span>
              </div>
              <div className="text-muted-foreground text-[13.5px]">
                Periodisering: bygge teknisk kapital før konkurranseperioden starter uke 22
                (Sørlandsåpent). Reduserer SPILL marginalt for å gi rom.
              </div>
              <div className="flex items-center gap-4 mt-3.5">
                <div className="flex-1 h-2 bg-black/5 rounded-[4px] overflow-hidden relative">
                  <div
                    className="absolute inset-y-0 left-0 rounded-[4px]"
                    style={{ width: "73%", background: "linear-gradient(90deg,#D1F843,#C2EE2F)" }}
                  />
                </div>
                <span className="font-mono tabular-nums text-[13px]">uke 19 / 26</span>
              </div>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-secondary shrink-0">
              Se neste uke →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// ───────── Sub-components ─────────

function SectionNum({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {num}
      </span>
      <em className="not-italic font-display font-semibold text-[13px] tracking-tight text-foreground">
        {title}
      </em>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  delta,
  deltaTone,
  foot,
  footLink,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaTone?: "up" | "down";
  foot?: string;
  footLink?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-2">
        {label}
      </div>
      <div className="font-display text-[28px] font-semibold tracking-tight leading-none">
        <span className="font-mono tabular-nums">{value}</span>
        {unit && <span className="text-[14px] text-muted-foreground font-normal"> {unit}</span>}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12px]">
        {delta && (
          <span
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium ${
              deltaTone === "up" ? "bg-[#E5F1EA] text-[#1A7D56]" : "bg-secondary text-muted-foreground"
            }`}
          >
            {delta}
          </span>
        )}
        {foot && <span className="text-muted-foreground">{foot}</span>}
        {footLink && (
          <a href="#" className="text-primary text-[12px] hover:underline">
            {footLink}
          </a>
        )}
      </div>
    </div>
  );
}

function ChipAtt({ initials, name }: { initials: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#E5F1EA] text-[#1A7D56] text-[12px] font-medium pl-[5px] pr-2.5 py-[5px]">
      <span className="w-5 h-5 rounded-full bg-[#1A7D56] text-white text-[9.5px] font-semibold flex items-center justify-center">
        {initials}
      </span>
      {name}
    </span>
  );
}

function ChipMiss({ initials, name }: { initials: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0D6] text-[#B8852A] text-[12px] font-medium pl-[5px] pr-2.5 py-[5px]">
      <span className="w-5 h-5 rounded-full bg-[#B8852A] text-white text-[9.5px] font-semibold flex items-center justify-center">
        {initials}
      </span>
      {name}
    </span>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[12.5px] text-muted-foreground">
      <span className="w-2 h-2 rounded-[2px] shrink-0" style={{ background: color }} />
      <span className="flex-1">{label}</span>
      <b className="font-mono tabular-nums text-foreground w-9 text-right text-[12px] font-medium">
        {value}
      </b>
    </div>
  );
}

function TimelineBlock({
  left,
  width,
  top,
  variant,
  children,
}: {
  left: string;
  width: string;
  top: string;
  variant: "tek" | "slag" | "fys";
  children: React.ReactNode;
}) {
  const styles =
    variant === "slag"
      ? "bg-[rgba(209,248,67,0.35)] border border-[rgba(209,248,67,0.6)] text-[#005840]"
      : variant === "fys"
        ? "bg-[rgba(22,163,74,0.16)] border border-[rgba(22,163,74,0.3)] text-[#0E5C2F]"
        : "bg-[rgba(0,88,64,0.12)] border border-[rgba(0,88,64,0.22)] text-[#005840]";
  return (
    <div
      className={`absolute rounded-md px-2 flex items-center text-[11px] font-medium overflow-hidden whitespace-nowrap ${styles}`}
      style={{ left, width, top, bottom: "8px" }}
    >
      {children}
    </div>
  );
}

function SchedRow({
  time,
  avBg,
  initials,
  name,
  pillTone,
  pillText,
  loc,
}: {
  time: string;
  avBg: string;
  initials: string;
  name: string;
  pillTone: "info" | "success" | "accent";
  pillText: string;
  loc: string;
}) {
  const pillStyles =
    pillTone === "success"
      ? "bg-[#E5F1EA] text-[#1A7D56]"
      : pillTone === "accent"
        ? "bg-accent/40 text-[#005840]"
        : "bg-primary/10 text-primary";
  return (
    <tr>
      <td className="px-4 py-3 font-mono text-[13px] font-medium w-16 tabular-nums">{time}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-2.5">
          <span
            className="w-6 h-6 rounded-full text-white text-[10px] font-semibold flex items-center justify-center"
            style={{ background: avBg }}
          >
            {initials}
          </span>
          {name}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${pillStyles}`}>
          {pillText}
        </span>
      </td>
      <td className="px-4 py-3 text-muted-foreground text-[12px]">{loc}</td>
      <td className="px-4 py-3 text-right">
        <a href="#" className="text-primary text-[13px] font-medium hover:underline">
          Åpne →
        </a>
      </td>
    </tr>
  );
}

function Rec({
  icon,
  tone,
  title,
  desc,
}: {
  icon: React.ReactNode;
  tone: "accent" | "primary" | "warn";
  title: string;
  desc: string;
}) {
  const iconStyles =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "warn"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : "bg-accent/40 text-[#005840]";
  return (
    <div className="flex gap-3.5 px-4 py-3.5 border border-border rounded-[14px] bg-card">
      <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 ${iconStyles}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-medium mb-0.5">{title}</div>
        <div className="text-[12px] text-muted-foreground">{desc}</div>
      </div>
      <button className="self-center inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
        Vurder →
      </button>
    </div>
  );
}

function AttnRow({
  avBg,
  avText,
  title,
  meta,
  amount,
  pillText,
  pillTone,
  linkText,
  last,
}: {
  avBg: string;
  avText: string;
  title: string;
  meta: string;
  amount?: string;
  pillText?: string;
  pillTone?: "warning" | "muted";
  linkText: string;
  last?: boolean;
}) {
  const pillStyles =
    pillTone === "warning"
      ? "bg-[#FFF0D6] text-[#B8852A]"
      : "bg-secondary text-muted-foreground";
  return (
    <div className={`flex items-center gap-3.5 py-3.5 ${last ? "" : "border-b border-border"}`}>
      <span
        className="w-9 h-9 rounded-full text-white text-[11px] font-semibold flex items-center justify-center shrink-0"
        style={{ background: avBg }}
      >
        {avText}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-medium mb-0.5">{title}</div>
        <div className="text-[12px] text-muted-foreground">{meta}</div>
      </div>
      {amount && <span className="font-mono tabular-nums text-[14px] font-medium">{amount}</span>}
      {pillText && (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${pillStyles}`}>
          {pillText}
        </span>
      )}
      <a href="#" className="text-primary text-[13px] font-medium hover:underline">
        {linkText}
      </a>
    </div>
  );
}
