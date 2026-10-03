/**
 * Faktura-detalj. Beløp, status og linjer kommer ferdig formatert fra siden.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { StatusPille } from "@/components/precision/pa";

export type MegFakturaData = {
  fakturaNr: string;
  /** Lang datoform, f.eks. «12. juni 2026». */
  fakturadato: string;
  forfallsdato: string;
  /** Kort datoform (dd.mm.åååå) til meta-flisene. */
  fakturadatoKort: string;
  forfallsdatoKort: string;
  fakturaId: string;
  beskrivelse: string;
  nettoKr: string;
  mvaKr: string;
  totalKr: string;
  erBetalt: boolean;
  statusLabel: string;
  /** Lang datoform for betalt-dato — null når fakturaen ikke er betalt. */
  betaltDato: string | null;
  transaksjonsId: string | null;
  navn: string | null;
  epost: string | null;
};

function statusTone(data: MegFakturaData): "neutral" | "ok" | "warn" | "signal" {
  if (data.erBetalt) return "ok";
  if (data.statusLabel === "Feilet") return "signal";
  if (data.statusLabel === "Refundert") return "neutral";
  return "warn";
}

export function MegFakturaV2({ data, handlinger }: { data: MegFakturaData; handlinger?: ReactNode }) {
  return (
    <div className="ph-flate">
      <Link href="/portal/meg/abonnement" className="ph-tilbake">Abonnement</Link>
      <header>
        <p>AK Golf · Faktura</p>
        <h1>Faktura #{data.fakturaNr}</h1>
        <p>
          <StatusPille tone={statusTone(data)}>{data.statusLabel}</StatusPille>
        </p>
      </header>

      <div className="ph-kpi">
        <p className="pa-card">
          <span>Total</span>
          <strong>{data.totalKr}</strong>
        </p>
        <p className="pa-card">
          <span>Status</span>
          <strong>{data.statusLabel}</strong>
        </p>
        <p className="pa-card">
          <span>Fakturadato</span>
          <strong>{data.fakturadatoKort}</strong>
        </p>
        <p className="pa-card">
          <span>Forfallsdato</span>
          <strong>{data.forfallsdatoKort}</strong>
        </p>
      </div>

      {handlinger}

      <section className="pa-card ph-kort">
        <p>Parter</p>
        <dl>
          <div>
            <dt>Fakturert til</dt>
            <dd>{data.navn ?? "—"}</dd>
          </div>
          {data.epost && (
            <div>
              <dt>E-post</dt>
              <dd>{data.epost}</dd>
            </div>
          )}
          <div>
            <dt>Fakturert fra</dt>
            <dd>AK Golf Academy AS</dd>
          </div>
        </dl>
      </section>

      <section className="pa-card ph-kort">
        <p>Datoer</p>
        <dl>
          <div>
            <dt>Fakturadato</dt>
            <dd>{data.fakturadato}</dd>
          </div>
          <div>
            <dt>Forfallsdato</dt>
            <dd>{data.forfallsdato}</dd>
          </div>
          <div>
            <dt>Faktura-ID</dt>
            <dd>{data.fakturaId}</dd>
          </div>
        </dl>
      </section>

      <section className="pa-card ph-kort">
        <p>Fakturalinjer</p>
        <dl>
          <div>
            <dt>Beskrivelse</dt>
            <dd>{data.beskrivelse}</dd>
          </div>
          <div>
            <dt>Antall</dt>
            <dd>1</dd>
          </div>
          <div>
            <dt>Stk-pris</dt>
            <dd>{data.nettoKr}</dd>
          </div>
          <div>
            <dt>MVA</dt>
            <dd>25 %</dd>
          </div>
          <div>
            <dt>Sum</dt>
            <dd>{data.nettoKr}</dd>
          </div>
          <div>
            <dt>Netto</dt>
            <dd>{data.nettoKr}</dd>
          </div>
          <div>
            <dt>MVA (25 %)</dt>
            <dd>{data.mvaKr}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{data.totalKr}</dd>
          </div>
        </dl>
      </section>

      {data.erBetalt && data.betaltDato && (
        <section className="pa-card ph-kort">
          <p>Betalt</p>
          <p>
            <strong>Betalt {data.betaltDato}</strong>
            {data.transaksjonsId && (
              <>
                . Transaksjons-ID <span>{data.transaksjonsId}</span>
              </>
            )}
            .
          </p>
        </section>
      )}

      <Link href="/portal/meg/abonnement" className="pa-btn pa-btn--primary pa-btn--full">
        Tilbake til abonnement
      </Link>
      <p>
        Spørsmål?{" "}
        <Link href="/portal/meg/help/kontakt">Kontakt support →</Link>
      </p>
    </div>
  );
}
