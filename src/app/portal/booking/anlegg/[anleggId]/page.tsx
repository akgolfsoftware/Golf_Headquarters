/**
 * PlayerHQ · Bane-detalj
 *
 * Implementert fra Bane-detalj side.html (Bundle 3).
 * Viser hull-tabell, statistikk og mulighet til å booke på banen.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  ChevronLeft,
  MapPin,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Flag,
} from "lucide-react";
import "@/components/booking/booking.css";

type Props = {
  params: Promise<{ anleggId: string }>;
};

// ---------------------------------------------------------------------------
// Statisk stub for anlegg som ikke er i DB ennå
// ---------------------------------------------------------------------------

const ANLEGG_STUB: Record<
  string,
  {
    navn: string;
    by: string;
    beskriv: string;
    hull: number;
    par: number;
    lengde: string;
    trenere: number;
    aapent: string;
    fasiliteter: string[];
    hullData: { nr: number; par: number; lengdeMeter: string; si: number }[];
  }
> = {
  gfgk: {
    navn: "Gamle Fredrikstad GK — Old Course",
    by: "Fredrikstad",
    beskriv:
      "Hjemmebanen til AK Golf Academy. Par 3-bane med 9 hull designet for teknisk arbeid og spill-trening. Performance Studio med Trackman 4 og to-kamera-system.",
    hull: 9,
    par: 27,
    lengde: "980 m",
    trenere: 5,
    aapent: "07–22",
    fasiliteter: [
      "2. etg. driving range",
      "Performance Studio",
      "Putting green",
      "Nærspillsgreen",
    ],
    hullData: [
      { nr: 1, par: 3, lengdeMeter: "78–110", si: 7 },
      { nr: 2, par: 3, lengdeMeter: "55–85", si: 5 },
      { nr: 3, par: 3, lengdeMeter: "90–130", si: 1 },
      { nr: 4, par: 3, lengdeMeter: "65–95", si: 9 },
      { nr: 5, par: 3, lengdeMeter: "80–115", si: 3 },
      { nr: 6, par: 3, lengdeMeter: "70–100", si: 8 },
      { nr: 7, par: 3, lengdeMeter: "95–135", si: 2 },
      { nr: 8, par: 3, lengdeMeter: "60–90", si: 6 },
      { nr: 9, par: 3, lengdeMeter: "85–120", si: 4 },
    ],
  },
  miklagard: {
    navn: "Miklagard Golfklubb",
    by: "Kløfta",
    beskriv:
      "Norges mest prestisjetunge mesterskapsbane. 18 hull · par 72. Ideell for spill-trening på en utfordrende layout med state-of-the-art fasiliteter.",
    hull: 18,
    par: 72,
    lengde: "5 980 m",
    trenere: 3,
    aapent: "06–22",
    fasiliteter: [
      "2 × Performance Golf Studio",
      "Stor putting green",
      "Nærspillsgreen",
      "Wedge-område",
    ],
    hullData: [
      { nr: 1, par: 4, lengdeMeter: "360–400", si: 9 },
      { nr: 2, par: 3, lengdeMeter: "140–180", si: 15 },
      { nr: 3, par: 5, lengdeMeter: "480–530", si: 3 },
      { nr: 4, par: 4, lengdeMeter: "340–380", si: 11 },
      { nr: 5, par: 4, lengdeMeter: "370–420", si: 1 },
      { nr: 6, par: 3, lengdeMeter: "155–195", si: 17 },
      { nr: 7, par: 4, lengdeMeter: "320–365", si: 13 },
      { nr: 8, par: 5, lengdeMeter: "490–545", si: 5 },
      { nr: 9, par: 4, lengdeMeter: "350–395", si: 7 },
    ],
  },
};

export default async function AnleggDetalj({ params }: Props) {
  const { anleggId } = await params;
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  // Prøv DB først
  const dbLoc = await prisma.location.findUnique({
    where: { id: anleggId },
    include: { facilities: true },
  });

  const stub = ANLEGG_STUB[anleggId.toLowerCase()];
  if (!stub && !dbLoc) notFound();

  const anlegg = stub ?? {
    navn: dbLoc!.name,
    by: dbLoc!.address ?? "Norge",
    beskriv: "Golf-anlegg.",
    hull: 9,
    par: 27,
    lengde: "–",
    trenere: 0,
    aapent: "–",
    fasiliteter: dbLoc!.facilities.map((f) => f.name),
    hullData: [],
  };

  return (
    <div className="bk-scope">
      {/* ── Topnav ── */}
      <nav className="bk-topnav">
        <Link href="/portal/booking" className="bk-back-link">
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Booking
        </Link>
        <span className="bk-brand">AK Golf · PlayerHQ</span>
        <div className="bk-crumbs">
          Booking / Anlegg / <span className="current">{anlegg.navn.split(" ")[0]}</span>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl space-y-8 p-8 pb-24">
        {/* ── Hero ── */}
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_260px]">
          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
              Golf-anlegg · {anlegg.by}
            </div>
            <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight">
              {anlegg.navn.split("—")[0].trim()} —{" "}
              <em className="font-serif font-normal italic text-primary">
                {anlegg.navn.includes("—") ? anlegg.navn.split("—")[1].trim() : "Old Course"}
              </em>
            </h1>
            <div className="mt-4 flex flex-wrap gap-5">
              <div className="flex flex-col gap-0.5">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Hull
                </div>
                <div className="font-mono text-2xl font-bold tabular-nums">
                  {anlegg.hull}
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Par
                </div>
                <div className="font-mono text-2xl font-bold tabular-nums">
                  {anlegg.par}
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Lengde
                </div>
                <div className="font-mono text-2xl font-bold tabular-nums">
                  {anlegg.lengde}
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Trenere
                </div>
                <div className="font-mono text-2xl font-bold tabular-nums">
                  {anlegg.trenere}
                </div>
              </div>
            </div>
          </div>

          {/* Mini-kart placeholder */}
          <div className="flex h-44 w-full max-w-[260px] flex-col items-start justify-end overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#DDE6CE] to-[#B4C99D] p-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] shadow-sm">
              <MapPin className="h-3 w-3 text-destructive" strokeWidth={2} />
              {anlegg.by}
            </span>
          </div>
        </div>

        {/* ── Statistikk-stripe ── */}
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-4">
          {[
            { lbl: "Fasiliteter", val: String(anlegg.fasiliteter.length), sub: "aktive" },
            { lbl: "Åpent", val: anlegg.aapent, sub: "daglig" },
            { lbl: "Par", val: String(anlegg.par), sub: `${anlegg.hull} hull` },
            { lbl: "Trenere", val: String(anlegg.trenere), sub: "på dette anlegget" },
          ].map((s, i) => (
            <div
              key={i}
              className="border-r border-border/50 p-5 last:border-r-0"
            >
              <div className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
                {s.lbl}
              </div>
              <div className="mt-2 font-mono text-4xl font-bold tabular-nums leading-none">
                {s.val}
              </div>
              <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── Hull-tabell ── */}
        {anlegg.hullData.length > 0 && (
          <div>
            <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
              Hull-oversikt
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="grid border-b border-border/50 bg-muted/20 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground" style={{ gridTemplateColumns: "48px 60px 1fr 80px 80px" }}>
                <span>Hull</span>
                <span className="text-center">Par</span>
                <span>Lengde</span>
                <span className="text-right">SI</span>
                <span className="text-right">Merknad</span>
              </div>
              {anlegg.hullData.map((h) => {
                const erVanskelig = h.si <= 3;
                const erLett = h.si >= 7 && h.si <= 9;
                return (
                  <div
                    key={h.nr}
                    className="grid items-center border-b border-border/30 px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/10"
                    style={{ gridTemplateColumns: "48px 60px 1fr 80px 80px" }}
                  >
                    <span className="font-mono text-base font-bold tabular-nums">
                      {h.nr}
                    </span>
                    <span className="text-center font-mono text-sm font-semibold text-muted-foreground tabular-nums">
                      {h.par}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {h.lengdeMeter} m
                    </span>
                    <span className="text-right font-mono text-sm font-bold tabular-nums">
                      {h.si}
                    </span>
                    <span className="flex justify-end">
                      {erVanskelig ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-destructive">
                          <TrendingUp className="h-2.5 w-2.5" strokeWidth={2} />
                          Vanskelig
                        </span>
                      ) : erLett ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-[#4A5418]">
                          <TrendingDown className="h-2.5 w-2.5" strokeWidth={2} />
                          Enkel
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Beskrivelse + fasiliteter ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Om anlegget
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {anlegg.beskriv}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Fasiliteter
            </h2>
            <ul className="mt-3 space-y-2">
              {anlegg.fasiliteter.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2.5 font-mono text-xs text-muted-foreground"
                >
                  <Flag
                    className="h-3 w-3 shrink-0 text-primary"
                    strokeWidth={2}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Tilgjengelig her
            </div>
            <div className="mt-1 font-display text-xl font-semibold tracking-tight">
              Book coaching på {anlegg.navn.split("—")[0].trim()}
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/portal/booking"
              className="bk-btn-ghost"
            >
              <Users className="h-4 w-4" strokeWidth={1.75} />
              Se trenere
            </Link>
            <Link
              href="/portal/booking/ny"
              className="bk-btn-lime"
            >
              Book nå
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
