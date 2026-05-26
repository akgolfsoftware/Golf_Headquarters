"use client";

/**
 * EksportTrigger — client-trigger som åpner EksportModal.
 *
 * Brukes fra server components (admin-sider) for å koble en knapp til
 * eksport-modalen. Tar `kind`-prop og videresender data-props (spillere,
 * turneringer) når relevant.
 */

import { useState } from "react";
import { Download } from "lucide-react";
import {
  EksportModal,
  type SpillerOption,
  type TurneringOption,
} from "@/components/shared/eksport-modal";

type Props =
  | {
      kind: "brief";
      label?: string;
      className?: string;
    }
  | {
      kind: "analytics";
      label?: string;
      className?: string;
      spillere?: SpillerOption[];
    }
  | {
      kind: "tournaments";
      label?: string;
      className?: string;
      turneringer?: TurneringOption[];
    };

export function EksportTrigger(props: Props) {
  const [open, setOpen] = useState(false);
  const label =
    props.label ??
    (props.kind === "brief"
      ? "Eksporter rapport"
      : props.kind === "analytics"
        ? "Eksporter analytics"
        : "Eksporter turneringer");

  const cls =
    props.className ??
    "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cls}>
        <Download size={14} strokeWidth={1.75} />
        {label}
      </button>
      {props.kind === "brief" && (
        <EksportModal kind="brief" open={open} onClose={() => setOpen(false)} />
      )}
      {props.kind === "analytics" && (
        <EksportModal
          kind="analytics"
          open={open}
          onClose={() => setOpen(false)}
          spillere={props.spillere}
        />
      )}
      {props.kind === "tournaments" && (
        <EksportModal
          kind="tournaments"
          open={open}
          onClose={() => setOpen(false)}
          turneringer={props.turneringer}
        />
      )}
    </>
  );
}
