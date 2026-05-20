/**
 * PlayerHQ · Coach · Notater (P2)
 *
 * Listevisning av alle notater fra coach, egne notater og spørsmål/svar.
 * Dato-grupperte rader med filter-chips øverst.
 * Hardkodet eksempel-data — wires opp mot Prisma i senere fase.
 */
import Link from "next/link";
import {
  ChevronRight,
  MessageSquare,
  NotebookPen,
  HelpCircle,
  Filter,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

type NotatType = "coach" | "egen" | "qa";
type Filter = "alle" | NotatType;

type Notat = {
  id: string;
  type: NotatType;
  tittel: string;
  preview: string;
  forfatter: string;
  initialer: string;
  dato: string; // ISO
  tags: string[];
};

const NOTATER: Notat[] = [
  {
    id: "n-001",
    type: "coach",
    tittel: "Pitch-konsistens: 50–100m fra fairway",
    preview:
      "Du sliter med høyre-miss på pitches mellom 50 og 100 meter. Vi setter fokus på roterende underkropp og venstre arm-kontroll de neste to ukene.",
    forfatter: "Anders Kristiansen",
    initialer: "AK",
    dato: "2026-05-19T09:30:00Z",
    tags: ["TEK", "SLAG", "pitch"],
  },
  {
    id: "n-002",
    type: "egen",
    tittel: "Mental forberedelse før kvalifisering",
    preview:
      "Notat til meg selv: pre-shot routine på 12 sekunder, dyp pust før hver tee, ikke ankre på sist runde.",
    forfatter: "Du",
    initialer: "ME",
    dato: "2026-05-18T20:15:00Z",
    tags: ["MEN", "rutine"],
  },
  {
    id: "n-003",
    type: "qa",
    tittel: "Hvorfor mister jeg distanse på driver i kaldt vær?",
    preview:
      "Coach-svar: ballhastighet faller ca 1.5%/10°C kjøligere. Ballen blir hardere og spinner mer. Bytt til lavspinn-ball på vintertrening.",
    forfatter: "AK svart",
    initialer: "AK",
    dato: "2026-05-17T14:00:00Z",
    tags: ["UTSTYR", "driver", "kald"],
  },
  {
    id: "n-004",
    type: "coach",
    tittel: "Putting-rutine: distanse-kontroll fra 6–12m",
    preview:
      "Du har gått fra 1.92 putts/hull til 1.78 siste 4 runder. Hold fokus på tempo og les av brett før hver putt.",
    forfatter: "Anders Kristiansen",
    initialer: "AK",
    dato: "2026-05-15T10:00:00Z",
    tags: ["PUTT", "lag-putt"],
  },
  {
    id: "n-005",
    type: "egen",
    tittel: "Trackman-økt: 7-jern observasjoner",
    preview:
      "Smash factor 1.39 (mål 1.42). Klubbhastighet OK, men angrep -2.1° — trenger flatere bunn av sving.",
    forfatter: "Du",
    initialer: "ME",
    dato: "2026-05-12T16:45:00Z",
    tags: ["TRACKMAN", "data"],
  },
  {
    id: "n-006",
    type: "qa",
    tittel: "Hvor mye chip-trening anbefaler du daglig?",
    preview:
      "Coach-svar: 15 minutter daglig er bedre enn 90 minutter to ganger i uka. Fokuser på variasjon i lengder, ikke volum.",
    forfatter: "AK svart",
    initialer: "AK",
    dato: "2026-05-10T08:20:00Z",
    tags: ["SHORT-GAME", "chip"],
  },
];

const FILTRE: { id: Filter; navn: string; antall: number }[] = [
  { id: "alle", navn: "Alle", antall: NOTATER.length },
  {
    id: "coach",
    navn: "Coach-notater",
    antall: NOTATER.filter((n) => n.type === "coach").length,
  },
  {
    id: "egen",
    navn: "Egne",
    antall: NOTATER.filter((n) => n.type === "egen").length,
  },
  {
    id: "qa",
    navn: "Spørsmål-svar",
    antall: NOTATER.filter((n) => n.type === "qa").length,
  },
];

function ikonForType(type: NotatType) {
  if (type === "coach") return MessageSquare;
  if (type === "egen") return NotebookPen;
  return HelpCircle;
}

function labelForType(type: NotatType) {
  if (type === "coach") return "Coach-notat";
  if (type === "egen") return "Eget notat";
  return "Spørsmål-svar";
}

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function gruppeKey(iso: string): string {
  const d = new Date(iso);
  const i_dag = new Date();
  const i_gar = new Date(i_dag);
  i_gar.setDate(i_dag.getDate() - 1);
  if (d.toDateString() === i_dag.toDateString()) return "I dag";
  if (d.toDateString() === i_gar.toDateString()) return "I går";
  const diffDays = Math.floor(
    (i_dag.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 7) return "Denne uka";
  if (diffDays < 30) return "Denne måneden";
  return "Eldre";
}

export default async function NotaterListe({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requirePortalUser();
  const sp = await searchParams;
  const aktivt: Filter =
    sp?.filter === "coach" ||
    sp?.filter === "egen" ||
    sp?.filter === "qa" ||
    sp?.filter === "alle"
      ? sp.filter
      : "alle";

  const filtrert =
    aktivt === "alle" ? NOTATER : NOTATER.filter((n) => n.type === aktivt);

  // Grupper etter dato
  const grupper = new Map<string, Notat[]>();
  for (const n of filtrert) {
    const key = gruppeKey(n.dato);
    const liste = grupper.get(key) ?? [];
    liste.push(n);
    grupper.set(key, liste);
  }
  const rekkefolge = ["I dag", "I går", "Denne uka", "Denne måneden", "Eldre"];

  return (
    <div className="space-y-6 pb-20 md:space-y-8 md:pb-0">
      <PageHeader
        eyebrow="PlayerHQ · Coach · Notater"
        titleLead="Alle dine"
        titleItalic="notater"
        sub="Coach-tilbakemeldinger, egne refleksjoner og spørsmål-svar samlet ett sted."
        actions={
          <Link
            href="/portal/coach/notater/ny"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus size={16} strokeWidth={1.75} />
            Nytt notat
          </Link>
        }
      />

      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <Filter size={12} strokeWidth={1.75} />
          Filter
        </span>
        {FILTRE.map((f) => {
          const aktiv = f.id === aktivt;
          return (
            <Link
              key={f.id}
              href={f.id === "alle" ? "/portal/coach/notater" : `/portal/coach/notater?filter=${f.id}`}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors ${
                aktiv
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              {f.navn}
              <span
                className={`font-mono text-[10px] tabular-nums ${
                  aktiv ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {f.antall}
              </span>
            </Link>
          );
        })}
      </div>

      {filtrert.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 px-8 py-16 text-center">
          <p className="font-display text-lg italic text-muted-foreground">
            Ingen notater i dette filteret enda.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {rekkefolge.map((key) => {
            const liste = grupper.get(key);
            if (!liste || liste.length === 0) return null;
            return (
              <section key={key} className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-[20px] font-medium italic tracking-tight">
                    {key}
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {liste.length} notater
                  </span>
                </div>
                <ul className="space-y-3">
                  {liste.map((n) => {
                    const Ikon = ikonForType(n.type);
                    return (
                      <li key={n.id}>
                        <Link
                          href={`/portal/coach/notater/${n.id}`}
                          className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:gap-4 sm:p-5"
                        >
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-foreground">
                            <Ikon size={18} strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                                {labelForType(n.type)}
                              </span>
                              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                                · {formatDato(n.dato)}
                              </span>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                · {n.forfatter}
                              </span>
                            </div>
                            <h3 className="mt-1 text-[15px] font-semibold leading-snug text-foreground">
                              {n.tittel}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                              {n.preview}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {n.tags.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-sm border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight
                            size={18}
                            strokeWidth={1.75}
                            className="mt-1 shrink-0 text-muted-foreground"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Footer-CTA mot eldre notes-side (eksisterende) */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">
              Ser etter direkte coach-meldinger?
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Coach-tråder med svar og oppfølging finner du under coach-notes.
            </p>
          </div>
          <Link
            href="/portal/coach/notes"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-transparent px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Åpne meldinger
            <ArrowUpRight size={12} strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </div>
  );
}
