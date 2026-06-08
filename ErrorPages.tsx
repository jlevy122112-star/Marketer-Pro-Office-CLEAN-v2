/**
 * ErrorPages.tsx
 * 404 Not Found and 500 Server Error pages for Marketer Pro.
 *
 * UX Principles:
 * - User is never left stranded — always given a clear next action
 * - Tone: calm, helpful, never blaming the user
 * - Brand-consistent even in failure states
 * - Accessible: descriptive headings, role="main", focus management
 * - Helpful suggestions based on common user destinations
 */

import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Shared shell ─────────────────────────────────────────────────────────────

interface ErrorShellProps {
  statusCode: number;
  heading: string;
  body: string;
  illustration: React.ReactNode;
  suggestions?: Array<{ label: string; href: string; icon: string }>;
  primaryCta: { label: string; href?: string; onClick?: () => void };
  secondaryCta?: { label: string; href?: string; onClick?: () => void };
}

const ErrorShell: React.FC<ErrorShellProps> = ({
  statusCode, heading, body, illustration, suggestions,
  primaryCta, secondaryCta,
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    headingRef.current?.focus();
    // Report 500s to monitoring in production
    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
      // TODO: logError({ type: '500', path: window.location.pathname })
    }
  }, [statusCode]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '32px 24px',
        fontFamily: '"Inter var", Inter, system-ui, sans-serif',
        background: 'linear-gradient(160deg, #f8fafc 0%, #f0f0ff 100%)',
        textAlign: 'center',
        gap: '32px',
      }}
    >
      {/* Illustration */}
      <div aria-hidden="true">{illustration}</div>

      {/* Copy */}
      <div style={{ maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          aria-hidden="true"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#6366f1',
          }}
        >
          {statusCode} Error
        </div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: 700,
            letterSpacing: '-0.6px',
            color: '#0f172a',
            margin: 0,
            lineHeight: 1.2,
            outline: 'none',
          }}
        >
          {heading}
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#475569',
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          {body}
        </p>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {primaryCta.href ? (
          <Link
            to={primaryCta.href}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(99,102,241,.3)',
              transition: 'opacity 160ms ease, transform 160ms ease',
            }}
          >
            {primaryCta.label}
          </Link>
        ) : (
          <button
            onClick={primaryCta.onClick}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99,102,241,.3)',
            }}
          >
            {primaryCta.label}
          </button>
        )}
        {secondaryCta && (
          secondaryCta.href ? (
            <Link
              to={secondaryCta.href}
              style={{
                padding: '12px 28px',
                border: '1.5px solid #e2e8f0',
                color: '#475569',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 500,
                background: 'white',
              }}
            >
              {secondaryCta.label}
            </Link>
          ) : (
            <button
              onClick={secondaryCta.onClick}
              style={{
                padding: '12px 28px',
                border: '1.5px solid #e2e8f0',
                color: '#475569',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                background: 'white',
              }}
            >
              {secondaryCta.label}
            </button>
          )
        )}
      </div>

      {/* Quick link suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 12px' }}>
            Or jump to one of these:
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {suggestions.map(({ label, href, icon }) => (
              <Link
                key={href}
                to={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '999px',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: '#475569',
                  textDecoration: 'none',
                  background: 'white',
                  transition: 'border-color 160ms ease, color 160ms ease',
                }}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Brand footer */}
      <div style={{ position: 'absolute', bottom: '24px' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: '#94a3b8',
            fontSize: '13px',
            fontWeight: 500,
          }}
          aria-label="Marketer Pro — go to home"
        >
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="url(#errLogoGrad)"/>
            <path d="M10 28L18 12L22 22L26 16L30 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="errLogoGrad" x1="0" y1="0" x2="40" y2="40">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
          Marketer Pro
        </Link>
      </div>
    </main>
  );
};

// ─── 404 Illustration ─────────────────────────────────────────────────────────

const NotFoundIllustration = () => (
  <svg width="200" height="140" viewBox="0 0 200 140" fill="none" aria-hidden="true">
    <rect x="20" y="30" width="160" height="100" rx="12" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5"/>
    <rect x="35" y="50" width="80" height="8" rx="4" fill="#e2e8f0"/>
    <rect x="35" y="66" width="60" height="6" rx="3" fill="#e2e8f0"/>
    <rect x="35" y="80" width="70" height="6" rx="3" fill="#e2e8f0"/>
    <circle cx="148" cy="95" r="28" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
    <text x="136" y="102" fontFamily="system-ui" fontSize="22" fontWeight="700" fill="#6366f1">?</text>
    {/* Floating question marks */}
    <text x="168" y="75" fontFamily="system-ui" fontSize="14" fill="#c7d2fe" opacity=".8">?</text>
    <text x="108" y="70" fontFamily="system-ui" fontSize="10" fill="#c7d2fe" opacity=".6">?</text>
    <text x="155" y="118" fontFamily="system-ui" fontSize="12" fill="#c7d2fe" opacity=".7">?</text>
  </svg>
);

// ─── 500 Illustration ─────────────────────────────────────────────────────────

const ServerErrorIllustration = () => (
  <svg width="200" height="140" viewBox="0 0 200 140" fill="none" aria-hidden="true">
    <rect x="40" y="20" width="120" height="60" rx="8" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5"/>
    <rect x="50" y="32" width="20" height="4" rx="2" fill="#10b981"/>
    <rect x="50" y="42" width="20" height="4" rx="2" fill="#10b981"/>
    <rect x="50" y="52" width="20" height="4" rx="2" fill="#f59e0b"/>
    <rect x="80" y="32" width="60" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="80" y="42" width="45" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="80" y="52" width="50" height="4" rx="2" fill="#e2e8f0"/>
    {/* Lightning bolt */}
    <path d="M95 90 L108 110 L100 110 L113 130" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="100" cy="100" r="20" fill="#fef9c3" opacity=".6"/>
  </svg>
);

// ─── Page components ──────────────────────────────────────────────────────────

const COMMON_SUGGESTIONS = [
  { label: 'Create content', href: '/create', icon: '✨' },
  { label: 'Content plan', href: '/plan', icon: '📅' },
  { label: 'Analytics', href: '/analyze', icon: '📊' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ErrorShell
      statusCode={404}
      heading="We can't find that page"
      body="The page you're looking for may have been moved, renamed, or doesn't exist. Let's get you back on track."
      illustration={<NotFoundIllustration />}
      suggestions={COMMON_SUGGESTIONS}
      primaryCta={{ label: '← Back to dashboard', href: '/' }}
      secondaryCta={{ label: 'Go back', onClick: () => navigate(-1) }}
    />
  );
};

export const ServerErrorPage: React.FC = () => (
  <ErrorShell
    statusCode={500}
    heading="We're having a moment"
    body="Something unexpected happened on our end. We've been notified and we're on it. Try again in a minute."
    illustration={<ServerErrorIllustration />}
    primaryCta={{ label: 'Try again', onClick: () => window.location.reload() }}
    secondaryCta={{ label: '← Back to dashboard', href: '/' }}
  />
);

export default { NotFoundPage, ServerErrorPage };
