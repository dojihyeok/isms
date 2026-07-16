import type { OperatingWork } from './operatingWorkMaster';
import { getMoinWorkOrganization } from './moinOrganizationMapping';

export type WorkBreakdownItem = {
  id: string;
  phase: '준비' | '자료수집' | '실행' | '산출물' | '개선' | '검토' | '승인' | '증적관리';
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
      completionCriteria: '대상 시스템·자산·조직·기간과 제외사항이 문서로 확정됨', requiredOutput: '대상·범위 정의',
      responsible: organization.ownerDepartment, accountable, consulted, informed: [],
    },
    {
      phase: '준비', task: '전기 미흡사항·변경사항·법규 요구 검토',
      completionCriteria: '전년도 결과와 당해연도 조직·자산·서비스·법규 변경 영향이 식별됨', requiredOutput: '변경·전기 미흡 검토내역',
      responsible: organization.ownerDepartment, accountable, consulted: collaborators, informed: [organization.approver],
    },
    {
      phase: '준비', task: '수행계획·일정·담당·표본 확정',
      completionCriteria: '수행방법, 일정, 담당조직, 표본과 완료기준이 승인됨', requiredOutput: '수행계획·체크리스트',
      responsible: organization.ownerDepartment, accountable, consulted: collaborators, informed: [organization.approver],
    },
    {
      phase: '자료수집', task: '원천자료·로그·대장·설정값 요청 및 수집',
      completionCriteria: '요청 대상별 제출 여부와 기준일이 확인되고 누락자료가 식별됨', requiredOutput: '자료요청·제출대장',
      responsible: executionResponsible,
      accountable, consulted: [organization.reviewerDepartment], informed: [],
    },
    {
      phase: '실행', task: `${work.activity} 실행·점검`,
      completionCriteria: '승인된 범위와 체크리스트에 따라 실제 수행기록이 남음', requiredOutput: '수행기록·원본 로그',
      responsible: executionResponsible, accountable, consulted: executionConsulted, informed: [organization.approver],
    },
    {
      phase: '실행', task: '결과 분석·적합성 판정·예외 식별',
      completionCriteria: '정상·미흡·해당없음 판정과 판단 근거가 항목별로 기록됨', requiredOutput: '분석·판정 결과',
      responsible: work.fss.length?executionResponsible:organization.ownerDepartment, accountable, consulted: executionConsulted, informed: [],
    },
    ...work.outputs.map(output => ({
      phase: '산출물' as const, task: `${output} 작성`,
      completionCriteria: `${output}에 수행범위·결과·담당·기준일·근거가 포함됨`, requiredOutput: output,
      responsible: organization.ownerDepartment, accountable, consulted: collaborators, informed: [],
    })),
    {
      phase: '개선', task: '미흡사항 조치계획·담당·기한 등록',
      completionCriteria: '미흡별 위험도, 조치담당, 완료기한과 임시통제가 지정됨', requiredOutput: '미흡·조치대장',
      responsible: organization.ownerDepartment, accountable, consulted: collaborators, informed: [organization.approver],
    },
    {
      phase: '개선', task: '개선조치 수행 및 재점검',
      completionCriteria: '조치 전후 결과를 비교해 효과성이 확인되거나 예외승인이 완료됨', requiredOutput: '조치증적·재점검 결과',
      responsible: executionResponsible,
      accountable, consulted: [organization.ownerDepartment], informed: [organization.approver],
    },
    {
      phase: '검토', task: '결과·산출물·증적 적정성 검토',
      completionCriteria: '범위 누락, 기준 불일치, 증적 불충분 여부가 검토되고 보완됨', requiredOutput: '검토의견·보완이력',
      responsible: organization.reviewerDepartment, accountable, consulted: [organization.ownerDepartment], informed: collaborators,
    },
    {
      phase: '승인', task: '최종 결과 승인·위험수용·후속조치 지시',
      completionCriteria: '승인권자가 결과와 잔여위험을 확인하고 승인 또는 반려함', requiredOutput: '승인·반려 기록',
      responsible: organization.approver, accountable, consulted: [organization.reviewerDepartment], informed: [organization.ownerDepartment, ...collaborators],
    },
    {
      phase: '증적관리', task: '통제 매핑·증적 등록·보존기간 설정',
      completionCriteria: '최종본이 관련 통제·규정·지침과 연결되고 원본 경로·무결성·보존기간이 기록됨', requiredOutput: 'VFS 증적 메타데이터',
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
