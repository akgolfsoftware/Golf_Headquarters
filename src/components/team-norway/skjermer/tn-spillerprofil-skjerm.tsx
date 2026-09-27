import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Minus, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerLisens, hentTnSpillerProfil, hentTnSpillerTester, hentTnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { formaterHcp } from "@/lib/domain/hcp";
import { alderFraFodselsdato } from "@/lib/forelder";
import type { TilgangsNivaa } from "@/lib/feature-flags";
import { TN } from "@/lib/v2/team-norway";
import { TnShell, TnSpillerFaner, tnRolleNavn } from "../tn-shell";
import { TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnMangler } from "../tn-flate";
import { ER_COLLEGE, datoLang, osloDag, periode } from "./felles";

/**
 * TN-02 Spillerprofil. Testprotokoller, årets turneringer og dokumentstatus for én spiller.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-02.
 *
 * Avvik:
 *   - Adressen er /team-norway/spiller/[id]/oversikt. /team-norway/spiller/[id]
 *     er Post-fanen, og fanene står øverst som på de andre spillersidene.
 *   - Klasse (Herrer, Damer, U18) står ikke: profilen har ikke kjønn.
 *   - Portrettbilde finnes ikke i profilen. Kvadratisk initialplate i stedet.
 *   - WAGR har ingen datakilde og står med strek.
 *   - Helseattest og antidoping-samtykke har ingen datamodell og står som
 *     «Ikke registrert». Lisens er PlayerHQ-tilgangen, og vises bare for trenere.
 *   - Testtabellen er én rad per protokoll med siste og beste resultat, ikke
 *     fire faste tester per dato. Protokollene har egne enheter og ingen
 *     landslagsstandard (se TN-18), så standard i parentes står ikke.
 *   - Turneringene er alle årets resultater fra den offentlige kilden, ikke bare
 *     internasjonale. Kilden skiller ikke på det.
 */

const NIVA: Record<TilgangsNivaa, { tekst: string; merke: string; tone: "ok" | "varsel" }> = {
  FULL: { tekst: "Full tilgang i PlayerHQ", merke: "GYLDIG", tone: "ok" },
  TALENT: { tekst: "Gratis Talent-nivå i PlayerHQ", merke: "TALENT", tone: "ok" },
  INGEN: { tekst: "Ingen aktiv tilgang i PlayerHQ", merke: "MANGLER", tone: "varsel" },
};

const snitt = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Statusrad = { tittel: string; tekst: string; merke: string; tone: "ok" | "varsel" | "ukjent" };

function Statuslinje({ rad }: { rad: Statusrad }) {
  const farge = rad.tone === "ok" ? TN.status.greenText : rad.tone === "varsel" ? TN.status.amberText : TN.textSecondary;
  const ikon: ReactNode = rad.tone === "ok" ? <Check size={18} aria-hidden /> : rad.tone === "varsel" ? <TriangleAlert size={18} aria-hidden /> : <Minus size={18} aria-hidden />;
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${TN.navy100}` }}>
      <span style={{ width: 36, height: 36, flex: "none", border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.sm, display: "flex", alignItems: "center", justifyContent: "center", color: farge }}>{ikon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700 }}>{rad.tittel}</div>
        <div style={{ fontSize: 13, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>{rad.tekst}</div>
      </div>
      <span style={{ whiteSpace: "nowrap", fontFamily: TN.font.mono, fontSize: 11, letterSpacing: "0.06em", color: farge, textAlign: "right" }}>{rad.merke}</span>
    </div>
  );
}

const TESTKOLONNER = "minmax(0, 1.6fr) repeat(3, minmax(0, 1fr))";

export async function TnSpillerprofilSkjerm({ spillerId }: { spillerId: string }) {
  const bruker = await requirePortalUser({ kreverTilgang: "TALENT" });
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) notFound();
  const { kontekst } = tilgang;
  const aar = osloDag(new Date()).aar;

  const [profil, tester, lisens] = await Promise.all([
    hentTnSpillerProfil(tilgang, aar),
    hentTnSpillerTester(bruker, spillerId),
    kontekst.kanAdministrere ? hentTnSpillerLisens(tilgang) : Promise.resolve(null),
  ]);
  if (!profil) notFound();

  const alder = alderFraFodselsdato(profil.fodselsdato);
  const erCollege = !!profil.skole && ER_COLLEGE.test(profil.skole);
  const testrader = [...(tester?.rader ?? [])].sort((a, b) => b.sisteDato.getTime() - a.sisteDato.getTime());

  const status: Statusrad[] = [
    ...(lisens
      ? [lisens.status === "ok"
        ? { tittel: `Lisens ${aar}`, tekst: NIVA[lisens.niva].tekst, merke: NIVA[lisens.niva].merke, tone: NIVA[lisens.niva].tone }
        : { tittel: `Lisens ${aar}`, tekst: "Tilgangen kunne ikke leses akkurat nå. Prøv igjen.", merke: "UKJENT", tone: "ukjent" as const }]
      : []),
    { tittel: "Helseattest", tekst: "Kan ikke registreres i AK Golf HQ ennå.", merke: "IKKE REGISTRERT", tone: "ukjent" },
    { tittel: "Antidoping-samtykke", tekst: "Kan ikke registreres i AK Golf HQ ennå.", merke: "IKKE REGISTRERT", tone: "ukjent" },
  ];

  return (
    <TnShell aktiv="spillere" brukerNavn={bruker.name ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere}>
      <TnSpillerFaner spillerId={spillerId} spillerNavn={profil.navn} aktiv="oversikt" kanAdministrere={!kontekst.erSpiller} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, max(360px, calc((100% - 20px) / 2))), 1fr))", gap: 20 }}>
        <TnFlate style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
          <TnInitialer navn={profil.navn} storrelse={132} />
          <div style={{ flex: "1 1 180px", minWidth: 0 }}>
            <TnEtikett style={{ letterSpacing: "0.2em" }}>{tnRolleNavn("PLAYER")} · {kontekst.gruppe.name}</TnEtikett>
            <div style={{ fontFamily: TN.font.display, fontWeight: 300, fontSize: "clamp(22px, 2.4vw, 26px)", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.15, marginTop: 6, color: TN.navy900, overflowWrap: "anywhere" }}>{profil.navn}</div>
            <dl style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "6px 14px", margin: "14px 0 0", fontSize: 14 }}>
              <dt style={{ color: TN.textSecondary }}>Alder</dt>
              <dd style={{ margin: 0 }}>{alder !== null && profil.fodselsdato ? `${alder} år · født ${datoLang(profil.fodselsdato)}` : "Ikke registrert"}</dd>
              <dt style={{ color: TN.textSecondary }}>Klubb</dt>
              <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{profil.klubb ?? "Ikke registrert"}</dd>
              <dt style={{ color: TN.textSecondary }}>{erCollege ? "College" : "Skole"}</dt>
              <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{profil.skole ?? "Ikke registrert"}</dd>
            </dl>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1, background: TN.navy100, border: `1px solid ${TN.navy100}`, width: "100%" }}>
            {[
              ["Hcp", formaterHcp(profil.hcp)],
              ["WAGR", "—"],
              [`Brutto ${aar}`, profil.aaret?.bruttoSnitt != null ? snitt.format(profil.aaret.bruttoSnitt) : "—"],
            ].map(([etikett, verdi]) => (
              <div key={etikett} style={{ background: TN.white, padding: "12px 14px", minWidth: 0 }}>
                <div style={{ fontFamily: TN.font.mono, fontSize: 22, fontVariantNumeric: "tabular-nums" }}>{verdi}</div>
                <TnEtikett style={{ fontSize: 10.5, marginTop: 4 }}>{etikett}</TnEtikett>
              </div>
            ))}
          </div>
        </TnFlate>

        <TnFlate>
          <TnFlatehode tittel="Status" />
          {status.map((rad) => <Statuslinje key={rad.tittel} rad={rad} />)}
        </TnFlate>

        <TnFlate style={{ gridColumn: "1 / -1" }}>
          <TnFlatehode tittel="Siste testprotokoller" merknad={testrader.length > 0 ? `${testrader.length} PROTOKOLLER` : undefined} />
          {testrader.length === 0 ? (
            <TnMangler>Spilleren har ikke fullført noen Team Norway-protokoll ennå.</TnMangler>
          ) : (
            <div role="table" aria-label="Siste testprotokoller">
              <div role="row" style={{ display: "grid", gridTemplateColumns: TESTKOLONNER, gap: 8, padding: "12px 0 8px", borderBottom: `1px solid ${TN.navy100}` }}>
                {["Protokoll", "Siste", "Beste", "Dato"].map((k, i) => (
                  <TnEtikett key={k} style={{ fontSize: 10.5, letterSpacing: "0.12em", textAlign: i > 0 ? "right" : undefined }}><span role="columnheader">{k}</span></TnEtikett>
                ))}
              </div>
              {testrader.slice(0, 5).map((r, i) => (
                <Link key={r.testId} role="row" href={`/team-norway/spiller/${spillerId}/tester/${r.testId}`} style={{ display: "grid", gridTemplateColumns: TESTKOLONNER, gap: 8, padding: "12px 0", minHeight: 44, alignItems: "baseline", borderBottom: `1px solid ${TN.navy100}`, background: i === 0 ? TN.navy50 : "transparent", color: TN.textPrimary, textDecoration: "none", fontFamily: TN.font.mono, fontSize: "clamp(12px, 1.4vw, 14px)", fontVariantNumeric: "tabular-nums" }}>
                  <span role="cell" style={{ fontFamily: TN.font.body, fontSize: 14, fontWeight: 700, overflowWrap: "anywhere", minWidth: 0 }}>{r.protokollNavn}</span>
                  <span role="cell" style={{ textAlign: "right" }}>{r.sisteFormatert ?? "—"}</span>
                  <span role="cell" style={{ textAlign: "right" }}>{r.besteFormatert ?? "—"}</span>
                  <span role="cell" style={{ textAlign: "right", color: TN.textSecondary }}>{datoLang(r.sisteDato)}</span>
                </Link>
              ))}
            </div>
          )}
          {testrader.length > 5 ? (
            <Link href={`/team-norway/spiller/${spillerId}/tester`} style={{ color: TN.navy900, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", minHeight: 44, display: "inline-flex", alignItems: "center", marginTop: 8 }}>
              Alle {testrader.length} protokoller →
            </Link>
          ) : null}
        </TnFlate>

        <TnFlate style={{ gridColumn: "1 / -1" }}>
          <TnFlatehode
            tittel={`Turneringer ${aar}`}
            merknad={profil.aaret && profil.aaret.runder > 0 && profil.aaret.bruttoSnitt !== null ? `BRUTTO SNITT ${snitt.format(profil.aaret.bruttoSnitt)} · ${profil.aaret.runder} ${profil.aaret.runder === 1 ? "RUNDE" : "RUNDER"}` : undefined}
          />
          {profil.turneringer === null ? (
            <TnMangler>Spilleren er ikke koblet til en resultatprofil ennå. Turneringene vises når koblingen er gjort.</TnMangler>
          ) : profil.turneringer.length === 0 ? (
            <TnMangler>Ingen registrerte turneringer i {aar}.</TnMangler>
          ) : (
            profil.turneringer.map((t, i) => (
              <div key={`${t.navn}-${i}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", gap: "6px 18px", alignItems: "baseline", padding: "13px 0", borderBottom: `1px solid ${TN.navy100}` }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{t.navn}</div>
                  <div style={{ fontFamily: TN.font.mono, fontSize: 11.5, color: TN.textSecondary, marginTop: 2 }}>
                    {periode(t.start, t.slutt ?? t.start)} · {t.runder === 0 ? "ingen fullførte runder" : `${t.runder} ${t.runder === 1 ? "runde" : "runder"}`}{t.status === "CUT" ? " (kutt)" : ""}
                  </div>
                </div>
                <span style={{ fontFamily: TN.font.mono, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{t.bruttoSnitt !== null ? snitt.format(t.bruttoSnitt) : "—"}</span>
                <span style={{ fontFamily: TN.font.mono, fontSize: 13, color: TN.textSecondary, minWidth: 40, textAlign: "right" }}>{t.status === "CUT" ? "MC" : t.plassering ?? "—"}</span>
              </div>
            ))
          )}
          <TnFotnote>Brutto snitt er ekte slag per fullført runde. Plassering står bare der den gjelder bruttoklassen.</TnFotnote>
        </TnFlate>
      </div>
    </TnShell>
  );
}
