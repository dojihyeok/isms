import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Users } from 'lucide-react';

type Scenario = 'minimum' | 'recommended';

const staffing = [
  { role: 'CISO', current: 0.25, minimum: 1, recommended: 1, sourcing: '전담 임원 또는 독립 보고체계' },
  { role: '보안팀장·GRC Lead', current: 1, minimum: 1, recommended: 1, sourcing: '현행 유지' },
  { role: '인증·개인정보 GRC', current: 0, minimum: 1, recommended: 1, sourcing: '정규직 우선 충원' },
  { role: 'SecOps·Cloud·AppSec', current: 0, minimum: 1, recommended: 1, sourcing: '정규직 + 전문업체' },
  { role: 'Endpoint·IAM', current: 1, minimum: 1, recommended: 1, sourcing: '현행 유지' },
  { role: 'AI·Threat Detection', current: 0, minimum: 0, recommended: 1, sourcing: '2단계 충원 또는 MDR' },
];

const raciRows = [
  { activity: '정보보호 전략·예산·위험수용', executive: 'A', ciso: 'R', grc: 'C', secops: 'C', it: 'C', audit: 'I', conflict: true },
  { activity: 'ISMS·ISO 인증 및 경영검토', executive: 'I', ciso: 'A', grc: 'R', secops: 'C', it: 'C', audit: 'C', conflict: false },
  { activity: 'IT자산·위험·취약점 통합관리', executive: 'I', ciso: 'A', grc: 'R', secops: 'R', it: 'R', audit: 'C', conflict: false },
  { activity: '보안관제·AI 위협·침해사고 대응', executive: 'I', ciso: 'A', grc: 'C', secops: 'R', it: 'R', audit: 'I', conflict: false },
  { activity: '접근권한·Endpoint·로그 통제', executive: 'I', ciso: 'A', grc: 'C', secops: 'R', it: 'R', audit: 'C', conflict: true },
  { activity: '개인·신용정보 및 수탁사 관리', executive: 'I', ciso: 'C', grc: 'R', secops: 'C', it: 'C', audit: 'C', conflict: false },
  { activity: 'BCP·DR·대규모 공격 훈련', executive: 'I', ciso: 'A', grc: 'C', secops: 'R', it: 'R', audit: 'C', conflict: false },
  { activity: '독립 내부감사·금감원 교차검증', executive: 'I', ciso: 'C', grc: 'C', secops: 'I', it: 'I', audit: 'A/R', conflict: false },
];

const columns = [
  ['executive', 'CEO·이사회'], ['ciso', 'CISO'], ['grc', 'GRC'], ['secops', 'SecOps'], ['it', 'IT·개발'], ['audit', '독립감사'],
] as const;

function formatFte(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function SecurityStaffingAnalysis() {
  const [scenario, setScenario] = useState<Scenario>('recommended');
  const targetKey = scenario === 'minimum' ? 'minimum' : 'recommended';
  const totals = useMemo(() => {
    const current = staffing.reduce((sum, item) => sum + item.current, 0);
    const target = staffing.reduce((sum, item) => sum + item[targetKey], 0);
    return { current, target, gap: target - current };
  }, [targetKey]);

  return (
    <>
      <section className="org-section-card">
        <div className="org-section-heading staffing-heading">
          <div><span>01 · STAFFING GAP</span><h3>인력 Gap 분석</h3></div>
          <div className="staffing-scenario" role="group" aria-label="인력 구성 시나리오">
            <button className={scenario === 'minimum' ? 'active' : ''} onClick={() => setScenario('minimum')}>최소안</button>
            <button className={scenario === 'recommended' ? 'active' : ''} onClick={() => setScenario('recommended')}>권고안</button>
          </div>
        </div>
        <div className="staffing-kpis">
          <div><span>현행 실효 인력</span><strong>{formatFte(totals.current)} FTE</strong><small>CISO 겸직은 0.25 FTE로 산정</small></div>
          <div><span>{scenario === 'minimum' ? '최소 목표' : '권고 목표'}</span><strong>{formatFte(totals.target)} FTE</strong><small>{scenario === 'minimum' ? '인증 운영 최소 방어선' : 'AI·금융권 위협 대응 포함'}</small></div>
          <div className="gap"><span>부족 인력</span><strong>+{formatFte(totals.gap)} FTE</strong><small>독립 CISO 전환분 포함</small></div>
        </div>
        <div className="org-table-wrap">
          <table className="org-responsibility-table staffing-table">
            <thead><tr><th>역할</th><th>현행</th><th>목표</th><th>Gap</th><th>확보 방식</th><th>판정</th></tr></thead>
            <tbody>{staffing.map((item) => {
              const target = item[targetKey];
              const gap = Math.max(target - item.current, 0);
              return <tr key={item.role}><td>{item.role}</td><td>{formatFte(item.current)}</td><td>{formatFte(target)}</td><td className={gap > 0 ? 'staffing-gap-value' : ''}>{gap > 0 ? `+${formatFte(gap)}` : '—'}</td><td>{item.sourcing}</td><td>{gap > 0 ? <span className="staffing-status missing"><AlertCircle size={13} />부족</span> : <span className="staffing-status ready"><CheckCircle2 size={13} />충족</span>}</td></tr>;
            })}</tbody>
          </table>
        </div>
        <p className="org-caution">FTE는 역할 수행에 투입 가능한 연간 실효 인력 기준의 내부 계획값입니다. 법정 최소 인원으로 해석하지 않으며, 인증 범위·자산 수·서비스 중요도·외주 범위에 따라 재산정해야 합니다.</p>
      </section>

      <section className="org-section-card">
        <div className="org-section-heading"><div><span>02 · RACI MATRIX</span><h3>인증·감독 운영활동 책임체계</h3></div><div className="raci-legend"><span>R 수행</span><span>A 최종책임</span><span>C 협의</span><span>I 보고</span></div></div>
        <div className="raci-explanation">
          <div>
            <strong>RACI Matrix란?</strong>
            <p>업무마다 실제 수행자와 최종 책임자를 분리하고, 협의·보고 대상을 정해 누락과 자기검증을 방지하는 책임 배분표입니다. 한 행이 하나의 주요 운영활동이며 열은 참여 조직을 의미합니다.</p>
          </div>
          <dl>
            <div><dt className="raci-chip raci-r">R</dt><dd><b>Responsible · 수행책임</b><span>업무를 실행하고 산출물·증적을 작성하는 역할입니다. 한 업무에 여러 명을 지정할 수 있습니다.</span></dd></div>
            <div><dt className="raci-chip raci-a">A</dt><dd><b>Accountable · 최종책임</b><span>결과를 승인하고 완료 여부에 최종 책임을 집니다. 책임 혼선을 막기 위해 원칙적으로 업무당 1개 역할을 지정합니다.</span></dd></div>
            <div><dt className="raci-chip raci-c">C</dt><dd><b>Consulted · 협의</b><span>수행·승인 전에 전문 의견이나 검토를 제공하는 양방향 참여 역할입니다.</span></dd></div>
            <div><dt className="raci-chip raci-i">I</dt><dd><b>Informed · 보고</b><span>진행 또는 결과를 공유받는 역할이며, 직접 수행·승인 책임은 없습니다.</span></dd></div>
          </dl>
          <p className="raci-reading-guide"><b>읽는 예:</b> ‘ISMS·ISO 인증 및 경영검토’는 GRC가 실행(R), CISO가 최종 승인·책임(A), SecOps·IT·독립감사가 자료 제공과 검토(C), CEO·이사회가 결과를 보고받는(I) 구조입니다. <b>A/R</b>은 독립감사가 수행과 최종책임을 함께 맡는 경우를 뜻합니다.</p>
        </div>
        <div className="org-table-wrap">
          <table className="raci-table"><thead><tr><th>운영활동</th>{columns.map(([, label]) => <th key={label}>{label}</th>)}<th>점검</th></tr></thead><tbody>
            {raciRows.map((row) => <tr key={row.activity}><td>{row.activity}</td>{columns.map(([key]) => <td key={key}><span className={`raci-chip raci-${row[key].toLowerCase().replace('/', '-')}`}>{row[key]}</span></td>)}<td>{row.conflict ? <span className="raci-conflict"><AlertCircle size={13} />겸직 충돌</span> : <span className="raci-ok"><CheckCircle2 size={13} />분리 가능</span>}</td></tr>)}
          </tbody></table>
        </div>
        <div className="org-note"><Users size={15} /><strong>점검 열의 의미:</strong> ‘겸직 충돌’은 현재 CISO가 CIO·CTO 역할까지 겸해 수행(R)과 최종책임(A)이 동일 인물에게 집중될 가능성이 있는 업무입니다. CIO·CTO가 실행한 접근통제·변경·운영 결과는 동일 인물의 CISO가 단독 승인하지 않고, 보안팀장 검토와 CEO 또는 정보보호위원회 승인, 독립감사 사후검증을 적용합니다.</div>
      </section>
    </>
  );
}
