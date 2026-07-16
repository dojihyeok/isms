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

const explicitExecutionOwners: Record<string,string> = {
  'POL-01':'Compliance','POL-02':'정보보안팀','POL-03':'정보보안팀','POL-04':'경영지원팀','POL-05':'정보보안팀',
  'AST-01':'서비스운영팀','AST-02':'DevOps','AST-03':'해당 업무부서·자산소유자','AST-04':'DevOps',
  'OPS-01':'정보보안팀','OPS-02':'DevOps','OPS-03':'정보보안팀','OPS-04':'정보보안팀','OPS-05':'DevOps','OPS-06':'DevOps','OPS-07':'해당 업무부서','OPS-08':'DevOps','OPS-09':'DevOps','OPS-10':'DevOps',
  'VEN-01':'경영지원팀(구매 기능)','VEN-02':'경영지원팀(구매 기능)','VEN-03':'서비스운영팀','VEN-04':'DevOps','VEN-05':'서비스운영팀',
  'INC-01':'정보보안팀','INC-02':'정보보안팀','INC-03':'법무팀','INC-04':'정보보안팀','INC-05':'정보보안팀',
  'BCP-01':'서비스운영팀','BCP-02':'서비스운영팀','BCP-03':'DevOps',
  'PRI-01':'서비스운영팀','PRI-02':'서비스운영팀','PRI-03':'법무팀','PRI-04':'법무팀','PRI-05':'Data팀','PRI-06':'서비스운영팀','PRI-07':'서비스운영팀',
  'BAU-01':'재무팀','BAU-02':'DevOps','BAU-03':'Data팀','BAU-04':'서비스운영팀','BAU-05':'Data팀','BAU-06':'서비스운영팀','BAU-07':'전 부서','BAU-08':'서비스운영팀','BAU-09':'DevOps','BAU-10':'DevOps','BAU-11':'정보보안팀','BAU-12':'정보보안팀','BAU-13':'서비스운영팀','BAU-14':'Data팀','BAU-15':'서비스운영팀','BAU-16':'DevOps',
  'AUD-01':'정보보안팀','AUD-02':'Compliance(교차검증 기능)','AUD-03':'Compliance(교차검증 기능)','AUD-04':'해당 업무부서','AUD-05':'정보보안팀','AUD-06':'Compliance(교차검증 기능)',
};

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
    else if (includesAny(department, ['BCM', 'Operation', '고객지원', '금융사고대응', '외주관리'])) departments.add('서비스운영팀');
    else if (includesAny(department, ['데이터'])) departments.add('Data팀');
    else if (department.includes('구매')) departments.add('경영지원팀(구매 기능)');
    else if (department.includes('감사')) departments.add('Compliance(교차검증 기능)');
    else if (includesAny(department, ['CEO', '대표이사'])) departments.add('CEO 직속');
    else if (department.includes('전 부서')) departments.add('전 부서');
  });

  if (departments.size === 0) departments.add('정보보안팀');
  const mapped = [...departments];
  const ownerText = `${work.owner} ${work.domain} ${work.activity}`;
  const preferredOwner = explicitExecutionOwners[work.id]
    ?? (work.id.startsWith('HR-')?'HR':undefined)
    ?? (work.id.startsWith('IAM-')?'DevOps':undefined)
    ?? (work.id.startsWith('PHY-')?'경영지원팀':undefined)
    ?? (work.id.startsWith('DEV-')?'Platform팀':undefined)
    ?? (work.id.startsWith('AUD-')?'Compliance(교차검증 기능)':undefined)
    ?? (includesAny(ownerText,['독립감사','준법'])?'Compliance(교차검증 기능)':undefined)
    ?? (includesAny(ownerText,['시설담당','물리보안담당','문서관리담당'])?'경영지원팀':undefined)
    ?? (includesAny(ownerText,['법무'])?'법무팀':undefined)
    ?? (includesAny(ownerText,['IT 운영담당','DevOps','자산관리담당'])?'DevOps':undefined)
    ?? (includesAny(ownerText,['개발책임자','서비스소유자','Product','개발·변경'])?'Platform팀':undefined)
    ?? (includesAny(ownerText,['GRC','SecOps','보안팀','보안엔지니어','인증'])?'정보보안팀':undefined)
    ?? mapped.find(department=>!['정보보안팀','전 부서'].includes(department))
    ?? '정보보안팀';
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
