/**
 * PlayerHQ — Mål & milepæler
 * Bygd fra wireframe/design-files-v2/screens/54-playerhq-mal-milepaeler.html
 * URL: /playerhq-milepaeler-demo
 */

import { Calendar, Check, AlertTriangle } from "lucide-react";

type Cat = "teknisk" | "fysisk" | "mental" | "konkurranse";

type Milestone = { done: boolean; text: string; when?: string };

type Goal = {
  cat: Cat;
  title: string;
  meta: string;
  progress: number;
  startLabel: string;
  nowLabel: string;
  goalLabel: string;
  warn?: boolean;
  milestones: Milestone[];
  note: {
    author: string;
    date: string;
    text: string;
    warn?: boolean;
  };
};

const goals: Goal[] = [
  {
    cat: "teknisk",
    title: "Strokes Gained Approach > +0,40",
    meta: "område: 100–175 m · måling: shotzone-data fra Live Tapper",
    progress: 72,
    startLabel: "start −0,15",
    nowLabel: "nå +0,29",
    goalLabel: "mål +0,40",
    milestones: [
      { done: true, text: "Iron-fitting m/ TrackMan hos GFGK", when: "18.03" },
      { done: true, text: "10 økter approach-blokk 100/125/150 m", when: "apr" },
      { done: true, text: "SG approach > 0 over 5 sammenhengende runder", when: "04.05" },
      { done: false, text: "Hold +0,30 i 8 runder på rad · 3 av 8 OK", when: "mål 30.06" },
    ],
    note: {
      author: "Coach Anders",
      date: "09.05",
      text: "Treffer veldig fint på 125 m. Vi fortsetter med distanse-kontroll-blokken — fokus på 145 m i denne ukens økt.",
    },
  },
  {
    cat: "konkurranse",
    title: "Kvalifisere til NM Q-school R3",
    meta: "krever topp 30 etter R2 · cut +5",
    progress: 50,
    startLabel: "R1 ikke startet",
    nowLabel: "i posisjon",
    goalLabel: "R3 23.05.26",
    milestones: [
      { done: true, text: "Påmeldt R1 · 20.05 Larvik GK", when: "bekreftet" },
      { done: true, text: "BankID-samtykke fullført", when: "18.04" },
      { done: false, text: "R1 spilles 20.05 · score under 74 (cut-projeksjon)" },
      { done: false, text: "R2 spilles 21.05 · holde +5 over 36 hull" },
      { done: false, text: "R3 22.05 · topp 30 = ferdig" },
    ],
    note: {
      author: "Coach Anders",
      date: "11.05",
      text: "Du er i god form. Spill din vanlige plan på par-5 — ikke jakt birdies du ikke har. R2 vil avgjøre.",
    },
  },
  {
    cat: "fysisk",
    title: "Bygge konsistent gym-rutine · 3 økter / uke",
    meta: "styrke (2) + mobilitet (1) · 12 uker",
    progress: 58,
    startLabel: "uke 1",
    nowLabel: "7 av 12 uker fullført",
    goalLabel: "uke 12",
    warn: true,
    milestones: [
      { done: true, text: "Onboarding m/ fysioterapeut Mia", when: "22.03" },
      { done: true, text: "5 uker på rad · 3+ økter", when: "22.03–25.04" },
      { done: false, text: "Hopp tilbake til 3+/uke · siste 2 uker bare 2 økter", when: "mål denne uka" },
      { done: false, text: "12 sammenhengende uker · re-måling styrke 14.06" },
    ],
    note: {
      author: "Fysio Mia",
      date: "10.05",
      text: "Ser at gym-økter falt i de to siste ukene. Det henger nok sammen med høyt turneringsuttak — la oss prate i dag for å justere uken.",
      warn: true,
    },
  },
  {
    cat: "mental",
    title: "Pre-shot rutine · 100 % av tee-shots",
    meta: "selv-vurdering etter hver runde · score 1–5",
    progress: 84,
    startLabel: "start 3,2/5",
    nowLabel: "nå 4,4/5",
    goalLabel: "mål 4,8/5",
    milestones: [
      { done: true, text: "Definert egen 5-stegs rutine m/ mental-coach", when: "feb" },
      { done: true, text: "10 runder > 4/5", when: "14 av 18 oppnådd" },
      { done: false, text: "Snitt 4,8/5 over 5 runder · siste 5: 4,4 / 4,6 / 4,2 / 4,8 / 4,6" },
      { done: false, text: "Spille en hel runde uten brudd · ikke oppnådd ennå" },
    ],
    note: {
      author: "Mental-coach Solveig",
      date: "04.05",
      text: "Tydelig forbedring under press. Bryt ned hva som gikk galt på hull 12 i siste R3 — sannsynligvis hastet rutinen.",
    },
  },
];

const achievements = [
  { ic: "66", t: "Personlig rekord", sub: "Bærum GK · 04.05 · −5", locked: false },
  { ic: "SG", t: "SG approach > 0 i 5 rader", sub: "oppnådd 04.05", locked: false },
  { ic: "10", t: "10 runder under HCP", sub: "10 av 12 mål", locked: false },
  { ic: "+0,5", t: "HCP +0,5", sub: "Låses opp ved hovedmål", locked: true },
  { ic: "NM", t: "Q-school R3", sub: "Låses opp 22.05", locked: true },
  { ic: "12u", t: "12 uker gym", sub: "7 av 12", locked: true },
];

export default function PlayerHqMilepaelerDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Mål
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Hovedmål <em className="italic text-primary">· sesong 2026.</em>
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Komme ned i HCP +0,5 og kvalifisere til NM Q-school R3. Coach: Anders Kristiansen · sist oppdatert 12. mai.
        </p>
      </header>

      {/* Goal-hero */}
      <section className="mb-6 grid grid-cols-[1.4fr_1fr] items-center gap-8 rounded-2xl border border-border bg-card p-8">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
            Hovedmål · 2026
          </div>
          <h2 className="mt-1.5 font-display text-[28px] font-medium leading-[1.15] tracking-tight">
            HCP <em className="italic text-primary">+0,5</em> innen sesongslutt 31.10.26.
          </h2>
          <p className="mt-2.5 text-[13px] leading-[1.55] text-muted-foreground">
            Mål satt sammen med Anders K. på sesongstart-samtale 12.03. Krever konsistens på par-3 hull (SG +0,3),
            gjennomsnitt 70,5, og at 12 av 16 runder spilles inn under HCP.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-sm bg-[rgba(184,133,42,0.10)] px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.04em] text-[#6F500B]">
            <Calendar size={14} strokeWidth={1.5} />
            23 uker igjen · neste milepæl 25.05
          </div>
        </div>
        <div className="flex flex-col items-center gap-3.5">
          <div className="relative h-[180px] w-[180px]">
            <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="90" cy="90" r="75" fill="none" stroke="#E5E3DD" strokeWidth="14" />
              <circle
                cx="90"
                cy="90"
                r="75"
                fill="none"
                stroke="url(#mp-grad)"
                strokeWidth="14"
                strokeDasharray="471"
                strokeDashoffset="160"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="mp-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#005840" />
                  <stop offset="1" stopColor="#1A7D56" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-[46px] font-medium leading-none tracking-tight">66 %</div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                til hovedmål
              </div>
            </div>
          </div>
          <div className="flex gap-3.5 font-mono text-[10px] text-muted-foreground">
            <span>start +3,2</span>
            <span>nå +2,4</span>
            <span>mål +0,5</span>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-4">
        {goals.map((g) => (
          <GoalCard key={g.title} goal={g} />
        ))}
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-3 font-display text-[14px] font-semibold tracking-tight">Achievements · sesong 2026</h3>
        <div className="flex flex-wrap gap-2.5">
          {achievements.map((a) => (
            <div
              key={a.t}
              className={`flex flex-1 items-center gap-2.5 rounded-sm border border-border bg-card p-3 ${a.locked ? "opacity-55" : ""}`}
              style={{ minWidth: 200 }}
            >
              <div
                className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-sm font-display text-[14px] font-semibold ${a.locked ? "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground" : "bg-gradient-to-br from-[#005840] to-[#1A7D56] text-accent"}`}
              >
                {a.ic}
              </div>
              <div>
                <div className="text-[13px] font-semibold leading-tight">{a.t}</div>
                <small className="mt-1 block font-mono text-[10px] text-muted-foreground">{a.sub}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const catStyle: Record<Cat, string> = {
    teknisk: "bg-primary/10 text-primary",
    fysisk: "bg-[rgba(184,133,42,0.12)] text-[#7d5814]",
    mental: "bg-[rgba(176,68,68,0.10)] text-[#7a3232]",
    konkurranse: "bg-primary/10 text-primary",
  };

  return (
    <article className="relative flex flex-col gap-3 overflow-hidden rounded-sm border border-border bg-card p-5">
      <div>
        <span className={`inline-block rounded-sm px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.10em] ${catStyle[goal.cat]}`}>
          {goal.cat}
        </span>
        <h4 className="mt-2 font-display text-[16px] font-semibold leading-tight tracking-tight">{goal.title}</h4>
        <div className="mt-1 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{goal.meta}</div>
      </div>

      <div className="flex flex-col gap-2 rounded-sm bg-[var(--surface-alt,#F1EEE5)] px-3 py-2.5">
        <div className="relative h-2 overflow-hidden rounded-sm bg-border">
          <div
            className={`h-full rounded-sm ${goal.warn ? "bg-[#B8852A]" : "bg-primary"}`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>{goal.startLabel}</span>
          <b className={`font-semibold ${goal.warn ? "text-[#B8852A]" : "text-foreground"}`}>{goal.nowLabel}</b>
          <span>{goal.goalLabel}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {goal.milestones.map((m, i) => (
          <div key={i} className={`flex items-start gap-2 text-[12px] leading-snug ${m.done ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
            <span
              className={`mt-0.5 grid h-3.5 w-3.5 flex-shrink-0 place-items-center rounded-sm border-[1.5px] ${m.done ? "border-[#1A7D56] bg-[#1A7D56] text-white" : "border-muted-foreground"}`}
            >
              {m.done && <Check size={9} strokeWidth={3} />}
            </span>
            <div>
              <b className="font-medium text-foreground">{m.text}</b>
              {m.when && <span className="ml-1 font-mono text-[10px] text-muted-foreground">· {m.when}</span>}
            </div>
          </div>
        ))}
      </div>

      <div
        className={`rounded-r-sm border-l-[3px] p-3 text-[12px] italic leading-relaxed ${goal.note.warn ? "border-[#B8852A] bg-[rgba(184,133,42,0.10)] text-muted-foreground" : "border-accent bg-[rgba(225,206,123,0.20)] text-muted-foreground"}`}
      >
        <b className="mb-0.5 block font-mono text-[10px] not-italic font-semibold uppercase tracking-[0.04em] text-foreground">
          {goal.note.warn && <AlertTriangle size={10} strokeWidth={1.5} className="mr-1 inline" />}
          {goal.note.author} · {goal.note.date}
        </b>
        {goal.note.text}
      </div>
    </article>
  );
}
