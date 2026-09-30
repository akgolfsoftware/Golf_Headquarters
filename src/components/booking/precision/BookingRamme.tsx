/**
 * Delt ramme for de offentlige bookingflatene i Precision Athletics
 * (BK-01 til BK-03): topplinje med logo og «BOOKING», innhold i midtstilt spalte.
 * Tegning: Claude Design 7d7c2994, ui_kits/booking/screens/BK.jsx › Wrap.
 * Ingen hooks: kan brukes fra både server- og klientkomponenter.
 */
import Image from "next/image";
import type { ReactNode } from "react";
import { Meta } from "@/components/precision/pa";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import "@/styles/precision-bk.css";

export function BookingRamme({ smal, children }: { smal?: boolean; children: ReactNode }) {
  return (
    <div className={`pa-root bk-side${smal ? " bk-side--smal" : ""}`} data-design="precision-athletics">
      <header className="bk-topp">
        <div className="bk-topp__in">
          <Image className="bk-topp__logo bk-topp__logo--dag" src="/logos/logo-ak-golf-academy.svg" alt="AK Golf Academy" width={116} height={22} priority />
          <Image className="bk-topp__logo bk-topp__logo--natt" src="/logos/logo-ak-golf-academy-negative.svg" alt="AK Golf Academy" width={116} height={22} priority />
          <span className="bk-topp__fyll" />
          <Meta>BOOKING</Meta>
        </div>
      </header>
      <main className="bk-innhold">{children}</main>
    </div>
  );
}
