/**
 * Spør etter fødselsdato før PlayerHQ åpnes (punkt 8 i §KODEGJENNOMGANGEN 06.10).
 * Gjelder spillere som fullførte oppstarten uten dato, også voksne (Anders 14.10).
 * Nytt design: AU-04 «Fødselsdato» i utkast-flater/innlogging.html.
 */
import { redirect } from "next/navigation";
import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { maaFylleInnFodselsdato } from "@/lib/auth/minor";
import { CalendarDays } from "lucide-react";
import { FlateRamme } from "@/components/flater/FlateRamme";
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
    <FlateRamme skall="konto">
      <span className="stor-ikon"><CalendarDays className="ikon" aria-hidden="true" /></span>
      <div className="topp">
        <h1 className="tittel">Fyll inn fødselsdatoen din</h1>
        <p className="ingress">Vi trenger den før PlayerHQ åpnes. Den bestemmer hvilke regler som gjelder for samtykke og deling.</p>
      </div>
      <FodselsdatoSkjema />
      <p className="kilde">Er du under 16, sender vi en lenke til forelderen din.</p>
    </FlateRamme>
  );
}
