"use client";

import { useState } from "react";
import { Knapp } from "@/components/v2";
import { NyGruppeModal, type CoachValg } from "./ny-gruppe-modal";

export function NyGruppeButton({ coaches }: { coaches: CoachValg[] }) {
  const [aapen, setAapen] = useState(false);
  return (
    <>
      <Knapp ghost icon="plus" onClick={() => setAapen(true)}>
        Ny gruppe
      </Knapp>
      {aapen && <NyGruppeModal coaches={coaches} onClose={() => setAapen(false)} />}
    </>
  );
}
