"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ · Book direkte med coach — v2 (retning C «Presis»).
 * v2-port 17. juli 2026 (Team G-B): erstatter legacy-siden i (legacy)/booking/
 * coach/[coachId]. Ren presentasjon av EKTE coach-data (navn, ambition, e-post,
 * felles økter, aktive tjenester). Siden er et inngangspunkt: alle CTA-er
 * lenker til den ekte booking-wizarden (/portal/booking/ny) med tjeneste
 * forhåndsvalgt — hrefs og pristekster bygges i page.tsx (uendret logikk).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Caps, Tittel, Kort, Rad, MikroMeta, TomTilstand, AvatarInit } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

export type BookingCoachTjeneste = {
  id: string;
  navn: string;
  varighetMin: number;
  beskrivelse: string | null;
  /** «1 250 kr» eller «1 credit» — beregnet i page.tsx (samme regel som legacy). */
  prisTekst: string;
  /** Wizard-lenke med coachId + service forhåndsvalgt. */
  href: string;
};

export type BookingCoachV2Data = {
  navn: string;
  ambition: string | null;
  epost: string;
  /** Ekte antall delte coaching-økter mellom spiller og coach. */
  fellesOkter: number;
  tjenester: BookingCoachTjeneste[];
  /** Wizard-lenke med kun coachId forhåndsvalgt. */
  wizardHref: string;
  meldingHref: string;
  /** true når innlogget bruker har GRATIS-tier (booking krever Pro). */
  visProKrav: boolean;
};

/** true på klient etter mount når viewport < 768px (styrer kun tetthet). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

export function BookingCoachV2({ data }: { data: BookingCoachV2Data }) {
  const mobile = useMobile();
  const fornavn = data.navn.split(" ")[0];

  return (
    <div data-paper-portal-booking-coach data-paper-slug="playerhq-booking-mine" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hero */}
      <Kort pad={mobile ? "22px 20px" : "28px 30px"}>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 18 : 28, alignItems: mobile ? "flex-start" : "center" }}>
          <AvatarInit navn={data.navn} size={mobile ? 64 : 84} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Caps>Coach · AK Golf Academy</Caps>
            <div style={{ marginTop: 8 }}>
              <Tittel mobile={mobile}>{data.navn}</Tittel>
            </div>
            {data.ambition && (
              <p style={{ fontFamily: TL.font.sans, fontSize: 13.5, lineHeight: 1.55, color: TL.mute, margin: "10px 0 0", maxWidth: 560 }}>
                {data.ambition}
              </p>
            )}
          </div>
          <div style={{ flex: "none", background: `${TL.dim}, ${TL.dock}`, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: "14px 18px", minWidth: mobile ? undefined : 180 }}>
            <Caps size={9}>Felles økter</Caps>
            <div style={{ fontFamily: TL.font.mono, fontSize: 30, fontWeight: 700, color: TL.text, lineHeight: 1, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
              {data.fellesOkter}
            </div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, marginTop: 6 }}>Mellom deg og {fornavn}</div>
          </div>
        </div>
      </Kort>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 340px", gap: 16, alignItems: "start" }}>
        {/* Tjenester — ekte ServiceType-rader */}
        <Kort eyebrow="Velg type økt">
          {data.tjenester.length === 0 ? (
            <TomTilstand
              icon="calendar"
              title="Ingen bookbare tjenester"
              sub={`${fornavn} har ingen bookbare tjenester akkurat nå. Send en melding for å avtale en time.`}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {data.tjenester.map((s, i) => (
                <Link key={s.id} href={s.href} style={{ textDecoration: "none", color: "inherit" }}>
                  <Rad
                    leading={
                      <span style={{ width: 36, height: 36, flex: "none", borderRadius: 9999, background: TL.dock, border: `1px solid ${TL.hair}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="clock" size={15} style={{ color: TL.mute }} />
                      </span>
                    }
                    title={`${s.navn} · ${s.varighetMin} min`}
                    sub={s.beskrivelse ?? undefined}
                    meta={
                      <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {s.prisTekst}
                      </span>
                    }
                    last={i === data.tjenester.length - 1}
                    onClick={() => {}}
                  />
                </Link>
              ))}
            </div>
          )}
        </Kort>

        {/* Høyre: inngang til den ekte booking-flyten */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Kort eyebrow={`Book med ${fornavn}`}>
            <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, lineHeight: 1.55, color: TL.mute, margin: 0 }}>
              Velg type økt, eller gå rett til booking for å se ledige tider og bekrefte.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
              <Link href={data.wizardHref} style={{ textDecoration: "none", display: "block" }}>
                <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
            borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Velg tid og bekreft</span>
              </Link>
              <Link href={data.meldingHref} style={{ textDecoration: "none", display: "block" }}>
                <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
            borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Send melding i stedet</span>
              </Link>
            </div>
            <div style={{ marginTop: 12 }}>
              <MikroMeta icon="shield">Gratis avbestilling 24 t før</MikroMeta>
            </div>
          </Kort>

          {data.visProKrav && (
            <Kort tint>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Icon name="lock" size={15} style={{ color: TL.fill, flex: "none", marginTop: 2 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 700, color: TL.text }}>Booking krever Pro</div>
                  <p style={{ fontFamily: TL.font.sans, fontSize: 12, lineHeight: 1.5, color: TL.mute, margin: "4px 0 0" }}>
                    Oppgrader for å bruke forhåndsbetalte timer mot coach.
                  </p>
                  <Link href="/portal/meg/abonnement" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontFamily: TL.font.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.fill, textDecoration: "none" }}>
                    Oppgrader til Pro
                    <Icon name="chevron-right" size={12} />
                  </Link>
                </div>
              </div>
            </Kort>
          )}

          <Kort eyebrow="Kontakt">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 28, height: 28, flex: "none", borderRadius: 8, background: TL.dock, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="mail" size={13} style={{ color: TL.fill }} />
              </span>
              <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text, wordBreak: "break-all" }}>{data.epost}</span>
            </div>
          </Kort>
        </div>
      </div>
    </div>
  );
}
