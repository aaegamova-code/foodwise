import { useState } from 'react';
import type { UserContext } from '../types';
import { ContextChips, ContextEditor, contextIsEmpty } from './ContextEditor';
import { Icon } from './Icon';
import { GOAL_OPTIONS, parseProfile } from '../engine/parse';
import { ALLERGEN_LABEL } from '../engine/safety';
import { EMPTY_CONTEXT } from '../lib/defaults';

const EXAMPLE =
  "I'm 24 years old. I am allergic to peanuts, I prefer local Uzbek food, and I want to develop healthier eating habits without giving up my favorite meals.";

interface Props {
  name: string;
  onSave: (c: UserContext) => void;
  onSkip: () => void;
}

/** One-time, optional, conversational context setup with explicit confirmation of sensitive details. */
export function ContextSetup({ name, onSave, onSkip }: Props) {
  const [step, setStep] = useState<'describe' | 'confirm'>('describe');
  const [text, setText] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [draft, setDraft] = useState<UserContext>(EMPTY_CONTEXT);
  const [confirmed, setConfirmed] = useState(false);
  const [understood, setUnderstood] = useState(true);

  const analyse = () => {
    const parsed = parseProfile(text);
    const next: UserContext = {
      ...EMPTY_CONTEXT,
      ...parsed,
      goals: [...new Set([...(parsed.goals ?? []), ...goals])],
    } as UserContext;
    setUnderstood(!!text.trim() && !contextIsEmpty(next));
    setDraft(next);
    setConfirmed(false);
    setStep('confirm');
  };

  const sensitive = draft.allergies.length > 0 || draft.conditions.length > 0;

  if (step === 'confirm') {
    return (
      <section className="setup fade-in" aria-labelledby="setup-confirm">
        <div className="bubble bubble-ai">
          <h2 id="setup-confirm" className="setup-title">{understood ? 'Here’s what I understood' : 'Let’s fill this in together'}</h2>
          <p>
            {understood
              ? 'Please check everything below. You can change, add or remove anything before saving.'
              : text.trim()
                ? 'I couldn’t pick out specific details from that (the demo understands common phrasings). You can choose them below instead.'
                : 'Choose only what you’re comfortable sharing.'}
          </p>
          {understood && <ContextChips c={draft} />}
        </div>

        <div className="card setup-card">
          <ContextEditor value={draft} onChange={(c) => { setDraft(c); setConfirmed(false); }} />
        </div>

        {sensitive && (
          <label className="confirm-box">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            <span>
              I confirm these details are correct
              {draft.allergies.length > 0 && <> — FoodWise will exclude <strong>{draft.allergies.map((a) => ALLERGEN_LABEL[a]).join(', ')}</strong> from every suggestion</>}
              {draft.conditions.length > 0 && <>{draft.allergies.length ? ' and' : ' —'} add safety notes for <strong>{draft.conditions.join(', ').toLowerCase()}</strong></>}.
            </span>
          </label>
        )}

        <div className="setup-actions">
          <button className="btn btn-ghost" onClick={() => setStep('describe')}>
            <Icon name="chevronLeft" size={16} /> Back
          </button>
          <button className="btn btn-primary grow" disabled={sensitive && !confirmed} onClick={() => onSave(draft)}>
            Save My Context
          </button>
        </div>
        <p className="muted tiny center"><Icon name="lock" size={12} /> Stored only on this device. You can edit or delete it anytime.</p>
      </section>
    );
  }

  return (
    <section className="setup fade-in" aria-labelledby="setup-title">
      <div className="bubble bubble-ai">
        <h2 id="setup-title" className="setup-title">Let's understand what works for you.</h2>
        <p>Share only what you're comfortable with. This helps FoodWise make more relevant educational suggestions.</p>
      </div>
      <div className="bubble bubble-ai bubble-soft">
        <p>
          Hi {name}! Tell me a little about yourself in your own words — age, allergies, foods you love or avoid, traditions, and what you’d like to improve.
        </p>
      </div>

      <div className="setup-input card">
        <label htmlFor="setup-text" className="sr-only">Describe yourself</label>
        <textarea
          id="setup-text"
          rows={4}
          value={text}
          placeholder="e.g. I'm 24, allergic to peanuts, I love Uzbek food…"
          onChange={(e) => setText(e.target.value)}
        />
        <div className="setup-input-row">
          <button className="chip chip-suggest" onClick={() => setText(EXAMPLE)}>
            <Icon name="sparkle" size={13} /> Use example
          </button>
          <button className="btn btn-primary btn-sm" onClick={analyse} disabled={!text.trim() && !goals.length}>
            Continue <Icon name="arrowRight" size={15} />
          </button>
        </div>
      </div>

      <div className="setup-goals">
        <p className="field-label">Or pick broad goals</p>
        <div className="chip-row">
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g}
              className={`chip chip-toggle ${goals.includes(g) ? 'on' : ''}`}
              aria-pressed={goals.includes(g)}
              onClick={() => setGoals(goals.includes(g) ? goals.filter((x) => x !== g) : [...goals, g])}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="setup-actions">
        <button className="btn btn-ghost" onClick={onSkip}>Skip for now</button>
        <button className="btn btn-soft grow" onClick={() => { setDraft({ ...EMPTY_CONTEXT, goals }); setUnderstood(false); setText(''); setStep('confirm'); }}>
          Fill in manually
        </button>
      </div>
      <p className="muted tiny center">
        <Icon name="lock" size={12} /> Health details are sensitive. In this demo they never leave your device.
      </p>
    </section>
  );
}
