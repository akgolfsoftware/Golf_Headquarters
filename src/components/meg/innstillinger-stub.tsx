/**
 * Delt stub-side for innstillinger-underruter som ennå ikke er implementert.
 * Forhindrer 404 og gir tydelig "kommer snart"-melding med tilbake-lenke.
 */

import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";
import "./meg.css";

interface InnstillingerStubProps {
  title: string;
  description: string;
  comingInRound?: string;
}

export function InnstillingerStub({ title, description, comingInRound }: InnstillingerStubProps) {
  return (
    <div className="meg-scope">
      <nav className="meg-topnav">
        <Link href="/portal/meg/innstillinger" className="back-link">
          <ChevronLeft size={14} aria-hidden /> Tilbake til innstillinger
        </Link>
        <span className="name">AK GOLF · PLAYERHQ</span>
        <span className="crumbs">
          PORTAL / MEG / INNSTILLINGER / <span className="current">{title.toUpperCase()}</span>
        </span>
      </nav>

      <main className="meg-page-wrap" style={{ alignItems: "center", textAlign: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "var(--meg-bg)",
            border: "1px solid var(--meg-border)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--meg-brand)",
            marginTop: 24,
          }}
        >
          <Clock size={26} aria-hidden />
        </div>

        <header className="meg-pg-head" style={{ alignItems: "center" }}>
          <span className="meg-pg-eyebrow">KOMMER SNART</span>
          <h1 className="meg-pg-title" style={{ textAlign: "center" }}>
            {title}
          </h1>
          <p className="meg-pg-sub" style={{ textAlign: "center", margin: "0 auto" }}>
            {description}
          </p>
        </header>

        <p
          className="meg-footer-quote"
          style={{ marginTop: 0, maxWidth: 480 }}
        >
          {comingInRound
            ? `Implementeres i ${comingInRound} av Claude Design-handoff.`
            : "Vi jobber med dette. Tilbake til innstillinger for å fortsette."}
        </p>

        <Link href="/portal/meg/innstillinger" className="meg-edit-btn" style={{ marginTop: 8 }}>
          <ChevronLeft size={13} aria-hidden /> Tilbake til innstillinger
        </Link>
      </main>
    </div>
  );
}
