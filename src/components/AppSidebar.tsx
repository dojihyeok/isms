import {
  Award,
  FileSpreadsheet,
  FileCheck2,
  FolderGit,
  GitCompare,
  History,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  Target,
  UserCheck,
  Users,
} from 'lucide-react';

export type UserRole = 'CISO' | 'CPO' | '보안팀장' | '엔지니어' | '개인정보담당자' | '업무부서 담당자' | '부서장' | '외부 심사원';
export type Framework = 'ISMS-P' | 'ISO27001';

interface AppSidebarProps {
  activeTab: string;
  framework: Framework;
  currentRole: UserRole;
  complianceRate: number;
  countOverdue: number;
  countPending: number;
  auditLogCount: number;
  onNavigate: (tab: string, framework?: Framework) => void;
  onFrameworkChange: (framework: Framework) => void;
  onRoleChange: (role: UserRole) => void;
}

export function AppSidebar({
  activeTab,
  framework,
  currentRole,
  complianceRate,
  countOverdue,
  countPending,
  auditLogCount,
  onNavigate,
  onFrameworkChange,
  onRoleChange,
}: AppSidebarProps) {
  const userName = currentRole === 'CISO'
    ? 'CISO'
    : currentRole === 'CPO'
      ? 'CPO'
    : currentRole === '보안팀장'
      ? '보안팀장'
    : currentRole === '엔지니어'
      ? '보안엔지니어'
      : currentRole === '개인정보담당자'
        ? '개인정보보호담당자'
        : currentRole === '업무부서 담당자'
          ? '업무부서 담당자'
          : currentRole === '부서장'
            ? '업무부서장'
            : '외부 심사위원';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">🛡️</div>
        <div>
          <span className="logo-text">SECURE-IMS</span>
          <span className="logo-sub">ISO 27001 + ISMS-P Console</span>
        </div>
      </div>

      <div className="framework-switcher">
        <button className={`fw-btn ${framework === 'ISMS-P' ? 'active' : ''}`} onClick={() => onFrameworkChange('ISMS-P')}>
          🇰🇷 ISMS-P
        </button>
        <button className={`fw-btn ${framework === 'ISO27001' ? 'active' : ''}`} onClick={() => onFrameworkChange('ISO27001')}>
          🌐 ISO 27001
        </button>
      </div>

      {framework === 'ISO27001' ? (
        <div className="iso-cert-badge"><Award size={12} />인증 취득 · 2023년</div>
      ) : (
        <div className="isms-prep-badge"><Target size={12} />인증 준비 중 · 2026년 목표</div>
      )}

      <div className="role-switcher-container">
        <span className="role-label">현재 시스템 접속 역할 (RBAC)</span>
        <select className="role-select" value={currentRole} onChange={(event) => onRoleChange(event.target.value as UserRole)}>
          <option value="CISO">CISO (최종 결재권자)</option>
          <option value="CPO">CPO (개인정보 최종 결재권자)</option>
          <option value="보안팀장">보안팀장 (증적 검토자)</option>
          <option value="엔지니어">보안엔지니어 (실무자)</option>
          <option value="개인정보담당자">개인정보보호담당자 (실무자)</option>
          <option value="업무부서 담당자">업무부서 담당자 (실무자)</option>
          <option value="부서장">부서장 (업무 검토자)</option>
          <option value="외부 심사원">외부 심사원 (Read-Only 심사위원)</option>
        </select>
      </div>

      <nav className="sidebar-menu">
        {currentRole !== '외부 심사원' ? (
          <>
            <span className="menu-section-label">개요</span>
            <button className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard', 'ISMS-P')}>
              <LayoutDashboard size={18} />ISMS-P 통합 대시보드
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: complianceRate >= 80 ? 'var(--color-success)' : complianceRate >= 50 ? 'var(--color-warning)' : 'var(--color-danger)' }}>{complianceRate}%</span>
            </button>
            <button className={`menu-item ${activeTab === 'organization' ? 'active' : ''}`} onClick={() => onNavigate('organization', 'ISMS-P')}>
              <Users size={18} />보안조직 강화안
              <span className="menu-item-badge warning">NEW</span>
            </button>
            <span className="menu-section-label" style={{ marginTop: '8px' }}>
              ISO 27001:2022
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '1px 6px', borderRadius: '4px' }}>인증취득</span>
            </span>
            <button className={`menu-item ${activeTab === 'iso-soa' ? 'active' : ''}`} onClick={() => onNavigate('iso-soa', 'ISO27001')}>
              <Award size={18} />SOA 운영 현황
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 700 }}>170통제</span>
            </button>
            <button className={`menu-item ${activeTab === 'mapping' ? 'active' : ''}`} onClick={() => onNavigate('mapping')}>
              <GitCompare size={18} />ISO↔ISMS 매핑 분석
              <span className="menu-item-badge" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>Gap</span>
            </button>

            <span className="menu-section-label" style={{ marginTop: '8px' }}>
              ISMS-P 운영
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', padding: '1px 6px', borderRadius: '4px' }}>준비중</span>
            </span>
            <button className={`menu-item ${activeTab === 'matrix' ? 'active' : ''}`} onClick={() => onNavigate('matrix', 'ISMS-P')}>
              <FileSpreadsheet size={18} />통합 통제성 매트릭스
              {countOverdue > 0 && <span className="menu-item-badge">{countOverdue}</span>}
            </button>
            <button className={`menu-item ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => onNavigate('tasks', 'ISMS-P')}>
              <UserCheck size={18} />연간 보안업무 관리
              {countPending > 0 && <span className="menu-item-badge warning">{countPending}</span>}
            </button>
            <button className={`menu-item ${activeTab === 'certification-ops' ? 'active' : ''}`} onClick={() => onNavigate('certification-ops', 'ISMS-P')}>
              <ShieldCheck size={18} />인증 운영센터
            </button>
            <button className={`menu-item ${activeTab === 'evidence' ? 'active' : ''}`} onClick={() => onNavigate('evidence', 'ISMS-P')}>
              <FolderGit size={18} />통합 증적 보관소 (VFS)
            </button>
            <button className={`menu-item sub-menu-item ${activeTab === 'governance-evidence' ? 'active' : ''}`} onClick={() => onNavigate('governance-evidence', 'ISMS-P')}>
              <FileCheck2 size={18} />운영 증적자료 보관소
            </button>

            <div className="menu-divider" />
            <span className="menu-section-label">심사 및 감사</span>
            <button className={`menu-item ${activeTab === 'auditor' ? 'active' : ''}`} onClick={() => onNavigate('auditor')}>
              <Lock size={18} />심사원 모드 (Portal)
            </button>
            <button className={`menu-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => onNavigate('logs')}>
              <History size={18} />시스템 감사 로그
              {auditLogCount > 0 && <span className="menu-item-badge" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>{auditLogCount}</span>}
            </button>
          </>
        ) : (
          <>
            <div className="policy-mapping-card" style={{ margin: '10px', background: 'var(--color-danger-bg)', borderLeft: '4px solid var(--color-danger)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-danger)', display: 'block' }}>심사원 포털 잠금 모드</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>타 메뉴 및 승인 권한이 비활성화되었습니다.</span>
            </div>
            <button className="menu-item active"><Lock size={18} />심사원 포털 전용 뷰</button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{currentRole[0]}</div>
          <div className="user-details">
            <span className="user-name">{userName}</span>
            <span className="user-role">{currentRole} 권한</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
