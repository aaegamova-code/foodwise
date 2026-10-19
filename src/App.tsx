import { useCallback, useState } from 'react';
import type { ChatMessage, LearningProgress, Screen, UserContext, UserProfile } from './types';
import { clearAllStored, usePersistentState } from './lib/storage';
import { emptySession, type EngineSession } from './engine/demoEngine';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Assistant } from './screens/Assistant';
import { Library } from './screens/Library';
import { BottomNav } from './components/BottomNav';
import { ProfileSheet } from './components/ProfileSheet';
import { EMPTY_CONTEXT, EMPTY_PROGRESS, type SetupState } from './lib/defaults';

export default function App() {
  const [profile, setProfile] = usePersistentState<UserProfile | null>('profile', null);
  const [screen, setScreen] = usePersistentState<Screen>('screen', 'home');
  const [context, setContext] = usePersistentState<UserContext>('context', EMPTY_CONTEXT);
  const [setup, setSetup] = usePersistentState<SetupState>('setup', 'pending');
  const [messages, setMessages] = usePersistentState<ChatMessage[]>('chat', []);
  const [session, setSession] = usePersistentState<EngineSession>('session', emptySession());
  const [progress, setProgress] = usePersistentState<LearningProgress>('progress', EMPTY_PROGRESS);
  const [profileOpen, setProfileOpen] = useState(false);

  const markProgress = useCallback(
    (patch: Partial<LearningProgress>) => setProgress((p) => ({ ...p, ...patch })),
    [setProgress],
  );

  const go = (s: Screen) => {
    setScreen(s);
    document.querySelector('.screen')?.scrollTo({ top: 0 });
  };

  const deleteAll = () => {
    clearAllStored();
    setProfile(null);
    setContext(EMPTY_CONTEXT);
    setSetup('pending');
    setMessages([]);
    setSession(emptySession());
    setProgress(EMPTY_PROGRESS);
    setScreen('home');
    setProfileOpen(false);
  };

  if (!profile) {
    return (
      <div className="stage">
        <div className="device">
          <Onboarding
            onDone={(p) => {
              setProfile(p);
              setScreen('home');
            }}
          />
        </div>
      </div>
    );
  }

  const openProfile = () => setProfileOpen(true);

  return (
    <div className="stage">
      <div className="device">
        <main className={`screen screen-${screen}`} key={screen}>
          {screen === 'home' && <Home profile={profile} progress={progress} onNavigate={go} onProfile={openProfile} onPrinciple={() => markProgress({ recognized: true })} />}
          {screen === 'assistant' && (
            <Assistant
              profile={profile}
              context={context}
              setContext={setContext}
              setup={setup}
              setSetup={setSetup}
              messages={messages}
              setMessages={setMessages}
              session={session}
              setSession={setSession}
              progress={progress}
              markProgress={markProgress}
              onProfile={openProfile}
            />
          )}
          {screen === 'library' && <Library profile={profile} onProfile={openProfile} />}
        </main>
        <BottomNav screen={screen} onNavigate={go} />
        {profileOpen && (
          <ProfileSheet
            profile={profile}
            setProfile={setProfile}
            context={context}
            setContext={(c) => {
              setContext(c);
              setSetup('done');
            }}
            onClose={() => setProfileOpen(false)}
            onClearChat={() => {
              setMessages([]);
              setSession(emptySession());
            }}
            onDeleteAll={deleteAll}
          />
        )}
      </div>
    </div>
  );
}
