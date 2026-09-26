import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnDatoRad, TnFilterknapper, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnSkjermhode, TnStatusmerke } from "../tn-flate";
import { MANEDER, SkjermRamme, hentSkjermbruker, osloDag, periode } from "./felles";

/**
 * TN-07 Turneringer og reise.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-07.
 *
 * Avvik:
 *   - Filteret «Kun EM/VM-kvalifisering» er utelatt: turneringene har ikke
 *     noe felt som sier om de teller i uttaket.
 *   - Uttaksmøte, reiselogistikk og budsjett per utøver har ingen datamodell.
 *     Listen viser dato, sted, påmeldte og resultater som faktisk er registrert.
 */

type Visning = "kommende" | "fullforte";

export async function TnTurneringerSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const data = await hentTnTurneringer(bruker);
  if (!data) notFound();

  const visning: Visning = sokeparametre.vis === "fullforte" ? "fullforte" : "kommende";
  const naa = new Date().getTime();
  const slutt = (t: (typeof data.turneringer)[number]) => (t.endDate ?? t.startDate).getTime();
  const kommende = data.turneringer.filter((t) => slutt(t) >= naa).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const fullforte = data.turneringer.filter((t) => slutt(t) < naa);
  const liste = visning === "kommende" ? kommende : fullforte;

  const aar = osloDag(new Date()).aar;
  const perManed = MANEDER.map((navn, i) => ({ navn, turneringer: liste.filter((t) => { const d = osloDag(t.startDate); return d.aar === aar && d.maned === i + 1; }) }));

  return (
    <SkjermRamme aktiv="turneringer" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode
        rute="/team-norway/turneringer"
        tittel="Turneringer og reiselogistikk"
        ingress="Mesterskap og kvalifiseringsturneringer, med datoer, påmeldte og resultater."
        handling={data.kontekst.erSpiller ? (
          <Link href="/team-norway/turneringer/ny" style={{ minHeight: 44, padding: "0 16px", border: `1px solid ${TN.navy900}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.navy900, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>
            Legg inn turnering
          </Link>
        ) : undefined}
      />

      <TnFilterknapper
        etikett="Vis turneringer"
        valg={[
          { href: "/team-norway/turneringer", label: "Kommende", aktiv: visning === "kommende", antall: kommende.length },
          { href: "/team-norway/turneringer?vis=fullforte", label: "Fullførte", aktiv: visning === "fullforte", antall: fullforte.length },
        ]}
      />

      <TnFlate>
        <TnFlatehode tittel={`Sesongen ${aar}`} merknad={visning === "kommende" ? "Kommende" : "Fullførte"} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(max(84px, calc(100% / 12)), 1fr))", borderTop: `1px solid ${TN.navy100}`, borderLeft: `1px solid ${TN.navy100}`, marginTop: 16 }}>
          {perManed.map((m) => (
            <div key={m.navn} style={{ background: TN.white, borderRight: `1px solid ${TN.navy100}`, borderBottom: `1px solid ${TN.navy100}`, padding: "10px 8px 12px", minHeight: 96, display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
              <span style={{ fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.18em", color: TN.navy900 }}>{m.navn}</span>
              {m.turneringer.slice(0, 3).map((t) => (
                <span key={t.id} style={{ display: "block", fontSize: 11.5, lineHeight: 1.3, padding: "3px 5px", borderRadius: TN.radius.sm, background: TN.navy100, color: TN.navy900, overflowWrap: "anywhere" }}>{t.name}</span>
              ))}
              {m.turneringer.length > 3 ? <span style={{ fontFamily: TN.font.mono, fontSize: 11, color: TN.textSecondary }}>+{m.turneringer.length - 3} til</span> : null}
            </div>
          ))}
        </div>
      </TnFlate>

      <TnFlate>
        <TnFlatehode tittel={visning === "kommende" ? "Kommende turneringer" : "Fullførte turneringer"} merknad={`${liste.length} totalt`} />
        {liste.map((t) => {
          const pameldte = t.entries.filter((e) => e.entryStatus !== "WITHDRAWN").length;
          const plasseringer = t.results.map((r) => r.position).filter((p): p is number => p !== null);
          const beste = plasseringer.length ? Math.min(...plasseringer) : null;
          return (
            <TnDatoRad
              key={t.id}
              dato={periode(t.startDate, t.endDate ?? t.startDate)}
              datoBredde={104}
              tittel={t.name}
              tekst={`${t.location ?? "Sted ikke registrert"} · ${visning === "kommende" ? `${pameldte} på planen` : `${t.results.length} med resultat${beste !== null ? ` · beste plass ${beste}` : ""}`}`}
              hoyre={t.sourceOrigin === "MANUAL" ? <TnStatusmerke farge={TN.textSecondary}>Manuell</TnStatusmerke> : null}
            />
          );
        })}
        {liste.length === 0 ? <TnMangler>{visning === "kommende" ? "Ingen kommende turneringer er koblet til spillernes planer." : "Ingen fullførte turneringer med resultater er registrert."}</TnMangler> : null}
        <TnFotnote>Reiselogistikk, uttaksmøter og budsjett per utøver kan ikke registreres ennå. Resultater er brutto.</TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
