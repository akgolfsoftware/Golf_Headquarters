"use client";
import { CoachError } from "@/components/admin/precision/agency-completion/CoachRouteState";
export default function Error({ reset }: { error: Error; reset: () => void }) { return <CoachError reset={reset} title="Teamoppsettet kunne ikke hentes" href="/admin/oppsett" />; }
