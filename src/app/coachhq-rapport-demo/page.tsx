/**
 * CoachHQ — Coach-rapport · klubb-styret
 * Bygd fra wireframe/design-files-v2/screens/61-coachhq-coach-rapport.html
 * URL: /coachhq-rapport-demo
 */

import { Download, Send, Check } from "lucide-react";

type RowTone = "up" | "dn" | "neutral";
type TableRow = {
  tier: string;
  tierSub: string;
  players: string;
  perMonth: string;
  total: string;
  prev: string;
  delta: string;
  deltaTone: RowTone;
};

const revenueRows: TableRow[] = [
  { tier: "Pro", tierSub: "1 200 kr/mnd", players: "11", perMonth: "1 200", total: "13 200", prev: "12 000", delta: "+10 %", deltaTone: "up" },
  { tier: "Basic", tierSub: "700 kr/mnd", players: "7", perMonth: "700", total: "4 900", prev: "5 600", delta: "−12 %", deltaTone: "dn" },
  { tier: "Sesjoner", tierSub: "privat 800/økt", players: "—", perMonth: "—", total: "62 400", prev: "53 600", delta: "+16 %", deltaTone: "up" },
  { tier: "Video-review", tierSub: "add-on 300/økt", players: "—", perMonth: "—", total: "5 400", prev: "3 600", delta: "+50 %", deltaTone: "up" },
  { tier: "On-course (live)", tierSub: "1 800/dag", players: "—", perMonth: "—", total: "14 400", prev: "7 200", delta: "+100 %", deltaTone: "up" },
  { tier: "Klubb-avtaler", tierSub: "fast", players: "2", perMonth: "—", total: "42 000", prev: "38 000", delta: "+10 %", deltaTone: "up" },
];

type WwItem = { title: string; body: string; sub: string; todo?: boolean };

const wins: WwItem[] = [
  {
    title: "3 milepæler i porteføljen",
    body: "Markus Roinås P. (HCP +2,4), Eira H. (scratch), Mathilde B. (Pro-signering).",
    sub: "Mål-framdrift snitt +4 % vs mars",
  },
  {
    title: "Foreldre-NPS +62",
    body: "Sterk respons på den nye ukerapport-flowen. Mottok 18 uoppfordra positive svar.",
    sub: "Måling: post-økt mini-survey",
  },
  {
    title: "Video-review-rutine formalisert",
    body: "Agent-mal sender review-utkast innen 24 t etter sesjon. Adoption: 11 av 18 spillere.",
    sub: "Plan: 100 % innen utgangen av mai",
  },
  {
    title: "1 risk-spiller — Jonas N.",
    body: "Henger etter HCP-mål og kommunikasjon. Tatt opp med foreldre 13.05. Plan: redusere volum, mental fokus.",
    sub: "Eskaler om ikke bedring innen 4 uker",
    todo: true,
  },
  {
    title: "Trener-ressurs U16",
    body: "Voksende U16-gruppe (7 spillere) krever assistanse juni–august. Forslag: deltids-trener 30 %.",
    sub: "Estimert kostnad 48k for sommeren",
    todo: true,
  },
];

export default function CoachHqRapportDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          CoachHQ · Rapport · April 2026
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Månedsrapport <em className="italic text-primary">· april 2026.</em>
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Utkast generert 30.04 · klar til gjennomgang før utsendelse 02.05.
        </p>
      </header>

      {/* Actions bar */}
      <div className="mb-5 flex items-center justify-between gap-4 rounded-md bg-gradient-to-br from-[#1A1916] to-[#2a2823] px-5 py-3.5 text-white">
        <div className="flex items-center gap-4">
          <div className="h-2 w-2 rounded-full bg-[#1A7D56]" />
          <div>
            <b className="block font-display text-[14px] font-semibold">Status: utkast — klar for review</b>
            <small className="mt-0.5 block font-mono text-[11px] tracking-[0.02em] text-white/55">
              Generert av rapport-agent v3.1 · 30.04 06:30 · 4 redigeringer av Anders
            </small>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-sm border border-white/20 bg-transparent px-3 py-1.5 text-[12px] font-medium">
            <Download size={14} strokeWidth={1.5} />
            Last ned PDF
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-sm border border-white/20 bg-transparent px-3 py-1.5 text-[12px] font-medium">
            <Send size={14} strokeWidth={1.5} />
            Send til styret
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-3 py-1.5 text-[12px] font-medium text-[#0A1F18]">
            <Check size={14} strokeWidth={1.5} />
            Godkjenn og publiser
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="mb-5 grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center gap-5 rounded-md border border-border bg-card px-6 py-5">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
            Coach-rapport · April 2026
          </span>
          <h2 className="mt-1 font-display text-[22px] font-medium leading-tight tracking-tight">
            GFGK · Anders Kristiansen.
          </h2>
          <div className="mt-1 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
            Hovedcoach junior · 18 aktive spillere · rapport-periode 01.04 – 30.04
          </div>
        </div>
        <Metric label="Aktive spillere" value="18" delta="+2" det="14 GFGK + 4 Borre" />
        <Metric label="Sesjoner gj.ført" value="78" delta="+12" det="18 video · 52 range · 8 on-course" />
        <Metric label="Omsetning" value="142k" delta="+18 %" det="vs mars · NOK · ekskl. mva" />
      </div>

      <Panel title="Sammendrag" sub="generert · redigert av AK">
        <div className="text-[14px] leading-relaxed">
          <p className="mb-2.5">
            April var en <em className="not-italic font-medium text-primary">sterk måned for U18-laget</em>, med tre milepæler i porteføljen (Markus Roinås P. nådde HCP +2,4, Eira H. krysset scratch, Mathilde B. signerte Pro-tier). Vi tok inn to nye spillere — Daniel M. (U16) og Sofie R. (U18) — og distribusjonen er nå 11 Pro / 7 Basic.
          </p>
          <p className="mb-2.5">
            Coachende tid per spiller økte med <em className="not-italic font-medium text-primary">0,8 timer/uke i snitt</em>, primært drevet av video-review-rutinen som rapport-agenten har formalisert (se vedlegg 2). Foreldre-respons er meget høy, NPS +62 mot bransje-snitt +24.
          </p>
          <p>
            <b className="font-semibold">Beslutningssaker til styret:</b> (1) ekstra trener-ressurs til U16-gruppen for juni–august, (2) sponsorat-spørsmål fra Titleist for Markus Roinås P., (3) re-forhandling av Borre-avtalen før 1. juli.
          </p>
        </div>
      </Panel>

      <div className="mt-5 grid grid-cols-2 gap-5">
        <Panel title="Sesong-framdrift · portefølje" sub="mål-snitt mai-status">
          <ProgressionChart />
        </Panel>

        <Panel title="Hva gikk bra · hva gjenstår">
          <div className="flex flex-col gap-2">
            {wins.map((w) => (
              <div
                key={w.title}
                className={`rounded-r-sm border-l-[3px] px-3.5 py-3 text-[13px] leading-relaxed ${w.todo ? "border-[#B8852A] bg-[rgba(184,133,42,0.06)]" : "border-primary bg-[var(--surface-alt,#F1EEE5)]"}`}
              >
                <b className="mb-1 block font-semibold">{w.title}</b>
                {w.body}
                <small className="mt-1.5 block font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{w.sub}</small>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5">
        <Panel title="Omsetning per tier" sub="NOK · ekskl. mva">
          <RevenueTable rows={revenueRows} />
        </Panel>

        <Panel title="Foreldre-NPS og tilbakemelding">
          <div className="mb-3 flex items-center gap-4.5 rounded-sm bg-[var(--surface-alt,#F1EEE5)] p-3.5">
            <div className="font-display text-[46px] font-medium leading-none tracking-tight text-[#1A7D56]">+62</div>
            <div className="flex-1 text-[12px] leading-relaxed text-muted-foreground">
              <b className="block text-[13px] font-semibold text-foreground">NPS · april 2026</b>
              14 respondenter (78 % svarrate). Bransje-snitt golf-coach +24. Mars-NPS +51.
            </div>
          </div>
          <Quote
            text="Anders fanger detaljer i Markus' spill som vi som foreldre aldri ville sett. Ukerapportene gir oss noe å snakke om hjemme."
            who="Inger Pedersen · mor Markus"
          />
          <Quote
            text="Eira gleder seg til hver økt nå. Det å se progresjon i appen er motiverende."
            who="Erlend Hopstad · far Eira"
          />
          <Quote
            text="Veldig fornøyd med raskt svar når vi har spørsmål. Føler oss inkludert som foreldre."
            who="Anonymisert · U16-foreldre"
          />
        </Panel>
      </div>
    </div>
  );
}

function Metric({ label, value, delta, det }: { label: string; value: string; delta: string; det: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-[26px] font-medium leading-none tracking-tight">
        {value}
        <small className="ml-1 font-mono text-[11px] font-medium tracking-[0.02em] text-[#1A7D56]">{delta}</small>
      </span>
      <span className="font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{det}</span>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-card px-5 py-5">
      <h3 className="mb-3.5 flex items-baseline justify-between font-display text-[14px] font-semibold tracking-tight">
        {title}
        {sub && (
          <small className="font-mono text-[10px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
            {sub}
          </small>
        )}
      </h3>
      {children}
    </section>
  );
}

function ProgressionChart() {
  const months = [
    { label: "Jan", x: 40, p1: { y: 60, h: 100 }, p2: { y: 40, h: 120 } },
    { label: "Feb", x: 95, p1: { y: 55, h: 105 }, p2: { y: 34, h: 126 } },
    { label: "Mar", x: 150, p1: { y: 45, h: 115 }, p2: { y: 28, h: 132 } },
    { label: "Apr", x: 205, p1: { y: 40, h: 120 }, p2: { y: 22, h: 138 } },
    { label: "Mai (proj)", x: 260, p1: { y: 35, h: 125 }, p2: { y: 20, h: 140 }, future: true },
  ];
  return (
    <div className="h-[200px] rounded-sm bg-[var(--surface-alt,#F1EEE5)] p-3.5">
      <svg viewBox="0 0 360 200" preserveAspectRatio="none" className="h-full w-full">
        <line x1="0" y1="30" x2="360" y2="30" stroke="#E5E3DD" strokeWidth="1" />
        <line x1="0" y1="70" x2="360" y2="70" stroke="#E5E3DD" strokeWidth="1" />
        <line x1="0" y1="110" x2="360" y2="110" stroke="#E5E3DD" strokeWidth="1" />
        <line x1="0" y1="150" x2="360" y2="150" stroke="#E5E3DD" strokeWidth="1" />
        <text x="2" y="34" className="fill-muted-foreground font-mono text-[9px]">100 %</text>
        <text x="2" y="74" className="fill-muted-foreground font-mono text-[9px]">75</text>
        <text x="2" y="114" className="fill-muted-foreground font-mono text-[9px]">50</text>
        <text x="2" y="154" className="fill-muted-foreground font-mono text-[9px]">25</text>
        {months.map((m) => (
          <g key={m.label} transform={`translate(${m.x},0)`}>
            <rect x="0" y={m.p1.y} width="22" height={m.p1.h} rx="2" fill="#005840" opacity={m.future ? 0.6 : 1} />
            <rect x="22" y={m.p2.y} width="22" height={m.p2.h} rx="2" fill="#D1F843" opacity={m.future ? 0.6 : 1} />
            <text x="22" y="175" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">{m.label}</text>
          </g>
        ))}
        <g transform="translate(310,30)">
          <rect x="0" y="0" width="10" height="10" rx="2" fill="#005840" />
          <text x="14" y="9" className="fill-muted-foreground font-mono text-[9px]">på sporet</text>
          <rect x="0" y="18" width="10" height="10" rx="2" fill="#D1F843" />
          <text x="14" y="27" className="fill-muted-foreground font-mono text-[9px]">+ milepæl</text>
        </g>
      </svg>
    </div>
  );
}

function RevenueTable({ rows }: { rows: TableRow[] }) {
  const deltaClass = (t: RowTone) =>
    t === "up" ? "text-[#1A7D56] font-semibold" : t === "dn" ? "text-[#B8852A] font-semibold" : "";
  return (
    <div className="overflow-hidden rounded-sm border border-border">
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr] bg-[var(--surface-alt,#F1EEE5)] font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <div className="border-b border-border p-3">Tier</div>
        <div className="border-b border-border p-3 text-right">Spillere</div>
        <div className="border-b border-border p-3 text-right">Snitt/mnd</div>
        <div className="border-b border-border p-3 text-right">Apr-total</div>
        <div className="border-b border-border p-3 text-right">Mar</div>
        <div className="border-b border-border p-3 text-right">∆</div>
      </div>
      {rows.map((r) => (
        <div key={r.tier} className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr]">
          <div className="border-b border-border p-3 text-[13px] font-medium">
            {r.tier}
            <small className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{r.tierSub}</small>
          </div>
          <div className="border-b border-border p-3 text-right font-mono text-[12px]">{r.players}</div>
          <div className="border-b border-border p-3 text-right font-mono text-[12px]">{r.perMonth}</div>
          <div className="border-b border-border p-3 text-right font-mono text-[12px]">{r.total}</div>
          <div className="border-b border-border p-3 text-right font-mono text-[12px]">{r.prev}</div>
          <div className={`border-b border-border p-3 text-right font-mono text-[12px] ${deltaClass(r.deltaTone)}`}>{r.delta}</div>
        </div>
      ))}
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr] bg-foreground text-white">
        <div className="p-3 text-[13px] font-semibold">
          Total<small className="mt-0.5 block font-mono text-[10px] text-white/55">april 2026</small>
        </div>
        <div className="p-3 text-right font-mono text-[12px] font-semibold">18</div>
        <div className="p-3 text-right font-mono text-[12px] font-semibold">—</div>
        <div className="p-3 text-right font-mono text-[12px] font-semibold">142 300</div>
        <div className="p-3 text-right font-mono text-[12px] font-semibold">120 000</div>
        <div className="p-3 text-right font-mono text-[12px] font-semibold">+18,6 %</div>
      </div>
    </div>
  );
}

function Quote({ text, who }: { text: string; who: string }) {
  return (
    <div className="mb-2 rounded-r-sm border-l-[3px] border-accent bg-[var(--surface-alt,#F1EEE5)] px-4 py-3.5 text-[13px] italic leading-relaxed">
      &quot;{text}&quot;
      <span className="mt-1.5 block font-mono text-[10px] not-italic tracking-[0.04em] text-muted-foreground">
        — {who}
      </span>
    </div>
  );
}
