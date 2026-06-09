import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { Policy, Profile, PointHistory, TweakSettings } from '../types';
import { POLICIES } from '../data';

export const THEMES = {
  mint:   { brand: '#10C5B6', brand2: '#34E0CE', soft: '#DCFAF4', wash: '#EFFCF9', ink: '#0A857A' },
  blue:   { brand: '#3B82F6', brand2: '#62A0FF', soft: '#E6F1FF', wash: '#F2F7FF', ink: '#2563EB' },
  yellow: { brand: '#F5A623', brand2: '#FFC65C', soft: '#FFF3D6', wash: '#FFFAEC', ink: '#B5740A' },
  violet: { brand: '#7C6BF5', brand2: '#9C8DFF', soft: '#ECE8FF', wash: '#F5F3FF', ink: '#5B47D6' },
  coral:  { brand: '#FF6F59', brand2: '#FF927F', soft: '#FFE9E4', wash: '#FFF4F1', ink: '#E04A33' },
};

export const TWEAK_DEFAULTS: TweakSettings = {
  colorTheme: 'mint',
  homeLayout: 'stack',
  cardStyle: 'soft',
  quizBg: 'yellow',
};

const defaultProfile: Profile = {
  job: null, age: null, income: null, region: null, housing: null, interests: [], extra: {},
};

interface AppContextValue {
  profile: Profile;
  points: number;
  history: PointHistory[];
  unlocked: Set<string>;
  checklists: Set<string>;
  visited: Set<string>;
  quizDone: boolean;
  policies: Policy[];
  scores: Record<string, number>;
  sorted: Policy[];
  tweaks: TweakSettings;
  toast: { msg: string; good: boolean } | null;
  setProfile: (p: Profile) => void;
  setPolicies: (p: Policy[]) => void;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  setHistory: React.Dispatch<React.SetStateAction<PointHistory[]>>;
  setUnlocked: React.Dispatch<React.SetStateAction<Set<string>>>;
  setChecklists: React.Dispatch<React.SetStateAction<Set<string>>>;
  setVisited: React.Dispatch<React.SetStateAction<Set<string>>>;
  setQuizDone: React.Dispatch<React.SetStateAction<boolean>>;
  addPoints: (label: string, delta: number) => void;
  showToast: (msg: string, good?: boolean) => void;
  tryUnlock: (pol: Policy) => void;
  genChecklist: (pol: Policy) => void;
  visitSite: (pol: Policy) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function scoreFor(pol: Policy, profile: Profile): number {
  let s = 73;
  if (profile.interests?.includes(pol.cat)) s += 14;
  if (pol.hot) s += 5;
  let h = 0;
  for (const ch of pol.id) h = (h * 31 + ch.charCodeAt(0)) % 23;
  return Math.min(98, s + (h % 9));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(defaultProfile);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [checklists, setChecklists] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [quizDone, setQuizDone] = useState(false);
  const [policies, setPoliciesState] = useState<Policy[]>(POLICIES);
  const [tweaks] = useState<TweakSettings>(TWEAK_DEFAULTS);
  const [toast, setToast] = useState<{ msg: string; good: boolean } | null>(null);

  const { sorted, scores } = useMemo(() => {
    const sc: Record<string, number> = {};
    policies.forEach((p) => (sc[p.id] = p.score != null ? p.score : scoreFor(p, profile)));
    const s = [...policies].sort((a, b) => sc[b.id] - sc[a.id]);
    return { sorted: s, scores: sc };
  }, [policies, profile]);

  const setProfile = useCallback((p: Profile) => setProfileState(p), []);
  const setPolicies = useCallback((p: Policy[]) => setPoliciesState(p), []);

  const showToast = useCallback((msg: string, good = true) => {
    setToast({ msg, good });
    setTimeout(() => setToast(null), 1900);
  }, []);

  const addPoints = useCallback((label: string, delta: number) => {
    setPoints((p) => p + delta);
    setHistory((h) => [{ label, delta, time: '방금 전' }, ...h]);
  }, []);

  const tryUnlock = useCallback((pol: Policy) => {
    if (unlocked.has(pol.id)) return;
    setPoints((prev) => {
      if (prev < 30) { showToast('포인트가 부족해요', false); return prev; }
      setHistory((h) => [{ label: `'${pol.title}' 잠금 해제`, delta: -30, time: '방금 전' }, ...h]);
      setUnlocked((s) => new Set([...s, pol.id]));
      showToast('정책 카드를 열었어요');
      return prev - 30;
    });
  }, [unlocked, showToast]);

  const genChecklist = useCallback((pol: Policy) => {
    if (checklists.has(pol.id)) return;
    setPoints((prev) => {
      if (prev < 50) { showToast('포인트가 부족해요', false); return prev; }
      setHistory((h) => [{ label: `'${pol.title}' 서류 체크리스트`, delta: -50, time: '방금 전' }, ...h]);
      setChecklists((s) => new Set([...s, pol.id]));
      showToast('맞춤 체크리스트를 만들었어요');
      return prev - 50;
    });
  }, [checklists, showToast]);

  const visitSite = useCallback((pol: Policy) => {
    if (!visited.has(pol.id)) {
      addPoints(`'${pol.title}' 홈페이지 방문`, 30);
      setVisited((s) => new Set([...s, pol.id]));
      showToast('+30P 적립! 실천 응원해요');
    } else {
      showToast('이미 방문한 정책이에요');
    }
  }, [visited, addPoints, showToast]);

  return (
    <AppContext.Provider value={{
      profile, points, history, unlocked, checklists, visited, quizDone,
      policies, scores, sorted, tweaks, toast,
      setProfile, setPolicies, setPoints, setHistory,
      setUnlocked, setChecklists, setVisited, setQuizDone,
      addPoints, showToast, tryUnlock, genChecklist, visitSite,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
