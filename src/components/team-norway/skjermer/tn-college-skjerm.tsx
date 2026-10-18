import Link from "next/link";
import { notFound } from "next/navigation";

import { brukerStatusOrd } from "@/lib/domain/bruker-status";
import { hentTnCollege, hentTnRangliste, hentTnSamlinger } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { initialer } from "../initialer";
import { TnDatoRad, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnSkjermhode } from "../tn-flate";
import { TnBaandListe, TnMarkor, TnSpillerrad } from "../tn-stall";
import { TnKnapperekke } from "../tn-handlinger";
import { COLLEGE_TEKST, TnCollegeSkjema, TnSlettCollege } from "../tn-redigering-skjema";
import { ER_COLLEGE, SkjermRamme, datoLang, hentSkjermbruker, periode } from "./felles";

/**
 * TN-06 College og USA.
 * Utkast 2, retning B (godkjent 16.10.2026): spillerrad med statusmarkør.
 * Fasit: docs/design-system/utkast-tn/spillere.html, skjerm College (pakke 3).
 *
 * Avvik:
 *   - Konferanse, klasse, WAGR og siste college-resultat er ikke registrert.
 *     Kortet viser skole og skoleår fra spillerprofilen, og brutto snitt fra
 *     registrerte starter.
 *   - Tilgjengelighet per samling og NCAA-kalenderen har ingen datamodell.
 *     Kommende samlinger vises, men hvem som kan stille, står ikke før det kan
 *     registreres.
 *   - Trener registrerer college, status og start per spiller (Anders 27.09.2026).
 *     Spillere med college i profilen står med profilens skole til de er registrert.
 */

const tall = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export async function TnCollegeSkjerm() {
  const bruker = await hentSkjermbruker();
  const [data, samlingsdata] = await Promise.all([hentTnRangliste(bruker), hentTnSamlinger(bruker)]);
  if (!data) notFound();

  const college = await hentTnCollege(bruker, data.kontekst);
  const spillere = data.rader.filter((s) => college.has(s.id) || ER_COLLEGE.test(s.skole ?? ""));
  const spillervalg = [...data.rader].sort((a, b) => a.navn.localeCompare(b.navn, "nb")).map((r) => ({ id: r.id, navn: r.navn }));
  const naa = new Date().getTime();
  const kommende = (samlingsdata?.samlinger ?? []).filter((s) => s.endDate.getTime() >= naa).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()).slice(0, 5);

  return (
    <SkjermRamme aktiv="college" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode overlinje={`College og USA · ${spillere.length} ${spillere.length === 1 ? "spiller" : "spillere"}`} tittel="College-gruppen" ingress="Landslagsspillere på college i USA. Hvem kan stille på samling, og hvem er bundet av college-kalenderen."
        handling={data.kontekst.kanAdministrere && spillervalg.length > 0 ? <TnCollegeSkjema spillere={spillervalg} knapp="Legg til college" /> : undefined}
      />

      <TnFlate>
        <TnFlatehode tittel="Utøvere på college" merknad={`${spillere.length} ${spillere.length === 1 ? "spiller" : "spillere"}`} />
        <TnBaandListe>
          {spillere.map((s) => {
            const reg = college.get(s.id);
            const statusTekst = reg ? COLLEGE_TEKST[reg.status] ?? reg.status : brukerStatusOrd(s.status);
            return (
              <div key={s.id} style={{ display: "grid", gap: 8 }}>
                <TnSpillerrad
                  href={`/team-norway/spiller/${s.id}/oversikt`}
                  status={reg || s.status === "ACTIVE" ? "folger" : "ikkedelt"}
                  initialer={initialer(s.navn)}
                  navn={s.navn}
                  fakta={[reg?.skole ?? s.skole, reg ? (reg.startDato ? `start ${datoLang(reg.startDato)}` : null) : s.skolear].filter(Boolean).join(" · ") || "Skole ikke registrert"}
                  verdi={s.bruttoScore === null ? "—" : tall.format(s.bruttoScore)}
                  verdiTekst="snitt brutto"
                  grunn={<TnMarkor status={reg || s.status === "ACTIVE" ? "folger" : "ikkedelt"}>{statusTekst}</TnMarkor>}
                />
                {reg?.notat ? <p style={{ margin: 0, fontSize: 13, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{reg.notat}</p> : null}
                {data.kontekst.kanAdministrere ? (
                  <TnKnapperekke>
                    <TnCollegeSkjema spillere={spillervalg} knapp={reg ? "Endre" : "Registrer"} variant="tekst" standard={{ spillerId: s.id, skole: reg?.skole ?? s.skole ?? "", status: reg?.status ?? "STUDERER", startDato: reg?.startDato ? reg.startDato.toISOString().slice(0, 10) : "", notat: reg?.notat ?? "" }} />
                    {reg ? <TnSlettCollege spillerId={s.id} navn={s.navn} /> : null}
                  </TnKnapperekke>
                ) : null}
              </div>
            );
          })}
        </TnBaandListe>
        {spillere.length === 0 ? <TnMangler>Ingen spillere er registrert med college ennå.</TnMangler> : null}
        <TnFotnote>Brutto snitt er ekte slag per runde i alle registrerte starter. Konferanse, klasse og WAGR er ikke koblet til ennå.</TnFotnote>
      </TnFlate>

      <TnFlate>
        <TnFlatehode tittel="Kommende samlinger" merknad={`${kommende.length} neste`} />
        {kommende.map((s) => (
          <TnDatoRad key={s.id} dato={periode(s.startDate, s.endDate)} tittel={<Link href={`/team-norway/samlinger/${s.id}`} style={{ color: TN.textPrimary, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{s.name}</Link>} tekst={s.location ?? "Sted ikke registrert"} />
        ))}
        {kommende.length === 0 ? <TnMangler>Ingen kommende samlinger er registrert.</TnMangler> : null}
        <TnFotnote>Hvem i college-gruppen som kan stille på hver samling, kan ikke registreres ennå. Avklar direkte med spilleren og college-treneren.</TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
