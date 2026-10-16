/**
 * Mer i AgencyOS (utkast-agencyos/mer.html, skjerm «Mer»).
 * Innganger til Booking · Grupper · Tester · Økonomi · Oppsett. Økonomi vises
 * bare for head coach (beslutninger.md §ØKONOMI BARE FOR HEAD COACH).
 * Ingen tall på kortene: utkastets tellere krever egne spørringer, og et tall
 * vises aldri uten kilde.
 */
import Link from "next/link";
import { CalendarCheck, ChevronRight, ClipboardCheck, Settings, Users, Wallet, type LucideIcon } from "lucide-react";
import { synligeMer, type AosMerId } from "@/lib/agencyos/precision-ia";

const INFO: Record<AosMerId, { ikon: LucideIcon; tekst: string }> = {
  booking: { ikon: CalendarCheck, tekst: "Bookinger, tjenester og priser" },
  grupper: { ikon: Users, tekst: "Grupper, årsplan og AK-stigen" },
  tester: { ikon: ClipboardCheck, tekst: "Testbatteri og tildelte tester" },
  okonomi: { ikon: Wallet, tekst: "Budsjett mot regnskap per tjeneste" },
  oppsett: { ikon: Settings, tekst: "Profil, team, GDPR og logger" },
};

export function MerSide({ erHeadCoach }: { erHeadCoach: boolean }) {
  return <div className="agn-s">
    <div className="topp"><div><div className="dato">AgencyOS</div><h1 className="tittel">Mer</h1></div></div>
    <div className="mer-grid">
      {synligeMer(erHeadCoach).map((m) => {
        const { ikon: I, tekst } = INFO[m.id];
        return <Link key={m.id} href={m.href} className="mer-kort">
          <span className="ikonboks"><I className="ikon" aria-hidden /></span>
          <span><b>{m.label}</b><span className="kilde">{tekst}</span></span>
          {m.bareHeadCoach ? <span className="laast">Bare head coach</span> : <ChevronRight className="ikon" aria-hidden />}
        </Link>;
      })}
    </div>
  </div>;
}
