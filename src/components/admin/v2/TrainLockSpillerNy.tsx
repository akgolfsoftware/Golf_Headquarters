"use client";

/**
 * AgencyOS — Ny spiller, Train-lock (T4, 27.08.2026).
 *
 * Ingen egen fasit tegnet for denne veiviseren i designsystem/train-lock/
 * (verifisert mot SCREEN-INDEX.md — nærmeste analoger er AG-08 Spiller-ark
 * og S3-01 Spiller 360). Portet mekanisk fra rene TL-tokens + feltmønstrene
 * i TrainLockStall.tsx (dock-bakgrunn, radius.field, én hvit primær-CTA),
 * samme presedens som lys-avledningen i beslutninger.md §A4/§T-S5 — påvent
 * evt. egen fasit fra Anders.
 *
 * Uendret fra AdminNySpillerV2: samme 4-stegs flyt (Identitet → Golf-profil
 * → Tier og foreldre → Velkomst), samme validering, samme ekte server
 * action `createSpiller`. Kun visningslaget er byttet — ingen T.*
 * (Paper), ingen @/components/v2-primitiver.
 */

import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import {
  createSpiller,
  type OpprettSpillerInput,
} from "@/app/admin/(legacy)/spillere/ny/actions";
import {
  SPILLER_KATEGORIER,
  SPILLER_TIERS,
  ALL_PROGRAMS,
  type SpillerKategori,
  type SpillerTier,
} from "@/app/admin/(legacy)/spillere/ny/constants";
import type { PlayerProgram } from "@/generated/prisma/client";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

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

function Stakk({ children, gap = 16 }: { children: ReactNode; gap?: number }) {
  return <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>;
}

function CapsLabel({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.capsSm,
        textTransform: "uppercase",
        color: TL.mute,
      }}
    >
      {children}
    </span>
  );
}

function Felt({
  label,
  hjelp,
  feil,
  children,
}: {
  label: string;
  hjelp?: string;
  feil?: string;
  children: ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <CapsLabel>{label}</CapsLabel>
      <div style={{ marginTop: 6 }}>{children}</div>
      {feil ? (
        <span style={{ display: "block", marginTop: 4, fontSize: 12, color: TL.warn }}>{feil}</span>
      ) : hjelp ? (
        <span style={{ display: "block", marginTop: 4, fontSize: 12, color: TL.mute }}>{hjelp}</span>
      ) : null}
    </label>
  );
}

function inputStil(): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    height: 44,
    borderRadius: TL.radius.field,
    border: "none",
    background: TL.dock,
    padding: "0 14px",
    fontSize: 15,
    color: TL.text,
    outline: "none",
    boxSizing: "border-box",
  };
}

function Inndata({
  value,
  onChange,
  type = "text",
  placeholder,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <input
      type={type}
      className="v2-focus"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStil(), fontFamily: mono ? TL.font.mono : undefined, fontVariantNumeric: mono ? "tabular-nums" : undefined }}
    />
  );
}

function TekstOmraade({ value, onChange, rows = 5 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      className="v2-focus"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      style={{ ...inputStil(), height: "auto", padding: "12px 14px", resize: "vertical", lineHeight: 1.5 }}
    />
  );
}

function Velger({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select className="v2-focus" value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStil(), appearance: "none" }}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

/** Fylt statuspille — bruk kun for varsel-tilstand som ikke sperrer (TL.warn). */
function VarselPille({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 26,
        padding: "0 10px",
        borderRadius: TL.radius.pill,
        fontSize: 11.5,
        fontWeight: 600,
        color: TL.warn,
        boxShadow: `inset 0 0 0 1px ${TL.warnHair}`,
      }}
    >
      {children}
    </span>
  );
}

function ProfilFelt({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <CapsLabel>{label}</CapsLabel>
      <div style={{ marginTop: 4, fontSize: 15, color: TL.text, fontVariantNumeric: "tabular-nums" }}>{value ?? "—"}</div>
    </div>
  );
}

function ValgKort({
  tittel,
  sub,
  tag,
  valgt,
  onClick,
}: {
  tittel: string;
  sub: string;
  tag?: string;
  valgt: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={PRESS}
      style={{
        textAlign: "left",
        border: "none",
        cursor: "pointer",
        borderRadius: TL.radius.card,
        padding: 14,
        background: valgt ? TL.fill : TL.dock,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: valgt ? TL.onFill : TL.text }}>{tittel}</span>
        {tag && (
          <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: valgt ? TL.onFill : TL.mute, opacity: 0.8 }}>{tag}</span>
        )}
      </div>
      <div style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.4, color: valgt ? TL.onFill : TL.mute, opacity: valgt ? 0.85 : 1 }}>
        {sub}
      </div>
    </button>
  );
}

function Kort({ children, tint }: { children: ReactNode; tint?: boolean }) {
  return (
    <div style={{ background: tint ? TL.dock : TL.elev, borderRadius: TL.radius.card, padding: 20 }}>{children}</div>
  );
}

function Bryter({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={PRESS}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
        padding: 0,
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: TL.text }}>{label}</div>
        <div style={{ marginTop: 2, fontSize: 12.5, color: TL.mute, lineHeight: 1.4 }}>{sub}</div>
      </div>
      <span
        style={{
          flexShrink: 0,
          width: 44,
          height: 26,
          borderRadius: 999,
          background: checked ? TL.fill : TL.dim,
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: checked ? TL.onFill : TL.mute,
          }}
        />
      </span>
    </button>
  );
}

export function TrainLockSpillerNy() {
  const router = useRouter();
  const [steg, setSteg] = useState<StegNr>(1);
  const [pending, startTransition] = useTransition();
  const [serverFeil, setServerFeil] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [visFeil, setVisFeil] = useState(false);

  const [program, setProgram] = useState<PlayerProgram>("AK_ACADEMY");
  const [programCoachId] = useState<string>("");

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

  const [velkomstMelding, setVelkomstMelding] = useState(
    "Hei og velkommen til AK Golf Academy. Vi gleder oss til å trene sammen med deg.",
  );
  const [sendInvitasjon, setSendInvitasjon] = useState(true);

  const alder = useMemo(() => (fodselsdato ? alderFraIso(fodselsdato) : null), [fodselsdato]);
  const erUnder18 = alder !== null && alder < 18;

  const stegFeil: string | null = (() => {
    if (steg === 1) {
      if (navn.trim().length < 2) return "Navn må være minst 2 tegn.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.trim())) return "Ugyldig e-postadresse.";
      if (!fodselsdato) return "Fødselsdato er påkrevd.";
      if (alder == null || alder < 4 || alder > 110) return "Alder må være mellom 4 og 110 år.";
    }
    if (steg === 2) {
      if (hcp.trim() !== "") {
        const n = Number(hcp.replace(",", "."));
        if (Number.isNaN(n) || n < -10 || n > 54) return "HCP må være mellom −10 og 54.";
      }
    }
    if (steg === 3 && erUnder18) {
      if (foreldreNavn.trim().length < 2) return "Foreldre-navn er påkrevd for spillere under 18 år.";
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

  const feilTekst = serverFeil ?? (visFeil ? stegFeil : null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <div>
        <Link
          href="/admin/spillere"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
        >
          <Icon name="arrow-left" size={13} style={{ color: TL.mute }} />
          <CapsLabel>Stall</CapsLabel>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text }}>Ny spiller</h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: TL.mute, lineHeight: 1.5, maxWidth: 460 }}>
            Fire steg — identitet, golf-profil, tier og velkomst. Spilleren får invitasjon på e-post hvis du sender den nå.
          </p>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 30,
            padding: "0 12px",
            borderRadius: TL.radius.pill,
            background: TL.dock,
            fontSize: 12,
            fontWeight: 600,
            color: TL.text,
            whiteSpace: "nowrap",
          }}
        >
          Steg {steg} av 4 · {STEG_NAVN[steg - 1]}
        </span>
      </div>

      <Kort>
        {steg === 1 && (
          <Stakk>
            <Felt label="Program" hjelp="Spilleren enrolleres automatisk i dette programmet. Du kan endre det etterpå på spillerens profilside.">
              <Velger
                options={ALL_PROGRAMS.map((p) => PROGRAM_LABEL[p])}
                value={PROGRAM_LABEL[program]}
                onChange={(label) => setProgram(LABEL_TO_PROGRAM[label] ?? program)}
              />
            </Felt>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
              <Felt label="Fullt navn" feil={fieldErrors.navn}>
                <Inndata value={navn} onChange={setNavn} placeholder="F.eks. Øyvind Rohjan" />
              </Felt>
              <Felt label="E-post" hjelp="Brukes som innloggings-ID." feil={fieldErrors.epost}>
                <Inndata type="email" value={epost} onChange={setEpost} placeholder="ovind@eksempel.no" />
              </Felt>
              <Felt label="Fødselsdato" feil={fieldErrors.fodselsdato}>
                <Inndata type="date" value={fodselsdato} onChange={setFodselsdato} />
              </Felt>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
                <ProfilFelt label="Alder" value={alder == null ? undefined : `${alder} år`} />
                {erUnder18 && <VarselPille>Foreldre påkrevd</VarselPille>}
              </div>
            </div>
          </Stakk>
        )}

        {steg === 2 && (
          <Stakk>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
              <Felt label="Handicap (HCP)" hjelp="Bruk komma som desimaltegn, f.eks. 12,3." feil={fieldErrors.hcp}>
                <Inndata mono value={hcp} onChange={setHcp} placeholder="F.eks. 12,3" />
              </Felt>
              <Felt label="Hjemmeklubb" feil={fieldErrors.hjemmeklubb}>
                <Inndata value={hjemmeklubb} onChange={setHjemmeklubb} placeholder="F.eks. Gamle Fredrikstad GK" />
              </Felt>
            </div>
            <div>
              <CapsLabel>Kategori — styrer AK Golf-segmenteringen</CapsLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 8, marginTop: 8 }}>
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
              <CapsLabel>Abonnement</CapsLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 8, marginTop: 8 }}>
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
                  <VarselPille>Under 18</VarselPille>
                  <span style={{ fontSize: 12.5, color: TL.text }}>{alder} år — foreldre-info er påkrevd</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
                  <Felt label="Foreldre-navn" feil={fieldErrors.foreldreNavn}>
                    <Inndata value={foreldreNavn} onChange={setForeldreNavn} placeholder="Ola Pedersen" />
                  </Felt>
                  <Felt label="Foreldre-e-post" feil={fieldErrors.foreldreEpost}>
                    <Inndata type="email" value={foreldreEpost} onChange={setForeldreEpost} placeholder="ola@eksempel.no" />
                  </Felt>
                  <Felt label="Foreldre-telefon (valgfri)" feil={fieldErrors.foreldreTelefon}>
                    <Inndata type="tel" value={foreldreTelefon} onChange={setForeldreTelefon} placeholder="+47 900 00 000" />
                  </Felt>
                </div>
              </Kort>
            ) : (
              <p style={{ fontSize: 13, color: TL.mute }}>Spilleren er myndig — ingen foreldre-info nødvendig.</p>
            )}
          </Stakk>
        )}

        {steg === 4 && (
          <Stakk>
            <div>
              <CapsLabel>Oppsummering</CapsLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12, marginTop: 8 }}>
                <ProfilFelt label="Navn" value={navn || undefined} />
                <ProfilFelt label="E-post" value={epost || undefined} />
                <ProfilFelt label="Kategori" value={kategori} />
                <ProfilFelt label="Tier" value={tier === "GRATIS" ? "Gratis" : "Pro (299 kr/mnd)"} />
              </div>
            </div>
            <Felt label="Velkomst-melding" hjelp="Vises i spillerens innboks og i invitasjons-e-posten.">
              <TekstOmraade value={velkomstMelding} onChange={setVelkomstMelding} rows={5} />
            </Felt>
            <Kort tint>
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

      {feilTekst && (
        <div style={{ borderRadius: TL.radius.field, background: TL.dock, padding: "12px 16px", fontSize: 13, color: TL.warn }}>
          {feilTekst}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        {steg > 1 ? (
          <button
            type="button"
            onClick={forrige}
            className={PRESS}
            style={{
              height: 48,
              padding: "0 20px",
              borderRadius: TL.radius.pill,
              background: "transparent",
              border: "none",
              color: TL.mute,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tilbake
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={neste}
          disabled={pending}
          className={PRESS}
          style={{
            height: 48,
            padding: "0 24px",
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            border: "none",
            fontSize: 15,
            fontWeight: 700,
            cursor: pending ? "default" : "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {steg < 4
            ? "Neste"
            : pending
              ? "Oppretter…"
              : sendInvitasjon
                ? "Opprett og send invitasjon"
                : "Opprett spiller"}
        </button>
      </div>
    </div>
  );
}
