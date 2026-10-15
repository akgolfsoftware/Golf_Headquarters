/**
 * Lastetilstand for pakke 7 Kommunikasjon (Innboks, Meldinger, Caddie, Booking) i nytt design.
 * Ingen "use client": loading.tsx importerer aldri fra en klientmodul (CSP-nonce, se gotchas §Bygg og drift).
 */
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";

const TEKST = {
  innboks: { dato: "Innboks · forslag, meldinger og varsler", tittel: "Innboks", status: "Henter innboksen …" },
  meldinger: { dato: "Innboks · meldinger", tittel: "Meldinger", status: "Henter samtalen …" },
  caddie: { dato: "Caddie", tittel: "Spør Caddie", status: "Caddie leser dataene dine …" },
  booking: { dato: "Meg · booking", tittel: "Bookinger", status: "Henter bookingene og ledige tider …" },
} as const;

export function PHKommunikasjonLaster({ variant }: { variant: keyof typeof TEKST }) {
  const t = TEKST[variant];
  return <div className="phn" aria-busy="true" aria-label={t.status}>
    <div className="phn-k-topp">
      <div><div className="phn-dato">{t.dato}</div><h1 className="phn-tittel">{t.tittel}</h1></div>
    </div>
    <div className={variant === "booking" ? "phn-k-booking-grid" : "phn-k-innboks-grid"}>
      <div className="phn-k-saker">
        <span className="phn-skjelett" style={{ height: 140 }} />
        <span className="phn-skjelett" style={{ height: 96 }} />
        <span className="phn-skjelett" style={{ height: 96 }} />
      </div>
      <div className="phn-k-saker"><span className="phn-skjelett" style={{ height: 160 }} /></div>
    </div>
    <p className="phn-kilde" role="status">{t.status}</p>
  </div>;
}
