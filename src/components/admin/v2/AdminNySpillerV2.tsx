"use client";

/**
 * AgencyOS — Ny spiller (v2, retning C «Presis»). Rekomponering av
 * /admin/spillere/ny (SpillerOnboardingWizard) i v2-biblioteket, med
 * uendret funksjon + datakontrakt: samme 4-stegs flyt (Identitet →
 * Golf-profil → Tier og foreldre → Velkomst), samme validering, og
 * samme ekte server action `createSpiller`. Bygget utelukkende av
 * v2-komponenter (src/components/v2) — ingen ad-hoc UI, ingen rå hex.
 *
 * Steg-navigasjon og progresjon: Veiviser. Felt: SkjemaFelt + Inndata/
 * Velger/TekstOmraade/Bryter. Enkeltvalg (program/kategori/tier): Velger
 * + ValgKort. Validering vises i klarspråk (ValideringsChip, SkjemaFelt
 * feil), aldri sperre-språk.
 */

import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Caps,
  Tittel,
  Kort,
  ValgKort,
  SkjemaFelt,
  Inndata,
  Velger,
  TekstOmraade,
  Bryter,
  Veiviser,
  ProfilFelt,
  StatusPill,
  ValideringsChip,
  T,
} from "@/components/v2";
import {
  createSpiller,
  type OpprettSpillerInput,
} from "@/app/admin/spillere/ny/actions";
import {
  SPILLER_KATEGORIER,
  SPILLER_TIERS,
  ALL_PROGRAMS,
  type SpillerKategori,
  type SpillerTier,
} from "@/app/admin/spillere/ny/constants";
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

// Label → enum (Velger jobber på synlige etiketter; server action krever enum).
const LABEL_TO_PROGRAM: Record<string, PlayerProgram> = Object.fromEntries(
  ALL_PROGRAMS.map((p) => [PROGRAM_LABEL[p], p]),
) as Record<string, PlayerProgram>;

const KATEGORI_BESKRIVELSE: Record<SpillerKategori, string> = {
  A1: "Toppspiller — landslag/elite",
  A2: "Talent — regional elite",
  B1: "Etablert — klubb-elite",
  B2: "Utvikling — junior med ambisjon",
  C: "Bredde — fritids- og nybegynner",
};

const TIER_BESKRIVELSE: Record<SpillerTier, string> = {
  GRATIS:
    "Tilgang til PlayerHQ med runde-logg og enkel statistikk. Ingen abonnement.",
  PRO: "Full PlayerHQ + AI-coach, treningsplaner og prioritert support.",
};

const STEG_NAVN = ["Identitet", "Golf-profil", "Tier og foreldre", "Velkomst"];

type StegNr = 1 | 2 | 3 | 4;

function alderFraIso(iso: string): number | null {
  const f = new Date(iso);
  if (Number.isNaN(f.getTime())) return null;
  const naa = new Date();
  let alder = naa.getFullYear() - f.getFullYear();
  const harHattBursdag =
    naa.getMonth() > f.getMonth() ||
    (naa.getMonth() === f.getMonth() && naa.getDate() >= f.getDate());
  if (!harHattBursdag) alder -= 1;
  return alder;
}

/** Vertikal felt-stakk (layout, ikke UI-primitiv). */
function Stakk({ children, gap = 16 }: { children: ReactNode; gap?: number }) {
  return <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>;
}

export function AdminNySpillerV2() {
  const router = useRouter();
  const [steg, setSteg] = useState<StegNr>(1);
  const [pending, startTransition] = useTransition();
  const [serverFeil, setServerFeil] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [visFeil, setVisFeil] = useState(false);

  // Program (steg 1 — obligatorisk). programCoachId tildeles senere på profil.
  const [program, setProgram] = useState<PlayerProgram>("AK_ACADEMY");
  const [programCoachId] = useState<string>("");

  // Steg 1 — identitet
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [fodselsdato, setFodselsdato] = useState("");

  // Steg 2 — golf-profil
  const [hcp, setHcp] = useState("");
  const [kategori, setKategori] = useState<SpillerKategori>("B2");
  const [hjemmeklubb, setHjemmeklubb] = useState("");

  // Steg 3 — tier + foreldre
  const [tier, setTier] = useState<SpillerTier>("GRATIS");
  const [foreldreNavn, setForeldreNavn] = useState("");
  const [foreldreEpost, setForeldreEpost] = useState("");
  const [foreldreTelefon, setForeldreTelefon] = useState("");

  // Steg 4 — velkomst
  const [velkomstMelding, setVelkomstMelding] = useState(
    "Hei og velkommen til AK Golf Academy. Vi gleder oss til å trene sammen med deg.",
  );
  const [sendInvitasjon, setSendInvitasjon] = useState(true);

  const alder = useMemo(
    () => (fodselsdato ? alderFraIso(fodselsdato) : null),
    [fodselsdato],
  );
  const erUnder18 = alder !== null && alder < 18;

  const stegFeil: string | null = (() => {
    if (steg === 1) {
      if (navn.trim().length < 2) return "Navn må være minst 2 tegn.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.trim()))
        return "Ugyldig e-postadresse.";
      if (!fodselsdato) return "Fødselsdato er påkrevd.";
      if (alder == null || alder < 4 || alder > 110)
        return "Alder må være mellom 4 og 110 år.";
    }
    if (steg === 2) {
      if (hcp.trim() !== "") {
        const n = Number(hcp.replace(",", "."));
        if (Number.isNaN(n) || n < -10 || n > 54)
          return "HCP må være mellom −10 og 54.";
      }
    }
    if (steg === 3 && erUnder18) {
      if (foreldreNavn.trim().length < 2)
        return "Foreldre-navn er påkrevd for spillere under 18 år.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(foreldreEpost.trim()))
        return "Foreldre-e-post er påkrevd for spillere under 18 år.";
    }
    return null;
  })();

  function forrige() {
    setVisFeil(false);
    if (steg > 1) setSteg((steg - 1) as StegNr);
  }

  function sendInn() {
    if (pending) return;
    setServerFeil(null);
    setFieldErrors({});
    const input: OpprettSpillerInput = {
      navn: navn.trim(),
      epost: epost.trim(),
      program,
      programCoachId: programCoachId || "",
      fodselsdato,
      hcp: hcp.trim() === "" ? null : Number(hcp.replace(",", ".")),
      kategori,
      hjemmeklubb: hjemmeklubb.trim(),
      tier,
      foreldreNavn: erUnder18 ? foreldreNavn.trim() : "",
      foreldreEpost: erUnder18 ? foreldreEpost.trim() : "",
      foreldreTelefon: erUnder18 ? foreldreTelefon.trim() : "",
      velkomstMelding: velkomstMelding.trim(),
      sendInvitasjon,
    };
    startTransition(async () => {
      const res = await createSpiller(input);
      if (res.ok) {
        router.push(`/admin/spillere/${res.userId}`);
      } else {
        setServerFeil(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  function neste() {
    if (steg < 4) {
      if (stegFeil) {
        setVisFeil(true);
        return;
      }
      setVisFeil(false);
      setSteg((steg + 1) as StegNr);
    } else {
      sendInn();
    }
  }

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>AgencyOS · Stallen · Onboarding</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="spiller.">Ny</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 460 }}>
          Fire steg — identitet, golf-profil, tier og velkomst. Spilleren får
          invitasjon på e-post hvis du sender den nå.
        </p>
      </div>
    </div>
  );

  const feilTekst = serverFeil ?? (visFeil ? stegFeil : null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}

      <Kort>
        {steg === 1 && (
          <Stakk>
            <Velger
              label="Program"
              options={ALL_PROGRAMS.map((p) => PROGRAM_LABEL[p])}
              value={PROGRAM_LABEL[program]}
              onChange={(label) => setProgram(LABEL_TO_PROGRAM[label] ?? program)}
            />
            <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, margin: "-6px 2px 0" }}>
              Spilleren enrolleres automatisk i dette programmet. Du kan endre
              det etterpå på spillerens profilside.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
              <SkjemaFelt label="Fullt navn" hjelp={undefined} feil={fieldErrors.navn}>
                <Inndata label={null} value={navn} onChange={setNavn} placeholder="F.eks. Øyvind Rohjan" />
              </SkjemaFelt>
              <SkjemaFelt label="E-post" hjelp="Brukes som innloggings-ID." feil={fieldErrors.epost}>
                <Inndata label={null} type="email" value={epost} onChange={setEpost} placeholder="ovind@eksempel.no" />
              </SkjemaFelt>
              <SkjemaFelt label="Fødselsdato" hjelp={undefined} feil={fieldErrors.fodselsdato}>
                <Inndata label={null} type="date" value={fodselsdato} onChange={setFodselsdato} />
              </SkjemaFelt>
              <ProfilFelt
                label="Alder"
                mono
                value={alder == null ? undefined : `${alder} år`}
                placeholder="— år"
                trailing={erUnder18 ? <StatusPill tone="warn">Foreldre påkrevd</StatusPill> : undefined}
              />
            </div>
          </Stakk>
        )}

        {steg === 2 && (
          <Stakk>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
              <SkjemaFelt label="Handicap (HCP)" hjelp="Bruk komma som desimaltegn, f.eks. 12,3." feil={fieldErrors.hcp}>
                <Inndata label={null} mono value={hcp} onChange={setHcp} placeholder="F.eks. 12,3" />
              </SkjemaFelt>
              <SkjemaFelt label="Hjemmeklubb" hjelp={undefined} feil={fieldErrors.hjemmeklubb}>
                <Inndata label={null} value={hjemmeklubb} onChange={setHjemmeklubb} placeholder="F.eks. Gamle Fredrikstad GK" />
              </SkjemaFelt>
            </div>
            <div>
              <Caps size={9} style={{ marginBottom: 8 }}>Kategori — styrer AK Golf-segmenteringen</Caps>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 8 }}>
                {SPILLER_KATEGORIER.map((k) => (
                  <ValgKort
                    key={k}
                    tittel={k}
                    sub={KATEGORI_BESKRIVELSE[k]}
                    valgt={kategori === k}
                    onClick={() => setKategori(k)}
                  />
                ))}
              </div>
            </div>
          </Stakk>
        )}

        {steg === 3 && (
          <Stakk>
            <div>
              <Caps size={9} style={{ marginBottom: 8 }}>Abonnement</Caps>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 8 }}>
                {SPILLER_TIERS.map((t) => (
                  <ValgKort
                    key={t}
                    tittel={t === "GRATIS" ? "Gratis" : "Pro"}
                    tag={t === "PRO" ? "299 kr/mnd" : undefined}
                    sub={TIER_BESKRIVELSE[t]}
                    valgt={tier === t}
                    onClick={() => setTier(t)}
                  />
                ))}
              </div>
            </div>
            {erUnder18 ? (
              <Kort tint>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                  <StatusPill tone="warn">Under 18</StatusPill>
                  <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
                    {alder} år — foreldre-info er påkrevd
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
                  <SkjemaFelt label="Foreldre-navn" hjelp={undefined} feil={fieldErrors.foreldreNavn}>
                    <Inndata label={null} value={foreldreNavn} onChange={setForeldreNavn} placeholder="Ola Pedersen" />
                  </SkjemaFelt>
                  <SkjemaFelt label="Foreldre-e-post" hjelp={undefined} feil={fieldErrors.foreldreEpost}>
                    <Inndata label={null} type="email" value={foreldreEpost} onChange={setForeldreEpost} placeholder="ola@eksempel.no" />
                  </SkjemaFelt>
                  <SkjemaFelt label="Foreldre-telefon (valgfri)" hjelp={undefined} feil={fieldErrors.foreldreTelefon}>
                    <Inndata label={null} value={foreldreTelefon} onChange={setForeldreTelefon} placeholder="+47 900 00 000" />
                  </SkjemaFelt>
                </div>
              </Kort>
            ) : (
              <ValideringsChip tone="info" tekst="Spilleren er myndig — ingen foreldre-info nødvendig." />
            )}
          </Stakk>
        )}

        {steg === 4 && (
          <Stakk>
            <div>
              <Caps size={9} style={{ marginBottom: 8 }}>Oppsummering</Caps>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
                <ProfilFelt label="Navn" value={navn || undefined} placeholder="—" />
                <ProfilFelt label="E-post" value={epost || undefined} placeholder="—" />
                <ProfilFelt label="Kategori" value={kategori} />
                <ProfilFelt label="Tier" value={tier === "GRATIS" ? "Gratis" : "Pro (299 kr/mnd)"} />
              </div>
            </div>
            <SkjemaFelt
              label="Velkomst-melding"
              hjelp="Vises i spillerens innboks og i invitasjons-e-posten."
            >
              <TekstOmraade label={null} value={velkomstMelding} onChange={setVelkomstMelding} rows={5} />
            </SkjemaFelt>
            <Kort tint pad="14px 16px">
              <Bryter
                label="Send invitasjon på e-post nå"
                sub="Slå av hvis du vil opprette spilleren først og invitere senere fra profilen."
                checked={sendInvitasjon}
                onChange={setSendInvitasjon}
              />
            </Kort>
          </Stakk>
        )}
      </Kort>

      {feilTekst && <ValideringsChip tone="advarsel" tekst={feilTekst} />}

      <Kort pad="16px 20px">
        <Veiviser
          steg={STEG_NAVN}
          aktiv={steg - 1}
          onTilbake={forrige}
          onNeste={neste}
          nesteTekst="Neste"
          tilbakeTekst="Tilbake"
          sisteTekst={
            pending
              ? "Oppretter…"
              : sendInvitasjon
                ? "Opprett og send invitasjon"
                : "Opprett spiller"
          }
        />
      </Kort>
    </div>
  );
}
