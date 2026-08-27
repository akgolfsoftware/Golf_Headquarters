"use client";

/**
 * AgencyOS Innstillinger · Klubb og steder — Train-lock (T13, 27.08.2026).
 *
 * KONSOLIDERER to tidligere separate v2-skjermer til ÉN flate (Anders,
 * oppgavebrief 27.08.2026 — "(legacy)/anlegg konsolider mot klubb, ikke to"):
 *   - AdminKlubbInnstillingerV2 (org-innstillinger + klubb-liste, enkel
 *     fasilitet-TELLING)
 *   - AdminAnleggV2 (full fasilitet-CRUD med type-ikon/kapasitet/bookinger
 *     denne uka)
 * Klubb-kortet her viser BEGGE: org-profil øverst, så per-klubb-kort med
 * full inline fasilitet-liste (samme info som AdminAnleggV2 sin
 * FasilitetKort) — ingen egen "Anlegg"-skjerm lenger.
 *
 * Ingen egen Train-lock-fasit tegner denne skjermen — mønster-port til
 * tl-kit (kort/rad/knapp), ikke pixel. Data/mutasjoner UENDRET:
 *   - addClub / updateClubSettings / removeClub / lagreClubSettings
 *     (../../app/admin/(legacy)/klubb/innstillinger/actions) — dekker
 *     opprett/rediger/deaktiver klubb (samme Location-tabell som anlegg
 *     brukte, bare via klubb-actionen — createLocation/updateLocation/
 *     setLocationActive fra anlegg er derfor IKKE importert her, ville vært
 *     duplisert funksjonalitet)
 *   - createFacility / updateFacility / setFacilityActive
 *     (../../app/admin/(legacy)/anlegg/location-actions)
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";
import {
  addClub,
  lagreClubSettings,
  removeClub,
  updateClubSettings,
} from "@/app/admin/(legacy)/klubb/innstillinger/actions";
import {
  createFacility,
  updateFacility,
  setFacilityActive,
} from "@/app/admin/(legacy)/anlegg/location-actions";
import { FASILITET_TYPER, type FasilitetType } from "@/components/admin/v2/AdminLocationFormV2";
import { TlBadge, TlCaps, TlKnapp, TlKort, TlTittel, TlTomTilstand, TL_PRESS } from "./tl-kit";

// ── Datakontrakt (mappes fra Prisma i ruten) ───────────────────
export interface KlubbFasilitet {
  id: string;
  name: string;
  ikonNavn: string;
  type: FasilitetType;
  capacity: number;
  active: boolean;
  bookinger: number;
  description: string | null;
}

export interface KlubbItem {
  id: string;
  name: string;
  address: string;
  active: boolean;
  latitude: number | null;
  longitude: number | null;
  facilities: KlubbFasilitet[];
  spillereCount: number;
  coacherCount: number;
  defaultFacilityId: string | null;
  dagligLederNavn: string;
  dagligLederEmail: string;
  apningstider: {
    hverdag: string;
    helg: string;
  };
}

export interface ClubSettingsData {
  clubName: string;
  dagligLeder: string;
  orgNr: string;
  epost: string;
  telefon: string;
  adresse: string;
  apningstider: {
    hverdag: string;
    helg: string;
  };
}

type Props = {
  klubber: KlubbItem[];
  settings: ClubSettingsData;
};

// ── Delte skjema-primitiver (lokale — ikke rediger tl-kit.tsx) ──

function TlInndata({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <TlCaps size={10}>{label}</TlCaps>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 44,
          padding: "0 14px",
          borderRadius: TL.radius.field,
          background: TL.dock,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          color: TL.text,
          fontSize: 14,
          fontFamily: TL.font.sans,
          border: "none",
        }}
      />
    </div>
  );
}

function TlVelger({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <TlCaps size={10}>{label}</TlCaps>
      </div>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            height: 44,
            padding: "0 34px 0 14px",
            borderRadius: TL.radius.field,
            background: TL.dock,
            boxShadow: `inset 0 0 0 1px ${TL.hair}`,
            color: TL.text,
            fontSize: 14,
            fontFamily: TL.font.sans,
            border: "none",
            appearance: "none",
            cursor: "pointer",
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Icon name="chevron-down" size={14} style={{ color: TL.mute }} />
        </span>
      </div>
    </div>
  );
}

function TlBryter({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <TlCaps size={10}>{label}</TlCaps>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={TL_PRESS}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <span
          aria-hidden
          style={{
            width: 44,
            height: 26,
            borderRadius: 999,
            background: checked ? TL.fill : TL.dim,
            position: "relative",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: checked ? undefined : 2,
              right: checked ? 2 : undefined,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: checked ? TL.onFill : TL.mute,
            }}
          />
        </span>
        <span style={{ fontSize: 13, color: TL.text }}>{sub ?? (checked ? "Aktiv" : "Inaktiv")}</span>
      </button>
    </div>
  );
}

function TlFeil({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" style={{ marginTop: 14, fontSize: 13, color: TL.danger }}>
      {children}
    </p>
  );
}

/** Delt modal-ramme — samme mønster som AdminApiKeysTrainLock sin NyNokkelModal. */
function TlModal({
  tittel,
  sub,
  onClose,
  pending,
  children,
}: {
  tittel: React.ReactNode;
  sub?: React.ReactNode;
  onClose: () => void;
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: TL.scrim,
      }}
      onClick={() => {
        if (!pending) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "88vh",
          overflowY: "auto",
          borderRadius: TL.radius.sheet,
          background: TL.elev,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          padding: "20px 22px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{tittel}</h2>
            {sub && <div style={{ marginTop: 4, fontSize: 13, color: TL.mute }}>{sub}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className={TL_PRESS}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 8,
              background: TL.dock,
              boxShadow: `inset 0 0 0 1px ${TL.hair}`,
              border: "none",
              cursor: "pointer",
              flex: "none",
            }}
          >
            <Icon name="x" size={14} style={{ color: TL.mute }} />
          </button>
        </div>
        <div style={{ marginTop: 18 }}>{children}</div>
      </div>
    </div>
  );
}

// ----------------- Org-innstillinger -----------------

function OrgKort({ settings, onEdit }: { settings: ClubSettingsData; onEdit: () => void }) {
  const apningstider = [settings.apningstider.hverdag, settings.apningstider.helg].filter(Boolean).join(" · ");
  const rader: { icon: string; label: string; value: string }[] = [
    { icon: "building-2", label: "Klubbnavn", value: settings.clubName },
    { icon: "user", label: "Daglig leder", value: settings.dagligLeder },
    { icon: "file-text", label: "Org.nr", value: settings.orgNr },
    { icon: "mail", label: "E-post", value: settings.epost },
    { icon: "phone", label: "Telefon", value: settings.telefon },
    { icon: "map-pin", label: "Adresse", value: settings.adresse },
    { icon: "clock", label: "Åpningstider", value: apningstider },
  ];

  return (
    <TlKort
      eyebrow="Org-innstillinger"
      action={
        <TlKnapp variant="tertiaer" icon="pencil" onClick={onEdit}>
          Rediger
        </TlKnapp>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {rader.map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <Icon name={r.icon} size={14} style={{ color: TL.mute, flex: "none" }} />
            <div style={{ minWidth: 0 }}>
              <TlCaps size={9}>{r.label}</TlCaps>
              <div style={{ marginTop: 2, fontSize: 13, fontWeight: 600, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.value || "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </TlKort>
  );
}

function OrgDialog({ settings, onClose }: { settings: ClubSettingsData; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [clubName, setClubName] = useState(settings.clubName);
  const [dagligLeder, setDagligLeder] = useState(settings.dagligLeder);
  const [orgNr, setOrgNr] = useState(settings.orgNr);
  const [epost, setEpost] = useState(settings.epost);
  const [telefon, setTelefon] = useState(settings.telefon);
  const [adresse, setAdresse] = useState(settings.adresse);
  const [hverdag, setHverdag] = useState(settings.apningstider.hverdag);
  const [helg, setHelg] = useState(settings.apningstider.helg);

  function lagre() {
    setError(null);
    startTransition(async () => {
      try {
        await lagreClubSettings({ clubName, dagligLeder, orgNr, epost, telefon, adresse, apningstider: { hverdag, helg } });
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre");
      }
    });
  }

  return (
    <TlModal tittel="Rediger · Klubbinformasjon" sub="Org-innstillinger" onClose={onClose} pending={pending}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TlInndata label="Klubbnavn" value={clubName} onChange={setClubName} placeholder="Gamle Fredrikstad Golfklubb" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <TlInndata label="Daglig leder" value={dagligLeder} onChange={setDagligLeder} placeholder="Anders Kristiansen" />
          <TlInndata label="Org.nr" value={orgNr} onChange={setOrgNr} placeholder="912 345 678" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <TlInndata label="E-post" type="email" value={epost} onChange={setEpost} placeholder="post@gfgk.no" />
          <TlInndata label="Telefon" type="tel" value={telefon} onChange={setTelefon} placeholder="+47 69 00 00 00" />
        </div>
        <TlInndata label="Adresse" value={adresse} onChange={setAdresse} placeholder="Bossumveien 1, 1632 Gamle Fredrikstad" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <TlInndata label="Åpningstider · hverdag" value={hverdag} onChange={setHverdag} placeholder="08:00 – 21:00" />
          <TlInndata label="Åpningstider · helg" value={helg} onChange={setHelg} placeholder="09:00 – 18:00" />
        </div>
      </div>
      {error && <TlFeil>{error}</TlFeil>}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <TlKnapp variant="tertiaer" disabled={pending} onClick={onClose} style={{ flex: 1 }}>
          Avbryt
        </TlKnapp>
        <TlKnapp variant="primaer" icon={pending ? "loader" : "check"} disabled={pending} onClick={lagre} style={{ flex: 1 }}>
          {pending ? "Lagrer…" : "Lagre"}
        </TlKnapp>
      </div>
    </TlModal>
  );
}

// ----------------- Klubb-dialog (legg til / rediger) -----------------

function KlubbDialog({
  mode,
  klubb,
  onClose,
}: {
  mode: "add" | "edit";
  klubb: KlubbItem | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(klubb?.name ?? "");
  const [address, setAddress] = useState(klubb?.address ?? "");
  const [active, setActive] = useState(klubb?.active ?? true);
  const [defaultFacilityId, setDefaultFacilityId] = useState<string>(klubb?.defaultFacilityId ?? klubb?.facilities[0]?.id ?? "");
  const [dagligLederEmail, setDagligLederEmail] = useState(klubb?.dagligLederEmail ?? "");
  const [hverdag, setHverdag] = useState(klubb?.apningstider.hverdag ?? "08:00 – 21:00");
  const [helg, setHelg] = useState(klubb?.apningstider.helg ?? "09:00 – 18:00");

  function lagre() {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "add") {
          await addClub({ name, address, active });
        } else if (klubb) {
          await updateClubSettings(klubb.id, {
            name,
            address,
            active,
            defaultFacilityId: defaultFacilityId || null,
            daglig_leder_email: dagligLederEmail,
            apningstider: { hverdag, helg },
          });
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre");
      }
    });
  }

  function deaktiver() {
    if (!klubb) return;
    if (!confirm(`Deaktivere klubben «${klubb.name}»?`)) return;
    startTransition(async () => {
      try {
        await removeClub(klubb.id);
        onClose();
      } catch {
        setError("Kunne ikke deaktivere klubben");
      }
    });
  }

  const facilityOptions = [
    { value: "", label: "Ingen valgt" },
    ...(klubb?.facilities.map((f) => ({ value: f.id, label: `${f.name}${f.active ? "" : " (inaktiv)"}` })) ?? []),
  ];

  return (
    <TlModal tittel={mode === "add" ? "Ny klubb" : `Rediger · ${klubb?.name ?? ""}`} sub="Klubb-innstillinger" onClose={onClose} pending={pending}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "start" }}>
          <TlInndata label="Klubb-navn" value={name} onChange={setName} placeholder="Gamle Fredrikstad Golfklubb" />
          <TlBryter label="Status" checked={active} onChange={setActive} sub={active ? "Aktiv" : "Inaktiv"} />
        </div>
        <TlInndata label="Adresse" value={address} onChange={setAddress} placeholder="Bossumveien 1, 1632 Gamle Fredrikstad" />

        {mode === "edit" && klubb && (
          <>
            <TlVelger label="Default-fasilitet (brukes ved hurtigbooking)" value={defaultFacilityId} onChange={setDefaultFacilityId} options={facilityOptions} />
            <TlInndata label="Daglig leder · e-post" type="email" value={dagligLederEmail} onChange={setDagligLederEmail} placeholder="daglig-leder@gfgk.no" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <TlInndata label="Åpningstider · hverdag" value={hverdag} onChange={setHverdag} placeholder="08:00 – 21:00" />
              <TlInndata label="Åpningstider · helg" value={helg} onChange={setHelg} placeholder="09:00 – 18:00" />
            </div>
          </>
        )}
      </div>

      {error && <TlFeil>{error}</TlFeil>}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 20 }}>
        {mode === "edit" && klubb && (
          <TlKnapp variant="fare" icon="x-circle" disabled={pending} onClick={deaktiver}>
            Deaktiver
          </TlKnapp>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <TlKnapp variant="tertiaer" disabled={pending} onClick={onClose}>
            Avbryt
          </TlKnapp>
          <TlKnapp variant="primaer" icon={pending ? "loader" : "check"} disabled={pending} onClick={lagre}>
            {pending ? "Lagrer…" : "Lagre"}
          </TlKnapp>
        </div>
      </div>
    </TlModal>
  );
}

// ----------------- Fasilitet-dialog (legg til / rediger) -----------------

function FasilitetDialog({
  locationId,
  initial,
  onClose,
}: {
  /** Påkrevd for opprett (uten `initial`); ubrukt i rediger-modus. */
  locationId?: string;
  initial?: KlubbFasilitet | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [capacity, setCapacity] = useState(initial ? String(initial.capacity) : "1");
  const [type, setType] = useState<FasilitetType>(initial?.type ?? "GENERAL");
  const [beskrivelse, setBeskrivelse] = useState(initial?.description ?? "");

  function lagre() {
    const cap = Number(capacity);
    if (!name.trim() || !Number.isInteger(cap) || cap < 1) {
      setError("Navn og kapasitet (helt tall, minst 1) er påkrevd.");
      return;
    }
    setError(null);
    // Tom beskrivelse sendes som eksplisitt null — nullstiller feltet i DB.
    const data = { name, capacity: cap, active: initial?.active ?? true, type, description: beskrivelse.trim() || null };
    startTransition(async () => {
      try {
        if (initial) await updateFacility(initial.id, data);
        else if (locationId) await createFacility(locationId, data);
        else throw new Error("locationId mangler");
        onClose();
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
        onClose();
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
        onClose();
      } catch {
        setError("Kunne ikke aktivere.");
      }
    });
  }

  return (
    <TlModal tittel={`${initial ? "Endre" : "Ny"} fasilitet`} sub="Anlegg" onClose={onClose} pending={pending}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TlInndata label="Navn" value={name} onChange={setName} placeholder="f.eks. Performance Studio" />
        <TlVelger label="Type" value={type} onChange={(v) => setType(v as FasilitetType)} options={FASILITET_TYPER} />
        <TlInndata label="Kapasitet" type="number" value={capacity} onChange={setCapacity} />
        <TlInndata label="Beskrivelse (valgfri)" value={beskrivelse} onChange={setBeskrivelse} placeholder="f.eks. 12 matter · 2 TrackMan" />
      </div>
      {error && <TlFeil>{error}</TlFeil>}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 20 }}>
        {initial && (
          initial.active ? (
            <TlKnapp variant="fare" icon="x-circle" disabled={pending} onClick={deaktiver}>
              Deaktiver
            </TlKnapp>
          ) : (
            <TlKnapp variant="tertiaer" icon="rotate-ccw" disabled={pending} onClick={aktiver}>
              Aktiver igjen
            </TlKnapp>
          )
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <TlKnapp variant="tertiaer" disabled={pending} onClick={onClose}>
            Avbryt
          </TlKnapp>
          <TlKnapp variant="primaer" icon={pending ? "loader" : "check"} disabled={pending} onClick={lagre}>
            {pending ? "Lagrer…" : "Lagre"}
          </TlKnapp>
        </div>
      </div>
    </TlModal>
  );
}

// ----------------- Fasilitet-kort (inline i klubb-kortet) -----------------

function FasilitetKort({ f, onEdit }: { f: KlubbFasilitet; onEdit: () => void }) {
  return (
    <div
      style={{
        background: TL.dock,
        borderRadius: TL.radius.field,
        padding: 14,
        opacity: f.active ? 1 : 0.65,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 10,
            background: TL.dim,
            color: TL.text,
            flex: "none",
          }}
        >
          <Icon name={f.ikonNavn} size={17} />
        </span>
        {!f.active && <TlBadge tone="fare">Deaktivert</TlBadge>}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: TL.text }}>{f.name}</div>
      <div style={{ fontSize: 11, color: TL.mute, fontFamily: TL.font.mono }}>
        {f.active ? (
          <span style={{ color: TL.text }}>
            {f.bookinger} {f.bookinger === 1 ? "booking" : "bookinger"} denne uka
          </span>
        ) : (
          <span>Vises ikke i booking</span>
        )}{" "}
        · {f.description ?? "—"}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 4 }}>
        <TlKnapp variant="tertiaer" icon="pencil" onClick={onEdit}>
          Endre
        </TlKnapp>
      </div>
    </div>
  );
}

// ----------------- Klubb-kort (org-lokasjon + fasiliteter) -----------------

function KlubbSeksjon({
  klubb,
  onEditKlubb,
  onNyFasilitet,
  onEditFasilitet,
}: {
  klubb: KlubbItem;
  onEditKlubb: () => void;
  onNyFasilitet: () => void;
  onEditFasilitet: (f: KlubbFasilitet) => void;
}) {
  const defaultFacility = klubb.facilities.find((f) => f.id === klubb.defaultFacilityId) ?? klubb.facilities[0] ?? null;

  return (
    <TlKort pad="20px 22px">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{klubb.name}</span>
            <TlBadge tone={klubb.active ? "nøytral" : "fare"}>{klubb.active ? "Aktiv" : "Inaktiv"}</TlBadge>
          </div>
          <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: TL.mute }}>
            <Icon name="map-pin" size={12} />
            {klubb.address}
          </div>
        </div>
        <TlKnapp variant="tertiaer" icon="pencil" onClick={onEditKlubb}>
          Rediger
        </TlKnapp>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginTop: 16,
          paddingTop: 14,
          borderTop: `1px solid ${TL.hair}`,
        }}
      >
        <StatCelle label="Spillere" value={String(klubb.spillereCount)} />
        <StatCelle label="Coacher" value={String(klubb.coacherCount)} />
        <StatCelle label="Fasiliteter" value={String(klubb.facilities.length)} />
        <StatCelle label="Åpningstider" value={klubb.apningstider.hverdag || "—"} />
        <StatCelle label="Daglig leder" value={klubb.dagligLederNavn} sub={klubb.dagligLederEmail} />
        <StatCelle label="Default-fasilitet" value={defaultFacility ? defaultFacility.name : "Ingen ennå"} />
      </div>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${TL.hair}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <TlCaps size={10}>Fasiliteter</TlCaps>
        <TlKnapp variant="tertiaer" icon="plus" onClick={onNyFasilitet}>
          Ny fasilitet
        </TlKnapp>
      </div>

      {klubb.facilities.length === 0 ? (
        <div style={{ marginTop: 8 }}>
          <TlTomTilstand icon="building-2" title="Ingen fasiliteter ennå" sub="Legg til den første med «Ny fasilitet»." />
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {klubb.facilities.map((f) => (
            <FasilitetKort key={f.id} f={f} onEdit={() => onEditFasilitet(f)} />
          ))}
        </div>
      )}
    </TlKort>
  );
}

function StatCelle({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <TlCaps size={9}>{label}</TlCaps>
      <div style={{ marginTop: 2, fontSize: 13, fontWeight: 600, color: TL.text, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: TL.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
    </div>
  );
}

// ----------------- Hovedkomponent -----------------

export function AdminKlubbInnstillingerTrainLock({ klubber, settings }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editKlubb, setEditKlubb] = useState<KlubbItem | null>(null);
  const [orgOpen, setOrgOpen] = useState(false);
  const [fasilitet, setFasilitet] = useState<{ locationId?: string; initial?: KlubbFasilitet } | null>(null);

  const aktive = klubber.filter((k) => k.active).length;

  function lukkOgOppdater(lukk: () => void) {
    lukk();
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <TlTittel sub={`Klubb og steder · ${klubber.length === 1 ? "1 klubb" : `${klubber.length} klubber`} · ${aktive} aktive`}>
        Innstillinger
      </TlTittel>

      <OrgKort settings={settings} onEdit={() => setOrgOpen(true)} />

      {klubber.length === 0 ? (
        <TlKort>
          <TlTomTilstand
            icon="building-2"
            title="Ingen klubber registrert"
            sub="Legg til din første klubb for å begynne å håndtere multi-club setup. Hver klubb kan ha egne fasiliteter, åpningstider og daglig leder."
          />
          <div style={{ marginTop: 16 }}>
            <TlKnapp variant="primaer" icon="plus" onClick={() => setAddOpen(true)}>
              Legg til klubb
            </TlKnapp>
          </div>
        </TlKort>
      ) : (
        <>
          {klubber.map((k) => (
            <KlubbSeksjon
              key={k.id}
              klubb={k}
              onEditKlubb={() => setEditKlubb(k)}
              onNyFasilitet={() => setFasilitet({ locationId: k.id })}
              onEditFasilitet={(f) => setFasilitet({ initial: f })}
            />
          ))}
          <TlKnapp variant="sekundaer" icon="plus" onClick={() => setAddOpen(true)}>
            Legg til klubb
          </TlKnapp>
        </>
      )}

      {addOpen && <KlubbDialog mode="add" klubb={null} onClose={() => lukkOgOppdater(() => setAddOpen(false))} />}
      {editKlubb && <KlubbDialog mode="edit" klubb={editKlubb} onClose={() => lukkOgOppdater(() => setEditKlubb(null))} />}
      {orgOpen && <OrgDialog settings={settings} onClose={() => lukkOgOppdater(() => setOrgOpen(false))} />}
      {fasilitet && (
        <FasilitetDialog
          locationId={fasilitet.locationId}
          initial={fasilitet.initial ?? null}
          onClose={() => lukkOgOppdater(() => setFasilitet(null))}
        />
      )}
    </div>
  );
}
