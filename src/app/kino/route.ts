import { redirect } from "next/navigation";

/**
 * /kino — den kinematiske landingssiden (animated-website, Higgsfield-video).
 * Selve opplevelsen er en selvstendig statisk fil i public/kino/index.html
 * (frames + selvhostede fonter samme sted); denne ruta gir den ren URL.
 */
export function GET() {
  redirect("/kino/index.html");
}
