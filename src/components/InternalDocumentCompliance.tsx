import { BookOpenCheck } from 'lucide-react';
import { operatingWorkMaster } from '../data/operatingWorkMaster';
import type { Evidence, SecurityTask } from '../models/compliance';

interface InternalDocumentComplianceProps {
  tasks: SecurityTask[];
  evidences: Evidence[];
}

const documents = [
  { code: 'SP01', name: '정보보호 규정' },
  { code: 'SP02', name: '개인정보보호 규정' },
  ...Array.from({ length: 19 }, (_, index) => ({
    code: `SG${String(index + 1).padStart(2, '0')}`,
    name: `정보보호 지침 ${index + 1}`,
  })),
];

const isMappedDocument = (internal: string[], code: string) =>
  internal.includes(code) || (internal.includes('SG01~SG19') && code.startsWith('SG'));

export function InternalDocumentCompliance({ tasks, evidences }: InternalDocumentComplianceProps) {
  const actualTaskReqIds = new Set(
    tasks
      .filter(task => task.evidence_files.length > 0 || task.checklists.some(item => item.checked) || task.status === '승인대기')
      .map(task => task.req_id),
  );
  const verifiedReqIds = new Set(
    evidences
      .filter(evidence =>
        evidence.verification_status === '검증완료' &&
        (evidence.source_type === '업로드' || evidence.created_at.includes('2026')),
      )
      .map(evidence => evidence.req_id),
  );

  const rows = documents.map(document => {
    const works = operatingWorkMaster.filter(work => isMappedDocument(work.internal, document.code));
    const mappedReqIds = new Set(works.flatMap(work => work.isms));
    const verified = [...mappedReqIds].filter(reqId => verifiedReqIds.has(reqId)).length;
    const executing = [...mappedReqIds].filter(reqId => actualTaskReqIds.has(reqId) && !verifiedReqIds.has(reqId)).length;
    const status = mappedReqIds.size > 0 && verified === mappedReqIds.size
      ? '현행화 완료'
      : verified > 0 || executing > 0
        ? '진행중'
        : '현행화 필요';
    return { ...document, works: works.length, controls: mappedReqIds.size, verified, executing, status };
  });

  return (
    <section className="section-card internal-compliance-card">
      <div className="section-header">
        <div>
          <h3><BookOpenCheck size={18} /> 규정·지침 이행 현황</h3>
          <p>내부문서별 운영업무 매핑과 2026년 실제 수행·검증완료 증적을 구분합니다.</p>
        </div>
      </div>
      <div className="internal-compliance-legend">
        <span><b>업무</b> 연간 운영업무 마스터 연결 수</span>
        <span><b>통제</b> 중복 제거 ISMS-P 통제 수</span>
        <span><b>완료</b> 2026년 검증완료 증적이 있는 통제 수</span>
      </div>
      <div className="table-container internal-compliance-table-wrap">
        <table className="compliance-table internal-compliance-table">
          <thead><tr><th>내부문서</th><th>매핑 업무</th><th>매핑 통제</th><th>수행 중</th><th>검증 완료</th><th>2026 상태</th></tr></thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.code}>
                <td><strong>{row.code}</strong><small>{row.name}</small></td>
                <td>{row.works}개</td><td>{row.controls}개</td><td>{row.executing}개</td><td>{row.verified}개</td>
                <td><span className={`document-status ${row.status === '현행화 완료' ? 'done' : row.status === '진행중' ? 'doing' : 'needed'}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="internal-compliance-note">세부 근거는 ‘2026년 정보보호 운영업무 전체 목록’의 각 업무를 펼쳐 ‘업무 근거 매핑’에서 확인합니다.</p>
    </section>
  );
}
