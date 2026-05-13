import type { Metadata } from "next";
import { Mail, MapPin, Building2 } from "lucide-react";
import { KontaktForm } from "./form";

export const metadata: Metadata = {
  title: "Kontakt — AK Golf Academy",
  description:
    "Ta kontakt med AK Golf Academy. Personlig coaching, booking og spørsmål — vi svarer som regel samme dag.",
};

export default function KontaktSide() {
  return (
    <div>
      <section className="bg-gradient-to-b from-background to-secondary/40 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Kontakt
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Snakk{" "}
            <em className="font-normal text-primary md:italic">med</em> oss
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Lurer du på om coaching hos oss passer for deg? Vi svarer som regel
            innen 1 virkedag.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.5fr]">
          <aside className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Kontaktinfo
              </h2>
              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex gap-3">
                  <Mail
                    className="h-5 w-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-foreground">E-post</p>
                    <a
                      href="mailto:post@akgolf.no"
                      className="text-muted-foreground hover:text-primary"
                    >
                      post@akgolf.no
                    </a>
                  </div>
                </li>
                <li className="flex gap-3">
                  <MapPin
                    className="h-5 w-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-foreground">Adresse</p>
                    <p className="text-muted-foreground">
                      Bossumveien 6
                      <br />
                      1605 Fredrikstad
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Building2
                    className="h-5 w-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-foreground">Selskap</p>
                    <p className="text-muted-foreground">
                      AK Golf Group AS
                      <br />
                      Org.nr 927 248 581
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/40 p-8 text-sm">
              <p className="text-foreground">
                <em className="text-primary not-italic md:italic">
                  «Den raskeste veien til fremgang er å si fra om hva du vil.
                  Skriv kort hva du ønsker — så finner vi løsningen.»
                </em>
              </p>
              <p className="mt-4 text-muted-foreground">
                — Anders Kristiansen, Head Coach
              </p>
            </div>
          </aside>

          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Skriv til oss
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Alle felter merket må fylles ut.
            </p>
            <div className="mt-8">
              <KontaktForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
