import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Du er offline",
  description: "Sjekk nettforbindelsen din og prøv igjen.",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Du er offline
        </h1>
        <p className="text-muted-foreground">
          Sjekk nettforbindelsen din og prøv igjen. Dine siste live-økter er
          fortsatt lagret lokalt og synkroniseres når du er online igjen.
        </p>
      </div>
    </div>
  );
}
