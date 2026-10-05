/**
 * Ramme for offentlig booking i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/booking/screens/BK.jsx › Wrap og Steps). Toppmerke + «BOOKING», innhold
 * i én kolonne (maks 960 px, eller 640 px for smale sider), ingen bunnlinje.
 * Ingen menyskall: publikum er ikke innlogget.
 */
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { FeilTilstand, LasterTilstand, Meta } from "@/components/precision/pa";
import { TriangleAlert } from "lucide-react";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import "@/styles/precision-a4.css";
import "@/styles/precision-booking.css";

/* Merkets fonter lastes i markedslayouten som --font-ak-sans og --font-ak-mono
   (samme IBM Plex-familier). Precision leser --font-ibm-plex-*, så de kobles her. */
const FONT_BRO = {
  "--font-ibm-plex-sans": "var(--font-ak-sans, \"IBM Plex Sans\")",
  "--font-ibm-plex-mono": "var(--font-ak-mono, \"IBM Plex Mono\")",
} as CSSProperties;

export const BOOKING_STEG = ["Tjeneste", "Tid", "Deg", "Bekreft og betal"] as const;

export function BookingSteg({ na }: { na: number }) {
  return (
    <ol aria-label="Steg" className="bk-steg">
      {BOOKING_STEG.map((s, j) => (
        <li key={s} aria-current={j === na ? "step" : undefined} data-naa={j === na ? "" : undefined} data-ferdig={j < na ? "" : undefined}>
          <span className="bk-steg__nr">{j + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}

export function BookingSkall({ children, max = 960 }: { children: ReactNode; max?: number }) {
  return (
    <div className="pa-root" data-design="precision-athletics" style={{ ...FONT_BRO, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid var(--border-hairline)", background: "var(--surface-flat)" }}>
        <div className="bk-topp" style={{ maxWidth: max }}>
          <Image src="/logos/logo-ak-golf-academy.svg" alt="AK Golf Academy" width={116} height={22} style={{ height: 22, width: "auto" }} priority />
          <span style={{ flex: 1 }} />
          <Meta>BOOKING</Meta>
        </div>
      </header>
      <main className="bk-innhold" style={{ maxWidth: max }}>
        {children}
      </main>
    </div>
  );
}

export function BookingLaster({ tekst }: { tekst: string }) {
  return <BookingSkall><LasterTilstand text={tekst} /></BookingSkall>;
}

export function BookingFeil({ tittel, tekst, kode, retry }: { tittel: string; tekst: string; kode: string; retry?: ReactNode }) {
  return <BookingSkall><FeilTilstand icon={TriangleAlert} title={tittel} text={tekst} code={kode} retry={retry} /></BookingSkall>;
}
