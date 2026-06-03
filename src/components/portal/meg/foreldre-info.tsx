/**
 * ForeldreInfo — Foreldreportal · oversikt (foresatt-info), preview-variant.
 *
 * Visuell fasit: public/design-handover/_screens/pl-forelder.png.
 * Skjermen er foreldreportalens landing i TOM tilstand — en foresatt som
 * ennå ikke er koblet til noe barn. Mobil-først, selvstendig layout uten
 * spiller-/coach-sidebar (kun innhold i sentrert kolonne).
 *
 * Elementliste fra fasiten (rekkefølge oppe → ned):
 *   1. Eyebrow:   "FORELDREPORTAL · OVERSIKT" (mono, uppercase, muted).
 *   2. H1:        "Velkommen" (display, bold).
 *   3. Subtittel: "Du er ikke koblet til noen barn ennå." (muted).
 *   4. Tom-kort:  stiplet ramme, sentrert Bell-ikon + sentrert hjelpetekst
 *                 "Be spilleren sende en invitasjon fra sin profil, eller
 *                 kontakt support."
 *
 * Presentasjonell, props-drevet. Ingen Prisma/DB/auth — kun presentasjon.
 * DS-tokens + athletic/eyebrow + lucide. Ingen hardkodet hex, ingen emoji.
 */

import Link from "next/link";
import { Bell, ChevronRight, type LucideIcon } from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

/** Ett barn koblet til den foresatte (vises når lista ikke er tom). */
export type ForeldreBarn = {
  /** Stabil id for key + lenke. */
  id: string;
  /** Barnets navn, f.eks. "Magnus Strand". */
  navn: string;
  /** Relasjon, f.eks. "Forelder" eller "Foresatt". */
  relasjon: string;
  /** Kort kontekst, f.eks. "Oslo GK · HCP 4,2". */
  kontekst?: string;
  /** Rute til barnets innsynsside. */
  href: string;
};

export type ForeldreInfoData = {
  /** Eyebrow over tittelen. Default matcher fasiten. */
  eyebrow?: string;
  /** Hovedtittel. Default matcher fasiten. */
  tittel?: string;
  /** Hjelpetekst i tom-kortet. Default matcher fasiten. */
  tomHjelpetekst?: string;
  /** Barn koblet til den foresatte. Tom liste → tom-tilstand (fasit). */
  barn?: ForeldreBarn[];
};

const STD_EYEBROW = "Foreldreportal · Oversikt";
const STD_TITTEL = "Velkommen";
const STD_TOM_HJELP =
  "Be spilleren sende en invitasjon fra sin profil, eller kontakt support.";

/** Tom-tilstand: stiplet kort med sentrert ikon + hjelpetekst (fasit). */
function TomTilstand({ Icon, tekst }: { Icon: LucideIcon; tekst: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <Icon
        className="h-7 w-7 text-muted-foreground/50"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
        {tekst}
      </p>
    </div>
  );
}

/** Én barn-rad (vises når foresatt er koblet til minst ett barn). */
function BarnRad({ navn, relasjon, kontekst, href }: ForeldreBarn) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-semibold tracking-[-0.005em] text-foreground">
          {navn}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {relasjon}
          {kontekst ? ` · ${kontekst}` : ""}
        </div>
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-muted-foreground"
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </Link>
  );
}

export function ForeldreInfo({ data = {} }: { data?: ForeldreInfoData }) {
  const eyebrow = data.eyebrow ?? STD_EYEBROW;
  const tittel = data.tittel ?? STD_TITTEL;
  const tomHjelp = data.tomHjelpetekst ?? STD_TOM_HJELP;
  const barn = data.barn ?? [];
  const erTom = barn.length === 0;

  return (
    <div className="mx-auto w-full max-w-[640px] px-1 pt-8 pb-12 sm:px-8">
      {/* 1–3. Topptekst: eyebrow + tittel + subtittel/kontekst */}
      <header>
        <AthleticEyebrow>{eyebrow}</AthleticEyebrow>
        <h1 className="mt-3 font-display text-[26px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
          {tittel}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {erTom
            ? "Du er ikke koblet til noen barn ennå."
            : `Du følger ${barn.length} ${barn.length === 1 ? "barn" : "barn"}.`}
        </p>
      </header>

      {/* 4. Tom-kort (fasit) eller barn-liste */}
      <div className="mt-8">
        {erTom ? (
          <TomTilstand Icon={Bell} tekst={tomHjelp} />
        ) : (
          <div className="space-y-3">
            {barn.map((b) => (
              <BarnRad key={b.id} {...b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Standard tom-tilstand som matcher v10-fasiten (ingen barn koblet). */
export const FORELDRE_INFO_DEFAULT: ForeldreInfoData = {
  eyebrow: STD_EYEBROW,
  tittel: STD_TITTEL,
  tomHjelpetekst: STD_TOM_HJELP,
  barn: [],
};
