import { Compass } from "lucide-react";
import Link from "next/link";
import { Button, Eyebrow } from "@/components/athletic/golfdata";

export default function AdminNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <Compass className="h-10 w-10 text-primary" strokeWidth={1.5} aria-hidden />
      <Eyebrow as="span">404 · Ikke funnet</Eyebrow>
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
        Siden <em className="font-normal italic text-primary">finnes ikke</em>
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Sjekk URLen eller gå tilbake til AgencyOS-oversikten.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button as={Link} href="/admin" variant="primary">
          Tilbake til oversikten
        </Button>
        <Button as={Link} href="/auth/login" variant="secondary">
          Logg inn på nytt
        </Button>
      </div>
    </div>
  );
}
