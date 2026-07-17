"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: Kvittering (/booking/kvittering/[bookingId],
   retning C «Presis»). v2-port 16. juli 2026 av (mlegacy)/booking/kvittering/
   [bookingId]/page.tsx + pending-refresh.tsx sitt presentasjonslag. BEVISST
   UENDRET: PENDING-pollingen (router.refresh hvert 3. sek, maks 10 forsøk —
   flyttet inn hit fra pending-refresh.tsx), CONFIRMED-deteksjonen, signup-
   broen for gjester og all copy. Dato-/pris-formatering skjer i page.tsx
   (server, Europe/Oslo + Intl nb-NO NOK) — samme kilde som før. Chrome:
   delt MRamme. */

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps } from "@/components/v2";
import { MRamme, Eyebrow, MCta, Seksjon, useMobile } from "./marked-ramme";

/* ── Datakontrakt (serialisert i page.tsx) ─────────────── */
export interface KvitteringDetaljer {
  bestillingRef: string; // «#»-suffiks av booking-id, formatert i page.tsx
  tjeneste: string;
  dato: string;
  klokkeslett: string; // «HH:mm (N min)»
  sted: string;
  prisTekst: string;
}

export interface MarkedBookingKvitteringV2Props {
  bekreftet: boolean;
  guestEmail: string | null;
  innlogget: boolean;
  signupHref: string;
  detaljer: KvitteringDetaljer;
}

/* ── Auto-refresher for PENDING (tidligere pending-refresh.tsx) ──
   Stripe-webhooken tar typisk 2–10 sek etter redirect. Poller
   router.refresh() hvert 3. sek inntil status blir CONFIRMED (komponenten
   forsvinner da fra DOM) eller etter maks 10 forsøk (~30 sek). */
function PendingRefresh() {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    const id = setInterval(() => {
      attempts++;
      router.refresh();
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(id);
      }
    }, 3000);

    return () => clearInterval(id);
  }, [router]);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontSize: 13, color: T.mut }}>
      <style>{`@keyframes v2BookSpin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion: reduce){.v2-book-spin{animation:none;}}`}</style>
      <Icon name="loader" size={14} className="v2-book-spin" style={{ animation: "v2BookSpin 1.2s linear infinite" }} />
      Oppdaterer automatisk…
    </span>
  );
}

function DetaljRad({ label, value, bold, last }: { label: string; value: ReactNode; bold?: boolean; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 14,
        padding: "11px 0",
        borderBottom: last ? "none" : `1px solid ${T.border}`,
      }}
    >
      <Caps size={9} style={{ flex: "none" }}>{label}</Caps>
      <span
        style={
          bold
            ? { fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums", textAlign: "right" }
            : { fontFamily: T.ui, fontSize: 13.5, fontWeight: 500, color: T.fg, textAlign: "right" }
        }
      >
        {value}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   M-BOOKING-KVITTERING (/booking/kvittering/[bookingId])
   ════════════════════════════════════════════════════════ */
export function MarkedBookingKvitteringV2({
  bekreftet,
  guestEmail,
  innlogget,
  signupHref,
  detaljer,
}: MarkedBookingKvitteringV2Props) {
  const mobile = useMobile();

  return (
    <MRamme mobile={mobile} aktiv="booking">
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 20 : 28 }}>
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
          {bekreftet ? (
            <>
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 9999,
                  background: `color-mix(in srgb, ${T.lime} 12%, transparent)`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Icon name="check-circle" size={26} style={{ color: T.lime }} />
              </span>
              <Eyebrow>Bekreftet</Eyebrow>
              <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 34 : 48, letterSpacing: "-0.035em", color: T.fg, margin: 0, lineHeight: 1.05 }}>
                <em style={{ fontStyle: "italic", color: T.lime }}>Takk</em> for bestillingen
              </h1>
              <p style={{ fontFamily: T.ui, fontSize: 15, color: T.fg2, lineHeight: 1.65, margin: "18px auto 0", maxWidth: 480 }}>
                Vi har sendt bekreftelse til <strong style={{ color: T.fg, fontWeight: 600 }}>{guestEmail ?? "din e-post"}</strong>. Vi
                gleder oss til å se deg!
              </p>
            </>
          ) : (
            <>
              <Caps size={11} style={{ marginBottom: 18 }}>Behandler</Caps>
              <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 34 : 48, letterSpacing: "-0.035em", color: T.fg, margin: 0, lineHeight: 1.05 }}>
                Behandler bestillingen…
              </h1>
              <p style={{ fontFamily: T.ui, fontSize: 15, color: T.fg2, lineHeight: 1.65, margin: "18px auto 0", maxWidth: 480 }}>
                Betalingen ser ut til å gå gjennom. Siden oppdaterer seg automatisk.
              </p>
              <div style={{ marginTop: 16 }}>
                <PendingRefresh />
              </div>
            </>
          )}
        </div>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <Kort pad="20px 22px 10px">
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, letterSpacing: "-0.015em", color: T.fg, marginBottom: 6 }}>
              Detaljer
            </div>
            <DetaljRad label="Bestilling" value={detaljer.bestillingRef} />
            <DetaljRad label="Tjeneste" value={detaljer.tjeneste} />
            <DetaljRad label="Dato" value={detaljer.dato} />
            <DetaljRad label="Klokkeslett" value={detaljer.klokkeslett} />
            <DetaljRad label="Sted" value={detaljer.sted} />
            <DetaljRad label="Pris" value={detaljer.prisTekst} bold last />
          </Kort>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            {innlogget ? (
              <MCta href="/portal/meg/bookinger" icon="arrow-right">
                Mine bestillinger
              </MCta>
            ) : (
              <MCta href={signupHref} icon="arrow-right">
                Opprett konto
              </MCta>
            )}
            <MCta ghost href="/booking">
              Book en til
            </MCta>
          </div>
          {!innlogget && (
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, textAlign: "center", margin: "16px 0 0" }}>
              Opprett gratis konto for å se og endre bestillingene dine.
            </p>
          )}
        </div>
      </Seksjon>
    </MRamme>
  );
}
