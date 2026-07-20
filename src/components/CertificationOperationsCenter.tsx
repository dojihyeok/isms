import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { CheckCircle2, Download, FileCheck2, FileSpreadsheet, Search, ShieldCheck, UploadCloud } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';
import type { UserRole } from './AppSidebar';
import {
  controlOutputMappings,
  governanceRequirements,
  uniqueControlOutputs,
  type ControlReviewRecord,
  type OutputEvidenceLink,
} from '../data/controlGovernance';

type CenterTab = 'review' | 'mapping' | 'gap' | 'evidence' | 'application' | 'excel' | 'approval';
type ApplicationProfile = {
  applicantName: string;
  businessNumber: string;
  serviceRevenue: string;
  averageUsers: string;
  dataSubjects: string;
  totalEmployees: string;
  scopedEmployees: string;
  scopeSummary: string;
  targetAuditDate: string;
};
type WorkbookQa = { checkedAt: string; fileName: string; errors: string[]; sheetRows: Record<string, number> };

const tabs: { id: CenterTab; label: string }[] = [
  { id: 'review', label: '1. 통제 검수' },
  { id: 'mapping', label: '2. 명시적 매핑' },
  { id: 'gap', label: '3. 인증 갭' },
  { id: 'evidence', label: '4. 증적 연결' },
  { id: 'application', label: '5. 인증 신청' },
  { id: 'excel', label: '6. Excel QA' },
  { id: 'approval', label: '7. 권한·결재' },
];

const emptyProfile: ApplicationProfile = {
  applicantName: '', businessNumber: '', serviceRevenue: '', averageUsers: '', dataSubjects: '',
  totalEmployees: '', scopedEmployees: '', scopeSummary: '', targetAuditDate: '',
};

const canEdit = (role: UserRole) => ['엔지니어', '개인정보담당자', '업무부서 담당자'].includes(role);
const canReview = (role: UserRole) => ['보안팀장', '부서장'].includes(role);
const actorName = (role: UserRole) => role;

export function CertificationOperationsCenter({ currentRole, reviews, setReviews }: {
  currentRole: UserRole;
  reviews: ControlReviewRecord[];
  setReviews: Dispatch<SetStateAction<ControlReviewRecord[]>>;
}) {
  const [tab, setTab] = useState<CenterTab>('review');
  const [query, setQuery] = useState('');
  const [selectedReqId, setSelectedReqId] = useState('1.1.1');
  const [evidenceLinks, setEvidenceLinks] = usePersistentState<OutputEvidenceLink[]>('isms_output_evidence_links_v1', []);
  const [profile, setProfile] = usePersistentState<ApplicationProfile>('isms_application_profile_v1', emptyProfile);
  const [workbookQa, setWorkbookQa] = usePersistentState<WorkbookQa | null>('isms_workbook_qa_v1', null);
  const [evidenceQuery, setEvidenceQuery] = useState('');

  const selectedRequirement = governanceRequirements.find(item => item.req_id === selectedReqId)!;
  const selectedMappings = controlOutputMappings.filter(item => item.reqId === selectedReqId);
  const selectedReview = reviews.find(item => item.reqId === selectedReqId)!;
  const canApproveSelected = selectedReqId.startsWith('3.') ? currentRole === 'CPO' : currentRole === 'CISO';
  const filteredRequirements = governanceRequirements.filter(item =>
    `${item.req_id} ${item.subject} ${item.detail}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredMappings = controlOutputMappings.filter(item =>
    `${item.reqId} ${item.workId} ${item.activity} ${item.output} ${item.responsible}`.toLowerCase().includes(evidenceQuery.toLowerCase()),
  );
  const evidenceByOutput = useMemo(() => new Map(evidenceLinks.map(link => [link.outputId, link])), [evidenceLinks]);
  const approvedControls = reviews.filter(item => item.status === '승인').length;
  const reviewRequested = reviews.filter(item => item.status === '검토요청').length;
  const verifiedOutputs = evidenceLinks.filter(item => item.verificationStatus === '검증완료').length;
  const missingOutputs = uniqueControlOutputs.length - verifiedOutputs;
  const profileRequired = Object.entries(profile).filter(([, value]) => !value.trim()).map(([key]) => key);
  const applicationReady = approvedControls === governanceRequirements.length && missingOutputs === 0 && profileRequired.length === 0 && workbookQa?.errors.length === 0;

  const updateReview = (reqId: string, changes: Partial<ControlReviewRecord>, action: string, note: string) => {
    const now = new Date().toISOString();
    setReviews(previous => previous.map(item => item.reqId === reqId ? {
      ...item, ...changes, updatedAt: now, updatedBy: actorName(currentRole),
      history: [...item.history, { at: now, actor: actorName(currentRole), action, note }],
    } : item));
  };

  const handleEvidenceFile = async (outputId: string, file?: File) => {
    if (!file) return;
    const hashBuffer = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    const hash = Array.from(new Uint8Array(hashBuffer)).map(value => value.toString(16).padStart(2, '0')).join('');
    const now = new Date().toISOString();
    const next: OutputEvidenceLink = {
      outputId, fileName: file.name, fileSize: file.size, fileHash: hash,
      referenceDate: now.slice(0, 10), targetPeriod: '2026', sourceUrl: '',
      uploadedAt: now, uploadedBy: actorName(currentRole), verificationStatus: '검토대기',
    };
    setEvidenceLinks(previous => [...previous.filter(item => item.outputId !== outputId), next]);
  };

  const patchEvidence = (outputId: string, changes: Partial<OutputEvidenceLink>) =>
    setEvidenceLinks(previous => previous.map(item => item.outputId === outputId ? { ...item, ...changes } : item));

  const qaWorkbook = async (file?: File) => {
    if (!file) return;
    const { Workbook } = await import('exceljs');
    const workbook = new Workbook();
    const errors: string[] = [];
    const sheetRows: Record<string, number> = {};
    const requiredSheets: Record<string, string[]> = {
      '부서별 인증준비': ['업무 ID', '인증 준비업무', '완료 조건'],
      '통제 설명': ['통제 ID', '통제별 조치내용', '필수 산출물', '완료 기준'],
      '통합 WBS 업무매핑': ['통제 ID', '통제별 조치내용', '세부 작업', '완료 조건', '필수 산출물', 'R 수행부서'],
      '금감원 점검 근거': ['업무 ID', '금감원 점검번호'],
      '연간수행현황': ['수행건ID', '업무ID', '상태'],
      '업데이트양식': ['수행건ID', '업무ID', '상태'],
    };
    try {
      await workbook.xlsx.load(await file.arrayBuffer() as never);
      Object.entries(requiredSheets).forEach(([name, headers]) => {
        const sheet = workbook.getWorksheet(name);
        if (!sheet) { errors.push(`${name}: 시트 없음`); return; }
        sheetRows[name] = Math.max(0, sheet.rowCount - 1);
        const actual = sheet.getRow(1).values as unknown[];
        const headerTexts = actual.map(value => String(value ?? '').trim());
        headers.forEach(header => { if (!headerTexts.includes(header)) errors.push(`${name}: ${header} 열 없음`); });
        if (sheet.views[0]?.state !== 'frozen') errors.push(`${name}: 첫 행 틀 고정 없음`);
        if (!sheet.autoFilter) errors.push(`${name}: 필터 없음`);
      });
      if ((sheetRows['통제 설명'] ?? 0) !== 101) errors.push(`통제 설명: 101행이 아님 (${sheetRows['통제 설명'] ?? 0}행)`);
    } catch {
      errors.push('정상적인 XLSX 파일이 아니거나 파일 구조를 읽을 수 없음');
    }
    setWorkbookQa({ checkedAt: new Date().toISOString(), fileName: file.name, errors, sheetRows });
  };

  const downloadSubmissionManifest = () => {
    const manifest = {
      generatedAt: new Date().toISOString(), profile, readiness: { applicationReady, approvedControls, verifiedOutputs, missingOutputs },
      controls: reviews, mappings: controlOutputMappings, outputs: uniqueControlOutputs, evidences: evidenceLinks, workbookQa,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'MOIN_ISMS-P_인증신청_제출매니페스트.json'; anchor.click();
    URL.revokeObjectURL(url);
  };

  return <div className="cert-center">
    <section className="cert-hero">
      <div><span>ISMS-P CERTIFICATION CONTROL</span><h2>인증 운영센터</h2><p>통제 검수부터 신청자료 제출 전 QA까지 하나의 승인 데이터로 관리합니다.</p></div>
      <div className={`cert-readiness ${applicationReady ? 'ready' : ''}`}><ShieldCheck/><span>인증 신청 준비도</span><strong>{applicationReady ? '신청 가능' : '보완 필요'}</strong></div>
    </section>
    <div className="cert-kpis">
      <div><span>승인 통제</span><strong>{approvedControls}/101</strong></div>
      <div><span>검토 요청</span><strong>{reviewRequested}</strong></div>
      <div><span>검증 산출물</span><strong>{verifiedOutputs}/{uniqueControlOutputs.length}</strong></div>
      <div className={missingOutputs ? 'danger' : 'success'}><span>미검증 산출물</span><strong>{missingOutputs}</strong></div>
    </div>
    <nav className="cert-tabs">{tabs.map(item => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>)}</nav>

    {tab === 'review' && <div className="cert-split">
      <aside className="cert-control-list"><div className="cert-search"><Search size={15}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="통제번호·통제명 검색"/></div>{filteredRequirements.map(item => {
        const review = reviews.find(record => record.reqId === item.req_id)!;
        return <button key={item.req_id} className={selectedReqId === item.req_id ? 'active' : ''} onClick={() => setSelectedReqId(item.req_id)}><b>{item.req_id}</b><span>{item.subject}</span><em className={`status-${review.status}`}>{review.status}</em></button>;
      })}</aside>
      <section className="cert-review-detail">
        <header><div><span>{selectedRequirement.req_id}</span><h3>{selectedRequirement.subject}</h3></div><em className={`status-${selectedReview.status}`}>{selectedReview.status}</em></header>
        <label><span>통제 요구내용</span><p>{selectedRequirement.detail}</p></label>
        <label><span>주요 점검 항목</span><ol>{selectedRequirement.check_items.map(item => <li key={item}>{item}</li>)}</ol></label>
        <label><span>승인 대상 조치내용</span><textarea rows={7} value={selectedReview.actionText} disabled={!canEdit(currentRole) || selectedReview.status === '승인'} onChange={event => updateReview(selectedReqId, { actionText: event.target.value, status: '초안' }, '조치내용 수정', '통제 조치내용 편집')}/></label>
        <div className="cert-output-preview"><span>명시적 업무·산출물 매핑</span>{selectedMappings.map(mapping => <article key={mapping.mappingId}><b>{mapping.workId} · {mapping.activity}</b><p>세부 작업: {mapping.task}</p><p>필수 산출물: {mapping.output} · R {mapping.responsible}</p><small>완료조건: {mapping.completionCriteria}</small></article>)}</div>
        <div className="cert-actions">
          {canEdit(currentRole) && selectedReview.status !== '승인' && <button onClick={() => updateReview(selectedReqId, { status: '검토요청', reviewer: undefined }, '검토 요청', '조치내용·산출물·완료조건 검토 요청')}>검토 요청</button>}
          {canReview(currentRole) && selectedReview.status === '검토요청' && <button onClick={() => updateReview(selectedReqId, { reviewer: actorName(currentRole) }, '검토 완료', '통제 요구와 조치내용 일치 확인')}>검토 완료</button>}
          {canApproveSelected && selectedReview.status === '검토요청' && selectedReview.reviewer && <button className="primary" onClick={() => updateReview(selectedReqId, { status: '승인', approver: actorName(currentRole) }, '최종 승인', '통제 조치내용 최종 확정')}>최종 승인</button>}
        </div>
        <details><summary>변경이력 {selectedReview.history.length}건</summary>{[...selectedReview.history].reverse().map((item, index) => <p key={`${item.at}-${index}`}>{item.at} · {item.actor} · {item.action} · {item.note}</p>)}</details>
      </section>
    </div>}

    {tab === 'mapping' && <section className="cert-panel"><div className="cert-panel-head"><div><h3>통제–업무–산출물 명시적 매핑</h3><p>규칙 계산 결과가 아닌 고유 매핑 ID로 101개 통제와 산출물을 관리합니다.</p></div><strong>{controlOutputMappings.length}건</strong></div><div className="cert-search wide"><Search size={15}/><input value={evidenceQuery} onChange={event => setEvidenceQuery(event.target.value)} placeholder="통제·업무·산출물·수행부서 검색"/></div><div className="cert-table-wrap"><table><thead><tr><th>통제</th><th>업무</th><th>세부 작업</th><th>필수 산출물</th><th>R</th><th>A</th></tr></thead><tbody>{filteredMappings.map(item => <tr key={item.mappingId}><td>{item.reqId}</td><td><b>{item.workId}</b><br/>{item.activity}</td><td>{item.task}</td><td>{item.output}</td><td>{item.responsible}</td><td>{item.accountable}</td></tr>)}</tbody></table></div></section>}

    {tab === 'gap' && <section className="cert-panel"><div className="cert-panel-head"><div><h3>인증 준비 갭</h3><p>통제 승인과 필수 산출물 검증을 분리해 미완료 원인을 표시합니다.</p></div></div><div className="gap-grid">{governanceRequirements.map(req => {
      const review = reviews.find(item => item.reqId === req.req_id)!;
      const mappings = controlOutputMappings.filter(item => item.reqId === req.req_id);
      const verified = mappings.filter(item => evidenceByOutput.get(item.outputId)?.verificationStatus === '검증완료').length;
      const ready = review.status === '승인' && verified === mappings.length;
      return <button key={req.req_id} className={ready ? 'ready' : ''} onClick={() => { setSelectedReqId(req.req_id); setTab('review'); }}><b>{req.req_id} {req.subject}</b><span>조치 승인 {review.status} · 산출물 {verified}/{mappings.length}</span><em>{ready ? '충족' : review.status !== '승인' ? '조치 미승인' : '증적 미검증'}</em></button>;
    })}</div></section>}

    {tab === 'evidence' && <section className="cert-panel"><div className="cert-panel-head"><div><h3>필수 산출물별 실제 증적</h3><p>파일 해시·기준일·대상기간·원본 URL과 검증 상태를 고유 산출물 ID에 연결합니다.</p></div></div><div className="cert-search wide"><Search size={15}/><input value={evidenceQuery} onChange={event => setEvidenceQuery(event.target.value)} placeholder="통제·업무·산출물 검색"/></div><div className="evidence-link-list">{[...new Map(filteredMappings.map(mapping=>[mapping.outputId,mapping])).values()].slice(0,250).map(mapping => {
      const link = evidenceByOutput.get(mapping.outputId);
      const linkedControlIds=controlOutputMappings.filter(item=>item.outputId===mapping.outputId).map(item=>item.reqId);
      return <article key={mapping.outputId}><header><div><b>{mapping.workId}</b><span>{mapping.output}</span></div><em className={link?.verificationStatus === '검증완료' ? 'verified' : ''}>{link?.verificationStatus ?? '미등록'}</em></header><p>{mapping.completionCriteria}</p><div className="evidence-meta"><span>연결 통제 {linkedControlIds.join(', ')}</span><span>R {mapping.responsible}</span>{link && <><span>{link.fileName}</span><span>SHA-256 {link.fileHash.slice(0, 12)}…</span><input type="date" value={link.referenceDate} onChange={event => patchEvidence(mapping.outputId, { referenceDate: event.target.value })}/><input value={link.targetPeriod} onChange={event => patchEvidence(mapping.outputId, { targetPeriod: event.target.value })} placeholder="대상기간"/><input value={link.sourceUrl} onChange={event => patchEvidence(mapping.outputId, { sourceUrl: event.target.value })} placeholder="원본 시스템 URL"/></>}</div><div className="cert-actions"><label className="file-button"><UploadCloud size={14}/>파일 연결<input type="file" hidden disabled={!canEdit(currentRole)} onChange={event => handleEvidenceFile(mapping.outputId, event.target.files?.[0])}/></label>{link && canReview(currentRole) && <button onClick={() => patchEvidence(mapping.outputId, { verificationStatus: '검증완료', verifiedBy: actorName(currentRole), verifiedAt: new Date().toISOString() })}>검증 완료</button>}</div></article>;
    })}</div></section>}

    {tab === 'application' && <section className="cert-panel"><div className="cert-panel-head"><div><h3>인증 신청 정보 취합</h3><p>부서별 원천자료와 신청서 기재값을 한 번에 대조합니다.</p></div><button onClick={downloadSubmissionManifest}><Download size={14}/>제출 매니페스트</button></div><div className="application-form">{([
      ['applicantName','신청 법인명'],['businessNumber','사업자등록번호'],['serviceRevenue','정보통신서비스 부문 전년도 매출액'],['averageUsers','최근 3개월 일평균 이용자 수'],['dataSubjects','개인정보 보유 정보주체 수'],['totalEmployees','전체 임직원 수'],['scopedEmployees','인증범위 내 인원 수'],['scopeSummary','인증범위 요약'],['targetAuditDate','희망 심사일정'],
    ] as [keyof ApplicationProfile,string][]).map(([key,label]) => <label key={key}><span>{label}</span><input value={profile[key]} disabled={!canEdit(currentRole)} onChange={event => setProfile(previous => ({ ...previous, [key]: event.target.value }))}/><em>{profile[key].trim() ? '입력' : '미입력'}</em></label>)}</div><div className={`application-gate ${applicationReady ? 'ready' : ''}`}><FileCheck2/><div><b>{applicationReady ? '인증 신청 패키지 생성 가능' : '신청 전 보완 필요'}</b><p>통제 승인 {approvedControls}/101 · 증적 검증 {verifiedOutputs}/{uniqueControlOutputs.length} · 신청정보 미입력 {profileRequired.length} · Excel QA {workbookQa ? `${workbookQa.errors.length}건 오류` : '미수행'}</p></div></div></section>}

    {tab === 'excel' && <section className="cert-panel"><div className="cert-panel-head"><div><h3>Excel 왕복 QA</h3><p>다운로드 파일의 6개 시트·필수 열·틀 고정·필터·통제 행 수를 검사합니다.</p></div><label className="file-button"><FileSpreadsheet size={14}/>XLSX 검사<input type="file" accept=".xlsx" hidden onChange={event => qaWorkbook(event.target.files?.[0])}/></label></div>{workbookQa ? <div className={`qa-result ${workbookQa.errors.length ? 'failed' : 'passed'}`}><header><b>{workbookQa.fileName}</b><span>{workbookQa.errors.length ? `오류 ${workbookQa.errors.length}건` : '검사 통과'}</span></header><div>{Object.entries(workbookQa.sheetRows).map(([name,count]) => <p key={name}><CheckCircle2 size={14}/>{name} · {count}행</p>)}</div>{workbookQa.errors.map(error => <p className="error" key={error}>{error}</p>)}</div> : <div className="empty-cert-state"><FileSpreadsheet/><p>포털에서 내려받은 통합 WBS Excel을 선택하세요.</p></div>}</section>}

    {tab === 'approval' && <section className="cert-panel"><div className="cert-panel-head"><div><h3>업무별 권한·결재 통제</h3><p>실무 수행·독립 검토·최종 승인을 분리하고 개인정보 통제는 CPO, 정보보호 통제는 CISO가 승인합니다.</p></div></div><div className="approval-rules"><article><b>실무 작성</b><p>엔지니어·개인정보담당자·업무부서 담당자</p><span>조치내용 편집, 산출물 등록</span></article><article><b>독립 검토</b><p>보안팀장 또는 업무부서장</p><span>완료조건·원본증적 검증</span></article><article><b>최종 승인</b><p>CISO 또는 CPO</p><span>정보보호는 CISO, 개인정보는 CPO</span></article><article><b>읽기 전용</b><p>외부 심사원</p><span>승인된 통제와 검증 증적만 조회</span></article></div><div className="cert-table-wrap"><table><thead><tr><th>통제</th><th>업무</th><th>R 수행</th><th>검토</th><th>A 최종책임</th></tr></thead><tbody>{controlOutputMappings.slice(0,200).map(mapping => <tr key={mapping.mappingId}><td>{mapping.reqId}</td><td>{mapping.workId} {mapping.activity}</td><td>{mapping.responsible}</td><td>{mapping.reviewer}</td><td>{mapping.accountable}</td></tr>)}</tbody></table></div></section>}
  </div>;
}
