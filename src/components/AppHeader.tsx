import { Award, Target } from 'lucide-react';
import type { Framework } from './AppSidebar';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'ISMS-P 통합 컴플라이언스 대시보드',
  matrix: 'ISMS-P 통합 통제성 매트릭스 & 증적 매핑',
  tasks: '연도별 정보보호 운영계획·WBS·부서별 수행관리',
  evidence: '통합 증적 보관소 (Virtual File System)',
  auditor: 'ISMS-P 외부 심사원 검증 포털',
  logs: '감사 추적 로그 (Audit Logs)',
  'iso-soa': 'ISO 27001:2022 SOA 운영 현황 보고서',
  mapping: 'ISO 27001 ↔ ISMS-P 통제항목 매핑 & Gap 분석',
  organization: '정보보호 조직·인력 구성 및 인증 운영체계',
  'governance-evidence': '정보보호 관리체계 운영활동·증적 통합 보관소',
  'certification-ops': 'ISMS-P 인증 운영센터',
};

interface AppHeaderProps {
  activeTab: string;
  framework: Framework;
  systemTime: string;
}

export function AppHeader({ activeTab, framework, systemTime }: AppHeaderProps) {
  return (
    <header className="main-header">
      <div className="header-title-sec">
        <h1>{TAB_TITLES[activeTab] ?? '컴플라이언스 관리'}</h1>
        <div className="header-framework-badge">
          {framework === 'ISO27001' ? (
            <span className="fw-badge iso"><Award size={12} /> ISO 27001:2022 인증 취득</span>
          ) : (
            <span className="fw-badge isms"><Target size={12} /> ISMS-P 인증 준비 중</span>
          )}
        </div>
      </div>
      <div className="header-actions">
        <span className="header-time">📅 SYSTEM TIME: {systemTime || '동기화 중'}</span>
      </div>
    </header>
  );
}
