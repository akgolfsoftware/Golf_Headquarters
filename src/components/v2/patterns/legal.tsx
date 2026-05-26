"use client";

/**
 * LegalPattern — Editorial-style legal page layout.
 *
 * Used by /(marketing)/personvern, /(marketing)/vilkar,
 * /(marketing)/cookies, /personvern, etc.
 *
 * Requires "use client" for IntersectionObserver-based
 * active-section tracking in the sticky table of contents.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Mail, MapPin } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────

export type LegalSection = {
  id: string;
  number?: string; // "1", "1.1", "2"
  title: string;
  content: React.ReactNode | string;
};

export type LegalPatternProps = {
  eyebrow?: string; // default "JURIDISK INFORMASJON"
  title: string;
  lastUpdated: string; // formatted date string
  heroImage?: string; // path e.g. "/images/akgolf/AK-Golf-Academy-19.webp"
  sections: LegalSection[];
  contactEmail?: string; // default "personvern@akgolf.no"
  contactAddress?: string; // optional postal address
};

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Renders string content with basic line-break and list parsing.
 * JSX content is passed through unchanged.
 */
function renderContent(content: React.ReactNode | string): React.ReactNode {
  if (typeof content !== "string") return content;

  const paragraphs = content.split("\n\n");

  return paragraphs.map((para, pIdx) => {
    const lines = para.split("\n");
    const isUnorderedList = lines.every(
      (l) => l.trimStart().startsWith("- ") || l.trim() === ""
    );
    const isOrderedList = lines.every(
      (l) => /^\d+\.\s/.test(l.trimStart()) || l.trim() === ""
    );

    if (isUnorderedList && lines.some((l) => l.trimStart().startsWith("- "))) {
      return (
        <ul key={pIdx} className="legal-list legal-list-ul">
          {lines
            .filter((l) => l.trimStart().startsWith("- "))
            .map((l, i) => (
              <li key={i}>{l.trimStart().slice(2)}</li>
            ))}
        </ul>
      );
    }

    if (isOrderedList && lines.some((l) => /^\d+\.\s/.test(l.trimStart()))) {
      return (
        <ol key={pIdx} className="legal-list legal-list-ol">
          {lines
            .filter((l) => /^\d+\.\s/.test(l.trimStart()))
            .map((l, i) => (
              <li key={i}>{l.trimStart().replace(/^\d+\.\s/, "")}</li>
            ))}
        </ol>
      );
    }

    return <p key={pIdx}>{para}</p>;
  });
}

// ── Sub-components ────────────────────────────────────────────────

function LegalHero({
  eyebrow,
  title,
  lastUpdated,
  heroImage,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  heroImage: string;
}) {
  return (
    <div
      className="legal-hero"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 100%), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center 35%",
      }}
      role="banner"
    >
      {/* Grain overlay */}
      <span className="grain" aria-hidden="true" />

      <div className="legal-hero-inner">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)] flex items-center gap-[10px]">
          <span
            style={{
              display: "inline-block",
              width: 28,
              height: 1,
              background: "var(--color-accent)",
            }}
          />
          {eyebrow}
        </span>

        <h1
          className="m-0 font-display font-bold italic leading-[0.95] tracking-[-0.03em] text-white"
          style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
        >
          {title}
        </h1>

        <span
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Sist oppdatert {lastUpdated}
        </span>
      </div>
    </div>
  );
}

// ── Table of contents ─────────────────────────────────────────────

type TocEntry = { id: string; number?: string; title: string };

function TableOfContents({
  sections,
  activeId,
  onNavigate,
}: {
  sections: TocEntry[];
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      // 24px extra offset for readable scroll position
      const top =
        el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: "smooth" });
    }
    onNavigate(id);
  }

  return (
    <nav aria-label="Innholdsfortegnelse" className="legal-toc">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--color-ink-subtle)] mb-4 block">
        Innhold
      </span>
      <ol className="list-none m-0 p-0 flex flex-col gap-[2px]">
        {sections.map((s) => {
          const isActive = activeId === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollTo(s.id)}
                className="legal-toc-item"
                aria-current={isActive ? "location" : undefined}
                style={{
                  borderLeftColor: isActive
                    ? "var(--color-accent)"
                    : "transparent",
                  color: isActive
                    ? "var(--color-foreground)"
                    : "var(--color-ink-muted)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {s.number && (
                  <span className="font-mono text-[10px] font-bold text-[var(--color-ink-subtle)] w-[20px] shrink-0">
                    {s.number}.
                  </span>
                )}
                <span>{s.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── Accordion TOC (mobile) ────────────────────────────────────────

function MobileToc({
  sections,
  activeId,
}: {
  sections: TocEntry[];
  activeId: string;
}) {
  const [open, setOpen] = useState(false);
  const activeSection = sections.find((s) => s.id === activeId);

  function scrollTo(id: string) {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  return (
    <div className="legal-toc-mobile">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="legal-toc-mobile-trigger"
        aria-expanded={open}
        aria-controls="mobile-toc-list"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          Innhold
        </span>
        {activeSection && (
          <span className="text-sm font-semibold text-[var(--color-foreground)] truncate max-w-[200px]">
            {activeSection.number
              ? `${activeSection.number}. ${activeSection.title}`
              : activeSection.title}
          </span>
        )}
        <span
          className="ml-auto font-mono text-[10px] font-bold text-[var(--color-ink-muted)]"
          aria-hidden="true"
        >
          {open ? "LUKK" : "VIS"}
        </span>
      </button>

      {open && (
        <ol
          id="mobile-toc-list"
          className="list-none m-0 p-0 border-t border-[var(--color-line)]"
        >
          {sections.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollTo(s.id)}
                className="legal-toc-mobile-item"
                style={{
                  borderLeftColor:
                    activeId === s.id ? "var(--color-accent)" : "transparent",
                  fontWeight: activeId === s.id ? 600 : 400,
                }}
              >
                {s.number && (
                  <span className="font-mono text-[10px] font-bold text-[var(--color-ink-subtle)] w-[20px] shrink-0">
                    {s.number}.
                  </span>
                )}
                {s.title}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ── Section block ─────────────────────────────────────────────────

function LegalSectionBlock({ section }: { section: LegalSection }) {
  return (
    <section aria-labelledby={`section-${section.id}`} className="legal-section">
      <h2
        id={section.id}
        className="font-display font-bold tracking-[-0.02em] text-[var(--color-foreground)] m-0"
        style={{ fontSize: "clamp(20px, 2.5vw, 26px)" }}
      >
        {section.number && (
          <span className="font-mono text-[var(--color-ink-subtle)] font-bold mr-3">
            {section.number}.
          </span>
        )}
        {section.title}
      </h2>

      <div className="legal-prose">{renderContent(section.content)}</div>
    </section>
  );
}

// ── Contact card ──────────────────────────────────────────────────

function ContactCard({
  email,
  address,
}: {
  email: string;
  address?: string;
}) {
  return (
    <div className="legal-contact-card">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)] flex items-center gap-[8px] mb-4">
        <span
          style={{
            display: "inline-block",
            width: 24,
            height: 1,
            background: "var(--color-accent)",
          }}
        />
        Kontakt oss
      </span>

      <p className="m-0 mb-6 font-display font-bold text-[var(--color-foreground)] text-xl tracking-[-0.02em]">
        Spørsmål om dette?
      </p>

      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed m-0 mb-6">
        Vi svarer på henvendelser om personvern og juridiske spørsmål innen
        5 arbeidsdager.
      </p>

      <div className="flex flex-col gap-2">
        <a
          href={`mailto:${email}`}
          className="legal-contact-link"
        >
          <Mail size={16} strokeWidth={1.5} />
          <span>{email}</span>
        </a>

        {address && (
          <span className="legal-contact-link" style={{ cursor: "default" }}>
            <MapPin size={16} strokeWidth={1.5} />
            <span>{address}</span>
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function LegalPattern({
  eyebrow = "JURIDISK INFORMASJON",
  title,
  lastUpdated,
  heroImage = "/images/akgolf/AK-Golf-Academy-19.webp",
  sections,
  contactEmail = "personvern@akgolf.no",
  contactAddress,
}: LegalPatternProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleNavigate = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  useEffect(() => {
    // Track which section h2 is most visible in the viewport
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    headings.forEach((h) => observerRef.current?.observe(h));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections]);

  return (
    <div className="legal-root">
      {/* Hero */}
      <LegalHero
        eyebrow={eyebrow}
        title={title}
        lastUpdated={lastUpdated}
        heroImage={heroImage}
      />

      {/* Mobile TOC — shows below hero on small screens */}
      <div className="legal-mobile-toc-wrapper">
        <MobileToc sections={sections} activeId={activeId} />
      </div>

      {/* Body: sidebar TOC + content */}
      <div className="legal-body">
        {/* Sticky TOC sidebar — desktop only */}
        <aside className="legal-sidebar">
          <div className="legal-sidebar-sticky">
            <TableOfContents
              sections={sections}
              activeId={activeId}
              onNavigate={handleNavigate}
            />
          </div>
        </aside>

        {/* Main content column */}
        <main className="legal-content" id="legal-main">
          <div className="legal-sections">
            {sections.map((section) => (
              <LegalSectionBlock key={section.id} section={section} />
            ))}
          </div>

          {/* Contact card footer */}
          <ContactCard email={contactEmail} address={contactAddress} />
        </main>
      </div>
    </div>
  );
}
