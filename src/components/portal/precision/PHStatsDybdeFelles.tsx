/**
 * Felles biter for pakke 6 «Stats i dybden», steg 2–4: sparkline, feiltilstand og aksenavn.
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html.
 * Avvik:
 *   - Ingen egne avvik; avvikene per skjerm står i PH14Tester, PH14Test, PH15TnTest, PH17Trening og PH16Resultater.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-14, PH-15, PH-17-TR og PH-16-RES.
 * Ingen "use client": loading.tsx kan importere herfra. Feiltilstanden får `reset` fra error.tsx.
 */
import { RotateCw } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";

export type SdAkse = "fys" | "tek" | "slag" | "spill" | "turn";
export const SD_AKSE_KODE: Record<SdAkse, string> = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };

/** Liten progresjonslinje i aksefargen. Under to målinger tegnes ingenting. */
export function SdSpark({ verdier, akse }: { verdier: number[]; akse: SdAkse }) {
  if (verdier.length < 2) return null;
  const min = Math.min(...verdier), max = Math.max(...verdier), sp = max - min || 1;
  const p = verdier.map((x, i) => `${Math.round((2 + i * 60 / (verdier.length - 1)) * 10) / 10},${Math.round((17 - (x - min) / sp * 14) * 10) / 10}`);
  return (
    <svg viewBox="0 0 64 20" aria-hidden="true">
      <path d={`M${p.join(" L")}`} fill="none" stroke={`var(--phn-${akse})`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Feiltilstand i nytt design. Brukes fra error.tsx (klient), som sender inn `reset`. */
export function SdFeil({ tittel, tekst, reset }: { tittel: string; tekst: string; reset?: () => void }) {
  return (
    <div className="phn" role="alert">
      <section className="phn-kort dempet">
        <h2>{tittel}</h2>
        <p className="phn-forklar">{tekst}</p>
        {reset && (
          <div className="phn-knapper">
            <button type="button" className="phn-knapp sek" onClick={reset}>
              <RotateCw className="phn-ikon" aria-hidden />
              Prøv igjen
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
