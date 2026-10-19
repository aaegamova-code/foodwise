import { useState } from 'react';
import type { Allergen, Diet, UserContext } from '../types';
import { ALLERGEN_LABEL, ALLERGEN_OPTIONS, DIET_LABEL } from '../engine/safety';
import { CUISINE_OPTIONS, GOAL_OPTIONS } from '../engine/parse';
import { Icon } from './Icon';

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function TagInput({ label, values, onChange, placeholder, id }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string; id: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim().toLowerCase();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="tag-input">
        <input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn btn-soft btn-sm" onClick={add} disabled={!draft.trim()}>
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="chip-row">
          {values.map((v) => (
            <span key={v} className="chip chip-removable">
              {v}
              <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}>
                <Icon name="close" size={12} strokeWidth={2.4} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ContextEditor({ value, onChange }: { value: UserContext; onChange: (c: UserContext) => void }) {
  const set = (patch: Partial<UserContext>) => onChange({ ...value, ...patch });
  return (
    <div className="context-editor">
      <div className="field">
        <label className="field-label" htmlFor="ctx-age">Age <span className="optional">optional</span></label>
        <input
          id="ctx-age"
          className="input"
          inputMode="numeric"
          value={value.age ?? ''}
          placeholder="e.g. 24"
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
            set({ age: Number.isFinite(n) ? Math.min(n, 120) : undefined });
          }}
        />
      </div>

      <fieldset className="field">
        <legend className="field-label">Allergies & intolerances</legend>
        <div className="chip-row">
          {ALLERGEN_OPTIONS.map((a: Allergen) => (
            <button
              type="button"
              key={a}
              className={`chip chip-toggle ${value.allergies.includes(a) ? 'on danger' : ''}`}
              aria-pressed={value.allergies.includes(a)}
              onClick={() => set({ allergies: toggle(value.allergies, a) })}
            >
              {value.allergies.includes(a) && <Icon name="check" size={13} strokeWidth={2.4} />}
              {ALLERGEN_LABEL[a]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="field-label">Eating pattern</legend>
        <div className="chip-row">
          {(Object.keys(DIET_LABEL) as Diet[]).map((d) => (
            <button
              type="button"
              key={d}
              className={`chip chip-toggle ${value.diet === d ? 'on' : ''}`}
              aria-pressed={value.diet === d}
              onClick={() => set({ diet: d })}
            >
              {DIET_LABEL[d]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="field-label">Food traditions you enjoy</legend>
        <div className="chip-row">
          {CUISINE_OPTIONS.map((c) => (
            <button type="button" key={c} className={`chip chip-toggle ${value.cuisines.includes(c) ? 'on' : ''}`} aria-pressed={value.cuisines.includes(c)} onClick={() => set({ cuisines: toggle(value.cuisines, c) })}>
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="field-label">Goals</legend>
        <div className="chip-row">
          {GOAL_OPTIONS.map((g) => (
            <button type="button" key={g} className={`chip chip-toggle ${value.goals.includes(g) ? 'on' : ''}`} aria-pressed={value.goals.includes(g)} onClick={() => set({ goals: toggle(value.goals, g) })}>
              {g}
            </button>
          ))}
        </div>
      </fieldset>

      <TagInput id="ctx-excl" label="Foods you avoid or dislike" values={value.exclusions} onChange={(v) => set({ exclusions: v })} placeholder="e.g. mushrooms" />
      <TagInput id="ctx-likes" label="Foods you love" values={value.likes} onChange={(v) => set({ likes: v })} placeholder="e.g. plov" />
      <TagInput id="ctx-cond" label="Health conditions (only if you want to share)" values={value.conditions} onChange={(v) => set({ conditions: v })} placeholder="e.g. high blood pressure" />
      <p className="field-hint">
        <Icon name="lock" size={13} /> Saved only on this device. FoodWise uses conditions to add safety notes — it does not provide medical treatment.
      </p>
    </div>
  );
}

export function contextIsEmpty(c: UserContext) {
  return !c.age && !c.allergies.length && c.diet === 'none' && !c.cuisines.length && !c.goals.length && !c.exclusions.length && !c.likes.length && !c.conditions.length;
}

export function ContextChips({ c }: { c: UserContext }) {
  const chips: Array<{ text: string; tone?: string }> = [];
  if (c.age) chips.push({ text: `${c.age} y.o.` });
  c.allergies.forEach((a) => chips.push({ text: `No ${ALLERGEN_LABEL[a]}`, tone: 'danger' }));
  if (c.diet !== 'none') chips.push({ text: DIET_LABEL[c.diet] });
  c.cuisines.forEach((x) => chips.push({ text: `${x} food` }));
  c.exclusions.forEach((x) => chips.push({ text: `Avoids ${x}` }));
  c.likes.forEach((x) => chips.push({ text: `Loves ${x}`, tone: 'warm' }));
  c.conditions.forEach((x) => chips.push({ text: x, tone: 'care' }));
  c.goals.forEach((x) => chips.push({ text: x, tone: 'goal' }));
  if (!chips.length) return <p className="muted small">No details saved — suggestions will be general.</p>;
  return (
    <div className="chip-row">
      {chips.map((ch) => (
        <span key={ch.text} className={`chip chip-static ${ch.tone ?? ''}`}>{ch.text}</span>
      ))}
    </div>
  );
}
