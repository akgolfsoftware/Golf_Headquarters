import { TnSpillerprofil, lesFane } from "@/components/team-norway/tn-daglig-spillere/spillerprofil";

export const metadata = {
  title: "Spillerprofil · Team Norway Golf",
  description: "Plan, stats, tester, IUP, samtaler og turneringer for én spiller.",
};

/** TN-02 Spillerprofil med fane i adressen (?fane=plan|stats|test|iup|sam|tur). */
export default async function SpillerprofilPage({ params, searchParams }: { params: Promise<{ spillerId: string }>; searchParams: Promise<{ fane?: string | string[] }> }) {
  const [{ spillerId }, { fane }] = await Promise.all([params, searchParams]);
  return <TnSpillerprofil spillerId={spillerId} fane={lesFane(fane)} />;
}
