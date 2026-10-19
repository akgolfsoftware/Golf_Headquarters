"use client";

/**
 * FO-06 Varsler — Precision Athletics, i ForelderSkall.
 * Fasit: docs/design-system/utkast-flater/forelder.html, mal «innstillinger».
 * Lest-status finnes ikke i modellen og er ikke lagt til.
 *
 * Avvik:
 *   - Viser bare ekte data. Tall og navn i utkastet er eksempler.
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

export function FO06Varsler({ data }: { data: ForelderVarslerData }) {
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
