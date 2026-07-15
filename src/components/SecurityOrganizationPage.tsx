import { AlertTriangle, Bot, Building2, CheckCircle2, Download, ShieldCheck, UserRoundCheck, Users } from 'lucide-react';
import { SecurityStaffingAnalysis } from './SecurityStaffingAnalysis';
import { SecurityWorkforceCoverage } from './SecurityWorkforceCoverage';
import type { Evidence, SecurityTask } from '../models/compliance';
import { operatingWorkMaster } from '../data/operatingWorkMaster';

const importantChanges = [
  { basis:'「금감원 최근 AI 위협에 따른 체계 강화 점검.xlsx」 / 시트 1.자료제출요구, 2.작성자 정보, 4.점검결과표', change:'IT위험, IT자산, 취약점, 위협대응, 사고대응 자체점검을 지정 양식으로 작성하고 IT부서와 감사부서가 교차검증하여 최종 확정해야 함. 대표이사 서명 PDF, 엑셀, 항목별 증빙 일체를 CPC로 제출', added:'항목별 현황·평가등급·내규·개선계획 작성, 증빙 번호 부여, 감사 교차검증, 대표이사 서명, CPC 제출·보완 대응', role:'GRC 총괄 + IT 작성 + 독립감사 확인', risk:'보안팀 단독 작성은 양식의 교차검증 구조를 충족하지 못하고 제출 정확성·기한 관리가 취약'},
  { basis:'「금감원 최근 AI 위협에 따른 체계 강화 점검.xlsx」 / 시트 5.자체점검 체크리스트 / 1-1, 1-1-1, 1-1-2, 1-2, 1-2-1, 1-2-2', change:'모든 IT자산 보호전략, 비정상 활동 탐지, 업무연속성 정책을 포함한 전사 IT위험 관리체계와 수립·변경·승인 주체를 명확히 하고, 적정성을 매년 최소 1회 및 수시 검토해야 함', added:'IT위험 기준 현행화, CISO·CEO·위원회·이사회 승인경로 운영, 중요 변경의 이사회 보고, 반기·연간 적정성 검토', role:'보안팀장·GRC Lead + 전담 CISO', risk:'CISO가 CIO·CTO를 겸하면 IT 운영위험의 수립·승인·점검이 자기검증 구조로 보일 수 있음'},
  { basis:'「금감원 최근 AI 위협에 따른 체계 강화 점검.xlsx」 / 시트 5 / 2-1-1~2-5-4', change:'모든 IT자산의 분류·생명주기·관리항목·책임자·중요도·현행화·제3자 검증을 확인하며, 오픈소스와 클라우드는 담당 조직·인력, 취약점 점검, 장애복구 및 제14조의2 조치를 별도로 점검', added:'자산 누락 대사·자동화 수준 평가, EOL 항목 관리, 오픈소스 목록·라이선스·취약점, 클라우드 중요도·BCP·안전성 확보조치 점검', role:'GRC 자산총괄 + Cloud·AppSec 기술담당', risk:'현재 엑셀·수작업 혼용과 DevOps 협업만으로는 누락방지, 독립 검증, 오픈소스·클라우드 전문점검 공수를 지속하기 어려움'},
  { basis:'「금감원 최근 AI 위협에 따른 체계 강화 점검.xlsx」 / 시트 5 / 3-1-1~3-6-8', change:'전자금융기반시설 연 1회·홈페이지 반기 1회 점검, 결과와 보완계획의 점검 후 30일 이내 보고, 지연 시 위원회 승인, 제3자 감사까지 확인. 대규모 패치 급증, 공급망·제로데이, 긴급증원·예산·복구 절차와 VulnOps 여부도 점검', added:'연·반기 진단, 30일 보고, 조치 추적·재점검, 지연 승인, EOL 교체계획, 위협정보 영향분석, 패치 급증 시나리오·긴급인력·대체통제', role:'SecOps·Cloud·AppSec + 독립감사', risk:'점검표상 VulnOps 미구축, 패치 급증 시나리오와 긴급 증원계획 미수립 상태이므로 별도 개선 공수가 실제로 발생'},
  { basis:'「금감원 최근 AI 위협에 따른 체계 강화 점검.xlsx」 / 시트 5 / 4-1-1~4-4-5', change:'고도화 침해행위 대응절차와 연 1회 이상 대응·복구훈련, 모니터링 설비·인력, IT자산 전반 로그의 책임자 분석, 이상접근 보고절차를 점검. AI 자동분석은 도입 검토 또는 구축·운영 여부를 확인하는 항목', added:'고도화 공격 훈련, WAF 등 관제대상 확대, 서버·DB·단말 로그 통합, 정기 분석·보고, AI 분석 도입 타당성 검토', role:'SecOps·Threat Detection', risk:'점검표 현황에 WAF 관제대상과 정보보호 엔지니어 1명 보강 필요, 전 자산 로그 모니터링 개선 필요가 기재됨'},
  { basis:'「금감원 최근 AI 위협에 따른 체계 강화 점검.xlsx」 / 시트 5 / 5-1-1~5-4-4', change:'단기·대규모 해킹·DDoS 업무연속성, 제3자 서비스·AI 도입 비상계획, 최근 3년 훈련과 개선반영, 외부 전문기관의 대응시간 SLA, 포렌식·악성코드 지원처, 대체서비스·고객통지·보상절차를 확인', added:'대규모 공격 BCP·DR 현행화, 우선순위·대체수단, 전문기관 SLA, 포렌식 연락망, 고객 다중통지·피해보상 절차, 훈련 후 개선', role:'SecOps·BCM + CISO·CPO·법무', risk:'현재 지침은 단기·대규모 상황이 세분화되지 않았고 DDoS 대응 고도화와 BCP 현행화 필요가 점검표에 기재됨'},
  { basis:'「251020. 문서심사 추가 요구사항.xlsx」 / 시트 10.20 요청자료 / No.1~12', change:'외부업체 범위, 최신 네트워크 구성도, 위험 재평가·정량화·승인, SoA 작성·승인·세부조항, 협력업체 재선정, 직무변경 권한회수, 백업·훈련 절차, 자산 소유자·관리자, 보호구역 지정 등을 실제 보완 요청받음', added:'2026년 문서 최신성 재확인, 범위·구성도·위험·SoA 재승인, 외부업체·권한·백업·훈련·자산·보호구역 증적 재수집', role:'인증·개인정보 GRC', risk:'2025년 완료자료라도 기준일·조직·자산·업체가 변경되면 재검토와 당해연도 승인·증적이 필요'},
  { basis:'「2025년 정보보호 조직 및 업무 구성 방안안.xlsx」 / 시트1 / P3-01~P3-13-10', change:'기존 조직안에도 방화벽, 저장매체, 접근권한, 유해사이트, 장비반출, 외부자출입, 스팸메일, 단말예외, VPN, KMS 등 개별 요청 검토·처리가 상시 업무로 정의됨', added:'SR 접수·위험검토·승인·설정·만료·원복, 네트워크·시스템·단말 정책 상시운영, 월간 패치와 일단위 개인정보 검출', role:'Endpoint·IAM 엔지니어 + 보안팀장 검토', risk:'인증·감독 대응 공수와 일상 요청처리 공수가 같은 2명에게 동시에 집중됨'},
];

// 원본 파일에서 직접 확인한 회사 기재 현황만 기록한다. 인력 필요성 해석과 혼합하지 않는다.
const requirementVerification = [
  { kind:'감독기관 자료제출', finding:'2026.6.25 17:00까지 대표이사 서명 PDF, 엑셀, 증빙자료 일체를 CPC로 제출하도록 요구. IT부서와 감사부서 작성자·확인자를 각각 기재', proof:'작성본·교차검증 기록·대표이사 서명본·CPC 제출내역', level:'원문 확인' },
  { kind:'기존 체계의 강화 점검', finding:'IT위험 관리체계의 중요한 변경사항을 이사회에 보고하는 절차와 매년 최소 1회 이상 적정성 검토 여부를 확인', proof:'IT위험관리 기준·위원회/이사회 보고·정기검토 결과', level:'원문 확인' },
  { kind:'관리범위 세분화', finding:'자산관리는 API와 엑셀을 혼용하고 일부 수동 업데이트 중이며, 완전한 디지털화를 위한 추진계획은 없다고 기재. 오픈소스·클라우드 담당 조직과 인력도 별도 확인', proof:'자산대장·자동화 대사·오픈소스 목록·클라우드 평가·제3자 검증', level:'원문 및 회사 기재현황 확인' },
  { kind:'취약점 대응 강화', finding:'VulnOps 미구축, 패치 급증 시나리오 미수립, 긴급 증원계획 미수립으로 기재. 전자금융기반시설 연 1회·홈페이지 반기 1회 및 결과·보완계획 30일 이내 보고 여부 확인', proof:'진단계획·결과·30일 보고·조치대장·지연승인·긴급증원/예산계획', level:'원문 및 미흡현황 확인' },
  { kind:'모니터링 강화', finding:'24×365 위탁관제는 운영 중이나 고도화 대응 개선이 필요하고, WAF 등 관제대상과 정보보호 엔지니어 1명 보강 필요로 기재. AI 자동분석은 구체적 계획 없음', proof:'관제대상·로그원 목록·분석보고·이벤트 티켓·인력/위탁 SLA·AI 도입검토서', level:'원문 및 개선필요 확인' },
  { kind:'대규모 사고대응 강화', finding:'사고대응체계가 단기·대규모 상황으로 세분화되지 않았고 BCP 현행화 및 DDoS 대응 고도화가 필요하다고 기재', proof:'대규모 공격 시나리오·BCP/DR·외부지원 SLA·훈련결과·고객통지/보상 절차', level:'원문 및 개선필요 확인' },
  { kind:'실제 심사 보완', finding:'2025년 문서심사에서 외부업체, 네트워크 구성도 최신성, 위험 재평가·정량화, SoA 승인, 직무변경 권한회수, 백업·훈련, 자산 책임자, 보호구역 등 12개 항목을 추가 요구받아 완료 처리', proof:'2026년 기준일로 현행화된 동일 문서·재승인 기록·당해연도 운영결과', level:'심사 요청목록 확인' },
  { kind:'기존 상시운영', finding:'2025년 조직업무안에 네트워크·시스템·단말 운영과 저장매체, 접근권한, 차단예외, 장비반출, 외부자출입, 스팸, VPN, KMS, 방화벽 요청처리가 이미 개별 업무로 정의', proof:'요청·승인·처리·만료·원복 기록과 월간 처리통계', level:'업무목록 원문 확인' },
];

const targetRoles = [
  { role: '전담 CISO', headcount: '1명', mission: 'CEO·이사회 직접 보고, 예산·인력·위험수용 승인, IT 운영과 독립된 견제', priority: '필수' },
  { role: '보안팀장 / GRC Lead', headcount: '1명', mission: 'ISMS·ISO 27001 통합 관리체계, 규정·지침, 위험평가, 위원회 및 심사 총괄', priority: '현행 유지' },
  { role: '인증·개인정보 담당', headcount: '1명', mission: 'ISMS/ISO 증적, 개인정보·신용정보, 수탁사, 교육, 법규 및 CPO 지원', priority: '즉시 충원' },
  { role: 'SecOps·Cloud·AppSec', headcount: '1명', mission: '관제, 취약점·패치, 클라우드·애플리케이션 보안, 사고대응과 모의훈련', priority: '즉시 충원' },
  { role: 'Endpoint·IAM 엔지니어', headcount: '1명', mission: 'MDM·EDR·NAC, 계정·권한, 단말 정책, 로그 수집 및 자동화', priority: '현행 유지' },
  { role: 'AI·Threat / Detection', headcount: '0.5~1명', mission: 'AI 위협 모델링, 위협 인텔리전스, SIEM 탐지·자동화, 공급망·제로데이 대응', priority: '2단계' },
];

const responsibilities = [
  ['이사회·CEO', '정보보호 목표·예산 승인, 잔여위험 수용, 중대사고 감독', '분기/수시'],
  ['CISO', '관리체계 책임, 독립 보고, 정보보호위원회, 규제기관·인증기관 대응', '월/분기'],
  ['CPO·개인정보 담당', '개인·신용정보 생명주기, 처리방침, 권리보장, 유출 대응', '상시/반기'],
  ['보안팀(GRC)', '정책·위험·자산·교육·수탁사·내부점검·인증 증적 통합관리', '상시/연간'],
  ['보안팀(SecOps)', '관제·취약점·패치·로그·침해사고·복구훈련·AI 위협 대응', '24×365/월'],
  ['IT·DevOps', '자산 소유, 구성·변경·백업·복구·접근통제의 1차 실행', '상시'],
  ['개발·Product', '보안요구사항, 위협모델링, 코드·오픈소스·배포 보안', '릴리스별'],
  ['HR·경영지원', '입퇴사·직무변경, 서약·교육, 물리보안, 비상연락망', '발생 시'],
  ['법무·Compliance', '법규 변화, 계약·위탁, 금융소비자 통지·보상 절차', '분기/발생 시'],
  ['독립 감사', 'IT·보안 통제 독립 검증, 금감원 제출자료 교차검증', '반기/연간'],
];

const roadmap = [
  { phase: '0~30일', title: '거버넌스 정상화', items: ['CISO 겸직 적정성 법률 검토 및 전담·독립 보고안 의결', '정보보호위원회와 이사회 보고 캘린더 확정', 'ISMS·ISO·금감원 점검 통합 Gap 및 증적 책임자 지정'] },
  { phase: '31~90일', title: '전담역량 확보', items: ['GRC/인증 담당과 SecOps 인력 우선 충원', '자산–위험–취약점–패치 연계 대장 구축', 'AI·대규모 해킹·패치 급증 시나리오 및 외부 긴급지원 SLA 수립'] },
  { phase: '3~6개월', title: '운영 증적 축적', items: ['접근권한·로그·취약점·수탁사·교육 주기 활동 실행', 'AI 기반 탐지 도입 타당성 및 SIEM/EDR 탐지 고도화', '침해사고·BCP·DR·개인정보 유출 통합훈련 실시'] },
  { phase: '6~12개월', title: '인증 신청·심사', items: ['독립 내부감사와 경영검토 완료', '부적합 시정조치 및 효과성 확인', 'ISO 27001 Stage 1·2 및 ISMS 신청·현장심사 대응'] },
];

const policyUpdates = [
  ['SP01 정보보호규정 / SG02 조직지침', 'CISO 독립 보고, 대행자, 정보보호위원회, 직무분리와 전결권 명시', 'CISO·GRC', '조직도, 임명장, 위원회 의사록'],
  ['SG03 인적보안지침', 'AI 피싱·딥페이크·생성형 AI 정보유출 교육과 모의훈련 추가', 'HR·GRC', '교육계획, 수료·평가, 모의훈련 결과'],
  ['SG08·SG11 정보시스템/점검지침', '위험등급별 패치 SLA, 제로데이·공급망·패치 급증·VulnOps 절차', 'SecOps·IT', '자산별 취약점, 패치 이행률, 예외승인'],
  ['SG12 자산·위험관리지침', '클라우드·SaaS·AI 모델·데이터·API 자산 분류와 위험평가 연계', 'GRC·자산소유자', '자산대장, 흐름도, 위험등록부'],
  ['SG13 침해사고 대응지침', 'AI 기반 공격, 계정탈취, 랜섬웨어, 대규모 DDoS와 포렌식 지원 절차', 'SecOps·CISO', '탐지룰, 사고보고, 훈련·개선 결과'],
  ['SG14·SG18 재해복구/BCM', 'AI·제3자 서비스 장애, 대규모 공격, 대체서비스·고객통지 시나리오', 'IT·Operation', 'BIA, RTO/RPO, DR·BCP 훈련'],
  ['SG16 보안점검·감사지침', 'IT 작성–감사부서 교차검증–대표이사 확인의 독립 점검 절차', '독립감사·GRC', '감사계획, 표본, 부적합·시정조치'],
];

const executiveTerms = [
  ['ISMS-P', '국내 정보보호·개인정보보호 관리체계 인증', '문서 보유가 아니라 회사가 정한 통제를 실제로 반복 수행하고 증적으로 입증하는 인증'],
  ['ISO 27001', '국제 정보보호 관리체계 인증', '2025년 적합 결과는 기준선이며, 2026년 조직·자산·위험 변화와 운영 결과를 다시 현행화해야 함'],
  ['SoA', '적용성 보고서(Statement of Applicability)', 'ISO 통제별 적용·제외 이유와 구현 상태를 정리한 핵심 승인 문서'],
  ['GRC', '거버넌스·위험·준법 관리', '규정, 위험평가, 감독 대응, 인증, 증적을 통합 관리하는 역할'],
  ['SecOps', '보안 운영', '관제, 보안 이벤트 분석, 취약점·패치 및 침해사고 대응을 수행하는 역할'],
  ['AppSec', '애플리케이션 보안', '개발·변경 단계에서 설계, 코드, 오픈소스와 배포 보안을 점검하는 역할'],
  ['IAM', '계정·접근권한 관리', '입퇴사·직무변경에 따른 계정 발급·변경·회수와 과다권한을 통제'],
  ['FTE', '연간 실효 인력 환산값', '1 FTE는 해당 역할에 연간 업무시간 100%를 투입하는 1명. 법정 최소인원을 뜻하지 않음'],
  ['CPC', '금융감독원 자료제출 채널', '금감원 요구자료와 대표이사 확인본, 증빙을 지정 기한 내 제출하는 시스템'],
  ['VulnOps', '취약점 운영체계', '취약점 발견부터 담당 지정, 조치기한, 예외승인, 재점검까지 계속 추적하는 운영 방식'],
  ['SIEM', '통합 보안로그 분석', '서버·DB·네트워크·단말 로그를 모아 이상징후를 탐지·분석하는 체계'],
  ['EDR·NAC·WAF', '단말 탐지·접근통제·웹 공격방어 솔루션', '각각 단말 위협 대응, 네트워크 접속 통제, 웹 서비스 공격 차단을 담당'],
  ['BCP·DR', '업무연속성·재해복구', '공격·장애에도 핵심업무를 계속하거나 정해진 시간 안에 복구하기 위한 계획과 훈련'],
  ['RTO·RPO', '목표 복구시간·허용 데이터 손실시점', '서비스를 언제까지 복구하고 어느 시점의 데이터까지 복원할지 정한 경영 기준'],
  ['SLA', '서비스 수준 약정', '관제·포렌식·복구 업체의 대응시간, 품질, 책임과 미달 시 조치를 계약으로 정한 기준'],
  ['증적', '업무 수행을 입증하는 기록', '계획서만이 아니라 승인, 실행결과, 로그, 점검표, 개선조치까지 연결되어야 완료로 인정'],
];

const ismsReformChanges = [
  { page:'p.5·13', timing:'2027년~ 추진안', change:'ISMS-P 의무대상 확대 및 인증 3단계 차등화', requirement:'표준 101개 외에 고위험 강화인증군은 강화기준 20개(안)를 추가 적용하고, 간편·표준·강화 인증으로 구분', operation:'회사 적용등급·의무대상 여부 검토, 강화기준 Gap 분석, 예산·심사일정 재산정', owner:'정보보안팀(GRC)·법무팀·Compliance', evidence:'적용대상 검토서, 법규 영향평가, 경영진 보고', staffing:'인증·개인정보 GRC' },
  { page:'p.6', timing:'기준 개발 후 선배포·고시 반영', change:'CEO 직속 CISO·CPO 및 실질적 통제권한', requirement:'조직 전체의 보호업무를 조정·구현할 최고책임자를 CEO 직속 임원으로 임명하고 실질적 보안 통제 권한 부여', operation:'겸직·독립성 검토, 직무기술서·전결권·직접 보고체계와 예산·인력 권한 재승인', owner:'대표이사·이사회·정보보안팀', evidence:'임명장, 조직도, 전결규정, 이사회 의사록, 예산·인력 승인', staffing:'전담 CISO 또는 독립 보고체계' },
  { page:'p.6', timing:'강화기준 예시·시행 대비', change:'자산·계정·인증정보·무결성의 자동화 통제', requirement:'비인가 자산·구성요소 탐지, SW·펌웨어 무결성 검증, 계정 생명주기 자동화·실시간 반영, 적응형 인증, 토큰·API 키 생명주기 관리', operation:'자동 자산발견·CMDB 대사, FIM, IAM 자동화, MFA·위험기반 인증, 비밀정보 관리 운영', owner:'정보보안팀·DevOps·Platform팀', evidence:'도구 설정, 탐지·조치로그, 계정 처리 SLA, 인증정보 대장, 예외승인', staffing:'Endpoint·IAM + SecOps·Cloud·AppSec' },
  { page:'p.6', timing:'2027년~ 추진안', change:'인터넷 접점 자산을 포함한 인증범위 확대와 위험평가 재정비', requirement:'서비스 관련 장비·시설을 누락 없이 포함하고 외부 인터넷 연결 접점 자산은 반드시 범위에 포함. 위험수용 가이드라인 적용 예정', operation:'외부노출 자산 탐색, 서비스·자산·네트워크 범위 대사, 범위 변경승인, 위험 재평가·수용기준 현행화', owner:'정보보안팀(GRC)·DevOps·자산소유부서', evidence:'범위정의서, 외부접점 목록, 네트워크 구성도, 자산대장, 위험등록부', staffing:'GRC Lead + SecOps·Cloud·AppSec' },
  { page:'p.7~8', timing:'2027년~ 추진안', change:'예비심사 핵심항목 선검증 및 기술심사', requirement:'CISO·CPO 권한, 개인정보·인터넷 접점 자산, 비밀번호·암호화, 취약점·패치를 본심사 전에 확인. 미충족 시 최초인증 신청 반려 가능', operation:'신청 전 Gate 점검, 핵심항목 사전 모의심사, CVE·CCE·소스코드·모의침투 점검과 결함 선조치', owner:'정보보안팀·DevOps·Platform팀·CISO', evidence:'핵심항목 체크리스트, 취약점 결과, 조치·재점검, 신청 승인회의록', staffing:'인증 GRC + SecOps·AppSec' },
  { page:'p.7~8', timing:'강화·사고기업 대상 추진안', change:'점검자산 확대 및 현장실증형 심사', requirement:'취약점점검원이 기존 약 10대에서 최대 500대까지 점검하고, 자산 실사·퇴직계정 회수·이상행위 탐지·백업복구를 현장에서 실시간 시연', operation:'전 자산 기술점검 일정·계정 준비, 테스트 시나리오, 로그 탐지 시연, 실제 복구 리허설, 심사 중 즉시 대응', owner:'정보보안팀·DevOps·HR·Data팀', evidence:'대상 자산목록, 시연 절차·결과, 탐지로그, 권한회수 기록, 복구시험 결과', staffing:'SecOps·Cloud·AppSec + Endpoint·IAM' },
  { page:'p.9', timing:'2026년 하반기~ 추진안', change:'인증 취득 후 상시점검과 주기별 표준양식', requirement:'CISO·CPO 지정, 취약점, 로그·접속기록 등 핵심항목을 인증 후에도 지속 이행하고 사후심사에서 연간 운영 여부를 집중 확인', operation:'월·분기·반기·연간 캘린더 수행, 증적 완전성 월간 점검, 미흡 조치 추적, 사후심사 패키지 상시 유지', owner:'정보보안팀·전 통제 수행부서', evidence:'주기별 점검표, 로그, 승인, 시정조치대장, 분기 경영보고', staffing:'GRC + 각 기술담당의 지속 운영 공수' },
  { page:'p.9~10', timing:'2026년 하반기~ 추진안', change:'사고기업 심사강화와 중대결함 미조치 시 인증취소', requirement:'사고기업은 인력·기간 2배의 기술·현장심사 대상. EoS, 보안패치 미적용, 로그 미보관 등 중대결함은 위험수용 불가하며 100일 내 미조치 시 취소 심의', operation:'사고이력·원인·재발방지 통합관리, EoS·패치·로그 중대결함 즉시 에스컬레이션, 100일 시정기한 경영진 추적', owner:'CISO·정보보안팀·DevOps·대표이사', evidence:'사고조치 보고, 재발방지, EoS 교체계획, 패치·로그 증적, 경영진 조치보고', staffing:'전담 CISO + SecOps 사고대응 역량' },
];

export function SecurityOrganizationPage({ tasks, evidences }: { tasks: SecurityTask[]; evidences: Evidence[] }) {
  const currentAnnualTasks=tasks.length;
  const vacantRoleWork=operatingWorkMaster.filter(work=>['인증·개인정보 GRC','SecOps·Cloud·AppSec','AI·Threat Detection','전담 CISO'].includes(work.staffing)).length;
  const downloadOrganizationMarkdown=()=>{
    const table=(headers:string[],rows:string[][])=>`| ${headers.join(' | ')} |\n| ${headers.map(()=> '---').join(' | ')} |\n${rows.map(row=>`| ${row.map(value=>String(value).replace(/\|/g,'\\|').replace(/\n/g,'<br>')).join(' | ')} |`).join('\n')}`;
    const report=[
      '# 2026년 정보보호 조직 강화 및 인증 대응 보고서',
      '',
      `- 작성 기준일: ${new Date().toLocaleDateString('ko-KR')}`,
      '- 대상: ISO 27001 유지·현행화, ISMS·ISMS-P 인증 준비, 전자금융감독규정 및 금융감독원 요구 대응',
      '- 조직 기준: MOIN 조직도 2026-07-06',
      '',
      '## 1. 경영진 요약',
      '',
      '- 현재 정보보안팀은 정보보안팀장 1명과 정보보안팀원 1명으로 구성되어 정책·인증·감독대응·기술운영·사고대응 업무가 집중되어 있습니다.',
      '- CISO·CPO·CIO·CTO 겸직 구조는 수행과 승인·감독이 동일인에게 집중될 수 있어 독립성과 자기검증 위험을 별도로 통제해야 합니다.',
      '- 권고 조직은 전담 CISO 또는 독립 보고체계와 보안팀 5명 수준이며, 최소 우선 충원은 인증·개인정보 GRC와 SecOps·Cloud·AppSec입니다.',
      `- 현재 연간 수행 업무 ${currentAnnualTasks}건, 미충원 직무와 연결된 운영업무 유형 ${vacantRoleWork}개를 관리해야 합니다.`,
      '',
      '## 2. 현재 조직의 핵심 문제',
      '',
      '1. 2명에게 정책·운영·사고대응이 집중되어 직무분리와 업무연속성 입증이 어렵습니다.',
      '2. 인증용 문서 작성과 일상 보안솔루션 운영·SR·사고대응이 같은 인력에게 동시에 집중됩니다.',
      '3. 인증·개인정보 GRC, SecOps·Cloud·AppSec, AI 위협 탐지 역할에 전담 담당자가 없습니다.',
      '4. IT 운영을 지휘하는 임원이 CISO 역할까지 수행할 경우 독립 승인과 점검 구조를 보완해야 합니다.',
      '',
      '## 3. ISMS·ISMS-P 인증제 강화 개편 대응',
      '',
      '- 검토 파일: `/refer/ISMS 인증 강화 개편.pdf`',
      '- 문서 제목: `정보보호 및 개인정보보호 관리체계 인증제 실효성 강화방안`',
      '- 발행: 과학기술정보통신부·개인정보보호위원회, 2026년 4월',
      '',
      table(['검토 문서','발행기관·발행일','원문 페이지','시행 구분','중요 변경','요구 내용','2026년 선제 운영업무','담당 조직','필요 증적','인력 영향'],ismsReformChanges.map(item=>['정보보호 및 개인정보보호 관리체계 인증제 실효성 강화방안','과학기술정보통신부·개인정보보호위원회 / 2026.4',item.page,item.timing,item.change,item.requirement,item.operation,item.owner,item.evidence,item.staffing])),
      '',
      '> 적용 유의사항: 강화방안의 세부 고시·가이드라인 다수는 2026년 하반기 또는 2027년 이후 추진 예정입니다. 현재 확정 의무와 시행 대비 선제 준비를 구분하고, 인증 신청 시 최신 고시와 인증기준서를 재확인해야 합니다.',
      '',
      '## 4. 금융감독원·심사 요구와 인력 영향',
      '',
      table(['검토 문서·위치','중요 변경 요구','추가 운영업무','필요 역할','인력 부족 위험'],importantChanges.map(item=>[item.basis,item.change,item.added,item.role,item.risk])),
      '',
      '## 5. 권고 인력 구성',
      '',
      table(['역할','인원','핵심 임무','우선순위'],targetRoles.map(item=>[item.role,item.headcount,item.mission,item.priority])),
      '',
      '### 단계적 인력 확보안',
      '',
      '- 1단계: 인증·개인정보 GRC 1명과 SecOps·Cloud·AppSec 1명 우선 충원',
      '- 독립성: 전담 CISO 선임 또는 대표이사·이사회 직접 보고 및 독립 승인체계 확립',
      '- 2단계: AI·Threat Detection 0.5~1명 확보 또는 책임과 SLA가 명확한 전문업체 활용',
      '- 24×365 관제·포렌식은 외부 활용이 가능하지만 내부 책임자와 검증역량은 유지',
      '',
      '## 6. 부서 및 담당 역할별 책임',
      '',
      table(['조직·역할','핵심 책임','주기'],responsibilities),
      '',
      '## 7. 12개월 실행 로드맵',
      '',
      ...roadmap.flatMap(phase=>[`### ${phase.phase} · ${phase.title}`,'',...phase.items.map(item=>`- ${item}`),'']),
      '## 8. 규정·지침 개정 및 운영증적 반영',
      '',
      table(['대상 문서','필수 개정 내용','책임','핵심 증적'],policyUpdates),
      '',
      '## 9. 경영진 의사결정 요청',
      '',
      '- 인증·개인정보 GRC 및 SecOps·Cloud·AppSec 우선 충원 승인',
      '- CISO 독립성 확보방안과 CEO·이사회 직접 보고체계 승인',
      '- 자산 자동식별, IAM 자동화, 로그·취약점·무결성 검증 고도화 예산 검토',
      '- 미흡사항 조치기한, 잔여위험 수용 및 외부 전문업체 활용범위 승인',
      '',
      '## 10. 검토 근거',
      '',
      '- `MOIN_조직도.xlsx` — 2026-07-06 조직도와 정보보안팀 구성',
      '- `2025년 정보보호 조직 및 업무 구성 방안안.xlsx` — 정책·기술·점검·사고대응 업무',
      '- `금감원 최근 AI 위협에 따른 체계 강화 점검.xlsx` — IT위험·자산·취약점·위협·사고대응 점검',
      '- `정보보호 및 개인정보보호 관리체계 인증제 실효성 강화방안` — 2026.4 과기정통부·개인정보위',
      '- SP01·SP02 및 SG01~SG19 내부 규정·지침',
      '- ISMS-P 인증기준 및 ISO 27001:2022 적용성 보고서·심사자료',
      '',
      '---',
      '본 보고서는 제공된 `/refer` 문서와 시스템 운영업무 매핑을 기준으로 작성했습니다. 실제 인증 신청 시점의 법령·고시·인증기준과 회사의 최신 조직·자산·서비스 범위를 재검토해야 합니다.',
    ].join('\n');
    const url=URL.createObjectURL(new Blob([report],{type:'text/markdown;charset=utf-8'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download='MOIN_2026_정보보호_조직강화_인증대응_보고서.md';anchor.click();URL.revokeObjectURL(url);
  };
  return (
    <div className="security-org-page">
      <section className="org-hero-card">
        <div>
          <span className="org-eyebrow">SECURITY ORGANIZATION 2026</span>
          <h2>ISO 27001·ISMS 인증과 금융권 위협 대응을 위한 보안조직 강화안</h2>
          <p>현재 보안팀장 1명과 엔드포인트 엔지니어 1명만으로는 인증 운영, 금융감독원 자체점검, 개인정보, 관제·취약점, 사고대응을 동시에 지속하기 어렵습니다.</p>
        </div>
        <div className="org-hero-actions"><button type="button" className="org-markdown-download" onClick={downloadOrganizationMarkdown}><Download size={16}/>Markdown 보고서 다운로드</button><div className="org-decision-badge"><ShieldCheck size={24} /><strong>권고: 5명 전담체계</strong><span>최소 4명 + 독립 CISO</span></div></div>
      </section>

      <div className="org-summary-grid">
        <article className="org-summary-card risk"><AlertTriangle size={20} /><span>현행 핵심 위험</span><strong>2명에게 정책·운영·사고대응 집중</strong><p>직무분리, 상호검증, 휴가·퇴사 시 연속성 입증이 어렵습니다.</p></article>
        <article className="org-summary-card warning"><Building2 size={20} /><span>거버넌스 위험</span><strong>CISO·CPO·CIO·CTO 1인 겸직</strong><p>보호 기능이 IT 개발·운영을 독립적으로 견제하는 구조인지 설명이 필요합니다.</p></article>
        <article className="org-summary-card info"><Bot size={20} /><span>금감원 점검 핵심</span><strong>대규모 공격·패치 급증·전 자산 모니터링</strong><p>VulnOps 여부, 긴급 증원·예산, 공급망·제로데이, 전문기관 SLA를 확인하며 AI 자동분석은 도입 검토 여부를 묻습니다.</p></article>
        <article className="org-summary-card success"><UserRoundCheck size={20} /><span>인증 준비 판단</span><strong>2025년 안보다 전담성 강화 필요</strong><p>문서 보유보다 반복 운영 증적과 독립 검증을 수행할 인력이 핵심입니다.</p></article>
      </div>

      <section className="org-section-card executive-guide">
        <div className="org-section-heading"><div><span>EXECUTIVE READING GUIDE</span><h3>경영진이 먼저 확인할 판단 기준</h3></div></div>
        <div className="executive-decision-grid">
          <article><b>적합</b><p>해당 연도 기준과 증적을 검증한 결과입니다. 전년도 적합이 다음 연도 적합을 자동 보장하지 않습니다.</p></article>
          <article><b>현행화 필요</b><p>기준이나 전년도 자료는 있으나 2026년 변경 검토·재승인·운영 결과가 아직 확인되지 않은 상태입니다.</p></article>
          <article><b>진행중</b><p>체크 또는 증적 등록이 시작됐지만 검토·시정조치·승인까지 완료되지 않은 상태입니다.</p></article>
          <article><b>검증완료</b><p>실제 파일과 수행기간, 담당, 통제 근거를 확인한 상태입니다. 단순 파일명 매핑과 구분합니다.</p></article>
          <article><b>Gap / 공백</b><p>기준상 해야 할 업무는 정의됐지만 담당 인력 또는 당해연도 수행 증적이 없는 상태입니다.</p></article>
          <article><b>요청할 의사결정</b><p>전담인력·예산 승인, CISO 독립성 확보, 위험수용, 개선기한과 외부 전문업체 활용 범위를 결정해야 합니다.</p></article>
        </div>
        <details className="executive-glossary" open>
          <summary>보안·인증 용어 설명</summary>
          <div className="executive-glossary-grid">{executiveTerms.map(([term, fullName, meaning]) => <article key={term}><strong>{term}</strong><b>{fullName}</b><p>{meaning}</p></article>)}</div>
        </details>
      </section>

      <section className="org-section-card isms-reform-card">
        <div className="org-section-heading"><div><span>ISMS REFORM 2026–2027</span><h3>ISMS·ISMS-P 인증제 실효성 강화 개편 대응</h3></div><span className="org-headcount">원문: 2026.4 과기정통부·개인정보위</span></div>
        <div className="isms-reform-summary">
          <strong>경영진 핵심 메시지</strong>
          <p>2025년처럼 문서와 일부 표본 증적을 준비하는 방식만으로는 부족합니다. 향후 심사는 실제 자산·계정·로그·복구를 현장에서 시연하고 기술도구로 직접 점검하는 방향으로 바뀌므로, 인증 GRC 인력뿐 아니라 자산·IAM·SecOps·AppSec 운영인력이 매년 증적을 만들어야 합니다.</p>
        </div>
        <div className="org-table-wrap"><table className="org-responsibility-table isms-reform-table"><thead><tr><th>원문·시행 구분</th><th>중요 변경</th><th>원문 요구 내용</th><th>2026년 선제 운영업무</th><th>MOIN 담당 조직</th><th>필요 증적</th><th>인력 영향</th></tr></thead><tbody>{ismsReformChanges.map(item=><tr key={`${item.page}-${item.change}`}><td><b>「정보보호 및 개인정보보호 관리체계 인증제 실효성 강화방안」 {item.page}</b><span>{item.timing}</span></td><td><strong>{item.change}</strong></td><td>{item.requirement}</td><td>{item.operation}</td><td>{item.owner}</td><td>{item.evidence}</td><td>{item.staffing}</td></tr>)}</tbody></table></div>
        <p className="org-caution"><b>적용 해석:</b> 이 문서는 2026년 4월 발표된 강화방안이며, 페이지 13 일정상 세부 고시·가이드라인의 다수는 2026년 하반기 또는 2027년 이후 추진 예정입니다. 따라서 현재 확정 의무로 단정하지 않고 ‘시행 대비 선제 준비’로 표시했으며, 실제 신청 시점에는 최신 고시와 인증기준서를 다시 확인해야 합니다.</p>
      </section>

      <section className="org-section-card org-change-case">
        <div className="org-section-heading"><div><span>01 · VERIFIED REQUIREMENTS</span><h3>핵심 점검 요구·회사 기재현황·인력 필요성</h3></div><span className="org-headcount">연간 수행 {currentAnnualTasks}건 · 미충원 직무 업무유형 {vacantRoleWork}개</span></div>
        <p className="org-change-intro">원문 요구, 점검표에 회사가 기재한 현황, 추가 운영업무, 인력 필요성 해석을 분리했습니다. ‘강화’가 아닌 기존 법정업무와 기존 BAU도 별도로 표시하며, AI 자동분석은 의무 도입이 아닌 도입 검토 여부 확인으로 표기합니다.</p>
        <div className="org-table-wrap"><table className="org-responsibility-table org-change-table verified-change-table"><thead><tr><th>검토 문서·원문 위치</th><th>요구 구분</th><th>원문 요구 요지</th><th>회사 기재현황·확인사항</th><th>확인해야 할 증적</th><th>추가 운영업무</th><th>필요 역할·미충원 영향</th></tr></thead><tbody>{importantChanges.map((item,index)=>{const [document,...locations]=item.basis.split(' / ');const verified=requirementVerification[index];return <tr key={item.basis}><td><strong>{document}</strong><small>Excel 고정 페이지 없음<br/>{locations.join(' / ')}</small></td><td><span className="verification-chip">{verified.level}</span><b>{verified.kind}</b></td><td>{item.change}</td><td>{verified.finding}</td><td>{verified.proof}</td><td>{item.added}</td><td><strong>{item.role}</strong><small>{item.risk}</small></td></tr>})}</tbody></table></div>
        <p className="org-caution">페이지 표기 원칙: 현재 중요 변경 요구의 직접 근거는 모두 Excel 원본입니다. Excel은 인쇄영역·용지 설정에 따라 페이지 번호가 바뀌므로 ‘페이지 해당 없음’으로 표시하고, 고정 위치인 시트명과 점검번호를 병기했습니다. 존재하지 않는 페이지 번호는 임의로 만들지 않습니다.</p>
        <div className="org-staffing-logic"><article><b>현재 2명</b><span>보안팀장: GRC·인증·감독대응·검토</span><span>엔드포인트: 단말·계정·보안솔루션 운영</span></article><strong>＋</strong><article><b>즉시 보강 2명</b><span>인증·개인정보 GRC: 당해연도 증적과 심사 전담</span><span>SecOps·Cloud·AppSec: 관제·취약점·사고·개발보안</span></article><strong>＋</strong><article><b>독립성·고도화</b><span>전담 CISO: IT 운영과 분리된 승인·보고</span><span>AI 탐지·독립감사: 2단계 또는 전문업체 SLA</span></article></div>
      </section>

      <SecurityStaffingAnalysis />
      <SecurityWorkforceCoverage tasks={tasks} evidences={evidences} />

      <section className="org-section-card">
        <div className="org-section-heading"><div><span>03 · TARGET OPERATING MODEL</span><h3>권고 인력 구성</h3></div><span className="org-headcount">현행 2명 → 목표 5~6명</span></div>
        <div className="org-role-grid">
          {targetRoles.map((item) => (
            <article className="org-role-card" key={item.role}>
              <div><Users size={17} /><span className={`org-priority ${item.priority === '즉시 충원' || item.priority === '필수' ? 'urgent' : ''}`}>{item.priority}</span></div>
              <h4>{item.role}<b>{item.headcount}</b></h4><p>{item.mission}</p>
            </article>
          ))}
        </div>
        <div className="org-note"><strong>단계적 대안:</strong> 즉시 2명(GRC/인증, SecOps)을 충원하고, AI 탐지·포렌식·24×365 관제는 SLA가 명확한 전문업체로 보완하되 내부 책임자와 검증 역량은 반드시 유지합니다.</div>
      </section>

      <section className="org-section-card">
        <div className="org-section-heading"><div><span>04 · GOVERNANCE RISK</span><h3>CISO 겸직과 인증 신청 리스크</h3></div></div>
        <div className="org-risk-layout">
          <div className="org-risk-statement"><AlertTriangle size={26} /><h4>“겸직 자체”보다 독립성과 실효성 입증 실패가 핵심 위험</h4><p>회사 규모·법 적용 요건에 따라 겸직 허용 여부는 별도 법률 검토가 필요합니다. 다만 동일 임원이 CIO·CTO로서 IT 투자·개발·운영을 지휘하면서 CISO로 이를 승인·점검하면 자기검증 구조로 판단될 수 있습니다.</p></div>
          <ul className="org-check-list">
            <li><CheckCircle2 />임원급 CISO의 명시적 지정과 CEO·이사회 직접 보고</li>
            <li><CheckCircle2 />보안 예산·인력·위험수용에 대한 실질 권한</li>
            <li><CheckCircle2 />IT 운영부서와 보안 점검·승인의 직무분리</li>
            <li><CheckCircle2 />독립 내부감사와 감사부서 교차검증</li>
            <li><CheckCircle2 />최소 수개월의 주기적 운영·시정조치 증적</li>
          </ul>
        </div>
        <p className="org-caution">신청이 자동 반려된다고 단정할 수는 없지만, 전담조직·책임자·자원·독립성이 형식적이거나 운영 증적이 부족하면 신청 보완, 결함 또는 심사 지연 가능성이 높습니다.</p>
      </section>

      <section className="org-section-card">
        <div className="org-section-heading"><div><span>05 · RESPONSIBILITIES</span><h3>부서 및 담당자별 운영 책임</h3></div></div>
        <div className="org-table-wrap"><table className="org-responsibility-table"><thead><tr><th>조직/역할</th><th>핵심 책임</th><th>주기</th></tr></thead><tbody>{responsibilities.map(([owner, duty, cycle]) => <tr key={owner}><td>{owner}</td><td>{duty}</td><td>{cycle}</td></tr>)}</tbody></table></div>
      </section>

      <section className="org-section-card">
        <div className="org-section-heading"><div><span>06 · CERTIFICATION ROADMAP</span><h3>12개월 실행 로드맵</h3></div></div>
        <div className="org-roadmap">{roadmap.map((phase, index) => <article key={phase.phase}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{phase.phase}</b><h4>{phase.title}</h4><ul>{phase.items.map((item) => <li key={item}>{item}</li>)}</ul></div></article>)}</div>
      </section>

      <section className="org-section-card">
        <div className="org-section-heading"><div><span>07 · POLICY ENHANCEMENT</span><h3>규정·지침 개정 및 운영증적 반영안</h3></div></div>
        <div className="org-table-wrap"><table className="org-responsibility-table org-policy-table"><thead><tr><th>대상 문서</th><th>필수 개정 내용</th><th>책임</th><th>핵심 증적</th></tr></thead><tbody>{policyUpdates.map(([document, update, owner, evidence]) => <tr key={document}><td>{document}</td><td>{update}</td><td>{owner}</td><td>{evidence}</td></tr>)}</tbody></table></div>
      </section>

      <section className="org-section-card org-sources">
        <div className="org-section-heading"><div><span>08 · EVIDENCE BASE</span><h3>검토 근거</h3></div></div>
        <ul>
          <li>`MOIN_조직도.xlsx` — 2026-07-06 조직도와 정보보안팀 구성</li>
          <li>`2025년 정보보호 조직 및 업무 구성 방안안.xlsx` — 정책·기술·점검·사고대응 업무 목록</li>
          <li>`금감원 최근 AI 위협에 따른 체계 강화 점검.xlsx` — IT위험, 자산, 취약점, 위협, 사고대응 자체점검</li>
          <li>`SP01 정보보호규정`, `SG02 정보보안조직지침`, `SG11·12·13·14·16·18` — 내부 책임과 운영 절차</li>
          <li>ISMS-P 인증기준 1.1.2·1.1.3·1.1.6 및 ISO 27001:2022 5.2·5.3·5.4</li>
        </ul>
      </section>
    </div>
  );
}
