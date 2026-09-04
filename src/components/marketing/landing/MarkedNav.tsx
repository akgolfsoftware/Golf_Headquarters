"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

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

export function MarkedNav() {
  const [apen, setApen] = useState(false);
  const sti = usePathname() ?? "";
  const aktiv = LENKER.find((l) => sti === l.href || sti.startsWith(`${l.href}/`))?.href;

  return (
    <>
      <Toppnav
        lenker={LENKER}
        aktiv={aktiv}
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
