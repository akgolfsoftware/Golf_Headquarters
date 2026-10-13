"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserMinus, Trash2 } from "lucide-react";

import { LeggTilMedlemModal, type Kandidat } from "./legg-til-medlem-modal";
import { fjernGruppemedlem } from "./actions";
import { deleteGroup } from "../actions";

export function StartOktButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/admin/bookinger/ny")}
      className="pa-btn pa-btn--secondary"
    >
      Ny booking
    </button>
  );
}

export function LeggTilSpillerButton({
  groupId,
  kandidater,
  trenerKandidater,
}: {
  groupId: string;
  kandidater: Kandidat[];
  trenerKandidater: Kandidat[];
}) {
  const [aapen, setAapen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setAapen(true)}
        className="pa-btn pa-btn--secondary"
      >
        Legg til medlem
      </button>
      {aapen && (
        <LeggTilMedlemModal
          groupId={groupId}
          kandidater={kandidater}
          trenerKandidater={trenerKandidater}
          onClose={() => setAapen(false)}
        />
      )}
    </>
  );
}

export function FjernMedlemButton({
  groupId,
  userId,
  navn,
}: {
  groupId: string;
  userId: string;
  navn: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function fjern(e: React.MouseEvent) {
    // Ligger inni en Link — stopp navigasjon til spiller-profilen.
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Fjern ${navn} fra gruppen?`)) return;
    startTransition(async () => {
      const res = await fjernGruppemedlem(groupId, userId);
      if (!res.ok) {
        toast.error(res.feil);
        return;
      }
      toast.success(`${navn} er fjernet fra gruppen.`);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={fjern}
      disabled={pending}
      aria-label={`Fjern ${navn} fra gruppen`}
      className="pa-iconbtn"
    >
      <UserMinus className="h-3.5 w-3.5" strokeWidth={1.75} />
    </button>
  );
}

/**
 * «Slett gruppe» — sletter selve gruppen. GroupMember/GroupSchedule kaskade-
 * slettes av databasen (ingen soft-delete), så bekreftelsen viser antall
 * medlemmer/samlinger som forsvinner — ingen stille kaskade-sletting.
 */
export function SlettGruppeButton({
  groupId,
  navn,
  antallMedlemmer,
  antallSamlinger,
}: {
  groupId: string;
  navn: string;
  antallMedlemmer: number;
  antallSamlinger: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function slett() {
    const konsekvens =
      antallMedlemmer > 0 || antallSamlinger > 0
        ? `Gruppen har ${antallMedlemmer} medlemmer og ${antallSamlinger} planlagte samlinger — alt fjernes samtidig. `
        : "";
    if (!window.confirm(`${konsekvens}Slett gruppen «${navn}»? Dette kan ikke angres.`)) return;
    startTransition(async () => {
      const res = await deleteGroup(groupId);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success(`«${navn}» er slettet.`);
      router.push("/admin/grupper");
    });
  }

  return (
    <button
      type="button"
      onClick={slett}
      disabled={pending}
      className="pa-btn pa-btn--ghost"
    >
      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      Slett gruppe
    </button>
  );
}

/** «Se alle» — hele gruppens timeplan (alle GroupSchedule-rader). */
export function SeAlleTimePlanButton({ groupId }: { groupId: string }) {
  return (
    <Link
      href={`/admin/grupper/${groupId}/timeplan`}
      className="pa-btn pa-btn--ghost"
    >
      Se timeplan
    </Link>
  );
}

/**
 * «Detaljer» — åpner samlingen i gruppens timeplan, framhevet via ?focus.
 * Appen har ingen egen samling-detaljskjerm; timeplan-raden viser samlingens
 * fulle felter (ukedag, tid, varighet, sted, repetisjon, beskrivelse).
 */
export function DetaljerButton({
  groupId,
  scheduleId,
}: {
  groupId: string;
  scheduleId: string;
}) {
  return (
    <Link
      href={`/admin/grupper/${groupId}/timeplan?focus=${scheduleId}#s-${scheduleId}`}
      className="pa-btn pa-btn--secondary"
    >
      Detaljer
    </Link>
  );
}

/** «Åpne» — som «Detaljer», for en samling i den kommende-listen. */
export function AapneButton({
  groupId,
  scheduleId,
}: {
  groupId: string;
  scheduleId: string;
}) {
  return (
    <Link
      href={`/admin/grupper/${groupId}/timeplan?focus=${scheduleId}#s-${scheduleId}`}
      className="pa-btn pa-btn--ghost"
    >
      Åpne
    </Link>
  );
}
