import { Caps, Tittel, Kort, StatusPill, TomTilstand, T } from "@/components/v2";
import { ServiceFormV2 } from "./AdminServiceFormV2";

/**
 * AgencyOS Tjenester — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * ServiceType-liste. T.* only. Primær CTA via ServiceFormV2 (CTAPill).
 */

export interface AdminServiceRad {
  id: string;
  navn: string;
  varighetMin: number;
  prisLabel: string;
  aktiv: boolean;
  raw: { id: string; name: string; description: string | null; priceOre: number; durationMin: number; active: boolean };
}
export interface AdminServicesV2Data {
  tittelOrd: string;
  flertall: boolean;
  tjenester: AdminServiceRad[];
}

export function AdminServicesV2({ data }: { data: AdminServicesV2Data }) {
  const n = data.tjenester.length;
  const aktive = data.tjenester.filter((s) => s.aktiv).length;

  return (
    <div data-paper-wave-h="services" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <div data-paper-pattern-topp data-paper-slug="agencyos-bookinger">
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Tjenester</h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>Booking</span>
        </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut, margin: "10px 0 0", maxWidth: 560 }}>
            Det spillere kan booke. Pris og varighet styrer booking-flyten og faktureringen.
          </p>
        </div>
        <StatusPill tone={n === 0 ? "warn" : "lime"}>
          {n === 0 ? "Ingen tjenester" : `${aktive} aktive`}
        </StatusPill>
      </div>

      {/* B: én primær — ServiceFormV2 (lime Knapp/CTA internt) */}
      <ServiceFormV2 triggerLabel="Ny tjeneste" />

      <Kort pad="0">
        {n === 0 ? (
          <TomTilstand
            icon="list"
            title="Ingen tjenester ennå"
            sub="Opprett den første tjenesten — da kan spillere booke den i booking-flyten."
          />
        ) : (
          data.tjenester.map((s, i) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr auto auto", alignItems: "center", gap: 12, padding: "14px 18px", borderTop: i ? `1px solid ${T.border}` : "none" }}>
              <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg }}>{s.navn}</span>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{s.varighetMin} min</span>
              <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{s.prisLabel}</span>
              <StatusPill tone={s.aktiv ? "up" : "info"}>{s.aktiv ? "Aktiv" : "Skjult"}</StatusPill>
              <ServiceFormV2 initial={s.raw} triggerLabel="Endre" triggerVariant="lenke" />
            </div>
          ))
        )}
      </Kort>
    </div>
  );
}
