"use client";

import React, { useState, useRef } from "react";
import {
  type PH23BookingData,
  type PH23Service,
  type PH23MyBooking,
  formatKr,
  beregnTjenestePris,
  getSyntheticPH23Data,
} from "@/lib/portal-booking/ph23-booking-data";

export type PH23BookingProps = {
  initialData?: PH23BookingData;
  state?: "data" | "tom" | "laster" | "feil";
  onBookSuccess?: (bookingId: string) => void;
  onCancelBooking?: (bookingId: string) => Promise<boolean>;
  onRescheduleBooking?: (bookingId: string, day: string, t: string) => Promise<boolean>;
};

const STEPS = ["Tjeneste", "Tid", "Bekreft"];

export function PH23Booking({
  initialData,
  state = "data",
  onCancelBooking,
  onRescheduleBooking,
}: PH23BookingProps) {
  const isTom = state === "tom";
  const defaultData = initialData ?? getSyntheticPH23Data(isTom);

  const nextIdRef = useRef(1);
  const [step, setStep] = useState(0);
  const [svcId, setSvcId] = useState<string | null>(defaultData.services[0]?.id ?? null);
  const [dayIndex, setDayIndex] = useState(1);
  const [slot, setSlot] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<"Klipp" | "Kort">("Klipp");

  const [mineTimer, setMineTimer] = useState<PH23MyBooking[]>(isTom ? [] : defaultData.mine);
  const [doneBooking, setDoneBooking] = useState<PH23MyBooking | null>(null);

  // Sheet for flytting av time
  const [mvBooking, setMvBooking] = useState<PH23MyBooking | null>(null);
  const [mvDayIndex, setMvDayIndex] = useState(3);
  const [mvSlot, setMvSlot] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Dialog for avbestilling av time
  const [cxBooking, setCxBooking] = useState<PH23MyBooking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Toast-feedback
  const [toastMessage, setToastMessage] = useState<{ title: string; sub?: string } | null>(null);

  const showToast = (title: string, sub?: string) => {
    setToastMessage({ title, sub });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedService: PH23Service | undefined = defaultData.services.find((s) => s.id === svcId);
  const currentCard = isTom ? { ...defaultData.card, left: 0, total: 0 } : defaultData.card;
  const canUseClip = selectedService?.clip && currentCard.left > 0;
  const servicePrice = selectedService ? beregnTjenestePris(selectedService, defaultData.rate) : 0;

  const getServiceLabel = (serviceId: string) => {
    const s = defaultData.services.find((x) => x.id === serviceId);
    if (!s) return serviceId;
    return `${s.name} · ${s.min} min`;
  };

  const handleConfirm = () => {
    if (!selectedService || !slot) return;
    const dayStr = defaultData.days[dayIndex] ? defaultData.days[dayIndex].join(" ") : "I dag";
    const place = selectedService.id === "bay" ? "Bay 3 · Fredrikstad GK" : "Studio · Fredrikstad GK";
    const payText = canUseClip && payMethod === "Klipp" ? "Klipp" : formatKr(servicePrice);

    const generatedId = `b-new-${nextIdRef.current++}`;
    const newBooking: PH23MyBooking = {
      id: generatedId,
      svc: selectedService.id,
      svcName: `${selectedService.name} · ${selectedService.min} min`,
      day: dayStr,
      t: slot,
      place,
      status: "Bekreftet",
      pay: payText,
      coachName: selectedService.coach,
    };

    setMineTimer((prev) => [newBooking, ...prev]);
    setDoneBooking(newBooking);
    showToast("Timen er booket", `${selectedService.name} · ${dayStr} kl. ${slot}`);
  };

  const handleReset = () => {
    setDoneBooking(null);
    setStep(0);
    setSlot(null);
  };

  const handleDoReschedule = async () => {
    if (!mvBooking || !mvSlot) return;
    setIsRescheduling(true);
    const dayStr = defaultData.days[mvDayIndex] ? defaultData.days[mvDayIndex].join(" ") : "Ny dag";

    try {
      if (onRescheduleBooking) {
        await onRescheduleBooking(mvBooking.id, dayStr, mvSlot);
      }
      setMineTimer((prev) =>
        prev.map((b) => (b.id === mvBooking.id ? { ...b, day: dayStr, t: mvSlot } : b))
      );
      showToast("Timen er flyttet", `${dayStr} kl. ${mvSlot} · Coach har fått beskjed`);
      setMvBooking(null);
      setMvSlot(null);
    } catch {
      showToast("Kunne ikke flytte time", "Prøv igjen senere.");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleDoCancel = async () => {
    if (!cxBooking) return;
    setIsCancelling(true);

    try {
      if (onCancelBooking) {
        await onCancelBooking(cxBooking.id);
      }
      setMineTimer((prev) =>
        prev.map((b) => (b.id === cxBooking.id ? { ...b, status: "Avbestilt" } : b))
      );
      showToast("Timen er avbestilt", "Ingen klipp trekkes");
      setCxBooking(null);
    } catch {
      showToast("Kunne ikke avbestille", "Prøv igjen senere.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (state === "laster") {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Meg · Booking
          </span>
          <h1 style={{ font: "var(--type-title-m)", color: "var(--text-primary)", margin: "4px 0 0" }}>
            Book time
          </h1>
        </div>
        <div
          style={{
            padding: 32,
            background: "var(--surface-card)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border-hairline)",
            textAlign: "center",
            color: "var(--text-secondary)",
            font: "var(--type-body)",
          }}
        >
          Henter ledige tider …
        </div>
      </div>
    );
  }

  if (state === "feil") {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Meg · Booking
          </span>
          <h1 style={{ font: "var(--type-title-m)", color: "var(--text-primary)", margin: "4px 0 0" }}>
            Book time
          </h1>
        </div>
        <div
          style={{
            padding: 32,
            background: "var(--surface-card)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border-hairline)",
            color: "var(--text-primary)",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <span
              style={{
                font: "var(--type-meta)",
                background: "var(--surface-sunken)",
                color: "var(--signal)",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              FEIL 502 · KALENDER
            </span>
          </div>
          <h2 style={{ font: "var(--type-title-s)", margin: "0 0 8px" }}>
            Ledige tider kunne ikke hentes
          </h2>
          <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>
            Ingen timer er booket eller endret. Prøv igjen senere.
          </p>
        </div>
      </div>
    );
  }

  const currentDaySlots = defaultData.slots[dayIndex] || [];
  const mvDaySlots = defaultData.slots[mvDayIndex] || [];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: "var(--primary)",
            color: "var(--text-on-primary)",
            padding: "12px 20px",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-pop)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <span style={{ font: "600 14px/1.3 var(--font-sans)" }}>{toastMessage.title}</span>
          {toastMessage.sub && (
            <span style={{ font: "500 12px/1.2 var(--font-mono)", opacity: 0.9 }}>
              {toastMessage.sub.toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              font: "var(--type-meta)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Meg · Booking
          </span>
        </div>
        <h1
          style={{
            font: "var(--type-title-m)",
            color: "var(--text-primary)",
            margin: "4px 0 2px",
          }}
        >
          Book time
        </h1>
        <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>
          Privattime eller TrackMan-bay hos Fredrikstad GK.
        </p>
      </div>

      {/* Grid: Flyt venstre, Sidekolonne høyre */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Venstre / Hovedflyt */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stepper */}
          {!doneBooking && (
            <ol
              aria-label="Steg"
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 6,
              }}
            >
              {STEPS.map((n, i) => (
                <li
                  key={n}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      height: 4,
                      background: i <= step ? "var(--primary)" : "var(--surface-sunken)",
                      borderRadius: 2,
                    }}
                  />
                  <span
                    style={{
                      font: `${i === step ? "600" : "500"} 13px/1.2 var(--font-sans)`,
                      color: i === step ? "var(--text-primary)" : "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {i + 1} · {n}
                  </span>
                </li>
              ))}
            </ol>
          )}

          {/* Steg-innhold */}
          {doneBooking ? (
            /* Bekreftet fullført-kort */
            <div
              style={{
                padding: 20,
                background: "var(--surface-card)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-hairline)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    font: "var(--type-meta)",
                    background: "var(--surface-sunken)",
                    color: "var(--text-primary)",
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: "1px solid var(--border-hairline)",
                  }}
                >
                  Bekreftet
                </span>
                <span
                  style={{
                    font: "var(--type-meta)",
                    color: "var(--text-muted)",
                    letterSpacing: "0.06em",
                  }}
                >
                  SENDT TIL {defaultData.playerEmail.toUpperCase()}
                </span>
              </div>

              <div style={{ font: "var(--type-title-m)", color: "var(--text-primary)" }}>
                {doneBooking.svcName} · {doneBooking.day} kl. {doneBooking.t}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                  padding: "12px 0",
                  borderTop: "1px solid var(--border-hairline)",
                  borderBottom: "1px solid var(--border-hairline)",
                }}
              >
                <div>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", display: "block" }}>
                    Varighet
                  </span>
                  <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                    {selectedService?.min ?? 60} min
                  </span>
                </div>
                <div>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", display: "block" }}>
                    Sted
                  </span>
                  <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                    {doneBooking.place}
                  </span>
                </div>
                <div>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", display: "block" }}>
                    Coach
                  </span>
                  <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                    {selectedService?.coach ?? "Uten coach"}
                  </span>
                </div>
                <div>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", display: "block" }}>
                    Betaling
                  </span>
                  <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                    {doneBooking.pay}
                  </span>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", display: "block", marginTop: 2 }}>
                    {doneBooking.pay === "Klipp"
                      ? `${Math.max(0, currentCard.left - 1)} AV ${currentCard.total} KLIPP IGJEN ETTER TIMEN`
                      : "FAKTURERES ETTER TIMEN"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => showToast("Lagt i kalenderen", "ICS-fil lastet ned")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-card)",
                    color: "var(--text-primary)",
                    font: "500 14px/1 var(--font-sans)",
                    cursor: "pointer",
                  }}
                >
                  Legg i kalender
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius)",
                    border: "none",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    font: "500 14px/1 var(--font-sans)",
                    cursor: "pointer",
                  }}
                >
                  Book en til
                </button>
              </div>
            </div>
          ) : step === 0 ? (
            /* Steg 0: Velg Tjeneste */
            <div
              role="radiogroup"
              aria-label="Tjeneste"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))",
                gap: 8,
              }}
            >
              {defaultData.services.map((x) => {
                const on = x.id === svcId;
                const price = beregnTjenestePris(x, defaultData.rate);
                return (
                  <button
                    key={x.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSvcId(x.id)}
                    style={{
                      textAlign: "left",
                      padding: 16,
                      borderRadius: "var(--radius)",
                      border: "1px solid " + (on ? "var(--border-ink)" : "var(--border-hairline)"),
                      boxShadow: on ? "inset 0 0 0 1px var(--border-ink)" : "none",
                      background: "var(--surface-card)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      cursor: "pointer",
                      minWidth: 0,
                      color: "var(--text-primary)",
                    }}
                  >
                    <span style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                      <span style={{ font: "600 15px/1.3 var(--font-sans)", flex: 1 }}>{x.name}</span>
                      <span style={{ font: "600 15px/1 var(--font-mono)" }}>{formatKr(price)}</span>
                    </span>
                    <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                      {x.min} MIN{x.coach ? ` · ${x.coach.toUpperCase()}` : " · UTEN COACH"}
                      {x.clip ? " · 1 KLIPP" : ""}
                    </span>
                    {x.note && (
                      <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                        {x.note}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : step === 1 ? (
            /* Steg 1: Velg Tid */
            <div
              style={{
                padding: 16,
                background: "var(--surface-card)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-hairline)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                role="group"
                aria-label="Dag"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${defaultData.days.length || 1}, minmax(0, 1fr))`,
                  gap: 4,
                }}
              >
                {defaultData.days.map(([d, dt], i) => {
                  const on = i === dayIndex;
                  const count = (defaultData.slots[i] || []).length;
                  return (
                    <button
                      key={dt}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setDayIndex(i);
                        setSlot(null);
                      }}
                      style={{
                        height: 60,
                        borderRadius: "var(--radius)",
                        border: "1px solid " + (on ? "var(--border-ink)" : "var(--border-hairline)"),
                        background: on ? "var(--primary)" : "var(--surface-card)",
                        color: on ? "var(--text-on-primary)" : "var(--text-primary)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        cursor: "pointer",
                        minWidth: 0,
                      }}
                    >
                      <span style={{ font: "500 11px/1 var(--font-sans)" }}>{d}</span>
                      <span style={{ font: "600 14px/1 var(--font-mono)" }}>{dt.slice(0, 2)}</span>
                      <span style={{ font: "500 10px/1 var(--font-mono)", opacity: 0.75 }}>
                        {count ? `${count} LEDIG` : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {currentDaySlots.length ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {currentDaySlots.map((t) => {
                    const isSelected = slot === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSlot(t)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "var(--radius)",
                          border: "1px solid " + (isSelected ? "var(--border-ink)" : "var(--border-hairline)"),
                          background: isSelected ? "var(--primary)" : "var(--surface-sunken)",
                          color: isSelected ? "var(--text-on-primary)" : "var(--text-primary)",
                          font: "600 13px/1 var(--font-mono)",
                          cursor: "pointer",
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                  Ingen ledige tider {defaultData.days[dayIndex]?.join(" ") ?? ""}. Velg en annen dag.
                </p>
              )}
            </div>
          ) : (
            /* Steg 2: Bekreft oppsummering */
            <div
              style={{
                padding: 16,
                background: "var(--surface-card)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-hairline)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", display: "block" }}>
                    Tjeneste
                  </span>
                  <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                    {selectedService?.name} · {selectedService?.min} min
                  </span>
                </div>
                <div>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", display: "block" }}>
                    Tid
                  </span>
                  <span style={{ font: "600 14px/1.3 var(--font-mono)", color: "var(--text-primary)" }}>
                    {defaultData.days[dayIndex]?.join(" ")} kl. {slot}
                  </span>
                </div>
                <div>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", display: "block" }}>
                    Coach
                  </span>
                  <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                    {selectedService?.coach ?? "Uten coach"}
                  </span>
                </div>
                <div>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", display: "block" }}>
                    Pris
                  </span>
                  <span style={{ font: "600 14px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                    {formatKr(servicePrice)}
                  </span>
                </div>
              </div>

              {selectedService?.clip ? (
                <div style={{ paddingTop: 8, borderTop: "1px solid var(--border-hairline)" }}>
                  <div style={{ font: "var(--type-meta)", color: "var(--text-muted)", marginBottom: 8 }}>
                    Betaling
                  </div>
                  <div style={{ display: "inline-flex", gap: 4, background: "var(--surface-sunken)", padding: 3, borderRadius: 6 }}>
                    {(currentCard.left > 0 ? ["Klipp", "Kort"] : ["Kort"]).map((opt) => {
                      const on = payMethod === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setPayMethod(opt as "Klipp" | "Kort")}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 4,
                            border: "none",
                            background: on ? "var(--surface-card)" : "transparent",
                            color: "var(--text-primary)",
                            font: "500 13px/1.2 var(--font-sans)",
                            cursor: "pointer",
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <span
                    style={{
                      font: "var(--type-meta)",
                      color: "var(--text-muted)",
                      display: "block",
                      marginTop: 8,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {currentCard.left > 0
                      ? `${currentCard.left} AV ${currentCard.total} KLIPP IGJEN · GYLDIG TIL ${currentCard.valid}`
                      : "INGEN KLIPP IGJEN · BETALES MED KORT"}
                  </span>
                </div>
              ) : (
                <span
                  style={{
                    font: "var(--type-meta)",
                    color: "var(--text-muted)",
                    letterSpacing: "0.06em",
                  }}
                >
                  BETALES MED KORT ETTER TIMEN · KLIPPEKORT GJELDER BARE {currentCard.covers.toUpperCase()}
                </span>
              )}

              <span
                style={{
                  font: "var(--type-meta)",
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                }}
              >
                GRATIS AVBESTILLING FRAM TIL {defaultData.cancelHours} TIMER FØR
              </span>
            </div>
          )}

          {/* Neste / Tilbake knapper */}
          {!doneBooking && (
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "space-between",
                paddingTop: 8,
              }}
            >
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius)",
                  border: "none",
                  background: "transparent",
                  color: step === 0 ? "var(--text-muted)" : "var(--text-secondary)",
                  font: "500 14px/1 var(--font-sans)",
                  cursor: step === 0 ? "not-allowed" : "pointer",
                }}
              >
                Tilbake
              </button>

              {step < 2 ? (
                <button
                  type="button"
                  disabled={(step === 0 && !svcId) || (step === 1 && !slot)}
                  onClick={() => setStep(step + 1)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius)",
                    border: "none",
                    background: (step === 0 && !svcId) || (step === 1 && !slot) ? "var(--surface-sunken)" : "var(--primary)",
                    color: (step === 0 && !svcId) || (step === 1 && !slot) ? "var(--text-muted)" : "var(--text-on-primary)",
                    font: "500 14px/1 var(--font-sans)",
                    cursor: (step === 0 && !svcId) || (step === 1 && !slot) ? "not-allowed" : "pointer",
                  }}
                >
                  Neste: {STEPS[step + 1]}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius)",
                    border: "none",
                    background: "var(--primary)",
                    color: "var(--text-on-primary)",
                    font: "500 14px/1 var(--font-sans)",
                    cursor: "pointer",
                  }}
                >
                  Bekreft booking
                </button>
              )}
            </div>
          )}
        </div>

        {/* Høyre / Sidekolonne */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Kort 1: Klipp */}
          <div
            style={{
              padding: 16,
              background: "var(--surface-card)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-hairline)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  font: "var(--type-meta)",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {isTom ? "Klipp" : `Klipp · ${currentCard.pkg}`}
              </span>
              <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                {isTom ? "—" : `NYE KLIPP ${currentCard.resets}`}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ font: "var(--type-metric-l)", color: "var(--text-primary)" }}>
                {isTom ? "—" : currentCard.left}
              </span>
              <span style={{ font: "var(--type-body-s)", color: "var(--text-muted)" }}>
                {isTom ? "ingen klipp" : `av ${currentCard.total} klipp igjen`}
              </span>
            </div>

            {!isTom && currentCard.total > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${currentCard.total}, minmax(0, 1fr))`,
                  gap: 3,
                }}
                aria-hidden="true"
              >
                {Array.from({ length: currentCard.total }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      height: 8,
                      background: i < currentCard.total - currentCard.left ? "var(--surface-sunken)" : "var(--primary)",
                      borderRadius: 1,
                    }}
                  />
                ))}
              </div>
            )}

            <span
              style={{
                font: "var(--type-meta)",
                color: "var(--text-muted)",
                letterSpacing: "0.06em",
              }}
            >
              {currentCard.covers.toUpperCase()} ·{" "}
              {isTom
                ? "KLIPP FØLGER COACHING-PAKKENE PERFORMANCE (2 PER MÅNED) OG PERFORMANCE PRO (4 PER MÅNED)"
                : `${currentCard.total} PER MÅNED · BRUKT ${currentCard.total - currentCard.left} I PERIODEN`}
            </span>
          </div>

          {/* Kort 2: Mine timer */}
          <div
            style={{
              padding: "12px 16px",
              background: "var(--surface-card)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            <span
              style={{
                font: "var(--type-meta)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "block",
                paddingBottom: 4,
              }}
            >
              Mine timer
            </span>

            {mineTimer.length ? (
              mineTimer.map((m, i) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "12px 0",
                    borderTop: i ? "1px solid var(--border-hairline)" : "none",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span
                      style={{
                        font: "500 14px/1.3 var(--font-sans)",
                        color: "var(--text-primary)",
                        flex: "1 1 160px",
                      }}
                    >
                      {getServiceLabel(m.svc)}
                    </span>
                    <span
                      style={{
                        font: "var(--type-meta)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "var(--surface-sunken)",
                        color: m.status === "Avbestilt" ? "var(--text-muted)" : "var(--text-primary)",
                        border: "1px solid var(--border-hairline)",
                      }}
                    >
                      {m.status}
                    </span>
                  </div>

                  <span
                    style={{
                      font: "var(--type-meta)",
                      color: "var(--text-muted)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {m.day.toUpperCase()} KL. {m.t} · {m.place.toUpperCase()}
                  </span>

                  {m.status !== "Avbestilt" && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setMvBooking(m);
                          setMvSlot(null);
                        }}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "var(--radius)",
                          border: "1px solid var(--border-hairline)",
                          background: "var(--surface-card)",
                          color: "var(--text-primary)",
                          font: "500 12px/1 var(--font-sans)",
                          cursor: "pointer",
                        }}
                      >
                        Flytt time
                      </button>
                      <button
                        type="button"
                        onClick={() => setCxBooking(m)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "var(--radius)",
                          border: "none",
                          background: "transparent",
                          color: "var(--text-secondary)",
                          font: "500 12px/1 var(--font-sans)",
                          cursor: "pointer",
                        }}
                      >
                        Avbestill
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p
                style={{
                  margin: "4px 0 8px",
                  font: "var(--type-body-s)",
                  color: "var(--text-secondary)",
                }}
              >
                Ingen bookede timer.
              </p>
            )}
          </div>

          {/* Kort 3: Tidligere bookinger */}
          {!isTom && defaultData.past && defaultData.past.length > 0 && (
            <div
              style={{
                padding: "12px 16px",
                background: "var(--surface-card)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-hairline)",
              }}
            >
              <span
                style={{
                  font: "var(--type-meta)",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  display: "block",
                  paddingBottom: 4,
                }}
              >
                Tidligere bookinger
              </span>
              {defaultData.past.map((m, i) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    padding: "10px 0",
                    borderTop: i ? "1px solid var(--border-hairline)" : "none",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span
                      style={{
                        font: "500 14px/1.3 var(--font-sans)",
                        color: "var(--text-primary)",
                        flex: "1 1 160px",
                      }}
                    >
                      {getServiceLabel(m.svc)}
                    </span>
                    <span
                      style={{
                        font: "var(--type-meta)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "var(--surface-sunken)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Gjennomført
                    </span>
                  </div>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                    {m.day.toUpperCase()} KL. {m.t} · {m.ref}
                  </span>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-secondary)" }}>
                    {m.src.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sheet: Flytt time */}
      {mvBooking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mv-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            background: "var(--scrim-modal)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "var(--surface-card)",
              height: "100%",
              boxShadow: "var(--shadow-pop)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              overflowY: "auto",
            }}
          >
            <div>
              <span
                style={{
                  font: "var(--type-meta)",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Flytt time
              </span>
              <h2
                id="mv-title"
                style={{ font: "var(--type-title-s)", color: "var(--text-primary)", margin: "4px 0 0" }}
              >
                {getServiceLabel(mvBooking.svc)}
              </h2>
              <span
                style={{
                  font: "var(--type-meta)",
                  color: "var(--text-muted)",
                  display: "block",
                  marginTop: 6,
                }}
              >
                NÅ · {mvBooking.day.toUpperCase()} KL. {mvBooking.t}
              </span>
            </div>

            <div>
              <span
                style={{
                  font: "var(--type-meta)",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Velg ny dag
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {defaultData.days.map(([d, dt], i) => {
                  const on = mvDayIndex === i;
                  return (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => {
                        setMvDayIndex(i);
                        setMvSlot(null);
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "var(--radius)",
                        border: "1px solid " + (on ? "var(--border-ink)" : "var(--border-hairline)"),
                        background: on ? "var(--primary)" : "var(--surface-card)",
                        color: on ? "var(--text-on-primary)" : "var(--text-primary)",
                        font: "500 12px/1 var(--font-sans)",
                        cursor: "pointer",
                      }}
                    >
                      {d} {dt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span
                style={{
                  font: "var(--type-meta)",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Velg ny tid
              </span>
              {mvDaySlots.length ? (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {mvDaySlots.map((t) => {
                    const on = mvSlot === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMvSlot(t)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "var(--radius)",
                          border: "1px solid " + (on ? "var(--border-ink)" : "var(--border-hairline)"),
                          background: on ? "var(--primary)" : "var(--surface-sunken)",
                          color: on ? "var(--text-on-primary)" : "var(--text-primary)",
                          font: "600 13px/1 var(--font-mono)",
                          cursor: "pointer",
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                  INGEN LEDIGE TIDER
                </span>
              )}
            </div>

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8, paddingTop: 16 }}>
              <button
                type="button"
                disabled={!mvSlot || isRescheduling}
                onClick={handleDoReschedule}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: "var(--radius)",
                  border: "none",
                  background: !mvSlot || isRescheduling ? "var(--surface-sunken)" : "var(--primary)",
                  color: !mvSlot || isRescheduling ? "var(--text-muted)" : "var(--text-on-primary)",
                  font: "500 14px/1 var(--font-sans)",
                  cursor: !mvSlot || isRescheduling ? "not-allowed" : "pointer",
                }}
              >
                {isRescheduling
                  ? "Flytter time …"
                  : `Flytt til ${mvSlot ? `${defaultData.days[mvDayIndex]?.join(" ")} ${mvSlot}` : "valgt tid"}`}
              </button>
              <button
                type="button"
                onClick={() => setMvBooking(null)}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  borderRadius: "var(--radius)",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  font: "500 14px/1 var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Avbestill time */}
      {cxBooking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cx-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            background: "var(--scrim-modal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "var(--surface-card)",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow-pop)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h2
              id="cx-title"
              style={{ font: "var(--type-title-s)", color: "var(--text-primary)", margin: 0 }}
            >
              Avbestille timen?
            </h2>
            <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>
              {getServiceLabel(cxBooking.svc)} {cxBooking.day} kl. {cxBooking.t}. Mer enn{" "}
              {defaultData.cancelHours} timer til timen, så ingen klipp trekkes.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
              <button
                type="button"
                onClick={() => setCxBooking(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-card)",
                  color: "var(--text-primary)",
                  font: "500 14px/1 var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                Behold timen
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleDoCancel}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius)",
                  border: "none",
                  background: "var(--signal)",
                  color: "var(--text-on-primary)",
                  font: "500 14px/1 var(--font-sans)",
                  cursor: isCancelling ? "not-allowed" : "pointer",
                }}
              >
                {isCancelling ? "Avbestiller …" : "Avbestill"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
