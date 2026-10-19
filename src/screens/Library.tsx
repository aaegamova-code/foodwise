import { useMemo, useState } from 'react';
import type { UserProfile } from '../types';
import { ARTICLES, SOURCE_TYPE_INFO, type SourceType } from '../data/library';
import { TopBar } from '../components/Common';
import { Icon } from '../components/Icon';
import { PlateViz } from '../components/PlateViz';
import { mealById } from '../data/meals';

const FILTERS: Array<'All' | SourceType> = ['All', 'Public-health guidance', 'Educational research', 'Clinical perspective', 'Coaching concept'];

export function Library({ profile, onProfile }: { profile: UserProfile; onProfile: () => void }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARTICLES.filter((a) => (filter === 'All' || a.sourceType === filter) && (!q || [a.title, a.source, a.category, a.summary].join(' ').toLowerCase().includes(q)));
  }, [filter, query]);

  return (
    <div className="library">
      <TopBar profile={profile} onProfile={onProfile} />
      <section className="lib-head">
        <h1 className="page-title">Learn More. Choose Better.</h1>
        <p className="section-sub">Explore credible nutrition research, practical guidance, and educational perspectives.</p>
      </section>

      <div className="search">
        <Icon name="search" size={18} />
        <input type="search" placeholder="Search topics or sources" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search the library" />
        {query && (
          <button className="icon-btn" onClick={() => setQuery('')} aria-label="Clear search">
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      <div className="filter-row" role="tablist" aria-label="Filter by source type">
        {FILTERS.map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} className={`filter ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      {filter !== 'All' && <p className="filter-info fade-in"><Icon name="info" size={14} /> {SOURCE_TYPE_INFO[filter]}</p>}

      <div className="articles" aria-live="polite">
        {results.map((a) => {
          const meal = mealById(a.thumb)!;
          return (
            <article key={a.id} className="article-card fade-in">
              <div className="article-thumb" style={{ background: a.tint }} aria-hidden="true">
                <PlateViz spec={meal.plate} seedKey={a.id} size={96} showSides={false} />
              </div>
              <div className="article-body">
                <div className="article-tags">
                  <span className={`type-pill type-${a.sourceType.split(' ')[0].toLowerCase()}`}>{a.sourceType}</span>
                  <span className="cat">{a.category}</span>
                </div>
                <h2 className="article-title">{a.title}</h2>
                <p className="article-source">{a.source}</p>
                <p className="article-summary">{a.summary}</p>
                <a className="btn btn-soft btn-sm" href={a.url} target="_blank" rel="noopener noreferrer">
                  Read Article <Icon name="external" size={15} />
                  <span className="sr-only">(opens {a.source} in a new tab)</span>
                </a>
              </div>
            </article>
          );
        })}
        {!results.length && (
          <div className="empty">
            <Icon name="search" size={28} />
            <p>No resources match “{query}”.</p>
            <button className="btn btn-ghost btn-sm" onClick={() => { setQuery(''); setFilter('All'); }}>Show all resources</button>
          </div>
        )}
      </div>

      <p className="disclaimer lib-note">
        <Icon name="info" size={14} />
        <span>
          Summaries are FoodWise’s own short paraphrases; read the original for full context. Source labels show the type of evidence. Listing a source does not mean WHO, FAO, Harvard, IFM or IIN endorse FoodWise.
        </span>
      </p>
    </div>
  );
}
