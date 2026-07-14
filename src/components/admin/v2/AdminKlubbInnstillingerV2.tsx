"use client";

/**
 * AgencyOS v2 — Klubb-innstillinger (`/admin/klubb/innstillinger`,
 * AgencyOS Bølge 3.14, 2026-07-14). Port fra `(legacy)/klubb/innstillinger/
 * page.tsx` + `klubb-innstillinger-client.tsx` — samme
 * `addClub`/`updateClubSettings`/`lagreClubSettings`/`removeClub`-kontrakt
 * (`(legacy)/klubb/innstillinger/actions.ts`, delt, uendret). Multi-club
 * setup: org-innstillinger (singleton) + kort per klubb, rediger via
 * `BunnArk` i stedet for native `<dialog>`.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T, BunnArk, KpiFlis } from "@/components/v2";
import { Inndata, Velger, Avkryssing } from "@/components/v2/skjema";
import {
  addClub,
  lagreClubSettings,
  removeClub,
  updateClubSettings,
} from "@/app/admin/(legacy)/klubb/innstillinger/actions";

export type ClubFacilityV2 = { id: string; name: string; capacity: number; active: boolean };

export interface ClubItemV2 {
  id: string;
  name: string;
  address: string;
  active: boolean;
  facilities: ClubFacilityV2[];
  spillereCount: number;
  coacherCount: number;
  defaultFacilityId: string | null;
  dagligLederNavn: string;
  dagligLederEmail: string;
  apningstider: { hverdag: string; helg: string };
}

export interface ClubSettingsV2Data {
  clubName: string;
  dagligLeder: string;
  orgNr: string;
  epost: string;
  telefon: string;
  adresse: string;
  apningstider: { hverdag: string; helg: string };
}

function OrgInnstillingerV2({ settings, onEdit }: { settings: ClubSettingsV2Data; onEdit: () => void }) {
  const apningstider = [settings.apningstider.hverdag, settings.apningstider.helg].filter(Boolean).join(" · ");
  const rader: { icon: string; label: string; value: string }[] = [
    { icon: "building-2", label: "Klubbnavn", value: settings.clubName },
    { icon: "user", label: "Daglig leder", value: settings.dagligLeder },
    { icon: "fingerprint", label: "Org.nr", value: settings.orgNr },
    { icon: "mail", label: "E-post", value: settings.epost },
    { icon: "phone", label: "Telefon", value: settings.telefon },
    { icon: "map-pin", label: "Adresse", value: settings.adresse },
    { icon: "clock", label: "Åpningstider", value: apningstider },
  ];

  return (
    <Kort eyebrow="Org-innstillinger" action={<Knapp ghost icon="pencil" onClick={onEdit}>Rediger</Knapp>}>
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, marginBottom: 12 }}>Klubbinformasjon</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
        {rader.map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <Icon name={r.icon} size={14} style={{ color: T.mut, flex: "none" }} />
            <div style={{ minWidth: 0 }}>
              <Caps size={8.5}>{r.label}</Caps>
              <div style={{ marginTop: 2, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value || "—"}</div>
            </div>
          </div>
        ))}
      </div>
    </Kort>
  );
}

function OrgInnstillingerArkV2({ settings, onLukk }: { settings: ClubSettingsV2Data; onLukk: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [clubName, setClubName] = useState(settings.clubName);
  const [dagligLeder, setDagligLeder] = useState(settings.dagligLeder);
  const [orgNr, setOrgNr] = useState(settings.orgNr);
  const [epost, setEpost] = useState(settings.epost);
  const [telefon, setTelefon] = useState(settings.telefon);
  const [adresse, setAdresse] = useState(settings.adresse);
  const [hverdag, setHverdag] = useState(settings.apningstider.hverdag);
  const [helg, setHelg] = useState(settings.apningstider.helg);

  const lagre = () => {
    setFeil(null);
    startTransition(async () => {
      try {
        await lagreClubSettings({ clubName, dagligLeder, orgNr, epost, telefon, adresse, apningstider: { hverdag, helg } });
        router.refresh();
        onLukk();
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke lagre");
      }
    });
  };

  return (
    <BunnArk tittel="Rediger · Klubbinformasjon" onLukk={onLukk} laast={pending} bredde={520}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Inndata label="Klubbnavn" value={clubName} onChange={setClubName} placeholder="Gamle Fredrikstad Golfklubb" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <Inndata label="Daglig leder" value={dagligLeder} onChange={setDagligLeder} placeholder="Anders Kristiansen" />
          <Inndata label="Org.nr" value={orgNr} onChange={setOrgNr} placeholder="912 345 678" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <Inndata label="E-post" value={epost} onChange={setEpost} placeholder="post@gfgk.no" type="email" />
          <Inndata label="Telefon" value={telefon} onChange={setTelefon} placeholder="+47 69 00 00 00" />
        </div>
        <Inndata label="Adresse" value={adresse} onChange={setAdresse} placeholder="Bossumveien 1, 1632 Gamle Fredrikstad" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <Inndata label="Åpningstider · hverdag" value={hverdag} onChange={setHverdag} placeholder="08:00 – 21:00" />
          <Inndata label="Åpningstider · helg" value={helg} onChange={setHelg} placeholder="09:00 – 18:00" />
        </div>

        {feil && <div role="alert" style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{feil}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Knapp ghost onClick={onLukk} disabled={pending}>Avbryt</Knapp>
          <Knapp onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Lagre"}</Knapp>
        </div>
      </div>
    </BunnArk>
  );
}

function KlubbKortV2({ klubb, onEdit }: { klubb: ClubItemV2; onEdit: () => void }) {
  const defaultFacility = klubb.facilities.find((f) => f.id === klubb.defaultFacilityId) ?? klubb.facilities[0] ?? null;

  return (
    <Kort style={{ gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{ width: 36, height: 36, borderRadius: 9999, background: `color-mix(in srgb, ${T.lime} 12%, transparent)`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <Icon name="building-2" size={17} style={{ color: T.lime }} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg }}>{klubb.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>
              <Icon name="map-pin" size={11} />{klubb.address}
            </div>
          </div>
        </div>
        <StatusPill tone={klubb.active ? "up" : "info"}>{klubb.active ? "Aktiv" : "Inaktiv"}</StatusPill>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
        <StatV2 icon="users" label="Spillere" value={String(klubb.spillereCount)} />
        <StatV2 icon="user" label="Coacher" value={String(klubb.coacherCount)} />
        <StatV2 icon="map-pin" label="Fasiliteter" value={String(klubb.facilities.length)} />
        <StatV2 icon="clock" label="Åpningstider" value={klubb.apningstider.hverdag} />
      </div>

      <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "8px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="star" size={11} style={{ color: T.lime }} />
          <Caps size={8.5}>Default-fasilitet</Caps>
        </div>
        <div style={{ marginTop: 4, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{defaultFacility ? defaultFacility.name : "Ingen fasiliteter ennå"}</div>
      </div>

      <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "8px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="user" size={11} style={{ color: T.lime }} />
          <Caps size={8.5}>Daglig leder</Caps>
        </div>
        <div style={{ marginTop: 4, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{klubb.dagligLederNavn}</div>
        <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>{klubb.dagligLederEmail}</div>
      </div>

      <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
        <Knapp ghost icon="pencil" onClick={onEdit}>Rediger</Knapp>
        <Link href={`/admin/klubb/${klubb.id}/rediger`} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, border: `1px solid ${T.borderS}`, background: T.panel3, padding: "10px 16px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.mut, textDecoration: "none" }}>
          Detaljer
        </Link>
      </div>
    </Kort>
  );
}

function StatV2({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <Icon name={icon} size={14} style={{ color: T.mut, flex: "none" }} />
      <div style={{ minWidth: 0 }}>
        <Caps size={8.5}>{label}</Caps>
        <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      </div>
    </div>
  );
}

function KlubbArkV2({ mode, klubb, onLukk }: { mode: "add" | "edit"; klubb: ClubItemV2 | null; onLukk: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [name, setName] = useState(klubb?.name ?? "");
  const [address, setAddress] = useState(klubb?.address ?? "");
  const [active, setActive] = useState(klubb?.active ?? true);
  const [defaultFacilityId, setDefaultFacilityId] = useState(klubb?.defaultFacilityId ?? klubb?.facilities[0]?.id ?? "");
  const [dagligLederEmail, setDagligLederEmail] = useState(klubb?.dagligLederEmail ?? "");
  const [hverdag, setHverdag] = useState(klubb?.apningstider.hverdag ?? "08:00 – 21:00");
  const [helg, setHelg] = useState(klubb?.apningstider.helg ?? "09:00 – 18:00");

  const lagre = () => {
    setFeil(null);
    startTransition(async () => {
      try {
        if (mode === "add") {
          await addClub({ name, address, active });
        } else if (klubb) {
          await updateClubSettings(klubb.id, {
            name, address, active,
            defaultFacilityId: defaultFacilityId || null,
            daglig_leder_email: dagligLederEmail,
            apningstider: { hverdag, helg },
          });
        }
        router.refresh();
        onLukk();
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke lagre");
      }
    });
  };

  const deaktiver = () => {
    if (!klubb) return;
    if (!confirm(`Deaktivere klubben «${klubb.name}»?`)) return;
    startTransition(async () => {
      try {
        await removeClub(klubb.id);
        router.refresh();
        onLukk();
      } catch {
        setFeil("Kunne ikke deaktivere klubben");
      }
    });
  };

  return (
    <BunnArk tittel={mode === "add" ? "Ny klubb" : `Rediger · ${klubb?.name ?? ""}`} onLukk={onLukk} laast={pending} bredde={520}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <Inndata label="Klubb-navn" value={name} onChange={setName} placeholder="Gamle Fredrikstad Golfklubb" />
          <Avkryssing label={active ? "Aktiv" : "Inaktiv"} checked={active} onChange={setActive} />
        </div>
        <Inndata label="Adresse" value={address} onChange={setAddress} placeholder="Bossumveien 1, 1632 Gamle Fredrikstad" />

        {mode === "edit" && klubb && (
          <>
            <Velger
              label="Default-fasilitet (brukes ved hurtigbooking)"
              value={defaultFacilityId}
              onChange={setDefaultFacilityId}
              options={[{ value: "", label: "Ingen valgt" }, ...klubb.facilities.map((f) => ({ value: f.id, label: `${f.name}${!f.active ? " (inaktiv)" : ""}` }))]}
            />
            <Inndata label="Daglig leder · e-post" value={dagligLederEmail} onChange={setDagligLederEmail} placeholder="daglig-leder@gfgk.no" type="email" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              <Inndata label="Åpningstider · hverdag" value={hverdag} onChange={setHverdag} placeholder="08:00 – 21:00" />
              <Inndata label="Åpningstider · helg" value={helg} onChange={setHelg} placeholder="09:00 – 18:00" />
            </div>
          </>
        )}

        {feil && <div role="alert" style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{feil}</div>}

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {mode === "edit" && klubb && <Knapp ghost icon="power" onClick={deaktiver} disabled={pending}>Deaktiver</Knapp>}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <Knapp ghost onClick={onLukk} disabled={pending}>Avbryt</Knapp>
            <Knapp onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Lagre"}</Knapp>
          </div>
        </div>
      </div>
    </BunnArk>
  );
}

export function AdminKlubbInnstillingerV2({ klubber, settings }: { klubber: ClubItemV2[]; settings: ClubSettingsV2Data }) {
  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState<ClubItemV2 | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const aktive = klubber.filter((k) => k.active).length;
  const totalFasiliteter = klubber.reduce((s, k) => s + k.facilities.length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps size={9}>AgencyOS · Klubb-innstillinger</Caps>
        <Tittel em={`${klubber.length} klubber`}>Klubb-innstillinger</Tittel>
        <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 13, color: T.mut }}>
          Multi-club setup. Hver klubb har egne fasiliteter, åpningstider og daglig leder. Default-fasilitet brukes ved hurtigbooking fra PlayerHQ.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: T.gap }}>
        <KpiFlis label="Klubber totalt" value={klubber.length} delta={`${aktive} aktive`} instant />
        <KpiFlis label="Fasiliteter" value={totalFasiliteter} instant />
        <KpiFlis label="Spillere" value={klubber.reduce((s, k) => s + k.spillereCount, 0)} instant />
        <KpiFlis label="Coacher" value={klubber.reduce((s, k) => s + k.coacherCount, 0)} instant />
      </div>

      <OrgInnstillingerV2 settings={settings} onEdit={() => setSettingsOpen(true)} />

      {klubber.length === 0 ? (
        <Kort>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 16px", textAlign: "center" }}>
            <span style={{ width: 56, height: 56, borderRadius: 9999, background: T.panel2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="building-2" size={22} style={{ color: T.mut }} /></span>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Ingen klubber registrert</div>
            <p style={{ maxWidth: 360, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Legg til din første klubb for å begynne å håndtere multi-club setup. Hver klubb kan ha egne fasiliteter, åpningstider og daglig leder.</p>
            <Knapp icon="plus" onClick={() => setAddOpen(true)}>Legg til klubb</Knapp>
          </div>
        </Kort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: T.gap }}>
          {klubber.map((k) => <KlubbKortV2 key={k.id} klubb={k} onEdit={() => setEdit(k)} />)}
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 260, borderRadius: T.rCard, border: `1px dashed ${T.border}`, background: "transparent", color: T.mut, cursor: "pointer" }}
          >
            <span style={{ width: 44, height: 44, borderRadius: 9999, background: T.panel2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={18} /></span>
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>Legg til klubb</span>
            <span style={{ maxWidth: 220, textAlign: "center", fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Multi-club lar deg drifte flere anlegg fra samme AgencyOS.</span>
          </button>
        </div>
      )}

      {addOpen && <KlubbArkV2 mode="add" klubb={null} onLukk={() => setAddOpen(false)} />}
      {edit && <KlubbArkV2 mode="edit" klubb={edit} onLukk={() => setEdit(null)} />}
      {settingsOpen && <OrgInnstillingerArkV2 settings={settings} onLukk={() => setSettingsOpen(false)} />}
    </div>
  );
}
