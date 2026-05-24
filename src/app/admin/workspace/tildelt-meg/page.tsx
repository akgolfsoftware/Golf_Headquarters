/**
 * /admin/workspace/tildelt-meg — CoachHQ "Tildelt meg"
 *
 * Fjernet bruk av forbudt CoachhqStubsShell (memory-regel).
 * Enkel innboks-stil med kort over oppgaver tildelt deg.
 */

import { CheckSquare, Inbox, Target } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { HubFrame, HubHeader, HubStatSep, HubCard, HubPill } from "@/components/hubs";

export const dynamic = "force-dynamic";

export default async function WorkspaceTildeltMegPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <HubFrame>
      <HubHeader
        eyebrow="COACHHQ · WORKSPACE"
        title="Tildelt"
        titleItalic="meg"
        sub="Oppgaver, godkjenninger og forespørsler som krever din handling."
        stats={
          <>
            <span>
              <strong>14</strong> oppgaver totalt
            </span>
            <HubStatSep />
            <span className="warn-dot">
              <span />
              <strong>3</strong> forfaller i dag
            </span>
            <HubStatSep />
            <span>
              <strong>8</strong> godkjenninger venter
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/admin/workspace/oppgaver"
          icon={CheckSquare}
          eyebrow="01 · OPPGAVER"
          title="Mine oppgaver"
          data="14 åpne"
          sub="3 forfaller i dag · 5 denne uka"
          statusPill={
            <HubPill kind="warn" dot="d-warn">
              3 DAGENS
            </HubPill>
          }
          cta="Se liste →"
        />
        <HubCard
          href="/admin/godkjenninger"
          icon={Inbox}
          eyebrow="02 · GODKJENNINGER"
          title="Venter på godkjenning"
          data="8 venter"
          sub="3 plan-revisjon · 4 runder · 1 utstyr"
          statusPill={
            <HubPill kind="warn" dot="d-warn">
              8 VENTER
            </HubPill>
          }
          cta="Gå gjennom →"
        />
        <HubCard
          href="/admin/foresporsler"
          icon={Target}
          eyebrow="03 · FORESPØRSLER"
          title="Spørsmål fra spillere"
          data="0 ubehandlete"
          sub="Sist besvart 11:48"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              INBOX 0
            </HubPill>
          }
          tone="muted"
          cta="Se historikk →"
        />
      </section>
    </HubFrame>
  );
}
