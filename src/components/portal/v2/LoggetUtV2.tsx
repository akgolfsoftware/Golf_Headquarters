import Link from "next/link";
import "@/styles/precision-athletics.css";

export type LoggetUtV2Props = {
  hjemHref?: string;
  loggInnHref?: string;
  marketingHref?: string;
  feedbackEpost?: string;
};

export function LoggetUtV2({
  hjemHref = "/",
  loggInnHref = "/auth/login",
  marketingHref = "/",
  feedbackEpost = "post@akgolf.no",
}: LoggetUtV2Props = {}) {
  return (
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks">
        <Link href={hjemHref} className="au-logo">AK Golf HQ</Link>
        <header>
          <p className="au-kicker">Logget ut</p>
          <h1>Du er logget ut</h1>
          <p>Din sesjon er avsluttet på denne enheten. Logg inn igjen når du er klar.</p>
        </header>
        <Link href={loggInnHref} className="pa-btn pa-btn--primary pa-btn--full">Logg inn på nytt</Link>
        <Link href={marketingHref} className="pa-btn pa-btn--secondary pa-btn--full">Tilbake til akgolf.no</Link>
        <p>Hadde du en god økt? Del feedback med oss på <a href={`mailto:${feedbackEpost}`}>{feedbackEpost}</a></p>
      </div>
    </div>
  );
}
