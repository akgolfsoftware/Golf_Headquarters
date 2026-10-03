import Link from "next/link";
import "@/styles/precision-athletics.css";

/**
 * BankID er ikke bygget. Siden sier det rett ut og sender tilbake til
 * vanlig innlogging. Ingen OAuth- eller BankID-kall.
 */
export function BankIDV2() {
  return (
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        <header>
          <p className="au-kicker">BankID · ikke tilgjengelig</p>
          <h1>Logg inn med BankID</h1>
          <p>
            BankID-pålogging kommer på plass etter beta-perioden. Bruk e-post,
            passord eller Google for nå.
          </p>
        </header>
        <Link href="/auth/login" className="pa-btn pa-btn--primary pa-btn--full">
          Tilbake til innlogging
        </Link>
      </div>
    </div>
  );
}
