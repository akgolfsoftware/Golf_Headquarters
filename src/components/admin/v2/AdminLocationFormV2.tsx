"use client";

/**
 * AgencyOS — Lokasjon/fasilitet-skjema, v2-port 16. juli 2026, KOBLET
 * 17. juli 2026 (B8a): rediger lokasjon, deaktiver/aktiver (soft delete —
 * aldri hard delete, bookinger/availability refererer radene) og full
 * fasilitet-administrasjon (opprett/rediger/deaktiver med type + beskrivelse).
 * Server actions: location-actions.ts (zod-validert, COACH/ADMIN).
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { T, Caps, Knapp, Velger } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { CourseMap } from "@/components/gameplan/course-map";
import {
  createLocation, updateLocation, setLocationActive,
  createFacility, updateFacility, setFacilityActive,
  type FacilityInput,
} from "@/app/admin/(legacy)/anlegg/location-actions";

/** Mapbox tilgjengelig? Uten token degraderer vi til rene tallfelt (ingen krasj). */
const HAR_MAPBOX = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
/** Nøytralt startpunkt (Norge) når anlegget ennå ikke har en posisjon. */
const NORGE_SENTER = { lat: 61.2, lng: 8.9 };
/** Tomt lag — vi gjenbruker CourseMap kun for satellitt + ett draggbart punkt. */
const TOMT_GEOJSON: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

/** Speiler Prisma-enumet FacilityType (valideres server-side med zod). */
export type FasilitetType = FacilityInput["type"];

export const FASILITET_TYPER: { value: FasilitetType; label: string }[] = [
  { value: "STUDIO", label: "Studio (innendørs TrackMan)" },
  { value: "RANGE_1F", label: "Driving range 1. etasje" },
  { value: "RANGE_2F", label: "Driving range 2. etasje" },
  { value: "PUTTING_GREEN", label: "Puttinggreen" },
  { value: "SHORT_GAME", label: "Nærspillsområde" },
  { value: "COURSE_9H", label: "9-hullsbane" },
  { value: "COURSE_18H", label: "18-hullsbane" },
  { value: "SPECIFIC_HOLES", label: "Enkelthull (f.eks. hull 4/5)" },
  { value: "GENERAL", label: "Generelt" },
];

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", marginBottom: 6, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>{label}</span>
      {children}
    </label>
  );
}
const inputStyle: React.CSSProperties = { width: "100%", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 12px", fontSize: 13, color: T.fg, outline: "none", boxSizing: "border-box" };

const hintStyle: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, color: T.mut, letterSpacing: "0.04em" };

function fmtKoord(n: number): string {
  return n.toFixed(5);
}

/**
 * Valgfritt GPS-punkt for anlegget. Med Mapbox: tapp/dra i satellittkartet
 * (gjenbruker CourseMap i interaktiv modus med ett draggbart sikte-punkt).
 * Uten token: rene breddegrad/lengdegrad-tallfelt (ærlig degradering, ingen krasj).
 * Tom posisjon vises ærlig som «Ingen posisjon satt».
 */
function FjernKnapp({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 10, color: T.mut, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      Fjern posisjon
    </button>
  );
}

function parseKoord(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function KartVelger({
  lat,
  lng,
  setLat,
  setLng,
}: {
  lat: number | null;
  lng: number | null;
  setLat: (n: number | null) => void;
  setLng: (n: number | null) => void;
}) {
  const satt = lat != null && lng != null;
  const fjern = () => {
    setLat(null);
    setLng(null);
  };

  if (!HAR_MAPBOX) {
    // Fallback uten Mapbox-token: rene tallfelt (ærlig degradering, ingen krasj).
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Felt label="Breddegrad (lat)">
            <input type="number" step="any" inputMode="decimal" value={lat == null ? "" : String(lat)} onChange={(e) => setLat(parseKoord(e.target.value))} placeholder="59.91273" style={inputStyle} />
          </Felt>
          <Felt label="Lengdegrad (lng)">
            <input type="number" step="any" inputMode="decimal" value={lng == null ? "" : String(lng)} onChange={(e) => setLng(parseKoord(e.target.value))} placeholder="10.74609" style={inputStyle} />
          </Felt>
        </div>
        <p style={hintStyle}>Kart utilgjengelig (mangler NEXT_PUBLIC_MAPBOX_TOKEN). Skriv inn koordinater manuelt, eller la begge stå tomme for ingen posisjon.</p>
        {(lat != null || lng != null) && <div style={{ alignSelf: "flex-start" }}><FjernKnapp onClick={fjern} /></div>}
      </div>
    );
  }

  const senter = satt ? { lat: lat as number, lng: lng as number } : NORGE_SENTER;
  const sikte = satt ? { lat: lat as number, lng: lng as number } : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <CourseMap
        center={senter}
        geojson={TOMT_GEOJSON}
        zoom={satt ? 14 : 4.4}
        interactive
        sikte={sikte}
        onKlikk={(p) => {
          setLat(p.lat);
          setLng(p.lng);
        }}
        className="h-56 w-full overflow-hidden rounded-xl border border-border"
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        {satt ? (
          <span style={{ ...hintStyle, color: T.fg }}>{fmtKoord(lat as number)}, {fmtKoord(lng as number)}</span>
        ) : (
          <span style={hintStyle}>Ingen posisjon satt — tapp i kartet.</span>
        )}
        {satt && <FjernKnapp onClick={fjern} />}
      </div>
      <p style={hintStyle}>Tapp for å sette posisjon. Dra markøren for å justere.</p>
    </div>
  );
}

function DialogSkall({
  open,
  onClose,
  tittel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  tittel: React.ReactNode;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      style={{ borderRadius: T.rCard, border: `1px solid ${T.borderS}`, background: T.panel, padding: 0, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", maxWidth: 420, width: "100%", color: T.fg }}
    >
      <div style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
          <Caps>{tittel}</Caps>
          <button type="button" onClick={onClose} aria-label="Lukk" style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, color: T.mut, cursor: "pointer" }}>
            <Icon name="x" size={14} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

/**
 * Fotknapper: valgfri sekundærhandling til venstre (Deaktiver/Aktiver igjen —
 * aldri «Slett», soft delete er regelen) + Avbryt/Lagre til høyre.
 */
function Fotknapper({
  pending,
  sekundaer,
  onAvbryt,
}: {
  pending: boolean;
  sekundaer?: { label: string; farlig?: boolean; onClick: () => void };
  onAvbryt: () => void;
}) {
  return (
    <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      {sekundaer && (
        <button
          type="button"
          onClick={sekundaer.onClick}
          disabled={pending}
          style={
            sekundaer.farlig
              ? { borderRadius: 9999, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, background: `color-mix(in srgb, ${T.down} 6%, transparent)`, padding: "8px 16px", fontSize: 12, fontWeight: 600, color: T.down, cursor: "pointer", opacity: pending ? 0.6 : 1 }
              : { borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "8px 16px", fontSize: 12, fontWeight: 600, color: T.fg, cursor: "pointer", opacity: pending ? 0.6 : 1 }
          }
        >
          {sekundaer.label}
        </button>
      )}
      <button type="button" onClick={onAvbryt} disabled={pending} style={{ marginLeft: "auto", borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: T.fg, cursor: "pointer", opacity: pending ? 0.6 : 1 }}>
        Avbryt
      </button>
      <button type="submit" disabled={pending} style={{ borderRadius: 9999, border: "1px solid transparent", background: T.lime, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: T.onLime, cursor: "pointer", opacity: pending ? 0.6 : 1 }}>
        {pending ? "Lagrer…" : "Lagre"}
      </button>
    </div>
  );
}

function FeilBoks({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" style={{ marginTop: 14, borderRadius: 10, border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontSize: 13, color: T.down }}>
      {children}
    </div>
  );
}

type LocationFormV2Props = {
  initial?: { id: string; name: string; address: string; active: boolean; latitude: number | null; longitude: number | null };
  triggerLabel: string;
};

export function LocationFormV2({ initial, triggerLabel }: LocationFormV2Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [lat, setLat] = useState<number | null>(initial?.latitude ?? null);
  const [lng, setLng] = useState<number | null>(initial?.longitude ?? null);

  function aapne() {
    // Reset til gjeldende server-verdier hver gang dialogen åpnes.
    setName(initial?.name ?? "");
    setAddress(initial?.address ?? "");
    setLat(initial?.latitude ?? null);
    setLng(initial?.longitude ?? null);
    setError(null);
    setOpen(true);
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setError("Navn og adresse er påkrevd.");
      return;
    }
    // Posisjon er valgfri, men må være hel: begge eller ingen.
    if ((lat == null) !== (lng == null)) {
      setError("Posisjon må ha både breddegrad og lengdegrad — eller la begge stå tomme.");
      return;
    }
    // Begge satt sammen (eller begge null for å tømme posisjonen).
    const latitude = lat != null && lng != null ? lat : null;
    const longitude = lat != null && lng != null ? lng : null;
    setError(null);
    startTransition(async () => {
      try {
        if (initial) await updateLocation(initial.id, { name, address, active: initial.active, latitude, longitude });
        else await createLocation({ name, address, active: true, latitude, longitude });
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke lagre.");
      }
    });
  }

  function deaktiver() {
    if (!initial) return;
    if (!confirm(`Deaktivere «${initial.name}»? Deaktiverte anlegg vises ikke i booking. Du kan aktivere det igjen senere.`)) return;
    startTransition(async () => {
      try {
        await setLocationActive(initial.id, false);
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke deaktivere.");
      }
    });
  }

  function aktiver() {
    if (!initial) return;
    startTransition(async () => {
      try {
        await setLocationActive(initial.id, true);
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke aktivere.");
      }
    });
  }

  return (
    <>
      {initial ? (
        <button type="button" onClick={aapne} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 11, color: T.lime, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {triggerLabel}
        </button>
      ) : (
        <Knapp icon="plus" onClick={aapne}>{triggerLabel}</Knapp>
      )}
      <DialogSkall open={open} onClose={() => setOpen(false)} tittel={`${initial ? "Endre" : "Ny"} lokasjon`}>
        <form onSubmit={lagre}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Felt label="Navn">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="f.eks. Mulligan Indoor" style={inputStyle} />
            </Felt>
            <Felt label="Adresse">
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Storgata 1, 1601 Fredrikstad" style={inputStyle} />
            </Felt>
            <div>
              <span style={{ display: "block", marginBottom: 6, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>Posisjon på kart (valgfri)</span>
              {/* Monteres først når dialogen er åpen — unngår Mapbox-instanser for lukkede skjemaer og gir ferskt sentrum hver gang. */}
              {open && <KartVelger lat={lat} lng={lng} setLat={setLat} setLng={setLng} />}
            </div>
          </div>
          {error && <FeilBoks>{error}</FeilBoks>}
          <Fotknapper
            pending={pending}
            sekundaer={
              initial
                ? initial.active
                  ? { label: "Deaktiver", farlig: true, onClick: deaktiver }
                  : { label: "Aktiver igjen", onClick: aktiver }
                : undefined
            }
            onAvbryt={() => setOpen(false)}
          />
        </form>
      </DialogSkall>
    </>
  );
}

type FacilityFormV2Props = {
  /** Påkrevd for opprett (uten `initial`); ubrukt i rediger-modus. */
  locationId?: string;
  initial?: { id: string; name: string; capacity: number; active: boolean; type: FasilitetType; description: string | null };
  triggerLabel: string;
};

export function FacilityFormV2({ locationId, initial, triggerLabel }: FacilityFormV2Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [capacity, setCapacity] = useState(initial ? String(initial.capacity) : "1");
  const [type, setType] = useState<FasilitetType>(initial?.type ?? "GENERAL");
  const [beskrivelse, setBeskrivelse] = useState(initial?.description ?? "");

  function aapne() {
    setName(initial?.name ?? "");
    setCapacity(initial ? String(initial.capacity) : "1");
    setType(initial?.type ?? "GENERAL");
    setBeskrivelse(initial?.description ?? "");
    setError(null);
    setOpen(true);
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    const cap = Number(capacity);
    if (!name.trim() || !Number.isInteger(cap) || cap < 1) {
      setError("Navn og kapasitet (helt tall, minst 1) er påkrevd.");
      return;
    }
    setError(null);
    // Tom beskrivelse sendes som eksplisitt null — nullstiller feltet i DB.
    const data: FacilityInput = { name, capacity: cap, active: initial?.active ?? true, type, description: beskrivelse.trim() || null };
    startTransition(async () => {
      try {
        if (initial) await updateFacility(initial.id, data);
        else if (locationId) await createFacility(locationId, data);
        else throw new Error("locationId mangler");
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke lagre.");
      }
    });
  }

  function deaktiver() {
    if (!initial) return;
    if (!confirm(`Deaktivere «${initial.name}»? Deaktiverte fasiliteter vises ikke i booking. Du kan aktivere den igjen senere.`)) return;
    startTransition(async () => {
      try {
        await setFacilityActive(initial.id, false);
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke deaktivere.");
      }
    });
  }

  function aktiver() {
    if (!initial) return;
    startTransition(async () => {
      try {
        await setFacilityActive(initial.id, true);
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke aktivere.");
      }
    });
  }

  return (
    <>
      {initial ? (
        <button type="button" onClick={aapne} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 11, color: T.lime, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {triggerLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={aapne}
          style={{ borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: T.fg, cursor: "pointer" }}
        >
          {triggerLabel}
        </button>
      )}
      <DialogSkall open={open} onClose={() => setOpen(false)} tittel={`${initial ? "Endre" : "Ny"} fasilitet`}>
        <form onSubmit={lagre}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Felt label="Navn">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="f.eks. Performance Studio" style={inputStyle} />
            </Felt>
            <Velger
              label="Type"
              options={FASILITET_TYPER}
              value={type}
              onChange={(v) => {
                const valgt = FASILITET_TYPER.find((t) => t.value === v);
                if (valgt) setType(valgt.value);
              }}
            />
            <Felt label="Kapasitet">
              <input type="number" min="1" step="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} style={inputStyle} />
            </Felt>
            <Felt label="Beskrivelse (valgfri)">
              <input type="text" value={beskrivelse} onChange={(e) => setBeskrivelse(e.target.value)} placeholder="f.eks. 12 matter · 2 TrackMan" style={inputStyle} />
            </Felt>
          </div>
          {error && <FeilBoks>{error}</FeilBoks>}
          <Fotknapper
            pending={pending}
            sekundaer={
              initial
                ? initial.active
                  ? { label: "Deaktiver", farlig: true, onClick: deaktiver }
                  : { label: "Aktiver igjen", onClick: aktiver }
                : undefined
            }
            onAvbryt={() => setOpen(false)}
          />
        </form>
      </DialogSkall>
    </>
  );
}
