/**
 * Undersidene til Innboks i Skrå-drakten (bølge 1, skissen §5 «Skjema»): lav topp med
 * golfsimulatoren, tilbakelenke og tittel, og innholdet i hvite kort under (SkraFlyt lav).
 * Brukes av E-postmaler (/admin/kommunikasjon) og Rediger e-postmal.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/agencyos-ny-cockpit.css";
import "@/styles/agencyos-ny-innboks.css";

export function AG04Underside({ tilbake, tittel, ingress, children }: {
  tilbake: { href: string; tekst: string };
  tittel: ReactNode;
  ingress?: ReactNode;
  children: ReactNode;
}) {
  return <div className="agn-s agn-skra ibx-skra">
    <SkraTopp lav etikett={typeof tittel === "string" ? tittel : undefined} bilde="/images/playerhq/slag-simulator.jpg" bildePosisjon="50% 40%"
      overlinje={<Link href={tilbake.href} className="ibx-tilbake-topp"><ArrowLeft className="ikon" aria-hidden />{tilbake.tekst}</Link>}
      tittel={tittel} ingress={ingress} />
    <SkraFlyt lav className="ibx-flyt">{children}</SkraFlyt>
  </div>;
}
