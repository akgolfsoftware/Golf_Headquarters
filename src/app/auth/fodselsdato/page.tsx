/**
 * Spør etter fødselsdato før PlayerHQ åpnes (punkt 8 i §KODEGJENNOMGANGEN 06.10).
 * Gjelder spillere som fullførte oppstarten uten dato, også voksne (Anders 14.10).
 * Ingen tegning: bygget med Precision-delene (phn) og kandidat til Anders har sett den.
 */
import { redirect } from "next/navigation";
import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { maaFylleInnFodselsdato } from "@/lib/auth/minor";
import { FodselsdatoSkjema } from "./fodselsdato-skjema";

export const dynamic = "force-dynamic";

export default async function FodselsdatoPage() {
  const user = await getCurrentUserRaw();
  if (!user) redirect("/auth/login");
  if (!maaFylleInnFodselsdato(user)) {
    if (user.role === "PARENT") redirect("/forelder");
    if (user.role === "ADMIN" || user.role === "COACH") redirect("/admin");
    redirect("/portal");
  }

  return (
    <main className="phn" style={{ minHeight: "100dvh" }}>
      <div style={{ display: "grid", gap: 24, width: "100%", maxWidth: 560, marginInline: "auto" }}>
        <header>
          <p className="phn-kilde">PlayerHQ</p>
          <h1 className="phn-tittel">Når er du født?</h1>
          <p className="phn-forklar">
            Vi trenger fødselsdatoen din før du går videre. Den avgjør hvilke spørsmål og tester som
            passer, og om en forelder må godkjenne kontoen. Datoen kan ikke endres etterpå, så sjekk at
            den er riktig.
          </p>
        </header>
        <FodselsdatoSkjema />
      </div>
    </main>
  );
}
