"use client";

/* AK Golf HQ — MARKEDSSIDE: Kvittering (/booking/kvittering/[bookingId] —
   Stripe success_url lander her). Train-lock LYS (29.08.2026) — restyling av
   v2-porten fra 16. juli. BEVISST UENDRET: PENDING-pollingen (router.refresh
   hvert 3. sek, maks 10 forsøk), CONFIRMED-deteksjonen, signup-broen for
   gjester og all copy. Dato-/pris-formatering skjer i page.tsx (server,
   Europe/Oslo + Intl nb-NO NOK) — samme kilde som før. Kun visuelt:
   TL-tokens, BookingRamme (lys topplinje, ingen footer) i stedet for mørk
   MRamme. Fullført-merket er warm hake (TL.warm — aldri grønn). Én primær
   CTA: «Mine bestillinger»/«Opprett konto». Tokens: TL, aldri T. */

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { Icon, Kort, Caps } from "@/components/v2";
import { BookingRamme, BookingCta, Eyebrow, HeroT, Seksjon, useMobile } from "./booking-tl-ramme";

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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
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
        borderBottom: last ? "none" : `1px solid ${TL.hair}`,
      }}
    >
      <Caps size={9} style={{ flex: "none" }}>{label}</Caps>
      <span
        style={
          bold
            ? { fontFamily: TL.font.mono, fontSize: 20, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums", textAlign: "right" }
            : { fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 500, color: TL.text, textAlign: "right" }
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
    <BookingRamme waveId="marked-booking-kvittering">
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 20 : 28 }}>
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
          {bekreftet ? (
            <>
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: TL.radius.pill,
                  background: `color-mix(in srgb, ${TL.warm} 12%, transparent)`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Icon name="check-circle" size={26} style={{ color: TL.warm }} />
              </span>
              <Eyebrow>Bekreftet</Eyebrow>
              <HeroT mobile={mobile}>Takk for bestillingen</HeroT>
              <p style={{ fontFamily: TL.font.sans, fontSize: 15, color: TL.mute, lineHeight: 1.65, margin: "18px auto 0", maxWidth: 480 }}>
                Vi har sendt bekreftelse til <strong style={{ color: TL.text, fontWeight: 600 }}>{guestEmail ?? "din e-post"}</strong>. Vi
                gleder oss til å se deg!
              </p>
            </>
          ) : (
            <>
              <Caps size={11} style={{ marginBottom: 18 }}>Behandler</Caps>
              <HeroT mobile={mobile}>Behandler bestillingen…</HeroT>
              <p style={{ fontFamily: TL.font.sans, fontSize: 15, color: TL.mute, lineHeight: 1.65, margin: "18px auto 0", maxWidth: 480 }}>
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
            <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em", color: TL.text, marginBottom: 6 }}>
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
              <BookingCta href="/portal/meg/bookinger">
                Mine bestillinger
                <Icon name="arrow-right" size={14} />
              </BookingCta>
            ) : (
              <BookingCta href={signupHref}>
                Opprett konto
                <Icon name="arrow-right" size={14} />
              </BookingCta>
            )}
            <BookingCta ghost href="/booking">
              Book en til
            </BookingCta>
          </div>
          {!innlogget && (
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, textAlign: "center", margin: "16px 0 0" }}>
              Opprett gratis konto for å se og endre bestillingene dine.
            </p>
          )}
        </div>
      </Seksjon>
    </BookingRamme>
  );
}
