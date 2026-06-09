import { POLICIES, QUIZ } from '../data';
import type { Policy, Profile } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '');
const HAS_BACKEND = !!import.meta.env.VITE_API_BASE;
const TOKEN_KEY = 'fincard.accessToken';
const REFRESH_KEY = 'fincard.refreshToken';

export const Tokens = {
  get access() { return localStorage.getItem(TOKEN_KEY) || null; },
  get refresh() { return localStorage.getItem(REFRESH_KEY) || null; },
  save(access: string, refresh?: string) {
    if (access) localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY); },
};

let MOCK = false;
export function isMock() { return MOCK; }

async function rawFetch(
  path: string,
  { method = 'GET', body, auth = true, _retry = false }: {
    method?: string; body?: unknown; auth?: boolean; _retry?: boolean;
  } = {},
): Promise<unknown> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth && Tokens.access) headers['Authorization'] = 'Bearer ' + Tokens.access;
  const res = await fetch(API_BASE + path, {
    method, headers, credentials: 'include',
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && auth && !_retry && Tokens.refresh) {
    const ok = await tryRefresh();
    if (ok) return rawFetch(path, { method, body, auth, _retry: true });
  }
  if (!res.ok) {
    const err = Object.assign(new Error(`HTTP ${res.status} ${method} ${path}`), { status: res.status });
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const data = await rawFetch('/auth/refresh', { method: 'POST', auth: false, body: { refreshToken: Tokens.refresh } }) as Record<string, string>;
    if (data && (data.accessToken || data.token)) {
      Tokens.save(data.accessToken || data.token, data.refreshToken);
      return true;
    }
  } catch { /* fallthrough */ }
  Tokens.clear();
  return false;
}

async function withFallback<T>(realFn: () => Promise<T>, mockFn: () => T): Promise<T> {
  if (MOCK) return mockFn();
  try {
    return await realFn();
  } catch (e) {
    const httpError = e && typeof (e as { status?: number }).status === 'number';
    if (HAS_BACKEND && httpError) throw e;
    MOCK = true;
    console.warn('[FinCard] 백엔드에 연결할 수 없어 데모(목업) 데이터로 전환합니다.', (e as Error)?.message);
    return mockFn();
  }
}

function scoreFor(pol: Policy, profile?: Partial<Profile>): number {
  let s = 73;
  if (profile?.interests?.includes(pol.cat)) s += 14;
  if (pol.hot) s += 5;
  let h = 0;
  for (const ch of pol.id) h = (h * 31 + ch.charCodeAt(0)) % 23;
  return Math.min(98, s + (h % 9));
}

function quizOfToday() {
  const list = QUIZ;
  const idx = new Date().getDate() % list.length;
  return { idx, q: list[idx] };
}

function mergePolicy(serverPol: Partial<Policy>): Policy {
  const local = POLICIES.find((p) => p.id === serverPol.id);
  return local ? { ...local, ...serverPol } : serverPol as Policy;
}

const Mock = {
  signup() { Tokens.save('mock.access', 'mock.refresh'); return { accessToken: 'mock.access', refreshToken: 'mock.refresh' }; },
  login() { Tokens.save('mock.access', 'mock.refresh'); return { accessToken: 'mock.access', refreshToken: 'mock.refresh' }; },
  logout() { Tokens.clear(); return { ok: true }; },
  withdraw() { Tokens.clear(); return { ok: true }; },
  getMe(): null { return null; },
  createMe(profile: Partial<Profile>) { return { profile, coin: 100 }; },
  updateMe(profile: Partial<Profile>) { return { profile }; },
  getCoin(): null { return null; },
  getQuizToday() {
    const { idx, q } = quizOfToday();
    return { id: idx, question: q.q, choices: q.choices, answer: q.answer, explanation: q.explain, reward: q.reward };
  },
  submitQuiz(id: number, choiceIndex: number) {
    const q = QUIZ[id];
    const correct = !!q && choiceIndex === q.answer;
    return { correct, answerIndex: q ? q.answer : 0, reward: correct ? (q?.reward ?? 0) : 0, explanation: q?.explain ?? '' };
  },
  getRecommendations(category: string | undefined, profile?: Partial<Profile>) {
    let list = POLICIES;
    if (category && category !== 'all') list = list.filter((p) => p.cat === category);
    return list.map((p) => ({ ...p, score: scoreFor(p, profile) }));
  },
};

export const Api = {
  isMock,
  isAuthenticated() { return !!Tokens.access; },

  async signup(payload: { email: string; password: string }) {
    return withFallback(async () => {
      const data = await rawFetch('/auth/signup', { method: 'POST', auth: false, body: payload }) as Record<string, string>;
      if (data?.accessToken || data?.token) Tokens.save(data.accessToken || data.token, data.refreshToken);
      return data;
    }, () => Mock.signup());
  },

  async login(payload: { email: string; password: string }) {
    return withFallback(async () => {
      const data = await rawFetch('/auth/login', { method: 'POST', auth: false, body: payload }) as Record<string, string>;
      if (data?.accessToken || data?.token) Tokens.save(data.accessToken || data.token, data.refreshToken);
      return data;
    }, () => Mock.login());
  },

  async logout() {
    const r = await withFallback(async () => {
      try { return await rawFetch('/auth/logout', { method: 'POST' }); } finally { Tokens.clear(); }
    }, () => Mock.logout());
    Tokens.clear();
    return r;
  },

  async withdraw() {
    const r = await withFallback(async () => {
      try { return await rawFetch('/auth/withdraw', { method: 'DELETE' }); } finally { Tokens.clear(); }
    }, () => Mock.withdraw());
    Tokens.clear();
    return r;
  },

  async getMe() {
    return withFallback(() => rawFetch('/users/me') as Promise<Record<string, unknown> | null>, () => Mock.getMe());
  },

  async createMe(profile: Partial<Profile>) {
    return withFallback(() => rawFetch('/users/me', { method: 'POST', body: profile }) as Promise<{ profile: Partial<Profile>; coin: number }>, () => Mock.createMe(profile));
  },

  async updateMe(profile: Partial<Profile>) {
    return withFallback(() => rawFetch('/users/me', { method: 'PUT', body: profile }) as Promise<{ profile: Partial<Profile> }>, () => Mock.updateMe(profile));
  },

  async getCoin() {
    return withFallback(() => rawFetch('/users/coin') as Promise<{ coin: number } | null>, () => Mock.getCoin());
  },

  async getQuizToday() {
    return withFallback(() => rawFetch('/quiz/today') as Promise<Record<string, unknown>>, () => Mock.getQuizToday());
  },

  async submitQuiz(quizId: number, choiceIndex: number) {
    return withFallback(
      () => rawFetch('/quiz/submit', { method: 'POST', body: { quizId, choiceIndex } }) as Promise<{ correct: boolean; answerIndex: number; reward: number; explanation: string }>,
      () => Mock.submitQuiz(quizId, choiceIndex),
    );
  },

  async getRecommendations(category?: string, profile?: Partial<Profile>) {
    const qs = category && category !== 'all' ? ('?category=' + encodeURIComponent(category)) : '';
    return withFallback(async () => {
      const list = await rawFetch('/recommendations' + qs) as Policy[] | { items: Policy[] };
      return (Array.isArray(list) ? list : (list as { items: Policy[] }).items || []).map(mergePolicy);
    }, () => Mock.getRecommendations(category, profile));
  },
};
