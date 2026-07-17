import Link from "next/link";
import { Caps, Tittel, Kort, TomTilstand, T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { LocationFormV2 } from "./AdminLocationFormV2";

/**
 * AgencyOS — Anlegg (Gjennomføre · Anlegg), v2-port 16. juli 2026. Erstatter
 * AgPage/AgPageHead med v2-primitiver. Samme datakilde (Location → Facility
 * + booking-telling denne uka) uendret. Kjent, uendret begrensning: kun
 * "+ Nytt anlegg" (opprett lokasjon) er koblet — rediger/slett-lokasjon og
 * fasilitet-administrasjon (FacilityFormV2 finnes, ingen kallested) er IKKE
 * del av denne restylingen, se MASTER-SKJERMPLAN.md.
 */

export interface AnleggTile {
  id: string;
  tittel: string;
  ikonNavn: string;
  bookinger: number;
  beskrivelse: string | null;
}
export interface AdminAnleggV2Data {
  tittelOrd: string;
  flertall: boolean;
  tiles: AnleggTile[];
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
            Anleggene du disponerer. Tallet viser hvor presset hver ressurs er denne uka.
          </p>
        </div>
        <LocationFormV2 triggerLabel="+ Nytt anlegg" />
      </div>

      {data.tiles.length === 0 ? (
        <Kort>
          <TomTilstand icon="building-2" title="Ingen fasiliteter registrert ennå" sub="Legg til et anlegg først." />
        </Kort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {data.tiles.map((t) => (
            <Link key={t.id} href="/admin/availability" style={{ textDecoration: "none" }}>
              <Kort hover>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 10, background: T.panel2, color: T.lime }}>
                  <Icon name={t.ikonNavn} size={20} />
                </span>
                <div style={{ marginTop: 12, fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{t.tittel}</div>
                <div style={{ marginTop: "auto", paddingTop: 10, fontFamily: T.mono, fontSize: 10, color: T.mut }}>
                  <strong style={{ color: T.lime }}>{t.bookinger} {t.bookinger === 1 ? "booking" : "bookinger"} denne uka</strong> {t.beskrivelse ?? "—"}
                </div>
              </Kort>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
