import React from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Systemsidene i /team-wang uten trenermeny (designløftet 20.10.2026, canvas «WANG nøkkelskjermer» rad 11–14):
 * logo øverst, wang.no-gradient med ett stort ord, og et hvitt kort med forklaring og handlinger over kanten.
 * Brukes når brukeren ikke er (eller ennå ikke er) trener i WANG, så menyen gir ingen mening.
 */
export type WangSystemHandling = { tekst: string; href: string; primar?: boolean };

export function WangSystemside({
  merke,
  stort,
  tittel,
  children,
  fakta = [],
  handlinger = [],
}: {
  merke: string;
  stort: string;
  tittel: string;
  children?: React.ReactNode;
  fakta?: { etikett: string; tekst: React.ReactNode }[];
  handlinger?: WangSystemHandling[];
}) {
  return (
    <div className="wg-system">
      <header className="wg-system-topp">
        <Link href="/team-wang" aria-label="WANG Toppidrett">
          <Image src="/team-wang/wang-logo-horizontal.svg" alt="WANG Toppidrett" width={190} height={64} priority />
        </Link>
      </header>
      <div className="wg-system-flate" aria-hidden="true">
        <span className="wg-system-merke">{merke}</span>
        <span className="wg-system-stort">{stort}</span>
      </div>
      <main className="wg-system-innhold">
        <section className="wg-system-kort">
          <h1>{tittel}</h1>
          {children}
          {fakta.map((f) => (
            <div key={f.etikett} className="wg-system-fakta">
              <span>{f.etikett}</span>
              <p>{f.tekst}</p>
            </div>
          ))}
          {handlinger.length > 0 ? (
            <div className="wg-system-knapper">
              {handlinger.map((h) => (
                <Link key={h.href} href={h.href} className={`wg-btn ${h.primar ? "wg-btn-primary" : "wg-btn-secondary"}`}>
                  {h.tekst}
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

/**
 * Innlogget konto uten WANG-rolle (trener eller sportssjef i en WANG-gruppe). Før 20.10 fikk de «Siden finnes
 * ikke», som fikk det til å se ut som feil adresse. Viser hvilken konto som er logget inn og veien inn: en
 * invitasjonslenke fra sportssjefen, eller innlogging med en annen konto på /wang.
 */
export function WangIngenTilgang({ epost }: { epost?: string | null }) {
  return (
    <WangSystemside
      merke="WANG-trenerflaten"
      stort="Ingen tilgang"
      tittel="Kontoen din har ikke tilgang til WANG"
      fakta={[
        { etikett: "Hvem slipper inn", tekst: "Trenere og sportssjef ved WANG Toppidrett." },
        { etikett: "Er du trener ved WANG?", tekst: "Be sportssjefen om en invitasjonslenke. Den gjelder i sju dager." },
      ]}
      handlinger={[
        { tekst: "Logg inn med en annen konto", href: "/wang?next=%2Fteam-wang%2Fcoach", primar: true },
        { tekst: "Til AK Golf", href: "/admin" },
      ]}
    >
      <p className="wg-system-tekst">
        {epost ? (
          <>
            Du er logget inn som <b>{epost}</b>. Kontoen er ikke trener eller sportssjef i en WANG-gruppe.
          </>
        ) : (
          "Kontoen du er logget inn med er ikke trener eller sportssjef i en WANG-gruppe."
        )}
      </p>
    </WangSystemside>
  );
}
