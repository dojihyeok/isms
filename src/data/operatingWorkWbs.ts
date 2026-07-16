import type { OperatingWork } from './operatingWorkMaster';
import { getMoinWorkOrganization } from './moinOrganizationMapping';

export type WorkBreakdownItem = {
  id: string;
  phase: '준비' | '자료 수집' | '실행' | '산출물' | '개선' | '검토' | '승인' | '증적 관리';
  task: string;
  completionCriteria: string;
  requiredOutput: string;
  responsible: string;
  accountable: string;
  consulted: string[];
  informed: string[];
};

export const getOperatingWorkWbs = (work: OperatingWork): WorkBreakdownItem[] => {
  const organization = getMoinWorkOrganization(work);
  const collaborators = organization.cooperatingDepartments;
  const consulted = [...new Set([...collaborators, organization.reviewerDepartment])];
  const executionDepartments = new Set([organization.ownerDepartment]);
  const addExecutionDepartment = (department: string) => {
    if (department) executionDepartments.add(department);
  };
  const technicalExecutionRules: [RegExp,string[]][] = [
    [/계정|접근권한|MFA|네트워크|서버|VPN|클라우드|백업|복구|패치|EOL|키 생명주기|로그원|NTP/,['DevOps','Platform팀','Data팀']],
    [/소스코드|오픈소스|보안설계|개발|배포|응용/,['Platform팀','DevOps']],
    [/개인정보.*수량|정보주체 수|데이터흐름|개인정보 흐름/,['서비스운영팀','Data팀']],
    [/수탁사|공급자|외부위탁/,['경영지원팀(구매 기능)','법무팀','서비스운영팀']],
  ];
  technicalExecutionRules.forEach(([pattern,departments])=>{
    if(pattern.test(work.activity)) departments.filter(department=>collaborators.includes(department)).forEach(addExecutionDepartment);
  });
  if(/^BCP-0[12]$/.test(work.id)) ['각 핵심업무 부서','DevOps','Platform팀','Data팀'].forEach(addExecutionDepartment);
  if(work.id==='BCP-03') ['서비스운영팀','각 핵심업무 부서','Platform팀','Data팀','정보보안팀'].forEach(addExecutionDepartment);
  if(work.id.startsWith('APP-')) collaborators.forEach(addExecutionDepartment);
  if(work.fss.length){
    addExecutionDepartment('정보보안팀');
    work.fss.forEach(reference=>{
      if(reference.includes('전 영역')) [...collaborators,'DevOps','Platform팀','Data팀','서비스운영팀','법무팀','Compliance(교차검증 기능)'].forEach(addExecutionDepartment);
      if(/^1/.test(reference)) ['Compliance(교차검증 기능)','DevOps'].forEach(addExecutionDepartment);
      if(/^2/.test(reference)) ['DevOps','Platform팀','Data팀','서비스운영팀'].forEach(addExecutionDepartment);
      if(/^3/.test(reference)) ['DevOps','Platform팀'].forEach(addExecutionDepartment);
      if(/^4/.test(reference)) ['DevOps','Platform팀','Data팀'].forEach(addExecutionDepartment);
      if(/^5/.test(reference)) ['DevOps','서비스운영팀','법무팀'].forEach(addExecutionDepartment);
      if(reference==='CPC 요청') ['DevOps','Compliance(교차검증 기능)'].forEach(addExecutionDepartment);
    });
  }
  const executionResponsible=[...executionDepartments].join(' · ');
  const executionConsulted=collaborators.filter(department=>!executionDepartments.has(department));
  const accountable = work.domain === '개인·신용정보' || work.activity.includes('개인정보')
    ? 'CPO'
    : organization.ownerDepartment === '정보보안팀' || work.department.includes('정보보호')
      ? 'CISO'
      : organization.approver;
  const items: Omit<WorkBreakdownItem, 'id'>[] = [
    {
      phase: '준비', task: '수행 대상·범위·기준일 확정',
      completionCriteria: '대상 시스템·자산·조직·기간·기준일이 목록으로 확정되고, 제외 대상과 제외 사유가 책임자 승인을 받음', requiredOutput: '대상·범위 정의',
      responsible: organization.ownerDepartment, accountable, consulted, informed: [],
    },
    {
      phase: '준비', task: '이전 점검·심사 미흡사항과 변경사항 검토',
      completionCriteria: '이전 점검·심사 미흡사항과 조직·자산·서비스·법규 변경사항별 영향을 평가하고, 필요한 조치·담당자·완료기한이 등록됨', requiredOutput: '변경사항·이전 미흡사항 검토내역',
      responsible: organization.ownerDepartment, accountable, consulted: collaborators, informed: [organization.approver],
    },
    {
      phase: '준비', task: '수행계획·일정·담당·표본 확정',
      completionCriteria: '수행방법·대상·표본·일정·RACI·완료기준이 계획서에 포함되고 최종책임자 승인을 받음', requiredOutput: '수행계획·체크리스트',
      responsible: organization.ownerDepartment, accountable, consulted: collaborators, informed: [organization.approver],
    },
    {
      phase: '자료 수집', task: '원천 자료·로그·대장·설정값 요청 및 수집',
      completionCriteria: '필수자료가 모두 제출되고 기준일·대상범위·자료 출처가 검증됨. 미제출 자료는 보완하거나 대체증적과 미제출 사유에 대해 최종책임자 승인을 받음', requiredOutput: '자료 요청·제출대장',
      responsible: executionResponsible,
      accountable, consulted: [organization.reviewerDepartment], informed: [],
    },
    {
      phase: '실행', task: `${work.activity} 실행·점검`,
      completionCriteria: '승인된 대상과 체크리스트의 모든 항목을 수행하고, 항목별 결과·수행자·수행일·원본 증적이 기록됨', requiredOutput: '수행기록·원본 로그',
      responsible: executionResponsible, accountable, consulted: executionConsulted, informed: [organization.approver],
    },
    {
      phase: '실행', task: '결과 분석·적합성 판정·예외 등록',
      completionCriteria: '모든 점검항목에 적합·부적합·해당 없음 판정과 판단 근거가 입력되고, 부적합·예외 항목이 조치대장에 등록됨', requiredOutput: '분석·판정 결과',
      responsible: work.fss.length?executionResponsible:organization.ownerDepartment, accountable, consulted: executionConsulted, informed: [],
    },
    ...work.outputs.map(output => ({
      phase: '산출물' as const, task: `${output} 작성`,
      completionCriteria: `${output}에 대상범위·기준일·수행자·수행결과·판단 근거·원본 증적 위치가 포함되고, 검토자가 필수항목 누락이 없음을 확인한 기록을 남김`, requiredOutput: output,
      responsible: organization.ownerDepartment, accountable, consulted: collaborators, informed: [],
    })),
    {
      phase: '개선', task: '미흡사항 조치계획·담당·기한 등록',
      completionCriteria: '모든 부적합·미흡사항에 위험도·원인·조치내용·조치담당자·완료기한·임시 통제가 등록되고 조치책임자의 확인을 받음', requiredOutput: '미흡사항·조치대장',
      responsible: organization.ownerDepartment, accountable, consulted: collaborators, informed: [organization.approver],
    },
    {
      phase: '개선', task: '개선조치 수행 및 재점검',
      completionCriteria: '기한이 도래한 개선조치를 모두 완료하고 재점검으로 효과성을 입증함. 미완료 항목은 잔여위험·대체통제·새 완료기한에 대해 최종책임자 승인을 받음', requiredOutput: '조치증적·재점검 결과',
      responsible: executionResponsible,
      accountable, consulted: [organization.ownerDepartment], informed: [organization.approver],
    },
    {
      phase: '검토', task: '결과·산출물·증적 적정성 검토',
      completionCriteria: '검토자가 범위·판정기준·산출물·원본 증적을 확인하고, 모든 보완요청이 조치 완료된 후 검토완료 기록을 남김', requiredOutput: '검토의견·보완이력',
      responsible: organization.reviewerDepartment, accountable, consulted: [organization.ownerDepartment], informed: collaborators,
    },
    {
      phase: '승인', task: '최종 결과 승인·위험수용·후속조치 지시',
      completionCriteria: '최종책임자가 수행결과·미흡사항·잔여위험·후속조치 기한을 확인하고 최종 승인함. 반려된 경우 보완 후 재승인을 받아야 완료됨', requiredOutput: '최종 승인·재승인 기록',
      responsible: organization.approver, accountable, consulted: [organization.reviewerDepartment], informed: [organization.ownerDepartment, ...collaborators],
    },
    {
      phase: '증적 관리', task: '통제 매핑·증적 등록·보존기간 설정',
      completionCriteria: '승인된 최종본과 원본 증적이 관련 통제·규정·지침에 연결되고, 저장경로·접근권한·해시값·보존기간·폐기일이 검증됨', requiredOutput: '증적 등록정보',
      responsible: organization.ownerDepartment, accountable, consulted: [], informed: [organization.approver],
    },
  ];

  return items.map((item, index) => ({ ...item, id: `${work.id}-WBS-${String(index + 1).padStart(2, '0')}` }));
};

export const operatingWorkWbsSummary = (works: OperatingWork[]) => {
  const items = works.flatMap(getOperatingWorkWbs);
  return {
    workTypes: works.length,
    packages: items.length,
    departments: new Set(items.flatMap(item => [item.responsible, item.accountable, ...item.consulted, ...item.informed]).filter(Boolean)).size,
  };
};
