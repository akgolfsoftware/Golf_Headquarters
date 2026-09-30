/**
 * BankID (/auth/bankid) i Precision Athletics. Innloggingsflaten har BankID
 * som en «KOMMER»-rad i tegningen (Claude Design 7d7c2994, AU-01); denne siden
 * er stedet raden peker til. Placeholder: BankID kommer etter beta, og
 * knappen peker tilbake til vanlig innlogging.
 */

import { ArrowLeft, Fingerprint } from "lucide-react";
import { Ikon, KnappLenke, Meta } from "@/components/precision/pa";
import { AuthRamme, AuthHode } from "@/components/auth/precision/AuthPa";

export function BankIDV2({ natt }: { natt?: boolean } = {}) {
  return (
    <AuthRamme natt={natt}>
      <span style={{ color: "var(--text-primary)" }}><Ikon icon={Fingerprint} size={32} /></span>
      <Meta>BANKID · KOMMER ETTER BETA</Meta>
      <AuthHode tittel="Logg inn med BankID" under="BankID kommer etter beta-perioden. Bruk e-post og passord eller Google for nå." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <KnappLenke href="/auth/login" icon={ArrowLeft}>Tilbake til innlogging</KnappLenke>
      </div>
    </AuthRamme>
  );
}
