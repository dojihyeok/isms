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

const getOutputCompletionCriteria = (work: OperatingWork, output: string) => {
  const context=`${work.activity}의 수행 대상·기간과 연결된 ${output}`;
  if (/안건지/.test(output))
    return `${context}에 회의 목적·통제 근거·심의 또는 의결 요청사항·판단자료·제안부서가 기재되고 회의 전에 참석대상자에게 배포됨`;
  if (/참석명부/.test(output))
    return `${context}에 개최일시·참석자·직위·참석 또는 위임 여부가 기록되고, 위원회 구성 및 의결정족수 충족 여부가 확인됨`;
  if (/의사록|회의록/.test(output))
    return `${context}에 일시·장소·참석자·안건별 논의내용·의결내용·이견·후속조치가 기록되고 위원장 또는 승인권자의 확인을 받음`;
  if (/조치대장|부적합대장|미흡사항|누락·보완 추적대장|후속조치 대장/.test(output))
    return `${context}에 원 안건 또는 점검항목·미흡내용·원인·조치내용·담당부서·담당자·완료기한·진행상태·완료증적이 건별로 연결되고, 기한 경과 항목은 지연사유와 새 기한을 승인받음`;
  if (/시험데이터/.test(output))
    return `${context}에 데이터 출처·항목·생성방법·실데이터 사용 여부·마스킹 또는 합성 규칙·접근권한·사용기간·폐기일·처리자가 기록되고, 운영 개인정보가 노출되지 않으며 시험 종료 후 복구 불가하게 삭제됐음을 검증함`;
  if (/^BIA$/.test(output))
    return `${context}에 핵심업무별 중단 영향·시간대별 피해·법적·재무·고객 영향·필수 인력·시스템·데이터·외부 의존성·최대허용중단시간·RTO·RPO가 산정되고 각 핵심업무 책임자의 확인을 받음`;
  if (/제출서류 체크리스트/.test(output))
    return `${context}에 신청 유형별 필수·선택 서류·자료 소유부서·제출담당자·기준일·제출기한·작성·검토·승인·업로드 상태가 표시되고 미제출 또는 보완 중인 필수서류가 0건임`;
  if (/승인|품의|임명장|신고서|서약|서명본|의사결정서/.test(output))
    return `${context}에 승인 또는 신고 대상·결정내용·책임자·효력발생일·조건이 명시되고 필요한 결재·서명·신고가 완료되며 반려 또는 보완사항이 남아 있지 않음`;
  if (/수량 산정근거|수 산정근거|매출액 산정근거|매출 대사표|수수료 산정내역/.test(output))
    return `${context}에 산정 기준일·포함 및 제외 범위·산식·원천시스템·추출조건·산정값이 표시되고 원천자료 합계 및 신청서 기재값과 일치하며 재무·HR·Data 등 자료 소유부서가 확인함`;
  if (/보험증권|계약|NDA|SLA|라이선스|인증서/.test(output))
    return `${context}의 계약 또는 보장 당사자·대상·유효기간·범위·금액·책임·해지 및 갱신 조건이 업무 요구사항과 일치하고, 필요한 서명·납부·갱신이 완료됨`;
  if (/구성도|흐름도|구역도|조직도|구역도|데이터흐름/.test(output))
    return `${context}에 실제 운영환경의 구성요소·연결관계·정보 흐름·보호조치·포함 및 제외 범위·기준일·책임자가 표시되고 자산·서비스 소유자가 현행 환경과 일치함을 확인함`;
  if (/계획|방법론|절차|대응계획|연락망|체크리스트/.test(output))
    return `${context}에 목적·적용범위·수행항목·방법·담당부서와 담당자·일정·판정 및 완료기준·보고와 예외처리 절차가 포함되고 최종책임자의 승인을 받음`;
  if (/위험평가|영향평가|위협분석|충돌분석|재식별 위험|적정성 평가|CIA평가|유출평가|독립성확인|효과성 확인|BIA|위협모델|변경 위험 재평가/.test(output))
    return `${context}에 평가대상·평가기준·위협 또는 영향·발생가능성·영향도·위험등급·판단근거·처리방안·위험소유자가 기록되고 수용기준을 초과한 위험은 처리계획에 연결됨`;
  if (/점검표|점검결과|검토표|검토결과|검토서|검토$|검토확인|검토의견|점검$|월간점검|분기검토|화면점검|준수점검|잔여취약점|확인$/.test(output))
    return `${context}에 전체 점검항목·대상·표본 또는 전수 여부·수행일·수행자·적합·부적합·해당 없음 판정·판단근거·원본 증적이 기록되고 부적합 항목은 조치내역에 연결됨`;
  if (/시험|훈련|PoC|복구시간|접근테스트|효과검증|재점검|검증/.test(output))
    return `${context}에 시험 또는 훈련 시나리오·대상·기대결과·실제결과·수행자·수행일·소요시간·실패 및 개선사항이 기록되고 실패 항목을 조치한 뒤 재수행 결과가 합격함`;
  if (/목록|대장|등록부|현황|명단|CMDB|인력|보유기간표|분리보관 대상|부서별 개인정보 처리업무|개인정보 수탁사|계정·출입권한/.test(output))
    return `${context}에 관리대상별 고유 식별값·소유부서·담당자·상태·적용범위·기준일·원천자료가 입력되고 원천시스템과 전수 대조한 결과 누락·중복·미확인 항목이 없음`;
  if (/로그|기록|접수증|티켓|이력|내역|타임라인/.test(output))
    return `${context}이 대상기간 전체를 포함하고 원본 시스템 식별자·발생시각·수행자·대상·행위·결과가 확인되며, 누락기간·시간 불일치·삭제·임의 변경이 없음`;
  if (/정책|기준|방침|지침|규정|보안요구사항/.test(output))
    return `${context}에 통제 요구사항·적용대상·책임과 권한·운영절차·예외·위반 시 조치·검토주기가 반영되고 관련 부서 의견조회와 최종 승인 및 시행 공지가 완료됨`;
  if (/보고서|보고$|상황보고|결과|분석|판정|통계|현황대사/.test(output))
    return `${context}에 대상·기간·기준·수행방법·정상 및 미흡 결과·판단근거·원본 증적·후속조치·담당자와 기한이 포함되고 검토자의 확인을 받음`;
  if (/KPI|KRI|수집률|준수율|설치율|RTO|RPO|복구시간/.test(output))
    return `${context}에 지표 정의·산식·목표값·측정주기·원천데이터·실적값·목표 미달 원인·개선담당자와 기한이 기록되고 원천데이터로 재계산한 값과 일치함`;
  if (/예산안|비용·인력 산정|인력계획/.test(output))
    return `${context}에 업무별 필요 금액 또는 인력·산정근거·우선순위·집행시기·비용센터·미반영 위험이 포함되고 재무·HR 검토와 최종 예산권자의 승인을 받음`;
  if (/직무기술서|직무분리표|부서·담당자 지정|대상·과정·일정/.test(output))
    return `${context}에 대상 직무 또는 업무별 역할·책임·필요 역량·수행부서·담당자·검토자·승인자·대체자·적용일이 명확히 지정되고 이해상충 여부를 확인함`;
  if (/범위정의서|인증범위서|인증범위 개요|범위 포함·제외|제외 조직|제외 시스템|물리위치|서비스 상세설명/.test(output))
    return `${context}에 기준일·대상 서비스·조직·인력·시스템·물리위치·정보·외부위탁의 포함 및 제외 범위와 제외 사유가 표시되고 관련 목록·구성도·신청서 사이에 불일치가 없음`;
  if (/신청|요청|심의신청|반출요청/.test(output))
    return `${context}에 요청자·요청일·대상·업무 필요성·적용기간·요청사항·위험·필요 보호조치·첨부 근거가 입력되고 접수번호가 부여되어 승인 절차에 연결됨`;
  if (/개정안|대비표|의견조회|변경대비표|개정 대비표/.test(output))
    return `${context}에 변경 전·후 조문·변경사유·관련 법규 또는 통제·영향받는 조직과 시스템·시행일이 표시되고 이해부서 의견과 미반영 사유가 기록됨`;
  if (/설정|탐지규칙|보존설정|보호·통제·모니터링 표시/.test(output))
    return `${context}에 대상 시스템·설정항목·승인 기준값·실제 적용값·변경자·변경일·검증결과·예외가 기록되고 운영환경의 실제 설정값과 일치함`;
  if (/권한회수|자산반납|파기확인|삭제 확인|폐기확인|만료·원복|복구확인|투입·철수 확인/.test(output))
    return `${context}에 대상자 또는 자산·회수·반납·삭제·파기·원복 항목·처리자·처리일·처리결과·검증자가 기록되고 원 시스템 조회 또는 현물 대사로 잔여 권한·정보·자산이 없음을 확인함`;
  if (/조치|재발방지|예외|보완|후속조치|지급정지|차단|보상·구제/.test(output))
    return `${context}에 원인 또는 요청사항·위험도·조치대상·조치내용·담당자·완료기한·임시 보호조치·수행결과·완료증적·재검증 결과가 기록되고 미완료 위험은 책임자의 승인을 받음`;
  if (/법적근거|동의·고지|별도동의|처리방침|게시·공지|고객통지|신고·통지|기관·고객 통지/.test(output))
    return `${context}에 처리 목적·대상·법적 근거 또는 동의 항목·필수 고지사항·통지대상·통지방법·통지시각·수신 또는 게시 확인이 기록되고 적용 법정기한과 승인 절차를 충족함`;
  if (/교재|업무·범위 소개자료|부서별 자료|보완자료|이행증적 패키지|제출본|작성본/.test(output))
    return `${context}가 승인된 범위와 최신 기준을 반영하고 문서번호·버전·작성부서·기준일·관련 통제·원본 증적 위치를 포함하며 제출목록과 실제 파일 수·파일명이 일치함`;
  if (/공문|사업자등록증|Q&A|일정|완료일|서명|업로드|운영여부|장·절·조 매핑|명세서/.test(output))
    return `${context}에 신청 또는 심사에 요구되는 필수 항목·기준일·문서번호·작성 및 확인 주체·제출상태가 기재되고 공식 원본 및 신청시스템 입력값과 일치하며 필수 서명·업로드·접수가 완료됨`;
  if (/포렌식|증거보전|사고접수|비상소집/.test(output))
    return `${context}에 사고 식별번호·발생 및 인지시각·대상 시스템·초동조치·증거 수집자·수집시각·원본 해시·보관 및 인계이력·분석결과가 기록되고 증거 무결성과 비상연락망 가동 여부가 확인됨`;
  if (/비교표|대책 비교표/.test(output))
    return `${context}에 비교대상·동일 기준의 기능·보안성·법규충족·비용·인력·도입기간·잔여위험·선정 또는 제외 사유가 기재되고 의사결정권자의 확인을 받음`;
  if (/분류·담당배정/.test(output))
    return `${context}에 접수번호·요청유형·위험도·우선순위·수행부서·담당자·목표완료일·배정시각이 기록되고 미배정 또는 기한 없는 요청이 없음`;
  return `${context}에 이 업무를 수행했다는 사실을 확인할 수 있는 대상·기준일·작성자·수행내용·결과·판단근거·원본자료 위치가 기록되고, 업무 책임자가 원천자료와 일치함을 확인함`;
};

const getOutputTask = (work: OperatingWork, output: string) => {
  const prefix=`${work.activity} — `;
  if (/보험증권|계약|NDA|SLA|라이선스|인증서/.test(output)) return `${prefix}${output} 확보 및 유효성 확인`;
  if (/구성도|흐름도|구역도|조직도/.test(output)) return `${prefix}${output} 현행화 및 실제 환경 대조`;
  if (/목록|대장|현황|명단|CMDB|인력/.test(output)) return `${prefix}${output} 작성 및 원천자료 대조`;
  if (/로그|기록|접수증|티켓|이력|내역|제출본/.test(output)) return `${prefix}${output} 추출 및 누락 여부 확인`;
  if (/계획|기준|방법론|절차|정책|지침|체크리스트/.test(output)) return `${prefix}${output} 수립 및 승인`;
  if (/승인|품의|의사록|임명장|신고서|서약서/.test(output)) return `${prefix}${output} 작성·상신 및 승인`;
  return `${prefix}${output} 작성 및 검토`;
};

const getOutputPhase = (output: string): WorkBreakdownItem['phase'] => {
  if (/조치|개선|재발방지|재점검|보완/.test(output)) return '개선';
  if (/계획|기준|방법론|체크리스트|대상|범위|신청|요구사항/.test(output)) return '준비';
  if (/목록|대장|현황|명단|원천|접수|자료|구성도|흐름도|조직도/.test(output)) return '자료 수집';
  if (/승인|품의|서명|임명장|신고서/.test(output)) return '승인';
  if (/점검|시험|훈련|분석|평가|검토|로그|기록|탐지|통계/.test(output)) return '실행';
  return '산출물';
};

const getOutputResponsible = (work: OperatingWork, output: string, fallback: string, executionResponsible: string) => {
  if (/매출|예산|보험료|수수료|비용/.test(output)) return '재무팀';
  if (/임직원|인원 수|인력계획|직무기술|조직도|징계/.test(output)) return 'HR';
  if (/이용자 수|정보주체 수|개인정보.*수/.test(output)) return '서비스운영팀 · Data팀';
  if (/법무검토/.test(output)) return '법무팀';
  if (work.id.startsWith('APP-')&&/외부위탁|수탁사/.test(output)) return '경영지원팀(구매 기능) · 법무팀 · 서비스운영팀';
  if (/계약|NDA|SLA|법적근거|법규|국외이전/.test(output)) return '법무팀 · 경영지원팀(구매 기능)';
  if (/개인정보.*수|정보주체 수|개인정보 항목|개인정보 흐름|데이터흐름/.test(output)) return '서비스운영팀 · Data팀';
  if (/시스템|네트워크|서버|장비|자산|CMDB|로그|NTP|백업|복구|패치|키|소스|배포|설정/.test(output)) return executionResponsible;
  return fallback;
};

export const getOperatingWorkWbs = (work: OperatingWork): WorkBreakdownItem[] => {
  const organization = getMoinWorkOrganization(work);
  const collaborators = organization.cooperatingDepartments;
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
  const requiresFindingsWorkflow=/점검|진단|평가|감사|모니터링|검토|분석|재인증/.test(work.activity);
  const items: Omit<WorkBreakdownItem, 'id'>[] = [
    ...(requiresFindingsWorkflow?[{
      phase: '실행' as const, task: `${work.activity} 결과 분석·적합성 판정·예외 등록`,
      completionCriteria: `${work.activity}의 모든 점검항목에 적합·부적합·해당 없음 판정과 판단 근거가 입력되고, 부적합·예외 항목이 분석·판정 결과와 조치대장에 연결됨`, requiredOutput: '분석·판정 결과',
      responsible: work.fss.length?executionResponsible:organization.ownerDepartment, accountable, consulted: executionConsulted, informed: [],
    }]:[]),
    ...work.outputs.map(output => ({
      phase: getOutputPhase(output), task: getOutputTask(work,output),
      completionCriteria: getOutputCompletionCriteria(work,output), requiredOutput: output,
      responsible: getOutputResponsible(work,output,organization.ownerDepartment,executionResponsible), accountable, consulted: collaborators, informed: [],
    })),
    ...(requiresFindingsWorkflow?[{
      phase: '개선' as const, task: `${work.activity} 미흡사항 조치계획·담당·기한 등록`,
      completionCriteria: `${work.activity}에서 확인된 모든 부적합·미흡사항이 미흡사항·조치대장에 위험도·원인·조치내용·조치담당자·완료기한·임시 통제와 함께 등록되고 조치책임자의 확인을 받음`, requiredOutput: '미흡사항·조치대장',
      responsible: organization.ownerDepartment, accountable, consulted: collaborators, informed: [organization.approver],
    },
    {
      phase: '개선' as const, task: `${work.activity} 개선조치 수행 및 재점검`,
      completionCriteria: `${work.activity}의 완료기한이 지난 개선조치가 없고, 완료한 조치는 조치증적·재점검 결과로 문제가 해결됐음을 확인함. 미완료 항목은 사유·임시 보호조치·새 완료기한에 대해 최종책임자 승인을 받음`, requiredOutput: '조치증적·재점검 결과',
      responsible: executionResponsible,
      accountable, consulted: [organization.ownerDepartment], informed: [organization.approver],
    }]:[]),
    {
      phase: '검토', task: `${work.activity} 결과·산출물·증적 적정성 검토`,
      completionCriteria: `검토자가 ${work.activity}의 통제 요구·주요 점검 항목·범위·판정기준·필수 산출물 ${work.outputs.join('·')}·원본 증적을 대조하고, 모든 보완요청을 조치한 검토의견·보완이력을 남김`, requiredOutput: '검토의견·보완이력',
      responsible: organization.reviewerDepartment, accountable, consulted: [organization.ownerDepartment], informed: collaborators,
    },
    {
      phase: '승인', task: `${work.activity} 최종 결과 승인·위험수용·후속조치 지시`,
      completionCriteria: `최종책임자가 ${work.activity}의 수행결과·필수 산출물·미흡사항·남은 위험·후속조치 기한을 확인한 최종 승인·재승인 기록이 존재함. 반려사항이 있으면 보완 후 재승인을 받아야 완료됨`, requiredOutput: '최종 승인·재승인 기록',
      responsible: organization.approver, accountable, consulted: [organization.reviewerDepartment], informed: [organization.ownerDepartment, ...collaborators],
    },
    {
      phase: '증적 관리', task: `${work.activity} 통제 매핑·증적 등록·보존기간 설정`,
      completionCriteria: `${work.activity}의 승인된 최종본과 원본 증적이 관련 통제 ${work.isms.join(', ')} 및 규정·지침에 연결되고, 증적 등록정보의 저장경로·접근권한·해시값·보존기간·폐기일이 검증됨`, requiredOutput: '증적 등록정보',
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
