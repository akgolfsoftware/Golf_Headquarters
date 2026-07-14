"use client";

/**
 * AgencyOS v2 — Coach/admin-profil (`/admin/profile`, AgencyOS Bølge 3.15,
 * 2026-07-14). Port fra `(legacy)/profile/page.tsx` + `edit-form.tsx` +
 * `profile-actions.tsx` — samme `oppdaterCoachProfil`-kontrakt (ekte
 * FormData-action → native ukontrollerte felt, samme mønster som
 * «Rediger spiller»). «Skjul»-knappen er fortsatt en placeholder-toast
 * (uendret — ingen reell deaktiverings-backend finnes).
 */

import { useRef, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T } from "@/components/v2";
import { oppdaterCoachProfil, type OppdaterCoachProfilResult } from "@/app/admin/(legacy)/profile/actions";

export interface AdminProfilV2Initial {
  navn: string;
  epost: string;
  phone: string;
  hcp: string;
  homeClub: string;
  bio: string;
  certifications: string;
  languages: string;
  clubs: string;
}

export interface AdminProfilV2Data {
  navn: string;
  rolle: "ADMIN" | "COACH" | string;
  tier: string;
  opprettetTekst: string;
  homeClub: string | null;
  personFelter: { label: string; value: string; mono?: boolean }[];
  bio: string;
  certifications: string[];
  languages: string[];
  clubs: string[];
  initial: AdminProfilV2Initial;
}

const feltStil: CSSProperties = {
  width: "100%", boxSizing: "border-box", appearance: "none",
  background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11,
  padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, outline: "none",
};

function initialer(navn: string): string {
  return navn.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function Felt({ name, label, type = "text", required, defaultValue, placeholder, error }: {
  name: string; label: string; type?: string; required?: boolean; defaultValue?: string; placeholder?: string; error?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Caps size={9}>{label}{required && <span style={{ color: T.down }}> *</span>}</Caps>
      <input type={type} name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} style={{ ...feltStil, ...(error ? { borderColor: T.down } : null) }} />
      {error && <span role="alert" style={{ fontFamily: T.ui, fontSize: 11, color: T.down }}>{error}</span>}
    </label>
  );
}

function RedigerProfilV2({ initial }: { initial: AdminProfilV2Initial }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [aapen, setAapen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generellFeil, setGenerellFeil] = useState<string | null>(null);
  const [suksess, setSuksess] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setGenerellFeil(null);
    setSuksess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res: OppdaterCoachProfilResult = await oppdaterCoachProfil(formData);
      if (!res.ok) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        if (res.error) setGenerellFeil(res.error);
        return;
      }
      setSuksess(true);
      setAapen(false);
      router.refresh();
    });
  }

  if (!aapen) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        {suksess && <StatusPill tone="up">Profil oppdatert</StatusPill>}
        <Knapp onClick={() => { setAapen(true); setSuksess(false); }}>Rediger profil</Knapp>
      </div>
    );
  }

  return (
    <Kort>
      <form ref={formRef} onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Rediger profil</div>
          <button type="button" onClick={() => setAapen(false)} aria-label="Avbryt" style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 6, border: "none", background: "none", color: T.mut, cursor: "pointer" }}>
            <Icon name="x" size={15} />
          </button>
        </div>

        {generellFeil && <div role="alert" style={{ borderRadius: 10, border: `1px solid color-mix(in srgb, ${T.down} 40%, transparent)`, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, padding: "12px 14px", fontFamily: T.ui, fontSize: 13, color: T.down }}>{generellFeil}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          <Caps size={9}>Personalia</Caps>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <Felt name="navn" label="Fullt navn" required defaultValue={initial.navn} error={fieldErrors.navn} />
            <Felt name="epost" label="E-post" type="email" required defaultValue={initial.epost} error={fieldErrors.epost} />
            <Felt name="phone" label="Mobil" type="tel" defaultValue={initial.phone} placeholder="F.eks. 90123456" />
            <Felt name="hcp" label="Handicap" defaultValue={initial.hcp} placeholder="F.eks. 8,4" error={fieldErrors.hcp} />
            <Felt name="homeClub" label="Hjemmeklubb" defaultValue={initial.homeClub} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          <Caps size={9}>Profesjonelt</Caps>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Caps size={9}>Bio · maks 280 tegn</Caps>
            <textarea name="bio" defaultValue={initial.bio} rows={3} maxLength={280} placeholder="Kort tekst som vises på offentlig profil" style={{ ...feltStil, resize: "vertical", ...(fieldErrors.bio ? { borderColor: T.down } : null) }} />
            {fieldErrors.bio && <span role="alert" style={{ fontFamily: T.ui, fontSize: 11, color: T.down }}>{fieldErrors.bio}</span>}
          </label>
          <Felt name="certifications" label="Sertifiseringer · separer med komma" defaultValue={initial.certifications} placeholder="PGA Class A, TPI Level 2" />
          <Felt name="languages" label="Språk · separer med komma" defaultValue={initial.languages} placeholder="Norsk, Engelsk" />
          <Felt name="clubs" label="Klubb-tilknytning · separer med komma" defaultValue={initial.clubs} placeholder="Gamle Fredrikstad GK, Onsøy GK" />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          <Knapp ghost onClick={() => setAapen(false)}>Avbryt</Knapp>
          <Knapp icon="check" type="submit" disabled={pending}>{pending ? "Lagrer…" : "Lagre alt"}</Knapp>
        </div>
      </form>
    </Kort>
  );
}

function Seksjon({ tittel, aux, children }: { tittel: string; aux: string; children: React.ReactNode }) {
  return (
    <Kort style={{ padding: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg }}>{tittel}</div>
        <Caps size={8.5}>{aux}</Caps>
      </div>
      <div>{children}</div>
    </Kort>
  );
}

function FeltRad({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.mut }}>{label}</span>
      <span style={{ fontFamily: mono ? T.mono : T.ui, fontSize: 13.5, color: T.fg }}>{value}</span>
    </div>
  );
}

function ChipRad({ label, chips, tom, aksent, mono }: { label: string; chips: string[]; tom: string; aksent?: boolean; mono?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.mut }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {chips.length === 0 ? (
          <span style={{ fontFamily: T.ui, fontSize: 13, color: T.mut }}>{tom}</span>
        ) : (
          chips.map((c) => (
            <span key={c} style={{ borderRadius: 6, padding: "4px 9px", fontFamily: mono ? T.mono : T.ui, fontSize: 11, fontWeight: 600, background: aksent ? `color-mix(in srgb, ${T.lime} 12%, transparent)` : T.panel3, color: aksent ? T.lime : T.fg }}>{c}</span>
          ))
        )}
      </div>
    </div>
  );
}

export function AdminProfilV2({ navn, rolle, tier, opprettetTekst, homeClub, personFelter, bio, certifications, languages, clubs, initial }: AdminProfilV2Data) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <Caps size={9}>AgencyOS · Konto · Profil</Caps>
          <Tittel em="for spillerne">Profilen din. Slik den ser ut</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Endringer du gjør her vises på akgolf.no/coach innen 5 minutter.</p>
        </div>
        <RedigerProfilV2 initial={initial} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 320px) 1fr", gap: T.gap, alignItems: "start" }}>
        <Kort>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <span style={{ width: 88, height: 88, borderRadius: 9999, background: T.lime, display: "grid", placeItems: "center", fontFamily: T.disp, fontWeight: 700, fontSize: 30, color: T.onLime }}>{initialer(navn) || "AK"}</span>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>{navn}</div>
              <div style={{ marginTop: 2, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>{rolle === "ADMIN" ? "Administrator" : "Coach"} · AK Golf</div>
            </div>
            <StatusPill tone="up">Aktiv {rolle === "ADMIN" ? "admin" : "coach"}</StatusPill>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.ui, fontSize: 12.5 }}><span style={{ color: T.mut }}>Abonnement</span><span style={{ fontFamily: T.mono, fontWeight: 600, color: T.fg }}>{tier === "PRO" ? "Pro (299 kr/mnd)" : "Gratis"}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.ui, fontSize: 12.5 }}><span style={{ color: T.mut }}>Opprettet</span><span style={{ fontFamily: T.mono, fontWeight: 600, color: T.fg }}>{opprettetTekst}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.ui, fontSize: 12.5 }}><span style={{ color: T.mut }}>Klubb</span><span style={{ fontFamily: T.mono, fontWeight: 600, color: T.fg }}>{homeClub ?? "—"}</span></div>
            </div>
            <Link href="/" style={{ width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 8, border: `1px solid ${T.border}`, background: T.panel2, padding: "12px 14px", fontFamily: T.ui, fontSize: 12.5, color: T.fg, textDecoration: "none" }}>
              <span>Se offentlig profil</span>
              <Icon name="external-link" size={13} />
            </Link>
          </div>
        </Kort>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Seksjon tittel="Personalia" aux="Synlig for spillere">
            {personFelter.map((f) => <FeltRad key={f.label} label={f.label} value={f.value} mono={f.mono} />)}
          </Seksjon>

          <Seksjon tittel="Profesjonelt" aux="Vises på offentlig profil">
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, padding: "14px 20px", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.mut }}>Bio</div>
                <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 10, color: T.mut }}>Maks 280 tegn</div>
              </div>
              <div style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg, lineHeight: 1.6 }}>{bio || "Legg til en kort bio som vises på offentlig profil."}</div>
            </div>
            <ChipRad label="Sertifiseringer" chips={certifications} tom="Legg til sertifisering" aksent />
            <ChipRad label="Språk" chips={languages} tom="Legg til språk" />
            <ChipRad label="Klubb-tilknytning" chips={clubs} tom="Legg til klubb" mono />
          </Seksjon>

          <Seksjon tittel="Galleri" aux="4 bilder vises på offentlig profil">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, padding: 16 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 10, border: `1.5px dashed ${T.border}`, color: T.mut }}>
                  <Icon name="image" size={22} />
                  <span style={{ fontFamily: T.ui, fontSize: 11 }}>Last opp</span>
                </div>
              ))}
            </div>
          </Seksjon>

          <Kort style={{ border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, background: `color-mix(in srgb, ${T.down} 6%, transparent)`, padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", borderBottom: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)` }}>
              <Icon name="alert-triangle" size={16} style={{ color: T.down }} />
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 13.5, color: T.down }}>Farlig sone</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
              <div>
                <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>Skjul offentlig profil</div>
                <div style={{ marginTop: 2, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Spillere kan fortsatt finne deg via direkte lenke</div>
              </div>
              <Knapp ghost onClick={() => toast.info("Kontakt support for å deaktivere kontoen")}>Skjul</Knapp>
            </div>
          </Kort>
        </div>
      </div>
    </div>
  );
}
