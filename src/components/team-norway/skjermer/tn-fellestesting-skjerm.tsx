import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnProtokollbibliotek, hentTnSpillere, hentTnTestdag, hentTnTestdager } from "@/lib/domain/tn-arbeidsflate";
import { TN_CATALOG } from "@/lib/portal-tester/tn-catalog";
import { TN } from "@/lib/v2/team-norway";
import { TnOpprettTestdag } from "../tn-testdag-opprett";
import { TnTestdagKo } from "../tn-testdag-ko";
import { TnDatoRad, TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnRutenett, TnSkjermhode, TnStatusmerke } from "../tn-flate";
import { TnKnapperekke } from "../tn-handlinger";
import { TnSlettTestdag, TnTestdagEndre } from "../tn-redigering-skjema";
import { SkjermRamme, datoKort, datoLang, hentSkjermbruker, osloDag } from "./felles";

/**
 * TN-03 Fellestesting. Minstekrav per klasse og føring av resultater på testdagen.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-03.
 *
 * Avvik:
 *   - Minstekrav per klasse finnes ikke i protokollkilden (samme som TN-18).
 *     Tabellen viser protokollene med strek i klassekolonnene til nivåene er lagt inn.
 *   - Resultater føres på en testdag, ikke som frittstående tall. En test teller
 *     bare når alle slag er registrert (beslutning 26.09), så «Registrer
 *     resultat» åpner testdagens kø og scorekort i stedet for ett enkelt tallfelt.
 *   - «Registrer resultat» står før standarden, så føringen er øverst på mobil
 *     mens minstekravene mangler.
 *   - Spillerkøen (hvem som mangler resultat) er lagt til under, fordi den er
 *     det trenerteamet bruker for å finne hvem som må testes.
 *   - Trener kan endre en åpen testdag og slette en testdag uten førte
 *     resultater (Anders 27.09.2026).
 */

const klokke24 = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Oslo" });
function lokalTid(d: Date) {
  const o = osloDag(d);
  return `${o.aar}-${String(o.maned).padStart(2, "0")}-${String(o.dag).padStart(2, "0")}T${klokke24.format(d)}`;
}

const KLASSER = ["Gutter U18", "Jenter U18", "Damer", "Herrer"] as const;
const STANDARDKOLONNER = "minmax(0, 1.7fr) repeat(4, minmax(0, 1fr))";
const klokke = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

const DAGSTATUS = {
  PLANNED: { tekst: "Planlagt", farge: TN.textSecondary },
  ACTIVE: { tekst: "Pågår", farge: TN.status.amberText },
  COMPLETED: { tekst: "Avsluttet", farge: TN.status.greenText },
  CANCELLED: { tekst: "Avlyst", farge: TN.textSecondary },
} as const;

export async function TnFellestestingSkjerm({ dagId }: { dagId?: string }) {
  const bruker = await hentSkjermbruker();
  const spillerside = await hentTnSpillere(bruker);
  if (!spillerside || spillerside.kontekst.erSpiller) notFound();

  if (dagId) {
    const valgt = await hentTnTestdag(bruker, dagId);
    if (!valgt) notFound();
    const { dag } = valgt;
    const fort = dag.deltakere.filter((d) => d.status === "DONE").length;
    const status = DAGSTATUS[dag.status];
    return (
      <SkjermRamme aktiv="fellestesting" brukerNavn={bruker.name} kontekst={valgt.kontekst}>
        <TnSkjermhode
          rute={`/team-norway/fellestesting?dag=${dag.id}`}
          tittel={dag.title}
          ingress={`${dag.protokollNavn}${dag.location ? ` · ${dag.location}` : ""} · ${datoLang(dag.scheduledAt)} kl. ${klokke.format(dag.scheduledAt)}`}
          handling={
            <TnKnapperekke>
              {valgt.kontekst.kanAdministrere && (dag.status === "PLANNED" || dag.status === "ACTIVE") ? <TnTestdagEndre id={dag.id} tittel={dag.title} sted={dag.location ?? ""} tidspunktLokal={lokalTid(dag.scheduledAt)} /> : null}
              {valgt.kontekst.kanAdministrere && fort === 0 ? <TnSlettTestdag id={dag.id} navn={dag.title} /> : null}
              <Link href="/team-norway/fellestesting" style={{ color: TN.navy900, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", minHeight: 44, display: "inline-flex", alignItems: "center" }}>Alle testdager</Link>
            </TnKnapperekke>
          }
        />
        <TnFlate>
          <TnFlatehode tittel="Registrer resultat" merknad={<TnStatusmerke farge={status.farge}>{status.tekst}</TnStatusmerke>} />
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 10px", marginTop: 18 }}>
            <span style={{ fontFamily: TN.font.mono, fontSize: 36, lineHeight: 1, color: TN.ink900, fontVariantNumeric: "tabular-nums" }}>{fort} / {dag.deltakere.length}</span>
            <span style={{ fontSize: 14, color: TN.textSecondary }}>ført</span>
          </div>
          <div role="progressbar" aria-label="Ført" aria-valuemin={0} aria-valuemax={dag.deltakere.length} aria-valuenow={fort} style={{ height: 6, background: TN.navy100, borderRadius: TN.radius.sm, margin: "14px 0 18px", overflow: "hidden" }}>
            <div style={{ width: `${dag.deltakere.length === 0 ? 0 : (fort / dag.deltakere.length) * 100}%`, height: "100%", background: TN.navy900 }} />
          </div>
          <TnTestdagKo dag={dag} kanSkrive={valgt.kontekst.kanAdministrere} />
        </TnFlate>
      </SkjermRamme>
    );
  }

  const testdager = await hentTnTestdager(bruker);
  const protokoller = TN_CATALOG.filter((p) => !p.blocked && !p.variableCount).map((p) => ({ id: p.id, navn: p.name }));
  const { versjon, rader: bibliotek } = hentTnProtokollbibliotek();
  const klare = bibliotek.filter((r) => r.status === "KLAR");
  const aapne = (testdager?.dager ?? []).filter((d) => d.status === "ACTIVE" || d.status === "PLANNED");
  const holdte = (testdager?.dager ?? []).filter((d) => d.status === "COMPLETED").slice(0, 5);
  const ko = [...spillerside.rader].sort((a, b) => a.tester - b.tester || a.navn.localeCompare(b.navn, "nb-NO"));
  const utenResultat = ko.filter((r) => r.tester === 0).length;

  return (
    <SkjermRamme aktiv="fellestesting" brukerNavn={bruker.name} kontekst={spillerside.kontekst}>
      <TnSkjermhode rute="/team-norway/fellestesting" tittel="Fellestesting" ingress="Nasjonale minstekrav per klasse. Før resultatet mens spilleren står ved siden av deg." />

      <TnRutenett min={380}>
        <TnFlate>
          <TnFlatehode tittel="Registrer resultat" merknad={aapne.length > 0 ? `${aapne.length} ÅPNE` : undefined} />
          {testdager === null ? (
            <TnMangler>Testdagene ses og føres av trenere og Assist Coach i gruppen.</TnMangler>
          ) : aapne.length === 0 ? (
            <TnMangler>Ingen testdag pågår eller er planlagt. {spillerside.kontekst.kanAdministrere ? "Start en ny under." : "Be en trener i gruppen starte testdagen."}</TnMangler>
          ) : (
            aapne.map((d) => (
              <TnDatoRad
                key={d.id}
                dato={datoKort(d.scheduledAt)}
                tittel={<Link href={`/team-norway/fellestesting?dag=${d.id}`} style={{ color: TN.textPrimary, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{d.title}</Link>}
                tekst={`${d.protokollNavn}${d.location ? ` · ${d.location}` : ""}`}
                hoyre={<span style={{ textAlign: "right" }}><span style={{ display: "block", fontFamily: TN.font.mono, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{d.antallFullfort} / {d.antallDeltakere}</span><TnStatusmerke farge={DAGSTATUS[d.status].farge}>{DAGSTATUS[d.status].tekst}</TnStatusmerke></span>}
              />
            ))
          )}

          {spillerside.kontekst.kanAdministrere ? (
            <>
              <TnEtikett style={{ marginTop: 26, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Ny testdag</TnEtikett>
              <div style={{ marginTop: 14 }}>
                <TnOpprettTestdag spillere={spillerside.rader.map((r) => ({ id: r.id, navn: r.navn }))} protokoller={protokoller} />
              </div>
            </>
          ) : null}

          {holdte.length > 0 ? (
            <>
              <TnEtikett style={{ marginTop: 26, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Holdt · {holdte.length}</TnEtikett>
              {holdte.map((d) => (
                <TnDatoRad key={d.id} dato={datoKort(d.scheduledAt)} tittel={<Link href={`/team-norway/fellestesting?dag=${d.id}`} style={{ color: TN.textPrimary, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{d.title}</Link>} tekst={d.protokollNavn} hoyre={<span style={{ fontFamily: TN.font.mono, fontSize: 13, color: TN.textSecondary }}>{d.antallFullfort} / {d.antallDeltakere}</span>} />
              ))}
            </>
          ) : null}
        </TnFlate>
        <TnFlate>
          <TnFlatehode tittel="Landslagsstandard" merknad="MINSTEKRAV" />
          <div role="table" aria-label="Minstekrav per klasse">
            <div role="row" style={{ display: "grid", gridTemplateColumns: STANDARDKOLONNER, gap: 6, padding: "12px 0 8px", borderBottom: `1px solid ${TN.navy100}` }}>
              {["Test", ...KLASSER].map((k, i) => (
                <TnEtikett key={k} style={{ fontSize: 10.5, letterSpacing: "0.1em", textAlign: i > 0 ? "right" : undefined, overflowWrap: "anywhere" }}><span role="columnheader">{k}</span></TnEtikett>
              ))}
            </div>
            {klare.map((r) => (
              <div role="row" key={r.id} style={{ display: "grid", gridTemplateColumns: STANDARDKOLONNER, gap: 6, borderBottom: `1px solid ${TN.navy100}`, alignItems: "center" }}>
                <Link role="cell" href={`/team-norway/protokoller/${r.id}`} style={{ minHeight: 44, display: "flex", alignItems: "center", fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: TN.textPrimary, overflowWrap: "anywhere", minWidth: 0, padding: "6px 0" }}>{r.navn}</Link>
                {KLASSER.map((k) => <span role="cell" key={k} style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 13, color: TN.textSecondary }}>—</span>)}
              </div>
            ))}
          </div>
          <TnFotnote>Minstekravene er ikke lagt inn i protokollkilden ({versjon}) ennå. Når de er det, står de her og i Referansenivåer.</TnFotnote>
        </TnFlate>

      </TnRutenett>

      <TnFlate>
        <TnFlatehode tittel="Spillerkø" merknad={`${utenResultat} UTEN RESULTAT`} />
        {ko.length === 0 ? (
          <TnMangler>Ingen spillere i gruppen ennå.</TnMangler>
        ) : (
          ko.map((r) => (
            <TnDatoRad
              key={r.id}
              datoBredde={40}
              dato={r.tester}
              datoFarge={r.tester === 0 ? TN.textSecondary : TN.navy900}
              tittel={<Link href={`/team-norway/spiller/${r.id}/oversikt`} style={{ color: TN.textPrimary, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{r.navn}</Link>}
              tekst={r.sisteTest ? `Siste test ${datoLang(r.sisteTest)}${r.sisteTestNavn ? ` · ${r.sisteTestNavn}` : ""}` : "Ingen resultat registrert"}
            />
          ))
        )}
        <TnFotnote>Tallet til venstre er antall registrerte tester. En spiller uten resultat står som ukjent, aldri som null.</TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
