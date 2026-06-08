/**
 * TermsOfUsePage.tsx
 * Terms of Service for Marketer Pro Office Edition.
 *
 * UX Principles:
 * - Plain language summaries alongside legal clauses
 * - Clear section structure with deep-link anchors
 * - Consistent with PrivacyPolicyPage layout and brand
 * - Store-compliant: covers EULA requirements for Apple App Store, Google Play,
 *   and Microsoft Store
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const LAST_UPDATED = 'June 1, 2025';
const COMPANY_NAME = 'Marketer Pro Office Edition';
const COMPANY_EMAIL = 'legal@marketerprooffice.com';
const APP_STORE_URL = 'https://apps.apple.com/app/marketer-pro'; // placeholder

interface PolicySection { id: string; heading: string; plain: string; content: React.ReactNode; }

const sections: PolicySection[] = [
  {
    id: 'acceptance',
    heading: '1. Acceptance of Terms',
    plain: 'By using the app, you agree to these terms.',
    content: (
      <p>
        By downloading, installing, accessing, or using Marketer Pro ("Service"), you agree to
        be bound by these Terms of Service ("Terms"). If you do not agree to all Terms, do not
        use the Service. These Terms constitute a legally binding agreement between you and{' '}
        {COMPANY_NAME} ("Company", "we", "us", "our").
      </p>
    ),
  },
  {
    id: 'eligibility',
    heading: '2. Eligibility',
    plain: 'You must be 16+ and have legal authority to agree.',
    content: (
      <p>
        You must be at least 16 years old to use the Service. By using the Service, you represent
        that you are of legal age to form a binding contract and are not prohibited from using the
        Service under applicable law. If you are using the Service on behalf of an organization,
        you represent that you have the authority to bind that organization to these Terms.
      </p>
    ),
  },
  {
    id: 'license',
    heading: '3. License and Restrictions',
    plain: 'We grant you a limited license to use the app for your own business.',
    content: (
      <div>
        <p>
          Subject to your compliance with these Terms and payment of applicable fees, we grant
          you a limited, non-exclusive, non-transferable, revocable license to access and use
          the Service for your internal business purposes.
        </p>
        <p>You may not:</p>
        <ul>
          <li>Copy, modify, distribute, sell, or lease any part of the Service</li>
          <li>Reverse engineer, decompile, or attempt to extract source code</li>
          <li>Use the Service to build a competing product</li>
          <li>Scrape, crawl, or use automated means to access the Service beyond normal use</li>
          <li>Circumvent any rate limits, access controls, or security measures</li>
          <li>Use the Service for any illegal purpose or in violation of any laws</li>
        </ul>
        <p>
          <strong>App Store Additional Terms:</strong> These Terms incorporate Apple's Licensed
          Application End User License Agreement (EULA) by reference for iOS users. In the event
          of a conflict between Apple's standard EULA terms and these Terms, these Terms will
          prevail to the extent permitted.
        </p>
      </div>
    ),
  },
  {
    id: 'subscriptions',
    heading: '4. Subscriptions and Billing',
    plain: 'Subscriptions auto-renew. Cancel any time. 14-day refund policy.',
    content: (
      <div>
        <h3>Subscription Plans</h3>
        <p>
          The Service is offered on a subscription basis. Available plans (Starter, Pro,
          Enterprise) are described on our Pricing page. All prices are in USD unless otherwise
          stated.
        </p>
        <h3>Billing and Renewal</h3>
        <p>
          Subscriptions automatically renew at the end of each billing period unless cancelled
          before the renewal date. By subscribing, you authorize us (via Stripe) to charge your
          payment method on a recurring basis.
        </p>
        <h3>Cancellation</h3>
        <p>
          You may cancel your subscription at any time through Settings → Subscription. Access
          continues until the end of the current billing period.
        </p>
        <h3>Refunds</h3>
        <p>
          We offer a 14-day money-back guarantee for new subscriptions. No questions asked.
          Refund requests beyond 14 days are evaluated on a case-by-case basis. Contact{' '}
          {COMPANY_EMAIL} to request a refund.
        </p>
        <h3>In-App Purchases (Mobile)</h3>
        <p>
          Subscriptions purchased through the Apple App Store are subject to Apple's payment and
          refund policies. Subscriptions purchased through Google Play are subject to Google's
          payment and refund policies. We cannot issue refunds for purchases made through
          third-party app stores; please contact the respective store.
        </p>
        <h3>Price Changes</h3>
        <p>
          We reserve the right to change subscription prices with 30 days' notice. Continued
          use after the effective date constitutes acceptance of the new price.
        </p>
      </div>
    ),
  },
  {
    id: 'content',
    heading: '5. User Content and AI-Generated Content',
    plain: 'You own your content. We don't use it to train AI without consent.',
    content: (
      <div>
        <h3>Your Content</h3>
        <p>
          You retain all ownership rights to content you upload or create ("User Content"). By
          uploading User Content, you grant us a limited license to store, process, and display
          it solely to provide the Service.
        </p>
        <h3>AI-Generated Content</h3>
        <p>
          Content generated by our AI engine based on your inputs ("Generated Content") is
          provided to you for your use. We do not claim ownership of Generated Content, but you
          are responsible for ensuring its use complies with applicable laws and platform policies.
        </p>
        <h3>Prohibited Content</h3>
        <p>You agree not to create, upload, or publish content that:</p>
        <ul>
          <li>Is illegal, defamatory, obscene, or hateful</li>
          <li>Infringes any third party's intellectual property rights</li>
          <li>Contains malware, spam, or unauthorized advertising</li>
          <li>Impersonates another person or entity</li>
          <li>Violates any social media platform's terms of service</li>
        </ul>
        <h3>Content Responsibility</h3>
        <p>
          You are solely responsible for reviewing Generated Content before publishing. We do
          not guarantee the accuracy, legality, or appropriateness of AI-generated outputs.
        </p>
      </div>
    ),
  },
  {
    id: 'intellectual-property',
    heading: '6. Intellectual Property',
    plain: 'We own the platform. You own your content.',
    content: (
      <p>
        The Service, including all software, designs, trademarks, and underlying technology,
        is owned by {COMPANY_NAME} and protected by intellectual property laws. Nothing in these
        Terms grants you rights to our intellectual property except the limited license described
        in Section 3. The Marketer Pro name, logo, and product names are trademarks of{' '}
        {COMPANY_NAME}.
      </p>
    ),
  },
  {
    id: 'acceptable-use',
    heading: '7. Acceptable Use Policy',
    plain: 'Use the app responsibly and legally.',
    content: (
      <div>
        <p>You agree to use the Service only for lawful purposes. You must not:</p>
        <ul>
          <li>Attempt to gain unauthorized access to any part of the Service</li>
          <li>Interfere with or disrupt the integrity or performance of the Service</li>
          <li>Use the Service to transmit spam or unsolicited commercial communications</li>
          <li>Engage in activity that could harm other users, third parties, or the platform</li>
          <li>Use the Service to violate any social media platform's terms of service</li>
          <li>Misrepresent your identity or affiliate with false or misleading information</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate this policy without
          prior notice.
        </p>
      </div>
    ),
  },
  {
    id: 'privacy',
    heading: '8. Privacy',
    plain: 'See our full Privacy Policy for details.',
    content: (
      <p>
        Your use of the Service is also governed by our{' '}
        <Link to="/privacy">Privacy Policy</Link>, incorporated herein by reference. By using
        the Service, you consent to the collection and use of your data as described in the
        Privacy Policy.
      </p>
    ),
  },
  {
    id: 'third-party',
    heading: '9. Third-Party Services',
    plain: 'Connecting other apps means their terms apply too.',
    content: (
      <p>
        The Service integrates with third-party platforms (social media networks, payment
        processors, analytics providers). Use of those services is governed by their respective
        terms and privacy policies. We are not responsible for the content, policies, or
        practices of third-party services.
      </p>
    ),
  },
  {
    id: 'disclaimers',
    heading: '10. Disclaimers',
    plain: 'We provide the service "as is." No guarantee of uninterrupted availability.',
    content: (
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
        EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
        FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL
        BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. AI-GENERATED CONTENT IS PROVIDED
        WITHOUT WARRANTY OF ACCURACY OR FITNESS FOR ANY PARTICULAR PURPOSE.
      </p>
    ),
  },
  {
    id: 'liability',
    heading: '11. Limitation of Liability',
    plain: 'Our liability is limited to what you paid us in the last 12 months.',
    content: (
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, {COMPANY_NAME.toUpperCase()} SHALL NOT BE
        LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
        INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS OPPORTUNITIES. IN NO EVENT
        SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING
        THE CLAIM.
      </p>
    ),
  },
  {
    id: 'termination',
    heading: '12. Termination',
    plain: 'Either party can terminate. Your data is available for 30 days after.',
    content: (
      <div>
        <p>
          You may terminate your account at any time through Settings. We may suspend or
          terminate your access immediately, with or without notice, if you violate these Terms
          or for any other reason at our discretion.
        </p>
        <p>
          Upon termination, your right to use the Service ceases. Your data will be retained
          for 30 days and then permanently deleted, except where retention is required by law.
          Sections that by their nature should survive termination (including Sections 5–11)
          will survive.
        </p>
      </div>
    ),
  },
  {
    id: 'governing-law',
    heading: '13. Governing Law and Disputes',
    plain: 'Texas law applies. Disputes resolved by arbitration.',
    content: (
      <div>
        <p>
          These Terms are governed by the laws of the State of Texas, United States, without
          regard to conflict of law principles.
        </p>
        <p>
          Any dispute arising from these Terms or your use of the Service shall be resolved
          through binding arbitration administered by the American Arbitration Association (AAA),
          except for claims that qualify for small claims court. You waive any right to a jury
          trial or class action proceedings.
        </p>
        <p>
          Notwithstanding the above, either party may seek injunctive or other equitable relief
          in any court of competent jurisdiction.
        </p>
      </div>
    ),
  },
  {
    id: 'changes',
    heading: '14. Changes to Terms',
    plain: 'We'll notify you 14 days before material changes.',
    content: (
      <p>
        We may modify these Terms at any time. Material changes will be communicated via email
        or in-app notification at least 14 days before they take effect. Continued use of the
        Service after the effective date constitutes acceptance of the updated Terms.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: '15. Contact',
    plain: 'Reach us any time.',
    content: (
      <address style={{ fontStyle: 'normal', lineHeight: 2 }}>
        <strong>{COMPANY_NAME}</strong><br/>
        Legal Team<br/>
        Houston, TX, USA<br/>
        Email: <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
      </address>
    ),
  },
];

export const TermsOfUsePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="policy-page">
      <header className="policy-header">
        <div className="policy-header__inner">
          <Link to="/" className="policy-logo" aria-label="Marketer Pro home">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#tosLogoGrad)"/>
              <path d="M10 28L18 12L22 22L26 16L30 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="tosLogoGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366f1"/>
                  <stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
            <span>Marketer Pro</span>
          </Link>
          <nav className="policy-header__nav" aria-label="Legal pages">
            <Link to="/terms" className="policy-header__nav-link policy-header__nav-link--active">Terms of Service</Link>
            <Link to="/privacy" className="policy-header__nav-link">Privacy Policy</Link>
          </nav>
        </div>
      </header>

      <div className="policy-layout">
        <main className="policy-main" id="main-content">
          <div className="policy-hero">
            <h1 className="policy-hero__heading">Terms of Service</h1>
            <p className="policy-hero__meta">
              Last updated: <time dateTime="2025-06-01">{LAST_UPDATED}</time>
            </p>
            <p className="policy-hero__intro">
              These terms govern your use of Marketer Pro. We've written them to be as clear
              and fair as possible. Each section includes a plain-language summary.
            </p>
          </div>

          <div className="tos-sections">
            {sections.map(({ id, heading, plain, content }) => (
              <section
                key={id}
                id={id}
                className="policy-section"
                aria-labelledby={`${id}-heading`}
              >
                <div className="policy-section__header">
                  <h2 id={`${id}-heading`} className="policy-section__heading">{heading}</h2>
                  <div className="policy-section__plain" aria-label="Plain language summary">
                    💡 {plain}
                  </div>
                </div>
                <div className="policy-section__content">{content}</div>
              </section>
            ))}
          </div>
        </main>

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
                ⚖️ Legal questions?
              </a>
              <button className="policy-toc__action-link" onClick={() => window.print()}>
                🖨️ Print this page
              </button>
            </div>
          </div>
        </aside>
      </div>

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
        .policy-header {
          position: sticky; top: 0; z-index: 50;
          background: rgba(255,255,255,.95); backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
        }
        .policy-header__inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          height: 60px; display: flex; align-items: center; justify-content: space-between;
        }
        .policy-logo {
          display: flex; align-items: center; gap: 8px; text-decoration: none;
          color: var(--text-primary); font-weight: 700; font-size: 16px; letter-spacing: -0.2px;
        }
        .policy-header__nav { display: flex; gap: 24px; }
        .policy-header__nav-link {
          font-size: 14px; font-weight: 500; color: var(--text-secondary);
          text-decoration: none; padding: 4px 0; border-bottom: 2px solid transparent;
          transition: color 160ms ease, border-color 160ms ease;
        }
        .policy-header__nav-link:hover { color: var(--brand); }
        .policy-header__nav-link--active { color: var(--brand); border-bottom-color: var(--brand); }
        .policy-layout {
          max-width: 1200px; margin: 0 auto; padding: 48px 24px 80px;
          display: grid; grid-template-columns: 1fr; gap: 48px;
        }
        @media (min-width: 1024px) {
          .policy-layout { grid-template-columns: 1fr 260px; align-items: start; }
        }
        .policy-main { display: flex; flex-direction: column; gap: 40px; min-width: 0; }
        .policy-hero {
          padding: 40px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e1b4b 100%);
          border-radius: 16px; color: white;
        }
        .policy-hero__heading {
          font-size: clamp(28px, 5vw, 40px); font-weight: 800;
          letter-spacing: -0.8px; margin: 0 0 8px;
        }
        .policy-hero__meta { font-size: 13px; color: rgba(255,255,255,.5); margin: 0 0 16px; }
        .policy-hero__intro {
          font-size: 16px; line-height: 1.65; color: rgba(255,255,255,.8);
          max-width: 520px; margin: 0;
        }
        .tos-sections { display: flex; flex-direction: column; gap: 32px; }
        .policy-section {
          background: var(--surface); border: 1.5px solid var(--border);
          border-radius: 12px; padding: 24px; scroll-margin-top: 80px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .policy-section__header { display: flex; flex-direction: column; gap: 8px; }
        .policy-section__heading {
          font-size: 17px; font-weight: 700; letter-spacing: -0.3px; margin: 0;
        }
        .policy-section__plain {
          font-size: 13.5px; color: var(--brand); background: var(--brand-light);
          padding: 8px 12px; border-radius: 6px; font-weight: 500; line-height: 1.5;
        }
        .policy-section__content {
          font-size: 14.5px; line-height: 1.75; color: var(--text-secondary);
        }
        .policy-section__content p { margin: 0 0 12px; }
        .policy-section__content p:last-child { margin-bottom: 0; }
        .policy-section__content h3 {
          font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 16px 0 6px;
        }
        .policy-section__content ul {
          padding-left: 20px; margin: 0 0 12px; display: flex; flex-direction: column; gap: 5px;
        }
        .policy-section__content a { color: var(--brand); }
        .policy-toc { display: none; }
        @media (min-width: 1024px) {
          .policy-toc { display: block; position: sticky; top: 80px; }
        }
        .policy-toc__inner {
          background: var(--surface); border: 1.5px solid var(--border);
          border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 16px;
        }
        .policy-toc__label {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 1px; color: var(--text-tertiary); margin: 0;
        }
        .policy-toc__list {
          list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px;
        }
        .policy-toc__link {
          display: block; font-size: 12.5px; color: var(--text-secondary); text-decoration: none;
          padding: 5px 8px; border-radius: 6px; border-left: 2px solid transparent;
          transition: color 160ms ease, background 160ms ease, border-color 160ms ease; line-height: 1.4;
        }
        .policy-toc__link:hover { color: var(--brand); background: var(--brand-light); }
        .policy-toc__link--active {
          color: var(--brand); background: var(--brand-light);
          border-left-color: var(--brand); font-weight: 500;
        }
        .policy-toc__actions {
          display: flex; flex-direction: column; gap: 4px;
          padding-top: 12px; border-top: 1px solid var(--border);
        }
        .policy-toc__action-link {
          background: none; border: none; cursor: pointer; font-size: 12.5px;
          color: var(--text-tertiary); text-decoration: none; text-align: left;
          padding: 4px 8px; border-radius: 6px; transition: color 160ms ease; font-family: inherit;
        }
        .policy-toc__action-link:hover { color: var(--brand); }
        .policy-footer {
          border-top: 1px solid var(--border); padding: 24px; text-align: center;
          display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--text-tertiary);
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

export default TermsOfUsePage;
