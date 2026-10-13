"use client";
import { CoachError } from "@/components/admin/precision/agency-completion/CoachRouteState";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <CoachError reset={reset} title="Bookingen kunne ikke hentes" href="/admin/bookinger" />; }
