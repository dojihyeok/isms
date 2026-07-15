export type TaskStatus = '완료' | '승인대기' | '진행중' | '미흡';
export type ApprovalStatus = 'approved' | 'pending' | 'active';

export interface Requirement {
  req_id: string;
  category: string;
  subject: string;
  detail_desc: string;
  compliance_cycle: string;
  policy_id: string;
  policy_name: string;
}

export interface Policy {
  policy_id: string;
  policy_name: string;
  article_no: string;
  content: string;
  last_revised_at: string;
}

export interface SecurityTask {
  task_id: string;
  req_id: string;
  title: string;
  due_date: string;
  status: TaskStatus;
  assignee_id: string;
  assignee_name: string;
  owner_department?: string;
  cooperating_departments?: string[];
  organization_mapping_source?: string;
  completed_at?: string;
  description?: string;
  checklists: { text: string; checked: boolean }[];
  evidence_files: { file_name: string; file_size: string; file_hash: string; path: string }[];
  approval_path: { name: string; role: string; status: ApprovalStatus }[];
}

export interface Evidence {
  evidence_id: string;
  task_id: string;
  req_id: string;
  file_name: string;
  file_path: string;
  file_hash: string;
  created_at: string;
  created_by: string;
  retention_years: number;
  source_type?: '업로드' | '기존 ISO 심사자료';
  verification_status?: '검증완료' | '팀장확인필요' | '증적제외';
  verification_note?: string;
  iso_control_refs?: string[];
  verified_by?: string;
  verified_at?: string;
  exclusion_reason?: string;
}

export interface TaskComment {
  comment_id: number;
  task_id: string;
  writer_name: string;
  writer_role: string;
  content: string;
  created_at: string;
}

export interface AuditorQA {
  qa_id: number;
  req_id: string;
  question: string;
  asked_by: string;
  asked_at: string;
  answer?: string;
  answered_by?: string;
  answered_at?: string;
  status: 'pending' | 'replied';
}

export interface AuditLog {
  log_id: number;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  status: string;
}
