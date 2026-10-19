import { useMemo, useState } from 'react';
import type { PracticeKind, Situation, UserContext } from '../types';
import { Sheet } from './Common';
import { Icon } from './Icon';
import { PRACTICE_KINDS, buildExercise } from '../engine/practice';
import { REFLECTION_QUESTIONS } from '../data/practice';

interface Props {
  kind: PracticeKind;
  context: UserContext;
  situation?: Situation;
  onClose: () => void;
  onComplete: () => void;
}

/** Progressive Independence: the user reasons through a choice; feedback is constructive, never a score. */
export function PracticeSheet({ kind: initialKind, context, situation, onClose, onComplete }: Props) {
  const [round, setRound] = useState(0);
  const kind = round === 0 ? initialKind : PRACTICE_KINDS[(PRACTICE_KINDS.indexOf(initialKind) + round) % PRACTICE_KINDS.length];
  const ex = useMemo(() => buildExercise(kind, context, round === 0 ? situation : undefined, round + kind.length), [kind, context, situation, round]);
  const [selected, setSelected] = useState<string | null>(null);
  const [reflections, setReflections] = useState<string[]>([]);
  const [committed, setCommitted] = useState(false);
  const choice = ex.options.find((o) => o.id === selected);

  const next = () => {
    setRound((r) => r + 1);
    setSelected(null);
    setReflections([]);
    setCommitted(false);
  };

  return (
    <Sheet label="Try Making Your Own Choice" title={<>Try Making Your Own Choice</>} onClose={onClose}>
      <div className="practice">
        <span className="eyebrow">Scenario · {ex.title}</span>
        <p className="practice-prompt">{ex.prompt}</p>

        <div className="practice-options" role="radiogroup" aria-label="Meal combinations">
          {ex.options.map((o, i) => (
            <button
              key={o.id}
              role="radio"
              aria-checked={selected === o.id}
              className={`practice-option ${selected === o.id ? 'selected' : ''} ${selected && selected !== o.id ? 'faded' : ''}`}
              onClick={() => setSelected(o.id)}
            >
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              <span>{o.text}</span>
            </button>
          ))}
        </div>

        {choice && (
          <div className={`feedback fade-in feedback-${choice.quality}`} role="status">
            <p>{choice.feedback}</p>
          </div>
        )}

        {choice && (
          <div className="reflect fade-in">
            <h3><Icon name="bulb" size={17} /> Next time, try asking yourself:</h3>
            <p className="muted small">Does this meal provide variety, enough nourishment, and something I actually enjoy?</p>
            <ul>
              {REFLECTION_QUESTIONS.map((q) => {
                const on = reflections.includes(q.id);
                return (
                  <li key={q.id}>
                    <button
                      className={`reflect-q ${on ? 'on' : ''}`}
                      aria-pressed={on}
                      onClick={() => setReflections(on ? reflections.filter((x) => x !== q.id) : [...reflections, q.id])}
                    >
                      <span className="check-box">{on && <Icon name="check" size={13} strokeWidth={2.6} />}</span>
                      <span>
                        <strong>{q.q}</strong>
                        <small>{q.hint}</small>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {!committed ? (
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  setCommitted(true);
                  onComplete();
                }}
              >
                I’ll use these questions next time
              </button>
            ) : (
              <div className="committed fade-in">
                <p>
                  <Icon name="check" size={16} strokeWidth={2.4} /> Nice — that’s the FoodWise idea: understand the reasoning once, then choose confidently on your own.
                </p>
                <div className="row-gap">
                  <button className="btn btn-soft" onClick={next}>Try another scenario</button>
                  <button className="btn btn-ghost" onClick={onClose}>Back to chat</button>
                </div>
              </div>
            )}
          </div>
        )}
        <p className="muted tiny center">This is a learning exercise, not a test. There’s no score and no “bad” food.</p>
      </div>
    </Sheet>
  );
}
