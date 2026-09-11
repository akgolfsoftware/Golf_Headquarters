/** Kun syntetiske komponentprøver. Ingen innlogging, database eller utsending. */
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { TnTilgangVisning, type TnTilgangVisningsrad } from "@/components/team-norway/tn-tilgang-visning";
import { TnTilgangSkjema } from "@/components/team-norway/tn-tilgang-skjema";
import { TnInput, TnKnapp } from "@/components/team-norway/core";
import TilgangLaster from "@/app/team-norway/tilgang/loading";
import TilgangFeil from "@/app/team-norway/tilgang/error";
import type { TnSettRolleResultat } from "@/lib/domain/tn-tilgang";

const params = new URLSearchParams(window.location.search);
const fixture = params.get("fixture");
const resultatlogg: unknown[] = [];
Object.assign(window, { tnResultatlogg: resultatlogg, tnOppfriskinger: 0 });

const rader: TnTilgangVisningsrad[] = [
  { userId: "syntetisk-1", navn: "Eksempel Trener Med Et Langt Etternavn", epost: "trener.med.langt.navn@example.invalid", rolle: "COACH", joinedAt: new Date("2026-08-01T00:00:00Z"), endedAt: null, status: "AKTIV" },
  { userId: "syntetisk-2", navn: "Eksempel Assistent", epost: "assistent@example.invalid", rolle: "ASSISTANT", joinedAt: new Date("2026-01-01T00:00:00Z"), endedAt: new Date("2026-08-31T00:00:00Z"), status: "UTLØPT" },
];

async function lagre(input: unknown): Promise<TnSettRolleResultat> {
  resultatlogg.push(input);
  await new Promise((resolve) => window.setTimeout(resolve, 250));
  if (fixture === "nettfeil" && resultatlogg.length === 1) throw new Error("Syntetisk nettfeil");
  if (fixture === "siste-trener") return { ok: false, reason: "siste-trener", gruppeNavn: "Testgruppen", antallSpillere: 4 };
  return { ok: true };
}

function Kontrollproeve() {
  const [verdi, settVerdi] = useState("");
  return <main style={{ maxWidth: 500, padding: 24 }}>
    <TnInput label="Kontrollfelt" value={verdi} onChange={settVerdi} hint="Dette hintet skal erstattes" error="Fyll inn feltet" />
    {(["sm", "md", "lg"] as const).map((size) => <TnKnapp key={size} size={size}>Knapp {size}</TnKnapp>)}
    <TnKnapp disabled>Sperret knapp</TnKnapp>
  </main>;
}

function App() {
  const valgtId = params.get("valgt") ?? undefined;
  const valgt = rader.find((rad) => rad.userId === valgtId);
  if (fixture === "kontroller") return <Kontrollproeve />;
  if (fixture === "laster") return <TilgangLaster />;
  if (fixture === "feil") return <TilgangFeil error={new Error("syntetisk")} reset={() => resultatlogg.push("reset")} />;
  return <TnTilgangVisning
    brukerNavn="Syntetisk Sportssjef"
    gruppeNavn="Testgruppen"
    rader={fixture === "tom" ? [] : rader}
    valgtId={valgtId}
    skjema={valgt ? <TnTilgangSkjema
      key={valgt.userId}
      groupId="syntetisk-gruppe"
      targetUserId={valgt.userId}
      gruppeNavn="Testgruppen"
      rolleInitial={valgt.rolle}
      fraInitialIso={valgt.joinedAt.toISOString().slice(0, 10)}
      tilInitialIso={valgt.endedAt?.toISOString().slice(0, 10) ?? null}
      settTilgang={lagre}
      avsluttTilgang={(groupId, targetUserId) => lagre({ groupId, targetUserId, handling: "avslutt" })}
    /> : undefined}
  />;
}

createRoot(document.getElementById("root")!).render(<App />);
