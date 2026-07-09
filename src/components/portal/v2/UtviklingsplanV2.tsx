"use client";

/**
 * PlayerHQ Utviklingsplan — v2 (retning C «Presis»). MERGE-skjerm: samler
 * talent-sporet (TalentTracking-radar + milepæler) og det tekniske P1–P10-
 * sporet (TechnicalPlan → posisjoner → krav) på ÉN read-only flate.
 *
 * Komponert 1:1 fra ui_kits/v2/v2-utviklingsplan.jsx (portet til
 * src/components/v2/utviklingsplan.tsx) + TalentProfil (gap — mockupen hadde
 * ingen talent-visning). Kun v2-komponenter fra "@/components/v2"; ingen
 * ad-hoc UI, ingen rå hex (kun T.*-tokens). Ærlig tom-tilstand der data mangler.
 *
 * V2Shell (montert i (v2preview)/v2-utviklingsplan/page.tsx) eier chrome-en —
 * denne komponenten rendrer bare den indre innholds-stacken.
 */

import {
  T,
  Caps,
  Tittel,
  Kort,
  TomTilstand,
  UtviklingsplanOversikt,
  MilepaelKort,
  LaeringsTrapp,
  CoachGodkjenning,
  TalentProfil,
  type Posisjon,
  type KravData,
  type TalentAkse,
  type TalentMilepael,
} from "@/components/v2";

/* ── Datakontrakt (serialiserbart, bygget server-side i page.tsx) ──── */

export interface MilepaelData {
  p: string;
  navn: string;
  hovedfokus: boolean;
  krav: KravData[];
}

export interface ForslagData {
  type: string;
  p?: string;
  forslag: string;
  evidens: string;
  foreslaatt: string;
}

export interface PlanData {
  navn: string;
  periode: string;
  posisjoner: Posisjon[];
  aktivP: string;
  aktivNavn: string;
  nesteKrav: KravData | null;
  milepaeler: MilepaelData[];
  laeringsAktiv: number | null;
}

export interface TalentData {
  niva: string;
  klubb: string | null;
  region: string | null;
  radar: TalentAkse[];
  milepaeler: TalentMilepael[];
}

export interface UtviklingsplanData {
  spillerNavn: string;
  talent: TalentData | null;
  plan: PlanData | null;
  forslag: ForslagData[];
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function UtviklingsplanV2({ data }: { data: UtviklingsplanData }) {
  const { talent, plan, forslag } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>PlayerHQ · Plan · Utviklingsplan</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="utviklingsplan">Min</Tittel>
        </div>
      </div>

      {/* Oversikt — teknisk plan-speil (hero). Tom-tilstand hvis ingen plan. */}
      {plan ? (
        <UtviklingsplanOversikt
          planNavn={plan.navn}
          periode={plan.periode}
          posisjoner={plan.posisjoner}
          aktivP={plan.aktivP}
          aktivNavn={plan.aktivNavn}
          nesteKrav={plan.nesteKrav ?? undefined}
          coachNote={null}
        />
      ) : (
        <Kort>
          <TomTilstand
            icon="file-text"
            title="Ingen teknisk utviklingsplan ennå"
            sub="Coachen setter opp din første plan i Workbench — da vises P-posisjoner, krav og milepæler her."
          />
        </Kort>
      )}

      {/* Talent + læringstrapp side om side (stables på mobil) */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap }}>
        {talent ? (
          <TalentProfil
            niva={talent.niva}
            klubb={talent.klubb}
            region={talent.region}
            radar={talent.radar}
            milepaeler={talent.milepaeler}
          />
        ) : (
          <Kort eyebrow="Talentprofil">
            <TomTilstand
              icon="activity"
              title="Ingen talentvurdering"
              sub="Denne spilleren er ikke registrert i talentprogrammet ennå."
            />
          </Kort>
        )}
        {plan && plan.laeringsAktiv != null ? (
          <LaeringsTrapp aktiv={plan.laeringsAktiv} />
        ) : (
          <Kort eyebrow="Læringstrapp">
            <TomTilstand
              icon="target"
              title="Ingen aktiv L-fase"
              sub="Læringstrappen fylles når en aktiv oppgave har en satt lærefase (L-Kropp → L-Auto)."
            />
          </Kort>
        )}
      </div>

      {/* Milepæler — én MilepaelKort per P-posisjon */}
      {plan && plan.milepaeler.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Caps>Milepæler · P-posisjoner</Caps>
          {plan.milepaeler.map((m) => (
            <MilepaelKort
              key={m.p}
              p={m.p}
              navn={m.navn}
              hovedfokus={m.hovedfokus}
              krav={m.krav}
              godkjentAv={null}
            />
          ))}
        </div>
      )}

      {/* Coach-godkjenning — AI Caddie-forslag som venter på coach */}
      {forslag.length > 0 && (
        <Kort eyebrow="AI-forslag · venter på coach" action={<Caps size={9}>{forslag.length}</Caps>}>
          {forslag.map((f, i) => (
            <CoachGodkjenning
              key={i}
              type={f.type}
              spiller={data.spillerNavn}
              p={f.p ?? ""}
              forslag={f.forslag}
              evidens={f.evidens}
              foreslaatt={f.foreslaatt}
              last={i === forslag.length - 1}
            />
          ))}
        </Kort>
      )}
    </div>
  );
}
