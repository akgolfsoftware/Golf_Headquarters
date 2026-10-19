"use client";

/**
 * AG-07 Stall › Ny spiller i nytt design — /admin/spillere/ny.
 * Erstatter TrainLockSpillerNy. Samme fire steg (Identitet → Golfprofil →
 * Abonnement og foresatte → Velkomst), samme validering og samme server-handling
 * (createSpiller). Etter opprettelse åpnes spillerens profil (Spiller 360).
 * Nivåene heter Gratis og Full på skjerm (beslutninger §ORDBOKA ER LÅST).
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Knapp, Nokkelverdier, Pille, Seksjon, Varsel } from "@/components/admin/agencyos-ny/ny";
import { createSpiller, type OpprettSpillerInput } from "@/app/admin/(legacy)/spillere/ny/actions";
import { SPILLER_KATEGORIER, SPILLER_TIERS, ALL_PROGRAMS, type SpillerKategori, type SpillerTier } from "@/app/admin/(legacy)/spillere/ny/constants";
import type { PlayerProgram } from "@/generated/prisma/client";

const PROGRAM_LABEL: Record<PlayerProgram, string> = {
  WANG_TOPPIDRETT: "WANG Toppidrett Fredrikstad",
  WANG_UNG: "WANG Ung Fredrikstad",
  GFGK_MINI: "GFGK — Mini",
  GFGK_BREDDE: "GFGK — Bredde/Utvikling",
  GFGK_JENTER: "GFGK — Jenter",
  GFGK_ELITE: "GFGK — Elite",
  AK_ACADEMY: "AK Golf Academy",
  AK_ACADEMY_JUNIOR: "AK Golf Academy Junior",
  PLATFORM_ONLY: "Selvbetjent (ingen coach)",
};

const KATEGORI_BESKRIVELSE: Record<SpillerKategori, string> = {
  A1: "Toppspiller — landslag/elite",
  A2: "Talent — regional elite",
  B1: "Etablert — klubb-elite",
  B2: "Utvikling — junior med ambisjon",
  C: "Bredde — fritids- og nybegynner",
};

const TIER_NAVN: Record<SpillerTier, string> = { GRATIS: "Gratis", PRO: "Full" };
const TIER_BESKRIVELSE: Record<SpillerTier, string> = {
  GRATIS: "PlayerHQ med rundelogg og enkel statistikk. Ikke noe abonnement.",
  PRO: "Hele PlayerHQ med Caddie og treningsplaner. 299 kr/mnd.",
};

const STEG = ["Identitet", "Golfprofil", "Abonnement og foresatte", "Velkomst"] as const;
const EPOST = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function alderFraIso(iso: string): number | null {
  const f = new Date(iso);
  if (Number.isNaN(f.getTime())) return null;
  const naa = new Date();
  let alder = naa.getFullYear() - f.getFullYear();
  if (naa.getMonth() < f.getMonth() || (naa.getMonth() === f.getMonth() && naa.getDate() < f.getDate())) alder -= 1;
  return alder;
}

const RAD = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 } as const;
const RADIO = { width: 20, height: 20, accentColor: "var(--graphite-900)" } as const;

function Felt({ label, hjelp, feil, children }: { label: string; hjelp?: string; feil?: string; children: React.ReactNode }) {
  return <label className="felt"><span className="etikett">{label}</span>{children}
    {feil ? <span className="feiltekst">{feil}</span> : hjelp ? <span className="hjelp">{hjelp}</span> : null}</label>;
}

export function AG07SpillerNy() {
  const router = useRouter();
  const [steg, setSteg] = useState(1);
  const [pending, start] = useTransition();
  const [serverFeil, setServerFeil] = useState<string | null>(null);
  const [feltFeil, setFeltFeil] = useState<Record<string, string>>({});
  const [visFeil, setVisFeil] = useState(false);

  const [program, setProgram] = useState<PlayerProgram>("AK_ACADEMY");
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [fodselsdato, setFodselsdato] = useState("");
  const [hcp, setHcp] = useState("");
  const [kategori, setKategori] = useState<SpillerKategori>("B2");
  const [hjemmeklubb, setHjemmeklubb] = useState("");
  const [tier, setTier] = useState<SpillerTier>("GRATIS");
  const [foreldreNavn, setForeldreNavn] = useState("");
  const [foreldreEpost, setForeldreEpost] = useState("");
  const [foreldreTelefon, setForeldreTelefon] = useState("");
  const [velkomst, setVelkomst] = useState("Hei og velkommen til AK Golf Academy. Vi gleder oss til å trene sammen med deg.");
  const [sendInvitasjon, setSendInvitasjon] = useState(true);

  const alder = useMemo(() => (fodselsdato ? alderFraIso(fodselsdato) : null), [fodselsdato]);
  const erUnder18 = alder !== null && alder < 18;

  const stegFeil: string | null = (() => {
    if (steg === 1) {
      if (navn.trim().length < 2) return "Navnet må ha minst to tegn.";
      if (!EPOST.test(epost.trim())) return "E-postadressen er ikke gyldig.";
      if (!fodselsdato) return "Fødselsdato må fylles inn.";
      if (alder == null || alder < 4 || alder > 110) return "Alderen må være mellom 4 og 110 år.";
    }
    if (steg === 2 && hcp.trim() !== "") {
      const n = Number(hcp.replace(",", "."));
      if (Number.isNaN(n) || n < -10 || n > 54) return "HCP må være mellom −10 og 54.";
    }
    if (steg === 3 && erUnder18) {
      if (foreldreNavn.trim().length < 2) return "Navn på foresatt må fylles inn for spillere under 18 år.";
      if (!EPOST.test(foreldreEpost.trim())) return "E-post til foresatt må fylles inn for spillere under 18 år.";
    }
    return null;
  })();

  const sendInn = () => {
    if (pending) return;
    setServerFeil(null);
    setFeltFeil({});
    const input: OpprettSpillerInput = {
      navn: navn.trim(),
      epost: epost.trim(),
      program,
      programCoachId: "",
      fodselsdato,
      hcp: hcp.trim() === "" ? null : Number(hcp.replace(",", ".")),
      kategori,
      hjemmeklubb: hjemmeklubb.trim(),
      tier,
      foreldreNavn: erUnder18 ? foreldreNavn.trim() : "",
      foreldreEpost: erUnder18 ? foreldreEpost.trim() : "",
      foreldreTelefon: erUnder18 ? foreldreTelefon.trim() : "",
      velkomstMelding: velkomst.trim(),
      sendInvitasjon,
    };
    start(async () => {
      const res = await createSpiller(input);
      if (res.ok) router.push(`/admin/spillere/${res.userId}`);
      else { setServerFeil(res.error); if (res.fieldErrors) setFeltFeil(res.fieldErrors); }
    });
  };

  const neste = () => {
    if (steg < 4) {
      if (stegFeil) { setVisFeil(true); return; }
      setVisFeil(false);
      setSteg(steg + 1);
    } else sendInn();
  };

  const feilTekst = serverFeil ?? (visFeil ? stegFeil : null);

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 760 }}>
      <nav className="valg" aria-label="Steg">
        {STEG.map((s, i) => <button key={s} type="button" aria-pressed={steg === i + 1} disabled={i + 1 > steg} onClick={() => { setVisFeil(false); setSteg(i + 1); }}>{i + 1}. {s}</button>)}
      </nav>

      <div className="kort" style={{ display: "grid", gap: 16 }}>
        {steg === 1 && <>
          <Felt label="Program" hjelp="Spilleren meldes inn i programmet. Det kan endres på profilen etterpå.">
            <select value={program} onChange={(e) => setProgram(e.target.value as PlayerProgram)}>
              {ALL_PROGRAMS.map((p) => <option key={p} value={p}>{PROGRAM_LABEL[p]}</option>)}
            </select>
          </Felt>
          <div style={RAD}>
            <Felt label="Fullt navn" feil={feltFeil.navn}><input value={navn} onChange={(e) => setNavn(e.target.value)} autoComplete="off" /></Felt>
            <Felt label="E-post" hjelp="Brukes til innlogging." feil={feltFeil.epost}><input type="email" value={epost} onChange={(e) => setEpost(e.target.value)} autoComplete="off" /></Felt>
            <Felt label="Fødselsdato" feil={feltFeil.fodselsdato}><input type="date" value={fodselsdato} onChange={(e) => setFodselsdato(e.target.value)} /></Felt>
            <div style={{ display: "grid", gap: 6, alignContent: "end" }}>
              <span className="etikett" style={{ font: "600 14px/1.3 var(--sans)" }}>Alder</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 48, flexWrap: "wrap" }}>
                <b className="mono">{alder == null ? "—" : `${alder} år`}</b>{erUnder18 && <Pille tone="vent">Foresatt kreves</Pille>}
              </span>
            </div>
          </div>
        </>}

        {steg === 2 && <>
          <div style={RAD}>
            <Felt label="Handicap" hjelp="Komma som desimaltegn, for eksempel 12,3." feil={feltFeil.hcp}><input inputMode="decimal" value={hcp} onChange={(e) => setHcp(e.target.value)} /></Felt>
            <Felt label="Hjemmeklubb" feil={feltFeil.hjemmeklubb}><input value={hjemmeklubb} onChange={(e) => setHjemmeklubb(e.target.value)} /></Felt>
          </div>
          <Seksjon tittel="Kategori">
            <div className="liste" role="radiogroup" aria-label="Kategori">
              {SPILLER_KATEGORIER.map((k) => (
                <label key={k} style={{ cursor: "pointer" }}>
                  <input type="radio" name="kategori" checked={kategori === k} onChange={() => setKategori(k)} style={RADIO} />
                  <span><b>{k}</b><span className="kilde">{KATEGORI_BESKRIVELSE[k]}</span></span>
                  <span />
                </label>
              ))}
            </div>
          </Seksjon>
        </>}

        {steg === 3 && <>
          <Seksjon tittel="Abonnement">
            <div className="liste" role="radiogroup" aria-label="Abonnement">
              {SPILLER_TIERS.map((t) => (
                <label key={t} style={{ cursor: "pointer" }}>
                  <input type="radio" name="tier" checked={tier === t} onChange={() => setTier(t)} style={RADIO} />
                  <span><b>{TIER_NAVN[t]}</b><span className="kilde">{TIER_BESKRIVELSE[t]}</span></span>
                  <span />
                </label>
              ))}
            </div>
          </Seksjon>
          {erUnder18 ? (
            <Seksjon tittel="Foresatt" hoyre={<Pille tone="vent">Under 18 · {alder} år</Pille>}>
              <div style={RAD}>
                <Felt label="Navn" feil={feltFeil.foreldreNavn}><input value={foreldreNavn} onChange={(e) => setForeldreNavn(e.target.value)} /></Felt>
                <Felt label="E-post" feil={feltFeil.foreldreEpost}><input type="email" value={foreldreEpost} onChange={(e) => setForeldreEpost(e.target.value)} /></Felt>
                <Felt label="Telefon (valgfritt)" feil={feltFeil.foreldreTelefon}><input type="tel" value={foreldreTelefon} onChange={(e) => setForeldreTelefon(e.target.value)} /></Felt>
              </div>
            </Seksjon>
          ) : <p className="forklar">Spilleren er myndig. Foresatt trengs ikke.</p>}
        </>}

        {steg === 4 && <>
          <Seksjon tittel="Oppsummering">
            <Nokkelverdier rader={[
              ["Navn", navn || "—"],
              ["E-post", epost || "—"],
              ["Program", PROGRAM_LABEL[program]],
              ["Kategori", kategori],
              ["Abonnement", TIER_NAVN[tier]],
            ]} />
          </Seksjon>
          <Felt label="Velkomstmelding" hjelp="Vises i spillerens innboks og i invitasjonen på e-post.">
            <textarea rows={5} value={velkomst} onChange={(e) => setVelkomst(e.target.value)} style={{ resize: "vertical" }} />
          </Felt>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span><b className="undertittel">Send invitasjon på e-post nå</b>
              <span className="kilde" style={{ display: "block" }}>Slå av for å opprette spilleren først og invitere fra profilen senere.</span></span>
            <button type="button" className="bryter" role="switch" aria-checked={sendInvitasjon} aria-label="Send invitasjon på e-post nå" onClick={() => setSendInvitasjon((v) => !v)} />
          </div>
        </>}
      </div>

      {feilTekst && <Varsel tone="advarsel" tittel="Kan ikke gå videre">{feilTekst}</Varsel>}

      <div className="knapper" style={{ justifyContent: "space-between" }}>
        {steg > 1 ? <Knapp variant="sek" onClick={() => { setVisFeil(false); setSteg(steg - 1); }}>Tilbake</Knapp> : <span />}
        <Knapp disabled={pending} onClick={neste}>
          {steg < 4 ? "Neste" : pending ? "Oppretter …" : sendInvitasjon ? "Opprett og send invitasjon" : "Opprett spiller"}
        </Knapp>
      </div>
    </div>
  );
}
