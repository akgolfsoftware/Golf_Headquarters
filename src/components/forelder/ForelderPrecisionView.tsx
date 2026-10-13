import Link from "next/link";

export interface ForelderPrecisionProps {
  spillerNavn: string;
  spillerAlder?: number;
  dagensOkt?: { tittel: string; tidspunkt: string; sted: string; trener: string } | null;
  ukensOkter?: Array<{ dag: string; tittel: string; tid: string; fullfort: boolean }>;
}

/** Eldre katalog-port uten persondata eller simulerte lagringshandlinger.
 *  Den ekte portalen velger barn fra godkjente foreldrerelasjoner. */
export function ForelderPrecisionView(_props: ForelderPrecisionProps) {
  return (
    <section className="pa-root fo-ramme">
      <header className="fo-header">
        <p className="fo-eyebrow">Forelder</p>
        <h1>Følg barnets plan</h1>
        <p>Åpne portalen for godkjent barnevalg, bookinger, registrerte samtykker og økonomi.</p>
      </header>
      <Link href="/forelder" className="pa-btn pa-btn--primary">Åpne foreldreportalen</Link>
    </section>
  );
}
