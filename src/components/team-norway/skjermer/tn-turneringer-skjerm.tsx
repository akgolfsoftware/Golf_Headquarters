import { notFound } from "next/navigation";

import { hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { resultatKilde } from "@/lib/domain/turneringsresultat";
import { TnPille } from "../core";
import { TnFilterknapper, TnFlate, TnFotnote, TnHendelserad, TnMangler, TnSkjermhode } from "../tn-flate";
import { TnHandlingLenke } from "../tn-handlinger";
import { SkjermRamme, hentSkjermbruker, osloDag, periode, medDato } from "./felles";
import d from "./tn-daglig.module.css";

/**
 * TN-07 Turneringer og reise.
 * Fasit: docs/design-system/utkast-tn/daglig.html, skjerm Turneringer (pakke 2).
 *
 * Avvik:
 *   - Påmeldingsfrist og reise har ingen datamodell. Raden viser dato, sted,
 *     påmeldte, kilde og om turneringen pågår.
 *   - Filteret «Alle» er utelatt: kommende og gjennomførte dekker alt med dato.
 *   - Hver turnering åpnes på egen side (Anders 27.09.2026).
 */

type Visning = "kommende" | "fullforte";
const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"] as const;

export async function TnTurneringerSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const data = await hentTnTurneringer(bruker);
  if (!data) notFound();

  const visning: Visning = sokeparametre.vis === "fullforte" ? "fullforte" : "kommende";
  const naa = new Date().getTime();
  const slutt = (t: { startDate: Date; endDate: Date | null }) => (t.endDate ?? t.startDate).getTime() + 864e5;
  const daterte = medDato(data.turneringer);
  const utenDato = data.turneringer.filter((t) => t.startDate === null);
  const kommende = [...daterte.filter((t) => slutt(t) >= naa).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()), ...utenDato];
  const fullforte = daterte.filter((t) => slutt(t) < naa);
  const liste = visning === "kommende" ? kommende : fullforte;

  return (
    <SkjermRamme aktiv="turneringer" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode
        overlinje={data.kontekst.gruppe.name}
        tittel="Turneringer og reise"
        ingress="Mesterskap og kvalifiseringsturneringer, med datoer, påmeldte og resultater."
        handling={
          <>
            <TnFilterknapper
              etikett="Vis turneringer"
              valg={[
                { href: "/team-norway/turneringer", label: "Kommende", aktiv: visning === "kommende", antall: kommende.length },
                { href: "/team-norway/turneringer?vis=fullforte", label: "Gjennomført", aktiv: visning === "fullforte", antall: fullforte.length },
              ]}
            />
            {data.kontekst.erSpiller ? <TnHandlingLenke href="/team-norway/turneringer/ny" variant="sekundar">Legg inn turnering</TnHandlingLenke> : null}
          </>
        }
      />

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlate style={{ paddingBlock: 4 }}>
          {liste.map((t) => {
            const pameldte = t.entries.filter((e) => e.entryStatus !== "WITHDRAWN").length;
            const plasser = t.results.map((r) => r.position).filter((p): p is number => p !== null);
            const pagar = t.startDate !== null && t.startDate.getTime() <= naa && slutt({ startDate: t.startDate, endDate: t.endDate }) >= naa;
            const fra = t.startDate ? osloDag(t.startDate) : null;
            return (
              <TnHendelserad
                key={t.id}
                dag={fra ? String(fra.dag).padStart(2, "0") : "—"}
                maned={fra ? MND_KORT[fra.maned - 1] ?? "" : "dato"}
                href={`/team-norway/turneringer/${t.id}`}
                tittel={t.name}
                tekst={`${t.startDate ? `${periode(t.startDate, t.endDate ?? t.startDate)} · ` : ""}${t.location ?? "Sted ikke registrert"} · ${visning === "kommende" ? `${pameldte} påmeldt` : `${t.results.length} med resultat`} · ${resultatKilde(t.sourceOrigin)}`}
                hoyre={pagar ? <span className={d.puls}><i />Pågår</span> : plasser.length ? <TnPille>Beste plass {Math.min(...plasser)}</TnPille> : null}
              />
            );
          })}
          {liste.length === 0 ? <TnMangler>{visning === "kommende" ? "Ingen kommende turneringer er koblet til spillernes planer." : "Ingen gjennomførte turneringer med resultater er registrert."}</TnMangler> : null}
        </TnFlate>
        <TnFotnote>GolfBox-turneringer hentes hver mandag. Manuelle er lagt inn av spillerne selv. Resultater er brutto.</TnFotnote>
      </section>
    </SkjermRamme>
  );
}
