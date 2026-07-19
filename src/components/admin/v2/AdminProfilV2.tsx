"use client";

/**
 * AgencyOS Min coach-profil — v2 (retning C «Presis»). Coachens EGEN profil
 * (selvbetjening — matcher /portal/meg sitt "min profil"-idiom, ikke en
 * admin-styrt spillerprofil). Rekomponert fra /admin/(legacy)/profile i
 * v2-språket, søster-mønster til MinProfilV2 (PlayerHQ).
 *
 * Ekte mutasjoner gjenbrukt 1:1 — ingen nye actions:
 *  - oppdaterCoachProfil (personalia + profesjonelt, .../profile/actions.ts)
 *  - uploadAvatar (Supabase Storage "avatars"-bucket)
 *
 * Ærlighet: Rolle/Abonnement/Opprettet er skrivebeskyttet (ProfilFelt) —
 * ekte User-felter, ingen fabrikerte tall. Kun v2-komponenter fra
 * "@/components/v2"; ingen ad-hoc UI, ingen rå hex (kun T.*-tokens).
 */

import { useEffect, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  T,
  Tittel,
  Knapp,
  CTAPill,
  Kort,
  StatusPill,
  AvatarFoto,
  Inndata,
  TekstOmraade,
  ProfilFelt,
  type StatusTone,
} from "@/components/v2";
import { oppdaterCoachProfil } from "@/app/admin/(legacy)/profile/actions";
import { uploadAvatar } from "@/lib/storage/avatar";
import { skalerAvatar } from "@/lib/klient/skaler-avatar";

/* ── Datakontrakt (mappes fra requirePortalUser i ruten) ────────────── */
export type AdminProfilV2Data = {
  navn: string;
  epost: string;
  phone: string | null;
  avatarUrl: string | null;
  hcp: number | null;
  homeClub: string | null;
  bio: string;
  certifications: string[];
  languages: string[];
  clubs: string[];
  /** "Administrator" | "Coach" — utledet av user.role. */
  rolleLabel: string;
  /** Ferdig formatert abonnement-tekst, f.eks. "Pro (299 kr/mnd)" / "Gratis". */
  abonnementLabel: string;
  /** Ferdig formatert opprettet-dato (nb-NO). */
  opprettetLabel: string;
};

function hcpTekst(hcp: number | null): string {
  if (hcp == null) return "";
  return hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

/** true på klient etter mount når viewport < 768px (styrer felt-layout). */
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

function FeltFeil({ children }: { children: ReactNode }) {
  return <p style={{ fontFamily: T.ui, fontSize: 11, color: T.down, margin: "6px 0 0" }}>{children}</p>;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function AdminProfilV2({ data }: { data: AdminProfilV2Data }) {
  const mobile = useMobile();
  const router = useRouter();

  /* Redigerbare felter — én FormData-submit til oppdaterCoachProfil ved
     lagring (samme datakontrakt som edit-form.tsx bygget, bare inline i
     stedet for en åpne/lukk-modal). */
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

  /* Avatar-opplasting — egen transition/pending-state så «Bytt bilde» ikke
     låser «Lagre endringer». Samme uploadAvatar-action som PlayerHQ. */
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
        // Nedskaler på klienten — kamerabilder (2–8 MB) sprenger ellers
        // server-action-grensen før uploadAvatar i det hele tatt kjører.
        const formData = new FormData();
        formData.append("file", await skalerAvatar(fil));
        const res = await uploadAvatar(formData);
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

  const piller: { l: string; tone: StatusTone }[] = [{ l: data.rolleLabel, tone: "lime" }];
  if (data.homeClub) piller.push({ l: data.homeClub, tone: "info" });

  /* ── Kort-blokker ──────────────────────────────────────── */

  const topp = (
    <Kort tint pad={mobile ? "22px 18px" : "26px 24px"}>
      <div style={{ display: "flex", alignItems: "center", gap: mobile ? 16 : 22, flexDirection: mobile ? "column" : "row", textAlign: mobile ? "center" : "left" }}>
        <AvatarFoto src={avatarUrl} navn={data.navn} size={mobile ? 88 : 96} ring />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 24 : 28, letterSpacing: "-0.03em", color: T.fg, margin: 0 }}>{data.navn}</h1>
          <div style={{ display: "flex", gap: 6, marginTop: 9, justifyContent: mobile ? "center" : "flex-start", flexWrap: "wrap" }}>
            {piller.map((p) => (
              <StatusPill key={p.l} tone={p.tone}>{p.l}</StatusPill>
            ))}
          </div>
        </div>
        <label htmlFor="admin-profil-avatar-input" style={{ cursor: avatarLagrer ? "default" : "pointer" }}>
          <CTAPill ghost icon={avatarLagrer ? "loader" : "camera"}>
            {avatarLagrer ? "Laster opp …" : "Bytt bilde"}
          </CTAPill>
        </label>
        <input
          ref={filInputRef}
          id="admin-profil-avatar-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={velgBilde}
          disabled={avatarLagrer}
          style={{ display: "none" }}
        />
      </div>
      {avatarFeil && (
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.down, margin: "12px 0 0" }}>{avatarFeil}</p>
      )}
    </Kort>
  );

  const personalia = (
    <Kort eyebrow="Personalia" pad="18px 20px" style={{ gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <div>
          <Inndata label="Fullt navn" value={navnFelt} onChange={setNavnFelt} placeholder="Ikke satt" />
          {fieldErrors.navn && <FeltFeil>{fieldErrors.navn}</FeltFeil>}
        </div>
        <div>
          <Inndata label="E-post" value={epostFelt} onChange={setEpostFelt} placeholder="Ikke satt" type="email" mono />
          {fieldErrors.epost && <FeltFeil>{fieldErrors.epost}</FeltFeil>}
        </div>
        <Inndata label="Mobil" value={phoneFelt} onChange={setPhoneFelt} placeholder="Ikke registrert" mono />
        <div>
          <Inndata label="Handicap" value={hcpFelt} onChange={setHcpFelt} placeholder="Ikke registrert" mono />
          {fieldErrors.hcp && <FeltFeil>{fieldErrors.hcp}</FeltFeil>}
        </div>
      </div>
      <Inndata label="Hjemmeklubb" value={homeClubFelt} onChange={setHomeClubFelt} placeholder="Ikke registrert" />
    </Kort>
  );

  const profesjonelt = (
    <Kort eyebrow="Profesjonelt · vises på offentlig profil" pad="18px 20px" style={{ gap: 14 }}>
      <div>
        <TekstOmraade label="Bio · maks 280 tegn" value={bioFelt} onChange={setBioFelt} rows={3} placeholder="Kort tekst som vises på offentlig profil" />
        {fieldErrors.bio && <FeltFeil>{fieldErrors.bio}</FeltFeil>}
      </div>
      <Inndata label="Sertifiseringer · separer med komma" value={certFelt} onChange={setCertFelt} placeholder="PGA Class A, TPI Level 2" />
      <Inndata label="Språk · separer med komma" value={langFelt} onChange={setLangFelt} placeholder="Norsk, Engelsk" />
      <Inndata label="Klubb-tilknytning · separer med komma" value={clubsFelt} onChange={setClubsFelt} placeholder="Gamle Fredrikstad GK, Onsøy GK" />
    </Kort>
  );

  const konto = (
    <Kort eyebrow="Konto" pad="18px 20px" style={{ gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <ProfilFelt label="Rolle" value={data.rolleLabel} />
        <ProfilFelt label="Abonnement" value={data.abonnementLabel} mono />
      </div>
      <ProfilFelt label="Opprettet" value={data.opprettetLabel} mono />
    </Kort>
  );

  const lagreKnapp = (
    <Knapp icon={lagrer ? "loader" : "check"} disabled={lagrer} onClick={lagreEndringer} full={mobile}>
      {lagrer ? "Lagrer …" : "Lagre endringer"}
    </Knapp>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Tittel mobile={mobile} em="coach-profil">Min</Tittel>
        {!mobile && lagreKnapp}
      </div>

      {topp}

      {generellFeil && (
        <p role="alert" style={{ fontFamily: T.ui, fontSize: 12, color: T.down, margin: 0 }}>{generellFeil}</p>
      )}
      {lagret && !generellFeil && (
        <p role="status" style={{ fontFamily: T.ui, fontSize: 12, color: T.up, margin: 0 }}>Lagret.</p>
      )}

      {mobile ? (
        <>
          {personalia}
          {profesjonelt}
          {konto}
          {lagreKnapp}
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: T.gap, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
            {personalia}
            {profesjonelt}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>{konto}</div>
        </div>
      )}
    </div>
  );
}
