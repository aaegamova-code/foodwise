import { useRef, useState, type FormEvent } from 'react';
import type { UserProfile } from '../types';
import { Icon, Logo } from '../components/Icon';
import { PlateViz } from '../components/PlateViz';
import { mealById } from '../data/meals';
import { resizeImage } from '../lib/storage';

export function Onboarding({ onDone }: { onDone: (p: UserProfile) => void }) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const hero = mealById('shashlik')!;
  const bowl = mealById('moshkhurda')!;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please tell us what to call you.');
      return;
    }
    onDone({ name: name.trim(), photo });
  };

  return (
    <div className="onboarding">
      <div className="onb-art" aria-hidden="true">
        <div className="onb-blob" />
        <div className="onb-plate float-slow">
          <PlateViz spec={hero.plate} seedKey="onb-hero" size={210} showSides={false} />
        </div>
        <div className="onb-bowl float-slower">
          <PlateViz spec={bowl.plate} seedKey="onb-bowl" size={104} showSides={false} />
        </div>
        <svg className="onb-leaf" viewBox="0 0 40 40" width="46" height="46"><path d="M6 34C6 18 16 7 34 6c0 18-11 28-28 28Z" fill="#7DB36A" /><path d="M6 34 26 14" stroke="#FFFFFF" strokeWidth="1.6" /></svg>
      </div>

      <form className="onb-content" onSubmit={submit} noValidate>
        <div className="onb-brand">
          <Logo size={44} />
          <h1 className="onb-title">FoodWise</h1>
        </div>
        <p className="onb-tagline">Eat Well. Stay You.</p>
        <p className="onb-sub">
          A friendly guide to balanced everyday food — that respects your traditions, taste and budget.
        </p>

        <div className="onb-fields">
          <button type="button" className="onb-photo" onClick={() => fileRef.current?.click()} aria-label={photo ? 'Change profile photo' : 'Add profile photo (optional)'}>
            {photo ? <img src={photo} alt="" /> : <Icon name="camera" size={22} />}
            <span className="onb-photo-plus"><Icon name="plus" size={12} strokeWidth={2.6} /></span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              try {
                setPhoto(await resizeImage(f));
                setError('');
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          />
          <div className="field grow">
            <label className="field-label" htmlFor="onb-name">What should we call you?</label>
            <input
              id="onb-name"
              className="input input-lg"
              value={name}
              autoComplete="given-name"
              placeholder="Your name"
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              aria-invalid={!!error}
              aria-describedby={error ? 'onb-err' : 'onb-photo-hint'}
            />
          </div>
        </div>
        <p id="onb-photo-hint" className="muted tiny">{busy ? 'Processing photo…' : 'Photo is optional — tap the circle to add one.'}</p>
        {error && <p id="onb-err" className="error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={!name.trim()}>
          Get Started <Icon name="arrowRight" size={18} />
        </button>
        <p className="onb-privacy">
          <Icon name="lock" size={13} /> No account needed. Your details stay on this device.
        </p>
      </form>
    </div>
  );
}
