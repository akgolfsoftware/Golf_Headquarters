/**
 * PlayerHQ · Coach · Notat-detalj (P2)
 *
 * Server-page som henter notat-data og rendrer markdown-ish body, vedlegg
 * og relaterte spillere/økter. Action-bar (rediger/slett/del) ligger i
 * NotatDetailClient.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Paperclip,
  Users,
  Calendar,
  Tag,
  Quote,
  ArrowUpRight,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { NotatDetailClient } from "./notat-detail-client";

type NotatType = "coach" | "egen" | "qa";

type Vedlegg = {
  filnavn: string;
  type: "video" | "bilde" | "pdf" | "trackman";
  storrelse: string;
};

type RelatertSpiller = {
  id: string;
  navn: string;
  initialer: string;
  rolle: string;
};

type RelatertOkt = {
  id: string;
  dato: string;
  tittel: string;
};

type Notat = {
  id: string;
  type: NotatType;
  tittel: string;
  body: string;
  forfatter: string;
  initialer: string;
  rolle: string;
  dato: string;
  oppdatert: string;
  tags: string[];
  vedlegg: Vedlegg[];
  spillere: RelatertSpiller[];
  okter: RelatertOkt[];
  eier: boolean;
};

const NOTATER: Record<string, Notat> = {
  "n-001": {
    id: "n-001",
    type: "coach",
    tittel: "Pitch-konsistens: 50–100m fra fairway",
    body: `Du sliter med høyre-miss på pitches mellom 50 og 100 meter. Etter å ha sett gjennom Trackman-data fra de tre siste øktene ser jeg et mønster:

— Underkropp roterer for sent (8–12% forsinkelse mot tour-snitt)
— Venstre arm bryter sammen i nedsving
— Klubbflaten åpen 3.5° i treff

**Plan de neste 14 dagene**

1. Tørrtrening: 10 min daglig — fokus på underkroppen leder hendene
2. Trackman-økt onsdag 21. mai kl 14:00 — vi måler endring
3. Video-analyse fredag 23. mai — sammenligning før/etter

Mål: høyre-miss redusert fra 38% til under 20% innen 1. juni.

Husk: små justeringer over tid slår store grep én gang.`,
    forfatter: "Anders Kristiansen",
    initialer: "AK",
    rolle: "Hovedcoach",
    dato: "2026-05-19T09:30:00Z",
    oppdatert: "2026-05-19T09:30:00Z",
    tags: ["TEK", "SLAG", "pitch", "trackman"],
    vedlegg: [
      { filnavn: "trackman-pitch-50m-2026-05-17.csv", type: "trackman", storrelse: "84 kB" },
      { filnavn: "video-analyse-pitch.mp4", type: "video", storrelse: "12.4 MB" },
    ],
    spillere: [
      { id: "u-101", navn: "Anders Kristiansen", initialer: "AK", rolle: "Hovedcoach" },
    ],
    okter: [
      { id: "o-44", dato: "2026-05-17", tittel: "Trackman: pitch 50–100m" },
      { id: "o-41", dato: "2026-05-12", tittel: "Range-økt: jern + wedge" },
    ],
    eier: false,
  },
  "n-002": {
    id: "n-002",
    type: "egen",
    tittel: "Mental forberedelse før kvalifisering",
    body: `Notat til meg selv før Sørlandet Open kvalifisering 25. mai.

**Pre-shot routine**
— 12 sekunder fra valgt køllen til treff
— Visualiser ballbane to ganger før addressing
— Dyp pust på tee — skuldre ned, kjeve myk

**Mental ankring**
Ikke koble dagens runde til sist runde. Hvert hull er sin egen lille runde. Bom på 1 betyr ingenting for 2.

**Hvis det går galt**
Smile-regel: hvis du bommer to slag på rad, smil. Bryt tankesporet før det blir et mønster.`,
    forfatter: "Du",
    initialer: "ME",
    rolle: "Spiller",
    dato: "2026-05-18T20:15:00Z",
    oppdatert: "2026-05-18T20:15:00Z",
    tags: ["MEN", "rutine", "turnering"],
    vedlegg: [],
    spillere: [],
    okter: [
      { id: "o-43", dato: "2026-05-18", tittel: "Mental økt med Anders" },
    ],
    eier: true,
  },
  "n-003": {
    id: "n-003",
    type: "qa",
    tittel: "Hvorfor mister jeg distanse på driver i kaldt vær?",
    body: `**Spørsmål (du):**

Jeg har lagt merke til at jeg slår 8–12 meter kortere med driver når det er under 10°C. Er det meg eller utstyret?

**Svar (AK):**

Det er hovedsakelig fysikk, ikke deg. Tre faktorer slår inn:

1. **Ballhastighet faller** ca 1.5% per 10°C kjøligere — pga lavere komprimering
2. **Ballen blir hardere** — lavere energi-overføring i treff
3. **Mer spinn** — kald luft er tettere og gir mer drag

**Tips for vintertrening:**
— Bytt til lavspinn-ball (eks Bridgestone e12 Soft)
— Tee-en litt høyere — hjelper carry
— Ikke prøv å kompensere med ekstra fart, det forverrer ballbanen

Du gjør ingen feil — bare juster forventningene 5–10% nedover når det er kaldt.`,
    forfatter: "AK svart",
    initialer: "AK",
    rolle: "Hovedcoach",
    dato: "2026-05-17T14:00:00Z",
    oppdatert: "2026-05-17T14:00:00Z",
    tags: ["UTSTYR", "driver", "kald", "fysikk"],
    vedlegg: [
      { filnavn: "ballfysikk-temperatur.pdf", type: "pdf", storrelse: "412 kB" },
    ],
    spillere: [
      { id: "u-101", navn: "Anders Kristiansen", initialer: "AK", rolle: "Hovedcoach" },
    ],
    okter: [],
    eier: false,
  },
};

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function labelForType(type: NotatType): string {
  if (type === "coach") return "Coach-notat";
  if (type === "egen") return "Eget notat";
  return "Spørsmål-svar";
}

export default async function NotatDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser();
  const { id } = await params;
  const notat = NOTATER[id];
  if (!notat) notFound();

  // Body som blokker — enkel "markdown-ish" splitting på dobbel newline.
  const blokker = notat.body.split("\n\n");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-20 md:space-y-8 md:pb-0">
      <Link
        href="/portal/coach/notater"
        className="inline-flex h-11 items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.75} />
        Tilbake til notater
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · {labelForType(notat.type)} · {formatDato(notat.dato)}
        </span>
        <h1 className="mt-2 font-display text-[24px] sm:text-[30px] md:text-[36px] font-medium leading-tight tracking-tight">
          <em className="italic text-primary font-normal">{notat.tittel}</em>
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
              {notat.initialer}
            </div>
            <div>
              <div className="text-[13px] font-semibold leading-none">
                {notat.forfatter}
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {notat.rolle}
              </div>
            </div>
          </div>
          <NotatDetailClient eier={notat.eier} notatId={notat.id} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Hovedinnhold */}
        <section className="lg:col-span-2">
          <article className="rounded-lg border border-border bg-card p-4 sm:p-6 md:p-8">
            <div className="space-y-4 text-[16px] leading-[1.7] text-foreground">
              {blokker.map((blokk, i) => {
                // Heading-blokker (starter med **)
                if (blokk.startsWith("**") && blokk.endsWith("**") && !blokk.includes("\n")) {
                  return (
                    <h3
                      key={i}
                      className="mt-6 font-display text-[18px] font-semibold tracking-tight"
                    >
                      {blokk.slice(2, -2)}
                    </h3>
                  );
                }
                // Lister (linjer som starter med 1./2./3. eller —)
                if (/^(\d+\.|—)\s/.test(blokk.split("\n")[0])) {
                  return (
                    <ul key={i} className="list-none space-y-2 pl-0">
                      {blokk.split("\n").map((linje, j) => (
                        <li
                          key={j}
                          className="border-l-2 border-accent/40 pl-4 text-[15px] leading-relaxed"
                        >
                          {linje}
                        </li>
                      ))}
                    </ul>
                  );
                }
                // Pull-quote-blokk (om første tegn er «)
                if (blokk.startsWith("«") && blokk.endsWith("»")) {
                  return (
                    <blockquote
                      key={i}
                      className="my-6 border-l-2 border-accent pl-6 font-display text-[18px] italic leading-snug text-foreground"
                    >
                      {blokk}
                    </blockquote>
                  );
                }
                return (
                  <p key={i} className="whitespace-pre-wrap">
                    {blokk}
                  </p>
                );
              })}
            </div>
          </article>

          {/* Vedlegg */}
          {notat.vedlegg.length > 0 && (
            <div className="mt-6 rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Paperclip
                  size={14}
                  strokeWidth={1.75}
                  className="text-muted-foreground"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Vedlegg · {notat.vedlegg.length}
                </span>
              </div>
              <ul className="space-y-2">
                {notat.vedlegg.map((v) => (
                  <li
                    key={v.filnavn}
                    className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 px-4 py-3"
                  >
                    <span className="rounded-sm bg-card px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {v.type}
                    </span>
                    <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                      {v.filnavn}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {v.storrelse}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-4 lg:col-span-1">
          {/* Tags */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Tag
                size={14}
                strokeWidth={1.75}
                className="text-muted-foreground"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {notat.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-secondary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Relaterte spillere */}
          {notat.spillere.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4 md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Users
                  size={14}
                  strokeWidth={1.75}
                  className="text-muted-foreground"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Relaterte personer
                </span>
              </div>
              <ul className="space-y-3">
                {notat.spillere.map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
                      {s.initialer}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold leading-none">
                        {s.navn}
                      </div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                        {s.rolle}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Relaterte økter */}
          {notat.okter.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4 md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Calendar
                  size={14}
                  strokeWidth={1.75}
                  className="text-muted-foreground"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Relaterte økter
                </span>
              </div>
              <ul className="space-y-2">
                {notat.okter.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/portal/tren/${o.id}`}
                      className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-secondary/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-foreground">
                          {o.tittel}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                          {formatDato(o.dato)}
                        </div>
                      </div>
                      <ArrowUpRight
                        size={14}
                        strokeWidth={1.75}
                        className="mt-0.5 shrink-0 text-muted-foreground"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quote-card */}
          {notat.type === "coach" && (
            <div className="rounded-lg border border-border bg-card p-4 md:p-6">
              <Quote size={20} strokeWidth={1.75} className="text-accent" />
              <p className="mt-4 font-display text-[16px] italic leading-snug text-foreground">
                «Små justeringer over tid slår store grep én gang.»
              </p>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                — {notat.forfatter}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
