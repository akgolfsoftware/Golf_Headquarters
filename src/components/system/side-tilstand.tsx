import "@/styles/marked-kit.css";

/**
 * SideTilstand — delt systemtilstand-flate (offline · 404 · 500 ·
 * vedlikehold · ingen tilgang). Fasit: designsystem/paper/fase2/system/
 * system-tilstander.html. Ren presentasjonskomponent — ingen data-henting,
 * ingen auth. Regel fra fasiten: hver tilstand sier hva som skjedde, hva som
 * fortsatt virker, og gir én vei videre. Aldri feilkode alene, aldri
 * «noe gikk galt» uten forklaring. Feilkoden vises i mono nederst, for support.
 *
 * Wires i dag: /offline (offline), /404 → not-found.tsx (funnetIkke), segment-
 * error.tsx (feil). «vedlikehold» og «tilgang» har ingen ekte rute ennå — se
 * PR-beskrivelse for hvordan de kobles til når det trengs.
 */
import type { ReactNode } from "react";
import Link from "next/link";
export type PaperTilstandLinje = { label: string; verdi: string };
export type PaperTilstandKnapp = {
  label: string;
  href: string;
  primary?: boolean;
};

export function PaperTilstand({
  dataSlug,
  ikon,
  tittel,
  tekst,
  virkerLabel,
  virkerLinjer,
  knapper,
  kode,
}: {
  dataSlug: string;
  ikon: ReactNode;
  tittel: string;
  tekst: string;
  virkerLabel?: string;
  virkerLinjer?: PaperTilstandLinje[];
  knapper: PaperTilstandKnapp[];
  kode?: string;
}) {
  return (
    <div className="pks-side" data-paper-slug={dataSlug}>
      <div className="pks-kolonne">
        <div className="pks-merke">
          AK Golf HQ<span>.</span>
        </div>

        <div className="pks-figur" aria-hidden="true">
          {ikon}
        </div>
        <h1 className="pks-tittel">{tittel}</h1>
        <p className="pks-tekst">{tekst}</p>

        {virkerLinjer && virkerLinjer.length > 0 && (
          <div className="pks-virker">
            {virkerLabel && <span className="pks-flab">{virkerLabel}</span>}
            {virkerLinjer.map((l) => (
              <div key={l.label} className="pks-linje">
                {l.label}
                <span className="pks-v">{l.verdi}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pks-knapper">
          {knapper.map((k) => (
            <Link key={k.label} className={"pks-btn" + (k.primary ? " pks-btn-ink" : "")} href={k.href}>
              {k.label}
            </Link>
          ))}
        </div>

        {kode && <p className="pks-kode">{kode}</p>}
      </div>
    </div>
  );
}

export const PaperIkon = {
  offline: (
    <svg viewBox="0 0 24 24">
      <path d="M5 12a10 10 0 0114 0" />
      <path d="M8.5 15.5a5 5 0 017 0" />
      <circle cx="12" cy="19" r="1" />
      <path d="M3 3l18 18" />
    </svg>
  ),
  finnesIkke: (
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M16 16l5 5" />
    </svg>
  ),
  teknisk: (
    <svg viewBox="0 0 24 24">
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17v.5" />
    </svg>
  ),
  vedlikehold: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  ),
  ingenTilgang: (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
  ),
};
