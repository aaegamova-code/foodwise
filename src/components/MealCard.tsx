import type { MealOption } from '../types';
import { FOOD_SWATCH, PlateViz, SIDE_LABEL, shareLabel } from './PlateViz';
import { Icon } from './Icon';
import { PrincipleTags } from './Common';
import { fmtRange } from '../engine/demoEngine';

interface Props {
  option: MealOption;
  open: boolean;
  chosen: boolean;
  anyChosen: boolean;
  onWhy: () => void;
  onChoose: () => void;
  onSwap: () => void;
  onPractice: () => void;
  onRecognize: () => void;
}

const MODE_LABEL = { buy: 'Buy nearby', cook: 'Quick cook', nocook: 'No cooking' } as const;

export function MealCard({ option, open, chosen, anyChosen, onWhy, onChoose, onSwap, onPractice, onRecognize }: Props) {
  const { meal } = option;
  const whyId = `why-${meal.id}`;
  return (
    <article className={`meal-card ${chosen ? 'chosen' : ''} ${anyChosen && !chosen ? 'dimmed' : ''}`} aria-label={meal.name}>
      <div className="meal-visual">
        <div className="meal-badges">
          {option.requested && <span className="badge badge-warm">Your pick</span>}
          {chosen && <span className="badge badge-green"><Icon name="check" size={12} strokeWidth={2.6} /> Chosen</span>}
        </div>
        <button className="swap-btn" onClick={onSwap} aria-label={`Swap ${meal.name} for another option`} title="Swap this meal">
          <Icon name="swap" size={17} />
        </button>
        <div className="plate-wrap fade-in" key={meal.id}>
          <PlateViz spec={meal.plate} seedKey={meal.id} size={168} title={`Illustration of ${meal.name}`} />
        </div>
      </div>

      <div className="meal-body">
        <div className="meal-meta">
          <span><Icon name="wallet" size={14} /> ~{fmtRange(meal.cost)} UZS</span>
          <span><Icon name="clock" size={14} /> {meal.minutes} min</span>
          <span><Icon name="bowl" size={14} /> {MODE_LABEL[meal.mode]}</span>
        </div>
        <h3 className="meal-name">{meal.name}</h3>
        <p className="meal-summary">{meal.summary}</p>

        <ul className="legend" aria-label="Approximate plate composition">
          {meal.plate.parts.map((p) => (
            <li key={p.label}>
              <span className="swatch" style={{ background: FOOD_SWATCH[p.food] }} />
              <span className="legend-label">{p.label}</span>
              <span className="legend-share">{shareLabel(p.share)}</span>
            </li>
          ))}
          {(meal.plate.sides ?? []).map((s) => (
            <li key={s} className="legend-side">
              <span className="swatch swatch-ring" />
              <span className="legend-label">{SIDE_LABEL[s]}</span>
              <span className="legend-share">side</span>
            </li>
          ))}
        </ul>
        <p className="plate-caption">
          {meal.plate.type === 'bowl' ? 'Bowl contents' : 'Share of plate area'}, not calories · illustrative, inspired by the Harvard Healthy Eating Plate
        </p>

        <div className="ingredients">
          {meal.ingredients.map((i) => (
            <span key={i} className="ing">{i}</span>
          ))}
        </div>

        <div className="meal-actions">
          <button className={`btn btn-soft ${open ? 'on' : ''}`} aria-expanded={open} aria-controls={whyId} onClick={onWhy}>
            <Icon name="bulb" size={17} /> Why this works
            <Icon name="chevronDown" size={15} className={`chev ${open ? 'up' : ''}`} />
          </button>
          <button className="btn btn-primary" onClick={onChoose} aria-pressed={chosen}>
            {chosen ? <><Icon name="check" size={17} /> Chosen</> : 'Choose this meal'}
          </button>
        </div>

        {open && (
          <section className="why-panel fade-in" id={whyId} aria-label={`Why ${meal.name} works`}>
            <div className="why-block">
              <h4>Why these components</h4>
              <p>{meal.components}</p>
            </div>
            {option.reasons.length > 0 && (
              <div className="why-block">
                <h4>What matters for you today</h4>
                <ul className="why-list">
                  {option.reasons.map((r) => (
                    <li key={r}><Icon name="check" size={14} strokeWidth={2.4} /> <span>{r}</span></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="why-block">
              <h4>Principles at work <span className="hint">tap to learn</span></h4>
              <PrincipleTags ids={option.principles} onRecognize={onRecognize} />
            </div>
            <div className="why-block why-tip">
              <h4><Icon name="leaf" size={15} /> Practical tweak</h4>
              <p>{meal.tip}</p>
            </div>
            <div className="why-block why-transfer">
              <h4><Icon name="route" size={15} /> Use this reasoning again</h4>
              <p>
                Start from a dish you enjoy, check that it has a protein source, add vegetables, and choose a portion that fits how hungry you are. You don’t need to avoid familiar foods — combining them thoughtfully is often more practical.
              </p>
              <button className="btn btn-accent btn-block" onClick={onPractice}>
                <Icon name="flag" size={17} /> Try Making Your Own Choice
              </button>
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
