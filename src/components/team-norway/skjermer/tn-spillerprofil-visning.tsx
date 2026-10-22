import Link from "next/link";
import type { ReactNode } from "react";

import type { TnArbeidskontekst, hentTnSpillerAksefordeling, hentTnSpillerIup, hentTnSpillerLisens, hentTnSpillerProfil, hentTnSpillerstatuser, hentTnSpillerTester } from "@/lib/domain/tn-arbeidsflate";
import { formaterHcp } from "@/lib/domain/hcp";
import { byggIupHaster } from "@/lib/domain/tn-iup-oversikt-regler";
import type { TnIupDelt, TnWagrPlass } from "@/lib/domain/tn-iup-oversikt";
import { alderFraFodselsdato } from "@/lib/forelder";
import type { TilgangsNivaa } from "@/lib/feature-flags";
import { TN } from "@/lib/v2/team-norway";
import { TnPille, type TnPilleTone } from "../core";
import { TnNokkeltall, TnShell, TnSpillerFaner, tnRolleNavn } from "../tn-shell";
import { TnFlate, TnFlatehode, TnFotnote, TnListerad, TnMangler, TnRutenett, TnTekstlenke } from "../tn-flate";
import { TnHandlingLenke, TnKnapperekke } from "../tn-handlinger";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltKnapper, TnHeltTellere, TnPyramide } from "../tn-stall";
import { LISENS_TEKST, TnAvsluttSpiller } from "../tn-redigering-skjema";
import { ER_COLLEGE, datoKort, datoLang, periode } from "./felles";

/**
 * IUP › Oversikt i Team Norway (pakke d, wireframes docs/design-system/utkast-tn/trenerflate, «Spillerprofil (IUP)
 * · Oversikt»). Adressen er /team-norway/spiller/[id]. Toppen har navnet og én stripe med tall (WAGR-plass,
 * NGF-juniorranking, brutto snitt og kategori), uten stort hovedtall. Under: Haster, siste tester, neste
 * turneringer, trening siste fire uker og poster, deretter status og årets turneringer.
 *
 * Avvik:
 *   - NGF-juniorranking og kategori A–K har ingen datakilde i appen og står med strek.
 *   - WAGR-plassen krever koblingen `public_players."wagrId"`; de fleste spillere er ikke koblet ennå.
 *   - Klasse (J1, Damer) finnes ikke i spillerdataene; toppen viser alder, klubb og fødselsår.
 *   - Status og årets turneringer står under wireframens seksjoner til fanene Turneringer og Trening finnes (pakke e).
 *   - Pyramiden er spillerens Workbench-økter siste fire uker, ovenfra TURN til FYS.
 */

const NIVA: Record<TilgangsNivaa, { tekst: string; merke: string; tone: "ok" | "varsel" }> = {
  FULL: { tekst: "Full tilgang i PlayerHQ", merke: "Gyldig", tone: "ok" },
  TALENT: { tekst: "Gratis Talent-nivå i PlayerHQ", merke: "Talent", tone: "ok" },
  INGEN: { tekst: "Ingen aktiv tilgang i PlayerHQ", merke: "Mangler", tone: "varsel" },
};
const TONE: Record<"ok" | "varsel" | "ukjent", TnPilleTone> = { ok: "green", varsel: "amber", ukjent: "nøytral" };

const komma = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");
const snitt = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Statusrad = { tittel: string; tekst: string; merke: string; tone: "ok" | "varsel" | "ukjent" };

type Hentet<F extends (...a: never[]) => Promise<unknown>> = Awaited<ReturnType<F>>;

/** Selve IUP-oversikten, uten datahenting. Brukes av siden og av skjermprøven (tests/visual/team-norway). */
export function TnSpillerprofilVisning({
  brukerNavn,
  kontekst,
  spillerId,
  aar,
  naa,
  profil,
  tester,
  lisens,
  reg,
  iup,
  akser,
  delt,
  poster,
}: {
  brukerNavn: string | null;
  kontekst: TnArbeidskontekst;
  spillerId: string;
  aar: number;
  naa: Date;
  profil: NonNullable<Hentet<typeof hentTnSpillerProfil>>;
  tester: Hentet<typeof hentTnSpillerTester>;
  lisens: Hentet<typeof hentTnSpillerLisens> | null;
  reg: ReturnType<Hentet<typeof hentTnSpillerstatuser>["get"]> | null;
  iup: Hentet<typeof hentTnSpillerIup>;
  akser: Hentet<typeof hentTnSpillerAksefordeling>;
  delt: TnIupDelt | null;
  poster: TnIupPost[] | null;
}) {
  const alder = alderFraFodselsdato(profil.fodselsdato);
  const erCollege = !!profil.skole && ER_COLLEGE.test(profil.skole);
  const erTrener = !kontekst.erSpiller;
  const planPct = akser && akser.planlagtTimer > 0 ? Math.round((akser.gjennomfortTimer / akser.planlagtTimer) * 100) : null;
  const tekPct = akser && akser.gjennomfortTimer > 0 ? Math.round(((akser.gjennomfort.TEK ?? 0) / akser.gjennomfortTimer) * 100) : null;
  const testrader = [...(tester?.rader ?? [])].sort((a, b) => b.sisteDato.getTime() - a.sisteDato.getTime());
  const helseDager = reg?.helseattestUtloper ? Math.floor((reg.helseattestUtloper.getTime() - naa.getTime()) / 864e5) : null;
  const haster = byggIupHaster({
    tester: tester ? tester.rader : null,
    avslatteForslag: delt ? delt.avslatteForslag : null,
    lisens: reg?.lisensStatus ? { aar, ubetalt: reg.lisensStatus === "UBETALT" } : null,
    helseattestUtloper: reg?.helseattestUtloper ?? null,
    naa,
  });
  const wagr = delt?.wagr ?? null;

  const status: Statusrad[] = [
    reg?.lisensStatus
      ? { tittel: `Lisens ${aar}`, tekst: `${LISENS_TEKST[reg.lisensStatus] ?? reg.lisensStatus}${reg.lisensBetaltDato ? ` ${datoLang(reg.lisensBetaltDato)}` : ""}`, merke: reg.lisensStatus === "UBETALT" ? "Mangler" : "Gyldig", tone: reg.lisensStatus === "UBETALT" ? "varsel" : "ok" }
      : { tittel: `Lisens ${aar}`, tekst: "Ikke registrert i Lisens og dokumenter.", merke: "Ikke registrert", tone: "ukjent" },
    reg?.helseattestUtloper && helseDager !== null
      ? { tittel: "Helseattest", tekst: `Utløper ${datoLang(reg.helseattestUtloper)}`, merke: helseDager < 0 ? "Utløpt" : helseDager <= 30 ? `Frist ${datoKort(reg.helseattestUtloper)}` : "Gyldig", tone: helseDager <= 30 ? "varsel" : "ok" }
      : { tittel: "Helseattest", tekst: "Ikke registrert i Lisens og dokumenter.", merke: "Ikke registrert", tone: "ukjent" },
    reg?.antidopingSignert
      ? { tittel: "Antidoping-samtykke", tekst: `Signert ${datoLang(reg.antidopingSignert)}`, merke: "Signert", tone: "ok" }
      : { tittel: "Antidoping-samtykke", tekst: "Ikke registrert i Lisens og dokumenter.", merke: "Ikke registrert", tone: "ukjent" },
    ...(lisens
      ? [lisens.status === "ok"
        ? { tittel: "PlayerHQ", tekst: NIVA[lisens.niva].tekst, merke: NIVA[lisens.niva].merke, tone: NIVA[lisens.niva].tone }
        : { tittel: "PlayerHQ", tekst: "Tilgangen kunne ikke leses akkurat nå. Prøv igjen.", merke: "Ukjent", tone: "ukjent" as const }]
      : []),
  ];
  const sisteIup = [...(iup ?? [])].sort((x, y) => y.levert.localeCompare(x.levert))[0] ?? null;
  const iupDato = (iso: string) => datoLang(new Date(`${iso}T12:00:00Z`));
  const alleStatus: Statusrad[] = [
    ...status,
    sisteIup ? { tittel: sisteIup.type === "UTVIKLINGSSJEKK" ? "Utviklingssjekk" : "Sesongevaluering", tekst: `Levert ${iupDato(sisteIup.levert)}`, merke: "Levert", tone: "ok" } : { tittel: "Fireukerssjekk", tekst: "Ingen leverte svar fra PlayerHQ.", merke: "Ikke levert", tone: "ukjent" },
  ];

  const tall = (verdi: ReactNode) => <span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 16, color: TN.navy900, textAlign: "right", whiteSpace: "nowrap" }}>{verdi}</span>;
  const postHref = `/team-norway/spiller/${spillerId}/post`;

  return (
    <TnShell aktiv="spillere" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={erTrener} kanAdministrere={kontekst.kanAdministrere} tilbake={{ href: "/team-norway/spillere", label: "Spillere" }}>
      <TnSkraTopp
        bilde="tee-hand"
        etikett={`IUP for ${profil.navn}`}
        overlinje="IUP · Spillere"
        tittel={profil.navn}
        ingress={[alder !== null ? `${alder} år` : null, profil.klubb, profil.fodselsdato ? `født ${profil.fodselsdato.getUTCFullYear()}` : null].filter(Boolean).join(" · ") || undefined}
        venstre={
          erTrener ? (
            <TnHeltKnapper>
              <TnHandlingLenke href={postHref} variant="hvit">Skriv post</TnHandlingLenke>
              <TnHandlingLenke href={`/team-norway/workbench?spiller=${spillerId}`} variant="konturHvit">Foreslå endring</TnHandlingLenke>
            </TnHeltKnapper>
          ) : undefined
        }
        hoyre={<TnIupStripe wagr={wagr} bruttoSnitt={profil.aaret?.bruttoSnitt ?? null} aar={aar} />}
      />
      <TnSkraKort>
      <TnFlate style={{ display: "grid", gap: 12 }}>
        <TnSpillerFaner spillerId={spillerId} spillerNavn={profil.navn} aktiv="oversikt" kanAdministrere={erTrener} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <TnPille tone="info">{profil.erTnMedlem ? `${tnRolleNavn("PLAYER")} i ${kontekst.gruppe.name}` : "Delt med Team Norway"}</TnPille>
          <TnPille>{erCollege ? "College" : "Skole"}: {profil.skole ?? "ikke registrert"}</TnPille>
          <TnPille>HCP {formaterHcp(profil.hcp)}</TnPille>
        </div>
        <TnFotnote>{wagr ? `WAGR-plass: World Amateur Golf Ranking (WAGR), The R&A, ${datoLang(wagr.dato)}.` : "WAGR-plass mangler: spilleren er ikke koblet til WAGR ennå."} NGF-juniorranking og kategori finnes ikke i appen ennå.</TnFotnote>
      </TnFlate>
      {erTrener && kontekst.kanAdministrere && profil.erTnMedlem ? <TnKnapperekke><TnAvsluttSpiller spillerId={spillerId} navn={profil.navn} /></TnKnapperekke> : null}

      <TnRutenett min={320}>
        <section style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <TnFlatehode tittel="Haster" />
          <TnFlate style={{ paddingBlock: 4 }}>
            {haster.length === 0 ? <TnMangler>Ingenting haster nå.</TnMangler> : null}
            {haster.map((h) => <TnListerad key={h.tekst} tittel={h.tekst} hoyre={<TnPille tone="amber">{h.merke}</TnPille>} />)}
          </TnFlate>
        </section>

        <section style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <TnFlatehode tittel="Siste tester">
            <TnTekstlenke href={`/team-norway/spiller/${spillerId}/tester`}>Tester</TnTekstlenke>
          </TnFlatehode>
          <TnFlate style={{ paddingBlock: 4 }}>
            {testrader.length === 0 ? <TnMangler>{tester ? "Spilleren har ikke fullført noen Team Norway-protokoll ennå." : "Testene er ikke delt med Team Norway."}</TnMangler> : null}
            {testrader.slice(0, 3).map((r) => (
              <Link key={r.testId} href={`/team-norway/spiller/${spillerId}/tester/${r.testId}`} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
                <TnListerad tittel={r.protokollNavn} tekst={datoLang(r.sisteDato)} hoyre={tall(r.sisteFormatert ?? "—")} />
              </Link>
            ))}
          </TnFlate>
        </section>

        <section style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <TnFlatehode tittel="Neste turneringer">
            <TnTekstlenke href={`/team-norway/spiller/${spillerId}/turneringsplan`}>Turneringsplan</TnTekstlenke>
          </TnFlatehode>
          <TnFlate style={{ paddingBlock: 4 }}>
            {!delt ? <TnMangler>Turneringsplanen er ikke delt med Team Norway.</TnMangler> : delt.nesteTurneringer.length === 0 ? <TnMangler>Ingen kommende turneringer i planen.</TnMangler> : null}
            {delt?.nesteTurneringer.map((t, i) => <TnListerad key={`${t.navn}-${i}`} tittel={t.navn} tekst={t.merke} hoyre={tall(datoKort(t.dato))} />)}
          </TnFlate>
        </section>

        <section style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <TnFlatehode tittel="Trening siste fire uker" />
          <TnFlate style={{ display: "grid", gap: 12 }}>
            <TnNokkeltall tall={[
              { etikett: "gjennomført", verdi: akser ? `${komma(akser.gjennomfortTimer)} t` : "—" },
              { etikett: "av plan", verdi: planPct !== null ? `${planPct} %` : "—" },
              { etikett: "TEK", verdi: tekPct !== null ? `${tekPct} %` : "—" },
            ]} />
            <TnPyramide etikett="Gjennomført trening per akse" timer={akser ? akser.gjennomfort : {}} />
            <TnFotnote>{akser ? `${komma(akser.gjennomfortTimer)} t gjennomført av ${komma(akser.planlagtTimer)} t planlagt. Kilde: PlayerHQ, ${datoLang(naa)}.` : "Treningen er ikke delt med Team Norway, derfor står det strek."}</TnFotnote>
          </TnFlate>
        </section>

        <section style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <TnFlatehode tittel={`Poster til ${fornavn(profil.navn)}`}>
            {erTrener ? <TnTekstlenke href={postHref}>Skriv post</TnTekstlenke> : null}
          </TnFlatehode>
          <TnFlate style={{ paddingBlock: 4 }}>
            {!poster || poster.length === 0 ? <TnMangler>Ingen poster ennå.</TnMangler> : null}
            {poster?.slice(0, 2).map((p) => (
              <Link key={p.id} href={postHref} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
                <TnListerad tittel={forkort(p.tekst)} tekst={`${p.authorNavn}${p.kvittering ? ` · lest av ${p.kvittering.apnet} av ${p.kvittering.totalt}` : ""}`} hoyre={tall(datoKort(p.createdAt))} />
              </Link>
            ))}
          </TnFlate>
        </section>

        <section style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <TnFlatehode tittel="Status" />
          <TnFlate style={{ paddingBlock: 4 }}>
            {alleStatus.map((rad) => <TnListerad key={rad.tittel} tittel={rad.tittel} tekst={rad.tekst} hoyre={<TnPille tone={TONE[rad.tone]}>{rad.merke}</TnPille>} />)}
            {kontekst.kanAdministrere ? <TnTekstlenke href="/team-norway/lisens-okonomi">Endre i Lisens og dokumenter</TnTekstlenke> : null}
          </TnFlate>
        </section>
      </TnRutenett>

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode
          tittel={`Turneringer ${aar}`}
          merknad={profil.aaret && profil.aaret.runder > 0 && profil.aaret.bruttoSnitt !== null ? `Brutto snitt ${snitt.format(profil.aaret.bruttoSnitt)} · ${profil.aaret.runder} ${profil.aaret.runder === 1 ? "runde" : "runder"}` : undefined}
        />
        <TnFlate style={{ paddingBlock: 4 }}>
          {profil.turneringer === null ? (
            <TnMangler>Spilleren er ikke koblet til en resultatprofil ennå. Turneringene vises når koblingen er gjort.</TnMangler>
          ) : profil.turneringer.length === 0 ? (
            <TnMangler>Ingen registrerte turneringer i {aar}.</TnMangler>
          ) : (
            profil.turneringer.map((t, i) => (
              <TnListerad
                key={`${t.navn}-${i}`}
                tittel={t.navn}
                tekst={`${periode(t.start, t.slutt ?? t.start)} · ${t.runder === 0 ? "ingen fullførte runder" : `${t.runder} ${t.runder === 1 ? "runde" : "runder"}`}${t.status === "CUT" ? " (kutt)" : ""}`}
                hoyre={<span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 18, color: TN.navy900, textAlign: "right" }}>{t.bruttoSnitt !== null ? snitt.format(t.bruttoSnitt) : "—"}<small style={{ display: "block", fontSize: 12, color: TN.ink500 }}>{t.status === "CUT" ? "MC" : t.plassering ? `Plass ${t.plassering}` : "Plass —"}</small></span>}
              />
            ))
          )}
        </TnFlate>
        <TnFotnote>Brutto snitt er ekte slag per fullført runde. Plassering står bare der den gjelder bruttoklassen.</TnFotnote>
      </section>
      </TnSkraKort>
    </TnShell>
  );
}

/** Tallstripen i IUP-toppen: WAGR-plass, NGF-juniorranking, brutto snitt og kategori. Manglende tall er «—». */
export function TnIupStripe({ wagr, bruttoSnitt, aar }: { wagr: TnWagrPlass | null; bruttoSnitt: number | null; aar: number }) {
  return (
    <TnHeltTellere
      tall={[
        { verdi: wagr?.plass != null ? heltall.format(wagr.plass) : "—", tekst: "WAGR-plass" },
        { verdi: "—", tekst: "NGF juniorranking" },
        { verdi: bruttoSnitt != null ? snitt.format(bruttoSnitt) : "—", tekst: `brutto snitt ${aar}` },
        { verdi: "—", tekst: "kategori" },
      ]}
    />
  );
}

export type TnIupPost = { id: string; tekst: string; authorNavn: string; createdAt: Date; kvittering: { totalt: number; apnet: number } | null };

const heltall = new Intl.NumberFormat("nb-NO");
const fornavn = (navn: string) => navn.split(" ")[0] || navn;
const forkort = (tekst: string) => {
  const linje = tekst.split("\n")[0].trim();
  return linje.length > 70 ? `${linje.slice(0, 69)}…` : linje;
};
