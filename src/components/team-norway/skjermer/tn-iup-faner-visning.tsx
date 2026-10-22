import Link from "next/link";
import type { ReactNode } from "react";

import type { TnArbeidskontekst, TnSpillerAktivPlan, TnSpillerOkt, TnSpillerProfil, TnSpillerTreningFane } from "@/lib/domain/tn-arbeidsflate";
import type { TnIupRanking } from "@/lib/domain/tn-iup-oversikt";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnIupTopp } from "../tn-iup-topp";
import { TnNokkeltall, TnShell, tnRolleNavn, type TnSpillerFane } from "../tn-shell";
import { TnFlate, TnFlatehode, TnFotnote, TnListerad, TnMangler, TnRutenett, TnTekstlenke } from "../tn-flate";
import { TnHeltTellere, TnPyramide } from "../tn-stall";
import { datoKort, datoLang, periode } from "./felles";

/**
 * De tre IUP-fanene som kom med pakke e (wireframes docs/design-system/utkast-tn/trenerflate, §2 og §4):
 * Ranking, Turneringer og Trening. Rene visninger uten datahenting; sidene under
 * src/app/team-norway/spiller/[spillerId] henter innenfor delingslåsen og viser låsen uten deling.
 * Manglende tall er «—». Kilde og dato står ved tallene.
 *
 * Avvik:
 *   - NGF-juniorranking finnes ikke i appen og står med strek.
 *   - Turneringer viser brutto snitt per turnering, ikke til-par: til-par per turnering er ikke i profildataene ennå.
 *   - Trening viser Workbench-øktene; «Foreslå endring» åpner planen, der endringer blir forslag spilleren godtar.
 */

const heltall = new Intl.NumberFormat("nb-NO");
const snitt = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const en = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 });
const komma = (n: number) => en.format(Math.round(n * 10) / 10);
const timer = (min: number) => `${komma(min / 60)} t`;
const tall = (v: ReactNode) => <span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 16, color: TN.navy900, textAlign: "right", whiteSpace: "nowrap" }}>{v}</span>;
const rund = (n: number) => Math.round(n * 100) / 100;
const kolonne = { display: "grid", gap: 12, alignContent: "start" } as const;

function Ramme({ brukerNavn, kontekst, spillerId, spillerNavn, aktiv, tittel, ingress, tellere, children }: { brukerNavn: string | null; kontekst: TnArbeidskontekst; spillerId: string; spillerNavn: string; aktiv: TnSpillerFane; tittel: string; ingress?: string; tellere: { verdi: ReactNode; tekst: string }[]; children: ReactNode }) {
  return (
    <TnShell aktiv="spillere" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater kanAdministrere={kontekst.kanAdministrere} tilbake={{ href: "/team-norway/spillere", label: "Spillere" }}>
      <TnIupTopp spillerId={spillerId} spillerNavn={spillerNavn} aktiv={aktiv} kanAdministrere overlinje={`IUP · ${spillerNavn}`} tittel={tittel} ingress={ingress} hoyre={<TnHeltTellere tall={tellere} />}>
        {children}
      </TnIupTopp>
    </TnShell>
  );
}

/**
 * Enkel linjegraf uten tekst inne i SVG-en, så den skalerer i alle bredder. `lavereErBedre` snur aksen,
 * slik at bedre plass eller lavere score står høyere.
 */
function Linjegraf({ punkter, lavereErBedre, etikett, fra, til, topp, bunn }: { punkter: number[]; lavereErBedre: boolean; etikett: string; fra: string; til: string; topp: string; bunn: string }) {
  if (punkter.length < 2) return <TnMangler>For få punkter til en graf ennå.</TnMangler>;
  const min = Math.min(...punkter);
  const maks = Math.max(...punkter);
  const spenn = maks - min || 1;
  const y = (v: number) => 8 + (lavereErBedre ? (v - min) / spenn : (maks - v) / spenn) * 84;
  const x = (i: number) => 2 + (i / (punkter.length - 1)) * 96;
  const linje = punkter.map((v, i) => `${rund(x(i))},${rund(y(v))}`).join(" ");
  return (
    <figure style={{ margin: 0, display: "grid", gap: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 8, alignItems: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: TN.font.mono, fontSize: 12, color: TN.ink500, textAlign: "right" }}>
          <span>{topp}</span>
          <span>{bunn}</span>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={etikett} style={{ width: "100%", height: 160, display: "block", background: TN.ink50, borderRadius: TN.radius.md }}>
          <polyline points={linje} fill="none" stroke={TN.navy600} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          {punkter.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={1.6} fill={TN.red600} vectorEffect="non-scaling-stroke" />)}
        </svg>
      </div>
      <figcaption style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12.5, color: TN.ink500, paddingLeft: 40 }}>
        <span>{fra}</span>
        <span>{til}</span>
      </figcaption>
    </figure>
  );
}

// ── Ranking ──

export function TnIupRankingVisning({ brukerNavn, kontekst, spillerId, spillerNavn, ranking }: { brukerNavn: string | null; kontekst: TnArbeidskontekst; spillerId: string; spillerNavn: string; ranking: TnIupRanking }) {
  const { wagr, historikk } = ranking;
  const kurve = historikk.filter((h): h is typeof h & { plassEtter: number } => h.plassEtter != null);
  const kilde = wagr ? `Kilde: World Amateur Golf Ranking (WAGR), The R&A, ${datoLang(wagr.dato)}.` : "Spilleren er ikke koblet til WAGR ennå.";
  return (
    <Ramme
      brukerNavn={brukerNavn} kontekst={kontekst} spillerId={spillerId} spillerNavn={spillerNavn} aktiv="ranking" tittel="Ranking" ingress="Offentlig ranking: WAGR og NGFs juniorranking."
      tellere={[
        { verdi: wagr?.plass != null ? heltall.format(wagr.plass) : "—", tekst: "WAGR-plass" },
        { verdi: wagr?.bestePlass != null ? heltall.format(wagr.bestePlass) : "—", tekst: "beste WAGR-plass" },
        { verdi: wagr?.snittPoeng != null ? snitt.format(wagr.snittPoeng) : "—", tekst: "snittpoeng" },
        { verdi: "—", tekst: "NGF juniorranking" },
      ]}
    >
      <TnFlate>
        <TnFotnote>{kilde} NGFs juniorranking finnes ikke i appen ennå.</TnFotnote>
      </TnFlate>
      <TnRutenett min={320}>
        <section style={kolonne}>
          <TnFlatehode tittel="WAGR-plass over tid" />
          <TnFlate style={{ display: "grid", gap: 10 }}>
            {kurve.length === 0 ? (
              <TnMangler>{wagr ? "Ingen WAGR-resultater med plass ennå." : "Spilleren er ikke koblet til WAGR ennå."}</TnMangler>
            ) : (
              <Linjegraf
                punkter={kurve.map((h) => h.plassEtter)}
                lavereErBedre
                etikett={`WAGR-plass etter hver turnering, fra ${heltall.format(kurve[0]!.plassEtter)} til ${heltall.format(kurve.at(-1)!.plassEtter)}`}
                fra={kurve[0]!.dato ? datoKort(kurve[0]!.dato) : String(kurve[0]!.aar)}
                til={kurve.at(-1)!.dato ? datoKort(kurve.at(-1)!.dato!) : String(kurve.at(-1)!.aar)}
                topp={heltall.format(Math.min(...kurve.map((h) => h.plassEtter)))}
                bunn={heltall.format(Math.max(...kurve.map((h) => h.plassEtter)))}
              />
            )}
            <TnFotnote>Plass uka etter hver turnering. Høyere i grafen er bedre plass.</TnFotnote>
          </TnFlate>
        </section>
        <section style={kolonne}>
          <TnFlatehode tittel="Plass ved årsslutt" />
          <TnFlate style={{ paddingBlock: 4 }}>
            {(wagr?.aarsslutt ?? []).length === 0 ? <TnMangler>—</TnMangler> : null}
            {wagr?.aarsslutt.map((a) => <TnListerad key={a.aar} tittel={String(a.aar)} hoyre={tall(a.plass != null ? heltall.format(a.plass) : "—")} />)}
            <TnListerad tittel="Seire i WAGR-turneringer" hoyre={tall(wagr?.seire != null ? heltall.format(wagr.seire) : "—")} />
          </TnFlate>
        </section>
      </TnRutenett>
      <section style={kolonne}>
        <TnFlatehode tittel="WAGR-turneringer" merknad={historikk.length ? `${historikk.length} ${historikk.length === 1 ? "turnering" : "turneringer"}` : undefined} />
        <TnFlate style={{ paddingBlock: 4 }}>
          {historikk.length === 0 ? <TnMangler>Ingen WAGR-turneringer registrert.</TnMangler> : null}
          {[...historikk].reverse().slice(0, 12).map((h, i) => (
            <TnListerad
              key={`${h.navn}-${i}`}
              tittel={h.navn}
              tekst={`${h.dato ? datoLang(h.dato) : h.aar}${h.plassering ? ` · ${h.plassering}` : ""}`}
              hoyre={tall(`${h.plassFoer != null ? heltall.format(h.plassFoer) : "—"} → ${h.plassEtter != null ? heltall.format(h.plassEtter) : "—"}`)}
            />
          ))}
        </TnFlate>
        <TnFotnote>Plass uka før og uka etter turneringen. {kilde}</TnFotnote>
      </section>
    </Ramme>
  );
}

// ── Turneringer ──

export function TnIupTurneringerVisning({ brukerNavn, kontekst, spillerId, spillerNavn, aar, iAar, iFjor }: { brukerNavn: string | null; kontekst: TnArbeidskontekst; spillerId: string; spillerNavn: string; aar: number; iAar: TnSpillerProfil; iFjor: TnSpillerProfil | null }) {
  const turneringer = iAar.turneringer;
  const medSnitt = (turneringer ?? []).filter((t): t is typeof t & { bruttoSnitt: number } => t.bruttoSnitt !== null).sort((a, b) => a.start.getTime() - b.start.getTime());
  const snittTekst = (p: TnSpillerProfil | null) => (p?.aaret && p.aaret.runder > 0 && p.aaret.bruttoSnitt !== null ? snitt.format(p.aaret.bruttoSnitt) : "—");
  const endring = iAar.aaret?.bruttoSnitt != null && iFjor?.aaret?.bruttoSnitt != null && iAar.aaret.runder > 0 && iFjor.aaret.runder > 0 ? iAar.aaret.bruttoSnitt - iFjor.aaret.bruttoSnitt : null;
  return (
    <Ramme
      brukerNavn={brukerNavn} kontekst={kontekst} spillerId={spillerId} spillerNavn={spillerNavn} aktiv="turneringer" tittel="Turneringer" ingress="Offisielle resultater, bare brutto: ekte slag per fullført runde."
      tellere={[
        { verdi: snittTekst(iAar), tekst: `brutto snitt ${aar}` },
        { verdi: snittTekst(iFjor), tekst: `brutto snitt ${aar - 1}` },
        { verdi: endring !== null ? `${endring > 0 ? "+" : endring < 0 ? "−" : ""}${snitt.format(Math.abs(endring))}` : "—", tekst: "endring, lavere er bedre" },
        { verdi: iAar.aaret ? heltall.format(iAar.aaret.runder) : "—", tekst: `runder ${aar}` },
      ]}
    >
      <TnRutenett min={320}>
        <section style={kolonne}>
          <TnFlatehode tittel={`Brutto snitt per turnering ${aar}`} />
          <TnFlate style={{ display: "grid", gap: 10 }}>
            {turneringer === null ? (
              <TnMangler>Spilleren er ikke koblet til en resultatprofil ennå.</TnMangler>
            ) : (
              <Linjegraf
                punkter={medSnitt.map((t) => t.bruttoSnitt)}
                lavereErBedre
                etikett={`Brutto snitt per turnering i ${aar}`}
                fra={medSnitt[0] ? datoKort(medSnitt[0].start) : ""}
                til={medSnitt.at(-1) ? datoKort(medSnitt.at(-1)!.start) : ""}
                topp={medSnitt.length ? snitt.format(Math.min(...medSnitt.map((t) => t.bruttoSnitt))) : ""}
                bunn={medSnitt.length ? snitt.format(Math.max(...medSnitt.map((t) => t.bruttoSnitt))) : ""}
              />
            )}
            <TnFotnote>Høyere i grafen er lavere score.</TnFotnote>
          </TnFlate>
        </section>
        <section style={kolonne}>
          <TnFlatehode tittel="Sesong for sesong" />
          <TnFlate style={{ paddingBlock: 4 }}>
            {[{ a: aar, p: iAar }, { a: aar - 1, p: iFjor }].map(({ a, p }) => (
              <TnListerad key={a} tittel={String(a)} tekst={p?.aaret ? `${p.aaret.runder} ${p.aaret.runder === 1 ? "runde" : "runder"} · ${p.turneringer?.length ?? 0} turneringer` : "—"} hoyre={tall(snittTekst(p))} />
            ))}
          </TnFlate>
        </section>
      </TnRutenett>
      <section style={kolonne}>
        <TnFlatehode tittel={`Turneringer ${aar}`} />
        <TnFlate style={{ paddingBlock: 4 }}>
          {turneringer === null ? <TnMangler>Turneringene vises når spilleren er koblet til en resultatprofil.</TnMangler> : turneringer.length === 0 ? <TnMangler>Ingen registrerte turneringer i {aar}.</TnMangler> : null}
          {turneringer?.map((t, i) => (
            <TnListerad
              key={`${t.navn}-${i}`}
              tittel={t.navn}
              tekst={`${periode(t.start, t.slutt ?? t.start)} · ${t.runder === 0 ? "ingen fullførte runder" : `${t.runder} ${t.runder === 1 ? "runde" : "runder"}`}${t.status === "CUT" ? " (kutt)" : ""}`}
              hoyre={<span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 18, color: TN.navy900, textAlign: "right" }}>{t.bruttoSnitt !== null ? snitt.format(t.bruttoSnitt) : "—"}<small style={{ display: "block", fontSize: 12, color: TN.ink500 }}>{t.status === "CUT" ? "MC" : t.plassering ? `Plass ${t.plassering}` : "Plass —"}</small></span>}
            />
          ))}
        </TnFlate>
        <TnFotnote>Kilde: offisielle turneringsresultater i AK Golf HQ. Plassering står bare der den gjelder bruttoklassen.</TnFotnote>
      </section>
    </Ramme>
  );
}

// ── Trening ──

const STATUS: Record<string, string> = { COMPLETED: "Gjennomført", PUBLISHED: "Planlagt", SCHEDULED: "Planlagt", IN_PROGRESS: "Pågår", SKIPPED: "Hoppet over" };
const klokke = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

function Oktrad({ o }: { o: TnSpillerOkt }) {
  return <TnListerad tittel={o.tittel} tekst={`${datoKort(o.dato)} kl. ${klokke(o.startMinutt)} · ${o.akse} · ${o.minutter} min`} hoyre={<TnPille tone={o.status === "COMPLETED" ? "green" : "nøytral"}>{STATUS[o.status] ?? o.status}</TnPille>} />;
}

export function TnIupTreningVisning({ brukerNavn, kontekst, spillerId, spillerNavn, naa, data, planer }: { brukerNavn: string | null; kontekst: TnArbeidskontekst; spillerId: string; spillerNavn: string; naa: Date; data: TnSpillerTreningFane; planer: TnSpillerAktivPlan[] | null }) {
  const { trening } = data;
  const fire = trening.fireUker;
  const pct = fire.planlagtMin > 0 ? Math.round((fire.gjortMin / fire.planlagtMin) * 100) : null;
  const tekPct = fire.gjortMin > 0 ? Math.round((fire.akseMin.TEK / fire.gjortMin) * 100) : null;
  const akseTimer = Object.fromEntries(Object.entries(fire.akseMin).map(([k, v]) => [k, Math.round((v / 60) * 10) / 10]));
  return (
    <Ramme
      brukerNavn={brukerNavn} kontekst={kontekst} spillerId={spillerId} spillerNavn={spillerNavn} aktiv="trening" tittel="Trening" ingress="Det spilleren har delt fra PlayerHQ. Du foreslår endringer; spilleren godtar eller avviser."
      tellere={[
        { verdi: fire.gjortMin > 0 ? timer(fire.gjortMin) : "—", tekst: "gjennomført siste fire uker" },
        { verdi: pct !== null ? `${pct} %` : "—", tekst: "av planlagt tid" },
        { verdi: tekPct !== null ? `${tekPct} %` : "—", tekst: "TEK av gjennomført" },
        { verdi: trening.underPlan ? "Ja" : "Nei", tekst: "under 70 % to uker på rad" },
      ]}
    >
      <TnFlate>
        <TnFotnote>Gjennomført tid mot planlagt tid de fire siste hele ukene. Kilde: PlayerHQ, {datoLang(naa)}.</TnFotnote>
      </TnFlate>
      <TnRutenett min={320}>
        <section style={kolonne}>
          <TnFlatehode tittel="Per akse siste fire uker" />
          <TnFlate style={{ display: "grid", gap: 12 }}>
            <TnPyramide etikett="Gjennomført trening per akse" timer={akseTimer} />
            <TnNokkeltall tall={trening.uker.map((u, i) => ({ etikett: i === 0 ? "uka før forrige" : "forrige uke", verdi: u.pct !== null ? `${u.pct} %` : "—" }))} />
          </TnFlate>
        </section>
        <section style={kolonne}>
          <TnFlatehode tittel="Denne og neste uke">
            <TnTekstlenke href={`/team-norway/workbench?spiller=${spillerId}&visning=uke`}>Foreslå endring</TnTekstlenke>
          </TnFlatehode>
          <TnFlate style={{ paddingBlock: 4 }}>
            {data.kommende.length === 0 ? <TnMangler>Ingen økter lagt inn de neste to ukene.</TnMangler> : null}
            {data.kommende.slice(0, 10).map((o) => <Oktrad key={o.id} o={o} />)}
          </TnFlate>
        </section>
        <section style={kolonne}>
          <TnFlatehode tittel="Sist gjennomført" />
          <TnFlate style={{ paddingBlock: 4 }}>
            {data.sistGjort.length === 0 ? <TnMangler>Ingen gjennomførte økter de siste fire ukene.</TnMangler> : null}
            {data.sistGjort.map((o) => <Oktrad key={o.id} o={o} />)}
          </TnFlate>
        </section>
        <section style={kolonne}>
          <TnFlatehode tittel="Aktive treningsplaner" />
          <TnFlate style={{ paddingBlock: 4 }}>
            {!planer || planer.length === 0 ? <TnMangler>Ingen aktive treningsplaner.</TnMangler> : null}
            {planer?.map((p) => <TnListerad key={p.id} tittel={p.navn} tekst={p.sluttDato ? periode(p.startDato, p.sluttDato, true) : `Fra ${datoLang(p.startDato)}`} />)}
          </TnFlate>
        </section>
      </TnRutenett>
      <p style={{ margin: 0 }}>
        <Link href={`/team-norway/spiller/${spillerId}/teknisk-plan`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: TN.navy600, fontWeight: 700, fontSize: 14 }}>Teknisk plan</Link>
      </p>
    </Ramme>
  );
}
