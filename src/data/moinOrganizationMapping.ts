import type { OperatingWork } from './operatingWorkMaster';

export type MoinWorkOrganization = {
  ownerDepartment: string;
  cooperatingDepartments: string[];
  reviewerDepartment: string;
  approver: string;
  source: string;
};

export const getMoinSecurityAssignee = (work: OperatingWork) => {
  const organization=getMoinWorkOrganization(work);
  if (organization.ownerDepartment !== '정보보안팀') return '해당 부서 담당자 지정 필요';
  if (work.staffing === '보안팀장·GRC Lead') return '이윤혁 (정보보안팀장)';
  if (work.staffing === 'Endpoint·IAM 엔지니어') return '김영제 (정보보안팀)';
  if (work.staffing === '전담 CISO') return 'CISO (성명 확인 필요)';
  if (['인증·개인정보 GRC','SecOps·Cloud·AppSec','AI·Threat Detection'].includes(work.staffing)) return '담당자 미지정 (충원 필요)';
  return '정보보안팀 담당자 지정 필요';
};

const includesAny = (value: string, keywords: string[]) => keywords.some(keyword => value.includes(keyword));

export function getMoinWorkOrganization(work: OperatingWork): MoinWorkOrganization {
  const sourceDepartments = work.department.split('·');
  const departments = new Set<string>();

  sourceDepartments.forEach(department => {
    if (includesAny(department, ['정보보호', '개인정보'])) departments.add('정보보안팀');
    else if (includesAny(department, ['IT', 'DevOps'])) departments.add('DevOps');
    else if (includesAny(department, ['개발', 'Product', 'Platform'])) departments.add('Platform팀');
    else if (department.includes('Data')) departments.add('Data팀');
    else if (department.includes('HR')) departments.add('HR');
    else if (department.includes('재무')) departments.add('재무팀');
    else if (department.includes('법무')) departments.add('법무팀');
    else if (includesAny(department, ['준법', 'Compliance'])) departments.add('Compliance');
    else if (department.includes('경영지원')) departments.add('경영지원팀');
    else if (includesAny(department, ['서비스소유', '서비스운영'])) departments.add('서비스운영팀');
    else if (department.includes('구매')) departments.add('경영지원팀(구매 기능)');
    else if (department.includes('감사')) departments.add('Compliance(교차검증 기능)');
    else if (includesAny(department, ['CEO', '대표이사'])) departments.add('CEO 직속');
    else if (department.includes('전 부서')) departments.add('전 부서');
  });

  if (departments.size === 0) departments.add('정보보안팀');
  const mapped = [...departments];
  const ownerText = `${work.owner} ${work.domain} ${work.activity}`;
  const preferredOwner = includesAny(ownerText, ['계정 신청', '계정 통제', '비밀번호·MFA', '접근권한 정기', '접근통제 점검', '원격·인터넷 접속', '로그원 정의·수집', '패치 SLA', '백업 수행', '키 생명주기', '클라우드·SaaS 설정'])
    ? 'DevOps'
    : includesAny(ownerText, ['소스코드', '오픈소스', '보안설계', '개발·시험·운영 분리', '배포 승인', '신규·변경 서비스'])
      ? 'Platform팀'
      : includesAny(ownerText, ['자산 식별', '자산 분류', '자산 도입·변경·이관·폐기'])
        ? 'DevOps'
        : includesAny(ownerText, ['HR 담당', '교육 실시', '교육 계획'])
    ? 'HR'
    : includesAny(ownerText, ['시설담당', '물리보안담당', '보호구역', 'CCTV', '환경통제'])
      ? '경영지원팀'
      : includesAny(ownerText, ['문서관리담당'])
        ? '경영지원팀'
        : includesAny(ownerText, ['법무'])
          ? '법무팀'
          : includesAny(ownerText, ['독립감사', '준법'])
            ? 'Compliance(교차검증 기능)'
            : includesAny(ownerText, ['IT 운영담당', 'DevOps', '자산관리담당', '복구시험'])
              ? 'DevOps'
              : includesAny(ownerText, ['개발책임자', '서비스소유자', 'Product', '개발·변경'])
                ? 'Platform팀'
                : includesAny(ownerText, ['고객지원', '민원'])
                  ? '서비스운영팀'
                  : '정보보안팀';
  const ownerDepartment = preferredOwner;
  if (!mapped.includes(ownerDepartment)) mapped.unshift(ownerDepartment);
  const cooperatingDepartments = mapped.filter(department => department !== ownerDepartment);

  const reviewerText = work.reviewer;
  const reviewerDepartment = includesAny(reviewerText, ['법무'])
    ? '법무팀'
    : includesAny(reviewerText, ['준법', '독립감사'])
      ? 'Compliance(교차검증)'
      : includesAny(reviewerText, ['CPO', '개인정보'])
        ? 'CPO·정보보안팀'
        : includesAny(reviewerText, ['IT 책임자', '개발책임자', '자산소유자', '서비스소유자', '부서장'])
          ? '해당 업무부서장·자산소유자'
          : '정보보안팀장';

  const approverText = work.approver;
  const approver = approverText.includes('CEO') || approverText.includes('이사회')
    ? '대표이사·이사회'
    : approverText.includes('CPO') && approverText.includes('CISO')
      ? 'CISO·CPO'
      : approverText.includes('CPO')
        ? 'CPO'
        : approverText.includes('CISO')
          ? 'CISO'
          : approverText.includes('IT 책임자') || approverText.includes('CIO')
            ? 'CIO·CTO'
            : approverText.includes('부서장') || approverText.includes('책임자') || approverText.includes('소유자')
              ? '해당 업무부서장'
              : approverText;

  return {
    ownerDepartment,
    cooperatingDepartments,
    reviewerDepartment,
    approver,
    source: 'MOIN_조직도.xlsx / 조직도 시트 / updated 2026-07-06',
  };
}
