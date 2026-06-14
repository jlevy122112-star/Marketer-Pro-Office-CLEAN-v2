// FILE PATH: src/components/common/NextStepBanner.tsx
// Contextual "what to do next" banner for screens with low discoverability.
// Used on: empty analytics, empty vault, post-save in presentation chamber.
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface NextStepBannerProps {
  icon?:    string;
  title:    string;
  body:     string;
  cta:      string;
  onAction: () => void;
  variant?: 'gold' | 'teal' | 'subtle';
}

export function NextStepBanner({
  icon, title, body, cta, onAction, variant = 'subtle',
}: NextStepBannerProps) {
  const border   = variant === 'gold'   ? 'rgba(201,168,76,0.3)'
                 : variant === 'teal'   ? 'rgba(110,231,183,0.3)'
                 : 'rgba(255,255,255,0.08)';
  const bgColor  = variant === 'gold'   ? 'rgba(201,168,76,0.07)'
                 : variant === 'teal'   ? 'rgba(110,231,183,0.07)'
                 : 'rgba(255,255,255,0.03)';
  const accentColor = variant === 'gold' ? '#C9A84C'
                    : variant === 'teal' ? '#6EE7B7'
                    : 'rgba(255,255,255,0.6)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: bgColor, border: `1px solid ${border}` }}
    >
      <div className="flex items-start gap-3">
        {icon && <span className="text-2xl flex-shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-sm text-white mb-1">{title}</p>
          <p className="font-body text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{body}</p>
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1.5 mt-3 font-display text-2xs font-semibold tracking-widest uppercase"
            style={{ color: accentColor }}
          >
            {cta} <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
