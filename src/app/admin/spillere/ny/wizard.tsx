"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  Send,
  UserPlus,
} from "lucide-react";

import { createSpiller, type OpprettSpillerInput } from "./actions";
import {
  SPILLER_KATEGORIER,
  SPILLER_TIERS,
  ALL_PROGRAMS,
  type SpillerKategori,
  type SpillerTier,
} from "./constants";
import type { PlayerProgram } from "@/generated/prisma/client";

const PROGRAM_LABEL: Record<PlayerProgram, string> = {
  WANG_TOPPIDRETT:   "WANG Toppidrett Fredrikstad",
  WANG_UNG:          "WANG Ung Fredrikstad",
  GFGK_MINI:         "GFGK — Mini",
  GFGK_BREDDE:       "GFGK — Bredde/Utvikling",
  GFGK_JENTER:       "GFGK — Jenter",
  GFGK_ELITE:        "GFGK — Elite",
  AK_ACADEMY:        "AK Golf Academy",
  AK_ACADEMY_JUNIOR: "AK Golf Academy Junior",
  PLATFORM_ONLY:     "Selvbetjent (ingen coach)",
};

type StegNr = 1 | 2 | 3 | 4;

const STEG_NAVN = [
  "Identitet",
  "Golf-profil",
  "Tier og foreldre",
  "Velkomst",
] as const;

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
  PRO: "300 kr/mnd. Full PlayerHQ + AI-coach, treningsplaner og prioritert support.",
};

function isoIDag(): string {
  return new Date().toISOString().slice(0, 10);
}

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

export function SpillerOnboardingWizard() {
  const router = useRouter();
  const [steg, setSteg] = useState<StegNr>(1);
  const [pending, startTransition] = useTransition();
  const [serverFeil, setServerFeil] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Program (steg 1 — obligatorisk)
  const [program, setProgram] = useState<PlayerProgram>("AK_ACADEMY");
  // programCoachId — coach-tildeling i wizard kommer i v2 via EnrollmentPanel
  const [programCoachId] = useState<string>("");

  // Steg 1
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [fodselsdato, setFodselsdato] = useState("");

  // Steg 2
  const [hcp, setHcp] = useState<string>("");
  const [kategori, setKategori] = useState<SpillerKategori>("B2");
  const [hjemmeklubb, setHjemmeklubb] = useState("");

  // Steg 3
  const [tier, setTier] = useState<SpillerTier>("GRATIS");
  const [foreldreNavn, setForeldreNavn] = useState("");
  const [foreldreEpost, setForeldreEpost] = useState("");
  const [foreldreTelefon, setForeldreTelefon] = useState("");

  // Steg 4
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

  function neste() {
    if (stegFeil) return;
    if (steg < 4) setSteg((steg + 1) as StegNr);
  }
  function forrige() {
    if (steg > 1) setSteg((steg - 1) as StegNr);
  }

  function sendInn() {
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

  return (
    <div className="space-y-6">
      <header
        role="banner"
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <span
            aria-hidden="true"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            AgencyOS · Stallen · Onboarding
          </span>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">
            Ny{" "}
            <em className="font-normal text-primary md:italic">spiller</em>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fire steg — identitet, golf-profil, tier og velkomst. Spilleren får
            invitasjon på e-post hvis du sender den nå.
          </p>
        </div>
      </header>

      <ProgressStripe current={steg} />

      <div className="rounded-2xl border border-border bg-card px-4 py-4 sm:px-6 sm:py-6">
        {steg === 1 && (
          <>
            {/* Program-valg øverst — obligatorisk */}
            <div className="mb-6 rounded-lg border border-border bg-secondary/30 px-4 py-4">
              <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Program <span className="text-destructive">*</span>
              </div>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value as PlayerProgram)}
                className="w-full rounded-md border border-border bg-card px-4 py-2 text-[13px] text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                {ALL_PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {PROGRAM_LABEL[p]}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                Spilleren enrolleres automatisk i dette programmet ved opprettelse.
                Du kan endre det etterpå på spillerens profilside.
              </p>
            </div>
            <Steg1Identitet
              navn={navn}
              setNavn={setNavn}
              epost={epost}
              setEpost={setEpost}
              fodselsdato={fodselsdato}
              setFodselsdato={setFodselsdato}
              alder={alder}
              fieldErrors={fieldErrors}
            />
          </>
        )}
        {steg === 2 && (
          <Steg2GolfProfil
            hcp={hcp}
            setHcp={setHcp}
            kategori={kategori}
            setKategori={setKategori}
            hjemmeklubb={hjemmeklubb}
            setHjemmeklubb={setHjemmeklubb}
            fieldErrors={fieldErrors}
          />
        )}
        {steg === 3 && (
          <Steg3TierForeldre
            tier={tier}
            setTier={setTier}
            erUnder18={erUnder18}
            alder={alder}
            foreldreNavn={foreldreNavn}
            setForeldreNavn={setForeldreNavn}
            foreldreEpost={foreldreEpost}
            setForeldreEpost={setForeldreEpost}
            foreldreTelefon={foreldreTelefon}
            setForeldreTelefon={setForeldreTelefon}
            fieldErrors={fieldErrors}
          />
        )}
        {steg === 4 && (
          <Steg4Velkomst
            navn={navn}
            epost={epost}
            tier={tier}
            kategori={kategori}
            velkomstMelding={velkomstMelding}
            setVelkomstMelding={setVelkomstMelding}
            sendInvitasjon={sendInvitasjon}
            setSendInvitasjon={setSendInvitasjon}
          />
        )}
      </div>

      {(stegFeil || serverFeil) && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-4 text-sm text-destructive"
        >
          {serverFeil ?? stegFeil}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={forrige}
          disabled={steg === 1 || pending}
          className="inline-flex h-11 items-center gap-1.5 rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          Tilbake
        </button>

        {steg < 4 ? (
          <button
            type="button"
            onClick={neste}
            disabled={!!stegFeil || pending}
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Neste
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        ) : (
          <button
            type="button"
            onClick={sendInn}
            disabled={pending || !!stegFeil}
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sendInvitasjon ? (
              <Send className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <UserPlus className="h-4 w-4" strokeWidth={1.75} />
            )}
            {pending
              ? "Oppretter…"
              : sendInvitasjon
                ? "Opprett og send invitasjon"
                : "Opprett spiller"}
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Progress-stripe
   ========================================================= */

function ProgressStripe({ current }: { current: StegNr }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
      {STEG_NAVN.map((navn, idx) => {
        const num = (idx + 1) as StegNr;
        const state: "done" | "current" | "todo" =
          num < current ? "done" : num === current ? "current" : "todo";
        const isCurrent = state === "current";
        const isDone = state === "done";
        return (
          <div
            key={navn}
            className={`relative rounded-lg bg-card px-4 py-2.5 ${
              isCurrent ? "border-2 border-accent" : "border border-border"
            }`}
          >
            <div
              className={`mb-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px] font-semibold leading-none ${
                isDone
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {num}
            </div>
            <div className="text-xs font-semibold leading-tight text-foreground">
              {navn}
            </div>
            <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
              Steg {num} av 4
            </div>
            {isDone && (
              <Check
                className="absolute right-2 top-2 h-3.5 w-3.5 text-primary"
                strokeWidth={2.5}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   Steg 1 — Identitet
   ========================================================= */

function Steg1Identitet({
  navn,
  setNavn,
  epost,
  setEpost,
  fodselsdato,
  setFodselsdato,
  alder,
  fieldErrors,
}: {
  navn: string;
  setNavn: (s: string) => void;
  epost: string;
  setEpost: (s: string) => void;
  fodselsdato: string;
  setFodselsdato: (s: string) => void;
  alder: number | null;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <StegHeader
        nr={1}
        tittel="Hvem er spilleren?"
        sub="Navn, e-post og fødselsdato. E-posten brukes som innloggings-ID."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FeltTekst
          label="Fullt navn"
          value={navn}
          onChange={setNavn}
          placeholder="F.eks. Øyvind Rohjan"
          paakrevd
          error={fieldErrors.navn}
        />
        <FeltTekst
          label="E-post"
          type="email"
          value={epost}
          onChange={setEpost}
          placeholder="markus@eksempel.no"
          paakrevd
          error={fieldErrors.epost}
        />
        <FeltTekst
          label="Fødselsdato"
          type="date"
          value={fodselsdato}
          onChange={setFodselsdato}
          maxDato={isoIDag()}
          paakrevd
          error={fieldErrors.fodselsdato}
        />
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Alder
          </span>
          <div className="flex h-10 items-center rounded-md border border-border bg-secondary/40 px-4 text-sm font-mono tabular-nums">
            {alder == null ? (
              <span className="text-muted-foreground">— år</span>
            ) : (
              <>
                <span className="text-foreground">{alder}</span>
                <span className="ml-1 text-muted-foreground">år</span>
                {alder < 18 && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-foreground">
                    Foreldre påkrevd
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Steg 2 — Golf-profil
   ========================================================= */

function Steg2GolfProfil({
  hcp,
  setHcp,
  kategori,
  setKategori,
  hjemmeklubb,
  setHjemmeklubb,
  fieldErrors,
}: {
  hcp: string;
  setHcp: (s: string) => void;
  kategori: SpillerKategori;
  setKategori: (k: SpillerKategori) => void;
  hjemmeklubb: string;
  setHjemmeklubb: (s: string) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <StegHeader
        nr={2}
        tittel="Golf-profil"
        sub="HCP, kategori og hjemmeklubb. Kategorien styrer AK Golf-segmenteringen."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FeltTekst
          label="Handicap (HCP)"
          value={hcp}
          onChange={setHcp}
          placeholder="F.eks. 12,3"
          inputMode="decimal"
          error={fieldErrors.hcp}
        />
        <FeltTekst
          label="Hjemmeklubb"
          value={hjemmeklubb}
          onChange={setHjemmeklubb}
          placeholder="F.eks. Gamle Fredrikstad GK"
          error={fieldErrors.hjemmeklubb}
        />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Kategori
        </span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SPILLER_KATEGORIER.map((k) => {
            const valgt = kategori === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setKategori(k)}
                className={`flex flex-col items-start gap-1 rounded-lg p-4 text-left transition-colors ${
                  valgt
                    ? "border-2 border-primary bg-primary/5"
                    : "border border-border hover:bg-secondary"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-display text-base font-semibold leading-none">
                    {k}
                  </span>
                  {valgt && (
                    <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                  )}
                </div>
                <span className="text-xs leading-snug text-muted-foreground">
                  {KATEGORI_BESKRIVELSE[k]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Steg 3 — Tier + foreldre
   ========================================================= */

function Steg3TierForeldre({
  tier,
  setTier,
  erUnder18,
  alder,
  foreldreNavn,
  setForeldreNavn,
  foreldreEpost,
  setForeldreEpost,
  foreldreTelefon,
  setForeldreTelefon,
  fieldErrors,
}: {
  tier: SpillerTier;
  setTier: (t: SpillerTier) => void;
  erUnder18: boolean;
  alder: number | null;
  foreldreNavn: string;
  setForeldreNavn: (s: string) => void;
  foreldreEpost: string;
  setForeldreEpost: (s: string) => void;
  foreldreTelefon: string;
  setForeldreTelefon: (s: string) => void;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <StegHeader
        nr={3}
        tittel="Tier og foreldre"
        sub="Velg abonnement. Foreldre-info er påkrevd for spillere under 18 år."
      />

      <div className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Abonnement
        </span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SPILLER_TIERS.map((t) => {
            const valgt = tier === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                className={`flex flex-col items-start gap-2 rounded-lg p-4 text-left transition-colors ${
                  valgt
                    ? "border-2 border-primary bg-primary/5"
                    : "border border-border hover:bg-secondary"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-display text-base font-semibold leading-none">
                    {t === "GRATIS" ? "Gratis" : "Pro"}
                  </span>
                  {valgt && (
                    <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                  )}
                </div>
                <span className="text-xs leading-snug text-muted-foreground">
                  {TIER_BESKRIVELSE[t]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {erUnder18 ? (
        <div className="space-y-2 rounded-lg border border-accent/50 bg-accent/10 p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-foreground">
              Under 18
            </span>
            <span className="text-sm text-foreground">
              {alder} år — foreldre-info er påkrevd
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FeltTekst
              label="Foreldre-navn"
              value={foreldreNavn}
              onChange={setForeldreNavn}
              placeholder="Ola Pedersen"
              paakrevd
              error={fieldErrors.foreldreNavn}
            />
            <FeltTekst
              label="Foreldre-e-post"
              type="email"
              value={foreldreEpost}
              onChange={setForeldreEpost}
              placeholder="ola@eksempel.no"
              paakrevd
              error={fieldErrors.foreldreEpost}
            />
            <FeltTekst
              label="Foreldre-telefon (valgfri)"
              value={foreldreTelefon}
              onChange={setForeldreTelefon}
              placeholder="+47 900 00 000"
              error={fieldErrors.foreldreTelefon}
            />
          </div>
        </div>
      ) : (
        <p className="rounded-md border border-border bg-secondary/40 px-4 py-2 text-sm text-muted-foreground">
          Spilleren er myndig — ingen foreldre-info nødvendig.
        </p>
      )}
    </div>
  );
}

/* =========================================================
   Steg 4 — Velkomst + invitasjon
   ========================================================= */

function Steg4Velkomst({
  navn,
  epost,
  tier,
  kategori,
  velkomstMelding,
  setVelkomstMelding,
  sendInvitasjon,
  setSendInvitasjon,
}: {
  navn: string;
  epost: string;
  tier: SpillerTier;
  kategori: SpillerKategori;
  velkomstMelding: string;
  setVelkomstMelding: (s: string) => void;
  sendInvitasjon: boolean;
  setSendInvitasjon: (b: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <StegHeader
        nr={4}
        tittel="Velkomst og invitasjon"
        sub="Tilpass meldingen og bestem om invitasjonen sendes nå."
      />

      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Oppsummering
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <Oppsummering label="Navn" value={navn || "—"} />
          <Oppsummering label="E-post" value={epost || "—"} />
          <Oppsummering label="Kategori" value={kategori} />
          <Oppsummering
            label="Tier"
            value={tier === "GRATIS" ? "Gratis" : "Pro (300 kr/mnd)"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Velkomst-melding
        </span>
        <textarea
          value={velkomstMelding}
          onChange={(e) => setVelkomstMelding(e.target.value)}
          rows={5}
          className="w-full resize-y rounded-md border border-input bg-background px-4 py-2 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          placeholder="Hei og velkommen…"
        />
        <p className="text-xs text-muted-foreground">
          Vises i spillerens innboks og i invitasjons-e-posten.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/40">
        <input
          type="checkbox"
          checked={sendInvitasjon}
          onChange={(e) => setSendInvitasjon(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <span className="flex-1">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
            Send invitasjon på e-post nå
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Slå av hvis du vil opprette spilleren først og invitere senere fra
            profilen.
          </span>
        </span>
      </label>
    </div>
  );
}

/* =========================================================
   Felles småkomponenter
   ========================================================= */

function StegHeader({
  nr,
  tittel,
  sub,
}: {
  nr: number;
  tittel: string;
  sub: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Steg {nr}
      </div>
      <h2 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight">
        {tittel}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

function FeltTekst({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  paakrevd,
  error,
  inputMode,
  maxDato,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  type?: string;
  placeholder?: string;
  paakrevd?: boolean;
  error?: string;
  inputMode?: "decimal" | "numeric" | "text" | "email";
  maxDato?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {paakrevd && <span className="ml-1 text-destructive">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        max={maxDato}
        aria-invalid={error ? true : undefined}
        className={`h-11 rounded-md border bg-card px-4 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}

function Oppsummering({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/60 py-1.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate font-mono text-xs font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}
