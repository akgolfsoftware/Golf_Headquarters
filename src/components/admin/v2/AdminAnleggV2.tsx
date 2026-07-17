import Link from "next/link";
import { Caps, Tittel, Kort, TomTilstand, StatusPill, T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { LocationFormV2, FacilityFormV2, type FasilitetType } from "./AdminLocationFormV2";

/**
 * AgencyOS — Anlegg (Gjennomføre · Anlegg), v2-port 16. juli 2026,
 * administrasjon KOBLET 17. juli 2026 (B8a): gruppert per lokasjon med
 * «Endre» (rediger/deaktiver lokasjon — soft delete, aldri hard delete),
 * «+ Ny fasilitet» og «Endre» per fasilitet (FacilityFormV2). Deaktiverte
 * rader vises med ærlig status-pill så de kan aktiveres igjen.
 * Fasilitet-lenken til /admin/availability (fasit-flyten) er beholdt.
 */

export interface AnleggFasilitet {
  id: string;
  navn: string;
  ikonNavn: string;
  type: FasilitetType;
  kapasitet: number;
  aktiv: boolean;
  bookinger: number;
  beskrivelse: string | null;
}
export interface AnleggLokasjon {
  id: string;
  navn: string;
  adresse: string;
  aktiv: boolean;
  fasiliteter: AnleggFasilitet[];
}
export interface AdminAnleggV2Data {
  tittelOrd: string;
  flertall: boolean;
  lokasjoner: AnleggLokasjon[];
}

function FasilitetKort({ f }: { f: AnleggFasilitet }) {
  return (
    <Kort style={{ background: T.panel2, opacity: f.aktiv ? 1 : 0.72 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 10, background: T.panel, color: f.aktiv ? T.lime : T.mut, flex: "none" }}>
          <Icon name={f.ikonNavn} size={20} />
        </span>
        {!f.aktiv && <StatusPill tone="down">Deaktivert</StatusPill>}
      </div>
      <div style={{ marginTop: 12, fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{f.navn}</div>
      <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 10, color: T.mut }}>
        {f.aktiv ? (
          <strong style={{ color: T.lime }}>{f.bookinger} {f.bookinger === 1 ? "booking" : "bookinger"} denne uka</strong>
        ) : (
          <span>Vises ikke i booking</span>
        )}{" "}
        {f.beskrivelse ?? "—"}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <FacilityFormV2
          initial={{ id: f.id, name: f.navn, capacity: f.kapasitet, active: f.aktiv, type: f.type, description: f.beskrivelse }}
          triggerLabel="Endre"
        />
        {f.aktiv && (
          <Link href="/admin/availability" style={{ textDecoration: "none", fontFamily: T.mono, fontSize: 10, color: T.mut, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 4 }}>
            Tilgjengelighet <Icon name="arrow-right" size={11} />
          </Link>
        )}
      </div>
    </Kort>
  );
}

export function AdminAnleggV2({ data }: { data: AdminAnleggV2Data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <Caps>Gjennomføre · Anlegg</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em={data.flertall ? "fasiliteter." : "fasilitet."}>{data.tittelOrd}</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut, margin: "10px 0 0", maxWidth: 560 }}>
            Anleggene du disponerer. Tallet viser hvor presset hver ressurs er denne uka. Deaktiverte anlegg og fasiliteter vises ikke i booking.
          </p>
        </div>
        <LocationFormV2 triggerLabel="+ Nytt anlegg" />
      </div>

      {data.lokasjoner.length === 0 ? (
        <Kort>
          <TomTilstand icon="building-2" title="Ingen anlegg registrert ennå" sub="Opprett det første med «+ Nytt anlegg»." />
        </Kort>
      ) : (
        data.lokasjoner.map((l) => (
          <Kort key={l.id} pad="20px 22px">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg }}>{l.navn}</span>
                  {l.aktiv ? <StatusPill>Aktiv</StatusPill> : <StatusPill tone="down">Deaktivert</StatusPill>}
                </div>
                <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 12, color: T.mut }}>
                  <Icon name="map-pin" size={12} />
                  {l.adresse}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <LocationFormV2
                  initial={{ id: l.id, name: l.navn, address: l.adresse, active: l.aktiv }}
                  triggerLabel="Endre"
                />
                <FacilityFormV2 locationId={l.id} triggerLabel="+ Ny fasilitet" />
              </div>
            </div>

            {l.fasiliteter.length === 0 ? (
              <div style={{ marginTop: 8 }}>
                <TomTilstand icon="building-2" title="Ingen fasiliteter" sub="Legg til den første med «+ Ny fasilitet»." />
              </div>
            ) : (
              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {l.fasiliteter.map((f) => (
                  <FasilitetKort key={f.id} f={f} />
                ))}
              </div>
            )}
          </Kort>
        ))
      )}
    </div>
  );
}
