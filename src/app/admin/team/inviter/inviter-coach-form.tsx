"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { inviterCoach } from "../actions";

export function InviterCoachForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setFieldErrors({});
    setSuccess(null);

    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");

    startTransition(async () => {
      const res = await inviterCoach(email, name);
      if (!res.ok) {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      setSuccess(
        res.epostSendt
          ? "Coach invitert. Invitasjons-e-post er sendt."
          : "Coach opprettet. E-post ble ikke sendt (Resend ikke konfigurert).",
      );
      setTimeout(() => router.push("/admin/team"), 1500);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-[13px] font-medium">
          Navn
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-[14px] outline-none focus:ring-2 focus:ring-ring"
          placeholder="Fornavn Etternavn"
        />
        {fieldErrors.name && (
          <p className="text-[12px] text-destructive">{fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-[13px] font-medium">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-[14px] outline-none focus:ring-2 focus:ring-ring"
          placeholder="coach@akgolf.no"
        />
        {fieldErrors.email && (
          <p className="text-[12px] text-destructive">{fieldErrors.email}</p>
        )}
      </div>

      {error && !Object.keys(fieldErrors).length && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-[13px] text-primary">
          {success}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <UserPlus size={14} strokeWidth={1.75} />
          {isPending ? "Sender..." : "Send invitasjon"}
        </button>
        <Link
          href="/admin/team"
          className="rounded-md border border-border px-4 py-2 text-[13px] font-medium hover:bg-secondary"
        >
          Avbryt
        </Link>
      </div>
    </form>
  );
}
