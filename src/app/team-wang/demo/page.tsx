import type { Metadata } from "next";

import { hentWangGolfDemo } from "@/lib/wang-supabase/data";

import { WangGolfDemo } from "./WangGolfDemo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Golf-demo — WANG Toppidrett Fredrikstad",
  description:
    "Sammenhengende WANG Golf-demo med syntetiske data fra den separate WANG-databasen.",
  robots: { index: false, follow: false },
};

export default async function WangGolfDemoPage() {
  const data = await hentWangGolfDemo();
  return <WangGolfDemo data={data} />;
}
