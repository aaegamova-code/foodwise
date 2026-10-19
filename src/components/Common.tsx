import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LearningProgress, PrincipleId, Screen, UserProfile } from '../types';
import { Icon, Wordmark, type IconName } from './Icon';
import { principleById } from '../data/principles';

export function Avatar({ profile, size = 40 }: { profile: UserProfile; size?: number }) {
  const initials = profile.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return profile.photo ? (
    <img className="avatar" src={profile.photo} alt="" width={size} height={size} style={{ width: size, height: size }} />
  ) : (
    <span className="avatar avatar-initials" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials || '🙂'}
    </span>
  );
}

export function TopBar({ profile, onProfile, children }: { profile: UserProfile; onProfile: () => void; children?: ReactNode }) {
  return (
    <header className="topbar">
      <Wordmark />
      <div className="topbar-actions">
        {children}
        <button className="avatar-btn" onClick={onProfile} aria-label="Profile and My Context">
          <Avatar profile={profile} size={38} />
        </button>
      </div>
    </header>
  );
}

const NAV: Array<{ id: Screen; label: string; icon: IconName }> = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'assistant', label: 'AI Assistant', icon: 'sparkle' },
  { id: 'library', label: 'Library', icon: 'book' },
];

export function BottomNavBar({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {NAV.map((n) => (
        <button
          key={n.id}
          className={`nav-item ${screen === n.id ? 'active' : ''} ${n.id === 'assistant' ? 'nav-ai' : ''}`}
          aria-current={screen === n.id ? 'page' : undefined}
          onClick={() => onNavigate(n.id)}
        >
          <span className="nav-icon">
            <Icon name={n.icon} size={n.id === 'assistant' ? 24 : 22} />
          </span>
          <span className="nav-label">{n.label}</span>
        </button>
      ))}
    </nav>
  );
}

/** Accessible bottom sheet with Escape-to-close and focus handling. */
export function Sheet({ title, onClose, children, label }: { title?: ReactNode; label: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={ref}>
        <div className="sheet-grip" aria-hidden="true" />
        <div className="sheet-head">
          {title && <h2 className="sheet-title">{title}</h2>}
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

export const PRINCIPLE_ICON: Record<PrincipleId, IconName> = {
  adequacy: 'shield',
  balance: 'scale',
  moderation: 'sliders',
  diversity: 'grid',
  satisfaction: 'heart',
};

/** Tappable principle tag that reveals its definition — the "Recognise the principle" step. */
export function PrincipleTags({ ids, onRecognize }: { ids: PrincipleId[]; onRecognize?: () => void }) {
  const [open, setOpen] = useState<PrincipleId | null>(null);
  const p = open ? principleById(open) : null;
  return (
    <div className="principle-tags">
      <div className="tag-row" role="group" aria-label="Nutrition principles">
        {ids.map((id) => (
          <button
            key={id}
            className={`ptag ptag-${id} ${open === id ? 'on' : ''}`}
            aria-expanded={open === id}
            onClick={() => {
              setOpen(open === id ? null : id);
              onRecognize?.();
            }}
          >
            <Icon name={PRINCIPLE_ICON[id]} size={14} />
            {principleById(id).name}
          </button>
        ))}
      </div>
      {p && (
        <p className="ptag-detail fade-in">
          <strong>{p.name}{p.source === 'foodwise' ? ' (FoodWise principle)' : ' (WHO)'}:</strong> {p.detail}
        </p>
      )}
    </div>
  );
}

const STEPS: Array<{ key: keyof Omit<LearningProgress, 'practiceCount'> | 'independent'; label: string }> = [
  { key: 'received', label: 'Receive' },
  { key: 'understood', label: 'Understand' },
  { key: 'recognized', label: 'Recognise' },
  { key: 'practiced', label: 'Practise' },
  { key: 'independent', label: 'Choose independently' },
];

export function JourneyTracker({ progress, compact }: { progress: LearningProgress; compact?: boolean }) {
  const done = (k: string) => (k === 'independent' ? progress.practiceCount >= 2 : !!progress[k as keyof LearningProgress]);
  return (
    <ol className={`journey ${compact ? 'compact' : ''}`} aria-label="Your learning journey">
      {STEPS.map((s, i) => (
        <li key={s.key} className={done(s.key) ? 'done' : ''}>
          <span className="journey-dot" aria-hidden="true">{done(s.key) ? <Icon name="check" size={12} strokeWidth={2.6} /> : i + 1}</span>
          <span className="journey-label">
            {s.label}
            <span className="sr-only">{done(s.key) ? ' — reached' : ' — not yet'}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Disclaimer({ children }: { children?: ReactNode }) {
  return (
    <p className="disclaimer">
      <Icon name="info" size={14} />
      <span>
        {children ??
          'FoodWise offers general nutrition education, not medical advice. For allergies, medical conditions or pregnancy, follow the guidance of a qualified health professional.'}
      </span>
    </p>
  );
}
