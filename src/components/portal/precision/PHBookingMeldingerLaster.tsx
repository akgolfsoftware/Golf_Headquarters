/**
 * Laste- og feilinnhold for pakke 11 og 12, resten (Coach, Anlegg, Tilbakemelding, Øvelser fra coach,
 * Ønsket økt sendt). Fasit: docs/design-system/utkast-playerhq/booking-meldinger.html, tilstandene «Laster» og «Feil».
 * Ingen "use client": loading.tsx importerer aldri fra en klientmodul (gotchas §Bygg og drift).
 * error.tsx i rutene bruker PHKommunikasjonFeil (klient); PHBmFeilKort er samme innhold uten knapp, til prøvefilene.
 */
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-booking-meldinger.css";

export const BM_TEKST = {
  coach: { dato: "Booking · coach", tittel: "Coach", status: "Henter coachen …", feil: "Coachen kunne ikke hentes" },
  anlegg: { dato: "Booking · anlegg", tittel: "Anlegg", status: "Henter anlegget …", feil: "Anlegget kunne ikke hentes" },
  tilbakemelding: { dato: "Tilbakemelding", tittel: "Tilbakemelding", status: "Henter tilbakemeldingen …", feil: "Tilbakemeldingen kunne ikke hentes" },
  ovelser: { dato: "Øvelsesbank · fra coach", tittel: "Øvelser fra coach", status: "Henter øvelsene …", feil: "Øvelsene kunne ikke hentes" },
  onsket: { dato: "Ønsket økt", tittel: "Ønsket økt", status: "Henter ønsket …", feil: "Ønsket kunne ikke hentes" },
} as const;

export type BmVariant = keyof typeof BM_TEKST;

export function PHBookingMeldingerLaster({ variant }: { variant: BmVariant }) {
  const t = BM_TEKST[variant];
  return <div className="phn" aria-busy="true" aria-label={t.status}>
    <div className="phn-bm-topp">
      <div><div className="phn-dato">{t.dato}</div><h1 className="phn-tittel">{t.tittel}</h1></div>
    </div>
    <div className="phn-bm-grid">
      <div>
        <span className="phn-skjelett" style={{ height: 140 }} />
        <span className="phn-skjelett" style={{ height: 96 }} />
      </div>
      <aside><span className="phn-skjelett" style={{ height: 160 }} /></aside>
    </div>
    <p className="phn-kilde" role="status">{t.status}</p>
  </div>;
}

/** Feilkortet uten handling, til prøvefilene. Appen bruker PHKommunikasjonFeil i error.tsx. */
export function PHBmFeilKort({ variant }: { variant: BmVariant }) {
  return <div className="phn">
    <section className="phn-kort" role="alert">
      <h1 className="phn-tittel" style={{ fontSize: 22 }}>{BM_TEKST[variant].feil}</h1>
      <p className="phn-forklar">Ingenting er endret. Prøv igjen om litt.</p>
    </section>
  </div>;
}
