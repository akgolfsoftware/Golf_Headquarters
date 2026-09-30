"use client";

/**
 * AG-23 Profil i Precision Athletics (AG-mer.jsx, fane Profil, runde 30).
 * Data og handlinger uendret. Fasitens fem nøkkelverdier vises først;
 * skjemaet (oppdaterCoachProfil, uploadAvatar) ligger bak «Endre» så
 * ingen funksjon forsvinner.
 */
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleUser, Pencil, RefreshCw } from "lucide-react";
import { Knapp, LasterTilstand, FeilTilstand, Meta } from "@/components/precision/pa";
import { Felt, Kort, KortHode, InlineVarsel, Nokkelverdi } from "@/components/precision/pa-a5";
import { AG23Hode, TekstFeltStor } from "./AG23Hode";
import type { oppdaterCoachProfil as OppdaterCoachProfil } from "@/app/admin/(legacy)/profile/actions";
import type { uploadAvatar as UploadAvatar } from "@/lib/storage/avatar";
import { skalerAvatar } from "@/lib/klient/skaler-avatar";
import type { AdminProfilV2Data } from "@/components/admin/v2/oppsett/AdminProfilTrainLock";
import "@/styles/precision-a5.css";

export type AG23ProfilOversikt = { kalender: string; tjenester: string };
export type AG23ProfilTilstand = "data" | "laster" | "feil";
/** Server actions sendes inn fra page.tsx (holder klientfila fri for serverkode). */
export type AG23ProfilHandlinger = { lagreProfil: typeof OppdaterCoachProfil; lastOppAvatar: typeof UploadAvatar };
const hcpTekst = (h: number | null) => (h == null ? "" : h.toLocaleString("nb-NO", { maximumFractionDigits: 1 }));

function Avatar({ src, navn }: { src: string | null; navn: string }) {
  const i = navn.trim().charAt(0).toUpperCase() || "—";
  return <span aria-hidden style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--surface-sunken)", border: "1px solid var(--border-strong)", font: "600 24px/1 var(--font-sans)", color: "var(--text-primary)" }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {src ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : i}
  </span>;
}

function Skjema({ data, handlinger, oversikt }: { data: AdminProfilV2Data; handlinger: AG23ProfilHandlinger; oversikt: AG23ProfilOversikt }) {
  const [rediger, setRediger] = useState(false);
  const router = useRouter();
  const [f, setF] = useState({
    navn: data.navn, epost: data.epost, phone: data.phone ?? "", hcp: hcpTekst(data.hcp), homeClub: data.homeClub ?? "",
    bio: data.bio, certifications: data.certifications.join(", "), languages: data.languages.join(", "), clubs: data.clubs.join(", "),
  });
  const sett = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));
  const [lagrer, startLagring] = useTransition();
  const [feltFeil, setFeltFeil] = useState<Record<string, string>>({});
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [avatar, setAvatar] = useState(data.avatarUrl);
  const [avatarLagrer, startAvatar] = useTransition();
  const [avatarFeil, setAvatarFeil] = useState<string | null>(null);
  const filRef = useRef<HTMLInputElement>(null);

  function velgBilde(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    setAvatarFeil(null);
    startAvatar(async () => {
      try {
        const fd = new FormData();
        fd.append("file", await skalerAvatar(fil));
        const res = await handlinger.lastOppAvatar(fd);
        if (!res.ok) throw new Error(res.error);
        setAvatar(res.url);
        router.refresh();
      } catch (err) {
        setAvatarFeil(err instanceof Error ? err.message : "Opplasting feilet.");
      } finally {
        if (filRef.current) filRef.current.value = "";
      }
    });
  }

  function lagre() {
    setFeltFeil({}); setFeil(null); setLagret(false);
    const fd = new FormData();
    (Object.keys(f) as Array<keyof typeof f>).forEach((k) => fd.set(k, f[k]));
    startLagring(async () => {
      const res = await handlinger.lagreProfil(fd);
      if (!res.ok) {
        if (res.fieldErrors) setFeltFeil(res.fieldErrors);
        setFeil(res.error ?? "Kunne ikke lagre. Sjekk feltene under.");
        return;
      }
      setLagret(true);
      router.refresh();
    });
  }

  return <div className="pa-a5-stack">
    <Kort>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span className="kicker" style={{ flex: "1 1 auto" }}>Profil</span><Meta>{data.rolleLabel.toUpperCase()}</Meta></div>
      <Nokkelverdi items={[
        ["Navn", data.navn || "—"], ["E-post", data.epost || "—"], ["Rolle", data.rolleLabel],
        ["Google-kalender", oversikt.kalender], ["Tjenester og priser", oversikt.tjenester],
      ]} />
      {!rediger && <div><Knapp variant="secondary" size="sm" icon={Pencil} iconName="pencil" onClick={() => setRediger(true)}>Endre</Knapp></div>}
    </Kort>
    {rediger && <>
    <Kort>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", minWidth: 0 }}>
        <Avatar src={avatar} navn={data.navn} />
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <div style={{ font: "600 18px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{data.navn || "—"}</div>
          <Meta>{data.rolleLabel.toUpperCase()}{data.homeClub ? ` · ${data.homeClub.toUpperCase()}` : ""}</Meta>
        </div>
        <label className="pa-btn pa-btn--secondary" style={{ cursor: avatarLagrer ? "default" : "pointer" }}>
          {avatarLagrer ? "Laster opp …" : "Bytt bilde"}
          <input ref={filRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={velgBilde} disabled={avatarLagrer} style={{ display: "none" }} />
        </label>
      </div>
      {avatarFeil && <InlineVarsel tone="warn">{avatarFeil}</InlineVarsel>}
    </Kort>

    {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}
    {lagret && !feil && <InlineVarsel tone="ok">Lagret.</InlineVarsel>}

    <div className="pa-a5-grid pa-a5-grid--2">
      <div className="pa-a5-stack">
        <Kort>
          <KortHode tittel="Personalia" />
          <Felt label="Fullt navn" error={feltFeil.navn}><TekstFeltStor value={f.navn} onChange={sett("navn")} placeholder="Ikke satt" /></Felt>
          <Felt label="E-post" error={feltFeil.epost}><TekstFeltStor type="email" value={f.epost} onChange={sett("epost")} placeholder="Ikke satt" /></Felt>
          <Felt label="Mobil"><TekstFeltStor value={f.phone} onChange={sett("phone")} placeholder="Ikke registrert" /></Felt>
          <Felt label="Handicap" error={feltFeil.hcp}><TekstFeltStor value={f.hcp} onChange={sett("hcp")} placeholder="Ikke registrert" /></Felt>
          <Felt label="Hjemmeklubb"><TekstFeltStor value={f.homeClub} onChange={sett("homeClub")} placeholder="Ikke registrert" /></Felt>
        </Kort>
        <Kort>
          <KortHode tittel="Profesjonelt" aside="VISES PÅ OFFENTLIG PROFIL" />
          <Felt label="Bio" hint="Maks 280 tegn" error={feltFeil.bio}>
            <span className="pa-control" style={{ height: "auto", padding: "10px 12px", alignItems: "stretch" }}>
              <textarea value={f.bio} onChange={sett("bio")} rows={3} placeholder="Kort tekst som vises på offentlig profil" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "inherit", font: "var(--type-body)", resize: "vertical" }} />
            </span>
          </Felt>
          <Felt label="Sertifiseringer" hint="Separer med komma"><TekstFeltStor value={f.certifications} onChange={sett("certifications")} placeholder="PGA Class A, TPI Level 2" /></Felt>
          <Felt label="Språk" hint="Separer med komma"><TekstFeltStor value={f.languages} onChange={sett("languages")} placeholder="Norsk, Engelsk" /></Felt>
          <Felt label="Klubbtilknytning" hint="Separer med komma"><TekstFeltStor value={f.clubs} onChange={sett("clubs")} placeholder="Gamle Fredrikstad GK" /></Felt>
        </Kort>
      </div>
      <div className="pa-a5-stack">
        <Kort>
          <KortHode tittel="Konto" aside={data.rolleLabel.toUpperCase()} />
          <Nokkelverdi items={[["Rolle", data.rolleLabel], ["Abonnement", data.abonnementLabel], ["Opprettet", data.opprettetLabel]]} />
        </Kort>
      </div>
    </div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Knapp icon={Check} iconName="check" loading={lagrer} onClick={lagre}>Lagre endringer</Knapp>
      <Knapp variant="ghost" onClick={() => setRediger(false)}>Lukk</Knapp>
    </div>
    </>}
  </div>;
}

export function AG23Profil({ tilstand, data, handlinger, oversikt }: { tilstand: AG23ProfilTilstand; data: AdminProfilV2Data; handlinger: AG23ProfilHandlinger; oversikt: AG23ProfilOversikt }) {
  return <div className="pa-side" style={{ maxWidth: 960 }}>
    <AG23Hode sted="profil" kicker="Mer · Oppsett" tittel="Oppsett" />
    {tilstand === "laster" && <LasterTilstand text="Henter profilen …" />}
    {tilstand === "feil" && <FeilTilstand icon={CircleUser} title="Profilen kunne ikke hentes" text="Ingenting er endret. Prøv igjen." code="PROFIL · FEIL" retry={<Knapp variant="secondary" icon={RefreshCw} iconName="refresh-cw" onClick={() => window.location.reload()}>Prøv igjen</Knapp>} />}
    {tilstand === "data" && <Skjema data={data} handlinger={handlinger} oversikt={oversikt} />}
  </div>;
}
