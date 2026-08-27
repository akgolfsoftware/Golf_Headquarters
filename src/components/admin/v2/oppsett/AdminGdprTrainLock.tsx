"use client";

/**
 * AgencyOS GDPR-kø — Train-lock (T13, 27.08.2026).
 *
 * Ingen egen fasit tegner GDPR-køen; mønster-port av Paper-versjonen
 * (`/admin/gdpr/page.tsx` inline JSX) med `tl-kit`-primitiver, samme
 * datakontrakt og SAMME server actions (`utforSletteforesporsel`,
 * `avvisForesporsel`) — designport, ikke funksjonsendring.
 *
 * PII-varsomhet (CLAUDE.md §Feilhåndtering): komponenten viser KUN de
 * feltene Paper-versjonen allerede viste (navn/e-post for bedt av/gjelder).
 * Ingen nye felt, ingen personnavn hardkodet i UI-tekst.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { TL } from "@/lib/v2/train-lock";
import { TlCaps, TlKnapp, TlKort, TlTilbake, TlTittel, TlTomTilstand } from "./tl-kit";

export interface AdminGdprRad {
  id: string;
  type: string;
  alder: number;
  forsinket: boolean;
  bedtAv: string;
  gjelder: string;
}

export interface AdminGdprData {
  rader: AdminGdprRad[];
}

export function AdminGdprTrainLock({
  data,
  utforSletteforesporsel,
  avvisForesporsel,
}: {
  data: AdminGdprData;
  utforSletteforesporsel: (formData: FormData) => Promise<void>;
  avvisForesporsel: (formData: FormData) => Promise<void>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <TlTilbake href="/admin/settings">Innstillinger</TlTilbake>
      <div>
        <TlCaps>System · Personvern</TlCaps>
        <div style={{ marginTop: 10 }}>
          <TlTittel>GDPR-kø</TlTittel>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 13, color: TL.mute, lineHeight: 1.5, maxWidth: "52ch" }}>
          Uløste innsyns- og slettekrav. Slettekrav må behandles innen én måned (art. 12 nr. 3).
        </p>
      </div>

      {data.rader.length === 0 ? (
        <TlKort>
          <TlTomTilstand icon="check" title="Ingen uløste forespørsler" sub="Nye innsyns- og slettekrav lander her." />
        </TlKort>
      ) : (
        data.rader.map((r) => (
          <TlKort key={r.id} pad="16px 18px">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  fontFamily: TL.font.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 8,
                  background: TL.dim,
                  color: TL.text,
                }}
              >
                {r.type}
              </span>
              <span
                style={{
                  fontFamily: TL.font.mono,
                  fontSize: 12,
                  fontWeight: r.forsinket ? 700 : 500,
                  color: r.forsinket ? TL.warn : TL.mute,
                }}
              >
                {r.alder} dager gammel
              </span>
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: TL.text, lineHeight: 1.5 }}>
              <div>
                <span style={{ color: TL.mute }}>Bedt av: </span>
                {r.bedtAv}
              </div>
              <div>
                <span style={{ color: TL.mute }}>Gjelder: </span>
                {r.gjelder}
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {r.type === "DELETE" && (
                <form action={utforSletteforesporsel}>
                  <input type="hidden" name="id" value={r.id} />
                  <TlKnapp type="submit" variant="fare">
                    Utfør sletting
                  </TlKnapp>
                </form>
              )}
              <form action={avvisForesporsel}>
                <input type="hidden" name="id" value={r.id} />
                <TlKnapp type="submit" variant="tertiaer">
                  Avvis
                </TlKnapp>
              </form>
            </div>
          </TlKort>
        ))
      )}
    </div>
  );
}
