"use client";

/**
 * Oppstart for spiller (AU-04), sju steg i nytt design. Tilstand og server-kall bor her;
 * utseendet bor i SpillerOppstart.tsx. Tegning: docs/design-system/utkast-flater/innlogging.html.
 *
 * 1 Om deg · 2 Strokes Gained · 3 Hva har du tilgang til? · 4 Finn deg i turneringsresultatene ·
 * 5 Teknikktest · 6 Samtykker · 7 Velg treningsplan. Steg 2–5 kan hoppes over. Må holdes i synk med
 * SPILLER_TOTAL_STEPS i src/lib/auth/onboarding-state.ts.
 *
 * Under 16 år: fødselsdatoen lagres i kolonnen (og invitasjonen sendes) først i Samtykker, når
 * forelderens e-post er oppgitt. Før det lever datoen i preferences.onboarding.fodselsdato, så steget
 * kan gjenopptas.
 */

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { byggSgBaseline, tolkTall } from "@/lib/onboarding/sg-baseline";
import { alderFraDato, OPPSTART_STEG, TEST_KLUBBER, stederMedCapabilities, tilPrefsIder, type TestKlubbId } from "@/lib/onboarding/oppstart";
import type { Kandidat } from "@/lib/profil-kobling/typer";
import { bekreftKandidat, sokKandidater } from "@/app/portal/meg/resultater/actions";
import {
  saveSpillerOnboardingStep,
  markStepComplete,
  completeOnboarding,
  setDateOfBirthAndCheckMinor,
  type SpillerOnboardingData,
} from "./actions";
import { SpillerOppstart, TOMME_VERDIER, fodtIso, fodtTekstFraIso, type Kobling, type OppstartVerdier } from "@/components/auth/precision/SpillerOppstart";

const TOTAL_STEPS = OPPSTART_STEG.length;

export function OnboardingWizard({
  initialStep = 1,
  subscribe,
  navn,
  startFodt = "",
}: {
  initialStep?: number;
  subscribe?: string;
  /** Navnet fra profilen. Serveren søker på det, aldri på noe klienten skriver. */
  navn: string;
  startFodt?: string;
}) {
  // Mål etter fullført onboarding: gjenoppta checkout hvis besøkende valgte Full.
  const ferdigMaal = subscribe ? `/auth/checkout-resume?plan=${encodeURIComponent(subscribe)}` : "/portal";
  const router = useRouter();
  const [steg, setSteg] = useState(Math.min(TOTAL_STEPS, Math.max(1, initialStep)));
  const [v, setV] = useState<OppstartVerdier>({ ...TOMME_VERDIER, fodtTekst: fodtTekstFraIso(startFodt) });
  const [kobling, setKobling] = useState<Kobling>({ navn, fodselsaar: null, kandidater: null, koblet: false, feil: null });
  const [venter, startTransition] = useTransition();
  const [melding, setMelding] = useState<string | null>(null);
  const [tilstand, setTilstand] = useState<"data" | "laster" | "feil">("data");
  const sisteForsok = useRef<() => void>(() => {});
  const invitertEpost = useRef<string | null>(null);

  const endre = (patch: Partial<OppstartVerdier>) => setV((x) => ({ ...x, ...patch }));

  const fodt = fodtIso(v.fodtTekst);
  const alder = alderFraDato(fodt);
  const under16 = alder != null && alder < 16;
  const fodselsaar = /^\d{4}/.test(fodt) ? Number(fodt.slice(0, 4)) : null;

  function byggData(): SpillerOnboardingData {
    const snitt = tolkTall(v.snitt);
    const steder = stederMedCapabilities(v.steder, v.omrader);
    const testSlag = Object.fromEntries(
      TEST_KLUBBER.map((k) => [k.id, [[tolkTall(v.test[k.id].carry) ?? null, tolkTall(v.test[k.id].fraMal) ?? null]]]),
    ) as Record<TestKlubbId, Array<[number | null, number | null]>>;
    const harSlag = Object.values(testSlag).some((l) => l[0][0] != null || l[0][1] != null);
    return {
      fodselsdato: fodt || undefined,
      hcp: tolkTall(v.hcp),
      snittScoreSiste10: snitt,
      konkurranseNivaa: v.nivaa || undefined,
      sgHittilIAar: byggSgBaseline(v.sgIAar, snitt),
      sgForrigeSesong: byggSgBaseline(v.sgIFjor),
      steder,
      // Bakoverkompatibelt: FacilityPrefs bygges fortsatt av de gamle id-ene.
      fasiliteter: tilPrefsIder(steder.flatMap((s) => s.capabilities)),
      fasilitetOmrader: v.omrader,
      teknikktest: harSlag
        ? { verktoy: "Snitt av fem slag", avstand: Object.fromEntries(TEST_KLUBBER.map((k) => [k.id, k.avstand])), slag: testSlag }
        : undefined,
      // Under 16: opptak og ytelsesbilde er av til forelderen har svart.
      samtykkeYtelsesbilde: under16 ? false : v.ytelsesbilde,
      samtykkeOpptak: under16 ? false : v.opptak,
      treningsplan: v.plan ?? undefined,
    };
  }

  function neste() {
    setMelding(null);
    sisteForsok.current = neste;
    startTransition(async () => {
      // Steg 1: myndige lagrer datoen med en gang (kobling mot resultater trenger den).
      if (steg === 1) {
        if (alder == null) {
          setMelding("Skriv fødselsdatoen som dd.mm.åååå.");
          return;
        }
        if (!under16) {
          const r = await setDateOfBirthAndCheckMinor({ dateOfBirth: fodt });
          if (!r.ok) {
            setMelding(r.error ?? "Fødselsdatoen kunne ikke lagres.");
            return;
          }
        }
      }
      // Steg 6, under 16: datoen og forelderens e-post sendes sammen, og invitasjonen går ut.
      if (steg === 6 && under16 && invitertEpost.current !== v.forelderEpost.trim().toLowerCase()) {
        const r = await setDateOfBirthAndCheckMinor({ dateOfBirth: fodt, guardianEmail: v.forelderEpost.trim() });
        if (!r.ok) {
          setMelding(r.error ?? "Vi kunne ikke sende lenken til forelderen.");
          return;
        }
        invitertEpost.current = v.forelderEpost.trim().toLowerCase();
      }
      try {
        await saveSpillerOnboardingStep(byggData());
        await markStepComplete(steg);
      } catch {
        setTilstand("feil");
        return;
      }
      setSteg(steg + 1);
    });
  }

  function tilbake() {
    setMelding(null);
    if (steg > 1) setSteg(steg - 1);
  }

  // Siste steg: lagre alt først, så trigger completeOnboarding side-effektene
  // (fasiliteter, SG-baseline, opptakssamtykke, turneringskobling). Redirecten fra
  // completeOnboarding kan komme som avbrudd; da går vi rett til målet.
  function start() {
    setMelding(null);
    sisteForsok.current = start;
    startTransition(async () => {
      setTilstand("laster");
      try {
        await saveSpillerOnboardingStep(byggData());
      } catch {
        setTilstand("feil");
        return;
      }
      try {
        const svar = await completeOnboarding(subscribe);
        if (svar && !svar.ok) {
          setTilstand("data");
          setMelding(svar.feil);
          setSteg(1);
          return;
        }
      } catch {
        router.push(ferdigMaal);
        router.refresh();
      }
    });
  }

  function sok() {
    setKobling((k) => ({ ...k, feil: null, kandidater: null, fodselsaar }));
    startTransition(async () => {
      const svar = await sokKandidater({ golfId: v.golfId.trim() || undefined });
      if (!svar.ok) return setKobling((k) => ({ ...k, feil: svar.feil }));
      setKobling((k) => ({ ...k, kandidater: (svar.kandidater ?? []) as Kandidat[] }));
    });
  }

  function koble(personId: number) {
    setKobling((k) => ({ ...k, feil: null }));
    startTransition(async () => {
      const svar = await bekreftKandidat({ personId, golfId: v.golfId.trim() || undefined });
      if (!svar.ok) return setKobling((k) => ({ ...k, feil: svar.feil }));
      setKobling((k) => ({ ...k, koblet: true }));
    });
  }

  return (
    <SpillerOppstart
      steg={steg}
      tilstand={tilstand}
      v={v}
      endre={endre}
      kobling={{ ...kobling, fodselsaar }}
      venter={venter}
      melding={melding}
      onNeste={neste}
      onTilbake={tilbake}
      onHopp={neste}
      onStart={start}
      onSok={sok}
      onKoble={koble}
      onProvIgjen={() => {
        setTilstand("data");
        sisteForsok.current();
      }}
    />
  );
}
