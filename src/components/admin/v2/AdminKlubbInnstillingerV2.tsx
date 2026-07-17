"use client";

/**
 * AgencyOS Klubb-innstillinger — v2 (retning C «Presis»). Rekomponerer
 * /admin/klubb/innstillinger (multi-club setup) i v2-språket, drevet av EKTE
 * Prisma-data fra ruten. Bygget av v2-komponentbiblioteket (src/components/v2)
 * + lokale visnings-/dialog-komposisjoner på T.*-tokens — ingen ad-hoc UI,
 * ingen rå hex.
 *
 * Data/funksjon bevart 1:1 fra legacy-siden
 * (src/app/admin/(legacy)/klubb/innstillinger):
 *   - Singleton org-innstillinger (ClubSettings) — vis + rediger.
 *   - Klubb-liste (Location) med fasiliteter, spillere/coacher-tall,
 *     default-fasilitet og daglig leder — legg til / rediger / deaktiver.
 * Server-actions (addClub/updateClubSettings/removeClub/lagreClubSettings)
 * gjenbrukes uendret fra ../(legacy)/klubb/innstillinger/actions.
 *
 * Mobil-først: KPI-grid 2→4 kolonner, klubb-kort 1→2 kolonner, dialoger som
 * fullskjerm-ark under sm / sentrert panel over.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  CTAPill,
  Knapp,
  StatusPill,
  TomTilstand,
  Icon,
  Inndata,
  Bryter,
  Velger,
  T,
} from "@/components/v2";
import {
  addClub,
  lagreClubSettings,
  removeClub,
  updateClubSettings,
} from "@/app/admin/(legacy)/klubb/innstillinger/actions";

// ── Datakontrakt (mappes fra Prisma i ruten) ───────────────────
export interface ClubFacility {
  id: string;
  name: string;
  capacity: number;
  active: boolean;
}

export interface ClubItem {
  id: string;
  name: string;
  address: string;
  active: boolean;
  facilities: ClubFacility[];
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
  klubber: ClubItem[];
  settings: ClubSettingsData;
};

export function AdminKlubbInnstillingerV2({ klubber, settings }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState<ClubItem | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const aktive = klubber.filter((k) => k.active).length;
  const totalFasiliteter = klubber.reduce((sum, k) => sum + k.facilities.length, 0);
  const totalSpillere = klubber.reduce((s, k) => s + k.spillereCount, 0);
  const totalCoacher = klubber.reduce((s, k) => s + k.coacherCount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>{`${klubber.length === 1 ? "1 klubb" : `${klubber.length} klubber`} · ${aktive} aktive · AgencyOS`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="innstillinger.">Klubb-</Tittel>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
        <KpiFlis tint label="Klubber totalt" value={klubber.length} />
        <KpiFlis label="Fasiliteter" value={totalFasiliteter} />
        <KpiFlis label="Spillere" value={totalSpillere} />
        <KpiFlis label="Coacher" value={totalCoacher} />
      </div>

      <OrgInnstillingerPanel settings={settings} onEdit={() => setSettingsOpen(true)} />

      {klubber.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="building-2"
            title="Ingen klubber registrert"
            sub="Legg til din første klubb for å begynne å håndtere multi-club setup. Hver klubb kan ha egne fasiliteter, åpningstider og daglig leder."
          />
          <div style={{ marginTop: 16 }}>
            <CTAPill icon="plus">
              <span onClick={() => setAddOpen(true)}>Legg til klubb</span>
            </CTAPill>
          </div>
        </Kort>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: T.gap }}>
          {klubber.map((k) => (
            <KlubbKort key={k.id} klubb={k} onEdit={() => setEdit(k)} />
          ))}
          <LeggTilKort onClick={() => setAddOpen(true)} />
        </div>
      )}

      {addOpen && (
        <KlubbDialog
          mode="add"
          klubb={null}
          onClose={() => {
            setAddOpen(false);
            router.refresh();
          }}
        />
      )}

      {edit && (
        <KlubbDialog
          mode="edit"
          klubb={edit}
          onClose={() => {
            setEdit(null);
            router.refresh();
          }}
        />
      )}

      {settingsOpen && (
        <SettingsDialog
          settings={settings}
          onClose={() => {
            setSettingsOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// ----------------- Org-innstillinger (singleton) -----------------

function OrgInnstillingerPanel({
  settings,
  onEdit,
}: {
  settings: ClubSettingsData;
  onEdit: () => void;
}) {
  const apningstider = [settings.apningstider.hverdag, settings.apningstider.helg]
    .filter(Boolean)
    .join(" · ");

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
    <Kort
      eyebrow="Org-innstillinger"
      action={
        <span onClick={onEdit}>
          <CTAPill ghost icon="pencil">
            Rediger
          </CTAPill>
        </span>
      }
    >
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: T.fg, marginBottom: 14 }}>
        Klubbinformasjon
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 14, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
        {rader.map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <Icon name={r.icon} size={14} style={{ color: T.mut, flex: "none" }} />
            <div style={{ minWidth: 0 }}>
              <Caps size={8.5}>{r.label}</Caps>
              <div style={{ marginTop: 2, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.value || "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Kort>
  );
}

function SettingsDialog({
  settings,
  onClose,
}: {
  settings: ClubSettingsData;
  onClose: () => void;
}) {
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
        await lagreClubSettings({
          clubName,
          dagligLeder,
          orgNr,
          epost,
          telefon,
          adresse,
          apningstider: { hverdag, helg },
        });
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre");
      }
    });
  }

  return (
    <V2ModalRamme
      eyebrow="Org-innstillinger"
      title="Rediger · Klubbinformasjon"
      onClose={onClose}
      pending={pending}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Inndata label="Klubbnavn" value={clubName} onChange={setClubName} placeholder="Gamle Fredrikstad Golfklubb" />

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
          <Inndata label="Daglig leder" value={dagligLeder} onChange={setDagligLeder} placeholder="Anders Kristiansen" />
          <Inndata label="Org.nr" value={orgNr} onChange={setOrgNr} placeholder="912 345 678" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
          <Inndata label="E-post" type="email" value={epost} onChange={setEpost} placeholder="post@gfgk.no" />
          <Inndata label="Telefon" type="tel" value={telefon} onChange={setTelefon} placeholder="+47 69 00 00 00" />
        </div>

        <Inndata label="Adresse" value={adresse} onChange={setAdresse} placeholder="Bossumveien 1, 1632 Gamle Fredrikstad" />

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
          <Inndata label="Åpningstider · hverdag" value={hverdag} onChange={setHverdag} placeholder="08:00 – 21:00" />
          <Inndata label="Åpningstider · helg" value={helg} onChange={setHelg} placeholder="09:00 – 18:00" />
        </div>
      </div>

      {error && <DialogFeil>{error}</DialogFeil>}

      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
        <Knapp ghost disabled={pending} onClick={onClose}>
          Avbryt
        </Knapp>
        <Knapp disabled={pending} onClick={lagre}>
          {pending ? "Lagrer…" : "Lagre"}
        </Knapp>
      </div>
    </V2ModalRamme>
  );
}

// ----------------- Klubb-kort -----------------

function KlubbStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <Icon name={icon} size={14} style={{ color: T.mut, flex: "none" }} />
      <div style={{ minWidth: 0 }}>
        <Caps size={8.5}>{label}</Caps>
        <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function KlubbInfoBoks({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name={icon} size={12} style={{ color: T.lime }} />
        <Caps size={8.5}>{label}</Caps>
      </div>
      <div style={{ marginTop: 4, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{value}</div>
      {sub && <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>{sub}</div>}
    </div>
  );
}

function KlubbKort({ klubb, onEdit }: { klubb: ClubItem; onEdit: () => void }) {
  const defaultFacility =
    klubb.facilities.find((f) => f.id === klubb.defaultFacilityId) ?? klubb.facilities[0] ?? null;

  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 9999, background: `color-mix(in srgb, ${T.lime} 12%, transparent)`, color: T.lime, flex: "none" }}>
            <Icon name="building-2" size={17} style={{ color: T.lime }} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {klubb.name}
            </div>
            <div style={{ marginTop: 2, display: "flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
              <Icon name="map-pin" size={11} style={{ color: T.mut }} />
              {klubb.address}
            </div>
          </div>
        </div>
        <StatusPill tone={klubb.active ? "lime" : "info"}>{klubb.active ? "Aktiv" : "Inaktiv"}</StatusPill>
      </div>

      <div className="grid grid-cols-2" style={{ gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
        <KlubbStat icon="users" label="Spillere" value={String(klubb.spillereCount)} />
        <KlubbStat icon="user" label="Coacher" value={String(klubb.coacherCount)} />
        <KlubbStat icon="map-pin" label="Fasiliteter" value={String(klubb.facilities.length)} />
        <KlubbStat icon="clock" label="Åpningstider" value={klubb.apningstider.hverdag} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        <KlubbInfoBoks
          icon="star"
          label="Default-fasilitet"
          value={defaultFacility ? defaultFacility.name : "Ingen fasiliteter ennå"}
        />
        <KlubbInfoBoks icon="user" label="Daglig leder" value={klubb.dagligLederNavn} sub={klubb.dagligLederEmail} />
      </div>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
        <span onClick={onEdit}>
          <CTAPill ghost icon="pencil">
            Rediger
          </CTAPill>
        </span>
      </div>
    </Kort>
  );
}

function LeggTilKort({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: "pointer",
        minHeight: 260,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        borderRadius: T.rCard,
        border: `1px dashed ${T.borderS}`,
        background: T.panel2,
        color: T.mut,
        padding: 24,
      }}
    >
      <span style={{ display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 9999, background: T.panel3 }}>
        <Icon name="plus" size={19} style={{ color: T.fg }} />
      </span>
      <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg }}>Legg til klubb</span>
      <span style={{ maxWidth: 240, textAlign: "center", fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.5 }}>
        Multi-club lar deg drifte flere anlegg fra samme AgencyOS.
      </span>
    </button>
  );
}

// ----------------- Klubb-dialog (legg til / rediger) -----------------

type DialogProps = {
  mode: "add" | "edit";
  klubb: ClubItem | null;
  onClose: () => void;
};

function KlubbDialog({ mode, klubb, onClose }: DialogProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(klubb?.name ?? "");
  const [address, setAddress] = useState(klubb?.address ?? "");
  const [active, setActive] = useState(klubb?.active ?? true);
  const [defaultFacilityId, setDefaultFacilityId] = useState<string>(
    klubb?.defaultFacilityId ?? klubb?.facilities[0]?.id ?? "",
  );
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

  const facilityOptions =
    klubb?.facilities.map((f) => ({
      value: f.id,
      label: `${f.name}${f.active ? "" : " (inaktiv)"}`,
    })) ?? [];

  return (
    <V2ModalRamme
      eyebrow="Klubb-innstillinger"
      title={mode === "add" ? "Ny klubb" : `Rediger · ${klubb?.name ?? ""}`}
      onClose={onClose}
      pending={pending}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
          <Inndata label="Klubb-navn" value={name} onChange={setName} placeholder="Gamle Fredrikstad Golfklubb" />
          <div>
            <Bryter label="Status" sub={active ? "Aktiv" : "Inaktiv"} checked={active} onChange={setActive} />
          </div>
        </div>

        <Inndata label="Adresse" value={address} onChange={setAddress} placeholder="Bossumveien 1, 1632 Gamle Fredrikstad" />

        {mode === "edit" && klubb && (
          <>
            <Velger
              label="Default-fasilitet (brukes ved hurtigbooking)"
              options={[{ value: "", label: "Ingen valgt" }, ...facilityOptions]}
              value={defaultFacilityId}
              onChange={setDefaultFacilityId}
            />

            <Inndata
              label="Daglig leder · e-post"
              type="email"
              value={dagligLederEmail}
              onChange={setDagligLederEmail}
              placeholder="daglig-leder@gfgk.no"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
              <Inndata label="Åpningstider · hverdag" value={hverdag} onChange={setHverdag} placeholder="08:00 – 21:00" />
              <Inndata label="Åpningstider · helg" value={helg} onChange={setHelg} placeholder="09:00 – 18:00" />
            </div>
          </>
        )}
      </div>

      {error && <DialogFeil>{error}</DialogFeil>}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
        {mode === "edit" && klubb && (
          <Knapp ghost icon="x-circle" disabled={pending} onClick={deaktiver} style={{ color: T.down, borderColor: `color-mix(in srgb, ${T.down} 35%, transparent)` }}>
            Deaktiver
          </Knapp>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Knapp ghost disabled={pending} onClick={onClose}>
            Avbryt
          </Knapp>
          <Knapp disabled={pending} onClick={lagre}>
            {pending ? "Lagrer…" : "Lagre"}
          </Knapp>
        </div>
      </div>
    </V2ModalRamme>
  );
}

// ----------------- Delt modal-ramme -----------------

function DialogFeil({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        marginTop: 16,
        borderRadius: 10,
        border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`,
        background: `color-mix(in srgb, ${T.down} 10%, transparent)`,
        padding: "10px 14px",
        fontFamily: T.ui,
        fontSize: 13,
        color: T.down,
      }}
    >
      {children}
    </div>
  );
}

function V2ModalRamme({
  eyebrow,
  title,
  onClose,
  pending,
  children,
}: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  onClose: () => void;
  pending: boolean;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === "string" ? title : undefined}
      onClick={() => {
        if (!pending) onClose();
      }}
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl"
        style={{
          maxHeight: "90vh",
          overflowY: "auto",
          background: T.panel,
          border: `1px solid ${T.borderS}`,
          borderRadius: "20px 20px 0 0",
          padding: "20px 22px calc(20px + env(safe-area-inset-bottom))",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          outline: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Caps>{eyebrow}</Caps>
            <div style={{ marginTop: 4, fontFamily: T.disp, fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: T.fg }}>
              {title}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="v2-focus"
            style={{ appearance: "none", cursor: "pointer", background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 9999, width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.fg2, flex: "none" }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div style={{ marginTop: 18 }}>{children}</div>
      </div>
    </div>
  );
}
