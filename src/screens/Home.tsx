import { useState } from 'react';
import type { LearningProgress, PrincipleId, Screen, UserProfile } from '../types';
import { Disclaimer, JourneyTracker, PRINCIPLE_ICON, TopBar } from '../components/Common';
import { Icon } from '../components/Icon';
import { PlateViz } from '../components/PlateViz';
import { PRINCIPLES } from '../data/principles';
import { mealById } from '../data/meals';

interface Props {
  profile: UserProfile;
  progress: LearningProgress;
  onNavigate: (s: Screen) => void;
  onProfile: () => void;
  onPrinciple: () => void;
}

export function Home({ profile, progress, onNavigate, onProfile, onPrinciple }: Props) {
  const [openP, setOpenP] = useState<PrincipleId | null>(null);
  const plov = mealById('plov')!;
  const dimlama = mealById('dimlama')!;

  return (
    <div className="home">
      <TopBar profile={profile} onProfile={onProfile} />

      <section className="home-greeting">
        <p className="greeting">Hi, {profile.name}!</p>
      </section>

      <section className="hero-card" aria-labelledby="hero-title">
        <div className="hero-text">
          <span className="eyebrow eyebrow-light">Your food, your way</span>
          <h1 id="hero-title" className="hero-title">Eat Well.<br />Stay You.</h1>
        </div>
        <div className="hero-art" aria-hidden="true">
          <PlateViz spec={plov.plate} seedKey="hero-plov" size={150} showSides={false} />
        </div>
        <p className="hero-copy">
          You don't have to give up the foods you love or the traditions you grew up with to eat healthier. Learn to make balanced choices that fit your life.
        </p>
      </section>

      <section className="feature-grid" aria-label="Main features">
        <article className="feature-card feature-ai" onClick={() => onNavigate('assistant')}>
          <div className="feature-icon"><Icon name="sparkle" size={22} /></div>
          <h2>Context-Aware AI</h2>
          <p>Get practical food suggestions based on your preferences, health context, budget, and daily circumstances. Understand why each option may work for you.</p>
          <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); onNavigate('assistant'); }}>
            Ask FoodWise <Icon name="arrowRight" size={17} />
          </button>
        </article>

        <article className="feature-card feature-lib" onClick={() => onNavigate('library')}>
          <div className="feature-lib-art" aria-hidden="true">
            <PlateViz spec={dimlama.plate} seedKey="home-lib" size={92} showSides={false} />
          </div>
          <div className="feature-icon feature-icon-warm"><Icon name="book" size={21} /></div>
          <h2>Explore the Library</h2>
          <p>Discover credible nutrition resources, practical learning materials, and research-informed guidance to build your food literacy.</p>
          <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); onNavigate('library'); }}>
            Explore Library <Icon name="arrowRight" size={17} />
          </button>
        </article>
      </section>

      <section className="principles" aria-labelledby="pr-title">
        <div className="section-head">
          <h2 id="pr-title" className="section-title">Five Principles. One Smarter Choice.</h2>
          <p className="section-sub">Four principles from WHO healthy diet guidance, plus one FoodWise adds.</p>
        </div>
        <div className="principle-list">
          {PRINCIPLES.map((p, i) => (
            <button
              key={p.id}
              className={`principle ${p.source === 'foodwise' ? 'principle-fw' : ''} ${openP === p.id ? 'open' : ''}`}
              aria-expanded={openP === p.id}
              onClick={() => {
                setOpenP(openP === p.id ? null : p.id);
                onPrinciple();
              }}
            >
              <span className="principle-icon"><Icon name={PRINCIPLE_ICON[p.id]} size={20} /></span>
              <span className="principle-text">
                <span className="principle-name">
                  <span className="principle-num">{i + 1}</span> {p.name}
                  <span className={`src-pill ${p.source}`}>{p.source === 'who' ? 'WHO' : 'FoodWise'}</span>
                </span>
                <span className="principle-short">{openP === p.id ? p.detail : p.short}</span>
              </span>
              <Icon name="chevronDown" size={16} className={`chev ${openP === p.id ? 'up' : ''}`} />
            </button>
          ))}
        </div>
        <p className="muted tiny">
          Adequacy, balance, moderation and diversity are described in WHO/FAO healthy diet guidance. Satisfaction is FoodWise’s own proposed principle, not an official WHO principle.
        </p>
      </section>

      <section className="independence" aria-labelledby="ind-title">
        <div className="ind-icon"><Icon name="route" size={22} /></div>
        <h2 id="ind-title" className="section-title">Learn Today. Choose Independently Tomorrow.</h2>
        <p className="section-sub">FoodWise helps you understand the reasoning behind food choices, so you can build confidence in making your own.</p>
        <JourneyTracker progress={progress} />
        <button className="link-btn" onClick={() => onNavigate('assistant')}>
          {progress.received ? 'Continue your journey' : 'Start with a real situation'} <Icon name="chevronRight" size={15} />
        </button>
      </section>

      <Disclaimer />
    </div>
  );
}
