import Link from "next/link";
import { Clock } from "lucide-react";
import { notFound } from "next/navigation";

import { hentTnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { TN_CATALOG, TN_VERSION } from "@/lib/portal-tester/tn-catalog";
import { TN } from "@/lib/v2/team-norway";
import { TnEtikett, TnFilterknapper, TnFlate, TnFlatehode, TnFotnote, TnSkjermhode } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker } from "../skjermer/felles";
import { TnTomFlate } from "./tn-tilstander";
import { TN_KLASSER, akKategoriRader, kortVersjon, lagReferanseRader, lesKlasse } from "./referanse-data";

/**
 * TN-18 Referansenivåer.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), «Team Norway App.dc.html»,
 * skjerm «referanse» (s18d) med SUPD-teksten fra 28.09.
 *
 * Avvik:
 *   - Protokollene er den versjonerte katalogen (tn-catalog.ts), ikke
 *     tegningens eksempelbatteri. Katalogen har én versjon for hele batteriet,
 *     så Versjon-kolonnen viser katalogversjonen på hver rad.
 *   - Landslagsnormen finnes ikke i noen modell. Kolonnen står med strek, som
 *     i tegningen, til Team Norway har fastsatt normene.
 *   - Klassevalget ligger i adressen (?klasse=). Protokoller med egen variant
 *     for gutter eller jenter vises bare i klassene varianten gjelder.
 */

const KOLONNER = "minmax(0, 1.5fr) repeat(4, minmax(0, 1fr))";
const tall = { textAlign: "right", fontFamily: TN.font.mono, fontSize: 13.5, overflowWrap: "anywhere" } as const;

export async function TnReferansenivaerSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();

  const klasseIndeks = lesKlasse(sokeparametre.klasse);
  const klasse = TN_KLASSER[klasseIndeks];
  const alle = lagReferanseRader(TN_CATALOG, klasse);
  const klare = alle.filter((r) => !r.utkast);
  const utkast = alle.filter((r) => r.utkast);
  const versjon = kortVersjon(TN_VERSION);

  return (
    <SkjermRamme aktiv="referansenivaer" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode
        rute="/team-norway/referansenivaer"
        tittel="Referansenivåer"
        ingress="Testene fra den versjonerte protokollkilden med landslagsnorm per klasse, og AK Golfs kategoritabell etter brutto snittscore. Normene er ikke fastsatt ennå."
      />

      {alle.length === 0 ? (
        <TnTomFlate ikon={Clock} tittel="Ingen referansenivåer publisert" tekst="Et referansenivå settes når testprotokollen får status Klar. Ingen protokoller er klare for sesongen ennå." lenke={{ href: "/team-norway/protokoller", tekst: "Se testprotokoller" }} />
      ) : (
        <>
          <TnFilterknapper etikett="Velg klasse" valg={TN_KLASSER.map((k, i) => ({ href: `/team-norway/referansenivaer?klasse=${i}`, label: k, aktiv: i === klasseIndeks }))} />

          <TnFlate>
            <TnFlatehode tittel={`Referansenivåer · ${klasse}`} merknad={`PROTOKOLLKILDE ${TN_VERSION.toUpperCase()}`} />
            <div role="table" aria-label={`Referansenivåer for ${klasse}`}>
              <div role="row" style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 10, padding: "12px 0 8px", borderBottom: `1px solid ${TN.navy100}` }}>
                {["Test · protokoll", "Enhet", "Forsøk", "Versjon", "Landslag"].map((k, i) => (
                  <TnEtikett key={k} style={{ fontSize: 10.5, letterSpacing: "0.12em", textAlign: i > 0 ? "right" : undefined, overflowWrap: "anywhere" }}><span role="columnheader">{k}</span></TnEtikett>
                ))}
              </div>
              {klare.map((r) => (
                <Link role="row" key={r.id} href={`/team-norway/protokoller/${encodeURIComponent(r.id)}`} style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 10, padding: "13px 0", minHeight: 56, borderBottom: `1px solid ${TN.navy100}`, alignItems: "baseline", textDecoration: "none", color: TN.textPrimary }}>
                  <span role="cell" style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 700, lineHeight: 1.3, overflowWrap: "anywhere" }}>{r.navn}</span>
                    <span style={{ display: "block", fontFamily: TN.font.mono, fontSize: 10.5, color: TN.navy900, marginTop: 3 }}>PROTOKOLL {versjon.toUpperCase()}</span>
                  </span>
                  <span role="cell" style={tall}>{r.enhet}</span>
                  <span role="cell" style={tall}>{r.forsok}</span>
                  <span role="cell" style={tall}>{versjon}</span>
                  <span role="cell" style={{ ...tall, color: TN.textSecondary }}>—</span>
                </Link>
              ))}
            </div>

            {utkast.length > 0 ? (
              <>
                <TnEtikett style={{ marginTop: 22, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Uten referanse · protokoll i utkast</TnEtikett>
                {utkast.map((r) => (
                  <Link key={r.id} href={`/team-norway/protokoller/${encodeURIComponent(r.id)}`} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "4px 16px", padding: "12px 0", minHeight: 48, borderBottom: `1px solid ${TN.navy100}`, alignItems: "baseline", color: TN.textSecondary, textDecoration: "none" }}>
                    <span style={{ fontSize: 14, minWidth: 0, overflowWrap: "anywhere" }}>{r.navn}</span>
                    <span style={{ fontFamily: TN.font.mono, fontSize: 11 }}>{versjon} · UTKAST</span>
                  </Link>
                ))}
              </>
            ) : null}
            <TnFotnote>Landslagsnormen per test og klasse står med strek fordi normen fra Team Norway mangler. AK Golf-kategori regnes fra brutto snittscore, ikke fra testene. Trykk på en test for å se protokollen.</TnFotnote>
          </TnFlate>
        </>
      )}

      <TnFlate>
        <TnFlatehode tittel="AK Golf-kategori · brutto snittscore" merknad="GRENSER [MIN, MAKS)" />
        {akKategoriRader().map((r) => (
          <div key={r.kategori} style={{ display: "grid", gridTemplateColumns: "40px minmax(0, 1fr) auto", gap: 12, padding: "10px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "center" }}>
            <span style={{ width: 32, height: 32, border: `1px solid ${TN.navy200}`, borderRadius: TN.radius.sm, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TN.font.mono, fontSize: 14, color: TN.navy900 }}>{r.kategori}</span>
            <span style={{ fontSize: 14.5, fontWeight: 700, minWidth: 0, overflowWrap: "anywhere" }}>{r.niva}</span>
            <span style={{ fontFamily: TN.font.mono, fontSize: 13, whiteSpace: "nowrap" }}>{r.grenser}</span>
          </div>
        ))}
        <TnFotnote>Kategorien regnes fra spillerens brutto snittscore siste 12 måneder. Samme tabell gjelder alle klasser.</TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
