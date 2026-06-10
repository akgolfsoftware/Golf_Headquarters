import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { ForgotForm } from "./forgot-form";

/**
 * /auth/forgot-password — portet mot fersk Claude Design-fasit
 * (ph-auth.jsx · AGlemt): «Tilbake»-knapp øverst til venstre, venstrestilt
 * header, og sendt-tilstanden erstatter hele innholdet — derfor bor
 * header-blokken i ForgotForm (kun presentasjon flyttet).
 * All reset-logikk bevart uendret i ForgotForm.
 */
export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh items-start justify-center bg-background px-6 py-10 sm:items-center sm:py-16">
      <div className="flex w-full max-w-[396px] flex-col">
        <Link
          href="/auth/login"
          className={buttonClasses({
            variant: "ghost-light",
            size: "sm",
            className: "-ml-4 mb-4 self-start text-primary hover:bg-primary/5",
          })}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Tilbake
        </Link>
        <ForgotForm />
      </div>
    </main>
  );
}
