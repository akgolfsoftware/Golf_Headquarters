// Marketing pages for AK Golf Academy partner clubs
// Two clubs: Miklagard Golf + Gamle Fredrikstad GK
// Single <MarketingPage> renders the same structure in desktop or mobile.

const MP_TOKENS = {
  primary: '#005840',
  primaryDark: '#003A2A',
  accent: '#D1F843',
  bg: '#FAFAF7',
  card: '#FFFFFF',
  fg: '#0A1F17',
  muted: '#5E5C57',
  mutedSoft: '#908D86',
  border: '#E5E3DD',
  borderSoft: '#EFEDE6',
  fontDisplay: "'Inter Tight', sans-serif",
  fontBody: "'Inter', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  fontSerif: "'Instrument Serif', serif",
};

// ----------------------------------------------------------------
// Icons — lucide-style hairlines (1.75 stroke)
// ----------------------------------------------------------------
const Icon = ({ name, size = 24, className = '', style = {} }) => {
  const paths = {
    mappin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 4h3v3a3 3 0 0 1-3 3M7 4H4v3a3 3 0 0 0 3 3"/></>,
    crosshair: <><circle cx="12" cy="12" r="9"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></>,
    building: <><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12h12M6 18h12M10 6h.01M10 10h.01M14 6h.01M14 10h.01M10 14h.01M14 14h.01M10 18h.01M14 18h.01"/></>,
    wind: <><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></>,
    flag: <><path d="M4 22V4a2 2 0 0 1 2-2h8.5L13 6l2 4H6"/><line x1="4" y1="22" x2="4" y2="15"/></>,
    landmark: <><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    map: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
    ticket: <><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><line x1="13" y1="5" x2="13" y2="19"/></>,
    member: <><path d="M19 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {paths[name]}
    </svg>
  );
};

// ----------------------------------------------------------------
// Topnav — same shape for desktop + mobile, just sized differently
// ----------------------------------------------------------------
const MarketingTopnav = ({ mobile }) => (
  <nav style={{
    background: '#fff',
    borderBottom: `1px solid ${MP_TOKENS.border}`,
    padding: mobile ? '14px 18px' : '18px 40px',
    display: 'flex', alignItems: 'center', gap: mobile ? 12 : 32,
    position: 'relative', zIndex: 10,
  }}>
    <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: MP_TOKENS.fg }}>
      <img src="assets/logo-primary-on-light.svg" alt="AK Golf" style={{ height: mobile ? 24 : 28 }} />
      <span style={{ fontFamily: MP_TOKENS.fontDisplay, fontWeight: 700, fontSize: mobile ? 14 : 16, letterSpacing: '-0.01em', lineHeight: 1 }}>
        AK Golf<span style={{ fontFamily: MP_TOKENS.fontSerif, fontStyle: 'italic', fontWeight: 400, color: MP_TOKENS.primary, marginLeft: 6, fontSize: mobile ? 12 : 14 }}>· coaching</span>
      </span>
    </a>
    {!mobile && (
      <div style={{ display: 'flex', gap: 24, marginLeft: 24 }}>
        {['Book coaching', 'Trenere', 'Anlegg', 'Priser', 'Om oss'].map((l, i) => (
          <a key={l} href="#" style={{
            fontFamily: MP_TOKENS.fontMono, fontSize: 11, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: i === 2 ? MP_TOKENS.fg : MP_TOKENS.muted,
            fontWeight: 600, textDecoration: 'none',
          }}>{l}</a>
        ))}
      </div>
    )}
    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
      {!mobile && (
        <button style={{
          fontFamily: MP_TOKENS.fontMono, fontSize: 11, letterSpacing: '0.10em',
          textTransform: 'uppercase', color: MP_TOKENS.fg, background: 'transparent',
          border: 0, fontWeight: 600, cursor: 'pointer',
        }}>Logg inn</button>
      )}
      <button style={{
        background: MP_TOKENS.primary, color: MP_TOKENS.accent,
        padding: mobile ? '8px 14px' : '8px 18px', borderRadius: 8,
        fontFamily: MP_TOKENS.fontMono, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.10em', textTransform: 'uppercase', border: 0, cursor: 'pointer',
      }}>Bli medlem</button>
      {mobile && (
        <button style={{ background: 'transparent', border: 0, color: MP_TOKENS.fg, padding: 4, cursor: 'pointer', display: 'inline-flex' }}>
          <Icon name="menu" size={22} />
        </button>
      )}
    </div>
  </nav>
);

// ----------------------------------------------------------------
// Hero — full-width 16/7 aerial photo, dark gradient bottom
// Overlapping white card sits -56/-44px below hero
// ----------------------------------------------------------------
const Hero = ({ data, mobile }) => {
  const heroH = mobile ? 320 : 580;
  return (
    <div style={{ position: 'relative', paddingBottom: mobile ? 90 : 140 }}>
      <div style={{
        height: heroH,
        backgroundImage: `url('${data.hero}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,40,28,0.10) 0%, rgba(0,40,28,0.20) 55%, rgba(0,40,28,0.85) 100%)',
        }} />
        {/* eyebrow label sitting bottom-left over the gradient */}
        <div style={{
          position: 'absolute', left: mobile ? 18 : 40, bottom: mobile ? 110 : 170,
          color: MP_TOKENS.accent, fontFamily: MP_TOKENS.fontMono,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 24, height: 1, background: MP_TOKENS.accent }} />
          AK Golf Academy · Samarbeidsklubb
        </div>
      </div>

      {/* Overlapping white card */}
      <div style={{
        position: 'absolute',
        left: mobile ? 18 : 40,
        right: mobile ? 18 : 40,
        bottom: 0,
        maxWidth: mobile ? 'none' : 800,
        background: '#fff',
        borderRadius: 16,
        padding: mobile ? '24px 22px 26px' : '36px 44px 36px',
        boxShadow: '0 24px 60px rgba(10,31,23,0.18)',
        border: `1px solid ${MP_TOKENS.borderSoft}`,
      }}>
        <div style={{
          fontFamily: MP_TOKENS.fontMono, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: MP_TOKENS.muted,
        }}>Anlegg</div>
        <h1 style={{
          fontFamily: MP_TOKENS.fontDisplay, fontStyle: 'italic',
          color: MP_TOKENS.primary, fontSize: mobile ? 36 : 56, fontWeight: 600,
          letterSpacing: '-0.025em', lineHeight: 1.02, marginTop: mobile ? 8 : 12,
        }}>{data.name}</h1>
        <div style={{
          marginTop: mobile ? 14 : 18,
          display: 'flex', alignItems: 'center', gap: 8,
          color: MP_TOKENS.muted, fontFamily: MP_TOKENS.fontBody, fontSize: mobile ? 13 : 14,
        }}>
          <Icon name="mappin" size={mobile ? 14 : 16} style={{ color: MP_TOKENS.primary, flexShrink: 0 }} />
          <span>{data.address}</span>
        </div>
        <p style={{
          marginTop: mobile ? 12 : 14,
          color: MP_TOKENS.fg, fontFamily: MP_TOKENS.fontBody,
          fontSize: mobile ? 15 : 16.5, lineHeight: 1.5, maxWidth: 620,
        }}>{data.tagline}</p>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------
// Highlights — 3-col grid (or 1-col stacked on mobile)
// ----------------------------------------------------------------
const Highlights = ({ data, mobile }) => (
  <section style={{ padding: mobile ? '36px 18px 12px' : '64px 40px 20px' }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
      gap: mobile ? 12 : 18,
    }}>
      {data.highlights.map((h, i) => (
        <div key={i} style={{
          background: '#fff', border: `1px solid ${MP_TOKENS.border}`,
          borderRadius: 16, padding: mobile ? '22px 22px 24px' : '28px 28px 32px',
          display: 'flex', flexDirection: 'column', gap: mobile ? 12 : 16,
          minHeight: mobile ? 0 : 220,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: MP_TOKENS.bg, color: MP_TOKENS.primary,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={h.icon} size={22} />
          </div>
          <div>
            <div style={{
              fontFamily: MP_TOKENS.fontMono, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: MP_TOKENS.mutedSoft,
              marginBottom: 6,
            }}>0{i + 1} / 0{data.highlights.length}</div>
            <h3 style={{
              fontFamily: MP_TOKENS.fontDisplay, fontSize: mobile ? 19 : 22, fontWeight: 700,
              color: MP_TOKENS.fg, letterSpacing: '-0.015em', lineHeight: 1.15,
            }}>{h.title}</h3>
            <p style={{
              marginTop: 8, color: MP_TOKENS.muted,
              fontFamily: MP_TOKENS.fontBody, fontSize: mobile ? 13.5 : 14, lineHeight: 1.5,
            }}>{h.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ----------------------------------------------------------------
// Gallery + Contact — 2 col on desktop (gallery left, contact right)
//                    Stacked on mobile (gallery first, contact second)
// ----------------------------------------------------------------
const GalleryContact = ({ data, mobile }) => {
  const containerStyle = {
    padding: mobile ? '20px 18px 40px' : '40px 40px 80px',
    display: 'grid',
    gridTemplateColumns: mobile ? '1fr' : '1.1fr 0.9fr',
    gap: mobile ? 14 : 20,
  };
  return (
    <section style={containerStyle}>
      {/* Gallery */}
      <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: mobile ? 280 : 420, border: `1px solid ${MP_TOKENS.border}` }}>
        <img src={data.gallery} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{
          position: 'absolute', left: 16, bottom: 16,
          fontFamily: MP_TOKENS.fontMono, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fff',
          background: 'rgba(0,40,28,0.55)', padding: '6px 10px', borderRadius: 8,
          backdropFilter: 'blur(8px)',
        }}>{data.galleryLabel || 'Mesterskapsbanen · Hull 7'}</div>
      </div>

      {/* Contact card */}
      <div style={{
        background: '#fff', border: `1px solid ${MP_TOKENS.border}`,
        borderRadius: 16, padding: mobile ? '24px 22px 24px' : '32px 32px 32px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div>
          <div style={{
            fontFamily: MP_TOKENS.fontMono, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: MP_TOKENS.muted,
          }}>Kontakt</div>
          <h2 style={{
            fontFamily: MP_TOKENS.fontDisplay, fontStyle: 'italic',
            fontSize: mobile ? 26 : 32, fontWeight: 600,
            color: MP_TOKENS.primary, letterSpacing: '-0.02em', lineHeight: 1.05,
            marginTop: 8,
          }}>Snakk med klubben</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: `1px solid ${MP_TOKENS.borderSoft}`, paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: MP_TOKENS.bg, color: MP_TOKENS.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="phone" size={14} />
            </span>
            <div>
              <div style={{ fontFamily: MP_TOKENS.fontMono, fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: MP_TOKENS.mutedSoft }}>Telefon</div>
              <div style={{ fontFamily: MP_TOKENS.fontBody, fontSize: 14, color: MP_TOKENS.fg, fontWeight: 600, marginTop: 2 }}>{data.phone}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: MP_TOKENS.bg, color: MP_TOKENS.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="mail" size={14} />
            </span>
            <div>
              <div style={{ fontFamily: MP_TOKENS.fontMono, fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: MP_TOKENS.mutedSoft }}>E-post</div>
              <div style={{ fontFamily: MP_TOKENS.fontBody, fontSize: 14, color: MP_TOKENS.fg, fontWeight: 600, marginTop: 2 }}>{data.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: MP_TOKENS.bg, color: MP_TOKENS.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="map" size={14} />
            </span>
            <div>
              <div style={{ fontFamily: MP_TOKENS.fontMono, fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: MP_TOKENS.mutedSoft }}>Adresse</div>
              <div style={{ fontFamily: MP_TOKENS.fontBody, fontSize: 14, color: MP_TOKENS.fg, fontWeight: 600, marginTop: 2 }}>{data.address}</div>
            </div>
          </div>
        </div>

        <button style={{
          marginTop: 4,
          background: MP_TOKENS.primary, color: MP_TOKENS.accent,
          padding: '14px 20px', borderRadius: 8, border: 0, cursor: 'pointer',
          fontFamily: MP_TOKENS.fontBody, fontSize: 14, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          Ring klubben
          <Icon name="arrow" size={14} />
        </button>
      </div>
    </section>
  );
};

// ----------------------------------------------------------------
// ClubLinks — 3 action links: klubbens nettside, greenfee-booking, medlemskap
// ----------------------------------------------------------------
const ClubLinks = ({ data, mobile }) => {
  const links = [
    {
      icon: 'external',
      eyebrow: 'Offisiell side',
      title: 'Klubbens nettside',
      desc: 'Banekart, restaurant, åpningstider og klubb-info.',
      cta: data.websiteHost,
      href: data.websiteUrl,
    },
    {
      icon: 'ticket',
      eyebrow: 'Greenfee',
      title: 'Book greenfee',
      desc: 'Spill banen som gjest. Bestill starttid direkte hos klubben.',
      cta: `Fra ${data.greenfeeFrom} kr`,
      href: data.greenfeeUrl,
    },
    {
      icon: 'member',
      eyebrow: 'Medlemskap',
      title: 'Bli medlem',
      desc: data.membershipBlurb,
      cta: `Fra ${data.membershipFrom} kr / år`,
      href: data.membershipUrl,
    },
  ];
  return (
    <section style={{ padding: mobile ? '4px 18px 32px' : '20px 40px 56px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 12,
        marginBottom: mobile ? 16 : 22, flexWrap: 'wrap',
      }}>
        <div style={{
          fontFamily: MP_TOKENS.fontMono, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: MP_TOKENS.muted,
        }}>For gjester &amp; medlemmer</div>
        <h2 style={{
          fontFamily: MP_TOKENS.fontDisplay, fontStyle: 'italic',
          color: MP_TOKENS.primary, fontSize: mobile ? 24 : 30, fontWeight: 600,
          letterSpacing: '-0.02em', lineHeight: 1.05,
        }}>Tre veier inn</h2>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
        gap: mobile ? 12 : 16,
      }}>
        {links.map((l, i) => (
          <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" style={{
            background: '#fff', border: `1px solid ${MP_TOKENS.border}`,
            borderRadius: 16, padding: mobile ? '22px 22px 22px' : '26px 26px 26px',
            display: 'flex', flexDirection: 'column', gap: 14,
            textDecoration: 'none', color: MP_TOKENS.fg,
            transition: 'border-color .15s, transform .15s, box-shadow .15s',
            cursor: 'pointer',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: 10,
                background: MP_TOKENS.bg, color: MP_TOKENS.primary,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={l.icon} size={18} />
              </span>
              <span style={{
                fontFamily: MP_TOKENS.fontMono, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: MP_TOKENS.mutedSoft,
              }}>{l.eyebrow}</span>
            </div>
            <div>
              <h3 style={{
                fontFamily: MP_TOKENS.fontDisplay, fontSize: mobile ? 20 : 22, fontWeight: 700,
                color: MP_TOKENS.fg, letterSpacing: '-0.015em', lineHeight: 1.15,
              }}>{l.title}</h3>
              <p style={{
                marginTop: 8, color: MP_TOKENS.muted,
                fontFamily: MP_TOKENS.fontBody, fontSize: mobile ? 13.5 : 14, lineHeight: 1.5,
              }}>{l.desc}</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 14, marginTop: 'auto', borderTop: `1px solid ${MP_TOKENS.borderSoft}`, gap: 8,
            }}>
              <span style={{
                fontFamily: MP_TOKENS.fontMono, fontSize: 12, fontWeight: 700,
                color: MP_TOKENS.fg, letterSpacing: '0.02em',
              }}>{l.cta}</span>
              <span style={{
                width: 32, height: 32, borderRadius: 8,
                background: MP_TOKENS.accent, color: MP_TOKENS.fg,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name="arrow" size={14} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

// ----------------------------------------------------------------
// CTA banner — dark green bg, lime text + button
// Club logo sits centered above the copy, at 85% opacity.
// ----------------------------------------------------------------
const CTABanner = ({ data, mobile }) => (
  <section style={{ padding: mobile ? '0 18px 40px' : '0 40px 80px' }}>
    <div style={{
      background: `linear-gradient(150deg, ${MP_TOKENS.primary} 0%, ${MP_TOKENS.primaryDark} 100%)`,
      borderRadius: 16,
      padding: mobile ? '36px 26px 36px' : '56px 56px 56px',
      color: MP_TOKENS.accent,
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      <div style={{
        position: 'absolute', top: -100, right: -60,
        width: 320, height: 320, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(209,248,67,0.14) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: mobile ? 18 : 24 }}>

        {/* Club logo — sits above the eyebrow */}
        {data.clubLogo && (
          <img
            src={data.clubLogo}
            alt={`${data.name} logo`}
            style={{
              width: mobile ? Math.round(data.clubLogoWidth * 0.7) : data.clubLogoWidth,
              height: 'auto',
              opacity: 0.85,
              display: 'block',
            }}
          />
        )}

        <div style={{ maxWidth: mobile ? 'none' : 640 }}>
          <div style={{
            fontFamily: MP_TOKENS.fontMono, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(209,248,67,0.70)',
          }}>AK Golf Academy</div>
          <h2 style={{
            fontFamily: MP_TOKENS.fontDisplay,
            color: '#fff', fontSize: mobile ? 32 : 44, fontWeight: 600,
            letterSpacing: '-0.025em', lineHeight: 1.05, marginTop: 10,
          }}>
            Vi trener her. <span style={{ fontFamily: MP_TOKENS.fontSerif, fontStyle: 'italic', fontWeight: 400, color: MP_TOKENS.accent }}>Bli med.</span>
          </h2>
          <p style={{
            marginTop: mobile ? 14 : 18,
            color: 'rgba(255,255,255,0.78)', fontFamily: MP_TOKENS.fontBody,
            fontSize: mobile ? 14.5 : 16, lineHeight: 1.55,
            maxWidth: 540, marginLeft: 'auto', marginRight: 'auto',
          }}>{data.ctaBlurb}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: 'center', gap: mobile ? 14 : 20 }}>
          <button style={{
            background: MP_TOKENS.accent, color: MP_TOKENS.fg,
            padding: mobile ? '15px 26px' : '17px 30px', borderRadius: 8,
            border: 0, cursor: 'pointer',
            fontFamily: MP_TOKENS.fontBody, fontSize: mobile ? 15 : 16, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            whiteSpace: 'nowrap', flexShrink: 0,
            boxShadow: '0 8px 24px rgba(209,248,67,0.35)',
          }}>
            Se tilgjengelige tider
            <Icon name="arrow" size={16} />
          </button>
          <a href="#" style={{
            fontFamily: MP_TOKENS.fontMono, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.72)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            Se alle anlegg
            <Icon name="arrow" size={12} />
          </a>
        </div>

      </div>
    </div>
  </section>
);

// ----------------------------------------------------------------
// Footer — minimal
// ----------------------------------------------------------------
const Footer = ({ mobile }) => (
  <footer style={{
    background: '#fff',
    borderTop: `1px solid ${MP_TOKENS.border}`,
    padding: mobile ? '20px 18px' : '24px 40px',
    fontFamily: MP_TOKENS.fontMono, fontSize: 10.5, color: MP_TOKENS.muted,
    letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
    display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 10,
    justifyContent: 'space-between', alignItems: mobile ? 'flex-start' : 'center',
  }}>
    <span>© 2026 AK Golf Academy</span>
    <span style={{ color: MP_TOKENS.mutedSoft }}>Personvern · Vilkår · Kontakt</span>
  </footer>
);

// ----------------------------------------------------------------
// MarketingPage — assemble all sections
// ----------------------------------------------------------------
const MarketingPage = ({ data, mobile }) => (
  <div style={{
    background: MP_TOKENS.bg, color: MP_TOKENS.fg,
    fontFamily: MP_TOKENS.fontBody,
    minHeight: '100%',
    overflow: 'hidden',
  }}>
    <MarketingTopnav mobile={mobile} />
    <Hero data={data} mobile={mobile} />
    <Highlights data={data} mobile={mobile} />
    <GalleryContact data={data} mobile={mobile} />
    <ClubLinks data={data} mobile={mobile} />
    <CTABanner data={data} mobile={mobile} />
    <Footer mobile={mobile} />
  </div>
);

// ----------------------------------------------------------------
// Page data
// ----------------------------------------------------------------
const MIKLAGARD_DATA = {
  name: 'Miklagard Golf',
  shortName: 'Miklagard',
  address: 'Sigurd Hagens vei 50, 2040 Kløfta',
  tagline: 'En av Nordens mest prestisjetunge mesterskapsbaner — designet for utfordring og data-drevet trening året rundt.',
  hero: 'assets/miklagard-hero.jpg',
  gallery: 'assets/miklagard-2.jpg',
  galleryLabel: 'Solnedgang · 18. green',
  clubLogo: 'assets/miklagard-logo.png',
  clubLogoWidth: 200,
  ctaBlurb: 'AK Golf Academy holder til på Miklagard. Book privat coaching med våre trenere — alt sammen på ett av Nordens mest spektakulære anlegg.',
  phone: '+47 63 94 80 00',
  email: 'post@miklagardgolf.no',
  websiteUrl: 'https://miklagardgolf.no',
  websiteHost: 'miklagardgolf.no',
  greenfeeUrl: 'https://miklagardgolf.no/greenfee',
  greenfeeFrom: '1 050',
  membershipUrl: 'https://miklagardgolf.no/medlemskap',
  membershipFrom: '14 900',
  membershipBlurb: 'Fritt spill, rabatterte greenfee for venner og familie, og full tilgang til alle anlegg.',
  highlights: [
    { icon: 'trophy', title: 'Mesterskapsdesign', desc: 'Internasjonal mesterskapsbane med utfordrende greener og strategisk bunker-plassering.' },
    { icon: 'crosshair', title: 'Trackman Range', desc: '2. etg. driving range med Trackman på alle utslag — data fra første ball.' },
    { icon: 'building', title: 'Komplett anlegg', desc: 'To Performance Studio, stor putting green og state-of-the-art wedge-område.' },
  ],
};

const GFGK_DATA = {
  name: 'Gamle Fredrikstad GK',
  shortName: 'Gamle Fredrikstad',
  address: 'Vesterelvveien 100, 1605 Fredrikstad',
  tagline: 'Klassisk links-inspirert design med 18+9 hull, kort fra historisk Gamlebyen — hjemmebanen til AK Golf Academy.',
  hero: 'assets/gfgk-hero2.jpg',
  gallery: 'assets/gfgk-2.jpg',
  galleryLabel: 'Kongsten fort · Hull 14',
  clubLogo: 'assets/gfgk-logo.png',
  clubLogoWidth: 80,
  ctaBlurb: 'AK Golf Academy holder til på Gamle Fredrikstad Golfklubb. Book privat coaching med våre trenere — i et anlegg med 100 års historie.',
  phone: '+47 69 36 14 00',
  email: 'post@gfgk.no',
  websiteUrl: 'https://gfgk.no',
  websiteHost: 'gfgk.no',
  greenfeeUrl: 'https://gfgk.no/greenfee',
  greenfeeFrom: '650',
  membershipUrl: 'https://gfgk.no/medlemskap',
  membershipFrom: '11 400',
  membershipBlurb: 'Hovedmedlemskap inkluderer fritt spill på 18-hulls og 9-hulls bane, og rabatt på coaching.',
  highlights: [
    { icon: 'wind', title: 'Links-design', desc: 'Værutsatt parkland-links med faste, raske greener og naturlige formasjoner.' },
    { icon: 'flag', title: '18 + 9 hull', desc: 'Full 18-hulls mesterskapsbane pluss 9-hulls par 3-bane for trening og rask runde.' },
    { icon: 'landmark', title: 'Historisk beliggenhet', desc: 'Få minutters kjøring fra Gamlebyen i Fredrikstad — Nordens best bevarte festningsby.' },
  ],
};

// Export to window so design-canvas mount can use them
Object.assign(window, { MarketingPage, MIKLAGARD_DATA, GFGK_DATA });
