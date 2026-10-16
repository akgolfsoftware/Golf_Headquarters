import type { Metadata } from "next";

import { tryggWangAppRetursti } from "@/lib/wang-supabase/routes";

import { WangAppLogin } from "./wang-app-login";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Logg inn — WANG Toppidrett",
  description: "Separat rolleinnlogging for WANG Toppidrett.",
  robots: { index: false, follow: false },
};

export default async function WangAppLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return <WangAppLogin retursti={tryggWangAppRetursti(next)} />;
}
