"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Calendar,
  Layers,
  MapPin,
  Award,
  User,
  Shield,
  CreditCard,
  LogOut,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface NavDrawerProps {
  currentRole?: "spiller" | "trener" | "forelder" | "admin";
  userName?: string;
  userCategory?: string; // f.eks. "Kategori D"
}

export function NavDrawer({
  currentRole = "spiller",
  userName = "Spiller",
  userCategory = "Kategori D",
}: NavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Forhindre bakgrunnsscroll når drawer er åpen
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navItems: NavItem[] = [
    { id: "idag", label: "I dag", href: "/portal", icon: Calendar },
    { id: "plan", label: "Planlegging", href: "/portal/workbench", icon: Layers },
    { id: "analyse", label: "Analyse & Banekart", href: "/portal/analyse", icon: MapPin },
    { id: "tester", label: "Tester & Ferdighet", href: "/portal/tester", icon: Award },
    { id: "profil", label: "Min profil", href: "/portal/profile", icon: User },
  ];

  const adminNavItems: NavItem[] = [
    { id: "stall", label: "Stall & Spillere", href: "/admin/agencyos", icon: TrendingUp },
    { id: "booking-admin", label: "Booking & Kasse", href: "/booking", icon: CreditCard },
  ];

  const forelderNavItems: NavItem[] = [
    { id: "forelder-hjem", label: "Barnets uke", href: "/forelder", icon: Shield },
    { id: "forelder-okonomi", label: "Kontingent & Klipp", href: "/forelder/okonomi", icon: CreditCard },
  ];

  return (
    <>
      {/* 56px Topplinje for mobil og iPad */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-black/[0.08] bg-[#FAF8F3] px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Åpne meny"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#141413] transition-colors hover:bg-black/[0.05] active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/portal" className="flex items-center gap-2">
            <span className="font-sans text-sm font-semibold tracking-tight text-[#141413]">
              AK GOLF <span className="font-mono text-xs font-normal text-black/50">HQ</span>
            </span>
          </Link>
        </div>

        {/* Høyre side av topplinjen: Kategori badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#141413]/[0.06] px-2.5 py-0.5 font-mono text-xs font-medium text-[#141413]">
            {userCategory}
          </span>
        </div>
      </header>

      {/* Dimmet bakteppe */}
      {isOpen && (
        <div
          role="presentation"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Slide-out Drawer fra venstre (300px på mobil/iPad) */}
      <aside
        aria-label="Hovednavigasjon"
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[300px] flex-col justify-between border-r border-[#DDD9D1] bg-[#FAF8F3] p-5 shadow-2xl transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Drawer topp: Logo og Lukk-knapp */}
          <div className="flex items-center justify-between pb-5 border-b border-[#DDD9D1]">
            <div>
              <p className="font-sans text-sm font-bold tracking-tight text-[#141413]">
                AK GOLF HQ
              </p>
              <p className="font-mono text-xs text-black/50">{userName}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Lukk meny"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#141413] transition-colors hover:bg-black/[0.05]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigasjonsrader (hver rad er 48px høy for optimal berøring) */}
          <nav className="mt-4 space-y-1">
            <p className="px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-black/40">
              Spiller
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex h-12 items-center justify-between rounded-lg px-3 font-sans text-sm transition-colors ${
                    isActive
                      ? "bg-[#141413] font-medium text-white"
                      : "text-[#141413] hover:bg-black/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#141413]/70"}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 opacity-40 ${isActive ? "text-white" : "text-[#141413]"}`}
                  />
                </Link>
              );
            })}

            {/* Coach / Admin seksjon */}
            {(currentRole === "trener" || currentRole === "admin") && (
              <div className="pt-3">
                <p className="px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-black/40">
                  Trener & Admin
                </p>
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex h-12 items-center justify-between rounded-lg px-3 font-sans text-sm transition-colors ${
                        isActive
                          ? "bg-[#141413] font-medium text-white"
                          : "text-[#141413] hover:bg-black/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#141413]/70"}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-40" />
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Forelder seksjon */}
            {(currentRole === "forelder" || currentRole === "admin") && (
              <div className="pt-3">
                <p className="px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-black/40">
                  Foresatt
                </p>
                {forelderNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex h-12 items-center justify-between rounded-lg px-3 font-sans text-sm transition-colors ${
                        isActive
                          ? "bg-[#141413] font-medium text-white"
                          : "text-[#141413] hover:bg-black/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#141413]/70"}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-40" />
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        {/* Nederst i menyen: Utlogging / systeminfo */}
        <div className="border-t border-[#DDD9D1] pt-4">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[11px] text-black/40">
              AK Golf v2026.09
            </span>
            <Link
              href="/logout"
              className="flex items-center gap-1.5 rounded-md px-2 py-1 font-sans text-xs text-[#9B2415] hover:bg-[#9B2415]/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logg ut</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
