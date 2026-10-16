"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Knapp } from "@/components/precision/pa";

export function WorkbenchLastPaNytt() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return <Knapp loading={pending} onClick={() => start(() => router.refresh())}>Prøv igjen</Knapp>;
}
