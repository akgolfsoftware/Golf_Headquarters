/**
 * DEMO — PlayerHQ Coach-notater (feed)
 * Spec: design2.0/06-playerhq-B/spec.md (Pakke 4/5)
 * URL: /coach-notes-demo
 *
 * Default state: Pro, lyst tema, full feed. Ingen sidebar/shell.
 */

import {
  Search,
  ChevronDown,
  ArrowUpRight,
  Calendar,
  Video,
  HelpCircle,
  MessageCircle,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

type NoteType = "Tilbakemelding" | "Plan" | "Spørsmål" | "Video-review";

type Note = {
  type: NoteType;
  date: string;
  time: string;
  body: string;
  link: string;
  linkIcon: "session" | "round" | "general";
};

const NOTES: Note[] = [
  {
    type: "Tilbakemelding",
    date: "11. mai 2026",
    time: "14:32",
    body: "Markus, pitch 75 m så veldig konsistent ut i dag. SD nede på 1,4 m — det er bedre enn de tre forrige øktene. Vi holder samme set-up neste uke og legger til 60 m som progresjon.",
    link: "Live-økt 11. mai · TEK 1:1",
    linkIcon: "session",
  },
  {
    type: "Plan",
    date: "9. mai 2026",
    time: "09:15",
    body: "Lagt ny plan «Sommer-toppform». Fase 3 starter mandag — TEK 40 % de neste tre ukene før vi taper ned mot Sørlandsåpent.",
    link: "Plan: Sommer-toppform",
    linkIcon: "general",
  },
  {
    type: "Video-review",
    date: "7. mai 2026",
    time: "20:14",
    body: "Sett gjennom driver-opptaket fra Borre. Hofterotasjon ligger fortsatt litt seint i nedsvingen. Prøv drillen jeg sendte — fokuser på «høyre kne stabilt» i forsvingen.",
    link: "Runde Borre 5. mai",
    linkIcon: "round",
  },
  {
    type: "Spørsmål",
    date: "6. mai 2026",
    time: "10:42",
    body: "Hvordan kjente du deg i hull 14 i går? Du fikk en bogey etter to gode slag — var det mental fokus eller var lien vanskelig?",
    link: "Runde Borre 5. mai",
    linkIcon: "round",
  },
  {
    type: "Tilbakemelding",
    date: "3. mai 2026",
    time: "15:08",
    body: "Bra jobbet med sandøvelsene i dag. Du tar nå standard sand-shot fra 15 m konsekvent innenfor 2 m. Klar for å gå opp i lengde til 30 m neste økt.",
    link: "Live-økt 3. mai · SLAG",
    linkIcon: "session",
  },
];

export default function CoachNotesDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[960px] px-8 py-10">
        <header className="mb-8">
          <button className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
            Min coach
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Coach · Notater
          </span>
          <h1 className="mt-2 font-display text-[36px] italic font-medium leading-[1.05] tracking-tight">
            12 notater fra Anders, Markus.
          </h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Sist: i dag 14:32 · 3 nye denne uka
          </p>
        </header>

        {/* Sticky filter-bar */}
        <div className="sticky top-0 z-10 mb-6 -mx-2 rounded-lg border border-border bg-background/95 px-2 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={14}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Søk i notater …"
                className="w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-[13px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <FilterChip label="Type" value="Alle" />
            <FilterChip label="Knyttet til" value="Alle" />
            <FilterChip label="Periode" value="Siste 30 d" />
            <FilterChip label="Sort" value="Nyeste" />
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {NOTES.map((n, i) => (
            <NoteCard key={i} note={n} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, value }: { label: string; value: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
      <span className="text-muted-foreground">{label}:</span>
      <span>{value}</span>
      <ChevronDown size={12} strokeWidth={1.5} />
    </button>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <article className="rounded-lg border border-border bg-card p-6 transition-shadow hover:-translate-y-0.5 hover:shadow-md">
      <header className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-mono text-[12px] font-semibold text-primary-foreground">
          AK
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold leading-none">Anders Kristiansen</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              · {note.date} · {note.time}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Hovedcoach</div>
        </div>
        <TypePill type={note.type} />
      </header>

      <p className="mt-4 line-clamp-3 text-[15px] leading-[1.6] text-foreground">
        {note.body}
      </p>

      <footer className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <LinkIcon kind={note.linkIcon} />
          {note.link}
        </span>
        <button className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground hover:underline">
          Les mer
          <ArrowUpRight size={12} strokeWidth={1.5} />
        </button>
      </footer>
    </article>
  );
}

function TypePill({ type }: { type: NoteType }) {
  const map: Record<NoteType, { bg: string; icon: React.ReactNode }> = {
    Tilbakemelding: {
      bg: "bg-primary/10 text-primary",
      icon: <MessageCircle size={11} strokeWidth={1.5} />,
    },
    Plan: {
      bg: "bg-accent/30 text-foreground",
      icon: <ClipboardList size={11} strokeWidth={1.5} />,
    },
    Spørsmål: {
      bg: "bg-[#FFF0D6] text-[#B8852A]",
      icon: <HelpCircle size={11} strokeWidth={1.5} />,
    },
    "Video-review": {
      bg: "bg-destructive/10 text-destructive",
      icon: <Video size={11} strokeWidth={1.5} />,
    },
  };
  const { bg, icon } = map[type];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${bg}`}>
      {icon}
      {type}
    </span>
  );
}

function LinkIcon({ kind }: { kind: Note["linkIcon"] }) {
  if (kind === "session") return <Calendar size={12} strokeWidth={1.5} />;
  if (kind === "round") return <ClipboardList size={12} strokeWidth={1.5} />;
  return <MessageCircle size={12} strokeWidth={1.5} />;
}
