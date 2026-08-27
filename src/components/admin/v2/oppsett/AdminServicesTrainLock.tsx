"use client";

/**
 * AgencyOS — Tjenester, Train-lock (T13-detaljer, 27.08.2026).
 *
 * Port av `AdminServicesV2` (Paper/T.*) til Train-lock (TL.*) —
 * CLAUDE.md invariant 2. Datakontrakt (AdminServicesV2Data) og server
 * actions (via `ServiceFormTrainLock`) uendret — designport, ikke
 * funksjonsendring.
 */

import { TL } from "@/lib/v2/train-lock";
import { ServiceFormTrainLock } from "./AdminServiceFormTrainLock";
import { TlKort, TlRad, TlRadGruppe, TlTittel, TlTomTilstand } from "./tl-kit";

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

function AktivMerke({ aktiv }: { aktiv: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 24,
        padding: "0 9px",
        borderRadius: 999,
        background: aktiv ? TL.dim : TL.dock,
        boxShadow: aktiv ? undefined : `inset 0 0 0 1px ${TL.hair}`,
        color: aktiv ? TL.text : TL.mute,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {aktiv ? "Aktiv" : "Skjult"}
    </span>
  );
}

export function AdminServicesTrainLock({ data }: { data: AdminServicesV2Data }) {
  const n = data.tjenester.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 640, margin: "0 auto", width: "100%" }}>
      <TlTittel sub="Booking">Tjenester</TlTittel>
      <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.55, maxWidth: 480 }}>
        Det spillere kan booke. Pris og varighet styrer booking-flyten og faktureringen.
      </p>

      <ServiceFormTrainLock triggerLabel="Ny tjeneste" />

      {n === 0 ? (
        <TlKort>
          <TlTomTilstand
            icon="list"
            title="Ingen tjenester ennå"
            sub="Opprett den første tjenesten — da kan spillere booke den i booking-flyten."
          />
        </TlKort>
      ) : (
        <TlRadGruppe>
          {data.tjenester.map((s, i) => (
            <TlRad
              key={s.id}
              title={s.navn}
              sub={`${s.varighetMin} min · ${s.prisLabel}`}
              chevron={false}
              last={i === data.tjenester.length - 1}
              trailing={
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <AktivMerke aktiv={s.aktiv} />
                  <ServiceFormTrainLock initial={s.raw} triggerLabel="Endre" triggerVariant="lenke" />
                </div>
              }
            />
          ))}
        </TlRadGruppe>
      )}
    </div>
  );
}
