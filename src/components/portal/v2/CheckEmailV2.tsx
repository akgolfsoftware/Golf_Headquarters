import Link from "next/link";
import "@/styles/precision-athletics.css";

/**
 * Sjekk e-post etter registrering. Samme lenker som før: /auth/signup og
 * /auth/login. Tegningen sier at lenken varer i 24 timer. Det kravet er
 * ikke innført, fordi produktet ikke oppgir en slik frist.
 */
export function CheckEmailV2() {
  return (
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        <header>
          <p className="au-kicker">Bekreft e-post</p>
          <h1>Sjekk e-posten din</h1>
          <p>
            Vi har sendt en bekreftelseslenke til e-posten du registrerte deg
            med. Klikk på lenken for å aktivere kontoen din.
          </p>
        </header>
        <div className="au-tips">
          <p className="au-kicker">Fant du den ikke?</p>
          <p>
            Sjekk søppelpost-mappen, eller <Link href="/auth/signup">registrer deg på nytt</Link>.
          </p>
        </div>
        <Link href="/auth/login" className="pa-btn pa-btn--secondary pa-btn--full">
          Tilbake til innlogging
        </Link>
      </div>
    </div>
  );
}
