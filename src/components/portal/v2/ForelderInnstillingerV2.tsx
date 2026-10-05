"use client";

/**
 * Foreldreportal · Innstillinger.
 * Varselbryterne er fortsatt bare lokale. Det finnes ingen lagring ennå.
 * Historisk sitering: designsystem/train-lock/FO-06 Innstillinger.dc.html og FO-06L Innstillinger lys.dc.html.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FoSkjerm, FoHode, FoCaps, FoRad, FoToggle, FoAvatar, FoCtaSekundar, FoFotnote, FoTom } from "@/components/forelder/fo-presisjon";

export interface ForelderInnstillingerBarn { id: string; navn: string; relasjon: string }
export interface ForelderInnstillingerData {
  navn: string;
  epost: string;
  telefon: string | null;
  avatarUrl: string | null;
  barn: ForelderInnstillingerBarn[];
}

const VARSEL_TYPER = [
  { key: "plan", tittel: "Endringer i plan", beskrivelse: "Når coachen flytter eller avlyser en økt" },
  { key: "ukerapport", tittel: "Ukerapport", beskrivelse: "Sammendrag hver mandag morgen" },
  { key: "betaling", tittel: "Betalinger", beskrivelse: "Når en faktura forfaller" },
  { key: "turnering", tittel: "Turneringer", beskrivelse: "Påminnelse dagen før" },
];

function relasjonTekst(relasjon: string): string {
  const r = relasjon.trim();
  return r.length > 0 ? r : "Foresatt";
}

export function ForelderInnstillingerV2({ data }: { data: ForelderInnstillingerData }) {
  const router = useRouter();
  const { navn, epost, barn } = data;
  const fornavn = navn.split(" ")[0] ?? navn;
  const [varsler, setVarsler] = useState<Record<string, boolean>>({ plan: true, ukerapport: true, betaling: true, turnering: false });

  return (
    <FoSkjerm>
      <FoHode caps={`Forelder · ${fornavn}`} tittel="Innstillinger" under={epost} />
      <FoCaps>Varsler</FoCaps>
      {VARSEL_TYPER.map((v) => (
        <FoRad
          key={v.key}
          title={v.tittel}
          sub={v.beskrivelse}
          right={<FoToggle on={varsler[v.key] ?? false} onChange={(på) => setVarsler((s) => ({ ...s, [v.key]: på }))} label={v.tittel} />}
        />
      ))}
      <FoCaps>Koblede barn</FoCaps>
      {barn.length === 0 ? (
        <FoTom tittel="Ingen barn er koblet ennå" sub="Coachen sender invitasjon når barnet er registrert i klubben." />
      ) : (
        barn.map((b) => {
          const barnFornavn = b.navn.split(" ")[0] ?? b.navn;
          return (
            <button key={b.id} type="button" className="fo-kort fo-person" onClick={() => router.push(`/forelder/barn/${b.id}`)}>
              <FoAvatar navn={barnFornavn} />
              <div>
                <p className="fo-navn">{barnFornavn}</p>
                <p className="fo-meta">{relasjonTekst(b.relasjon)} · full lesetilgang</p>
              </div>
              <span className="fo-meta">Endre</span>
            </button>
          );
        })
      )}
      <FoCtaSekundar onClick={() => router.push("/auth/login")}>Logg ut</FoCtaSekundar>
      <FoFotnote>Lesetilgang gjelder plan, oppmøte og betaling. Analyse og samtaler er ikke tilgjengelig for foresatte.</FoFotnote>
    </FoSkjerm>
  );
}
