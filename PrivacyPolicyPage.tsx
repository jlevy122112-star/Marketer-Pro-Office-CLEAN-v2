/**
 * PrivacyPolicyPage.tsx
 * GDPR/CCPA-compliant Privacy Policy for Marketer Pro Office Edition.
 *
 * UX Principles:
 * - Legal content made readable: clear headings, plain language summaries
 * - "TL;DR" summary cards at top so users understand the essentials instantly
 * - Sticky table of contents for long-form navigation
 * - Brand-consistent — even legal pages feel like part of the product
 * - Last updated date prominently displayed
 * - Download/print friendly
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const LAST_UPDATED = 'June 1, 2025';
const COMPANY_NAME = 'Marketer Pro Office Edition';
const COMPANY_EMAIL = 'privacy@marketerprooffice.com';
const COMPANY_ADDRESS = 'Marketer Pro, Inc., Houston, TX, USA';

// ─── Section types ────────────────────────────────────────────────────────────

interface PolicySection {
  id: string;
  heading: string;
  content: React.ReactNode;
}

// ─── TL;DR summary cards ──────────────────────────────────────────────────────

const TLDR_ITEMS = [
  {
    icon: '🔒',
    title: 'Your data is yours',
    body: 'We never sell your personal data to third parties. Period.',
  },
  {
    icon: '📧',
    title: 'Only what we need',
    body: 'We collect only what's necessary to run the service.',
  },
  {
    icon: '🗑️',
    title: 'Delete anytime',
    body: 'Request a full data export or permanent deletion at any time.',
  },
  {
    icon: '🛡️',
    title: 'Enterprise-grade security',
    body: 'Your data is encrypted in transit and at rest.',
  },
] as const;

// ─── Policy content ───────────────────────────────────────────────────────────

const sections: PolicySection[] = [
  {
    id: 'overview',
    heading: '1. Overview',
    content: (
      <div>
        <p>
          {COMPANY_NAME} ("we", "us", or "our") operates the Marketer Pro web application and
          mobile applications (the "Service"). This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you use our Service.
        </p>
        <p>
          We are committed to protecting your privacy. If you disagree with the terms of this
          policy, please do not use our Service. By using the Service, you consent to the
          practices described in this policy.
        </p>
      </div>
    ),
  },
  {
    id: 'data-collected',
    heading: '2. Information We Collect',
    content: (
      <div>
        <h3>Information you provide directly</h3>
        <ul>
          <li><strong>Account information:</strong> name, email address, password (hashed, never stored in plaintext), and optional profile photo.</li>
          <li><strong>Billing information:</strong> processed securely via Stripe. We do not store full payment card details.</li>
          <li><strong>Brand assets:</strong> logos, colors, and brand guidelines you upload to personalize your content.</li>
          <li><strong>Content:</strong> text, images, and media you create or upload through the Service.</li>
          <li><strong>Communications:</strong> messages you send to our support team.</li>
        </ul>

        <h3>Information collected automatically</h3>
        <ul>
          <li><strong>Usage data:</strong> features you use, content generated, pages visited, time spent.</li>
          <li><strong>Device and technical data:</strong> IP address, browser type, OS, device identifiers, and crash reports.</li>
          <li><strong>Cookies and similar technologies:</strong> session tokens, preference cookies, and analytics identifiers. See our Cookie Policy for details.</li>
        </ul>

        <h3>Information from third parties</h3>
        <ul>
          <li><strong>Social media accounts:</strong> when you connect Instagram, LinkedIn, Facebook, TikTok, or other platforms, we receive limited profile data and OAuth tokens required to post on your behalf. We do not access your social media inbox or personal messages.</li>
          <li><strong>OAuth sign-in providers:</strong> Google and Apple provide name, email, and profile photo if you sign in through them.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'use-of-data',
    heading: '3. How We Use Your Information',
    content: (
      <div>
        <p>We use collected information to:</p>
        <ul>
          <li>Provide, operate, and maintain the Service</li>
          <li>Generate AI-powered content tailored to your brand and connected platforms</li>
          <li>Process payments and manage your subscription</li>
          <li>Send transactional emails (receipts, security alerts, service updates)</li>
          <li>Send marketing communications (only with your consent; unsubscribe any time)</li>
          <li>Detect and prevent fraud, abuse, and unauthorized access</li>
          <li>Improve the Service through aggregated, anonymized usage analysis</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>
          <strong>AI Content Generation:</strong> Content you generate using our AI engine is used
          solely to produce and refine your outputs. We do not use your generated content to train
          our underlying AI models without your explicit consent.
        </p>
      </div>
    ),
  },
  {
    id: 'sharing',
    heading: '4. Sharing of Information',
    content: (
      <div>
        <p>We do not sell, trade, or rent your personal information. We may share your data with:</p>
        <ul>
          <li><strong>Service providers:</strong> Supabase (database), Stripe (payments), Railway (compute), Vercel (hosting), Resend (email), Anthropic (AI generation). All processors are bound by data processing agreements.</li>
          <li><strong>Social media platforms:</strong> solely to publish content you've approved for scheduling.</li>
          <li><strong>Law enforcement:</strong> when required by law, subpoena, court order, or to protect the rights, property, or safety of our users or the public.</li>
          <li><strong>Business transfers:</strong> in connection with a merger, acquisition, or sale of assets, with advance notice to you.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'data-retention',
    heading: '5. Data Retention',
    content: (
      <div>
        <p>
          We retain your account data for as long as your account is active or as needed to
          provide the Service. If you cancel your account:
        </p>
        <ul>
          <li>Your content and account data are scheduled for deletion within 30 days.</li>
          <li>Aggregated, anonymized analytics data may be retained indefinitely.</li>
          <li>Billing records are retained for 7 years as required by financial regulations.</li>
          <li>Audit logs are retained for 12 months.</li>
        </ul>
        <p>
          You may request immediate deletion at any time by contacting {COMPANY_EMAIL}.
          See Section 8 for your full rights.
        </p>
      </div>
    ),
  },
  {
    id: 'security',
    heading: '6. Security',
    content: (
      <div>
        <p>We implement industry-standard safeguards including:</p>
        <ul>
          <li>TLS 1.3 encryption in transit</li>
          <li>AES-256 encryption at rest for sensitive fields</li>
          <li>Hashed passwords (bcrypt, never stored in plaintext)</li>
          <li>Row-level security (RLS) in our database to enforce tenant isolation</li>
          <li>Multi-factor authentication available for all accounts</li>
          <li>Regular security audits and penetration tests</li>
          <li>Immutable audit logs for sensitive operations</li>
        </ul>
        <p>
          No method of transmission over the Internet is 100% secure. If you discover a
          security vulnerability, please report it responsibly to {COMPANY_EMAIL}.
        </p>
      </div>
    ),
  },
  {
    id: 'cookies',
    heading: '7. Cookies and Tracking',
    content: (
      <div>
        <p>We use the following categories of cookies:</p>
        <ul>
          <li><strong>Essential cookies:</strong> required for login sessions and security. Cannot be disabled.</li>
          <li><strong>Preference cookies:</strong> remember your settings (theme, language, timezone).</li>
          <li><strong>Analytics cookies:</strong> help us understand how the Service is used (anonymized). Opt-out available in Settings.</li>
          <li><strong>Marketing cookies:</strong> used only with your explicit consent for remarketing. Opt-in required.</li>
        </ul>
        <p>
          You can manage your cookie preferences in our Cookie Consent banner or in your account
          Settings at any time. Disabling non-essential cookies will not affect core functionality.
        </p>
      </div>
    ),
  },
  {
    id: 'your-rights',
    heading: '8. Your Rights',
    content: (
      <div>
        <p>
          Depending on your location, you may have the following rights regarding your personal data:
        </p>
        <ul>
          <li><strong>Access:</strong> request a copy of all data we hold about you.</li>
          <li><strong>Rectification:</strong> correct inaccurate or incomplete data.</li>
          <li><strong>Erasure:</strong> request deletion of your data ("right to be forgotten").</li>
          <li><strong>Portability:</strong> receive your data in a machine-readable format.</li>
          <li><strong>Restriction:</strong> request we limit how we process your data.</li>
          <li><strong>Objection:</strong> object to processing based on legitimate interests.</li>
          <li><strong>Withdraw consent:</strong> where processing is based on consent, withdraw it at any time.</li>
        </ul>
        <p>
          To exercise any right, email <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a> or
          visit <strong>Settings → Privacy</strong> in the app. We will respond within 30 days.
        </p>
        <p>
          If you are located in the EEA, you have the right to lodge a complaint with your
          local data protection authority.
        </p>
      </div>
    ),
  },
  {
    id: 'children',
    heading: '9. Children\'s Privacy',
    content: (
      <p>
        The Service is not directed to children under 16. We do not knowingly collect personal
        information from anyone under 16. If we learn we have collected data from a child under 16,
        we will delete it immediately. If you believe a child has provided us with personal data,
        contact us at {COMPANY_EMAIL}.
      </p>
    ),
  },
  {
    id: 'international',
    heading: '10. International Transfers',
    content: (
      <p>
        Your information may be transferred to and processed in the United States and other
        countries. When transferring data from the EEA or UK, we rely on Standard Contractual
        Clauses (SCCs) approved by the European Commission. By using the Service, you consent
        to this transfer under the protections described in this policy.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: '11. Changes to This Policy',
    content: (
      <p>
        We may update this Privacy Policy from time to time. Material changes will be
        communicated via email or an in-app notification at least 14 days before they take
        effect. The "Last Updated" date at the top of this page reflects the most recent revision.
        Continued use of the Service after the effective date constitutes your acceptance of the
        updated policy.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: '12. Contact Us',
    content: (
      <div>
        <p>For privacy-related questions, requests, or concerns:</p>
        <address style={{ fontStyle: 'normal', lineHeight: 2 }}>
          <strong>{COMPANY_NAME}</strong><br/>
          Privacy Team<br/>
          {COMPANY_ADDRESS}<br/>
          Email: <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
        </address>
      </div>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="policy-page">
      {/* Header */}
      <header className="policy-header">
        <div className="policy-header__inner">
          <Link to="/" className="policy-logo" aria-label="Marketer Pro home">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#ppLogoGrad)"/>
              <path d="M10 28L18 12L22 22L26 16L30 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="ppLogoGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366f1"/>
                  <stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
            <span>Marketer Pro</span>
          </Link>
          <nav className="policy-header__nav" aria-label="Legal pages">
            <Link to="/terms" className="policy-header__nav-link">Terms of Service</Link>
            <Link to="/privacy" className="policy-header__nav-link policy-header__nav-link--active">Privacy Policy</Link>
          </nav>
        </div>
      </header>

      <div className="policy-layout">
        {/* Main content */}
        <main className="policy-main" id="main-content">
          {/* Hero */}
          <div className="policy-hero">
            <h1 className="policy-hero__heading">Privacy Policy</h1>
            <p className="policy-hero__meta">
              Last updated: <time dateTime="2025-06-01">{LAST_UPDATED}</time>
            </p>
            <p className="policy-hero__intro">
              We built Marketer Pro on a foundation of trust. This policy explains exactly
              what we collect, why we collect it, and how you stay in control of your data.
            </p>
          </div>

          {/* TL;DR cards */}
          <section className="tldr-section" aria-label="Privacy summary">
            <h2 className="tldr-section__heading">The short version</h2>
            <div className="tldr-grid">
              {TLDR_ITEMS.map(({ icon, title, body }) => (
                <div key={title} className="tldr-card">
                  <span className="tldr-card__icon" aria-hidden="true">{icon}</span>
                  <div>
                    <strong className="tldr-card__title">{title}</strong>
                    <p className="tldr-card__body">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="policy-divider"/>

          {/* Sections */}
          {sections.map(({ id, heading, content }) => (
            <section
              key={id}
              id={id}
              className="policy-section"
              aria-labelledby={`${id}-heading`}
            >
              <h2 id={`${id}-heading`} className="policy-section__heading">{heading}</h2>
              <div className="policy-section__content">{content}</div>
            </section>
          ))}
        </main>

        {/* Sticky table of contents */}
        <aside className="policy-toc" aria-label="Table of contents">
          <div className="policy-toc__inner">
            <p className="policy-toc__label">On this page</p>
            <nav>
              <ul className="policy-toc__list" role="list">
                {sections.map(({ id, heading }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className={`policy-toc__link ${activeSection === id ? 'policy-toc__link--active' : ''}`}
                      aria-current={activeSection === id ? 'location' : undefined}
                    >
                      {heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="policy-toc__actions">
              <a href={`mailto:${COMPANY_EMAIL}`} className="policy-toc__action-link">
                📧 Privacy questions?
              </a>
              <button
                className="policy-toc__action-link"
                onClick={() => window.print()}
                aria-label="Print this privacy policy"
              >
                🖨️ Print this page
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="policy-footer">
        <p>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
        <nav aria-label="Footer legal links">
          <Link to="/terms">Terms of Service</Link>
          <span aria-hidden="true">·</span>
          <Link to="/privacy">Privacy Policy</Link>
          <span aria-hidden="true">·</span>
          <a href={`mailto:${COMPANY_EMAIL}`}>Contact</a>
        </nav>
      </footer>

      <style>{`
        .policy-page {
          --brand: #6366f1;
          --brand-light: #f5f3ff;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-tertiary: #94a3b8;
          --border: #e2e8f0;
          --surface: #ffffff;
          font-family: "Inter var", Inter, system-ui, sans-serif;
          color: var(--text-primary);
          background: #fafafa;
          min-height: 100dvh;
        }

        /* Header */
        .policy-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
        }
        .policy-header__inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .policy-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 16px;
          letter-spacing: -0.2px;
        }
        .policy-header__nav { display: flex; gap: 24px; }
        .policy-header__nav-link {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 4px 0;
          border-bottom: 2px solid transparent;
          transition: color 160ms ease, border-color 160ms ease;
        }
        .policy-header__nav-link:hover { color: var(--brand); }
        .policy-header__nav-link--active {
          color: var(--brand);
          border-bottom-color: var(--brand);
        }

        /* Layout */
        .policy-layout {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
        }
        @media (min-width: 1024px) {
          .policy-layout {
            grid-template-columns: 1fr 260px;
            align-items: start;
          }
        }

        /* Main */
        .policy-main { display: flex; flex-direction: column; gap: 48px; min-width: 0; }

        /* Hero */
        .policy-hero {
          padding: 40px;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%);
          border-radius: 16px;
          color: white;
        }
        .policy-hero__heading {
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 800;
          letter-spacing: -0.8px;
          margin: 0 0 8px;
        }
        .policy-hero__meta {
          font-size: 13px;
          color: rgba(255,255,255,.6);
          margin: 0 0 16px;
        }
        .policy-hero__intro {
          font-size: 16px;
          line-height: 1.65;
          color: rgba(255,255,255,.85);
          max-width: 520px;
          margin: 0;
        }

        /* TL;DR */
        .tldr-section {}
        .tldr-section__heading {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-tertiary);
          margin: 0 0 16px;
        }
        .tldr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .tldr-card {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 10px;
        }
        .tldr-card__icon { font-size: 22px; flex-shrink: 0; line-height: 1; }
        .tldr-card__title { display: block; font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .tldr-card__body { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5; }

        /* Divider */
        .policy-divider { border: none; border-top: 1px solid var(--border); margin: 0; }

        /* Sections */
        .policy-section { display: flex; flex-direction: column; gap: 16px; scroll-margin-top: 80px; }
        .policy-section__heading {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin: 0;
          color: var(--text-primary);
        }
        .policy-section__content {
          font-size: 15px;
          line-height: 1.75;
          color: var(--text-secondary);
        }
        .policy-section__content p { margin: 0 0 14px; }
        .policy-section__content p:last-child { margin-bottom: 0; }
        .policy-section__content h3 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 20px 0 8px;
        }
        .policy-section__content ul {
          padding-left: 20px;
          margin: 0 0 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .policy-section__content li { margin: 0; }
        .policy-section__content a { color: var(--brand); }
        .policy-section__content address { margin-top: 8px; }

        /* TOC */
        .policy-toc { display: none; }
        @media (min-width: 1024px) {
          .policy-toc {
            display: block;
            position: sticky;
            top: 80px;
          }
        }
        .policy-toc__inner {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .policy-toc__label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-tertiary);
          margin: 0;
        }
        .policy-toc__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .policy-toc__link {
          display: block;
          font-size: 13px;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 5px 8px;
          border-radius: 6px;
          border-left: 2px solid transparent;
          transition: color 160ms ease, background 160ms ease, border-color 160ms ease;
          line-height: 1.4;
        }
        .policy-toc__link:hover { color: var(--brand); background: var(--brand-light); }
        .policy-toc__link--active {
          color: var(--brand);
          background: var(--brand-light);
          border-left-color: var(--brand);
          font-weight: 500;
        }
        .policy-toc__actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        .policy-toc__action-link {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12.5px;
          color: var(--text-tertiary);
          text-decoration: none;
          text-align: left;
          padding: 4px 8px;
          border-radius: 6px;
          transition: color 160ms ease;
          font-family: inherit;
        }
        .policy-toc__action-link:hover { color: var(--brand); }

        /* Footer */
        .policy-footer {
          border-top: 1px solid var(--border);
          padding: 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
          color: var(--text-tertiary);
        }
        .policy-footer nav { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .policy-footer a { color: var(--text-secondary); text-decoration: none; }
        .policy-footer a:hover { color: var(--brand); }

        @media print {
          .policy-header, .policy-toc, .policy-footer { display: none; }
          .policy-layout { padding: 0; grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicyPage;
