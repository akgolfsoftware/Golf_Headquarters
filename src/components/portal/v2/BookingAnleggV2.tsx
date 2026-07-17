"use client";

/**
 * PlayerHQ · Anlegg/lokasjon-detalj — v2 (retning C «Presis»).
 * v2-port 17. juli 2026 (Team G-B): erstatter legacy-siden i (legacy)/booking/
 * anlegg/[anleggId]. Honest data only (bevisste utelatelser fra legacy
 * BEHOLDES): navn + adresse fra Location, ekte Facility-rader — INGEN
 * hull/par/slope/rating/bio (finnes ikke på modellen, fabrikkeres ikke),
 * intet faux time-grid (ledige tider bor i den ekte booking-flyten).
 * FacilityType→norsk label mappes i page.tsx.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { T, Caps, Tittel, Kort, CTAPill, TomTilstand } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

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

/** true på klient etter mount når viewport < 768px (styrer kun tetthet). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

export function BookingAnleggV2({ data }: { data: BookingAnleggV2Data }) {
  const mobile = useMobile();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hero */}
      <Kort tint pad={mobile ? "24px 20px" : "32px 30px"}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Icon name="building-2" size={13} style={{ color: T.lime }} />
          <Caps>Anlegg</Caps>
        </span>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile}>{data.navn}</Tittel>
        </div>
        <p style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontSize: 13.5, color: T.fg2, margin: "12px 0 0" }}>
          <Icon name="map-pin" size={14} style={{ color: T.lime, flex: "none" }} />
          {data.adresse}
        </p>
      </Kort>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 340px", gap: T.gap, alignItems: "start" }}>
        {/* Fasiliteter — ekte Facility-rader */}
        <div>
          <Caps style={{ marginBottom: 10 }}>Fasiliteter</Caps>
          {data.fasiliteter.length === 0 ? (
            <Kort>
              <TomTilstand
                icon="map-pin"
                title="Ingen fasiliteter ennå"
                sub="Ingen fasiliteter er registrert på dette anlegget ennå."
              />
            </Kort>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10 }}>
              {data.fasiliteter.map((f) => (
                <Kort key={f.id} pad="16px 18px">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ width: 36, height: 36, flex: "none", borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="map-pin" size={15} style={{ color: T.fg2 }} />
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, padding: "3px 8px" }}>
                      <Icon name={f.inne ? "home" : "sun"} size={10} />
                      {f.inne ? "Inne" : "Ute"}
                    </span>
                  </div>
                  <div style={{ fontFamily: T.disp, fontSize: 14.5, fontWeight: 700, color: T.fg, marginTop: 12 }}>{f.navn}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 3 }}>{f.typeLabel}</div>
                  {f.beskrivelse && (
                    <p style={{ fontFamily: T.ui, fontSize: 12, lineHeight: 1.5, color: T.fg2, margin: "8px 0 0" }}>{f.beskrivelse}</p>
                  )}
                </Kort>
              ))}
            </div>
          )}
        </div>

        {/* Booking-CTA — ekte flyt, intet faux time-grid */}
        <Kort eyebrow="Book på dette anlegget">
          <p style={{ fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.55, color: T.fg2, margin: 0 }}>
            Velg tjeneste og en ledig tid i booking-flyten. Ledige tider bekreftes mot coachens kalender.
          </p>
          <div style={{ marginTop: 14 }}>
            <Link href="/portal/booking/ny" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill icon="arrow-right" full>Velg tid i booking</CTAPill>
            </Link>
          </div>
        </Kort>
      </div>
    </div>
  );
}
