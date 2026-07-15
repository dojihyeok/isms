import { AlertTriangle, CheckCircle2, Clock, RefreshCw, Shield } from 'lucide-react';

export type TaskStatusFilter = '미흡' | '승인대기' | '진행중' | '완료';

interface DashboardKpisProps {
  complianceRate: number;
  completedTaskCount: number;
  totalRequirementCount: number;
  overdueCount: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  onSelectStatus: (status: TaskStatusFilter) => void;
}

export function DashboardKpis({
  complianceRate,
  completedTaskCount,
  totalRequirementCount,
  overdueCount,
  pendingCount,
  inProgressCount,
  completedCount,
  onSelectStatus,
}: DashboardKpisProps) {
  return (
    <div className="kpi-grid">
      <div className="kpi-card gauge-card">
        <div className="kpi-header">
          <span>2025 ISO 기반 적합률</span>
          <Shield size={16} style={{ color: 'var(--color-info)' }} />
        </div>
        <div className="gauge-container">
          <div className="gauge-circle">
            <svg className="gauge-svg" aria-label={`2025 ISO 기반 적합률 ${complianceRate}%`}>
              <circle className="gauge-bg" cx="30" cy="30" r="27" />
              <circle
                className="gauge-fill"
                cx="30"
                cy="30"
                r="27"
                style={{ strokeDashoffset: 170 - (170 * complianceRate) / 100 }}
              />
            </svg>
            <span className="gauge-percentage">{complianceRate}%</span>
          </div>
          <div>
            <span className="kpi-value">{complianceRate}%</span>
            <p className="kpi-desc">전체 {totalRequirementCount}개 ISMS-P 통제 중 ISO 27001 매핑 적합 {completedTaskCount}개</p>
          </div>
        </div>
      </div>

      <button type="button" className="kpi-card danger kpi-action-card" onClick={() => onSelectStatus('미흡')}>
        <div className="kpi-header">
          <span>2026 현행화 필요</span>
          <div className="icon-box danger"><AlertTriangle size={14} /></div>
        </div>
        <span className="kpi-value">{overdueCount}건</span>
        <span className="kpi-desc">2026년 검증완료 증적이 확인되지 않은 통제</span>
      </button>

      <button type="button" className="kpi-card pending kpi-action-card" onClick={() => onSelectStatus('승인대기')}>
        <div className="kpi-header">
          <span>2026 확인 대기</span>
          <div className="icon-box warning"><Clock size={14} /></div>
        </div>
        <span className="kpi-value">{pendingCount}건</span>
        <span className="kpi-desc">실제 산출물이 등록되어 확인을 기다리는 통제</span>
      </button>

      <button type="button" className="kpi-card in-progress kpi-action-card" onClick={() => onSelectStatus('진행중')}>
        <div className="kpi-header">
          <span>2026 현행화 진행</span>
          <div className="icon-box info"><RefreshCw size={14} /></div>
        </div>
        <span className="kpi-value">{inProgressCount}건</span>
        <span className="kpi-desc">체크 또는 증적 등록이 시작된 통제</span>
      </button>

      <button type="button" className="kpi-card success kpi-action-card" onClick={() => onSelectStatus('완료')}>
        <div className="kpi-header">
          <span>2026 현행화 완료</span>
          <div className="icon-box success"><CheckCircle2 size={14} /></div>
        </div>
        <span className="kpi-value">{completedCount}건</span>
        <span className="kpi-desc">2026년 검증완료 증적이 확인된 통제</span>
      </button>
    </div>
  );
}
