"use client";

import {
  avsluttSpillerAction,
  endreTestdagAction,
  lagreCollegeAction,
  lagreOktAction,
  lagreSamlingAction,
  lagreSpillerstatusAction,
  lagreUttakAction,
  slettCollegeAction,
  slettDokumentAction,
  slettOktAction,
  slettSamlingAction,
  slettTestdagAction,
  slettUttakAction,
} from "@/app/team-norway/tn-redigering-actions";
import { TnFelt, TnFeltrad, TnSkjemaArk, TnSlettKnapp, TnTekstfelt, TnValg, type TnKnappVariant } from "./tn-handlinger";

/**
 * Skjemaene bak knappene på Team Norway-skjermene. Verdiene sendes som tekst;
 * serveren validerer alt på nytt (src/lib/domain/tn-redigering.ts).
 */

type Resultat = { ok: true; videre?: string } | { ok: false; feil: string };
const ut = async (p: Promise<{ ok: true } | { ok: false; feil: string }>): Promise<Resultat> => {
  const r = await p;
  return r.ok ? { ok: true } : r;
};

// ── Samling ──

export type TnSamlingVerdier = { id: string; tittel: string; sted: string; fra: string; til: string; notat: string };

export function TnSamlingSkjema({ samling, knapp, variant }: { samling?: TnSamlingVerdier; knapp: string; variant?: TnKnappVariant }) {
  return (
    <TnSkjemaArk
      knapp={knapp}
      knappVariant={variant}
      tittel={samling ? "Endre samling" : "Ny samling"}
      lagreTekst={samling ? "Lagre endringer" : "Opprett samling"}
      send={async (v) => {
        const r = await lagreSamlingAction(samling?.id ?? null, { tittel: v.tittel, sted: v.sted, fra: v.fra, til: v.til, notat: v.notat });
        if (!r.ok) return r;
        return { ok: true, videre: !samling && r.data ? `/team-norway/samlinger/${r.data.id}` : undefined };
      }}
    >
      <TnFelt etikett="Navn" navn="tittel" standard={samling?.tittel} pakrevd maks={200} plassholder="Høstsamling" />
      <TnFelt etikett="Sted" navn="sted" standard={samling?.sted} maks={200} plassholder="Bane eller anlegg" />
      <TnFeltrad>
        <TnFelt etikett="Fra" navn="fra" type="date" standard={samling?.fra} pakrevd />
        <TnFelt etikett="Til" navn="til" type="date" standard={samling?.til} pakrevd />
      </TnFeltrad>
      <TnTekstfelt etikett="Notat" navn="notat" standard={samling?.notat} maks={4000} />
    </TnSkjemaArk>
  );
}

export function TnSlettSamling({ id, navn }: { id: string; navn: string }) {
  return (
    <TnSlettKnapp
      knapp="Slett samling"
      tittel="Slett samling"
      tekst={`«${navn}» fjernes fra terminlisten og månedsplanen for hele gruppen.`}
      bekreft="Slett samlingen"
      handling={() => ut(slettSamlingAction(id))}
      videre="/team-norway/samlinger"
    />
  );
}

// ── Økt i månedsplanen ──

export type TnOktVerdier = { id: string; tittel: string; dato: string; fra: string; til: string; sted: string; beskrivelse: string };

export function TnOktSkjema({ okt, knapp, variant, standardDato }: { okt?: TnOktVerdier; knapp: string; variant?: TnKnappVariant; standardDato?: string }) {
  return (
    <TnSkjemaArk
      knapp={knapp}
      knappVariant={variant}
      tittel={okt ? "Endre økt" : "Ny økt"}
      lagreTekst={okt ? "Lagre endringer" : "Legg inn økt"}
      send={(v) => ut(lagreOktAction(okt?.id ?? null, { tittel: v.tittel, dato: v.dato, fra: v.fra, til: v.til, sted: v.sted, beskrivelse: v.beskrivelse }).then((r) => (r.ok ? { ok: true as const } : r)))}
    >
      <TnFelt etikett="Økt" navn="tittel" standard={okt?.tittel} pakrevd maks={200} plassholder="Teknikk med TrackMan" />
      <TnFeltrad>
        <TnFelt etikett="Dato" navn="dato" type="date" standard={okt?.dato ?? standardDato} pakrevd />
        <TnFelt etikett="Fra" navn="fra" type="time" standard={okt?.fra ?? "16:00"} pakrevd />
        <TnFelt etikett="Til" navn="til" type="time" standard={okt?.til ?? "17:30"} pakrevd />
      </TnFeltrad>
      <TnFelt etikett="Sted" navn="sted" standard={okt?.sted} maks={200} />
      <TnTekstfelt etikett="Innhold" navn="beskrivelse" standard={okt?.beskrivelse} maks={4000} />
    </TnSkjemaArk>
  );
}

export function TnSlettOkt({ id, navn }: { id: string; navn: string }) {
  return <TnSlettKnapp knapp="Slett" variant="tekst" tittel="Slett økt" tekst={`«${navn}» fjernes fra månedsplanen.`} bekreft="Slett økten" handling={() => ut(slettOktAction(id))} />;
}

// ── Testdag ──

export function TnTestdagEndre({ id, tittel, sted, tidspunktLokal }: { id: string; tittel: string; sted: string; tidspunktLokal: string }) {
  return (
    <TnSkjemaArk
      knapp="Endre testdag"
      knappVariant="sekundar"
      tittel="Endre testdag"
      lagreTekst="Lagre endringer"
      send={(v) => {
        const tid = new Date(v.tidspunkt);
        if (Number.isNaN(tid.getTime())) return Promise.resolve({ ok: false as const, feil: "Ugyldig tidspunkt." });
        return ut(endreTestdagAction(id, { tittel: v.tittel, sted: v.sted, tidspunkt: tid.toISOString() }));
      }}
    >
      <TnFelt etikett="Navn" navn="tittel" standard={tittel} pakrevd maks={200} />
      <TnFelt etikett="Sted" navn="sted" standard={sted} maks={200} />
      <TnFelt etikett="Tidspunkt" navn="tidspunkt" type="datetime-local" standard={tidspunktLokal} pakrevd />
    </TnSkjemaArk>
  );
}

export function TnSlettTestdag({ id, navn }: { id: string; navn: string }) {
  return (
    <TnSlettKnapp
      knapp="Slett testdag"
      tittel="Slett testdag"
      tekst={`«${navn}» slettes med køen. Det går bare når ingen resultater er ført.`}
      bekreft="Slett testdagen"
      handling={() => ut(slettTestdagAction(id))}
      videre="/team-norway/fellestesting"
    />
  );
}

// ── Uttak ──

export const UTTAK_TEKST: Record<string, string> = { UTTATT: "Tatt ut", RESERVE: "Reserve", IKKE_UTTATT: "Ikke tatt ut" };

export function TnUttakSkjema({ spillere, knapp, variant, standard }: { spillere: { id: string; navn: string }[]; knapp: string; variant?: TnKnappVariant; standard?: { spillerId: string; arrangement: string; status: string; begrunnelse: string } }) {
  return (
    <TnSkjemaArk
      knapp={knapp}
      knappVariant={variant}
      tittel={standard ? "Endre uttak" : "Registrer uttak"}
      lagreTekst="Lagre uttak"
      send={(v) => ut(lagreUttakAction({ spillerId: v.spillerId, arrangement: v.arrangement, status: v.status, begrunnelse: v.begrunnelse }))}
    >
      <TnValg etikett="Spiller" navn="spillerId" standard={standard?.spillerId} pakrevd valg={spillere.map((s) => ({ verdi: s.id, tekst: s.navn }))} />
      <TnFelt etikett="Arrangement" navn="arrangement" standard={standard?.arrangement} pakrevd maks={200} plassholder="EM lag 2027" />
      <TnValg etikett="Uttak" navn="status" standard={standard?.status ?? "UTTATT"} valg={Object.entries(UTTAK_TEKST).map(([verdi, tekst]) => ({ verdi, tekst }))} />
      <TnTekstfelt etikett="Begrunnelse" navn="begrunnelse" standard={standard?.begrunnelse} />
    </TnSkjemaArk>
  );
}

export function TnSlettUttak({ id, beskrivelse }: { id: string; beskrivelse: string }) {
  return <TnSlettKnapp knapp="Fjern" variant="tekst" tittel="Fjern uttak" tekst={`${beskrivelse} fjernes fra uttakslisten.`} bekreft="Fjern uttaket" handling={() => ut(slettUttakAction(id))} />;
}

// ── Lisens og status ──

export const LISENS_TEKST: Record<string, string> = { BETALT: "Betalt", UBETALT: "Ikke betalt", FRITAK: "Fritak" };

export function TnSpillerstatusSkjema({ spillerId, spillerNavn, aar, standard }: { spillerId: string; spillerNavn: string; aar: number; standard: { lisensStatus: string; lisensBetaltDato: string; helseattestUtloper: string; antidopingSignert: string } }) {
  return (
    <TnSkjemaArk
      knapp="Endre"
      knappVariant="tekst"
      tittel={`${spillerNavn} · ${aar}`}
      send={(v) => ut(lagreSpillerstatusAction({ spillerId, aar, lisensStatus: v.lisensStatus, lisensBetaltDato: v.lisensBetaltDato, helseattestUtloper: v.helseattestUtloper, antidopingSignert: v.antidopingSignert }))}
    >
      <TnFeltrad>
        <TnValg etikett="Lisens" navn="lisensStatus" standard={standard.lisensStatus} valg={[{ verdi: "", tekst: "Ikke registrert" }, ...Object.entries(LISENS_TEKST).map(([verdi, tekst]) => ({ verdi, tekst }))]} />
        <TnFelt etikett="Betalt dato" navn="lisensBetaltDato" type="date" standard={standard.lisensBetaltDato} />
      </TnFeltrad>
      <TnFeltrad>
        <TnFelt etikett="Helseattest utløper" navn="helseattestUtloper" type="date" standard={standard.helseattestUtloper} />
        <TnFelt etikett="Antidoping signert" navn="antidopingSignert" type="date" standard={standard.antidopingSignert} />
      </TnFeltrad>
    </TnSkjemaArk>
  );
}

// ── College ──

export const COLLEGE_TEKST: Record<string, string> = { INTERESSE: "Interesse", DIALOG: "I dialog", TILBUD: "Tilbud", SIGNERT: "Signert", STUDERER: "Studerer" };

export function TnCollegeSkjema({ spillere, knapp, variant, standard }: { spillere: { id: string; navn: string }[]; knapp: string; variant?: TnKnappVariant; standard?: { spillerId: string; skole: string; status: string; startDato: string; notat: string } }) {
  return (
    <TnSkjemaArk
      knapp={knapp}
      knappVariant={variant}
      tittel={standard ? "Endre college" : "Legg til college"}
      send={(v) => ut(lagreCollegeAction({ spillerId: v.spillerId, skole: v.skole, status: v.status, startDato: v.startDato, notat: v.notat }))}
    >
      <TnValg etikett="Spiller" navn="spillerId" standard={standard?.spillerId} pakrevd valg={spillere.map((s) => ({ verdi: s.id, tekst: s.navn }))} />
      <TnFelt etikett="College" navn="skole" standard={standard?.skole} pakrevd maks={200} plassholder="University of Arizona" />
      <TnFeltrad>
        <TnValg etikett="Status" navn="status" standard={standard?.status ?? "INTERESSE"} valg={Object.entries(COLLEGE_TEKST).map(([verdi, tekst]) => ({ verdi, tekst }))} />
        <TnFelt etikett="Start" navn="startDato" type="date" standard={standard?.startDato} />
      </TnFeltrad>
      <TnTekstfelt etikett="Notat" navn="notat" standard={standard?.notat} />
    </TnSkjemaArk>
  );
}

export function TnSlettCollege({ spillerId, navn }: { spillerId: string; navn: string }) {
  return <TnSlettKnapp knapp="Fjern" variant="tekst" tittel="Fjern college" tekst={`College-statusen til ${navn} fjernes.`} bekreft="Fjern" handling={() => ut(slettCollegeAction(spillerId))} />;
}

// ── Spiller ut av gruppen ──

export function TnAvsluttSpiller({ spillerId, navn }: { spillerId: string; navn: string }) {
  return (
    <TnSlettKnapp
      knapp="Avslutt medlemskap"
      variant="tekst"
      tittel="Avslutt medlemskap"
      tekst={`${navn} tas ut av Team Norway-gruppen fra i dag. Resultater og historikk beholdes.`}
      bekreft="Avslutt medlemskapet"
      handling={() => ut(avsluttSpillerAction(spillerId))}
      videre="/team-norway/spillere"
    />
  );
}

// ── Dokument ──

export function TnSlettDokument({ id, navn }: { id: string; navn: string }) {
  return <TnSlettKnapp knapp="Slett" variant="tekst" tittel="Slett dokument" tekst={`«${navn}» slettes for hele gruppen.`} bekreft="Slett dokumentet" handling={() => ut(slettDokumentAction(id))} />;
}
