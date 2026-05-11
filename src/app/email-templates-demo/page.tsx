/**
 * PILOT — CoachHQ E-post-maler
 * Bygd fra wireframe/design-files-v2/screens/27-coachhq-email-templates.html
 * URL: /email-templates-demo
 *
 * Editor med variabler, sending-statistikk, og planlagt utsending.
 */

import { Bold, Image as ImageIcon, Italic, Link as LinkIcon, List, Plus, Underline } from "lucide-react";

interface TplItem {
  id: string;
  name: string;
  meta: string;
  count: string;
  active?: boolean;
}

interface TplCat {
  title: string;
  items: TplItem[];
}

const CATS: TplCat[] = [
  {
    title: "Onboarding · 3",
    items: [
      { id: "welcome", name: "Velkomst — ny spiller", meta: "Sendt · 42 ggr", count: "2,1k" },
      { id: "parent-invite", name: "Foreldre-tilgang invitasjon", meta: "Sendt · 38", count: "1,9k" },
      { id: "cocoach", name: "Co-coach onboarding", meta: "Utkast", count: "—" },
    ],
  },
  {
    title: "Periodisk · 6",
    items: [
      { id: "weekly", name: "Ukentlig rapport", meta: "Aktiv · auto · 12 mottakere", count: "624", active: true },
      { id: "monthly", name: "Månedlig progresjon", meta: "Aktiv · auto · 38 mott.", count: "152" },
      { id: "pre", name: "Pre-økt påminnelse", meta: "Auto · 24t før", count: "512" },
      { id: "post", name: "Etter-økt sammendrag", meta: "Auto · 30 min etter", count: "498" },
    ],
  },
  {
    title: "Fakturering · 3",
    items: [
      { id: "inv-month", name: "Faktura — månedlig", meta: "Auto · 1. hver mnd", count: "114" },
      { id: "inv-late", name: "Påminnelse — forfalt", meta: "Auto · +7d", count: "23" },
      { id: "inv-cancel", name: "Avslutning av abonnement", meta: "Manuell", count: "8" },
    ],
  },
];

const VARS = [
  { name: "{{spiller.fornavn}}", desc: "Spillerens fornavn" },
  { name: "{{spiller.epost}}", desc: "E-post" },
  { name: "{{ukenr}}", desc: "ISO uke-nr" },
  { name: "{{økter.gjennomført}}", desc: "Antall ukens økter" },
  { name: "{{økter.compliance}}", desc: "% av plan" },
  { name: "{{coach.kommentar}}", desc: "Agent-generert (Coach Agent)" },
  { name: "{{plan.neste.fokus}}", desc: "Neste ukes plan-fokus" },
];

export default function EmailTemplatesDemo() {
  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            CoachHQ · Maler · Ukentlig rapport
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Maler. <em className="font-normal italic">14 e-poster du sender ofte.</em>
          </h1>
          <p className="mt-3 max-w-[680px] text-[14px] text-muted-foreground">
            Bytt mal i listen. Rediger i midten. Send eller planlegg fra høyre side. Anders og Sara Pedersen har 14 aktive maler i CoachHQ.
          </p>
        </header>

        <div className="grid grid-cols-[260px_1fr_300px] items-start gap-5">
          {/* Mal-liste */}
          <aside className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-display text-[15px] font-semibold tracking-tight">Maler · 14</h3>
              <button className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:opacity-90">
                <Plus className="h-3 w-3" strokeWidth={2} />
                Ny
              </button>
            </div>
            <div className="border-b border-border p-3">
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-[12px] outline-none placeholder:text-muted-foreground"
                placeholder="Søk maler …"
              />
            </div>

            <div>
              {CATS.map((cat) => (
                <div key={cat.title}>
                  <div className="flex items-center justify-between bg-secondary/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {cat.title}
                  </div>
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 ${
                        item.active ? "bg-accent/15" : "hover:bg-secondary/30"
                      }`}
                    >
                      <span className={`h-8 w-1 rounded-full ${item.active ? "bg-primary" : "bg-secondary"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] font-medium text-foreground">{item.name}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{item.meta}</div>
                      </div>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{item.count}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          {/* Editor */}
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-display text-[20px] font-semibold tracking-tight">
                  Ukentlig rapport. <em className="font-normal italic text-muted-foreground">Aktiv · auto-sendt søndag 18:00.</em>
                </h2>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  Sist redigert 09. mai · v14 · Brukt 624 ggr
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#1A7D56]">Lagret · 2s siden</span>
                <button className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">Forhåndsvis</button>
                <button className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
                  Send test
                </button>
              </div>
            </div>

            <div className="flex border-b border-border">
              {["Editor", "HTML", "Variabler", "Mottakere · 12", "Historikk · 624"].map((tab, i) => (
                <button
                  key={tab}
                  className={`relative px-4 py-2.5 text-[12px] font-medium ${
                    i === 0
                      ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 p-5">
              <FieldRow label="Til" value="{{spiller.epost}}, {{foresatte.epost}}" mono />
              <FieldRow label="Emne" value="Ukens rapport for {{spiller.fornavn}} — uke {{ukenr}}" />
              <FieldRow label="Avsender" value="Sara Pedersen <sara@akgolf.no>" />

              <div className="mt-2 overflow-hidden rounded-md border border-border">
                <div className="flex items-center gap-1 border-b border-border bg-secondary/40 px-2 py-1.5">
                  <ToolBtn><Bold className="h-3.5 w-3.5" strokeWidth={1.5} /></ToolBtn>
                  <ToolBtn><Italic className="h-3.5 w-3.5" strokeWidth={1.5} /></ToolBtn>
                  <ToolBtn><Underline className="h-3.5 w-3.5" strokeWidth={1.5} /></ToolBtn>
                  <span className="mx-1 h-4 w-px bg-border" />
                  <ToolBtn><List className="h-3.5 w-3.5" strokeWidth={1.5} /></ToolBtn>
                  <ToolBtn><LinkIcon className="h-3.5 w-3.5" strokeWidth={1.5} /></ToolBtn>
                  <ToolBtn><ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} /></ToolBtn>
                  <span className="mx-1 h-4 w-px bg-border" />
                  <button className="rounded-sm bg-secondary px-2 py-1 text-[10px] font-medium text-foreground hover:bg-secondary/60">+ Variabel</button>
                  <button className="rounded-sm bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:opacity-90">+ Knapp</button>
                </div>
                <div className="bg-background p-5 font-display text-[14px] leading-relaxed text-foreground">
                  <p className="mb-3 font-semibold">
                    Hei <Var cursor>{`{{spiller.fornavn}}`}</Var>!
                  </p>
                  <p className="mb-3">
                    Her er sammendrag av uke <Var>{`{{ukenr}}`}</Var>. Du gjennomførte <Var>{`{{økter.gjennomført}}`}</Var> av{" "}
                    <Var>{`{{økter.planlagt}}`}</Var> økter — det er <Var>{`{{økter.compliance}}`}</Var>.
                  </p>
                  <blockquote className="mb-3 border-l-2 border-accent pl-3 italic text-muted-foreground">
                    «<Var>{`{{coach.kommentar}}`}</Var>»
                    <div className="mt-1 text-[11px] text-muted-foreground">— <Var>{`{{coach.navn}}`}</Var></div>
                  </blockquote>
                  <p className="mb-2 font-medium text-foreground">Neste uke:</p>
                  <p className="mb-4">
                    Fokus blir <Var>{`{{plan.neste.fokus}}`}</Var>. Første økt er <Var>{`{{plan.neste.først}}`}</Var>.
                  </p>
                  <button className="rounded-full bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground">
                    Se hele rapporten i appen
                  </button>
                  <p className="mt-4 text-[11px] text-muted-foreground">
                    Du får denne fordi du er aktiv spiller i GFGK. <span className="text-primary underline">Avregistrer</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="font-mono text-[11px] text-muted-foreground">624 ord · 14 variabler · est. 3,2 kB</span>
              <div className="flex gap-2">
                <button className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">Arkiver</button>
                <button className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
                  Lagre versjon 15
                </button>
              </div>
            </div>
          </div>

          {/* Side-panel */}
          <aside className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">Variabler</h3>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">14</span>
              </div>
              <div className="divide-y divide-border">
                {VARS.map((v) => (
                  <div key={v.name} className="grid grid-cols-[1fr_auto] gap-2 px-4 py-2.5">
                    <div>
                      <div className="font-mono text-[11px] text-foreground">{v.name}</div>
                      <div className="text-[10px] text-muted-foreground">{v.desc}</div>
                    </div>
                    <button className="self-center rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.04em] text-muted-foreground hover:bg-secondary">
                      Insert
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-4 py-2.5">
                <button className="text-[11px] font-medium text-primary hover:underline">Se alle 14</button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">Sending</h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">Siste 30d</span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                <SendStat label="Sendt" value="624" detail="12 mottakere" />
                <SendStat label="Åpnet" value="94 %" detail="587 / 624" ok />
                <SendStat label="Klikk CTA" value="62 %" detail="386 / 624" />
                <SendStat label="Bounces" value="0" detail="100 % deliv." />
              </div>
              <div className="divide-y divide-border border-t border-border">
                <SideRow label="Trigger" value={<code className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[11px]">cron: 0 18 * * 0</code>} />
                <SideRow label="Mottakere" value={<span>GFGK Pro · 12 spillere</span>} />
                <SideRow label="Neste sending" value={<span>Søn 17. mai · 18:00</span>} />
              </div>
              <div className="flex gap-2 border-t border-border p-3">
                <button className="flex-1 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
                  Send nå
                </button>
                <button className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">Pause</button>
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-accent/15 p-4 text-[12px] leading-relaxed text-muted-foreground">
              <strong className="font-medium text-primary">Coach Agent fyller {`{{coach.kommentar}}`}.</strong> Du kan overstyre per
              mottaker før sending — agentens tekst kommer da som forslag.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[80px_1fr] items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{label}</span>
      <input
        defaultValue={value}
        className={`w-full rounded-md border border-input bg-background px-3 py-1.5 text-[12px] text-foreground outline-none ${
          mono ? "font-mono text-primary" : ""
        }`}
      />
    </div>
  );
}

function ToolBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
      {children}
    </button>
  );
}

function Var({ children, cursor }: { children: React.ReactNode; cursor?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm bg-accent/40 px-1.5 py-0.5 font-mono text-[11px] text-accent-foreground ${
        cursor ? "ring-1 ring-primary" : ""
      }`}
    >
      {children}
    </span>
  );
}

function SendStat({ label, value, detail, ok }: { label: string; value: string; detail: string; ok?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">{label}</span>
      <span className={`font-mono text-[20px] font-medium tabular-nums ${ok ? "text-[#1A7D56]" : "text-foreground"}`}>{value}</span>
      <span className="font-mono text-[10px] text-muted-foreground">{detail}</span>
    </div>
  );
}

function SideRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{label}</span>
      <span className="text-[12px] font-medium text-foreground">{value}</span>
    </div>
  );
}
