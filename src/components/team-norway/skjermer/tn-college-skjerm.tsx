import Link from "next/link";
import { notFound } from "next/navigation";

import { brukerStatusOrd } from "@/lib/domain/bruker-status";
import { hentTnRangliste, hentTnSamlinger } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnDatoRad, TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnMangler, TnSkjermhode } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker, periode } from "./felles";

/**
 * TN-06 College og USA.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-06.
 *
 * Avvik:
 *   - Konferanse, klasse, WAGR og siste college-resultat er ikke registrert.
 *     Kortet viser skole og skoleår fra spillerprofilen, og brutto snitt fra
 *     registrerte starter.
 *   - Tilgjengelighet per samling og NCAA-kalenderen har ingen datamodell.
 *     Kommende samlinger vises, men hvem som kan stille, står ikke før det kan
 *     registreres.
 */

const tall = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const ER_COLLEGE = /college|university|universitet/i;

function Felt({ etikett, children, mono = false }: { etikett: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ minWidth: 0 }}>
      <TnEtikett style={{ fontSize: 10.5, letterSpacing: "0.14em" }}>{etikett}</TnEtikett>
      <div style={{ fontSize: mono ? 14.5 : 14, fontFamily: mono ? TN.font.mono : undefined, fontVariantNumeric: "tabular-nums", marginTop: 4, overflowWrap: "anywhere" }}>{children}</div>
    </div>
  );
}

export async function TnCollegeSkjerm() {
  const bruker = await hentSkjermbruker();
  const [data, samlingsdata] = await Promise.all([hentTnRangliste(bruker), hentTnSamlinger(bruker)]);
  if (!data) notFound();

  const spillere = data.rader.filter((s) => ER_COLLEGE.test(s.skole ?? ""));
  const naa = new Date().getTime();
  const kommende = (samlingsdata?.samlinger ?? []).filter((s) => s.endDate.getTime() >= naa).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()).slice(0, 5);

  return (
    <SkjermRamme aktiv="college" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode rute="/team-norway/college" tittel="College-gruppen" ingress="Landslagsspillere på college i USA. Hvem kan stille på samling, og hvem er bundet av college-kalenderen." />

      <TnFlate>
        <TnFlatehode tittel="Utøvere på college" merknad={`${spillere.length} ${spillere.length === 1 ? "spiller" : "spillere"}`} />
        {spillere.map((s) => (
          <div key={s.id} style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px", padding: "16px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "center" }}>
            <div style={{ flex: "1 1 280px", minWidth: 0, display: "flex", gap: 14, alignItems: "center" }}>
              <TnInitialer navn={s.navn} />
              <div style={{ minWidth: 0 }}>
                <Link href={`/team-norway/spiller/${s.id}`} style={{ fontSize: 15, fontWeight: 700, color: TN.textPrimary, overflowWrap: "anywhere" }}>{s.navn}</Link>
                <div style={{ fontSize: 13.5, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>{s.skole}</div>
              </div>
            </div>
            <div style={{ flex: "1 1 360px", minWidth: 0, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
              <Felt etikett="Skoleår">{s.skolear ?? "—"}</Felt>
              <Felt etikett="Brutto snitt" mono>{s.bruttoScore === null ? "—" : tall.format(s.bruttoScore)}</Felt>
              <Felt etikett="Status">{brukerStatusOrd(s.status)}</Felt>
            </div>
          </div>
        ))}
        {spillere.length === 0 ? <TnMangler>Ingen spillere har registrert college eller universitet i profilen. Skolen settes i spillerprofilen.</TnMangler> : null}
        <TnFotnote>Brutto snitt er ekte slag i alle registrerte starter. Konferanse, klasse og WAGR er ikke koblet til ennå.</TnFotnote>
      </TnFlate>

      <TnFlate>
        <TnFlatehode tittel="Kommende samlinger" merknad={`${kommende.length} neste`} />
        {kommende.map((s) => (
          <TnDatoRad key={s.id} dato={periode(s.startDate, s.endDate)} tittel={<Link href={`/team-norway/samlinger/${s.id}`} style={{ color: TN.textPrimary }}>{s.name}</Link>} tekst={s.location ?? "Sted ikke registrert"} />
        ))}
        {kommende.length === 0 ? <TnMangler>Ingen kommende samlinger er registrert.</TnMangler> : null}
        <TnFotnote>Hvem i college-gruppen som kan stille på hver samling, kan ikke registreres ennå. Avklar direkte med spilleren og college-treneren.</TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
