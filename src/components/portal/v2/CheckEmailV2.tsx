/**
 * Sjekk e-posten (steg 3 i AU-02) i Precision Athletics. Tegning: Claude Design
 * 7d7c2994, ui_kits/konto/screens/AU-01-03.jsx › AU02 steg «Sjekk e-post».
 * Statisk venteskjerm etter registrering, samme lenkemål som før.
 */

import { MailCheck } from "lucide-react";
import { Ikon, KnappLenke, Meta } from "@/components/precision/pa";
import { AuthRamme, AuthHode, Stegrad, LenkeTekst } from "@/components/auth/precision/AuthPa";

export function CheckEmailV2({ natt }: { natt?: boolean } = {}) {
  return (
    <AuthRamme max={520} natt={natt}>
      <Stegrad aktiv={2} />
      <span style={{ color: "var(--text-primary)" }}><Ikon icon={MailCheck} size={32} /></span>
      <AuthHode
        tittel="Sjekk e-posten din"
        under="Vi har sendt en bekreftelseslenke til e-postadressen du registrerte deg med. Klikk på lenken for å aktivere kontoen."
      />
      <Meta>FANT DU DEN IKKE? SJEKK SØPPELPOST</Meta>
      <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
        Skrev du feil adresse? <LenkeTekst href="/auth/signup">Registrer deg på nytt</LenkeTekst>.
      </span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <KnappLenke href="/auth/login" variant="secondary">Tilbake til innlogging</KnappLenke>
      </div>
    </AuthRamme>
  );
}
