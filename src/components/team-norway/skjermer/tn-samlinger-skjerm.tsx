import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnManedsplan, hentTnSamlinger, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnFotnote, TnHendelserad, TnMangler, TnRutenett, TnSkjermhode, TnTekstlenke } from "../tn-flate";
import { TnOktkort, TnStortTall } from "../tn-grunnmur";
import { TnKnapperekke } from "../tn-handlinger";
import { TnSamlingSkjema, TnSlettSamling } from "../tn-redigering-skjema";
import { SamlingsprogramKontroll } from "@/components/workbench/SamlingsprogramKontroll";
import { Capability } from "@/lib/auth/cbac";
import { canUser } from "@/lib/auth/effective-capabilities";
import { MANEDER, MANEDER_LANG, SkjermRamme, heltallParam, hentSkjermbruker, osloDag, periode, medDato } from "./felles";
import d from "./tn-daglig.module.css";

/**
 * TN-04 Samlinger og terminliste, og én samling.
 * Fasit: docs/design-system/utkast-tn/daglig.html, skjermene Samlinger og Én samling (pakke 2).
 *
 * Avvik:
 *   - Mesterskap er ikke egen kategori i turneringsdataene. Årshjulet viser
 *     samlinger og turneringer.
 *   - Programmet er gruppeøktene i samlingsperioden. Gruppeøkter har ingen akse i
 *     datamodellen, så øktkortene er nøytrale. Egentid, romfordeling og pakkeliste
 *     har ingen datamodell.
 *   - Svar på samlingen (ja / venter / kan ikke) har ingen datamodell. Hele
 *     gruppen deltar, så antallet er aktive spillere.
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

export async function TnSamlingerSkjerm({ sokeparametre, valgtId }: { sokeparametre: Record<string, string | string[] | undefined>; valgtId?: string }) {
  if (valgtId) return <TnSamlingSkjerm id={valgtId} />;
  const bruker = await hentSkjermbruker();
  const [data, turneringsdata] = await Promise.all([hentTnSamlinger(bruker), hentTnTurneringer(bruker)]);
  if (!data) notFound();

  const idag = osloDag(new Date());
  const aar = heltallParam(sokeparametre.ar, 2000, 2100, idag.aar);
  const maned = heltallParam(sokeparametre.maned, 1, 12, aar === idag.aar ? idag.maned : 1);

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

  return (
    <SkjermRamme aktiv="samlinger" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode
        overlinje={`Sesong ${aar}`}
        tittel="Samlinger og terminliste"
        ingress="Hele sesongen på ett ark. Velg en måned for detaljer."
        handling={data.kontekst.kanAdministrere ? <TnSamlingSkjema knapp="Ny samling" /> : undefined}
      />

      <section style={{ display: "grid", gap: 12 }}>
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
      </section>

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
    </SkjermRamme>
  );
}

async function TnSamlingSkjerm({ id }: { id: string }) {
  const bruker = await hentSkjermbruker();
  const data = await hentTnSamlinger(bruker);
  if (!data) notFound();
  const valgt = data.samlinger.find((s) => s.id === id);
  if (!valgt) notFound();
  const naa = new Date();
  const [kanPublisere, plan] = await Promise.all([
    canUser(bruker, Capability.EDIT_GROUP_PLANS),
    hentTnManedsplan(bruker, valgt.startDate, new Date(valgt.endDate.getTime() + 864e5)),
  ]);

  const okter = (plan?.okter ?? []).filter((o) => o.startAt.getTime() <= valgt.endDate.getTime() + 864e5);
  const perDag = new Map<string, typeof okter>();
  for (const o of okter) perDag.set(tilDagStreng(o.startAt), [...(perDag.get(tilDagStreng(o.startAt)) ?? []), o]);
  const minutter = okter.reduce((sum, o) => sum + Math.max(0, Math.round((o.endAt.getTime() - o.startAt.getTime()) / 6e4)), 0);
  const timer = String(Math.round((minutter / 60) * 10) / 10).replace(".", ",");

  return (
    <SkjermRamme aktiv="samlinger" brukerNavn={bruker.name} kontekst={data.kontekst} tilbake={{ href: "/team-norway/samlinger", label: "Samlinger" }}>
      <TnSkjermhode
        overlinje={`Samling · ${periode(valgt.startDate, valgt.endDate, true)}`}
        tittel={valgt.location ? `${valgt.name} ${valgt.location}` : valgt.name}
        ingress={valgt.notes ?? "Ingen notater på samlingen."}
        handling={data.kontekst.kanAdministrere ? (
          <TnKnapperekke>
            <TnSamlingSkjema
              knapp="Endre samling"
              samling={{ id: valgt.id, tittel: valgt.name, sted: valgt.location ?? "", fra: tilDagStreng(valgt.startDate), til: tilDagStreng(valgt.endDate), notat: valgt.notes ?? "" }}
            />
            <TnSlettSamling id={valgt.id} navn={valgt.name} />
          </TnKnapperekke>
        ) : undefined}
      />

      <TnRutenett min={220}>
        <TnFlate><span style={{ fontFamily: TN.font.mono, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: TN.ink500 }}>Deltakere</span><TnStortTall verdi={valgt.antallDeltakere} enhet="spillere" /><TnFotnote>Hele gruppen deltar. Svar på samlingen registreres ikke ennå.</TnFotnote></TnFlate>
        <TnFlate><span style={{ fontFamily: TN.font.mono, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: TN.ink500 }}>Program</span><TnStortTall verdi={okter.length ? timer : "—"} enhet={okter.length ? "t" : undefined} /><TnFotnote>{okter.length} {okter.length === 1 ? "gruppeøkt" : "gruppeøkter"} i perioden.</TnFotnote></TnFlate>
      </TnRutenett>

      <section style={{ display: "grid", gap: 12 }}>
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
      </section>

      {kanPublisere && valgt.endDate >= naa ? (
        <SamlingsprogramKontroll organisasjon="TEAM_NORWAY" planHref={data.planHref} samlinger={[{ id: valgt.id, tittel: valgt.name, fra: tilDagStreng(valgt.startDate), til: tilDagStreng(valgt.endDate), sted: valgt.location }]} />
      ) : null}

      <TnTekstlenke href="/team-norway/samlinger">Alle samlinger</TnTekstlenke>
    </SkjermRamme>
  );
}
