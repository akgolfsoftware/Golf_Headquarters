import { PersonvernPrecisionView } from "@/components/portal/profil/PersonvernPrecisionView";

export const metadata = {
  title: "Personvern & GDPR · AK Golf HQ",
  description: "Dine personopplysninger, innsynsrett, dataeksport og sletteforespørsel.",
};

export default function PersonvernPage() {
  return <PersonvernPrecisionView tilbakeHref="/" />;
}
