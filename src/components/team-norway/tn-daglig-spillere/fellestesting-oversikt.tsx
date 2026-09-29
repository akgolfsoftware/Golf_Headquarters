import Link from "next/link";

import { kategoriFraSnittscore } from "@/lib/domain/ak-kategori";
import { hentTnRangliste, hentTnTestdager, type TnBruker, type TnSpillerRad, type TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { TN_CATALOG, TN_VERSION, type TnKind } from "@/lib/portal-tester/tn-catalog";
import { tnDefinitionId } from "@/lib/portal-tester/tn-integration";
import { TN } from "@/lib/v2/team-norway";
import { SkjermRamme, datoKort, datoLang, osloDag } from "../skjermer/felles";
import { TnDatoRad, TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnSkjermhode, TnStatusmerke } from "../tn-flate";
import { TnOpprettTestdag } from "../tn-testdag-opprett";
import { TN_RUTER, tnSpillerHref } from "../tn-ruter";
import { hentTestmatrise } from "./data";
import { KpiRad, ManglerMerke, Resultatbrikke, etikett, mono } from "./ui";

/**
 * TN-03 Fellestesting, oversikten. Fasit: «Team Norway App.dc.html», skjerm «test»
 * (ftStats, ftGroups, «Registrer resultat», ftRows).
 *
 * Avvik:
 *   - Testbatteriet er protokollkatalogen i koden (TN_CATALOG), ikke tegningens
 *     testliste. Fysiske tester (WANG 6-årsløp) og NGF-testene finnes ikke i
 *     katalogen og står ikke.
 *   - «Registrer resultat» fører på en testdag, ikke som ett tallfelt: en test
 *     teller bare når alle slag er registrert (beslutning 26.09.2026). Kø og
 *     scorekort åpnes fra testdagen.
 *   - Høsttesten har ingen frist i modellen. I stedet for «Frist høsttest» står
 *     neste planlagte testdag.
 *   - Fritak finnes ikke i modellen og står ikke.
 *   - Landslagsnorm per klasse finnes ikke og er merket som manglende.
 */

const KIND_NAVN: Record<TnKind, string> = {
  near: "Nærspill",
  carry: "Slag og lengde",
  putts: "Putting",
  "length-putt": "Putting · lengde",
  course: "Bane",
  "free-course": "Bane · egne lengder",
  points: "Poengtester",
  gate: "Gate-tester",
  speed: "Putt speed",
  technique: "Teknikk",
};

const DAGSTATUS = {
  PLANNED: { tekst: "Planlagt", farge: TN.textSecondary },
  ACTIVE: { tekst: "Pågår", farge: TN.status.amberText },
  COMPLETED: { tekst: "Avsluttet", farge: TN.status.greenText },
  CANCELLED: { tekst: "Avlyst", farge: TN.textSecondary },
} as const;

/** Kort forkortelse til resultatbrikkene: forbokstavene i protokollnavnet. */
function kortnavn(navn: string) {
  const ord = navn.replace(/[·×]/g, " ").split(/\s+/).filter(Boolean);
  return ord.slice(0, 3).map((o) => (/^\d/.test(o) ? o.replace(/[^\d–-]/g, "") : o[0].toUpperCase())).join("");
}

export async function FellestestingOversikt({ bruker, kontekst, spillere }: { bruker: TnBruker; kontekst: TnArbeidskontekst; spillere: TnSpillerRad[] }) {
  const naa = new Date();
  const [testdager, matrise, rangliste] = await Promise.all([
    hentTnTestdager(bruker),
    hentTestmatrise(bruker, spillere.map((s) => s.id)),
    hentTnRangliste(bruker, osloDag(naa).aar),
  ]);
  const brutto = new Map((rangliste?.rader ?? []).map((r) => [r.id, r.bruttoSnitt]));

  const klare = TN_CATALOG.filter((p) => !p.blocked);
  const protokoller = TN_CATALOG.filter((p) => !p.blocked && !p.variableCount).map((p) => ({ id: p.id, navn: p.name }));
  const aapne = (testdager?.dager ?? []).filter((d) => d.status === "ACTIVE" || d.status === "PLANNED");
  const holdte = (testdager?.dager ?? []).filter((d) => d.status === "COMPLETED").slice(0, 5);
  const neste = [...aapne].filter((d) => d.status === "PLANNED" && d.scheduledAt.getTime() >= naa.getTime()).sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0] ?? null;

  const leverte = (definisjonsId: string) => spillere.filter((s) => (matrise.get(s.id) ?? []).some((r) => r.testId === definisjonsId && r.antall > 0)).length;
  const medResultat = spillere.filter((s) => (matrise.get(s.id) ?? []).some((r) => r.antall > 0)).length;

  const grupper = new Map<TnKind, typeof TN_CATALOG[number][]>();
  for (const p of TN_CATALOG) grupper.set(p.kind, [...(grupper.get(p.kind) ?? []), p]);

  return (
    <SkjermRamme aktiv="fellestesting" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode rute={TN_RUTER.test} tittel="Fellestesting" ingress="Hele testbatteriet. Landslagsnivå for klassen kommer når normene er klare. AK Golf-kategori regnes fra brutto snittscore." />

      <KpiRad tall={[
        { verdi: `${medResultat} / ${spillere.length}`, etikett: "Har minst ett resultat" },
        { verdi: `${klare.length} / ${TN_CATALOG.length}`, etikett: "Protokoller klare" },
        { verdi: String(aapne.length), etikett: "Åpne testdager" },
        { verdi: neste ? datoKort(neste.scheduledAt) : "—", etikett: "Neste testdag", farge: neste ? TN.red600 : undefined },
      ]} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
        <TnFlate style={{ flex: "999 1 520px" }}>
          <TnFlatehode tittel="Testbatteriet" merknad="LEVERT · SPILLERE I GRUPPEN" />
          {[...grupper.entries()].map(([kind, liste]) => (
            <div key={kind}>
              <div style={{ ...etikett, marginTop: 18, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>{KIND_NAVN[kind]}</div>
              {liste.map((p) => {
                const n = leverte(tnDefinitionId(p));
                return (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "11px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "baseline" }}>
                    <Link href={`${TN_RUTER.protokoller}/${p.id}`} style={{ minWidth: 0, color: TN.ink900, textDecoration: "none" }}>
                      <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{p.name}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: TN.textSecondary, marginTop: 2 }}>{p.rows.length} forsøk · {TN_VERSION}{p.blocked ? " · Utkast, kan ikke fullføres" : ""}</span>
                    </Link>
                    <span style={{ ...mono(13, p.blocked ? TN.textSecondary : n < spillere.length ? TN.ink900 : TN.status.greenText), whiteSpace: "nowrap" }}>{p.blocked ? "—" : `${n} / ${spillere.length}`}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </TnFlate>

        <TnFlate style={{ flex: "1 1 320px" }}>
          <TnFlatehode tittel="Registrer resultat" merknad={aapne.length > 0 ? `${aapne.length} ÅPNE` : undefined} />
          {testdager === null ? (
            <TnMangler>Testdagene ses og føres av trenere og Assist Coach i gruppen.</TnMangler>
          ) : aapne.length === 0 ? (
            <TnMangler>Ingen testdag pågår eller er planlagt. {kontekst.kanAdministrere ? "Start en ny under." : "Be en trener i gruppen starte testdagen."}</TnMangler>
          ) : (
            aapne.map((d) => (
              <TnDatoRad
                key={d.id}
                dato={datoKort(d.scheduledAt)}
                tittel={<Link href={`${TN_RUTER.test}?dag=${d.id}`} style={{ color: TN.textPrimary, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{d.title}</Link>}
                tekst={`${d.protokollNavn}${d.location ? ` · ${d.location}` : ""}`}
                hoyre={<span style={{ textAlign: "right" }}><span style={{ display: "block", ...mono(15) }}>{d.antallFullfort} / {d.antallDeltakere}</span><TnStatusmerke farge={DAGSTATUS[d.status].farge}>{DAGSTATUS[d.status].tekst}</TnStatusmerke></span>}
              />
            ))
          )}
          <TnFotnote>En test teller bare når alle slag er registrert. Åpne testdagen for kø og scorekort.</TnFotnote>

          {kontekst.kanAdministrere ? (
            <>
              <TnEtikett style={{ marginTop: 26, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Ny testdag</TnEtikett>
              <div style={{ marginTop: 14 }}>
                <TnOpprettTestdag spillere={spillere.map((r) => ({ id: r.id, navn: r.navn }))} protokoller={protokoller} />
              </div>
            </>
          ) : null}

          {holdte.length > 0 ? (
            <>
              <TnEtikett style={{ marginTop: 26, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Holdt · {holdte.length}</TnEtikett>
              {holdte.map((d) => (
                <TnDatoRad key={d.id} dato={datoKort(d.scheduledAt)} tittel={<Link href={`${TN_RUTER.test}?dag=${d.id}`} style={{ color: TN.textPrimary, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{d.title}</Link>} tekst={d.protokollNavn} hoyre={<span style={mono(13, TN.textSecondary)}>{d.antallFullfort} / {d.antallDeltakere}</span>} />
              ))}
            </>
          ) : null}
        </TnFlate>
      </div>

      <TnFlate>
        <TnFlatehode tittel="Nivå per spiller" merknad={<ManglerMerke>Norm fra Team Norway mangler</ManglerMerke>} />
        <p style={{ fontSize: 13, lineHeight: 1.6, color: TN.textSecondary, margin: "12px 0 4px", maxWidth: "72ch" }}>
          AK Golf-kategori ved navnet regnes fra brutto snittscore i år. Hver brikke er siste gyldige resultat på en protokoll. Landslagsnivå per klasse står ikke før Team Norway har fastsatt normene.
        </p>
        {spillere.map((s) => {
          const rader = (matrise.get(s.id) ?? []).filter((r) => r.antall > 0);
          const b = brutto.get(s.id) ?? null;
          const mangler = klare.length - rader.length;
          return (
            <div key={s.id} style={{ display: "flex", flexWrap: "wrap", gap: "10px 20px", padding: "14px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "flex-start" }}>
              <Link href={`${tnSpillerHref(s.id)}?fane=test`} style={{ flex: "1 1 200px", minWidth: 0, minHeight: 44, color: TN.ink900, textDecoration: "none" }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{s.navn}</span>
                <span style={{ display: "block", fontSize: 12.5, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>{s.klubb ?? "Klubb ikke registrert"} · AK {b !== null ? `${kategoriFraSnittscore(b).kategori} · ${kategoriFraSnittscore(b).niva}` : "—"}</span>
              </Link>
              <div style={{ flex: "3 1 420px", minWidth: 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {rader.map((r) => <Resultatbrikke key={r.testId} kort={kortnavn(r.protokollNavn)} verdi={r.sisteFormatert ?? "—"} />)}
                {rader.length === 0 ? <Resultatbrikke kort="" verdi="Ingen resultat" /> : null}
                {mangler > 0 && rader.length > 0 ? <Resultatbrikke kort="" verdi={`${mangler} klare`} merknad="MANGLER" merknadFarge={TN.red600} /> : null}
              </div>
            </div>
          );
        })}
        {spillere.length === 0 ? <TnMangler>Ingen spillere i gruppen ennå.</TnMangler> : null}
        <TnFotnote>En spiller uten resultat står som ukjent, aldri som null. Sist oppdatert {datoLang(naa)}.</TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
