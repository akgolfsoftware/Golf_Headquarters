/**
 * Anlegg/lokasjon-detalj. Navn, adresse og ekte fasiliteter.
 * Ingen hull/par/slope/rating/bio, og intet tidsskjema.
 */

import Link from "next/link";
import { MapPin } from "lucide-react";
import { StatusPille, TomTilstand } from "@/components/precision/pa";

export type BookingAnleggFasilitet = {
  id: string;
  navn: string;
  /** Norsk visnings-label for FacilityType (mappet i page.tsx). */
  typeLabel: string;
  inne: boolean;
  beskrivelse: string | null;
};

export type BookingAnleggV2Data = {
  navn: string;
  adresse: string;
  fasiliteter: BookingAnleggFasilitet[];
};

export function BookingAnleggV2({ data }: { data: BookingAnleggV2Data }) {
  return (
    <div className="ph-flate">
      <Link href="/portal/booking" className="ph-tilbake">Booking</Link>
      <header>
        <p>Anlegg</p>
        <h1>{data.navn}</h1>
        <p>{data.adresse}</p>
      </header>

      <section className="pa-card ph-kort">
        <p>Fasiliteter</p>
        {data.fasiliteter.length === 0 ? (
          <TomTilstand
            icon={MapPin}
            title="Ingen fasiliteter ennå"
            text="Ingen fasiliteter er registrert på dette anlegget ennå."
          />
        ) : (
          <ul className="ph-rader">
            {data.fasiliteter.map((f) => (
              <li key={f.id}>
                <span>
                  <strong>{f.navn}</strong>
                  <small>
                    {f.typeLabel}
                    {f.beskrivelse ? ` · ${f.beskrivelse}` : ""}
                  </small>
                </span>
                <StatusPille tone="neutral">{f.inne ? "Inne" : "Ute"}</StatusPille>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="pa-card ph-kort">
        <p>Book på dette anlegget</p>
        <p>Velg tjeneste og en ledig tid i booking-flyten. Ledige tider bekreftes mot coachens kalender.</p>
        <Link href="/portal/booking/ny" className="pa-btn pa-btn--primary pa-btn--full">
          Velg tid i booking
        </Link>
      </section>
    </div>
  );
}
