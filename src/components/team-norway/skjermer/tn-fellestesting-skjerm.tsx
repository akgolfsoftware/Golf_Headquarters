import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnFellesTestdagGrupper, hentTnProtokollbibliotek, hentTnSpillere, hentTnTestdag, hentTnTestdager } from "@/lib/domain/tn-arbeidsflate";
import { TN_CATALOG } from "@/lib/portal-tester/tn-catalog";
import { TN } from "@/lib/v2/team-norway";
import { TnOpprettTestdag } from "../tn-testdag-opprett";
import { TnFellesTestdagOpprett } from "../tn-felles-testdag-opprett";
import { TnTestdagKo } from "../tn-testdag-ko";
import { TnPille, type TnPilleTone } from "../core";
import { TnDatoRad, TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnRutenett, TnSkjermhode, TnTekstlenke } from "../tn-flate";
import { TnFremdrift, TnStortTall } from "../tn-grunnmur";
import { TnKnapperekke } from "../tn-handlinger";
import { TnSlettTestdag, TnTestdagEndre } from "../tn-redigering-skjema";
import { SkjermRamme, datoKort, datoLang, hentSkjermbruker, osloDag } from "./felles";

/**
 * TN-03 Fellestesting. Minstekrav per klasse og føring av resultater på testdagen.
 * Fasit: docs/design-system/utkast-tn/spillere.html, skjerm Fellestesting (pakke 3).
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

const DAGSTATUS: Record<"PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED", { tekst: string; tone: TnPilleTone }> = {
  PLANNED: { tekst: "Planlagt", tone: "nøytral" },
  ACTIVE: { tekst: "Pågår", tone: "amber" },
  COMPLETED: { tekst: "Avsluttet", tone: "green" },
  CANCELLED: { tekst: "Avlyst", tone: "nøytral" },
};

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
      <SkjermRamme aktiv="fellestesting" brukerNavn={bruker.name} kontekst={valgt.kontekst} tilbake={{ href: "/team-norway/fellestesting", label: "Fellestesting" }}>
        <TnSkjermhode
          overlinje={`Testdag · ${datoLang(dag.scheduledAt)}`}
          tittel={dag.title}
          ingress={`${dag.eventId ? `${dag.groupName} · ${dag.stationName ?? "Stasjon"} · ` : ""}${dag.protokollNavn}${dag.location ? ` · ${dag.location}` : ""} · ${datoLang(dag.scheduledAt)} kl. ${klokke.format(dag.scheduledAt)}`}
          handling={
            <TnKnapperekke>
              {valgt.kontekst.kanAdministrere && !dag.eventId && (dag.status === "PLANNED" || dag.status === "ACTIVE") ? <TnTestdagEndre id={dag.id} tittel={dag.title} sted={dag.location ?? ""} tidspunktLokal={lokalTid(dag.scheduledAt)} /> : null}
              {valgt.kontekst.kanAdministrere && !dag.eventId && fort === 0 ? <TnSlettTestdag id={dag.id} navn={dag.title} /> : null}
              <TnTekstlenke href="/team-norway/fellestesting">Alle testdager</TnTekstlenke>
            </TnKnapperekke>
          }
        />
        <TnFlate>
          {dag.eventId && dag.stations.length > 1 ? (
            <nav aria-label="Stasjoner i felles testdag" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {dag.stations.map((station) => (
                <Link key={station.id} href={`/team-norway/fellestesting?dag=${station.id}`} aria-current={station.id === dag.id ? "page" : undefined} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: TN.radius.sm, border: `1px solid ${TN.navy900}`, background: station.id === dag.id ? TN.navy900 : TN.white, color: station.id === dag.id ? TN.white : TN.navy900, fontFamily: TN.font.body, fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>
                  {station.groupName}
                </Link>
              ))}
            </nav>
          ) : null}
          <TnFlatehode tittel="Registrer resultat" merknad={<TnPille tone={status.tone}>{status.tekst}</TnPille>} />
          <TnStortTall verdi={fort} enhet={`/ ${dag.deltakere.length}`}><span style={{ fontSize: 14.5, color: TN.ink700 }}>ført</span></TnStortTall>
          <div style={{ margin: "12px 0 16px" }}><TnFremdrift andel={dag.deltakere.length === 0 ? 0 : fort / dag.deltakere.length} etikett="Ført" maks={dag.deltakere.length} naa={fort} /></div>
          <TnTestdagKo dag={dag} kanSkrive={valgt.kontekst.kanAdministrere} />
        </TnFlate>
      </SkjermRamme>
    );
  }

  const [testdager, fellesgrupper] = await Promise.all([hentTnTestdager(bruker), hentTnFellesTestdagGrupper(bruker)]);
  const protokoller = TN_CATALOG.filter((p) => !p.blocked && !p.variableCount).map((p) => ({ id: p.id, navn: p.name }));
  const { versjon, rader: bibliotek } = hentTnProtokollbibliotek();
  const klare = bibliotek.filter((r) => r.status === "KLAR");
  const aapne = (testdager?.dager ?? []).filter((d) => d.status === "ACTIVE" || d.status === "PLANNED");
  const holdte = (testdager?.dager ?? []).filter((d) => d.status === "COMPLETED").slice(0, 5);
  const ko = [...spillerside.rader].sort((a, b) => a.tester - b.tester || a.navn.localeCompare(b.navn, "nb-NO"));
  const utenResultat = ko.filter((r) => r.tester === 0).length;

  return (
    <SkjermRamme aktiv="fellestesting" brukerNavn={bruker.name} kontekst={spillerside.kontekst}>
      <TnSkjermhode overlinje={aapne[0] ? `Testdag · ${datoLang(aapne[0].scheduledAt)}` : undefined} tittel="Fellestesting" ingress="Nasjonale minstekrav per klasse. Før resultatet mens spilleren står ved siden av deg." />

      <TnRutenett min={380}>
        <TnFlate>
          <TnFlatehode tittel="Registrer resultat" merknad={aapne.length > 0 ? `${aapne.length} åpne` : undefined} />
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
                tekst={`${d.eventId ? `${d.groupName} · ${d.stationName ?? "Stasjon"} · ` : ""}${d.protokollNavn}${d.location ? ` · ${d.location}` : ""}`}
                hoyre={<span style={{ display: "grid", justifyItems: "end", gap: 4 }}><span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{d.antallFullfort} / {d.antallDeltakere}</span><TnPille tone={DAGSTATUS[d.status].tone}>{DAGSTATUS[d.status].tekst}</TnPille></span>}
              />
            ))
          )}

          {spillerside.kontekst.kanAdministrere ? (
            <>
              <TnEtikett style={{ marginTop: 26, paddingBottom: 6, borderBottom: `1px solid ${TN.ink200}` }}>Felles testdag · flere skoler</TnEtikett>
              <p style={{ margin: "10px 0 0", color: TN.textSecondary, fontSize: TN.text.sm }}>Én testdag kan samle Team Norway og flere WANG-skoler. Hver gruppe får egen stasjon, protokoll og livekø.</p>
              <div style={{ marginTop: 14 }}>
                <TnFellesTestdagOpprett grupper={fellesgrupper ?? []} protokoller={protokoller} />
              </div>
              <TnEtikett style={{ marginTop: 26, paddingBottom: 6, borderBottom: `1px solid ${TN.ink200}` }}>Ny testdag</TnEtikett>
              <div style={{ marginTop: 14 }}>
                <TnOpprettTestdag spillere={spillerside.rader.map((r) => ({ id: r.id, navn: r.navn }))} protokoller={protokoller} />
              </div>
            </>
          ) : null}

          {holdte.length > 0 ? (
            <>
              <TnEtikett style={{ marginTop: 26, paddingBottom: 6, borderBottom: `1px solid ${TN.ink200}` }}>Holdt · {holdte.length}</TnEtikett>
              {holdte.map((d) => (
                <TnDatoRad key={d.id} dato={datoKort(d.scheduledAt)} tittel={<Link href={`/team-norway/fellestesting?dag=${d.id}`} style={{ color: TN.textPrimary, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{d.title}</Link>} tekst={d.protokollNavn} hoyre={<span style={{ fontFamily: TN.font.mono, fontSize: 13, color: TN.textSecondary }}>{d.antallFullfort} / {d.antallDeltakere}</span>} />
              ))}
            </>
          ) : null}
        </TnFlate>
        <TnFlate>
          <TnFlatehode tittel="Minstekrav per klasse"><TnPille>Tall fra Team Norway mangler</TnPille></TnFlatehode>
          <div role="table" aria-label="Minstekrav per klasse">
            <div role="row" style={{ display: "grid", gridTemplateColumns: STANDARDKOLONNER, gap: 6, padding: "12px 0 8px", borderBottom: `1px solid ${TN.ink200}` }}>
              {["Test", ...KLASSER].map((k, i) => (
                <TnEtikett key={k} style={{ fontSize: 10.5, letterSpacing: "0.1em", textAlign: i > 0 ? "right" : undefined, overflowWrap: "anywhere" }}><span role="columnheader">{k}</span></TnEtikett>
              ))}
            </div>
            {klare.map((r) => (
              <div role="row" key={r.id} style={{ display: "grid", gridTemplateColumns: STANDARDKOLONNER, gap: 6, borderBottom: `1px solid ${TN.ink200}`, alignItems: "center" }}>
                <Link role="cell" href={`/team-norway/protokoller/${r.id}`} style={{ minHeight: 44, display: "flex", alignItems: "center", fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: TN.textPrimary, overflowWrap: "anywhere", minWidth: 0, padding: "6px 0" }}>{r.navn}</Link>
                {KLASSER.map((k) => <span role="cell" key={k} style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 13, color: TN.textSecondary }}>—</span>)}
              </div>
            ))}
          </div>
          <TnFotnote>Minstekravene er ikke lagt inn i protokollkilden ({versjon}) ennå. Når de er det, står de her og i Referansenivåer.</TnFotnote>
        </TnFlate>

      </TnRutenett>

      <TnFlate>
        <TnFlatehode tittel="Spillerkø" merknad={`${utenResultat} uten resultat`} />
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
