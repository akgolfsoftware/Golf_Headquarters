import { TnSpillerprofilSkjerm } from "@/components/team-norway/skjermer/tn-spillerprofil-skjerm";

/** IUP › Oversikt. Fasit: docs/design-system/utkast-tn/trenerflate/index.html, «Spillerprofil (IUP) · Oversikt». */
export default async function SpillerOversiktPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  return <TnSpillerprofilSkjerm spillerId={spillerId} />;
}
