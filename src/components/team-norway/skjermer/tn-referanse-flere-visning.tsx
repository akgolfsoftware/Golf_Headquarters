import Link from "next/link";
import type { ReactNode } from "react";

import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { WAGR_KILDE, fellesTurneringer } from "@/lib/domain/tn-referanse-wagr-regler";
import type { WagrRefKort, WagrRefValg } from "@/lib/domain/tn-referanse-wagr";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnFotnote, TnListerad, TnMangler } from "../tn-flate";
import { TnPlassgraf } from "../tn-plassgraf";
import { TnReferanseFaner, type TnReferanseFane } from "../tn-referanse-faner";
import { TN_REFERANSESPILLERE_URL } from "../tn-referansespillere";
import { TnShell, tnRolleNavn, type TnAktivSide } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltTellere } from "../tn-stall";

/**
 * Referanse › Sammenlign, Søk, Norsk golf og HCP Norge (wireframes docs/design-system/utkast-tn/trenerflate,
 * «Referanse»; beslutninger.md §TEAM NORWAY ER BARE FOR TRENERE, punkt 3 og 4). Rene visninger; sidene
 * under src/app/team-norway/referanse henter. Valg og søk står i adressen, så alt virker uten JavaScript.
 *
 * Avvik:
 *   - Søk leter i WAGR-referansen (spillerne pipelines henter), ikke i alle norske resultater: søket i
 *     HQ-resultatene med juniornavn venter på at beslutningen om navn er lagt inn (#1602).
 *   - Norsk golf og HCP Norge har ingen tall i basen ennå og viser «—» med lenke til teamnorwayref.
 */

const heltall = new Intl.NumberFormat("nb-NO");
const desimal = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const datoFormat = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" });
const tall = (v: ReactNode) => <span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 16, color: TN.navy900, textAlign: "right", overflowWrap: "anywhere" }}>{v}</span>;
const lenkeStil = { fontSize: 14.5, fontWeight: 600, color: TN.navy900, minHeight: 44, display: "inline-flex", alignItems: "center" } as const;
const feltStil = { minHeight: 44, width: "100%", padding: "0 12px", border: `1px solid ${TN.ink300}`, borderRadius: TN.radius.md, background: TN.white, color: TN.ink900, fontFamily: TN.font.body, fontSize: 15 } as const;
const knappStil = { minHeight: 44, padding: "0 18px", border: 0, borderRadius: TN.radius.md, background: TN.navy900, color: TN.white, fontFamily: TN.font.body, fontWeight: 700, fontSize: 15, cursor: "pointer" } as const;

type Felles = { brukerNavn: string | null; visDataGolf: boolean; kontekst: TnArbeidskontekst };

function Ramme({ brukerNavn, visDataGolf, kontekst, aktiv, fane, overlinje, tittel, ingress, tellere, children }: Felles & { aktiv: TnAktivSide; fane: TnReferanseFane; overlinje: string; tittel: string; ingress: string; tellere: { verdi: ReactNode; tekst: string }[]; children: ReactNode }) {
  return (
    <TnShell aktiv={aktiv} brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater kanAdministrere={kontekst.kanAdministrere} visDataGolf={visDataGolf}>
      <TnSkraTopp bilde="tee-hand" etikett={tittel} overlinje={overlinje} tittel={tittel} ingress={ingress} hoyre={<TnHeltTellere tall={tellere} />} />
      <TnSkraKort>
        <TnFlate>
          <TnReferanseFaner aktiv={fane} />
        </TnFlate>
        {children}
      </TnSkraKort>
    </TnShell>
  );
}

const plassTekst = (p: number | null) => (p != null ? heltall.format(p) : "—");
const scoreTekst = (s: number | null) => (s != null ? desimal.format(s) : "—");

// ── Sammenlign ──

export function TnReferanseSammenlignVisning({ valg, kort, dato, ...felles }: Felles & { valg: WagrRefValg[]; kort: WagrRefKort[]; dato: Date | null }) {
  const iAar = (dato ?? kort[0]?.wagrDato)?.getUTCFullYear() ?? null;
  const felles2 = fellesTurneringer(kort.map((k) => k.turneringIder));
  const plasser = [0, 1, 2, 3];
  return (
    <Ramme
      {...felles}
      aktiv="referanse-sammenlign"
      fane="sammenlign"
      overlinje={dato ? `Referanse · rankinguka ${datoFormat.format(dato)}` : "Referanse"}
      tittel="Sammenlign"
      ingress="Velg inntil fire spillere fra WAGR-referansen og se plass, score og turneringer side om side."
      tellere={[
        { verdi: kort.length || "—", tekst: "valgte spillere" },
        { verdi: kort.length > 1 ? felles2 : "—", tekst: "felles turneringer" },
        { verdi: valg.length || "—", tekst: "spillere i referansen" },
      ]}
    >
      <TnFlate style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Velg spillere" />
        {valg.length === 0 ? (
          <TnMangler>WAGR-tallene er ikke lagt inn i HQ ennå.</TnMangler>
        ) : (
          <form method="get" action="/team-norway/referanse/sammenlign" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12, alignItems: "end" }}>
            {plasser.map((i) => (
              <label key={i} style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: TN.ink700 }}>
                Spiller {i + 1}
                <select name="id" defaultValue={kort[i]?.wagrId ?? ""} style={feltStil}>
                  <option value="">Ingen</option>
                  {valg.map((v) => <option key={v.wagrId} value={v.wagrId}>{`${v.navn}${v.plass != null ? ` (${heltall.format(v.plass)})` : ""}`}</option>)}
                </select>
              </label>
            ))}
            <button type="submit" style={knappStil}>Sammenlign</button>
          </form>
        )}
      </TnFlate>

      {kort.length > 0 ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
            {kort.map((k) => (
              <TnFlate key={k.wagrId} style={{ display: "grid", gap: 4 }}>
                <TnFlatehode tittel={k.navn} merknad={k.land} />
                <TnListerad tittel="WAGR-plass" hoyre={tall(plassTekst(k.plass))} />
                <TnListerad tittel="Beste plass" hoyre={tall(plassTekst(k.bestePlass))} />
                <TnListerad tittel={iAar ? `Score ${iAar}` : "Score i år"} hoyre={tall(scoreTekst(k.scoreIAar))} />
                <TnListerad tittel={iAar ? `Score ${iAar - 1}` : "Score i fjor"} hoyre={tall(scoreTekst(k.scoreIFjor))} />
                <TnListerad tittel="Snitt poeng" hoyre={tall(k.snittPoeng != null ? desimal.format(k.snittPoeng) : "—")} />
                <TnListerad tittel="Seire" hoyre={tall(k.seire != null ? heltall.format(k.seire) : "—")} />
                <TnListerad tittel="WAGR-turneringer" hoyre={tall(heltall.format(k.turneringIder.length))} />
              </TnFlate>
            ))}
          </div>
          <TnFlate style={{ display: "grid", gap: 8 }}>
            <TnFlatehode tittel="WAGR-plass år for år" />
            <TnPlassgraf serier={kort.map((k) => ({ navn: k.navn, punkter: k.aarForAar }))} etikett={`WAGR-plass år for år for ${kort.map((k) => k.navn).join(", ")}`} />
          </TnFlate>
        </>
      ) : null}

      <TnFotnote>Score er snittscore i WAGR-turneringer det året. WAGR-plass for tidligere år er plassen i uke 52. Kilde: {WAGR_KILDE}{dato ? `, rankinguka ${datoFormat.format(dato)}` : ""}.</TnFotnote>
    </Ramme>
  );
}

// ── Søk ──

export function TnReferanseSokVisning({ sok, treff, dato, ...felles }: Felles & { sok: string; treff: (WagrRefValg & { land: string; grupper: string[] })[]; dato: Date | null }) {
  const forKort = sok.trim().length > 0 && sok.trim().length < 2;
  return (
    <Ramme
      {...felles}
      aktiv="referanse-sok"
      fane="sok"
      overlinje={dato ? `Referanse · rankinguka ${datoFormat.format(dato)}` : "Referanse"}
      tittel="Søk"
      ingress="Finn en spiller i WAGR-referansen på navn."
      tellere={[{ verdi: sok.trim().length >= 2 ? treff.length : "—", tekst: "treff" }]}
    >
      <TnFlate style={{ display: "grid", gap: 12 }}>
        <form method="get" action="/team-norway/referanse/sok" role="search" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "end" }}>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: TN.ink700 }}>
            Navn (minst to bokstaver)
            <input type="search" name="q" defaultValue={sok} minLength={2} maxLength={60} autoComplete="off" style={feltStil} />
          </label>
          <button type="submit" style={knappStil}>Søk</button>
        </form>
        {forKort ? <TnMangler>Skriv minst to bokstaver.</TnMangler> : null}
      </TnFlate>

      {sok.trim().length >= 2 ? (
        <TnFlate style={{ paddingBlock: 4 }}>
          {treff.length === 0 ? <TnMangler>Ingen spillere i WAGR-referansen heter noe med «{sok.trim()}».</TnMangler> : null}
          {treff.map((t) => (
            <TnListerad
              key={t.wagrId}
              tittel={<Link href={`/team-norway/referanse/sammenlign?id=${t.wagrId}`} style={{ color: TN.ink900, textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" }}>{t.navn}</Link>}
              tekst={[t.land, ...t.grupper].join(" · ")}
              hoyre={<span style={{ display: "grid", justifyItems: "end", gap: 2 }}>{tall(plassTekst(t.plass))}<TnPille tone="nøytral">WAGR</TnPille></span>}
            />
          ))}
        </TnFlate>
      ) : null}

      <TnFotnote>Søket gjelder spillerne i WAGR-referansen. Trykk på navnet for å sammenligne. Kilde: {WAGR_KILDE}{dato ? `, rankinguka ${datoFormat.format(dato)}` : ""}.</TnFotnote>
    </Ramme>
  );
}

// ── Norsk golf og HCP Norge ──

const MANGLER: Record<"norsk-golf" | "hcp", { aktiv: TnAktivSide; tittel: string; ingress: string; tekst: string }> = {
  "norsk-golf": {
    aktiv: "referanse-norsk-golf",
    tittel: "Norsk golf",
    ingress: "Spillerne i norsk golf fordelt på nivå A–K, klubber, regioner og tourer.",
    tekst: "Fordelingen på nivå, klubb, region og tour er ikke lagt inn i HQ ennå. Til da ligger den på teamnorwayref.",
  },
  hcp: {
    aktiv: "referanse-hcp",
    tittel: "HCP Norge",
    ingress: "Handicap i Norge: normkurve, klubber og regioner.",
    tekst: "Handicaptallene for Norge er ikke lagt inn i HQ ennå. Til da ligger de på teamnorwayref.",
  },
};

export function TnReferanseManglerVisning({ fane, ...felles }: Felles & { fane: "norsk-golf" | "hcp" }) {
  const m = MANGLER[fane];
  return (
    <Ramme {...felles} aktiv={m.aktiv} fane={fane} overlinje="Referanse" tittel={m.tittel} ingress={m.ingress} tellere={[{ verdi: "—", tekst: "spillere" }, { verdi: "—", tekst: "klubber" }, { verdi: "—", tekst: "regioner" }]}>
      <TnFlate style={{ display: "grid", gap: 8 }}>
        <TnFlatehode tittel="Tallene kommer" />
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: TN.ink700, maxWidth: "60ch" }}>{m.tekst}</p>
        <a href={TN_REFERANSESPILLERE_URL} target="_blank" rel="noopener noreferrer" style={lenkeStil}>Åpne {m.tittel} på teamnorwayref</a>
      </TnFlate>
      <TnFotnote>Tallene vises samlet, aldri slik at én spiller kan pekes ut. Kilde og dato står ved tallene når de er i HQ.</TnFotnote>
    </Ramme>
  );
}
