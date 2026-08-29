"use client";

/**
 * Foreldreportal · Varsler — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-10 Varsler.dc.html
 * (+ FO-10L Varsler lys.dc.html — lys/mørk gjøres av tokens).
 * De 8 nyeste varslene på tvers av barn, hairline-rader, nb-NO datoformat.
 * Fasitens «Merk alle som lest» er utelatt — lest-status finnes ikke i
 * datamodellen ennå (notert som fasit-avvik i PR-en).
 */

import {
  FoSkjerm,
  FoHode,
  FoRad,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-kit";

/* ── Datakontrakt (serialisert fra loader) ─────────────────────────── */

export type ForelderVarsel = {
  id: string;
  /** Notification.type — «MESSAGE» | «BOOKING» | «PAYMENT» | annet. */
  type: string;
  title: string;
  body: string | null;
  /** Barnets fornavn (avsender-kontekst). */
  childFirstName: string;
  /** Forhåndsformatert nb-NO dato («24.08.2026»). */
  dato: string;
};

export type ForelderVarslerData = {
  /** Forelderens e-post — der varsler sendes inntil push er på plass. */
  email: string;
  /** Forelderens navn (caps-linjen «Forelder · …»). */
  parentName?: string;
  /** Koblede barn (id + navn + relasjon). */
  barn: { id: string; name: string; relationship: string }[];
  /** Barnas nyeste varsler (inntil 8). */
  varsler: ForelderVarsel[];
};

export function ForelderVarslerV2({ data }: { data: ForelderVarslerData }) {
  const { parentName, barn, varsler } = data;
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";

  return (
    <FoSkjerm>
      <FoHode
        caps={`Forelder · ${fornavn}`}
        tittel="Varsler"
        under={`Siste ${varsler.length || 8} · alle koblede barn`}
      />

      {barn.length === 0 ? (
        <FoTom
          tittel="Ingen barn er koblet ennå"
          sub="Coachen sender invitasjon når barnet er registrert i klubben."
        />
      ) : varsler.length === 0 ? (
        <FoTom
          tittel="Ingen varsler ennå"
          sub="Endringer i plan, bookinger og betalinger dukker opp her."
        />
      ) : (
        <div style={{ marginTop: 6 }}>
          {varsler.map((v) => (
            <FoRad
              key={v.id}
              title={v.title}
              sub={[v.childFirstName, v.body, v.dato].filter(Boolean).join(" · ")}
            />
          ))}
        </div>
      )}

      <FoFotnote>
        Varsler vises i 90 dager. Du styrer hvilke typer du får under
        Innstillinger.
      </FoFotnote>
    </FoSkjerm>
  );
}
