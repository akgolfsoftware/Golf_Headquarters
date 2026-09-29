import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSpillere, hentTnTestdag } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { FellestestingOversikt } from "../tn-daglig-spillere/fellestesting-oversikt";
import { TnTestdagKo } from "../tn-testdag-ko";
import { TnFlate, TnFlatehode, TnSkjermhode, TnStatusmerke } from "../tn-flate";
import { TnKnapperekke } from "../tn-handlinger";
import { TnSlettTestdag, TnTestdagEndre } from "../tn-redigering-skjema";
import { SkjermRamme, datoLang, hentSkjermbruker, osloDag } from "./felles";

/**
 * TN-03 Fellestesting. Fasit: «Team Norway App.dc.html», skjerm «test».
 * Oversikten (uten ?dag=) bygges i tn-daglig-spillere/fellestesting-oversikt.tsx,
 * med avvikene der. Med ?dag= vises én testdag med kø og scorekort.
 *
 * Avvik for testdagen:
 *   - Resultater føres på en testdag, ikke som frittstående tall. En test teller
 *     bare når alle slag er registrert (beslutning 26.09).
 *   - Trener kan endre en åpen testdag og slette en testdag uten førte
 *     resultater (Anders 27.09.2026).
 */

const klokke24 = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Oslo" });
function lokalTid(d: Date) {
  const o = osloDag(d);
  return `${o.aar}-${String(o.maned).padStart(2, "0")}-${String(o.dag).padStart(2, "0")}T${klokke24.format(d)}`;
}

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

  return <FellestestingOversikt bruker={bruker} kontekst={spillerside.kontekst} spillere={spillerside.rader} />;
}
