"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Knapp, Mobilmeny, Toppnav, type Lenke } from "@/components/marketing/ak";

/**
 * MarkedNav — ENESTE header på landingssidene.
 *
 * Fasit: `Toppnav` + `Mobilmeny` i AK Golf-masteren, brukt slik
 * `designsystem/ak-golf/ui_kits/markedsside/Deler.jsx` bruker dem. Fem
 * lenker og ÉN handling — «Book kartleggingsøkt» — som gjentas med samme ord
 * i toppnav, hero og avslutning (kitets README). «Logg inn» ligger i bunnen,
 * ikke her: menyen skal selge én ting.
 */

const LENKER: Lenke[] = [
  { href: "/coaching", tekst: "Coaching" },
  { href: "/junior", tekst: "Junior" },
  { href: "/priser", tekst: "Priser" },
  { href: "/om-oss", tekst: "Om oss" },
  { href: "/kontakt", tekst: "Kontakt" },
];

/** Samme brekkpunkt som `md:hidden` på menyen og hamburgeren (--ak-bp-tablet). */
const MAC_BREKK = "(min-width: 768px)";

export function MarkedNav() {
  const [apen, setApen] = useState(false);
  const sti = usePathname() ?? "";
  const aktiv = LENKER.find((l) => sti === l.href || sti.startsWith(`${l.href}/`))?.href;

  // Menyen og hamburgeren skjules av CSS over 768 px. Passeres brekkpunktet
  // mens menyen er åpen (rotasjon, vindu dras), må tilstanden følge med —
  // ellers står rullelåsen igjen uten noen synlig knapp for å lukke.
  useEffect(() => {
    const mq = window.matchMedia(MAC_BREKK);
    const lukkVedMac = () => {
      if (mq.matches) setApen(false);
    };
    mq.addEventListener("change", lukkVedMac);
    return () => mq.removeEventListener("change", lukkVedMac);
  }, []);

  return (
    <>
      <Toppnav
        lenker={LENKER}
        aktiv={aktiv}
        menyApen={apen}
        handling={
          <Knapp storrelse="sm" href="/booking">
            Book kartleggingsøkt
          </Knapp>
        }
        onMeny={() => setApen(true)}
      />
      <Mobilmeny
        apen={apen}
        lenker={LENKER}
        aktiv={aktiv}
        onLukk={() => setApen(false)}
        handling={
          <Knapp fullBredde href="/booking" onClick={() => setApen(false)}>
            Book kartleggingsøkt
          </Knapp>
        }
      />
    </>
  );
}
