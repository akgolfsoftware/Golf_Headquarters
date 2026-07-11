"use client";

/**
 * PlayerHQ Meg · Feedback — v2 (retning C «Presis»). Rekomponert fra den EKTE
 * skjermen src/app/portal/meg/feedback/page.tsx (+ app-feedback-form.tsx):
 * NPS-anbefaling, type tilbakemelding, dynamisk fritekst og anonym-bryter,
 * sendt via den EKTE server-action submitFeedback — uendret datakontrakt
 * (nps 0–10, type ∈ {bug,forslag,ros,sporsmal}, tekst, anonym). Kun
 * v2-komponenter fra "@/components/v2"; ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Ærlighet: den gamle skjermens «tidligere tilbakemeldinger» var 100 % hardkodet
 * demo-data, og submitFeedback PERSISTERER ikke (kun auditlogg + redirect) — det
 * finnes altså ingen ekte historikk-kilde. Den fabrikkerte lista (med coach-svar
 * og NPS-tall) portes ALDRI; historikk får ærlig tom-tilstand og meldes som gap.
 *
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitFeedback } from "@/app/portal/meg/feedback/actions";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Knapp,
  StatusPill,
  MikroMeta,
  TomTilstand,
  TekstOmraade,
  Bryter,
  NpsSkala,
  npsSegment,
  IkonChipVelger,
  type IkonChipValg,
} from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

type FeedbackType = "bug" | "forslag" | "ros" | "sporsmal";

export type MegFeedbackData = {
  /** ?takk=1 — server-action redirecter hit etter vellykket innsending. */
  takk: boolean;
};

/* ── Rene hjelpere (norsk bokmål) ──────────────────────────────────── */

const MAX = 500;

const TYPER: IkonChipValg<FeedbackType>[] = [
  { id: "bug", navn: "Bug", ikon: "bug" },
  { id: "forslag", navn: "Forslag", ikon: "lightbulb" },
  { id: "ros", navn: "Ros", ikon: "heart" },
  { id: "sporsmal", navn: "Spørsmål", ikon: "help-circle" },
];

/** Fritekst-spørsmålet følger NPS-segmentet — samme logikk som dagens skjerm. */
function fritekstSporsmal(nps: number): string {
  const seg = npsSegment(nps);
  if (seg === "kritiker") return "Hva bør vi forbedre?";
  if (seg === "passiv") return "Hva mangler for å gi en 10-er?";
  return "Hva liker du best?";
}

/** true på klient etter mount når viewport < 768px (styrer kun tittelstørrelse). */
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

/** Liten mono-caps markør (Påkrevd / Valgfritt) til kort-hodet. */
function Markor({ tekst, farge }: { tekst: string; farge: string }) {
  return (
    <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: farge, whiteSpace: "nowrap" }}>
      {tekst}
    </span>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegFeedbackV2({ data }: { data: MegFeedbackData }) {
  const router = useRouter();
  const mobile = useMobile();
  const [nps, setNps] = useState(9);
  const [type, setType] = useState<FeedbackType>("forslag");
  const [tekst, setTekst] = useState("");
  const [anonym, setAnonym] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState(false);

  function send() {
    // submitFeedback validerer med zod og redirecter til kanonisk rute ved suksess.
    // Fanger feil (f.eks. utløpt sesjon) i stedet for å la den forsvinne stille —
    // uten dette klikker brukeren på nytt uten synlig respons (oppfattes som en
    // innloggings-løkke når sesjonen faktisk er utløpt bak kulissene).
    setFeil(false);
    startTransition(async () => {
      try {
        await submitFeedback({ nps, type, tekst: tekst.trim(), anonym });
      } catch {
        setFeil(true);
      }
    });
  }

  const kanSende = tekst.trim().length > 0 && !pending;

  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>Tilbakemelding · under ett minutt</Caps>
        <div style={{ marginTop: 12 }}>
          <Tittel mobile={mobile} em="PlayerHQ?">Hva synes du om</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "12px 0 0", maxWidth: 560 }}>
          Vi leser hver eneste tilbakemelding. Bug, forslag eller bare ros, alt teller.
        </p>
      </div>

      {/* Kvittering (kun etter innsending) */}
      {data.takk && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <StatusPill tone="up">Sendt</StatusPill>
            <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>
              Takk for tilbakemeldingen. Du gjør PlayerHQ bedre.
            </span>
          </div>
        </Kort>
      )}

      {/* Feil ved innsending — f.eks. utløpt sesjon. Ærlig feilmelding, aldri stille svikt.
          Ingen `tint` (den er forest/lime-merkevarefarget for suksess) — nøytralt kort,
          fargesignalet bæres av StatusPill tone="down". */}
      {feil && (
        <Kort>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 11, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <StatusPill tone="down">Kunne ikke sende</StatusPill>
              <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>
                Noe gikk galt. Prøv igjen, eller logg inn på nytt hvis du ble logget ut.
              </span>
            </div>
            <Knapp
              icon="arrow-right"
              onClick={() => router.push("/auth/login?next=%2Fportal%2Fmeg%2Ffeedback")}
            >
              Logg inn på nytt
            </Knapp>
          </div>
        </Kort>
      )}

      {/* NPS — anbefaling */}
      <Kort eyebrow="Anbefaling" action={<Markor tekst="Påkrevd" farge={T.down} />}>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, lineHeight: 1.35, marginBottom: 16 }}>
          Hvor sannsynlig er det at du anbefaler PlayerHQ til en venn?
        </div>
        <NpsSkala value={nps} onChange={setNps} />
      </Kort>

      {/* Type */}
      <Kort eyebrow="Type tilbakemelding" action={<Markor tekst="Påkrevd" farge={T.down} />}>
        <IkonChipVelger valg={TYPER} value={type} onChange={setType} />
      </Kort>

      {/* Fritekst — spørsmålet følger NPS-segmentet */}
      <Kort eyebrow="Din tilbakemelding" action={<Markor tekst="Valgfritt" farge={T.mut} />}>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, marginBottom: 12 }}>
          {fritekstSporsmal(nps)}
        </div>
        <TekstOmraade
          label={null}
          value={tekst}
          onChange={(v) => setTekst(v.slice(0, MAX))}
          rows={5}
          placeholder="Skriv her, så detaljert eller kort du vil."
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 9 }}>
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Hjelper oss å forstå hva som funker</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, fontVariantNumeric: "tabular-nums" }}>{tekst.length} / {MAX}</span>
        </div>
      </Kort>

      {/* Anonym */}
      <Kort>
        <Bryter
          label="Send anonymt"
          sub="Vi kobler ikke svaret til kontoen din. Da kan vi heller ikke følge opp direkte."
          checked={anonym}
          onChange={setAnonym}
        />
      </Kort>

      {/* Innsending */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <MikroMeta icon="clock">Tar under ett minutt · vi leser alt</MikroMeta>
        <Knapp icon="send" onClick={send} disabled={!kanSende}>
          {pending ? "Sender …" : "Send tilbakemelding"}
        </Knapp>
      </div>

      {/* Tidligere tilbakemeldinger — ærlig tom-tilstand (ingen persistering, se gap) */}
      <Kort eyebrow="Tidligere tilbakemeldinger">
        <TomTilstand
          icon="history"
          title="Ingen innsendinger å vise ennå"
          sub="Tidligere tilbakemeldinger og eventuelle svar fra teamet vil dukke opp her når historikk kobles på."
        />
      </Kort>
    </div>
  );
}
