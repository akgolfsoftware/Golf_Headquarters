/**
 * MegProfil — PlayerHQ "Meg"-skjerm (/portal/meg), preview-variant.
 *
 * Portet fra den AUTORITATIVE v10-fasiten ProfileScreen
 * (public/design-handover/_ui-kits/playerhq/Screens.jsx, linje 220-273).
 * Per LÅST design-porting-gate vinner v10-JSX over den arkiverte PNG-en
 * (public/design-handover/_screens/pl-meg.png), som viste et annet, eldre design.
 *
 * Elementliste fra v10-fasiten (rekkefølge oppe → ned):
 *   1. Hero-rad:      avatar (68px, initialer i lime) + eyebrow
 *                     "HCP 4,2 · OSLO GK · MEDLEM SIDEN 2019" + display-navn
 *                     "Magnus Strand" + e-post (mono, muted).
 *   2. KPI 3-col:     fast horisontal grid — "Runder '25"=14, "Best"=68, "Snitt"=73,2.
 *   3. FAKTURAER:     eyebrow + "N utestående" (primary) + kort med faktura-rader
 *                     (beskrivelse + ref + beløp + status-badge ok/warn).
 *   4. Logg ut:       fullbredde ghost-knapp i destructive-farge.
 *
 * Presentasjonell, props-drevet. Ingen Prisma/DB/auth — kun presentasjon.
 * Bruker DS-tokens + athletic-komponenter + lucide. Ingen hardkodet hex.
 */

import { AthleticAvatar } from "@/components/athletic/avatar";
import { AthleticBadge } from "@/components/athletic/badge";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { KpiCard } from "@/components/athletic/kpi";
import { buttonClasses } from "@/components/ui/button";

export type MegFaktura = {
  /** Faktura-referanse, f.eks. "F-2025-0428". */
  referanse: string;
  /** Kort beskrivelse, f.eks. "Coaching mai · 4 økter". */
  beskrivelse: string;
  /** Beløp uten "kr"-suffiks, f.eks. "3 200". */
  belop: string;
  /** Status — styrer badge-variant og etikett. */
  status: "betalt" | "forfaller";
  /** Status-etikett, f.eks. "Betalt" eller "Forfaller 14.06". */
  statusEtikett: string;
};

export type MegProfilData = {
  navn: string;
  initialer: string;
  avatarUrl?: string | null;
  /** Eyebrow over navnet, f.eks. "HCP 4,2 · OSLO GK · MEDLEM SIDEN 2019". */
  eyebrow: string;
  /** E-post under navnet (mono, muted). */
  epost: string;
  kpi: {
    /** Antall registrerte runder, f.eks. "14". */
    runder: string;
    /** Beste runde, f.eks. "68". */
    beste: string;
    /** Snitt-score, f.eks. "73,2". */
    snitt: string;
  };
  fakturaer: MegFaktura[];
};

function FakturaRad({ referanse, beskrivelse, belop, status, statusEtikett }: MegFaktura) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold tracking-[-0.005em] text-foreground">
          {beskrivelse}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{referanse}</div>
      </div>
      <div className="mr-2 font-mono text-[13px] font-semibold text-foreground">{belop} kr</div>
      <AthleticBadge variant={status === "betalt" ? "ok" : "warn"}>{statusEtikett}</AthleticBadge>
    </div>
  );
}

export function MegProfil({ data }: { data: MegProfilData }) {
  const utestaende = data.fakturaer.filter((f) => f.status === "forfaller").length;

  return (
    <div className="mx-auto w-full max-w-[480px] pb-8">
      {/* 1. Hero — avatar + eyebrow + navn + e-post */}
      <header className="flex items-center gap-4 px-6 pt-8 pb-4">
        <AthleticAvatar
          src={data.avatarUrl}
          initials={data.initialer}
          borderColor="card"
          className="h-[68px] w-[68px] border-0 text-xl shadow-none"
        />
        <div className="min-w-0">
          <AthleticEyebrow>{data.eyebrow}</AthleticEyebrow>
          <h1 className="mt-1 truncate font-display text-2xl font-bold leading-tight tracking-[-0.015em] text-foreground">
            {data.navn}
          </h1>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{data.epost}</p>
        </div>
      </header>

      {/* 2. KpiStrip — fast horisontal 3-kolonne (matcher v10 repeat(3,1fr)) */}
      <div className="px-6 py-2">
        <div className="grid grid-cols-3 gap-2">
          <KpiCard label="Runder '25" value={data.kpi.runder} />
          <KpiCard label="Best" value={data.kpi.beste} />
          <KpiCard label="Snitt" value={data.kpi.snitt} />
        </div>
      </div>

      {/* 3. Fakturaer */}
      <section className="px-6 pt-6 pb-2">
        <div className="mb-3 flex items-center justify-between">
          <AthleticEyebrow>Fakturaer</AthleticEyebrow>
          {utestaende > 0 && (
            <span className="font-mono text-[10px] font-semibold text-primary">
              {utestaende} utestående
            </span>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-1">
          {data.fakturaer.map((f) => (
            <FakturaRad key={f.referanse} {...f} />
          ))}
        </div>
      </section>

      {/* 4. Logg ut */}
      <div className="px-6 pt-6">
        <button
          type="button"
          className={buttonClasses({
            variant: "ghost-light",
            className: "w-full text-destructive hover:bg-destructive/5 hover:text-destructive",
          })}
        >
          Logg ut
        </button>
      </div>
    </div>
  );
}

/** Standard faktura-rader som matcher v10-fasiten (3 stk, 1 forfaller). */
export const MEG_FAKTURAER_DEFAULT: MegFaktura[] = [
  {
    referanse: "F-2025-0428",
    beskrivelse: "Coaching mai · 4 økter",
    belop: "3 200",
    status: "forfaller",
    statusEtikett: "Forfaller 14.06",
  },
  {
    referanse: "F-2025-0331",
    beskrivelse: "Coaching april · 4 økter",
    belop: "3 200",
    status: "betalt",
    statusEtikett: "Betalt",
  },
  {
    referanse: "F-2025-0228",
    beskrivelse: "Coaching mars · 5 økter",
    belop: "4 000",
    status: "betalt",
    statusEtikett: "Betalt",
  },
];
