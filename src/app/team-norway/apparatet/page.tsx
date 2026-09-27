import { permanentRedirect } from "next/navigation";

/** Trenerkatalogen er flyttet inn i TN-09 Fagapparat. Gammel adresse sender videre. */
export default function Page() {
  permanentRedirect("/team-norway/fagapparat");
}
