"use client";

/**
 * AgencyOS v2 — Anlegg (`/admin/anlegg`, AgencyOS Bølge 2.2, 2026-07-14).
 * Port fra `(legacy)/anlegg/page.tsx` + `location-form.tsx` (kun `LocationForm`
 * — `FacilityForm` er dødt/ubrukt kode i legacy-filen også, se
 * `docs/opprydding/knip-rapport-2026-07-12.txt`, portes derfor ikke). Samme
 * `createLocation`-kontrakt. Fasilitet-tiles er fortsatt rene lenker til
 * `/admin/availability` — ingen ny rediger/slett-funksjon lagt til utover det
 * som faktisk var koblet i legacy-siden.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, Icon, T, BunnArk } from "@/components/v2";
import { Inndata, Avkryssing } from "@/components/v2/skjema";
import { createLocation } from "@/app/admin/(legacy)/anlegg/location-actions";

export interface AdminAnleggV2Tile {
  id: string;
  tittel: string;
  ikon: string;
  bookinger: number;
  beskrivelse: string | null;
}

function tallordTittel(n: number): { tittel: string; italic: string } {
  const TALLORD = ["Null", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv"];
  return { tittel: n < TALLORD.length ? TALLORD[n] : String(n), italic: n === 1 ? "fasilitet." : "fasiliteter." };
}

function NyttAnleggSkjema({ onLagret, onAvbryt }: { onLagret: () => void; onAvbryt: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [active, setActive] = useState(true);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const lagre = () => {
    if (!name.trim() || !address.trim()) { setFeil("Navn og adresse er påkrevd."); return; }
    setFeil(null);
    startTransition(async () => {
      try {
        await createLocation({ name, address, active });
        onLagret();
      } catch {
        setFeil("Kunne ikke lagre.");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
      <Inndata label="Navn" value={name} onChange={setName} placeholder="f.eks. Mulligan Indoor" />
      <Inndata label="Adresse" value={address} onChange={setAddress} placeholder="Storgata 1, 1601 Fredrikstad" />
      <Avkryssing label="Aktiv" checked={active} onChange={setActive} />
      {feil && <div role="alert" style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{feil}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Knapp ghost onClick={onAvbryt} disabled={pending}>Avbryt</Knapp>
        <Knapp icon="check" onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Lagre"}</Knapp>
      </div>
    </div>
  );
}

export function AdminAnleggV2({ tiles }: { tiles: AdminAnleggV2Tile[] }) {
  const router = useRouter();
  const [apen, setApen] = useState(false);
  const { tittel, italic } = tallordTittel(tiles.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps size={9}>Gjennomføre · Anlegg</Caps>
          <Tittel em={italic}>{tittel}</Tittel>
          <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4, maxWidth: 460 }}>
            Anleggene du disponerer. Tallet viser hvor presset hver ressurs er denne uka.
          </div>
        </div>
        <Knapp icon="plus" onClick={() => setApen(true)}>Nytt anlegg</Knapp>
      </div>

      {tiles.length === 0 ? (
        <Kort>
          <div style={{ padding: "26px 10px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Ingen fasiliteter registrert ennå — legg til et anlegg først.
          </div>
        </Kort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: T.gap }}>
          {tiles.map((t) => (
            <Link key={t.id} href="/admin/availability" style={{ textDecoration: "none" }}>
              <Kort hover pad="14px 16px" style={{ minHeight: 108, justifyContent: "space-between", gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Icon name={t.ikon} size={16} style={{ color: T.lime }} />
                </span>
                <div>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg, lineHeight: 1.25 }}>{t.tittel}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 6 }}>
                    <b style={{ color: T.lime }}>{t.bookinger} {t.bookinger === 1 ? "booking" : "bookinger"} denne uka</b> {t.beskrivelse ?? "—"}
                  </div>
                </div>
              </Kort>
            </Link>
          ))}
        </div>
      )}

      {apen && (
        <BunnArk tittel="Nytt anlegg" onLukk={() => setApen(false)}>
          <NyttAnleggSkjema onLagret={() => { setApen(false); router.refresh(); }} onAvbryt={() => setApen(false)} />
        </BunnArk>
      )}
    </div>
  );
}
