// Foundation-placeholder. Booking, portal, CoachHQ etc. bygges i andre prosjekter.

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-2xl rounded-card bg-primary/10 p-8 ring-1 ring-primary/20">
        <h1 className="text-4xl font-semibold tracking-tight text-accent">
          AK Golf HQ
        </h1>
        <p className="mt-4 text-white/70">
          Foundation klar. Booking, coaching og spillerutvikling bygges i
          påfølgende faser.
        </p>
        <span className="mt-6 inline-block rounded-pill bg-accent px-4 py-2 text-sm font-medium text-dark-bg">
          v0.1.0 — foundation
        </span>
      </div>
    </main>
  );
}
