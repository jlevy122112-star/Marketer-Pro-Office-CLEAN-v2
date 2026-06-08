/**
 * StateComponents.tsx
 * Loading skeletons, empty states, and transitional UI for Marketer Pro.
 *
 * UX Principles:
 * - User NEVER sees a blank screen — skeleton or empty state is always present
 * - Empty states are action-oriented: tell users what to do, not just what's missing
 * - Loading states set realistic expectations (skeleton shapes match real content)
 * - Tone: encouraging, not clinical
 * - All states are accessible: role="status", aria-live, proper headings
 */

import React from 'react';

// ─── Design tokens ────────────────────────────────────────────────────────────

const TOKEN = {
  brandPrimary: '#6366f1',
  brandSecondary: '#8b5cf6',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  border: '#e2e8f0',
  surface: '#ffffff',
  surfaceElevated: '#f8fafc',
  skeletonBase: '#f1f5f9',
  skeletonShimmer: '#e2e8f0',
} as const;

// ─── Skeleton shimmer animation ───────────────────────────────────────────────

const SKELETON_STYLE = `
  @keyframes skeletonShimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, ${TOKEN.skeletonBase} 25%, ${TOKEN.skeletonShimmer} 50%, ${TOKEN.skeletonBase} 75%);
    background-size: 800px 100%;
    animation: skeletonShimmer 1.4s ease-in-out infinite;
    border-radius: 6px;
  }
  @media (prefers-reduced-motion: reduce) {
    .skeleton { animation: none; background: ${TOKEN.skeletonBase}; }
  }
`;

const SkeletonStyleTag = () => <style>{SKELETON_STYLE}</style>;

// ─── Skeleton primitives ──────────────────────────────────────────────────────

interface SkeletonBlockProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = '100%', height = 16, borderRadius = 6, style,
}) => (
  <div
    className="skeleton"
    aria-hidden="true"
    style={{ width, height, borderRadius, flexShrink: 0, ...style }}
  />
);

// ─── Content card skeleton ────────────────────────────────────────────────────

export const ContentCardSkeleton: React.FC = () => (
  <div
    style={{
      background: TOKEN.surface,
      border: `1.5px solid ${TOKEN.border}`,
      borderRadius: 12,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}
    aria-hidden="true"
  >
    <SkeletonStyleTag />
    {/* Platform badge */}
    <SkeletonBlock width={80} height={20} borderRadius={999} />
    {/* Content preview */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SkeletonBlock height={14} />
      <SkeletonBlock height={14} width="85%" />
      <SkeletonBlock height={14} width="60%" />
    </div>
    {/* Image placeholder */}
    <SkeletonBlock height={140} borderRadius={8} />
    {/* Footer row */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <SkeletonBlock width={100} height={14} />
      <div style={{ display: 'flex', gap: 8 }}>
        <SkeletonBlock width={32} height={32} borderRadius={8} />
        <SkeletonBlock width={32} height={32} borderRadius={8} />
      </div>
    </div>
  </div>
);

// ─── Content grid skeleton ────────────────────────────────────────────────────

interface ContentGridSkeletonProps {
  count?: number;
}

export const ContentGridSkeleton: React.FC<ContentGridSkeletonProps> = ({ count = 6 }) => (
  <div
    role="status"
    aria-label="Loading content"
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 16,
    }}
  >
    <SkeletonStyleTag />
    <span className="sr-only">Loading your content…</span>
    {Array.from({ length: count }).map((_, i) => (
      <ContentCardSkeleton key={i} />
    ))}
  </div>
);

// ─── Analytics skeleton ───────────────────────────────────────────────────────

export const AnalyticsSkeleton: React.FC = () => (
  <div role="status" aria-label="Loading analytics" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <SkeletonStyleTag />
    <span className="sr-only">Loading analytics…</span>
    {/* Metric cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ background: TOKEN.surface, border: `1.5px solid ${TOKEN.border}`, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkeletonBlock width={90} height={12} />
          <SkeletonBlock width={120} height={28} />
          <SkeletonBlock width={60} height={12} />
        </div>
      ))}
    </div>
    {/* Chart area */}
    <div style={{ background: TOKEN.surface, border: `1.5px solid ${TOKEN.border}`, borderRadius: 12, padding: 24 }}>
      <SkeletonBlock width={160} height={18} style={{ marginBottom: 20 }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
        {[60, 90, 45, 120, 80, 110, 70].map((h, i) => (
          <SkeletonBlock key={i} width="100%" height={h} borderRadius={4} style={{ flex: 1 }} />
        ))}
      </div>
    </div>
  </div>
);

// ─── Schedule skeleton ────────────────────────────────────────────────────────

export const ScheduleSkeleton: React.FC = () => (
  <div role="status" aria-label="Loading schedule" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <SkeletonStyleTag />
    <span className="sr-only">Loading your schedule…</span>
    {/* Week header */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonBlock key={i} height={40} borderRadius={8} />
      ))}
    </div>
    {/* Events */}
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <SkeletonBlock width={48} height={48} borderRadius={8} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonBlock height={14} width="70%" />
          <SkeletonBlock height={12} width="45%" />
        </div>
        <SkeletonBlock width={80} height={28} borderRadius={999} />
      </div>
    ))}
  </div>
);

// ─── Full-page loading spinner ────────────────────────────────────────────────

interface FullPageLoadingProps {
  message?: string;
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  message = 'Loading…',
}) => (
  <div
    role="status"
    aria-label={message}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '16px',
      fontFamily: '"Inter var", Inter, system-ui, sans-serif',
    }}
  >
    <div
      style={{
        width: '36px',
        height: '36px',
        border: '3px solid #e2e8f0',
        borderTopColor: TOKEN.brandPrimary,
        borderRadius: '50%',
        animation: 'fpSpin 600ms linear infinite',
      }}
    />
    <p style={{ fontSize: '14px', color: TOKEN.textTertiary, margin: 0 }}>{message}</p>
    <style>{`@keyframes fpSpin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── Empty states ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  illustration: React.ReactNode;
  heading: string;
  body: string;
  cta?: { label: string; onClick: () => void; icon?: string };
  secondaryCta?: { label: string; onClick: () => void };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  illustration, heading, body, cta, secondaryCta,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '48px 24px',
      gap: '20px',
      fontFamily: '"Inter var", Inter, system-ui, sans-serif',
    }}
    role="status"
    aria-live="polite"
  >
    <div aria-hidden="true">{illustration}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '340px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: TOKEN.textPrimary, margin: 0, letterSpacing: '-0.3px' }}>
        {heading}
      </h2>
      <p style={{ fontSize: '14px', color: TOKEN.textSecondary, margin: 0, lineHeight: 1.6 }}>
        {body}
      </p>
    </div>
    {(cta || secondaryCta) && (
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {cta && (
          <button
            onClick={cta.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              background: `linear-gradient(135deg, ${TOKEN.brandPrimary}, ${TOKEN.brandSecondary})`,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99,102,241,.25)',
            }}
          >
            {cta.icon && <span aria-hidden="true">{cta.icon}</span>}
            {cta.label}
          </button>
        )}
        {secondaryCta && (
          <button
            onClick={secondaryCta.onClick}
            style={{
              padding: '10px 20px',
              border: `1.5px solid ${TOKEN.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'white',
              color: TOKEN.textSecondary,
            }}
          >
            {secondaryCta.label}
          </button>
        )}
      </div>
    )}
  </div>
);

// ─── Specific empty states ────────────────────────────────────────────────────

// SVG illustrations
const ContentEmptyIllustration = () => (
  <svg width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden="true">
    <rect x="10" y="10" width="100" height="80" rx="10" fill="#f1f5f9"/>
    <rect x="22" y="24" width="76" height="8" rx="4" fill="#e2e8f0"/>
    <rect x="22" y="38" width="55" height="6" rx="3" fill="#e2e8f0"/>
    <rect x="22" y="50" width="65" height="6" rx="3" fill="#e2e8f0"/>
    <circle cx="88" cy="72" r="18" fill="url(#ceiGrad)"/>
    <path d="M82 72H94M88 66V78" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="ceiGrad" x1="70" y1="54" x2="106" y2="90">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#8b5cf6"/>
      </linearGradient>
    </defs>
  </svg>
);

const ScheduleEmptyIllustration = () => (
  <svg width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden="true">
    <rect x="10" y="15" width="100" height="75" rx="10" fill="#f1f5f9"/>
    <rect x="10" y="15" width="100" height="22" rx="10" fill="#e8eaff"/>
    <rect x="10" y="27" width="100" height="10" fill="#e8eaff"/>
    <circle cx="36" cy="26" r="6" fill="white"/>
    <circle cx="84" cy="26" r="6" fill="white"/>
    <rect x="22" y="46" width="24" height="24" rx="6" fill="#e2e8f0"/>
    <rect x="52" y="46" width="24" height="24" rx="6" fill="#e2e8f0"/>
    <rect x="82" y="46" width="16" height="24" rx="6" fill="#e2e8f0"/>
    <text x="31" y="63" fontFamily="system-ui" fontSize="13" fontWeight="700" fill="#6366f1" textAnchor="middle">?</text>
  </svg>
);

const AnalyticsEmptyIllustration = () => (
  <svg width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden="true">
    <rect x="10" y="10" width="100" height="80" rx="10" fill="#f1f5f9"/>
    <rect x="22" y="24" width="60" height="8" rx="4" fill="#e2e8f0"/>
    {[0,1,2,3,4].map((i) => (
      <rect key={i} x={22 + i * 18} y={88 - [30,50,20,65,40][i]} width="12" height={[30,50,20,65,40][i]} rx="4" fill="#e2e8f0"/>
    ))}
    <circle cx="88" cy="35" r="14" fill="#fef9c3"/>
    <text x="88" y="40" fontFamily="system-ui" fontSize="16" textAnchor="middle">📊</text>
  </svg>
);

const NotificationsEmptyIllustration = () => (
  <svg width="100" height="90" viewBox="0 0 100 90" fill="none" aria-hidden="true">
    <circle cx="50" cy="38" r="28" fill="#f1f5f9"/>
    <path d="M38 38c0-6.627 5.373-12 12-12s12 5.373 12 12v8l3 4H35l3-4v-8z" fill="#e2e8f0"/>
    <rect x="45" y="52" width="10" height="4" rx="2" fill="#e2e8f0"/>
    <circle cx="50" cy="38" r="4" fill="white"/>
    <text x="50" y="42" fontFamily="system-ui" fontSize="8" fontWeight="700" fill="#94a3b8" textAnchor="middle">✓</text>
  </svg>
);

// ─── Named empty state components ────────────────────────────────────────────

export const EmptyContentState: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    illustration={<ContentEmptyIllustration />}
    heading="No content yet"
    body="Create your first piece of AI-powered content. It takes less than 60 seconds."
    cta={onCreate ? { label: 'Create content', onClick: onCreate, icon: '✨' } : undefined}
  />
);

export const EmptyScheduleState: React.FC<{ onSchedule?: () => void }> = ({ onSchedule }) => (
  <EmptyState
    illustration={<ScheduleEmptyIllustration />}
    heading="Your schedule is clear"
    body="You haven't scheduled any content yet. Create a post and set it to publish automatically."
    cta={onSchedule ? { label: 'Schedule content', onClick: onSchedule, icon: '📅' } : undefined}
  />
);

export const EmptyAnalyticsState: React.FC = () => (
  <EmptyState
    illustration={<AnalyticsEmptyIllustration />}
    heading="No data yet"
    body="Publish content and connect your social accounts to start seeing performance insights here."
    cta={{ label: 'Connect accounts', onClick: () => {}, icon: '🔗' }}
  />
);

export const EmptyNotificationsState: React.FC = () => (
  <EmptyState
    illustration={<NotificationsEmptyIllustration />}
    heading="You're all caught up"
    body="No new notifications. We'll let you know when something important happens."
  />
);

export const EmptySearchState: React.FC<{ query: string; onClear: () => void }> = ({ query, onClear }) => (
  <EmptyState
    illustration={
      <svg width="100" height="80" viewBox="0 0 100 80" fill="none" aria-hidden="true">
        <circle cx="42" cy="35" r="22" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
        <line x1="58" y1="51" x2="75" y2="68" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round"/>
        <text x="42" y="40" fontFamily="system-ui" fontSize="16" textAnchor="middle">🔍</text>
      </svg>
    }
    heading={`No results for "${query}"`}
    body="Try different keywords, or browse all content instead."
    cta={{ label: 'Clear search', onClick: onClear }}
  />
);

// ─── Inline loading states ────────────────────────────────────────────────────

export const InlineLoader: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = TOKEN.brandPrimary,
}) => (
  <span role="status" aria-label="Loading" style={{ display: 'inline-flex', alignItems: 'center' }}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'inlineSpin 600ms linear infinite' }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    </svg>
    <style>{`@keyframes inlineSpin { to { transform: rotate(360deg); } }`}</style>
  </span>
);

// ─── Button loading state ─────────────────────────────────────────────────────

export const ButtonLoader: React.FC = () => (
  <span
    role="status"
    aria-hidden="true"
    style={{
      display: 'inline-block',
      width: '14px',
      height: '14px',
      border: '2px solid rgba(255,255,255,.4)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'btnSpin 500ms linear infinite',
    }}
  >
    <style>{`@keyframes btnSpin { to { transform: rotate(360deg); } }`}</style>
  </span>
);

// ─── Screen reader only helper ────────────────────────────────────────────────

export const SrOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0,0,0,0)',
      whiteSpace: 'nowrap',
      border: 0,
    }}
  >
    {children}
  </span>
);
