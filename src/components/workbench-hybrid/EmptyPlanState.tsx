"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { FONT, WB } from "./theme";
import type { WorkbenchRole } from "./types";

type Props = {
  role: WorkbenchRole;
};

export function EmptyPlanState({ role }: Props): ReactElement {
  const isCoach = role === "coach";
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <CalendarPlus size={32} strokeWidth={1.5} style={{ color: WB.muted3 }} aria-hidden />
      <p
        style={{
          margin: 0,
          fontFamily: FONT.display,
          fontSize: 18,
          fontWeight: 700,
          color: WB.text,
        }}
      >
        Ingen økter denne uka
      </p>
      <p style={{ margin: 0, fontSize: 13.5, color: WB.muted, maxWidth: 360, lineHeight: 1.5 }}>
        {isCoach
          ? "Dra en standardøkt inn i ukeplanen, eller bruk AI-plan for å fylle uka."
          : "Dra en standardøkt inn i ukeplanen, eller be coachen om en publisert plan."}
      </p>
      {!isCoach && (
        <Link
          href="/portal/mal"
          style={{
            marginTop: 4,
            fontFamily: FONT.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: WB.lime,
            textDecoration: "none",
          }}
        >
          Se mål →
        </Link>
      )}
    </div>
  );
}