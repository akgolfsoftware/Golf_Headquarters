"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Edit3, Bell, Lock, Link2, Globe, Shield, Monitor, Trash2, ChevronRight } from "lucide-react";
import { ProfilRedigerModal, type ProfilRedigerModalProps } from "./profil-rediger-modal";
import "./meg.css";

interface SettingsCategory {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  state: React.ReactNode;
}

export interface InnstillingerShellProps {
  user: ProfilRedigerModalProps["initial"];
  tier: "GRATIS" | "PRO" | "ELITE";
  notifCount: { active: number; total: number };
  integrationsCount: { connected: number; names: string };
}

export function InnstillingerShell({
  user,
  tier,
  notifCount,
  integrationsCount,
}: InnstillingerShellProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const categories: SettingsCategory[] = [
    {
      href: "/portal/meg/innstillinger/varsler",
      icon: <Bell size={20} aria-hidden />,
      title: "Notifikasjoner",
      desc: "Velg hvilke varsler du vil ha — push, e-post, SMS",
      state: (
        <>
          <span className="v">
            {notifCount.active} av {notifCount.total}
          </span>
          aktive
        </>
      ),
    },
    {
      href: "/portal/meg/innstillinger/personvern",
      icon: <Lock size={20} aria-hidden />,
      title: "Personvern",
      desc: "Synlighet, datadeling, GDPR-eksport og sletting",
      state: (
        <span className="meg-meta-pill">
          <span className="dot" />Synlig
        </span>
      ),
    },
    {
      href: "/portal/meg/innstillinger/integrasjoner",
      icon: <Link2 size={20} aria-hidden />,
      title: "Integrasjoner",
      desc: "TrackMan · GolfBox · Strava · Apple Health",
      state: (
        <>
          <span className="v">{integrationsCount.connected} koblet</span>
          {integrationsCount.names}
        </>
      ),
    },
    {
      href: "/portal/meg/innstillinger/sprak",
      icon: <Globe size={20} aria-hidden />,
      title: "Språk og region",
      desc: "Hva appen vises på og hvilken tidssone som regnes",
      state: (
        <>
          <span className="v">Norsk bokmål</span>
          Europa/Oslo (UTC+2)
        </>
      ),
    },
    {
      href: "/portal/meg/innstillinger/sikkerhet",
      icon: <Shield size={20} aria-hidden />,
      title: "Sikkerhet",
      desc: "Passord, to-faktor-pålogging og pålitelige enheter",
      state: (
        <span className="meg-meta-pill">
          <span className="dot" />2FA på
        </span>
      ),
    },
    {
      href: "/portal/meg/innstillinger/okter",
      icon: <Monitor size={20} aria-hidden />,
      title: "Apparater og økter",
      desc: "Hvor du er logget inn akkurat nå",
      state: (
        <>
          <span className="v">2 aktive</span>
          MacBook Air · iPhone 15
        </>
      ),
    },
  ];

  return (
    <div className="meg-scope">
      <nav className="meg-topnav">
        <Link href="/portal" className="back-link">
          <ChevronLeft size={14} aria-hidden /> Tilbake til portal
        </Link>
        <span className="name">AK GOLF · PLAYERHQ</span>
        <span className="crumbs">
          PORTAL / MEG / <span className="current">INNSTILLINGER</span>
        </span>
      </nav>

      <main className="meg-page-wrap">
        <header className="meg-pg-head">
          <span className="meg-pg-eyebrow">PROFIL · KONTO · INNSTILLINGER</span>
          <h1 className="meg-pg-title">
            Tilpass appen <em>til deg</em>
          </h1>
          <p className="meg-pg-sub">
            Velg hva du vil ha varsel om, hvem som ser hva, og hvilke tjenester PlayerHQ kobler seg til.
            Alle endringer lagres umiddelbart.
          </p>
        </header>

        {/* Account block */}
        <section className="meg-account-card">
          <div className="av">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              user.initials
            )}
          </div>
          <div className="info">
            <span className="nm">{user.name}</span>
            <span className="email">{user.email}</span>
            <span className="meta">
              <span className="tier">{tier}</span>
              <span>
                HCP {formatHcp(user.hcp)}
                {user.aListe ? ` · ${user.aListe}` : ""}
                {user.homeClub ? ` · ${user.homeClub}` : ""}
              </span>
            </span>
          </div>
          <button type="button" className="meg-edit-btn" onClick={() => setModalOpen(true)}>
            <Edit3 size={13} aria-hidden /> Rediger profil
          </button>
        </section>

        <section className="meg-sec-list">
          <span className="meg-sec-h">Kategorier</span>
          {categories.map((c) => (
            <Link key={c.href} href={c.href} className="meg-sec-card">
              <div className="meg-sec-icon">{c.icon}</div>
              <div className="meg-sec-body">
                <span className="meg-sec-title">{c.title}</span>
                <span className="meg-sec-desc">{c.desc}</span>
              </div>
              <div className="meg-sec-side">
                <div className="meg-sec-state">{c.state}</div>
                <span className="meg-sec-chev">
                  <ChevronRight size={18} aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="meg-danger-zone">
          <span className="label">Faresone</span>
          <button type="button" className="meg-danger-link">
            <Trash2 size={13} aria-hidden /> Slett konto permanent
          </button>
        </section>

        <p className="meg-footer-quote">«Mindre bryderi, mer golf.»</p>
      </main>

      <ProfilRedigerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={user}
      />
    </div>
  );
}

function formatHcp(hcp: number | null): string {
  if (hcp === null || hcp === undefined) return "—";
  if (hcp < 0) return `+${Math.abs(hcp).toFixed(1).replace(".", ",")}`;
  return hcp.toFixed(1).replace(".", ",");
}
