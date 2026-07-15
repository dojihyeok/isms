import { AlertTriangle, CheckCircle2, Clock3, FileWarning, Users } from 'lucide-react';
import type { Evidence, SecurityTask } from '../models/compliance';
import { operatingWorkMaster } from '../data/operatingWorkMaster';
import { getOperatingWorkState, operatingWorkStateLabel } from '../data/operatingWorkStatus';

const rolePlan:Record<string,{current:number;target:number;mission:string}>={
  '전담 CISO':{current:.25,target:1,mission:'독립 보고·예산·위험수용·최종 책임'},
  '보안팀장·GRC Lead':{current:1,target:1,mission:'관리체계 총괄·규제 대응·증적 검토'},
  '인증·개인정보 GRC':{current:0,target:1,mission:'인증·개인정보·교육·외부자 운영'},
  'SecOps·Cloud·AppSec':{current:0,target:1,mission:'관제·클라우드·취약점·개발보안·사고대응'},
  'Endpoint·IAM 엔지니어':{current:1,target:1,mission:'단말·계정·접근통제 운영'},
  'AI·Threat Detection':{current:0,target:1,mission:'AI 위협·위협정보·탐지 자동화'},
  '독립감사':{current:0,target:1,mission:'운영부서와 독립된 통제 검증·감사'},
};

export function SecurityWorkforceCoverage({tasks,evidences}:{tasks:SecurityTask[];evidences:Evidence[]}){
  const statusOf=(work:typeof operatingWorkMaster[number])=>getOperatingWorkState(work,tasks,evidences);
  const roles=Object.entries(rolePlan).map(([role,plan])=>({role,...plan,works:operatingWorkMaster.filter(x=>x.staffing===role)}));
  const all=roles.flatMap(role=>role.works.map(work=>({role,work,status:statusOf(work)}))); const vacancyRisk=all.filter(x=>x.role.current===0&&x.status!=='evidence').length;
  return <section className="org-section-card workforce-coverage"><div className="org-section-heading"><div><span>03 · WORKLOAD EVIDENCE</span><h3>필요 인력별 실제 운영업무·증적·공백</h3></div><span className="org-headcount">{all.length}개 운영업무 · 목표 {roles.reduce((n,x)=>n+x.target,0)} FTE</span></div>
    <div className="workforce-kpis"><div><Users/><span>전체 운영업무</span><strong>{all.length}</strong></div><div><CheckCircle2/><span>검증 증적 연결</span><strong>{all.filter(x=>x.status==='evidence').length}</strong></div><div><Clock3/><span>진행·기준정의</span><strong>{all.filter(x=>x.status==='active'||x.status==='defined').length}</strong></div><div className="risk"><FileWarning/><span>미충원 직무 위험</span><strong>{vacancyRisk}</strong></div></div>
    <div className="workforce-role-list">{roles.map(role=>{const vacancy=Math.max(role.target-role.current,0);const items=role.works.map(work=>({work,status:statusOf(work)}));return <article key={role.role} className={vacancy>0?'vacant':''}><header><div><strong>{role.role}</strong><small>{role.mission}</small></div><span>{role.current} / {role.target} FTE</span></header><div className="workforce-role-summary"><b>담당업무 {items.length}개</b><span>증적 {items.filter(x=>x.status==='evidence').length}</span><span>진행 {items.filter(x=>x.status==='active').length}</span><span>기준정의 {items.filter(x=>x.status==='defined').length}</span><span className="gap">미수행 {items.filter(x=>x.status==='gap').length}</span></div><ul>{items.map(({work,status})=><li key={work.id}><span className={`work-status ${status}`}>{operatingWorkStateLabel[status]}</span><div><strong>{work.activity}</strong><small>{work.id} · ISMS-P {work.isms.join(', ')} · {work.cycle} · 산출물 {work.outputs.length}종</small></div></li>)}</ul>{vacancy>0&&<footer><AlertTriangle/>부족 {vacancy} FTE · 현재 운영·문서화 업무 중 전담 인력 없이 수행되는 항목 {items.filter(x=>x.status!=='evidence').length}개</footer>}</article>})}</div>
    <p className="org-caution">기준정의는 규정·지침상 수행 절차가 확인되지만 결과 증적 검증은 남은 상태입니다. 증적 미등록을 미수행으로 단정하지 않으며, 명시적으로 미수행이 확인된 항목만 미수행으로 표시합니다.</p>
  </section>;
}
