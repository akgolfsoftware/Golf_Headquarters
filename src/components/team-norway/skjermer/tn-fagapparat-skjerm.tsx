import { notFound } from "next/navigation";

import { hentTnTrenere } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnListerad, TnMangler, TnSkjermhode } from "../tn-flate";
import { TnHandlingLenke } from "../tn-handlinger";
import { tnRolleNavn } from "../tn-shell";
import { SkjermRamme, datoLang, hentSkjermbruker } from "./felles";

/**
 * TN-09 Fagapparat.
 * Fasit: docs/design-system/utkast-tn/plan-fag.html, skjerm Fagapparat (pakke 5).
 * Erstatter den gamle trenerkatalogen (/team-norway/apparatet sender hit).
 *
 * Avvik:
 *   - Bare fanen «Fagteam» har data: aktive trenere i Team Norway-gruppen.
 *     Fagpersoner fra Olympiatoppen, oppfølgingsplan per utøver og
 *     samlingsrapport har ingen datamodell og vises ikke.
 *   - Telefon, tilgjengelighet og «Be om konsultasjon» er utelatt.
 *   - E-post vises bare for dem som kan administrere gruppen, som før.
 */

export async function TnFagapparatSkjerm() {
  const bruker = await hentSkjermbruker();
  const data = await hentTnTrenere(bruker);
  if (!data || data.kontekst.erSpiller) notFound();

  return (
    <SkjermRamme aktiv="fagapparat" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode overlinje={data.kontekst.gruppe.name} tittel="Fagapparat" ingress="Hvem i trenerteamet som følger landslagsspillerne." handling={data.kontekst.kanAdministrere ? <TnHandlingLenke href="/team-norway/tilgang" variant="sekundar">Legg til trener</TnHandlingLenke> : undefined} />

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Fagteam" merknad={`${data.rader.length} ${data.rader.length === 1 ? "person" : "personer"}`} />
        <TnFlate style={{ paddingBlock: 4 }}>
          {data.rader.length === 0 ? <TnMangler>Ingen aktive trenere er registrert i Team Norway-gruppen.</TnMangler> : null}
          {data.rader.map((rad) => (
            <TnListerad
              key={rad.user.id}
              foran={<TnInitialer navn={rad.user.name ?? "?"} />}
              tittel={rad.user.name ?? "Navn mangler"}
              tekst={<>
                {tnRolleNavn(rad.role)} · aktiv siden {datoLang(rad.joinedAt)}
                {data.kontekst.kanAdministrere && rad.user.email ? <a href={`mailto:${rad.user.email}`} style={{ display: "flex", alignItems: "center", minHeight: 44, color: TN.navy600, fontWeight: 700, overflowWrap: "anywhere", textUnderlineOffset: 4 }}>{rad.user.email}</a> : null}
              </>}
              hoyre={<TnPille tone={rad.role === "COACH" ? "info" : "nøytral"}>{tnRolleNavn(rad.role)}</TnPille>}
            />
          ))}
        </TnFlate>
        <TnFotnote>Fagpersoner fra Olympiatoppen, oppfølgingsplan per spiller og samlingsrapporter kan ikke registreres ennå.</TnFotnote>
      </section>
    </SkjermRamme>
  );
}
