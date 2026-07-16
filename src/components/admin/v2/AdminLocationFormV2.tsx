"use client";

/**
 * AgencyOS — Lokasjon/fasilitet-skjema, v2-port 16. juli 2026. Samme server
 * actions (createLocation/updateLocation/deleteLocation,
 * createFacility/updateFacility/deleteFacility) uendret.
 *
 * NB: /admin/anlegg kaller i dag KUN `LocationFormV2` uten `initial` (kun
 * "+ Nytt anlegg" — opprett). `FacilityFormV2` eksporteres her (portet 1:1
 * fra fasit) men har ingen kallested på siden ennå — samme tilstand som før
 * denne porten. Se MASTER-SKJERMPLAN.md-notatet for /admin/anlegg: å bygge
 * en fasilitet-administrasjonsflate er en egen oppgave, ikke del av denne
 * restylingen (ingen ny funksjon — kun presentasjonslaget er nytt).
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { T, Caps, Knapp } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { createLocation, updateLocation, deleteLocation, createFacility, updateFacility, deleteFacility } from "@/app/admin/(legacy)/anlegg/location-actions";

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", marginBottom: 6, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>{label}</span>
      {children}
    </label>
  );
}
const inputStyle: React.CSSProperties = { width: "100%", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 12px", fontSize: 13, color: T.fg, outline: "none", boxSizing: "border-box" };

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

function Fotknapper({ pending, onSlett, onAvbryt, sletter }: { pending: boolean; onSlett?: () => void; onAvbryt: () => void; sletter: boolean }) {
  return (
    <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      {onSlett && (
        <button
          type="button"
          onClick={onSlett}
          disabled={pending}
          style={{ borderRadius: 9999, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, background: `color-mix(in srgb, ${T.down} 6%, transparent)`, padding: "8px 16px", fontSize: 12, fontWeight: 600, color: T.down, cursor: "pointer", opacity: pending ? 0.6 : 1 }}
        >
          Slett
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

type LocationFormV2Props = {
  initial?: { id: string; name: string; address: string; active: boolean };
  triggerLabel: string;
};

export function LocationFormV2({ initial, triggerLabel }: LocationFormV2Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [active, setActive] = useState(initial?.active ?? true);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setError("Navn og adresse er påkrevd.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (initial) await updateLocation(initial.id, { name, address, active });
        else await createLocation({ name, address, active });
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm(`Slett lokasjonen «${initial.name}» (inkl. tilhørende fasiliteter)?`)) return;
    startTransition(async () => {
      try {
        await deleteLocation(initial.id);
      } catch {
        setError("Kunne ikke slette.");
      }
    });
  }

  return (
    <>
      {initial ? (
        <button type="button" onClick={() => setOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 11, color: T.lime, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {triggerLabel}
        </button>
      ) : (
        <Knapp icon="plus" onClick={() => setOpen(true)}>{triggerLabel}</Knapp>
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
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: T.fg }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Aktiv
            </label>
          </div>
          {error && (
            <div role="alert" style={{ marginTop: 14, borderRadius: 10, border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontSize: 13, color: T.down }}>
              {error}
            </div>
          )}
          <Fotknapper pending={pending} onSlett={initial ? slett : undefined} onAvbryt={() => setOpen(false)} sletter={false} />
        </form>
      </DialogSkall>
    </>
  );
}

type FacilityFormV2Props = {
  locationId: string;
  initial?: { id: string; name: string; capacity: number; active: boolean };
  triggerLabel: string;
};

export function FacilityFormV2({ locationId, initial, triggerLabel }: FacilityFormV2Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [capacity, setCapacity] = useState(initial ? String(initial.capacity) : "1");
  const [active, setActive] = useState(initial?.active ?? true);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    const cap = Number(capacity);
    if (!name.trim() || isNaN(cap) || cap < 1) {
      setError("Navn og kapasitet >= 1 er påkrevd.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (initial) await updateFacility(initial.id, { name, capacity: cap, active });
        else await createFacility({ locationId, name, capacity: cap, active });
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm(`Slett fasiliteten «${initial.name}»?`)) return;
    startTransition(async () => {
      try {
        await deleteFacility(initial.id);
        router.refresh();
      } catch {
        setError("Kunne ikke slette.");
      }
    });
  }

  return (
    <>
      {initial ? (
        <button type="button" onClick={() => setOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 11, color: T.lime, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {triggerLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
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
            <Felt label="Kapasitet">
              <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} style={inputStyle} />
            </Felt>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: T.fg }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Aktiv
            </label>
          </div>
          {error && (
            <div role="alert" style={{ marginTop: 14, borderRadius: 10, border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontSize: 13, color: T.down }}>
              {error}
            </div>
          )}
          <Fotknapper pending={pending} onSlett={initial ? slett : undefined} onAvbryt={() => setOpen(false)} sletter={false} />
        </form>
      </DialogSkall>
    </>
  );
}
