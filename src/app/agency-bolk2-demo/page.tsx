"use client";

import { useState } from "react";
import { FilterPillBar, type FilterPill } from "@/components/athletic/filter-pill-bar";
import {
  InboxRow,
  BatchActionBar,
  InboxExpand,
  type InboxItem,
} from "@/components/admin/inbox/inbox-kit";
import {
  TestMatrix,
  LegendStrip,
  type TestColumn,
  type MatrixPlayer,
  type MatrixCellData,
} from "@/components/athletic/data/test-matrix";

// Bolk 2-demo (coach-arbeidsflyt): FilterPillBar + Inbox-kit + TestMatrix.

const pills: FilterPill[] = [
  { key: "all", label: "Alle", count: 4 },
  { key: "appr", label: "Godkjenning", count: 2, dotClass: "bg-accent" },
  { key: "req", label: "Forespørsel", count: 1, dotClass: "bg-info" },
  { key: "msg", label: "Melding", count: 1, dotClass: "bg-muted-foreground" },
  { key: "adv", label: "Råd", count: 0, dotClass: "bg-warning" },
];

const inbox: InboxItem[] = [
  { id: "1", type: "appr", name: "Markus R.P.", initials: "MR", avatarClass: "bg-primary text-accent", subject: "Plan-endring uke 22", preview: "Foreslår å bytte fre-økt til lørdag før Srixon Tour #2 · spørsmål om range-tilgang", when: "07:42", hasAttachment: true, severity: "hi", unread: true },
  { id: "2", type: "appr", name: "Sofie K.", initials: "SK", subject: "Plan B-utkast", preview: "Vil bytte til Plan B (turn-uke) før Nordic League · forhåndsvisning klar", when: "06:18", severity: "md", unread: true },
  { id: "3", type: "req", name: "Emilie B.", initials: "EB", subject: "Ekstra TrackMan-time", preview: "Kan jeg booke ekstra TrackMan-time tirsdag 14:00? Vil sjekke wedge etter gripp-bytte.", when: "05:55", severity: "lo", unread: true },
  { id: "4", type: "msg", name: "Karl Ludvig", initials: "KL", avatarClass: "bg-accent text-primary", subject: "Video fra runden i går", preview: "Sender video fra runden i går — ser noe på driveren, lavpunktet vandrer på random-mix", when: "i går", hasAttachment: true, severity: "lo" },
];

const columns: TestColumn[] = [
  { key: "cmj", name: "CMJ", unit: "cm", goal: "MÅL ≥ 50", axis: "fys" },
  { key: "sprint", name: "10 m sprint", unit: "sek", goal: "MÅL ≤ 1,75", axis: "fys" },
  { key: "chs", name: "Klubbhast.", unit: "m/s", goal: "MÅL ≥ 50", axis: "slag" },
  { key: "gir", name: "GIR-rate", unit: "% · 100 m", goal: "MÅL ≥ 60 %", axis: "spill" },
  { key: "score", name: "10-hull score", unit: "vs par", goal: "MÅL ≤ +2", axis: "spill" },
];

const players: MatrixPlayer[] = [
  { id: "mr", initials: "MR", name: "Markus R.P.", group: "WANG", sub: "KONK · BAK PLAN", avatarClass: "bg-primary text-accent", assign: { label: "Tildel", badge: 2 } },
  { id: "sk", initials: "SK", name: "Sofie K.", group: "GFGK", sub: "MOSJONIST · ØNSKER VEIL.", assign: { label: "Tildel" } },
  { id: "kl", initials: "KL", name: "Karl Ludvig", group: "AKA", sub: "ELIT · 12 CR.", avatarClass: "bg-accent text-primary", assign: { label: "Komplett", done: true } },
  { id: "eb", initials: "EB", name: "Emilie B.", group: "GFGK", sub: "KONK · TEST-UKE", assign: { label: "Tildel" } },
];

const CELLS: Record<string, Record<string, MatrixCellData>> = {
  mr: {
    cmj: { state: "over", value: "54", delta: { dir: "up", text: "+2" }, when: "14 D" },
    sprint: { state: "near", value: "1,78", delta: { dir: "flat", text: "±0" }, when: "14 D" },
    chs: { state: "over", value: "50,2", delta: { dir: "up", text: "+0,8" }, when: "7 D" },
    gir: { state: "under", value: "45 %", delta: { dir: "down", text: "−10" }, when: "21 D", overdue: true },
    score: { state: "under", value: "+5", delta: { dir: "down", text: "+2" }, when: "5 D" },
  },
  sk: {
    cmj: { state: "near", value: "48", delta: { dir: "up", text: "+3" }, when: "10 D" },
    sprint: { state: "near", value: "1,82", delta: { dir: "up", text: "−0,03" }, when: "10 D" },
    chs: { state: "untested", value: "—", when: "IKKE TESTET" },
    gir: { state: "over", value: "65 %", delta: { dir: "up", text: "+5" }, when: "3 D" },
    score: { state: "over", value: "+1", delta: { dir: "up", text: "−1" }, when: "3 D" },
  },
  kl: {
    cmj: { state: "over", value: "62", delta: { dir: "up", text: "+4" }, when: "5 D" },
    sprint: { state: "over", value: "1,68", delta: { dir: "up", text: "−0,05" }, when: "5 D" },
    chs: { state: "over", value: "52,8", delta: { dir: "up", text: "+1,2" }, when: "5 D" },
    gir: { state: "over", value: "75 %", delta: { dir: "up", text: "+10" }, when: "3 D" },
    score: { state: "testing", value: "PÅGÅR", when: "NÅ · HULL 6" },
  },
  eb: {
    cmj: { state: "over", value: "52", delta: { dir: "up", text: "+1" }, when: "2 D" },
    sprint: { state: "over", value: "1,72", delta: { dir: "up", text: "−0,02" }, when: "2 D" },
    chs: { state: "near", value: "47,4", delta: { dir: "up", text: "+0,6" }, when: "2 D" },
    gir: { state: "over", value: "68 %", delta: { dir: "up", text: "+8" }, when: "i går" },
    score: { state: "untested", value: "—", when: "PLANL. FRE" },
  },
};

export default function Bolk2Demo() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(["1", "2"]));
  const [expanded, setExpanded] = useState<string | null>("1");

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto w-[1180px] max-w-full space-y-8">
        <header>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            AgencyOS · Bolk 2-demo · coach-arbeidsflyt
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Innboks &amp; tester — <em className="font-normal italic text-primary">handlingskø</em>
          </h1>
        </header>

        {/* INNBOKS */}
        <section className="overflow-hidden rounded-[12px] border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">Innboks</span>
            <span className="font-mono text-[10px] font-bold text-destructive">4 ULEST · 2 VENTER GODKJENNING</span>
          </div>
          <div className="border-b border-border px-3 py-2.5">
            <FilterPillBar pills={pills} active={filter} onSelect={setFilter} />
          </div>
          <BatchActionBar
            count={selected.size}
            summary={`${selected.size} godkjenninger`}
            onClear={() => setSelected(new Set())}
          />
          {inbox.map((item) => (
            <div key={item.id}>
              <InboxRow
                item={item}
                selected={selected.has(item.id)}
                expanded={expanded === item.id}
                onToggleSelect={() => toggle(item.id)}
                onClick={() => setExpanded((e) => (e === item.id ? null : item.id))}
              />
              {expanded === item.id && item.id === "1" && (
                <InboxExpand
                  quoteHead="MARKUS R.P. · 28 MAI 07:42"
                  quoteText={
                    <>
                      Hei Andreas — vi har varslet kvalifisering for Srixon Tour <b>fredag morgen</b> i stedet for
                      ettermiddag, så jeg vil flytte <b>FRE 09:00 SLAG</b> til <b>LØR 10:00 SPILL</b> på Larvik. Godkjenn?
                    </>
                  }
                  was={{ label: "VAR PLANLAGT", axis: "slag", when: "FRE 30/5 · 09:00 → 10:00", desc: "Lengdekontroll 50–80 m · GFGK TM 3" }}
                  next={{ label: "FORESLÅTT", axis: "spill", when: "LØR 31/5 · 10:00 → 12:00", desc: "Recon-runde · Larvik GK · hull 1–9" }}
                />
              )}
            </div>
          ))}
        </section>

        {/* TESTER */}
        <section className="overflow-hidden rounded-[12px] border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">Tester-matrise</span>
            <span className="font-mono text-[10px] font-bold text-muted-foreground">4 SPILLERE · 5 TESTER</span>
            <span className="ml-auto"><LegendStrip /></span>
          </div>
          <TestMatrix columns={columns} players={players} cell={(pid, ck) => CELLS[pid]?.[ck]} />
        </section>
      </div>
    </div>
  );
}
