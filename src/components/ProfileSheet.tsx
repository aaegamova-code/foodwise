import { useRef, useState } from 'react';
import type { UserContext, UserProfile } from '../types';
import { Avatar, Sheet } from './Common';
import { ContextEditor } from './ContextEditor';
import { Icon } from './Icon';
import { resizeImage } from '../lib/storage';

interface Props {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  context: UserContext;
  setContext: (c: UserContext) => void;
  onClose: () => void;
  onClearChat: () => void;
  onDeleteAll: () => void;
}

export function ProfileSheet({ profile, setProfile, context, setContext, onClose, onClearChat, onDeleteAll }: Props) {
  const [name, setName] = useState(profile.name);
  const [photo, setPhoto] = useState(profile.photo);
  const [draft, setDraft] = useState<UserContext>(context);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = () => {
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    setProfile({ name: name.trim(), photo });
    setContext(draft);
    setSaved(true);
    setTimeout(onClose, 500);
  };

  return (
    <Sheet title="Profile & My Context" label="Profile and My Context" onClose={onClose}>
      <div className="profile-head">
        <button className="photo-edit" onClick={() => fileRef.current?.click()} aria-label="Change profile photo">
          <Avatar profile={{ name, photo }} size={64} />
          <span className="photo-badge"><Icon name="camera" size={14} /></span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              setPhoto(await resizeImage(f));
              setError('');
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        />
        <div className="field grow">
          <label className="field-label" htmlFor="pf-name">Name</label>
          <input id="pf-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      {photo && (
        <button className="link-btn small" onClick={() => setPhoto(undefined)}>Remove photo</button>
      )}
      {error && <p className="error" role="alert">{error}</p>}

      <h3 className="section-label">My Context</h3>
      <ContextEditor value={draft} onChange={setDraft} />

      <button className="btn btn-primary btn-block" onClick={save}>
        {saved ? <><Icon name="check" size={18} /> Saved</> : 'Save changes'}
      </button>

      <div className="privacy-box">
        <h3><Icon name="lock" size={16} /> Your data</h3>
        <p>
          Everything you enter — name, photo, context and chat — is stored only in this browser. The Interactive Demo sends nothing to analytics or third-party AI services.
        </p>
        <div className="privacy-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => { onClearChat(); onClose(); }}>
            Clear chat history
          </button>
          {!confirmDelete ? (
            <button className="btn btn-danger-ghost btn-sm" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={15} /> Delete all my data
            </button>
          ) : (
            <div className="confirm-row" role="alert">
              <span>Delete everything and restart?</span>
              <button className="btn btn-danger btn-sm" onClick={onDeleteAll}>Delete</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
