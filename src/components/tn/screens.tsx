import { TN_ACCESS_DENIAL, canAccessScreen, type Role, type TnScreen } from "@/lib/tn/access";
import { SCREEN_TITLES } from "@/lib/tn/nav";
import type { Tilstand } from "./frame-key";
import { FasitCanvas, hasFasit } from "./fasit";

export function TnScreenBody({
  id,
  role,
  tilstand = "suksess",
}: {
  id: TnScreen;
  role: Role;
  userId: string;
  onOpen: (id: TnScreen) => void;
  tilstand?: Tilstand;
}) {
  if (!canAccessScreen(role, id)) {
    return (
      <div style={{ padding: 28, maxWidth: 640 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-micro)",
            letterSpacing: "var(--tracking-eyebrow)",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          Ingen tilgang
        </div>
        <h1
          style={{
            fontSize: "var(--text-h1)",
            color: "var(--navy-900)",
            letterSpacing: "var(--tracking-heading)",
            margin: "6px 0 12px",
          }}
        >
          {SCREEN_TITLES[id]}
        </h1>
        <p style={{ margin: 0, fontSize: "var(--text-lg)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)" }}>
          {TN_ACCESS_DENIAL[id]}
        </p>
      </div>
    );
  }

  if (hasFasit(id)) {
    return <FasitCanvas screen={id} role={role} tilstand={tilstand} />;
  }

  return (
    <div style={{ padding: 28, maxWidth: 760 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-micro)",
          letterSpacing: "var(--tracking-eyebrow)",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
        }}
      >
        {id}
      </div>
      <h1
        style={{
          fontSize: "var(--text-h1)",
          color: "var(--navy-900)",
          letterSpacing: "var(--tracking-heading)",
          margin: "6px 0 12px",
        }}
      >
        {SCREEN_TITLES[id]}
      </h1>
      <p style={{ margin: 0, fontSize: "var(--text-base)", color: "var(--text-secondary)" }}>
        Fasit-artboard mangler for denne skjermen.
      </p>
    </div>
  );
}
