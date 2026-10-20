import Link from "next/link";

import type { hentTnManedsplan, hentTnSamlinger, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { SamlingsprogramKontroll } from "@/components/workbench/SamlingsprogramKontroll";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnHendelserad, TnMangler, TnTekstlenke } from "../tn-flate";
import { TnOktkort } from "../tn-grunnmur";
import { TnFlere } from "../tn-flere";
import { TnHandlingLenke } from "../tn-handlinger";
import { TnShell, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltKnapper, TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";
import { TnSamlingSkjema, TnSlettSamling } from "../tn-redigering-skjema";
import { MANEDER, MANEDER_LANG, osloDag, periode, medDato } from "./felles";
import d from "./tn-daglig.module.css";

/**
 * TN-04 Samlinger og terminliste, og én samling. Retning «Skrå» (godkjent 20.10.2026, canvaset
 * «Team Norway nøkkelskjermer», tavle 4 Samling): bildetopp med nedtelling, dato og sted,
 * deltakere som hovedtall, og programmet som kort over kanten.
 * Tidligere fasit: docs/design-system/utkast-tn/daglig.html (pakke 2).
 *
 * Avvik:
 *   - Mesterskap er ikke egen kategori i turneringsdataene. Årshjulet viser
 *     samlinger og turneringer.
 *   - Programmet er gruppeøktene i samlingsperioden. Gruppeøkter har ingen akse i
 *     datamodellen, så øktkortene er nøytrale. Egentid, romfordeling og pakkeliste
 *     har ingen datamodell.
 *   - Svar på samlingen (ja / venter / kan ikke) har ingen datamodell. Helteflaten
 *     spør «Hvem er med?» og viser aktive spillere i gruppa; påminnelse og
 *     deltakerliste med svar venter på modellen. Tellerne er program, gruppeøkter og dager.
 *   - Samlinger er gruppehendelser (Anders 27.09.2026). Trener lager, endrer og
 *     sletter dem her. Arrangør skrives i notatet.
 */


const tilDagStreng = (dato: Date) => {
  const o = osloDag(dato);
  return `${o.aar}-${String(o.maned).padStart(2, "0")}-${String(o.dag).padStart(2, "0")}`;
};
const klokke = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Oslo" });
const ukedag = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });
const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"] as const;

type Hendelse = { type: "samling" | "turnering"; tittel: string; fra: Date; til: Date; sted: string | null; id: string };


type Hentet<F extends (...a: never[]) => Promise<unknown>> = Awaited<ReturnType<F>>;

export function TnSamlingerVisning({
  brukerNavn,
  visDataGolf,
  data,
  turneringsdata,
  aar,
  maned,
  naa,
}: {
  brukerNavn: string | null;
  visDataGolf: boolean;
  data: NonNullable<Hentet<typeof hentTnSamlinger>>;
  turneringsdata: Hentet<typeof hentTnTurneringer>;
  aar: number;
  maned: number;
  naa: Date;
}) {
  const idag = osloDag(naa);

  const hendelser: Hendelse[] = [
    ...data.samlinger.map((s) => ({ type: "samling" as const, tittel: s.name, fra: s.startDate, til: s.endDate, sted: s.location, id: s.id })),
    ...medDato(turneringsdata?.turneringer ?? []).map((t) => ({ type: "turnering" as const, tittel: t.name, fra: t.startDate, til: t.endDate ?? t.startDate, sted: t.location, id: t.id })),
  ].sort((a, b) => a.fra.getTime() - b.fra.getTime());

  const iManed = (h: Hendelse, a: number, m: number) => {
    const fra = osloDag(h.fra);
    const til = osloDag(h.til);
    const denne = a * 12 + m;
    return denne >= fra.aar * 12 + fra.maned && denne <= til.aar * 12 + til.maned;
  };
  const manedsrader = hendelser.filter((h) => iManed(h, aar, maned));
  const antallSamlinger = manedsrader.filter((h) => h.type === "samling").length;
  const antallTurneringer = manedsrader.length - antallSamlinger;
  const lenke = (a: number, m: number) => `/team-norway/samlinger?ar=${a}&maned=${m}`;
  const flertall = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;
  const dagMs = (dato: Date) => { const o = osloDag(dato); return Date.UTC(o.aar, o.maned - 1, o.dag); };
  const neste = data.samlinger.filter((x) => dagMs(x.endDate) >= Date.UTC(idag.aar, idag.maned - 1, idag.dag)).sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0] ?? null;
  const dagerTilNeste = neste ? Math.max(0, Math.round((dagMs(neste.startDate) - Date.UTC(idag.aar, idag.maned - 1, idag.dag)) / 864e5)) : null;
  const aarsSamlinger = hendelser.filter((h) => h.type === "samling" && osloDag(h.fra).aar === aar).length;
  const aarsTurneringer = hendelser.filter((h) => h.type === "turnering" && osloDag(h.fra).aar === aar).length;

  return (
    <TnShell aktiv="samlinger" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(data.kontekst.rolle)} groupId={data.kontekst.gruppe.id} visTrenerflater={!data.kontekst.erSpiller} kanAdministrere={data.kontekst.kanAdministrere} visDataGolf={!data.kontekst.erSpiller && visDataGolf}>
      <TnSkraTopp
        bilde="spiller-ved-vannet"
        etikett="Samlinger og terminliste"
        overlinje={`Sesong ${aar} · ${data.kontekst.gruppe.name}`}
        tittel="Samlinger"
        ingress="Hele sesongen på ett ark. Velg en måned for detaljer."
        venstre={
          <>
            {neste ? (
              <TnHeltTall verdi={dagerTilNeste === 0 ? "I dag" : dagerTilNeste ?? "—"} enhet={dagerTilNeste ? (dagerTilNeste === 1 ? "dag" : "dager") : undefined}>til {neste.name}</TnHeltTall>
            ) : (
              <TnHeltTall verdi="—">ingen kommende samling</TnHeltTall>
            )}
            {neste ? <TnHeltTekst>{periode(neste.startDate, neste.endDate, true)}{neste.location ? ` · ${neste.location}` : ""}</TnHeltTekst> : null}
            <TnHeltKnapper>
              {neste ? <TnHandlingLenke href={`/team-norway/samlinger/${neste.id}`} variant="hvit">Åpne samlingen</TnHandlingLenke> : null}
              {data.kontekst.kanAdministrere ? <TnSamlingSkjema knapp="Ny samling" variant="konturHvit" /> : null}
            </TnHeltKnapper>
          </>
        }
        hoyre={
          <TnHeltTellere
            tall={[
              { verdi: aarsSamlinger, tekst: aarsSamlinger === 1 ? `samling i ${aar}` : `samlinger i ${aar}` },
              { verdi: aarsTurneringer, tekst: aarsTurneringer === 1 ? "turnering" : "turneringer" },
              { verdi: data.antallSpillere ?? "—", tekst: "spillere i gruppa" },
            ]}
          />
        }
      />
      <TnSkraKort>

      <TnFlate style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Årshjulet">
          <span className={d.forklaring}>
            <span><i style={{ background: TN.navy900 }} />Samling</span>
            <span><i style={{ background: TN.akse.TURN.fyll }} />Turnering</span>
            <span className={d.aarsvalg}>
              <TnTekstlenke href={lenke(aar - 1, 12)}>{aar - 1}</TnTekstlenke>
              <TnTekstlenke href={lenke(aar + 1, 1)}>{aar + 1}</TnTekstlenke>
            </span>
          </span>
        </TnFlatehode>
        <nav aria-label={`Måneder i ${aar}`} className={d.aar}>
          {MANEDER.map((navn, i) => {
            const m = i + 1;
            const iDenne = hendelser.filter((h) => iManed(h, aar, m));
            const s = iDenne.filter((h) => h.type === "samling").length;
            const t = iDenne.length - s;
            const gaatt = aar < idag.aar || (aar === idag.aar && m < idag.maned);
            return (
              <Link
                key={navn}
                href={lenke(aar, m)}
                scroll={false}
                aria-current={m === maned ? "true" : undefined}
                aria-label={`${MANEDER_LANG[i]}: ${flertall(s, "samling", "samlinger")}, ${flertall(t, "turnering", "turneringer")}`}
                className={gaatt ? `${d.maned} ${d.gaatt}` : d.maned}
              >
                <b>{MND_KORT[i]}</b>
                <span className={d.prikker} aria-hidden="true">
                  {Array.from({ length: s }, (_, k) => <i key={`s${k}`} style={{ background: TN.navy900 }} />)}
                  {Array.from({ length: t }, (_, k) => <i key={`t${k}`} style={{ background: TN.akse.TURN.fyll }} />)}
                </span>
              </Link>
            );
          })}
        </nav>
      </TnFlate>

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel={MANEDER_LANG[maned - 1] ?? ""} merknad={`${flertall(antallSamlinger, "samling", "samlinger")} · ${flertall(antallTurneringer, "turnering", "turneringer")}`} />
        <TnFlate style={{ paddingBlock: 4 }}>
          {manedsrader.map((h) => {
            const fra = osloDag(h.fra);
            return (
              <TnHendelserad
                key={`${h.type}-${h.id}`}
                dag={String(fra.dag).padStart(2, "0")}
                maned={MND_KORT[fra.maned - 1] ?? ""}
                tittel={h.tittel}
                tekst={`${periode(h.fra, h.til)} · ${h.sted ?? "Sted ikke registrert"}`}
                href={h.type === "samling" ? `/team-norway/samlinger/${h.id}` : `/team-norway/turneringer/${h.id}`}
                hoyre={h.type === "samling" ? <TnPille tone="info">Samling</TnPille> : <TnPille>Turnering</TnPille>}
              />
            );
          })}
          {manedsrader.length === 0 ? <TnMangler>Ingen aktivitet i terminlisten denne måneden.</TnMangler> : null}
        </TnFlate>
      </section>
      </TnSkraKort>
    </TnShell>
  );
}


export function TnSamlingVisning({
  brukerNavn,
  visDataGolf,
  data,
  valgt,
  plan,
  kanPublisere,
  naa,
}: {
  brukerNavn: string | null;
  visDataGolf: boolean;
  data: NonNullable<Hentet<typeof hentTnSamlinger>>;
  valgt: NonNullable<Hentet<typeof hentTnSamlinger>>["samlinger"][number];
  plan: Hentet<typeof hentTnManedsplan>;
  kanPublisere: boolean;
  naa: Date;
}) {

  const okter = (plan?.okter ?? []).filter((o) => o.startAt.getTime() <= valgt.endDate.getTime() + 864e5);
  const perDag = new Map<string, typeof okter>();
  for (const o of okter) perDag.set(tilDagStreng(o.startAt), [...(perDag.get(tilDagStreng(o.startAt)) ?? []), o]);
  const minutter = okter.reduce((sum, o) => sum + Math.max(0, Math.round((o.endAt.getTime() - o.startAt.getTime()) / 6e4)), 0);
  const timer = String(Math.round((minutter / 60) * 10) / 10).replace(".", ",");

  const dagMs = (dato: Date) => { const o = osloDag(dato); return Date.UTC(o.aar, o.maned - 1, o.dag); };
  const dager = Math.round((dagMs(valgt.endDate) - dagMs(valgt.startDate)) / 864e5) + 1;
  const dagerTil = Math.round((dagMs(valgt.startDate) - dagMs(naa)) / 864e5);
  const nedtelling = dagMs(valgt.endDate) < dagMs(naa) ? "Ferdig" : dagerTil <= 0 ? "Pågår" : dagerTil === 1 ? "I morgen" : `Om ${dagerTil} dager`;

  return (
    <TnShell aktiv="samlinger" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(data.kontekst.rolle)} groupId={data.kontekst.gruppe.id} visTrenerflater={!data.kontekst.erSpiller} kanAdministrere={data.kontekst.kanAdministrere} visDataGolf={!data.kontekst.erSpiller && visDataGolf} tilbake={{ href: "/team-norway/samlinger", label: "Samlinger" }}>
      <TnSkraTopp
        bilde="tee-hand"
        etikett={valgt.name}
        overlinje={[nedtelling, periode(valgt.startDate, valgt.endDate, true), valgt.location].filter(Boolean).join(" · ")}
        tittel={valgt.name}
        ingress={valgt.notes ?? undefined}
        venstre={
          <>
            <TnHeltTall verdi={valgt.antallDeltakere}>{valgt.antallDeltakere === 1 ? "spiller i gruppa" : "spillere i gruppa"}</TnHeltTall>
            <TnHeltTekst>Hele gruppen deltar. Svar på samlingen (ja, venter, kan ikke) registreres ikke ennå.</TnHeltTekst>
            {data.kontekst.kanAdministrere ? (
              <TnHeltKnapper>
                <TnSamlingSkjema
                  knapp="Endre samling"
                  variant="hvit"
                  samling={{ id: valgt.id, tittel: valgt.name, sted: valgt.location ?? "", fra: tilDagStreng(valgt.startDate), til: tilDagStreng(valgt.endDate), notat: valgt.notes ?? "" }}
                />
                <TnFlere knapp="Mer" variant="konturHvit">
                  <TnSlettSamling id={valgt.id} navn={valgt.name} variant="meny" />
                </TnFlere>
              </TnHeltKnapper>
            ) : null}
          </>
        }
        hoyre={
          <TnHeltTellere
            tall={[
              { verdi: okter.length ? `${timer} t` : "—", tekst: "program" },
              { verdi: okter.length, tekst: okter.length === 1 ? "gruppeøkt" : "gruppeøkter" },
              { verdi: dager, tekst: dager === 1 ? "dag" : "dager" },
            ]}
          />
        }
      />
      <TnSkraKort>
      <TnFlate style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Programmet" />
        {perDag.size === 0 ? (
          <TnFlate style={{ background: TN.ink50 }}><TnMangler>Ingen gruppeøkter er lagt inn i samlingsperioden. Legg dem inn i gruppeplanen, så vises de her dag for dag.</TnMangler></TnFlate>
        ) : (
          [...perDag.entries()].map(([dag, liste]) => (
            <div key={dag} className={d.dagBlokk}>
              <h3>{ukedag.format(liste[0]!.startAt)}</h3>
              <div className={d.oktListe}>
                {liste.map((o) => (
                  <TnOktkort key={o.id} akse={null} liten tid={klokke.format(o.startAt)} varighet={`${Math.round((o.endAt.getTime() - o.startAt.getTime()) / 6e4)} min`} navn={o.title} info={o.location ? [o.location] : []} />
                ))}
              </div>
            </div>
          ))
        )}
      </TnFlate>

      {kanPublisere && valgt.endDate >= naa ? (
        <SamlingsprogramKontroll organisasjon="TEAM_NORWAY" planHref={data.planHref} samlinger={[{ id: valgt.id, tittel: valgt.name, fra: tilDagStreng(valgt.startDate), til: tilDagStreng(valgt.endDate), sted: valgt.location }]} />
      ) : null}

      <TnTekstlenke href="/team-norway/samlinger">Alle samlinger</TnTekstlenke>
      </TnSkraKort>
    </TnShell>
  );
}
