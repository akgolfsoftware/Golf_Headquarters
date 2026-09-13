import { TnRegistrertSkjerm } from "@/components/team-norway/tn-registrerte-skjermer";

/** TN-05. Fasit: designsystem/team-norway/templates/tn-protokolldetalj/TnProtokolldetalj.dc.html */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TnRegistrertSkjerm skjerm="protokolldetalj" id={id} />;
}
