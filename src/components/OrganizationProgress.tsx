import { AlertTriangle, Shield } from 'lucide-react';
import type { SecurityTask } from '../models/compliance';

interface OrganizationProgressProps {
  tasks: Pick<SecurityTask, 'assignee_name' | 'status'>[];
  onEscalate: () => void;
}

const ORGANIZATIONS = [
  { name: '보안기획팀 (CISO 산하)', keywords: ['CISO', '보안팀장'], color: 'var(--color-success)' },
  { name: '시스템 인프라 운영팀', keywords: ['시스템엔지니어', '보안엔지니어'], color: 'var(--color-info)' },
  { name: '개인정보보호 및 신용정보관리팀', keywords: ['개인정보보호'], color: 'var(--color-danger)' },
];

export function OrganizationProgress({ tasks, onEscalate }: OrganizationProgressProps) {
  const organizations = ORGANIZATIONS.map((organization) => {
    const assigned = tasks.filter((task) => organization.keywords.some((keyword) => task.assignee_name.includes(keyword)));
    const completed = assigned.filter((task) => task.status === '완료').length;
    const progress = assigned.length > 0 ? Math.round((completed / assigned.length) * 100) : 0;
    return { ...organization, assigned: assigned.length, completed, progress };
  });

  return (
    <section className="section-card organization-progress">
      <div>
        <h3 className="card-title"><Shield size={18} />조직별/부서별 이행 현황 (ISMS-P)</h3>
        <div className="dept-chart-container organization-bars">
          {organizations.map((organization) => (
            <div className="dept-bar-row" key={organization.name}>
              <div className="dept-label-row">
                <span className="dept-name">{organization.name}</span>
                <span className="dept-percent">{organization.completed}/{organization.assigned} · {organization.progress}%</span>
              </div>
              <div className="dept-bar-track" role="progressbar" aria-label={organization.name} aria-valuenow={organization.progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="dept-bar-fill" style={{ width: `${organization.progress}%`, backgroundColor: organization.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="escalation-section">
        <div className="policy-mapping-card escalation-card">
          <div className="escalation-title">
            <AlertTriangle size={18} />
            <span>미이행 컴플라이언스 긴급 에스컬레이션</span>
          </div>
          <p>인프라 정기 취약점 점검 업무(반기 1회)가 아직 미이행 상태입니다. 마감 대비 진행률 부진 경보가 발생했습니다.</p>
          <button className="action-btn primary escalation-button" onClick={onEscalate}>CISO 긴급 알림 발송</button>
        </div>
      </div>
    </section>
  );
}
