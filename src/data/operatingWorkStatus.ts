import type { Evidence, SecurityTask } from '../models/compliance';
import type { OperatingWork } from './operatingWorkMaster';

export type OperatingWorkState = 'evidence' | 'active' | 'defined' | 'gap';

// 증적 미등록을 미수행으로 단정하지 않는다. 규정·지침으로 절차가 확인되면 별도 상태로 관리한다.
export const getOperatingWorkState = (work: OperatingWork, tasks: SecurityTask[], evidences: Evidence[]): OperatingWorkState => {
  const linked = evidences.filter(evidence => evidence.verification_status !== '증적제외' && work.isms.includes(evidence.req_id));
  const currentYear=String(new Date().getFullYear());
  const currentEvidence=linked.filter(evidence=>evidence.source_type==='업로드'||evidence.created_at.includes(currentYear));
  if (currentEvidence.some(evidence => evidence.verification_status === '검증완료')) return 'evidence';
  if (linked.length > 0 || tasks.some(task => work.isms.includes(task.req_id))) return 'active';
  if (work.internal.length > 0 || work.efr.trim().length > 0) return 'defined';
  return 'gap';
};

export const operatingWorkStateLabel: Record<OperatingWorkState, string> = {
  evidence: '증적확인', active: '진행중', defined: '기준정의', gap: '미수행',
};
