"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rescheduleBooking } from "@/app/portal/meg/bookinger/actions";
import { TL } from "@/lib/v2/train-lock";

import { Caps, Kort, Knapp } from "@/components/v2";

type Slot = {
  start: string;
  coachId: string;
  coachName: string;
};

type Props = {
  bookingId: string;
  slots: Slot[];
};

export function RescheduleSlotPicker({ bookingId, slots }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [valgt, setValgt] = useState<Slot | null>(null);

  function bekreft() {
    if (!valgt) return;
    setError(null);
    startTransition(async () => {
      try {
        await rescheduleBooking({
          bookingId,
          newStartIso: valgt.start,
          newCoachId: valgt.coachId,
        });
        router.push("/portal/meg/bookinger?ny=1");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Noe gikk galt.");
      }
    });
  }

  const perCoach = new Map<string, Slot[]>();
  for (const s of slots) {
    const arr = perCoach.get(s.coachId);
    if (arr) arr.push(s);
    else perCoach.set(s.coachId, [s]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Array.from(perCoach.entries()).map(([coachId, coachSlots]) => (
        <div key={coachId}>
          <Caps style={{ marginBottom: 8 }}>{coachSlots[0].coachName}</Caps>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
              gap: 8,
            }}
          >
            {coachSlots.map((s) => {
              const aktiv = valgt?.start === s.start;
              const klokke = new Date(s.start).toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <button
                  key={s.start}
                  type="button"
                  onClick={() => setValgt(s)}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    borderRadius: 11,
                    border: `1px solid ${aktiv ? "transparent" : TL.hair}`,
                    background: aktiv ? TL.fill : TL.elev,
                    color: aktiv ? TL.onFill : TL.text,
                    padding: "10px 8px",
                    fontFamily: TL.font.mono,
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {klokke}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {error && (
        <div
          role="alert"
          style={{
            borderRadius: 10,
            border: `1px solid color-mix(in srgb, ${TL.danger} 30%, transparent)`,
            background: `color-mix(in srgb, ${TL.danger} 10%, ${TL.elev})`,
            padding: "10px 12px",
            fontFamily: TL.font.sans,
            fontSize: 13,
            color: TL.danger,
          }}
        >
          {error}
        </div>
      )}

      <Kort>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.45, flex: 1, minWidth: 180 }}>
            {valgt
              ? `Valgt: ${new Date(valgt.start).toLocaleString("nb-NO", { dateStyle: "medium", timeStyle: "short" })} (${valgt.coachName})`
              : "Velg en tid over for å bekrefte byttet."}
          </p>
          <Knapp icon="check" onClick={bekreft} disabled={!valgt || pending}>
            {pending ? "Bytter …" : "Bekreft bytte"}
          </Knapp>
        </div>
      </Kort>
    </div>
  );
}
