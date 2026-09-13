import { TnRegistrertSkjerm } from "@/components/team-norway/tn-registrerte-skjermer";

/** TN-14. Fasit: designsystem/team-norway/templates/tn-samlingspunkt/TnSamlingspunkt.dc.html */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TnRegistrertSkjerm skjerm="samlingsdetalj" id={id} />;
}
