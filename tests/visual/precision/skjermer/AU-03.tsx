/** Prøvefil for AU-03 Passord (glemt og nytt). Ingen ekte kontoer. */
import { Natt } from "./_natt";
import { AU03Glemt, AU03Nytt } from "@/components/auth/precision/AU03Passord";

export const sti = "/auth/forgot-password";

export const tilstander = {
  glemt: <AU03Glemt />,
  "glemt-feil": <AU03Glemt forhandsvis={{ feil: { e: "Skriv e-postadressen du bruker til å logge inn." } }} />,
  "glemt-sendt": <AU03Glemt forhandsvis={{ sendt: true, epost: "hanne.l@demo.no" }} />,
  "glemt-laster": <AU03Glemt forhandsvis={{ tilstand: "laster" }} />,
  "glemt-natt": <Natt><AU03Glemt /></Natt>,
  "nytt-natt": <Natt><AU03Nytt /></Natt>,
  nytt: <AU03Nytt />,
  "nytt-feil": <AU03Nytt forhandsvis={{ feil: { p1: "Passordet må ha minst 10 tegn.", p2: "Passordene er ikke like. Skriv det samme passordet to ganger." } }} />,
  "nytt-laster": <AU03Nytt forhandsvis={{ tilstand: "laster" }} />,
  "nytt-utlopt": <AU03Nytt forhandsvis={{ tilstand: "feil" }} />,
};
