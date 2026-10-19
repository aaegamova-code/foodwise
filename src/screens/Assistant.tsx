import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { ChatMessage, LearningProgress, PracticeKind, RecommendationReply, UserContext, UserProfile } from '../types';
import type { SetupState } from '../lib/defaults';
import { Avatar, Disclaimer, JourneyTracker, Sheet } from '../components/Common';
import { ContextChips, ContextEditor } from '../components/ContextEditor';
import { ContextSetup } from '../components/ContextSetup';
import { MealCard } from '../components/MealCard';
import { PracticeSheet } from '../components/PracticeSheet';
import { Icon, Logo } from '../components/Icon';
import { FOLLOW_UPS, SAMPLE_SCENARIOS, respond, swapOption, type EngineSession } from '../engine/demoEngine';

interface Props {
  profile: UserProfile;
  context: UserContext;
  setContext: (c: UserContext) => void;
  setup: SetupState;
  setSetup: (s: SetupState) => void;
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  session: EngineSession;
  setSession: Dispatch<SetStateAction<EngineSession>>;
  progress: LearningProgress;
  markProgress: (p: Partial<LearningProgress>) => void;
  onProfile: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function Assistant(props: Props) {
  const { profile, context, setContext, setup, setSetup, messages, setMessages, session, setSession, progress, markProgress, onProfile } = props;
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserContext>(context);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [practice, setPractice] = useState<PracticeKind | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, pending]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || pending) return;
    setMessages((m) => [...m, { id: uid(), role: 'user', text }]);
    setInput('');
    setPending(true);
    timer.current = window.setTimeout(() => {
      try {
        const out = respond({ text, context, userName: profile.name, session });
        setSession(out.session);
        setMessages((m) => [...m, { id: uid(), role: 'assistant', reply: out.reply, openWhy: [] }]);
        if (out.reply.kind === 'recommendation') markProgress({ received: true });
      } catch {
        setMessages((m) => [
          ...m,
          { id: uid(), role: 'assistant', reply: { kind: 'text', tone: 'info', text: 'Sorry — something went wrong while preparing suggestions. Please try rephrasing your situation.' } },
        ]);
      } finally {
        setPending(false);
      }
    }, 750 + Math.random() * 450);
  };

  const patchMessage = (id: string, fn: (m: ChatMessage) => ChatMessage) => setMessages((ms) => ms.map((m) => (m.id === id ? fn(m) : m)));

  const lastRecIndex = messages.map((m) => m.reply?.kind).lastIndexOf('recommendation');

  if (setup === 'pending') {
    return (
      <div className="assistant">
        <AssistantHeader profile={profile} onProfile={onProfile} />
        <ContextSetup
          name={profile.name}
          onSave={(c) => {
            setContext(c);
            setDraft(c);
            setSetup('done');
          }}
          onSkip={() => setSetup('skipped')}
        />
      </div>
    );
  }

  return (
    <div className="assistant">
      <AssistantHeader profile={profile} onProfile={onProfile} />

      {/* My Context summary */}
      <section className="ctx-summary card" aria-label="My Context">
        <div className="ctx-summary-head">
          <button className="ctx-toggle" aria-expanded={ctxOpen} onClick={() => setCtxOpen(!ctxOpen)}>
            <span className="ctx-icon"><Icon name="user" size={16} /></span>
            <span>
              <strong>My Context</strong>
              <small>
                {setup === 'skipped' && !context.allergies.length && !context.goals.length ? 'Not set — suggestions are general' : `${context.allergies.length ? `${context.allergies.length} allerg${context.allergies.length > 1 ? 'ies' : 'y'} respected · ` : ''}Saved on this device`}
              </small>
            </span>
            <Icon name="chevronDown" size={16} className={`chev ${ctxOpen ? 'up' : ''}`} />
          </button>
          <button className="btn btn-soft btn-sm" onClick={() => { setDraft(context); setEditing(true); }}>
            <Icon name="edit" size={14} /> Edit
          </button>
        </div>
        {ctxOpen && (
          <div className="fade-in ctx-body">
            <ContextChips c={context} />
          </div>
        )}
      </section>

      {/* Chat */}
      <div className="chat" aria-live="polite">
        <div className="msg msg-ai">
          <BotAvatar />
          <div className="bubble bubble-ai">
            <p>
              Hi {profile.name}! Describe a real situation — how hungry or tired you are, your budget, time, and where you are. I’ll suggest a few options and explain <em>why</em> they may work for you.
            </p>
            {messages.length === 0 && (
              <div className="scenario-chips">
                <span className="tiny muted">Try a sample situation:</span>
                {SAMPLE_SCENARIOS.map((s) => (
                  <button key={s.label} className="chip chip-suggest" onClick={() => send(s.text)}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {messages.map((m, idx) => {
          if (m.role === 'user') {
            return (
              <div key={m.id} className="msg msg-user fade-in">
                <div className="bubble bubble-user">{m.text}</div>
                <Avatar profile={profile} size={30} />
              </div>
            );
          }
          const reply = m.reply!;
          if (reply.kind === 'text') {
            return (
              <div key={m.id} className="msg msg-ai fade-in">
                <BotAvatar />
                <div className={`bubble bubble-ai tone-${reply.tone ?? 'plain'}`}>
                  <p>{reply.text}</p>
                  {reply.suggestions && idx === messages.length - 1 && (
                    <div className="scenario-chips">
                      {reply.suggestions.map((s) => (
                        <button key={s} className="chip chip-suggest" onClick={() => send(s)}>{s.length > 60 ? s.slice(0, 58) + '…' : s}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return (
            <Recommendation
              key={m.id}
              msg={m}
              reply={reply}
              isLatest={idx === lastRecIndex}
              onToggleWhy={(mealId) => {
                patchMessage(m.id, (x) => ({ ...x, openWhy: x.openWhy?.includes(mealId) ? x.openWhy.filter((i) => i !== mealId) : [...(x.openWhy ?? []), mealId] }));
                markProgress({ understood: true });
              }}
              onChoose={(mealId) => patchMessage(m.id, (x) => ({ ...x, chosenMealId: x.chosenMealId === mealId ? undefined : mealId }))}
              onSwap={(i) => {
                const res = swapOption(reply.options, i, context, session);
                if (!res.option) return;
                setSession(res.session);
                patchMessage(m.id, (x) => {
                  const r = x.reply as RecommendationReply;
                  const options = r.options.map((o, j) => (j === i ? res.option! : o));
                  return { ...x, reply: { ...r, options }, chosenMealId: x.chosenMealId === r.options[i].meal.id ? undefined : x.chosenMealId };
                });
              }}
              onPractice={() => setPractice(reply.scenario)}
              onRecognize={() => markProgress({ recognized: true })}
            />
          );
        })}

        {pending && (
          <div className="msg msg-ai fade-in" aria-label="FoodWise is thinking">
            <BotAvatar />
            <div className="bubble bubble-ai typing">
              <span /><span /><span />
              <small>Considering your context…</small>
            </div>
          </div>
        )}

        {progress.received && (
          <div className="journey-inline">
            <span className="tiny muted">Your learning journey</span>
            <JourneyTracker progress={progress} compact />
          </div>
        )}
        <Disclaimer />
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="composer-wrap">
        <div className="quick-chips" aria-label="Suggestions">
          {(lastRecIndex >= 0 ? FOLLOW_UPS : SAMPLE_SCENARIOS.map((s) => s.text)).map((s) => (
            <button key={s} className="chip chip-quick" onClick={() => send(s)} disabled={pending}>
              {lastRecIndex >= 0 ? s : SAMPLE_SCENARIOS.find((x) => x.text === s)!.label}
            </button>
          ))}
        </div>
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <label htmlFor="chat-input" className="sr-only">Describe your situation</label>
          <textarea
            id="chat-input"
            ref={inputRef}
            rows={1}
            value={input}
            placeholder="Describe your situation…"
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
                (e.target as HTMLTextAreaElement).style.height = 'auto';
              }
            }}
          />
          <button type="submit" className="send-btn" disabled={!input.trim() || pending} aria-label="Send">
            <Icon name="send" size={20} strokeWidth={2.2} />
          </button>
        </form>
      </div>

      {editing && (
        <Sheet title="Edit My Context" label="Edit My Context" onClose={() => setEditing(false)}>
          <ContextEditor value={draft} onChange={setDraft} />
          {(draft.allergies.length > context.allergies.length || draft.conditions.length > context.conditions.length) && (
            <p className="callout"><Icon name="shield" size={15} /> New allergies and conditions are applied to every suggestion once you save.</p>
          )}
          <div className="setup-actions">
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            <button
              className="btn btn-primary grow"
              onClick={() => {
                setContext(draft);
                setSetup('done');
                setEditing(false);
              }}
            >
              Save My Context
            </button>
          </div>
        </Sheet>
      )}

      {practice && (
        <PracticeSheet
          kind={practice}
          context={context}
          situation={session.situation}
          onClose={() => setPractice(null)}
          onComplete={() => markProgress({ practiced: true, practiceCount: progress.practiceCount + 1 })}
        />
      )}
    </div>
  );
}

function AssistantHeader({ profile, onProfile }: { profile: UserProfile; onProfile: () => void }) {
  return (
    <header className="topbar ai-topbar">
      <div className="ai-title">
        <Logo size={32} />
        <div>
          <strong>FoodWise AI</strong>
          <span className="demo-badge" title="Rule-based demo engine — no external AI service is called">
            <span className="dot" /> Interactive Demo
          </span>
        </div>
      </div>
      <button className="avatar-btn" onClick={onProfile} aria-label="Profile and My Context">
        <Avatar profile={profile} size={38} />
      </button>
    </header>
  );
}

function BotAvatar() {
  return (
    <span className="bot-avatar" aria-hidden="true">
      <Logo size={30} />
    </span>
  );
}

interface RecProps {
  msg: ChatMessage;
  reply: RecommendationReply;
  isLatest: boolean;
  onToggleWhy: (mealId: string) => void;
  onChoose: (mealId: string) => void;
  onSwap: (index: number) => void;
  onPractice: () => void;
  onRecognize: () => void;
}

function Recommendation({ msg, reply, isLatest, onToggleWhy, onChoose, onSwap, onPractice, onRecognize }: RecProps) {
  const chosen = reply.options.find((o) => o.meal.id === msg.chosenMealId);
  return (
    <div className="msg msg-ai msg-rec fade-in">
      <div className="rec-head">
        <BotAvatar />
        <div className="bubble bubble-ai">
          <p>{reply.intro}</p>
          {reply.contextUsed.length > 0 && (
            <div className="used">
              <span className="used-label"><Icon name="sparkle" size={12} /> Context used</span>
              <div className="chip-row">
                {reply.contextUsed.map((c) => (
                  <span key={c} className="chip chip-mini">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="carousel" role="list" aria-label="Meal suggestions">
        {reply.options.map((o, i) => (
          <div role="listitem" key={o.meal.id + i} className="carousel-item">
            <MealCard
              option={o}
              open={!!msg.openWhy?.includes(o.meal.id)}
              chosen={msg.chosenMealId === o.meal.id}
              anyChosen={!!msg.chosenMealId}
              onWhy={() => onToggleWhy(o.meal.id)}
              onChoose={() => onChoose(o.meal.id)}
              onSwap={() => onSwap(i)}
              onPractice={onPractice}
              onRecognize={onRecognize}
            />
          </div>
        ))}
      </div>
      {reply.options.length > 1 && <p className="swipe-hint tiny muted">Swipe to compare {reply.options.length} options →</p>}

      {reply.notes.length > 0 && (
        <ul className="rec-notes">
          {reply.notes.map((n) => (
            <li key={n}><Icon name="info" size={14} /> <span>{n}</span></li>
          ))}
        </ul>
      )}

      {chosen && (
        <div className="chosen-banner fade-in">
          <p>
            <strong>Enjoy your {chosen.meal.name.split(' with')[0].toLowerCase()}!</strong> Want to practise making a choice like this on your own next time?
          </p>
          <button className="btn btn-accent btn-sm" onClick={onPractice}>
            <Icon name="flag" size={15} /> Try Making Your Own Choice
          </button>
        </div>
      )}
      {isLatest && !chosen && <p className="tiny muted rec-followup">Change anything — budget, time, a food you don’t like — and I’ll adjust.</p>}
    </div>
  );
}
