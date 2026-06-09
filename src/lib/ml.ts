import type { Policy, Profile, Cluster, CatKey } from '../types';
import { CATS } from '../data';

export const CLUSTERS: Record<number, { name: string; emoji: string; desc: string; color: string }> = {
  0: { name: '저소득 대학생형',        emoji: '🎓', desc: '학업과 생활을 병행하며 교육·생활비 지원이 잘 맞는 유형이에요.', color: '#F43F5E' },
  1: { name: '사회초년생 저축형',      emoji: '💰', desc: '근로소득을 바탕으로 자산형성·절세 정책이 유리한 유형이에요.', color: '#0FB6A6' },
  2: { name: '프리랜서·소득불안정형',  emoji: '💻', desc: '프리랜서 비중이 높고 소득 증빙 여부가 추천 정확도에 큰 영향을 주는 유형이에요.', color: '#8466F5' },
  3: { name: '월세 부담형',            emoji: '🏠', desc: '주거비 부담이 커 주거지원 정책 니즈가 큰 유형이에요.', color: '#3B82F6' },
  4: { name: '취업준비·무소득형',      emoji: '💼', desc: '구직활동과 생활안정 지원이 함께 필요한 유형이에요.', color: '#EF8E12' },
};

function lowIncome(p: Partial<Profile>): boolean {
  return !p.income || p.income === '소득 없음' || p.income === '~2,400만원';
}
function jobIn(p: Partial<Profile>, arr: string[]): boolean {
  return arr.some((j) => (p.job || '').includes(j));
}

export function inferCluster(profile: Partial<Profile>): Cluster {
  const p = profile || {};
  const ints = p.interests || [];
  let id = 1;
  if (jobIn(p, ['취업준비', '취준', '무직'])) id = 4;
  else if (p.housing === '월세' && ints.includes('housing')) id = 3;
  else if (jobIn(p, ['대학생']) && lowIncome(p)) id = 0;
  else if (jobIn(p, ['프리랜서'])) id = 2;
  else if (jobIn(p, ['정규직', '계약직']) && (ints.includes('saving') || !ints.includes('education'))) id = 1;
  else if (ints[0] === 'housing') id = 3;
  let h = 0;
  const s = (p.job || '') + (p.age || '') + ints.join('') + (p.housing || '');
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 1000;
  const similarity = +(0.79 + (h % 16) / 100).toFixed(2);
  return { id, name: CLUSTERS[id].name, desc: CLUSTERS[id].desc, color: CLUSTERS[id].color, emoji: CLUSTERS[id].emoji, similarity };
}

const Q: Record<string, string> = {
  has_income_proof: '소득 증빙 자료가 있나요?',
  tax_reported: '종합소득세 신고를 했나요?',
  income_stability: '소득이 안정적인 편인가요?',
  is_independent_household: '독립 세대인가요?',
  is_homeless_or_no_house: '현재 무주택 상태인가요?',
  rent_amount_known: '월세 금액을 정확히 알고 있나요?',
  active_job_search: '현재 적극적으로 구직 중인가요?',
  previous_employment_program: '취업지원 프로그램에 참여한 적이 있나요?',
  has_part_time_income: '아르바이트 소득이 있나요?',
  education_support_interest: '교육비 지원에 관심이 있나요?',
  housing_support_interest: '주거 지원에 관심이 있나요?',
};

function requiredFields(p: Partial<Profile>): string[] {
  const set = new Set<string>();
  if (jobIn(p, ['프리랜서'])) ['has_income_proof', 'tax_reported', 'income_stability'].forEach((k) => set.add(k));
  if (p.housing === '월세') ['is_independent_household', 'is_homeless_or_no_house', 'rent_amount_known'].forEach((k) => set.add(k));
  if (jobIn(p, ['취업준비', '취준', '무직'])) ['active_job_search', 'previous_employment_program'].forEach((k) => set.add(k));
  if (jobIn(p, ['대학생'])) ['has_part_time_income', 'education_support_interest', 'housing_support_interest'].forEach((k) => set.add(k));
  if (jobIn(p, ['아르바이트'])) ['has_part_time_income', 'income_stability'].forEach((k) => set.add(k));
  return [...set];
}

export function extraQuestions(p: Partial<Profile>): { key: string; label: string }[] {
  return requiredFields(p).map((k) => ({ key: k, label: Q[k] }));
}

export function profileCompleteness(profile: Partial<Profile>): { score: number; missing: string[] } {
  const p = profile || {};
  const base = [!!p.job, !!p.age, !!p.income, !!p.region, (p.interests || []).length > 0];
  const req = requiredFields(p);
  const extra = p.extra || {};
  const reqFilled = req.filter((k) => extra[k] != null);
  const total = base.length + req.length;
  const filled = base.filter(Boolean).length + reqFilled.length;
  const score = total ? Math.round((filled / total) * 100) : 100;
  const missing = req.filter((k) => extra[k] == null).map((k) => Q[k]);
  return { score, missing };
}

export const REASON_TEXT: Record<string, string> = {
  MATCH_CLUSTER: '사용자 유형과 잘 맞는 정책이에요.',
  MATCH_GOAL: '사용자가 선택한 목표와 일치해요.',
  MATCH_HOUSING: '월세 거주자에게 특히 적합한 주거 정책이에요.',
  MATCH_EMPLOYMENT: '취업 준비 또는 아르바이트 상황에 적합해요.',
  INCOME_PROOF_REQUIRED: '소득 증빙 서류 확인이 필요해요.',
  DEADLINE_SOON: '신청 마감이 임박한 정책이에요.',
  DOCUMENT_CHECK_REQUIRED: '신청 조건과 제출 서류를 확인해야 해요.',
  PROFILE_INCOMPLETE: '추가 정보를 입력하면 추천 정확도가 올라가요.',
};

function reasonCodes(pol: Policy, profile: Partial<Profile>): string[] {
  const p = profile || {};
  const ints = p.interests || [];
  const out = ['MATCH_CLUSTER'];
  if (ints.includes(pol.cat)) out.push('MATCH_GOAL');
  if (pol.cat === 'housing' && p.housing === '월세') out.push('MATCH_HOUSING');
  if (pol.cat === 'job' && jobIn(p, ['취업준비', '취준', '무직', '아르바이트'])) out.push('MATCH_EMPLOYMENT');
  if (pol.cat === 'saving') out.push('INCOME_PROOF_REQUIRED');
  if (pol.hot) out.push('DEADLINE_SOON');
  if (pol.cat === 'housing' || pol.cat === 'saving' || (pol.docs || []).length > 3) out.push('DOCUMENT_CHECK_REQUIRED');
  if (profileCompleteness(p).score < 60) out.push('PROFILE_INCOMPLETE');
  return [...new Set(out)];
}

export function reasonSentences(pol: Policy, profile: Partial<Profile>): { code: string; text: string }[] {
  return reasonCodes(pol, profile).map((c) => ({ code: c, text: REASON_TEXT[c] }));
}

export const TAG_TONE: Record<string, { fg: string; bg: string }> = {
  category: { fg: '#0A857A', bg: '#DCFAF4' },
  situation: { fg: '#1F8F4E', bg: '#E4F7EA' },
  caution: { fg: '#C2790A', bg: '#FDF1D6' },
  urgent: { fg: '#D6453E', bg: '#FCE6E4' },
  info: { fg: '#6B5BD0', bg: '#ECE9FB' },
};

const SITUATION_TAG: Record<string, string> = {
  housing: '월세청년추천', job: '취준생 추천', saving: '프리랜서 검토 가능', living: '생활안정 지원', education: '대학생 추천',
};

export function policyTags(pol: Policy, profile?: Partial<Profile>): { label: string; type: string }[] {
  const meta = CATS[pol.cat] || { label: '' };
  const tags: { label: string; type: string }[] = [{ label: meta.label, type: 'category' }];
  if (SITUATION_TAG[pol.cat]) tags.push({ label: SITUATION_TAG[pol.cat], type: 'situation' });
  if (pol.cat === 'saving' || pol.cat === 'job') tags.push({ label: '소득증빙필요', type: 'caution' });
  else tags.push({ label: '조건확인필요', type: 'caution' });
  if (pol.hot) tags.push({ label: '마감임박', type: 'urgent' });
  if (profile && profileCompleteness(profile).score < 60) tags.push({ label: '추가정보필요', type: 'info' });
  return tags;
}

export function categoryScores(
  policies: Policy[],
  scores: Record<string, number>,
): { cat: CatKey; label: string; score: number; rank: number }[] {
  const acc: Record<string, number[]> = {};
  policies.forEach((p) => { (acc[p.cat] = acc[p.cat] || []).push(scores[p.id] || 0); });
  return Object.keys(acc).map((cat) => ({
    cat: cat as CatKey,
    label: (CATS[cat] || {}).label || cat,
    score: Math.round(acc[cat].reduce((a, b) => a + b, 0) / acc[cat].length),
    rank: 0,
  })).sort((a, b) => b.score - a.score).map((x, i) => ({ ...x, rank: i + 1 }));
}
