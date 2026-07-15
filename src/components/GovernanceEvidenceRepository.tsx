import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileCheck2,
  Search,
  UserRoundCheck,
} from "lucide-react";
import type { Evidence, SecurityTask } from "../models/compliance";
import {
  operatingWorkMaster,
  operatingWorkSummary,
} from "../data/operatingWorkMaster";
import {
  getOperatingWorkState,
  operatingWorkStateLabel,
} from "../data/operatingWorkStatus";

interface Props {
  tasks: SecurityTask[];
  evidences: Evidence[];
  currentRole: string;
  onVerifyEvidence: (id: string) => void;
  onExcludeEvidence: (id: string, reason: string) => void;
  onOpenTask: (id: string) => void;
}
type Basis = "isms" | "regulation" | "internal" | "fss";
const basisMeta: Record<
  Basis,
  { short: string; label: string; description: string }
> = {
  isms: {
    short: "ISMS-P",
    label: "ISMS-P 인증 운영",
    description: "인증기준별 운영업무와 심사 증적",
  },
  regulation: {
    short: "전자금융",
    label: "전자금융감독규정 운영",
    description: "금융회사 법정 보안통제와 감독 대응",
  },
  internal: {
    short: "규정·지침",
    label: "내부 규정·지침 운영",
    description: "SP01·SP02 및 SG01~SG19 이행",
  },
  fss: {
    short: "금감원",
    label: "금감원 추가 점검 운영",
    description: "AI·IT위험·자산·취약점·사고대응 강화",
  },
};
const vacantRoles = new Set([
  "전담 CISO",
  "인증·개인정보 GRC",
  "SecOps·Cloud·AppSec",
  "AI·Threat Detection",
]);
const basisText = (basis: Basis, item: (typeof operatingWorkMaster)[number]) =>
  basis === "isms"
    ? item.isms.join(", ")
    : basis === "regulation"
      ? item.efr
      : basis === "internal"
        ? item.internal.join(", ")
        : item.fss.join(", ") || "공통 관리체계 적용";

export function GovernanceEvidenceRepository({
  tasks,
  evidences,
  currentRole,
  onVerifyEvidence,
  onExcludeEvidence,
  onOpenTask,
}: Props) {
  const [basis, setBasis] = useState<Basis>("isms");
  const [department, setDepartment] = useState("all");
  const [domain, setDomain] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>("GOV-01");
  const departments = useMemo(
    () => Array.from(new Set(operatingWorkMaster.map(x => x.department))),
    []
  );
  const domains = useMemo(
    () => Array.from(new Set(operatingWorkMaster.map(x => x.domain))),
    []
  );
  const filtered = useMemo(
    () =>
      operatingWorkMaster.filter(
        x =>
          (department === "all" || x.department === department) &&
          (domain === "all" || x.domain === domain) &&
          (!query.trim() ||
            `${x.id} ${x.activity} ${x.owner} ${x.efr} ${x.internal.join(" ")} ${x.fss.join(" ")}`
              .toLowerCase()
              .includes(query.toLowerCase()))
      ),
    [department, domain, query]
  );
  const submitted = tasks.filter(x => x.evidence_files.length > 0);
  const pending = submitted.filter(
    x =>
      x.status === "승인대기" &&
      x.approval_path.find(n => n.role === "검토자")?.status !== "approved"
  );
  const reviewed = submitted.filter(
    x => x.approval_path.find(n => n.role === "검토자")?.status === "approved"
  );
  const imported = evidences.filter(x => x.source_type === "기존 ISO 심사자료");
  const statusOf = (item: (typeof operatingWorkMaster)[number]) =>
    getOperatingWorkState(item, tasks, evidences);
  const gaps = operatingWorkMaster.filter(x => statusOf(x) === "gap").length;
  const vacancyGaps = operatingWorkMaster.filter(
    x => vacantRoles.has(x.staffing) && statusOf(x) !== "evidence"
  ).length;
  return (
    <div className="evidence-repository-page">
      <section className="evidence-repo-hero">
        <div>
          <span>VFS / OPERATING WORK MASTER</span>
          <h2>통합 운영업무·증적 보관소</h2>
          <p>
            ISMS-P, 전자금융감독규정, 내부 규정·지침, 금감원 강화 점검을 하나의
            운영업무로 연결했습니다. 실제 파일이 확인되지 않은 항목은 증적으로
            표시하지 않습니다.
          </p>
        </div>
        <div className="evidence-repo-count">
          <strong>{operatingWorkSummary.total}</strong>
          <span>전체 운영업무</span>
        </div>
      </section>
      <nav className="operation-basis-tabs" aria-label="운영 기준 구분">
        {(Object.keys(basisMeta) as Basis[]).map(key => (
          <button
            key={key}
            className={basis === key ? "active" : ""}
            onClick={() => setBasis(key)}
          >
            <span>{basisMeta[key].short}</span>
            <strong>{basisMeta[key].label}</strong>
            <small>{basisMeta[key].description}</small>
          </button>
        ))}
      </nav>
      <div className="evidence-repo-kpis">
        <div>
          <BookOpen />
          <span>ISMS-P 연결 통제</span>
          <strong>{operatingWorkSummary.ismsCovered}</strong>
        </div>
        <div>
          <FileCheck2 />
          <span>필수 산출물 유형</span>
          <strong>
            {operatingWorkMaster.reduce((n, x) => n + x.outputs.length, 0)}
          </strong>
        </div>
        <div>
          <AlertTriangle />
          <span>명시적 미수행</span>
          <strong>{gaps}</strong>
        </div>
        <div>
          <UserRoundCheck />
          <span>미충원 직무 영향</span>
          <strong>{vacancyGaps}</strong>
        </div>
      </div>
      <section className="reference-evidence-assessment">
        <div className="evidence-review-heading">
          <div>
            <span>2025 ISO 27001 VERIFIED SOURCE</span>
            <h3>실제 등록된 ISO 27001 증적</h3>
          </div>
          <p>원본 메타데이터와 검증 상태만 표시</p>
        </div>
        <div className="reference-assessment-list">
          {imported.length === 0 ? (
            <p className="evidence-review-empty">
              검증 가능한 ISO 원본 증적이 없습니다.
            </p>
          ) : (
            imported.map(e => (
              <article
                className={
                  e.verification_status === "증적제외" ? "excluded" : ""
                }
                key={e.evidence_id}
              >
                <span className="review-control-id">
                  ISMS-P
                  <br />
                  {e.req_id}
                </span>
                <div>
                  <strong>{e.file_name}</strong>
                  <div className="iso-ref-tags">
                    {e.iso_control_refs?.map(ref => (
                      <span key={ref}>{ref}</span>
                    ))}
                  </div>
                  <small>
                    {e.exclusion_reason
                      ? `제외 사유: ${e.exclusion_reason}`
                      : e.verification_note}
                  </small>
                  <code>SHA-256 {e.file_hash.slice(0, 20)}…</code>
                </div>
                <div className="verification-action">
                  <span
                    className={`verification-status ${e.verification_status === "검증완료" ? "approved" : e.verification_status === "증적제외" ? "excluded" : "pending"}`}
                  >
                    {e.verification_status}
                  </span>
                  {e.verification_status === "팀장확인필요" &&
                    currentRole === "보안팀장" && (
                      <>
                        <button onClick={() => onVerifyEvidence(e.evidence_id)}>
                          확인 완료
                        </button>
                        <button
                          className="exclude"
                          onClick={() => {
                            const reason =
                              prompt("증적 제외 사유를 입력하십시오.");
                            if (reason)
                              onExcludeEvidence(e.evidence_id, reason);
                          }}
                        >
                          증적 제외
                        </button>
                      </>
                    )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
      <section className="evidence-review-queue">
        <div className="evidence-review-heading">
          <div>
            <span>SECURITY LEAD REVIEW</span>
            <h3>업로드 증적 확인 현황</h3>
          </div>
          <p>등록된 실제 업무 증적만 집계</p>
        </div>
        <div className="evidence-review-stats">
          <div>
            <FileCheck2 />
            <span>업로드 업무</span>
            <strong>{submitted.length}</strong>
          </div>
          <div className="pending">
            <Clock3 />
            <span>팀장 확인 대기</span>
            <strong>{pending.length}</strong>
          </div>
          <div className="approved">
            <CheckCircle2 />
            <span>팀장 확인 완료</span>
            <strong>{reviewed.length}</strong>
          </div>
        </div>
        <div className="evidence-review-list">
          {submitted.length === 0 ? (
            <p className="evidence-review-empty">
              업로드된 운영 증적이 없습니다.
            </p>
          ) : (
            submitted.slice(0, 6).map(task => (
              <button
                key={task.task_id}
                onClick={() => onOpenTask(task.task_id)}
              >
                <span className="review-control-id">{task.req_id}</span>
                <span className="review-task-title">
                  <strong>{task.title}</strong>
                  <small>증적 {task.evidence_files.length}건</small>
                </span>
                <ChevronRight />
              </button>
            ))
          )}
        </div>
      </section>
      <div className="evidence-repo-filters">
        <span className="selected-operation-basis">
          {basisMeta[basis].label}
        </span>
        <select value={domain} onChange={e => setDomain(e.target.value)}>
          <option value="all">전체 통제영역</option>
          {domains.map(v => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <select
          value={department}
          onChange={e => setDepartment(e.target.value)}
        >
          <option value="all">전체 담당부서</option>
          {departments.map(v => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <label>
          <Search size={15} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="업무·담당·근거 검색"
          />
        </label>
        <span>{filtered.length}개 업무</span>
      </div>
      <div className="evidence-activity-list">
        {filtered.map(item => {
          const open = expanded === item.id;
          const state = statusOf(item);
          return (
            <article
              className={`evidence-activity-card ${open ? "open" : ""}`}
              key={item.id}
            >
              <button
                className="evidence-activity-summary"
                onClick={() => setExpanded(open ? null : item.id)}
              >
                {open ? <ChevronDown /> : <ChevronRight />}
                <span className="evidence-id">{item.id}</span>
                <div>
                  <strong>{item.activity}</strong>
                  <small>
                    {item.owner} 수행 · {item.reviewer} 검토 · {item.approver}{" "}
                    승인
                  </small>
                  <em className={`basis-inline ${basis}`}>
                    {basisMeta[basis].short} · {basisText(basis, item)}
                  </em>
                </div>
                <span className={`work-status ${state}`}>
                  {operatingWorkStateLabel[state]}
                </span>
                <span className="evidence-cycle">{item.cycle}</span>
              </button>
              {open && (
                <div className="evidence-activity-detail">
                  <div className="evidence-primary-basis">
                    <span>{basisMeta[basis].label} 적용 근거</span>
                    <strong>{basisText(basis, item)}</strong>
                  </div>
                  <div className="evidence-ownership">
                    <div>
                      <Building2 />
                      <span>담당 부서</span>
                      <strong>{item.department}</strong>
                    </div>
                    <div>
                      <UserRoundCheck />
                      <span>수행·검토</span>
                      <strong>
                        {item.owner} → {item.reviewer}
                      </strong>
                    </div>
                    <div>
                      <CheckCircle2 />
                      <span>승인 책임</span>
                      <strong>{item.approver}</strong>
                    </div>
                    <div>
                      <CalendarClock />
                      <span>필요 인력·보존</span>
                      <strong>
                        {item.staffing} · {item.retention}
                      </strong>
                    </div>
                  </div>
                  <div className="evidence-detail-grid">
                    <section>
                      <h4>운영 절차</h4>
                      <ol>
                        <li>대상·범위·기준 확정</li>
                        <li>업무 수행 및 결과 기록</li>
                        <li>{item.reviewer} 적정성 검토</li>
                        <li>{item.approver} 승인 및 미흡사항 추적</li>
                      </ol>
                    </section>
                    <section>
                      <h4>필수 증적자료</h4>
                      <ul className="evidence-files">
                        {item.outputs.map(v => (
                          <li key={v}>
                            <FileCheck2 />
                            {v}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section className="evidence-basis">
                      <h4>통합 통제 근거</h4>
                      <dl>
                        <dt>ISMS-P</dt>
                        <dd>{item.isms.join(", ")}</dd>
                        <dt>전자금융</dt>
                        <dd>{item.efr}</dd>
                        <dt>내부문서</dt>
                        <dd>{item.internal.join(", ")}</dd>
                        <dt>금감원</dt>
                        <dd>{item.fss.join(", ") || "공통 관리체계 적용"}</dd>
                      </dl>
                    </section>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
      <p className="evidence-repo-note">
        운영업무는 참조자료를 기준으로 통합한 관리 기준입니다. 실제 적용 조항과
        보존기간은 회사의 인허가·업무범위 및 최신 법령에 따라 준법·법무가 최종
        확정해야 합니다.
      </p>
    </div>
  );
}
