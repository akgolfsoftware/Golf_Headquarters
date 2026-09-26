import { notFound } from "next/navigation";

import { hentTnTrenere } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnMangler, TnSkjermhode } from "../tn-flate";
import { tnRolleNavn } from "../tn-shell";
import { SkjermRamme, datoLang, hentSkjermbruker } from "./felles";

/**
 * TN-09 Fagapparat.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-09.
 * Erstatter den gamle trenerkatalogen (/team-norway/apparatet sender hit).
 *
 * Avvik fra designet, fordi dataene ikke finnes:
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
      <TnSkjermhode rute="/team-norway/fagapparat" tittel="Fagapparat" ingress="Hvem i trenerteamet som følger landslagsspillerne." />

      <TnFlate>
        <TnFlatehode tittel="Fagteam" merknad={`${data.rader.length} ${data.rader.length === 1 ? "person" : "personer"}`} />
        {data.rader.length === 0 ? <TnMangler>Ingen aktive trenere er registrert i Team Norway-gruppen.</TnMangler> : null}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 1, background: TN.navy100, border: data.rader.length ? `1px solid ${TN.navy100}` : "none", marginTop: data.rader.length ? 16 : 0 }}>
          {data.rader.map((rad) => (
            <article key={rad.user.id} style={{ background: TN.white, padding: "clamp(16px, 2vw, 20px)", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <TnInitialer navn={rad.user.name ?? "?"} storrelse={64} mork />
                <div style={{ minWidth: 0 }}>
                  <TnEtikett style={{ fontSize: 10.5, letterSpacing: "0.14em" }}>{tnRolleNavn(rad.role)} · {data.kontekst.gruppe.name}</TnEtikett>
                  <div style={{ fontFamily: TN.font.display, fontSize: 19, letterSpacing: "0.04em", color: TN.navy900, marginTop: 4, lineHeight: 1.2, overflowWrap: "anywhere" }}>{rad.user.name ?? "Navn mangler"}</div>
                  <div style={{ fontFamily: TN.font.mono, fontSize: 11.5, color: TN.textSecondary, marginTop: 6 }}>AKTIV SIDEN {datoLang(rad.joinedAt)}</div>
                </div>
              </div>
              {data.kontekst.kanAdministrere && rad.user.email ? (
                <a href={`mailto:${rad.user.email}`} style={{ display: "flex", alignItems: "center", minHeight: 44, borderTop: `1px solid ${TN.navy100}`, textDecoration: "none", color: TN.textPrimary, fontSize: 13.5, overflowWrap: "anywhere", minWidth: 0 }}>{rad.user.email}</a>
              ) : null}
            </article>
          ))}
        </div>
        <TnFotnote>Fagpersoner fra Olympiatoppen, oppfølgingsplan per spiller og samlingsrapporter kan ikke registreres ennå.</TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
