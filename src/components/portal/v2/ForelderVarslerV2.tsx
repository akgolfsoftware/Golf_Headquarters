"use client";

/** Foreldreportal · Varsler. Lest-status finnes ikke i modellen og er ikke lagt til.
 * Historisk sitering: designsystem/train-lock/FO-10 Varsler.dc.html og FO-10L Varsler lys.dc.html.
 */

import { FoSkjerm, FoHode, FoRad, FoFotnote, FoTom } from "@/components/forelder/fo-presisjon";

export type ForelderVarsel = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  childFirstName: string;
  dato: string;
};

export type ForelderVarslerData = {
  email: string;
  parentName?: string;
  barn: { id: string; name: string; relationship: string }[];
  varsler: ForelderVarsel[];
};

export function ForelderVarslerV2({ data }: { data: ForelderVarslerData }) {
  const { parentName, barn, varsler } = data;
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";

  return (
    <FoSkjerm>
      <FoHode caps={`Forelder · ${fornavn}`} tittel="Varsler" under={`Siste ${varsler.length || 8} · alle koblede barn`} />
      {barn.length === 0 ? (
        <FoTom tittel="Ingen barn er koblet ennå" sub="Coachen sender invitasjon når barnet er registrert i klubben." />
      ) : varsler.length === 0 ? (
        <FoTom tittel="Ingen varsler ennå" sub="Endringer i plan, bookinger og betalinger dukker opp her." />
      ) : (
        <div>
          {varsler.map((v) => (
            <FoRad key={v.id} title={v.title} sub={[v.childFirstName, v.body, v.dato].filter(Boolean).join(" · ")} />
          ))}
        </div>
      )}
      <FoFotnote>Varsler vises i 90 dager. Du styrer hvilke typer du får under Innstillinger.</FoFotnote>
    </FoSkjerm>
  );
}
