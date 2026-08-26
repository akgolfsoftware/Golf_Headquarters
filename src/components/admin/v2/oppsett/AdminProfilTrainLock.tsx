"use client";

/**
 * AgencyOS Konto (Min coach-profil) — Train-lock (T13, 26.08.2026).
 *
 * Fasit: designsystem/train-lock/AG-05 Mer-ark.dc.html (kontoraden/avatar-
 * behandlingen — «Meg»-mønsteret: avatar + navn øverst, felter under, som
 * i AG-18 «Konto»-raden) + DESIGN-SYSTEM.md §5 Liste-rad/Kort. Ingen egen
 * fasit tegner et fullt coach-profil-skjema, så feltlayouten er en
 * mønster-port av AdminProfilV2 (Paper), ikke pixel — samme datakontrakt
 * (AdminProfilV2Data) og SAMME server actions (oppdaterCoachProfil,
 * uploadAvatar, skalerAvatar) — designport, ikke funksjonsendring.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { oppdaterCoachProfil } from "@/app/admin/(legacy)/profile/actions";
import { uploadAvatar } from "@/lib/storage/avatar";
import { skalerAvatar } from "@/lib/klient/skaler-avatar";
import { TlCaps, TlKnapp, TlKort, TlTittel, TL_PRESS } from "./tl-kit";
import type { AdminProfilV2Data } from "../AdminProfilV2";

export type { AdminProfilV2Data };

function hcpTekst(hcp: number | null): string {
  if (hcp == null) return "";
  return hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

function TlFelt({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
  feil,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
  feil?: string;
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}><TlCaps size={10}>{label}</TlCaps></div>
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
          fontFamily: mono ? TL.font.mono : TL.font.sans,
          border: "none",
        }}
      />
      {feil && <p style={{ margin: "6px 0 0", fontSize: 11, color: TL.danger }}>{feil}</p>}
    </div>
  );
}

function TlTekstOmraade({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  feil,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  feil?: string;
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}><TlCaps size={10}>{label}</TlCaps></div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: TL.radius.field,
          background: TL.dock,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          color: TL.text,
          fontSize: 14,
          fontFamily: TL.font.sans,
          border: "none",
          resize: "vertical",
        }}
      />
      {feil && <p style={{ margin: "6px 0 0", fontSize: 11, color: TL.danger }}>{feil}</p>}
    </div>
  );
}

function TlProfilFelt({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}><TlCaps size={10}>{label}</TlCaps></div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 44,
          padding: "0 14px",
          borderRadius: TL.radius.field,
          background: TL.dock,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontFamily: mono ? TL.font.mono : TL.font.sans,
            fontVariantNumeric: mono ? "tabular-nums" : undefined,
            color: TL.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function TlAvatar({ src, navn, size = 96 }: { src: string | null; navn: string; size?: number }) {
  const initial = navn.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flex: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: TL.avatar,
        color: TL.onAvatar,
        fontSize: size * 0.36,
        fontWeight: 600,
        boxShadow: `inset 0 0 0 1px ${TL.hair}`,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={navn} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        initial
      )}
    </span>
  );
}

function TlMerke({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 26,
        padding: "0 10px",
        borderRadius: 999,
        background: TL.dim,
        color: TL.text,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export function AdminProfilTrainLock({ data }: { data: AdminProfilV2Data }) {
  const mobile = useMobile();
  const router = useRouter();

  const [navnFelt, setNavnFelt] = useState(data.navn);
  const [epostFelt, setEpostFelt] = useState(data.epost);
  const [phoneFelt, setPhoneFelt] = useState(data.phone ?? "");
  const [hcpFelt, setHcpFelt] = useState(hcpTekst(data.hcp));
  const [homeClubFelt, setHomeClubFelt] = useState(data.homeClub ?? "");
  const [bioFelt, setBioFelt] = useState(data.bio);
  const [certFelt, setCertFelt] = useState(data.certifications.join(", "));
  const [langFelt, setLangFelt] = useState(data.languages.join(", "));
  const [clubsFelt, setClubsFelt] = useState(data.clubs.join(", "));

  const [lagrer, startLagring] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generellFeil, setGenerellFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);
  const [avatarLagrer, startAvatarLagring] = useTransition();
  const [avatarFeil, setAvatarFeil] = useState<string | null>(null);
  const filInputRef = useRef<HTMLInputElement>(null);

  function velgBilde(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    setAvatarFeil(null);
    startAvatarLagring(async () => {
      try {
        const formData = new FormData();
        formData.append("file", await skalerAvatar(fil));
        const res = await uploadAvatar(formData);
        if (!res.ok) throw new Error(res.error);
        setAvatarUrl(res.url);
        router.refresh();
      } catch (err) {
        setAvatarFeil(err instanceof Error ? err.message : "Opplasting feilet.");
      } finally {
        if (filInputRef.current) filInputRef.current.value = "";
      }
    });
  }

  function lagreEndringer() {
    setFieldErrors({});
    setGenerellFeil(null);
    setLagret(false);
    const formData = new FormData();
    formData.set("navn", navnFelt);
    formData.set("epost", epostFelt);
    formData.set("phone", phoneFelt);
    formData.set("homeClub", homeClubFelt);
    formData.set("hcp", hcpFelt);
    formData.set("bio", bioFelt);
    formData.set("certifications", certFelt);
    formData.set("languages", langFelt);
    formData.set("clubs", clubsFelt);
    startLagring(async () => {
      const res = await oppdaterCoachProfil(formData);
      if (!res.ok) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        setGenerellFeil(res.error ?? "Kunne ikke lagre. Sjekk feltene under.");
        return;
      }
      setLagret(true);
      router.refresh();
    });
  }

  const lagreKnapp = (
    <TlKnapp variant="primaer" icon={lagrer ? "loader" : "check"} disabled={lagrer} onClick={lagreEndringer} full={mobile}>
      {lagrer ? "Lagrer …" : "Lagre endringer"}
    </TlKnapp>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <TlTittel sub="Konto">Profil</TlTittel>
        {!mobile && lagreKnapp}
      </div>

      <TlKort pad={mobile ? "22px 18px" : "26px 24px"}>
        <div style={{ display: "flex", alignItems: "center", gap: mobile ? 16 : 22, flexDirection: mobile ? "column" : "row", textAlign: mobile ? "center" : "left" }}>
          <TlAvatar src={avatarUrl} navn={data.navn} size={mobile ? 88 : 96} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: mobile ? 22 : 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text, margin: 0 }}>{data.navn}</h2>
            <div style={{ display: "flex", gap: 6, marginTop: 9, justifyContent: mobile ? "center" : "flex-start", flexWrap: "wrap" }}>
              <TlMerke>{data.rolleLabel}</TlMerke>
              {data.homeClub && <TlMerke>{data.homeClub}</TlMerke>}
            </div>
          </div>
          <label htmlFor="admin-profil-avatar-input-tl" className={TL_PRESS} style={{ cursor: avatarLagrer ? "default" : "pointer" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 44,
                padding: "0 20px",
                borderRadius: TL.radius.pill,
                background: "transparent",
                color: TL.mute,
                boxShadow: `inset 0 0 0 1px ${TL.hair}`,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {avatarLagrer ? "Laster opp …" : "Bytt bilde"}
            </span>
          </label>
          <input
            ref={filInputRef}
            id="admin-profil-avatar-input-tl"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={velgBilde}
            disabled={avatarLagrer}
            style={{ display: "none" }}
          />
        </div>
        {avatarFeil && <p style={{ margin: "12px 0 0", fontSize: 12, color: TL.danger }}>{avatarFeil}</p>}
      </TlKort>

      {generellFeil && <p role="alert" style={{ margin: 0, fontSize: 12, color: TL.danger }}>{generellFeil}</p>}
      {lagret && !generellFeil && <p role="status" style={{ margin: 0, fontSize: 12, color: TL.ok }}>Lagret.</p>}

      {mobile ? (
        <>
          <TlKort eyebrow="Personalia" pad="18px 20px" style={{ gap: 14 }}>
            <TlFelt label="Fullt navn" value={navnFelt} onChange={setNavnFelt} placeholder="Ikke satt" feil={fieldErrors.navn} />
            <TlFelt label="E-post" value={epostFelt} onChange={setEpostFelt} placeholder="Ikke satt" type="email" mono feil={fieldErrors.epost} />
            <TlFelt label="Mobil" value={phoneFelt} onChange={setPhoneFelt} placeholder="Ikke registrert" mono />
            <TlFelt label="Handicap" value={hcpFelt} onChange={setHcpFelt} placeholder="Ikke registrert" mono feil={fieldErrors.hcp} />
            <TlFelt label="Hjemmeklubb" value={homeClubFelt} onChange={setHomeClubFelt} placeholder="Ikke registrert" />
          </TlKort>
          <TlKort eyebrow="Profesjonelt · vises på offentlig profil" pad="18px 20px" style={{ gap: 14 }}>
            <TlTekstOmraade label="Bio · maks 280 tegn" value={bioFelt} onChange={setBioFelt} rows={3} placeholder="Kort tekst som vises på offentlig profil" feil={fieldErrors.bio} />
            <TlFelt label="Sertifiseringer · separer med komma" value={certFelt} onChange={setCertFelt} placeholder="PGA Class A, TPI Level 2" />
            <TlFelt label="Språk · separer med komma" value={langFelt} onChange={setLangFelt} placeholder="Norsk, Engelsk" />
            <TlFelt label="Klubb-tilknytning · separer med komma" value={clubsFelt} onChange={setClubsFelt} placeholder="Gamle Fredrikstad GK, Onsøy GK" />
          </TlKort>
          <TlKort eyebrow="Konto" pad="18px 20px" style={{ gap: 14 }}>
            <TlProfilFelt label="Rolle" value={data.rolleLabel} />
            <TlProfilFelt label="Abonnement" value={data.abonnementLabel} mono />
            <TlProfilFelt label="Opprettet" value={data.opprettetLabel} mono />
          </TlKort>
          {lagreKnapp}
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 18, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
            <TlKort eyebrow="Personalia" pad="18px 20px" style={{ gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <TlFelt label="Fullt navn" value={navnFelt} onChange={setNavnFelt} placeholder="Ikke satt" feil={fieldErrors.navn} />
                <TlFelt label="E-post" value={epostFelt} onChange={setEpostFelt} placeholder="Ikke satt" type="email" mono feil={fieldErrors.epost} />
                <TlFelt label="Mobil" value={phoneFelt} onChange={setPhoneFelt} placeholder="Ikke registrert" mono />
                <TlFelt label="Handicap" value={hcpFelt} onChange={setHcpFelt} placeholder="Ikke registrert" mono feil={fieldErrors.hcp} />
              </div>
              <TlFelt label="Hjemmeklubb" value={homeClubFelt} onChange={setHomeClubFelt} placeholder="Ikke registrert" />
            </TlKort>
            <TlKort eyebrow="Profesjonelt · vises på offentlig profil" pad="18px 20px" style={{ gap: 14 }}>
              <TlTekstOmraade label="Bio · maks 280 tegn" value={bioFelt} onChange={setBioFelt} rows={3} placeholder="Kort tekst som vises på offentlig profil" feil={fieldErrors.bio} />
              <TlFelt label="Sertifiseringer · separer med komma" value={certFelt} onChange={setCertFelt} placeholder="PGA Class A, TPI Level 2" />
              <TlFelt label="Språk · separer med komma" value={langFelt} onChange={setLangFelt} placeholder="Norsk, Engelsk" />
              <TlFelt label="Klubb-tilknytning · separer med komma" value={clubsFelt} onChange={setClubsFelt} placeholder="Gamle Fredrikstad GK, Onsøy GK" />
            </TlKort>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
            <TlKort eyebrow="Konto" pad="18px 20px" style={{ gap: 14 }}>
              <TlProfilFelt label="Rolle" value={data.rolleLabel} />
              <TlProfilFelt label="Abonnement" value={data.abonnementLabel} mono />
              <TlProfilFelt label="Opprettet" value={data.opprettetLabel} mono />
            </TlKort>
          </div>
        </div>
      )}
    </div>
  );
}
