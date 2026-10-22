import Link from "next/link";

import type { TnTrenerprofil } from "@/lib/domain/tn-trenerprofil";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnListerad, TnMangler, TnRutenett } from "../tn-flate";
import { TnHandlingLenke } from "../tn-handlinger";
import { TnShell, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltKnapper, TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";
import { datoLang } from "./felles";

const lenkeStil = { display: "inline-flex", alignItems: "center", minHeight: 44, color: TN.navy900, fontWeight: 700, textUnderlineOffset: 4, overflowWrap: "anywhere" } as const;

/**
 * Min profil for Team Norway-treneren (/team-norway/profil), nådd fra navnet nederst i menyen.
 * Fasit: docs/design-system/utkast-tn/trenerflate/index.html, skjermen «Trenerprofil».
 *
 * Avvik:
 *   - «Endre» på kontakt er ikke med: treneren endrer telefon i AK Golf-kontoen; rolle og gruppe
 *     endrer sportssjefen under Trenere og tilgang.
 *   - Delingsnivå per spiller vises ikke: listen er spillerne med navngitt deling til treneren,
 *     som er det som gir innsyn i IUP-en.
 *   - «Mine saker» viser bare forslag til spillerens plan. Forslag til turneringsplan og uttak
 *     treneren er ansvarlig for har ingen kobling til treneren ennå.
 */
export function TnTrenerprofilVisning({ brukerNavn, erAdmin, visDataGolf, p }: { brukerNavn: string | null; erAdmin: boolean; visDataGolf: boolean; p: TnTrenerprofil }) {
  const rolle = p.gruppeRolle ? tnRolleNavn(p.gruppeRolle) : erAdmin ? "Administrator" : "—";
  const ikkeDelt = Math.max(p.spillereIGruppa - p.delte.length, 0);

  return (
    <TnShell aktiv="profil" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(p.kontekst.rolle)} groupId={p.kontekst.gruppe.id} visTrenerflater kanAdministrere={p.kontekst.kanAdministrere} visDataGolf={visDataGolf}>
      <TnSkraTopp
        bilde="tee-hand"
        etikett="Min profil"
        overlinje={`Min profil · ${p.kontekst.gruppe.name}`}
        tittel={p.navn}
        ingress={p.medlemSiden ? `${rolle} · aktiv siden ${datoLang(p.medlemSiden)}` : rolle}
        venstre={
          <>
            <TnHeltTall verdi={p.delte.length} enhet={p.delte.length === 1 ? "spiller" : "spillere"}>deler med deg</TnHeltTall>
            <TnHeltTekst>Du ser IUP, tester og trening bare for spillere som har delt med deg.</TnHeltTekst>
            <TnHeltKnapper><TnHandlingLenke href="/team-norway/spillere" variant="hvit">Til spillerne</TnHandlingLenke></TnHeltKnapper>
          </>
        }
        hoyre={<TnHeltTellere tall={[{ verdi: p.spillereIGruppa, tekst: "i gruppa" }, { verdi: ikkeDelt, tekst: "har ikke delt" }, { verdi: p.forslag.length, tekst: "forslag" }]} />}
      />
      <TnSkraKort>
        <TnRutenett>
          <TnFlate>
            <TnFlatehode tittel="Kontakt" />
            <TnListerad tittel="E-post" tekst={<span style={{ overflowWrap: "anywhere" }}>{p.epost ?? "—"}</span>} />
            <TnListerad tittel="Telefon" hoyre={<span style={{ fontFamily: TN.font.mono }}>{p.telefon ?? "—"}</span>} />
            <TnListerad tittel="Rolle" hoyre={rolle} />
            <TnListerad tittel="Gruppe" hoyre={p.kontekst.gruppe.name} />
            <TnFotnote>Spillere kan dele med deg når e-posten din slutter på @golfforbundet.no. Rolle og gruppe endres av sportssjefen under Trenere og tilgang.</TnFotnote>
          </TnFlate>

          <TnFlate>
            <TnFlatehode tittel="Spillere som deler med deg" merknad={`${p.delte.length} av ${p.spillereIGruppa} i gruppa`} />
            {p.delte.length === 0 ? <TnMangler>Ingen spillere har delt med deg ennå. Spilleren deler selv fra PlayerHQ.</TnMangler> : null}
            {p.delte.map((s) => (
              <TnListerad
                key={s.id}
                foran={<TnInitialer navn={s.navn} />}
                tittel={<Link href={`/team-norway/spiller/${s.id}`} style={lenkeStil}>{s.navn}</Link>}
                hoyre={<TnPille tone="info">Deler</TnPille>}
              />
            ))}
            {ikkeDelt > 0 ? <TnListerad tittel={`${ikkeDelt} har ikke delt`} hoyre={<Link href="/team-norway/spillere" style={lenkeStil}>Se hvem</Link>} /> : null}
          </TnFlate>

          <TnFlate>
            <TnFlatehode tittel="Mine saker" merknad="Forslag til spillerens plan" />
            {p.forslag.length === 0 ? <TnMangler>Du har ingen forslag til spillere som deler med deg.</TnMangler> : null}
            {p.forslag.map((f) => (
              <TnListerad key={f.id} tittel={`Forslag til plan, ${f.spillerNavn}`} tekst={datoLang(f.opprettet)} hoyre={<TnPille tone={f.status === "Venter på spilleren" ? "info" : "nøytral"}>{f.status}</TnPille>} />
            ))}
            <TnFotnote>Gruppemedlemskap gir ikke innsyn alene. Spilleren bestemmer, du foreslår.</TnFotnote>
          </TnFlate>
        </TnRutenett>
      </TnSkraKort>
    </TnShell>
  );
}
