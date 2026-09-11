import Link from "next/link";
import type { ReactNode } from "react";
import type { TnTilgangRad, TnTilgangStatus } from "@/lib/domain/tn-tilgang";
import { TnAvatarInitialer, TnPille, TnRail, type TnMenyPunkt } from "./core";
import { TnDataTable } from "./tn-data-table";
import { TnRailMobil } from "./rail-mobil";
import styles from "./tn-tilgang-visning.module.css";

/**
 * TN-18, valgt Claw-pakke 10.09.2026.
 * Fasit: designsystem/team-norway/templates/tn-trenere-tilgang/TnTrenereTilgang.dc.html
 * Avvik:
 *   - Viser den faktiske Team Norway-gruppen; ingen oppdiktede undergrupper.
 *   - Ny trener/invitasjon er fortsatt en egen uferdig reise.
 *   - Tabell på bred skjerm, navngitte personrader og egen detalj på mobil.
 */
export type TnTilgangVisningsrad = TnTilgangRad & { status: TnTilgangStatus };

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
const meny: TnMenyPunkt[] = [
  { type: "overskrift", label: "Administrasjon" },
  { type: "lenke", label: "Trenere og tilgang", href: "/team-norway/tilgang", aktiv: true },
];

function Rolle({ rad }: { rad: TnTilgangVisningsrad }) {
  return <TnPille tone={rad.rolle === "COACH" ? "navy" : "nøytral"}>{rad.rolle === "COACH" ? "Trener" : "Hjelpetrener"}</TnPille>;
}

function Status({ rad }: { rad: TnTilgangVisningsrad }) {
  return <TnPille tone={rad.status === "AKTIV" ? "green" : "nøytral"}>{rad.status}</TnPille>;
}

function Periode({ rad }: { rad: TnTilgangVisningsrad }) {
  return <span className={styles.periode}>{dato.format(rad.joinedAt)} → {rad.endedAt ? dato.format(rad.endedAt) : "åpen"}</span>;
}

export function TnTilgangVisning({ brukerNavn, gruppeNavn, rader, valgtId, skjema }: {
  brukerNavn: string;
  gruppeNavn: string;
  rader: TnTilgangVisningsrad[];
  valgtId?: string;
  skjema?: ReactNode;
}) {
  const valgt = rader.find((rad) => rad.userId === valgtId);
  const lenke = (id: string) => `/team-norway/tilgang?valgt=${encodeURIComponent(id)}`;

  return (
    <div className={styles.skall}>
      <TnRail punkter={meny} bruker={{ navn: brukerNavn, rolle: "Sportssjef" }} orgNavn="Team Norway" orgUndertittel="Administrasjon" />
      <div className={styles.innhold}>
        <TnRailMobil punkter={meny} orgNavn="Team Norway" />
        <main className={styles.arbeidsflate} data-valgt={!!valgt || undefined}>
          <section className={styles.liste} aria-labelledby="tn-tilgang-tittel">
            <header>
              <p className={styles.oyenbryn}>Administrasjon · Tilgang</p>
              <h1 id="tn-tilgang-tittel" className={styles.tittel}>{rader.length} {rader.length === 1 ? "person" : "personer"} med tilgang</h1>
            </header>
            <div className={styles.forklaring}>
              <p><strong>Rollen settes per gruppe.</strong> Fjernes den siste gruppen, mister personen all tilgang — det finnes ingen tilgang uten gruppe.</p>
            </div>
            <div className={styles.bredListe}>
              <TnDataTable
                caption="Trenere og tilgang"
                kolonner={[
                  { key: "person", label: "Person" },
                  { key: "gruppe", label: "Grupper personen når" },
                  { key: "periode", label: "Aktiv periode" },
                  { key: "status", label: "Status", align: "right" },
                ]}
                rader={rader.map((rad) => ({
                  person: <Link href={lenke(rad.userId)} className={styles.personlenke} aria-current={rad.userId === valgtId ? "true" : undefined}>
                    <TnAvatarInitialer navn={rad.navn} size={34} />
                    <span className={styles.persontekst}><strong>{rad.navn}</strong><span className={styles.epost}>{rad.epost}</span></span>
                  </Link>,
                  gruppe: <div className={styles.gruppe}><span>{gruppeNavn}</span><Rolle rad={rad} /></div>,
                  periode: <Periode rad={rad} />,
                  status: <Status rad={rad} />,
                }))}
                highlightRow={valgt ? rader.indexOf(valgt) : undefined}
                empty="Ingen trenere har tilgang til Team Norway ennå."
              />
            </div>
            <div className={styles.mobilListe}>
              {rader.length === 0 ? <p className={styles.tom}>Ingen trenere har tilgang til Team Norway ennå.</p> : (
                <ul className={styles.personer}>
                  {rader.map((rad) => <li key={rad.userId}>
                    <Link href={lenke(rad.userId)} className={styles.personkort}>
                      <div className={styles.personhode}>
                        <TnAvatarInitialer navn={rad.navn} size={36} />
                        <span className={styles.persontekst}><strong>{rad.navn}</strong><span className={styles.epost}>{rad.epost}</span></span>
                      </div>
                      <div className={styles.gruppe}><span>{gruppeNavn}</span><Rolle rad={rad} /></div>
                      <div className={styles.radfot}><Periode rad={rad} /><Status rad={rad} /></div>
                    </Link>
                  </li>)}
                </ul>
              )}
            </div>
          </section>
          {valgt && (
            <section className={styles.detalj} aria-labelledby="tn-valgt-person">
              <Link href="/team-norway/tilgang" className={styles.tilbake}>Tilbake til trenerlisten</Link>
              <div className={styles.personhode}>
                <TnAvatarInitialer navn={valgt.navn} size={44} />
                <div className={styles.persontekst}>
                  <h2 id="tn-valgt-person" className={styles.personnavn}>{valgt.navn}</h2>
                  <span className={styles.epost}>{valgt.epost}</span>
                </div>
              </div>
              <Status rad={valgt} />
              {skjema}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
