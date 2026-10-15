import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerAksefordeling, hentTnSpillerIup, hentTnSpillerLisens, hentTnSpillerProfil, hentTnSpillerstatuser, hentTnSpillerTester, hentTnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { formaterHcp } from "@/lib/domain/hcp";
import { alderFraFodselsdato } from "@/lib/forelder";
import type { TilgangsNivaa } from "@/lib/feature-flags";
import { TN } from "@/lib/v2/team-norway";
import { TnPille, type TnPilleTone } from "../core";
import { TnNokkeltall, TnShell, TnSpillerFaner, tnRolleNavn } from "../tn-shell";
import { TnFlate, TnFlatehode, TnFotnote, TnListerad, TnMangler, TnRutenett, TnTekstlenke } from "../tn-flate";
import { TnPyramide } from "../tn-grunnmur";
import { TnHandlingLenke, TnKnapperekke } from "../tn-handlinger";
import { LISENS_TEKST, TnAvsluttSpiller } from "../tn-redigering-skjema";
import { ER_COLLEGE, datoKort, datoLang, osloDag, periode } from "./felles";

/**
 * TN-02 Spillerprofil, som heter IUP i Team Norway (Anders 15.10.2026). Fanen Oversikt.
 * Fasit: docs/design-system/utkast-tn/spillere.html, skjerm IUP (pakke 3).
 *
 * Avvik:
 *   - Adressen er /team-norway/spiller/[id]/oversikt. /team-norway/spiller/[id]
 *     er Post-fanen.
 *   - Kategori A–K og WAGR har ingen datakilde her og står med strek.
 *   - Pyramiden er spillerens Workbench-økter siste fire uker, lest innenfor
 *     delingslåsen. Plan-prosent står ikke i hodet; timene står under pyramiden.
 *   - Lisens, helseattest og antidoping leses fra registreringen i TN-10
 *     (Anders 27.09.2026). PlayerHQ-tilgangen vises i tillegg for trenere.
 *   - Leverte IUP-besvarelser (fireukerssjekk og utviklingssjekk) vises i sin
 *     egen fane; her står bare når siste ble levert.
 */

const NIVA: Record<TilgangsNivaa, { tekst: string; merke: string; tone: "ok" | "varsel" }> = {
  FULL: { tekst: "Full tilgang i PlayerHQ", merke: "Gyldig", tone: "ok" },
  TALENT: { tekst: "Gratis Talent-nivå i PlayerHQ", merke: "Talent", tone: "ok" },
  INGEN: { tekst: "Ingen aktiv tilgang i PlayerHQ", merke: "Mangler", tone: "varsel" },
};
const TONE: Record<"ok" | "varsel" | "ukjent", TnPilleTone> = { ok: "green", varsel: "amber", ukjent: "nøytral" };

const snitt = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Statusrad = { tittel: string; tekst: string; merke: string; tone: "ok" | "varsel" | "ukjent" };

export async function TnSpillerprofilSkjerm({ spillerId }: { spillerId: string }) {
  const bruker = await requirePortalUser({ kreverTilgang: "TALENT" });
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) notFound();
  const { kontekst } = tilgang;
  const aar = osloDag(new Date()).aar;

  const [profil, tester, lisens, statuser, iup, akser] = await Promise.all([
    hentTnSpillerProfil(bruker, spillerId, aar),
    hentTnSpillerTester(bruker, spillerId),
    kontekst.kanAdministrere ? hentTnSpillerLisens(bruker, spillerId) : Promise.resolve(null),
    hentTnSpillerstatuser(bruker, kontekst, aar),
    hentTnSpillerIup(bruker, spillerId),
    hentTnSpillerAksefordeling(bruker, spillerId),
  ]);
  const reg = statuser.get(spillerId) ?? null;
  const naa = new Date();
  const helseDager = reg?.helseattestUtloper ? Math.floor((reg.helseattestUtloper.getTime() - naa.getTime()) / 864e5) : null;
  if (!profil) notFound();

  const alder = alderFraFodselsdato(profil.fodselsdato);
  const erCollege = !!profil.skole && ER_COLLEGE.test(profil.skole);
  const testrader = [...(tester?.rader ?? [])].sort((a, b) => b.sisteDato.getTime() - a.sisteDato.getTime());

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

  return (
    <TnShell aktiv="spillere" brukerNavn={bruker.name ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere} tilbake={{ href: "/team-norway/spillere", label: "Spillere" }}>
      <TnSpillerFaner
        spillerId={spillerId}
        spillerNavn={profil.navn}
        aktiv="oversikt"
        kanAdministrere={!kontekst.erSpiller}
        overlinje={["IUP", alder !== null ? `${alder} år` : null, profil.klubb].filter(Boolean).join(" · ")}
      >
        <TnNokkeltall tall={[
          { etikett: "HCP", verdi: formaterHcp(profil.hcp) },
          { etikett: `Snitt brutto ${aar}`, verdi: profil.aaret?.bruttoSnitt != null ? snitt.format(profil.aaret.bruttoSnitt) : "—" },
          { etikett: "Kategori", verdi: "—" },
          { etikett: "WAGR", verdi: "—" },
        ]} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <TnPille tone="info">{profil.erTnMedlem ? `${tnRolleNavn("PLAYER")} i ${kontekst.gruppe.name}` : "Delt med Team Norway"}</TnPille>
          <TnPille>{erCollege ? "College" : "Skole"}: {profil.skole ?? "ikke registrert"}</TnPille>
        </div>
      </TnSpillerFaner>

      {!kontekst.erSpiller ? (
        <TnKnapperekke>
          <TnHandlingLenke href={`/team-norway/spiller/${spillerId}`}>Skriv til spilleren</TnHandlingLenke>
          <TnHandlingLenke href={`/team-norway/workbench?spiller=${spillerId}`} variant="sekundar">Foreslå endring</TnHandlingLenke>
          {kontekst.kanAdministrere && profil.erTnMedlem ? <TnAvsluttSpiller spillerId={spillerId} navn={profil.navn} /> : null}
        </TnKnapperekke>
      ) : null}

      <TnRutenett min={340}>
        <section style={{ display: "grid", gap: 12 }}>
          <TnFlatehode tittel="Pyramiden" merknad="Siste 4 uker" />
          <TnFlate>
            <TnPyramide etikett="Gjennomført trening per akse" verdier={akser ? akser.gjennomfort : {}} />
            <TnFotnote>
              {akser ? `${String(akser.gjennomfortTimer).replace(".", ",")} t gjennomført av ${String(akser.planlagtTimer).replace(".", ",")} t planlagt. Kilde: PlayerHQ, ${datoLang(naa)}.` : "Treningen er ikke delt med Team Norway, derfor står det strek."}
            </TnFotnote>
          </TnFlate>
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          <TnFlatehode tittel="Status" />
          <TnFlate style={{ paddingBlock: 4 }}>
            {alleStatus.map((rad) => <TnListerad key={rad.tittel} tittel={rad.tittel} tekst={rad.tekst} hoyre={<TnPille tone={TONE[rad.tone]}>{rad.merke}</TnPille>} />)}
            {kontekst.kanAdministrere ? <TnTekstlenke href="/team-norway/lisens-okonomi">Endre i Lisens og dokumenter</TnTekstlenke> : null}
          </TnFlate>
        </section>
      </TnRutenett>

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Siste tester">
          {testrader.length > 0 ? <TnTekstlenke href={`/team-norway/spiller/${spillerId}/tester`}>Alle tester</TnTekstlenke> : null}
        </TnFlatehode>
        <TnFlate style={{ paddingBlock: 4 }}>
          {testrader.length === 0 ? <TnMangler>Spilleren har ikke fullført noen Team Norway-protokoll ennå.</TnMangler> : null}
          {testrader.slice(0, 5).map((r) => (
            <Link key={r.testId} href={`/team-norway/spiller/${spillerId}/tester/${r.testId}`} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
              <TnListerad
                tittel={r.protokollNavn}
                tekst={`${datoLang(r.sisteDato)}${r.besteFormatert ? ` · beste ${r.besteFormatert}` : ""}`}
                hoyre={<span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 18, color: TN.navy900, textAlign: "right" }}>{r.sisteFormatert ?? "—"}</span>}
              />
            </Link>
          ))}
        </TnFlate>
      </section>

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
    </TnShell>
  );
}
