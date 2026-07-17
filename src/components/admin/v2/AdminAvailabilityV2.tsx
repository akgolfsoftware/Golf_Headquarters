"use client";

import Link from "next/link";
import { toast } from "sonner";
import { T, Caps, Tittel } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { SlotFormV2, type LocationOption } from "./AdminSlotFormV2";
import { AvailabilityWeekGridV2, type WeekWindow } from "./AdminAvailabilityWeekGridV2";
import { AvailabilityYearGanttV2, type YearWindow } from "./AdminAvailabilityYearGanttV2";

/**
 * AgencyOS — Tilgjengelighet (Gjennomføre · Tilgjengelighet), v2-port
 * 16. juli 2026. Erstatter AgPage/AgPageHead/agBtnClass med v2-primitiver.
 * Samme datagrunnlag (CoachAvailability projisert på valgt måned/uke/år) og
 * samme visnings-bytter (Måned/Uke-drag/År) uendret — kun presentasjonslaget
 * er nytt. Google Calendar-seksjonen (CalendarSyncSection) er urørt, rendres
 * av page.tsx under denne komponenten.
 */

export type Visning = "maaned" | "uke" | "aar";

export interface AvailabilitySlotRad {
  id: string;
  tidLabel: string;
  metaLabel: string;
  slukket: boolean;
  formInitial: {
    id: string;
    weekday: number | null;
    date: string | null;
    startTime: string;
    endTime: string;
    active: boolean;
    locationId: string | null;
    validFrom: string | null;
    validTo: string | null;
    recurrenceInterval: number | null;
  };
}

export interface AdminAvailabilityV2Data {
  visning: Visning;
  y: number;
  m: number;
  mndNavn: string;
  forrigeHref: string;
  nesteHref: string;
  celler: Array<{ dag: number | null; range: string | null; erIdag: boolean }>;
  locations: LocationOption[];
  ukeVinduer: WeekWindow[];
  aarsVinduer: YearWindow[];
  aarSwitchHref: string;
  aarForrigeHref: string;
  aarNesteHref: string;
  slots: AvailabilitySlotRad[];
}

function SynkKnappV2() {
  return (
    <button
      type="button"
      onClick={() => toast.info("Synkronisering skjer automatisk hvert 15. minutt")}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: T.fg, cursor: "pointer" }}
    >
      <Icon name="refresh-cw" size={14} />
      Synk
    </button>
  );
}

function VisningKnapp({ href, aktiv, children }: { href: string; aktiv: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex", alignItems: "center", height: 32, padding: "0 14px", borderRadius: 9999,
        background: aktiv ? T.lime : T.panel2, border: `1px solid ${aktiv ? "transparent" : T.border}`,
        color: aktiv ? T.onLime : T.fg, fontSize: 12.5, fontWeight: 600, textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

export function AdminAvailabilityV2({ data }: { data: AdminAvailabilityV2Data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <Caps>Gjennomføre · Tilgjengelighet</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="åpen for booking.">Din måned,</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut, margin: "10px 0 0", maxWidth: 620 }}>
            Sett tidsvinduer du er tilgjengelig, per anlegg. Grønne dager er åpne for spiller-booking. Du kan aldri være tilgjengelig to steder samtidig.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
          <SlotFormV2 locations={data.locations} triggerLabel="+ Nytt tidsvindu" />
          <SynkKnappV2 />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <VisningKnapp href="/admin/availability?v=maaned" aktiv={data.visning === "maaned"}>Måned</VisningKnapp>
        <VisningKnapp href="/admin/availability?v=uke" aktiv={data.visning === "uke"}>Uke (drag)</VisningKnapp>
        <VisningKnapp href={data.aarSwitchHref} aktiv={data.visning === "aar"}>År</VisningKnapp>
      </div>

      {data.visning === "uke" ? (
        <AvailabilityWeekGridV2 locations={data.locations} windows={data.ukeVinduer} />
      ) : data.visning === "aar" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
            <Link href={data.aarForrigeHref} aria-label="Forrige år" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, color: T.fg }}>
              <Icon name="chevron-left" size={15} />
            </Link>
            <Link href={data.aarNesteHref} aria-label="Neste år" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, color: T.fg }}>
              <Icon name="chevron-right" size={15} />
            </Link>
          </div>
          <AvailabilityYearGanttV2 year={data.y} windows={data.aarsVinduer} />
        </div>
      ) : (
        <div style={{ borderRadius: T.rCard, border: `1px solid ${T.border}`, background: T.panel, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>{data.mndNavn}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <Link href={data.forrigeHref} aria-label="Forrige måned" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, color: T.fg }}>
                <Icon name="chevron-left" size={15} />
              </Link>
              <Link href={data.nesteHref} aria-label="Neste måned" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, color: T.fg }}>
                <Icon name="chevron-right" size={15} />
              </Link>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
            {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((w) => (
              <span key={w} style={{ textAlign: "center", fontFamily: T.mono, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", color: T.mut }}>{w}</span>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {data.celler.map((c, i) => {
              if (c.dag == null) return <span key={`tom-${i}`} />;
              return (
                <div
                  key={c.dag}
                  style={{
                    display: "flex", flexDirection: "column", gap: 4, minHeight: 72, borderRadius: 10, padding: "8px 9px", textAlign: "left",
                    border: `1px solid ${c.range ? `color-mix(in srgb, ${T.up} 25%, transparent)` : T.border}`,
                    background: c.range ? `color-mix(in srgb, ${T.up} 8%, transparent)` : T.panel2,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{c.dag}</span>
                    {c.erIdag && <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.lime, boxShadow: `0 0 6px color-mix(in srgb, ${T.lime} 70%, transparent)` }} />}
                  </span>
                  {c.range ? (
                    <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.01em", color: T.up }}>{c.range}</span>
                  ) : (
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>—</span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 18 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: T.mut }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, border: `1px solid color-mix(in srgb, ${T.up} 25%, transparent)`, background: `color-mix(in srgb, ${T.up} 8%, transparent)` }} />
              Åpen for booking
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: T.mut }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, border: `1px solid ${T.border}`, background: T.panel2 }} />
              Ingen tid satt
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: T.mut }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.lime }} />
              I dag
            </span>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <Caps>Gjennomføre · Tilgjengelighet · Tidsvinduer</Caps>
          <h2 style={{ margin: "6px 0 0", fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>Dine tidsvinduer</h2>
        </div>
        {data.slots.length === 0 ? (
          <p style={{ fontSize: 13, color: T.mut, margin: 0 }}>Ingen tidsvinduer satt ennå. Klikk «Nytt tidsvindu» for å legge til.</p>
        ) : (
          <div style={{ borderRadius: T.rCard, border: `1px solid ${T.border}`, background: T.panel, overflow: "hidden" }}>
            {data.slots.map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 18px", borderTop: i ? `1px solid ${T.border}` : "none", opacity: s.slukket ? 0.6 : 1 }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{s.tidLabel}</span>{" "}
                  <span style={{ fontSize: 13, color: T.mut }}>{s.metaLabel}</span>
                </div>
                <SlotFormV2 locations={data.locations} triggerLabel="Endre" triggerVariant="lenke" initial={s.formInitial} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
