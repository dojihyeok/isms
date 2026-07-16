import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FileSpreadsheet,
  FolderGit,
  History,
  Send,
  UploadCloud,
  CheckCircle2,
  FileText,
  X,
  ChevronRight,
  ChevronDown,
  Clock,
  ArrowRight,
  Plus,
  Search,
  FileCode,
  HelpCircle,
  FileCheck,
  GitCompare,
  Award,
  TrendingUp,
  Layers,
  CheckSquare,
  AlertCircle,
  Lock,
} from "lucide-react";
import {
  isoControls,
  ismsGapItems,
  soaSummary,
  type ISOControl,
} from "./isoData";
import {
  AppSidebar,
  type Framework,
  type UserRole,
} from "./components/AppSidebar";
import { AppHeader } from "./components/AppHeader";
import {
  DomainStatusCharts,
  type DomainChartStat,
} from "./components/DomainStatusCharts";
import { DashboardView } from "./components/DashboardView";
import {
  MatrixFilters,
  MatrixToolbar,
  type MatrixViewMode,
} from "./components/MatrixControls";
import type {
  AuditLog,
  AuditorQA,
  Evidence,
  Policy,
  Requirement,
  SecurityTask,
  TaskComment,
} from "./models/compliance";
import { usePersistentState } from "./hooks/usePersistentState";
import { SecurityOrganizationPage } from "./components/SecurityOrganizationPage";
import { GovernanceEvidenceRepository } from "./components/GovernanceEvidenceRepository";
import { getOperatingWorkBasis, operatingWorkMaster, operatingWorkSummary } from "./data/operatingWorkMaster";
import { getMoinSecurityAssignee, getMoinWorkOrganization } from "./data/moinOrganizationMapping";
import { getOperatingWorkWbs, operatingWorkWbsSummary } from "./data/operatingWorkWbs";

// ==========================================
// 2. Initial control and workflow data
// ==========================================

const initialRequirements: Requirement[] = [
  {
    req_id: "1.1.1",
    category: "1. 관리체계 수립 및 운영",
    subject: "경영진의 참여",
    detail_desc:
      "최고경영자는 정보보호 및 개인정보보호 관리체계의 수립과 운영활동 전반에 경영진의 참여가 이루어질 수 있도록 보고 및 의사결정 체계를 수립하여 운영하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-101",
    policy_name: "정보보호 지침 1영역 제1절",
  },
  {
    req_id: "1.1.2",
    category: "1. 관리체계 수립 및 운영",
    subject: "최고책임자의 지정",
    detail_desc:
      "최고경영자는 정보보호 업무를 총괄하는 정보보호 최고책임자와 개인정보보호 업무를 총괄하는 개인정보보호 책임자를 예산∙인력 등 자원을 할당할 수 있는 임원급으로 지정하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-101",
    policy_name: "정보보호 지침 1영역 제1절",
  },
  {
    req_id: "1.1.3",
    category: "1. 관리체계 수립 및 운영",
    subject: "조직 구성",
    detail_desc:
      "최고경영자는 정보보호와 개인정보보호의 효과적 구현을 위한 실무조직, 조직 전반의 정보보호와 개인정보보호 관련 주요 사항을 검토 및 의결할 수 있는 위원회, 전사적 보호활동을 위한 부서별 정보보호와 개인정보보호 담당자로 구성된 협의체를 구성하여 운영하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-101",
    policy_name: "정보보호 지침 1영역 제1절",
  },
  {
    req_id: "1.1.4",
    category: "1. 관리체계 수립 및 운영",
    subject: "범위 설정",
    detail_desc:
      "조직의 핵심 서비스와 개인정보 처리 현황 등을 고려하여 관리체계 범위를 설정하고, 관련된 서비스를 비롯하여 개인정보 처리 업무와 조직, 자산, 물리적 위치 등을 문서화하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-101",
    policy_name: "정보보호 지침 1영역 제1절",
  },
  {
    req_id: "1.1.5",
    category: "1. 관리체계 수립 및 운영",
    subject: "정책 수립",
    detail_desc:
      "정보보호와 개인정보보호 정책 및 시행문서를 수립∙작성하며, 이때 조직의 정보보호와 개인정보보호 방침 및 방향을 명확하게 제시하여야 한다. 또한 정책과 시행문서는 경영진 승인을 받고, 임직원 및 관련자에게 이해하기 쉬운 형태로 전달하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-101",
    policy_name: "정보보호 지침 1영역 제1절",
  },
  {
    req_id: "1.1.6",
    category: "1. 관리체계 수립 및 운영",
    subject: "자원 할당",
    detail_desc:
      "최고경영자는 정보보호와 개인정보보호 분야별 전문성을 갖춘 인력을 확보하고, 관리체계의 효과적 구현과 지속적 운영을 위한 예산 및 자원을 할당하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-101",
    policy_name: "정보보호 지침 1영역 제1절",
  },
  {
    req_id: "1.2.1",
    category: "1. 관리체계 수립 및 운영",
    subject: "정보자산 식별",
    detail_desc:
      "조직의 업무특성에 따라 정보자산 분류기준을 수립하여 관리체계 범위 내 모든 정보자산을 식별∙분류하고, 중요도를 산정한 후 그 목록을 최신으로 관리하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-102",
    policy_name: "정보보호 지침 1영역 제2절",
  },
  {
    req_id: "1.2.2",
    category: "1. 관리체계 수립 및 운영",
    subject: "현황 및 흐름분석",
    detail_desc:
      "관리체계 전 영역에 대한 정보서비스 및 개인정보 처리 현황을 분석하고 업무 절차와 흐름을 파악하여 문서화하며, 이를 주기적으로 검토하여 최신성을 유지하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-102",
    policy_name: "정보보호 지침 1영역 제2절",
  },
  {
    req_id: "1.2.3",
    category: "1. 관리체계 수립 및 운영",
    subject: "위험 평가",
    detail_desc:
      "조직의 대내외 환경분석을 통해 유형별 위협정보를 수집하고 조직에 적합한 위험 평가 방법을 선정하여 관리체계 전 영역에 대하여 연 1회 이상 위험을 평가하며, 수용할 수 있는 위험은 경영진의 승인을 받아 관리하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-102",
    policy_name: "정보보호 지침 1영역 제2절",
  },
  {
    req_id: "1.2.4",
    category: "1. 관리체계 수립 및 운영",
    subject: "보호대책 선정",
    detail_desc:
      "위험 평가 결과에 따라 식별된 위험을 처리하기 위하여 조직에 적합한 보호대책을 선정하고, 보호대책의 우선순위와 일정∙담당자∙예산 등을 포함한 이행계획을 수립하여 경영진의 승인을 받아야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-102",
    policy_name: "정보보호 지침 1영역 제2절",
  },
  {
    req_id: "1.3.1",
    category: "1. 관리체계 수립 및 운영",
    subject: "보호대책 구현",
    detail_desc:
      "선정한 보호대책은 이행계획에 따라 효과적으로 구현하고, 경영진은 이행결과의 정확성과 효과성 여부를 확인하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-103",
    policy_name: "정보보호 지침 1영역 제3절",
  },
  {
    req_id: "1.3.2",
    category: "1. 관리체계 수립 및 운영",
    subject: "보호대책 공유",
    detail_desc:
      "보호대책의 실제 운영 또는 시행할 부서 및 담당자를 파악하여 관련 내용을 공유하고 교육하여 지속적으로 운영되도록 하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-103",
    policy_name: "정보보호 지침 1영역 제3절",
  },
  {
    req_id: "1.3.3",
    category: "1. 관리체계 수립 및 운영",
    subject: "운영현황 관리",
    detail_desc:
      "조직이 수립한 관리체계에 따라 상시적 또는 주기적으로 수행하여야 하는 운영활동 및 수행 내역은 식별 및 추적이 가능하도록 기록하여 관리하고, 경영진은 주기적으로 운영활동의 효과성을 확인하여 관리하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-103",
    policy_name: "정보보호 지침 1영역 제3절",
  },
  {
    req_id: "1.4.1",
    category: "1. 관리체계 수립 및 운영",
    subject: "법적 요구사항 준수 검토",
    detail_desc:
      "조직이 준수하여야 할 정보보호 및 개인정보보호 관련 법적 요구사항을 주기적으로 파악하여 규정에 반영하고, 준수 여부를 지속적으로 검토하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-104",
    policy_name: "정보보호 지침 1영역 제4절",
  },
  {
    req_id: "1.4.2",
    category: "1. 관리체계 수립 및 운영",
    subject: "관리체계 점검",
    detail_desc:
      "관리체계가 내부 정책 및 법적 요구사항에 따라 효과적으로 운영되고 있는지 독립성과 전문성이 확보된 인력을 구성하여 연 1회 이상 점검하고, 발견된 문제점을 경영진에게 보고하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-104",
    policy_name: "정보보호 지침 1영역 제4절",
  },
  {
    req_id: "1.4.3",
    category: "1. 관리체계 수립 및 운영",
    subject: "관리체계 개선",
    detail_desc:
      "법적 요구사항 준수검토 및 관리체계 점검을 통해 식별된 관리체계상의 문제점에 대한 원인을 분석하고 재발방지 대책을 수립∙이행하여야 하며, 경영진은 개선 결과의 정확성과 효과성 여부를 확인하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-104",
    policy_name: "정보보호 지침 1영역 제4절",
  },
  {
    req_id: "2.1.1",
    category: "2. 보호대책 요구사항",
    subject: "정책의 유지관리",
    detail_desc:
      "정보보호 및 개인정보보호 관련 정책과 시행문서는 법령 및 규제, 상위 조직 및 관련 기관 정책과의 연계성, 조직의 대내외 환경변화 등에 따라 주기적으로 검토하여 필요한 경우 제∙개정하고 그 내역을 이력관리하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-201",
    policy_name: "정보보호 지침 2영역 제1절",
  },
  {
    req_id: "2.1.2",
    category: "2. 보호대책 요구사항",
    subject: "조직의 유지관리",
    detail_desc:
      "조직의 각 구성원에게 정보보호와 개인정보보호 관련 역할 및 책임을 할당하고, 그 활동을 평가할 수 있는 체계와 조직 및 조직의 구성원 간 상호 의사소통할 수 있는 체계를 수립하여 운영하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-201",
    policy_name: "정보보호 지침 2영역 제1절",
  },
  {
    req_id: "2.1.3",
    category: "2. 보호대책 요구사항",
    subject: "정보자산 관리",
    detail_desc:
      "정보자산의 용도와 중요도에 따른 취급 절차 및 보호대책을 수립∙이행하고, 자산별 책임소재를 명확히 정의하여 관리하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-201",
    policy_name: "정보보호 지침 2영역 제1절",
  },
  {
    req_id: "2.2.1",
    category: "2. 보호대책 요구사항",
    subject: "주요 직무자 지정 및 관리",
    detail_desc:
      "개인정보 및 중요정보의 취급이나 주요 시스템 접근 등 주요 직무의 기준과 관리방안을 수립하고, 주요 직무자를 최소한으로 지정하여 그 목록을 최신으로 관리하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-202",
    policy_name: "정보보호 지침 2영역 제2절",
  },
  {
    req_id: "2.2.2",
    category: "2. 보호대책 요구사항",
    subject: "직무 분리",
    detail_desc:
      "권한 오∙남용 등으로 인한 잠재적인 피해 예방을 위하여 직무 분리 기준을 수립하고 적용하여야 한다. 다만 불가피하게 직무 분리가 어려운 경우 별도의 보완대책을 마련하여 이행하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-202",
    policy_name: "정보보호 지침 2영역 제2절",
  },
  {
    req_id: "2.2.3",
    category: "2. 보호대책 요구사항",
    subject: "보안 서약",
    detail_desc:
      "정보자산을 취급하거나 접근권한이 부여된 임직원∙임시직원∙외부자 등이 내부 정책 및 관련 법규, 비밀유지 의무 등 준수사항을 명확히 인지할 수 있도록 업무 특성에 따른 정보보호 서약을 받아야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-202",
    policy_name: "정보보호 지침 2영역 제2절",
  },
  {
    req_id: "2.2.4",
    category: "2. 보호대책 요구사항",
    subject: "인식제고 및 교육훈련",
    detail_desc:
      "임직원 및 관련 외부자가 조직의 관리체계와 정책을 이해하고 직무별 전문성을 확보할 수 있도록 연간 인식제고 활동 및 교육훈련 계획을 수립∙운영하고, 그 결과에 따른 효과성을 평가하여 다음 계획에 반영하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-202",
    policy_name: "정보보호 지침 2영역 제2절",
  },
  {
    req_id: "2.2.5",
    category: "2. 보호대책 요구사항",
    subject: "퇴직 및 직무변경 관리",
    detail_desc:
      "퇴직 및 직무변경 시 인사∙정보보호∙개인정보보호∙IT 등 관련 부서별 이행하여야 할 자산반납, 계정 및 접근권한 회수∙조정, 결과확인 등의 절차를 수립∙관리하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-202",
    policy_name: "정보보호 지침 2영역 제2절",
  },
  {
    req_id: "2.2.6",
    category: "2. 보호대책 요구사항",
    subject: "보안 위반 시 조치",
    detail_desc:
      "임직원 및 관련 외부자가 법령, 규제 및 내부정책을 위반한 경우 이에 따른 조치 절차를 수립∙이행하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-202",
    policy_name: "정보보호 지침 2영역 제2절",
  },
  {
    req_id: "2.3.1",
    category: "2. 보호대책 요구사항",
    subject: "외부자 현황 관리",
    detail_desc:
      "업무의 일부(개인정보취급, 정보보호, 정보시스템 운영 또는 개발 등)를 외부에 위탁하거나 외부의 시설 또는 서비스(집적정보통신시설, 클라우드 서비스, 애플리케이션 서비스 등)를 이용하는 경우 그 현황을 식별하고 법적 요구사항 및 외부 조직∙서비스로부터 발생되는 위험을 파악하여 적절한 보호대책을 마련하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-203",
    policy_name: "정보보호 지침 2영역 제3절",
  },
  {
    req_id: "2.3.2",
    category: "2. 보호대책 요구사항",
    subject: "외부자 계약 시 보안",
    detail_desc:
      "외부 서비스를 이용하거나 외부자에게 업무를 위탁하는 경우 이에 따른 정보보호 및 개인정보보호 요구사항을 식별하고, 관련 내용을 계약서 또는 협정서 등에 명시하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-203",
    policy_name: "정보보호 지침 2영역 제3절",
  },
  {
    req_id: "2.3.3",
    category: "2. 보호대책 요구사항",
    subject: "외부자 보안 이행 관리",
    detail_desc:
      "계약서, 협정서, 내부정책에 명시된 정보보호 및 개인정보보호 요구사항에 따라 외부자의 보호대책 이행 여부를 주기적인 점검 또는 감사 등 관리∙감독하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-203",
    policy_name: "정보보호 지침 2영역 제3절",
  },
  {
    req_id: "2.3.4",
    category: "2. 보호대책 요구사항",
    subject: "외부자 계약 변경 및 만료 시 보안",
    detail_desc:
      "외부자 계약만료, 업무종료, 담당자 변경 시에는 제공한 정보자산 반납, 정보시스템 접근계정 삭제, 중요정보 파기, 업무 수행 중 취득정보의 비밀유지 확약서 징구 등의 보호대책을 이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-203",
    policy_name: "정보보호 지침 2영역 제3절",
  },
  {
    req_id: "2.4.1",
    category: "2. 보호대책 요구사항",
    subject: "보호구역 지정",
    detail_desc:
      "물리적∙환경적 위협으로부터 개인정보 및 중요정보, 문서, 저장매체, 주요 설비 및 시스템 등을 보호하기 위하여 통제구역∙제한구역∙접견구역 등 물리적 보호구역을 지정하고 각 구역별 보호대책을 수립∙이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-204",
    policy_name: "정보보호 지침 2영역 제4절",
  },
  {
    req_id: "2.4.2",
    category: "2. 보호대책 요구사항",
    subject: "출입통제",
    detail_desc:
      "보호구역은 인가된 사람만이 출입하도록 통제하고 책임추적성을 확보할 수 있도록 출입 및 접근 이력을 주기적으로 검토하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-204",
    policy_name: "정보보호 지침 2영역 제4절",
  },
  {
    req_id: "2.4.3",
    category: "2. 보호대책 요구사항",
    subject: "정보시스템 보호",
    detail_desc:
      "정보시스템은 환경적 위협과 유해요소, 비인가 접근 가능성을 감소시킬 수 있도록 중요도와 특성을 고려하여 배치하고, 통신 및 전력 케이블이 손상을 입지 않도록 보호하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-204",
    policy_name: "정보보호 지침 2영역 제4절",
  },
  {
    req_id: "2.4.4",
    category: "2. 보호대책 요구사항",
    subject: "보호설비 운영",
    detail_desc:
      "보호구역에 위치한 정보시스템의 중요도 및 특성에 따라 온도∙습도 조절, 화재감지, 소화설비, 누수감지, UPS, 비상발전기, 이중전원선 등의 보호설비를 갖추고 운영절차를 수립∙운영하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-204",
    policy_name: "정보보호 지침 2영역 제4절",
  },
  {
    req_id: "2.4.5",
    category: "2. 보호대책 요구사항",
    subject: "보호구역 내 작업",
    detail_desc:
      "보호구역 내에서의 비인가행위 및 권한 오∙남용 등을 방지하기 위한 작업 절차를 수립∙이행하고, 작업 기록을 주기적으로 검토하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-204",
    policy_name: "정보보호 지침 2영역 제4절",
  },
  {
    req_id: "2.4.6",
    category: "2. 보호대책 요구사항",
    subject: "반출입 기기 통제",
    detail_desc:
      "보호구역 내 정보시스템, 모바일 기기, 저장매체 등에 대한 반출입 통제절차를 수립∙이행하고 주기적으로 검토하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-204",
    policy_name: "정보보호 지침 2영역 제4절",
  },
  {
    req_id: "2.4.7",
    category: "2. 보호대책 요구사항",
    subject: "업무환경 보안",
    detail_desc:
      "공용으로 사용하는 사무용 기기(문서고, 공용 PC, 복합기, 파일서버 등) 및 개인 업무환경(업무용 PC, 책상 등)을 통해 개인정보 및 중요정보가 비인가자에게 노출 또는 유출되지 않도록 클린데스크, 정기점검 등 업무환경 보호대책을 수립∙이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-204",
    policy_name: "정보보호 지침 2영역 제4절",
  },
  {
    req_id: "2.5.1",
    category: "2. 보호대책 요구사항",
    subject: "사용자 계정 관리",
    detail_desc:
      "정보시스템과 개인정보 및 중요정보에 대한 비인가 접근을 통제하고 업무 목적에 따른 접근권한을 최소한으로 부여할 수 있도록 사용자 등록∙해지 및 접근권한 부여∙변경∙말소 절차를 수립∙이행하고, 사용자 등록 및 권한부여 시 사용자에게 보안책임이 있음을 규정화하고 인식시켜야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-205",
    policy_name: "정보보호 지침 2영역 제5절",
  },
  {
    req_id: "2.5.2",
    category: "2. 보호대책 요구사항",
    subject: "사용자 식별",
    detail_desc:
      "사용자 계정은 사용자별로 유일하게 구분할 수 있도록 식별자를 할당하고 추측 가능한 식별자 사용을 제한하여야 하며, 동일한 식별자를 공유하여 사용하는 경우 그 사유와 타당성을 검토하여 책임자의 승인 및 책임추적성 확보 등 보완대책을 수립∙이행하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-205",
    policy_name: "정보보호 지침 2영역 제5절",
  },
  {
    req_id: "2.5.3",
    category: "2. 보호대책 요구사항",
    subject: "사용자 인증",
    detail_desc:
      "정보시스템과 개인정보 및 중요정보에 대한 사용자의 접근은 안전한 인증절차와 필요에 따라 강화된 인증방식을 적용하여야 한다. 또한 로그인 횟수 제한, 불법 로그인 시도 경고 등 비인가자 접근 통제방안을 수립∙이행하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-205",
    policy_name: "정보보호 지침 2영역 제5절",
  },
  {
    req_id: "2.5.4",
    category: "2. 보호대책 요구사항",
    subject: "비밀번호 관리",
    detail_desc:
      "법적 요구사항, 외부 위협요인 등을 고려하여 정보시스템 사용자 및  고객, 회원 등 정보주체(이용자)가 사용하는 비밀번호 관리절차를 수립∙이행하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-205",
    policy_name: "정보보호 지침 2영역 제5절",
  },
  {
    req_id: "2.5.5",
    category: "2. 보호대책 요구사항",
    subject: "특수 계정 및 권한 관리",
    detail_desc:
      "정보시스템 관리, 개인정보 및 중요정보 관리 등 특수 목적을 위하여 사용하는 계정 및 권한은 최소한으로 부여하고 별도로 식별하여 통제하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-205",
    policy_name: "정보보호 지침 2영역 제5절",
  },
  {
    req_id: "2.5.6",
    category: "2. 보호대책 요구사항",
    subject: "접근권한 검토",
    detail_desc:
      "정보시스템과 개인정보 및 중요정보에 접근하는 사용자 계정의 등록∙이용∙삭제 및 접근권한의 부여∙변경∙삭제 이력을 남기고 주기적으로 검토하여 적정성 여부를 점검하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-205",
    policy_name: "정보보호 지침 2영역 제5절",
  },
  {
    req_id: "2.6.1",
    category: "2. 보호대책 요구사항",
    subject: "네트워크 접근",
    detail_desc:
      "네트워크에 대한 비인가 접근을 통제하기 위하여 IP관리, 단말인증 등 관리절차를 수립∙이행하고, 업무목적 및 중요도에 따라 네트워크 분리(DMZ, 서버팜, DB존, 개발존 등)와 접근통제를 적용하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-206",
    policy_name: "정보보호 지침 2영역 제6절",
  },
  {
    req_id: "2.6.2",
    category: "2. 보호대책 요구사항",
    subject: "정보시스템 접근",
    detail_desc:
      "서버, 네트워크시스템 등 정보시스템에 접근을 허용하는 사용자, 접근제한 방식, 안전한 접근수단 등을 정의하여 통제하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-206",
    policy_name: "정보보호 지침 2영역 제6절",
  },
  {
    req_id: "2.6.3",
    category: "2. 보호대책 요구사항",
    subject: "응용프로그램 접근",
    detail_desc:
      "사용자별 업무 및 접근 정보의 중요도 등에 따라 응용프로그램 접근권한을 제한하고, 불필요한 정보 또는 중요정보 노출을 최소화할 수 있도록 기준을 수립하여 적용하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-206",
    policy_name: "정보보호 지침 2영역 제6절",
  },
  {
    req_id: "2.6.4",
    category: "2. 보호대책 요구사항",
    subject: "데이터베이스 접근",
    detail_desc:
      "테이블 목록 등 데이터베이스 내에서 저장∙관리되고 있는 정보를 식별하고, 정보의 중요도와 응용프로그램 및 사용자 유형 등에 따른 접근통제 정책을 수립∙이행하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-206",
    policy_name: "정보보호 지침 2영역 제6절",
  },
  {
    req_id: "2.6.5",
    category: "2. 보호대책 요구사항",
    subject: "무선 네트워크 접근",
    detail_desc:
      "무선 네트워크를 사용하는 경우 사용자 인증, 송수신 데이터 암호화, AP 통제 등 무선 네트워크 보호대책을 적용하여야 한다. 또한 AD Hoc 접속, 비인가 AP 사용 등 비인가 무선 네트워크 접속으로부터 보호대책을 수립∙이행하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-206",
    policy_name: "정보보호 지침 2영역 제6절",
  },
  {
    req_id: "2.6.6",
    category: "2. 보호대책 요구사항",
    subject: "원격접근 통제",
    detail_desc:
      "보호구역 이외 장소에서의 정보시스템 관리 및 개인정보 처리는 원칙적으로 금지하고, 재택근무∙장애대응∙원격협업 등 불가피한 사유로 원격접근을 허용하는 경우 책임자 승인, 접근 단말 지정, 접근 허용범위 및 기간 설정, 강화된 인증, 구간 암호화, 접속단말 보안(백신, 패치 등) 등 보호대책을 수립∙이행하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-206",
    policy_name: "정보보호 지침 2영역 제6절",
  },
  {
    req_id: "2.6.7",
    category: "2. 보호대책 요구사항",
    subject: "인터넷 접속 통제",
    detail_desc:
      "인터넷을 통한 정보 유출, 악성코드 감염, 내부망 침투 등을 예방하기 위하여 주요 정보시스템, 주요 직무 수행 및 개인정보 취급 단말기 등에 대한 인터넷 접속 또는 서비스(P2P, 웹하드, 메신저 등)를 제한하는 등 인터넷 접속 통제 정책을 수립∙이행하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-206",
    policy_name: "정보보호 지침 2영역 제6절",
  },
  {
    req_id: "2.7.1",
    category: "2. 보호대책 요구사항",
    subject: "암호정책 적용",
    detail_desc:
      "개인정보 및 주요정보 보호를 위하여 법적 요구사항을 반영한 암호화 대상, 암호 강도, 암호 사용 정책을 수립하고 개인정보 및 주요정보의 저장∙전송∙전달 시 암호화를 적용하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-207",
    policy_name: "정보보호 지침 2영역 제7절",
  },
  {
    req_id: "2.7.2",
    category: "2. 보호대책 요구사항",
    subject: "암호키 관리",
    detail_desc:
      "암호키의 안전한 생성∙이용∙보관∙배포∙파기를 위한 관리 절차를 수립∙이행하고, 필요 시 복구방안을 마련하여야 한다.",
    compliance_cycle: "분기 1회",
    policy_id: "POL-207",
    policy_name: "정보보호 지침 2영역 제7절",
  },
  {
    req_id: "2.8.1",
    category: "2. 보호대책 요구사항",
    subject: "보안 요구사항 정의",
    detail_desc:
      "정보시스템의 도입∙개발∙변경 시 정보보호 및 개인정보보호 관련 법적 요구사항, 최신 보안취약점, 안전한 코딩방법 등 보안 요구사항을 정의하고 적용하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-208",
    policy_name: "정보보호 지침 2영역 제8절",
  },
  {
    req_id: "2.8.2",
    category: "2. 보호대책 요구사항",
    subject: "보안 요구사항 검토 및 시험",
    detail_desc:
      "사전 정의된 보안 요구사항에 따라 정보시스템이 도입 또는 구현되었는지를 검토하기 위하여 법적 요구사항 준수, 최신 보안취약점 점검, 안전한 코딩 구현, 개인정보 영향평가 등의 검토 기준과 절차를 수립∙이행하고, 발견된 문제점에 대한 개선조치를 수행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-208",
    policy_name: "정보보호 지침 2영역 제8절",
  },
  {
    req_id: "2.8.3",
    category: "2. 보호대책 요구사항",
    subject: "시험과 운영 환경 분리",
    detail_desc:
      "개발 및 시험 시스템은 운영시스템에 대한 비인가 접근 및 변경의 위험을 감소시키기 위하여 원칙적으로 분리하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-208",
    policy_name: "정보보호 지침 2영역 제8절",
  },
  {
    req_id: "2.8.4",
    category: "2. 보호대책 요구사항",
    subject: "시험 데이터 보안",
    detail_desc:
      "시스템 시험 과정에서 운영데이터의 유출을 예방하기 위하여 시험 데이터의 생성과 이용 및 관리, 파기, 기술적 보호조치에 관한 절차를 수립∙이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-208",
    policy_name: "정보보호 지침 2영역 제8절",
  },
  {
    req_id: "2.8.5",
    category: "2. 보호대책 요구사항",
    subject: "소스 프로그램 관리",
    detail_desc:
      "소스 프로그램은 인가된 사용자만이 접근할 수 있도록 관리하고, 운영환경에 보관하지 않는 것을 원칙으로 하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-208",
    policy_name: "정보보호 지침 2영역 제8절",
  },
  {
    req_id: "2.8.6",
    category: "2. 보호대책 요구사항",
    subject: "운영환경 이관",
    detail_desc:
      "신규 도입∙개발 또는 변경된 시스템을 운영환경으로 이관할 때는 통제된 절차를 따라야 하고, 실행코드는 시험 및 사용자 인수 절차에 따라 실행되어야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-208",
    policy_name: "정보보호 지침 2영역 제8절",
  },
  {
    req_id: "2.9.1",
    category: "2. 보호대책 요구사항",
    subject: "변경관리",
    detail_desc:
      "정보시스템 관련 자산의 모든 변경내역을 관리할 수 있도록 절차를 수립∙이행하고, 변경 전 시스템의 성능 및 보안에 미치는 영향을 분석하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-209",
    policy_name: "정보보호 지침 2영역 제9절",
  },
  {
    req_id: "2.9.2",
    category: "2. 보호대책 요구사항",
    subject: "성능 및 장애관리",
    detail_desc:
      "정보시스템의 가용성 보장을 위하여 성능 및 용량 요구사항을 정의하고 현황을 지속적으로 모니터링하여야 하며, 장애 발생 시 효과적으로 대응하기 위한 탐지∙기록∙분석∙복구∙보고 등의 절차를 수립∙관리하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-209",
    policy_name: "정보보호 지침 2영역 제9절",
  },
  {
    req_id: "2.9.3",
    category: "2. 보호대책 요구사항",
    subject: "백업 및 복구관리",
    detail_desc:
      "정보시스템의 가용성과 데이터 무결성을 유지하기 위하여 백업 대상, 주기, 방법, 보관장소, 보관기간, 소산 등의 절차를 수립∙이행하여야 한다. 아울러 사고 발생 시 적시에 복구할 수 있도록 관리하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-209",
    policy_name: "정보보호 지침 2영역 제9절",
  },
  {
    req_id: "2.9.4",
    category: "2. 보호대책 요구사항",
    subject: "로그 및 접속기록 관리",
    detail_desc:
      "서버, 응용프로그램, 보안시스템, 네트워크시스템 등 정보시스템에 대한 사용자 접속기록, 시스템로그, 권한부여 내역 등의 로그유형, 보존기간, 보존방법 등을 정하고 위∙변조, 도난, 분실 되지 않도록 안전하게 보존∙관리하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-209",
    policy_name: "정보보호 지침 2영역 제9절",
  },
  {
    req_id: "2.9.5",
    category: "2. 보호대책 요구사항",
    subject: "로그 및 접속기록 점검",
    detail_desc:
      "정보시스템의 정상적인 사용을 보장하고 사용자 오∙남용(비인가접속, 과다조회 등)을 방지하기 위하여 접근 및 사용에 대한 로그 검토기준을 수립하여 주기적으로 점검하며, 문제 발생 시 사후조치를 적시에 수행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-209",
    policy_name: "정보보호 지침 2영역 제9절",
  },
  {
    req_id: "2.9.6",
    category: "2. 보호대책 요구사항",
    subject: "시간 동기화",
    detail_desc:
      "로그 및 접속기록의 정확성을 보장하고 신뢰성 있는 로그분석을 위하여 관련 정보시스템의 시각을 표준시각으로 동기화하고 주기적으로 관리하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-209",
    policy_name: "정보보호 지침 2영역 제9절",
  },
  {
    req_id: "2.9.7",
    category: "2. 보호대책 요구사항",
    subject: "정보자산의 재사용 및 폐기",
    detail_desc:
      "정보자산의 재사용과 폐기 과정에서 개인정보 및 중요정보가 복구∙재생되지 않도록 안전한 재사용 및 폐기 절차를 수립∙이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-209",
    policy_name: "정보보호 지침 2영역 제9절",
  },
  {
    req_id: "2.10.1",
    category: "2. 보호대책 요구사항",
    subject: "보안시스템 운영",
    detail_desc:
      "보안시스템 유형별로 관리자 지정, 최신 정책 업데이트, 룰셋 변경, 이벤트 모니터링 등의 운영절차를 수립∙이행하고 보안시스템별 정책적용 현황을 관리하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-210",
    policy_name: "정보보호 지침 2영역 제10절",
  },
  {
    req_id: "2.10.2",
    category: "2. 보호대책 요구사항",
    subject: "클라우드 보안",
    detail_desc:
      "클라우드 서비스 이용 시 서비스 유형(SaaS, PaaS, IaaS 등)에 따른 비인가 접근, 설정 오류 등에 따라 중요정보와 개인정보가 유∙노출되지 않도록 관리자 접근 및 보안 설정 등에 대한 보호대책을 수립∙이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-210",
    policy_name: "정보보호 지침 2영역 제10절",
  },
  {
    req_id: "2.10.3",
    category: "2. 보호대책 요구사항",
    subject: "공개서버 보안",
    detail_desc:
      "외부 네트워크에 공개되는 서버의 경우 내부 네트워크와 분리하고 취약점 점검, 접근통제, 인증, 정보 수집∙저장∙공개 절차 등 강화된 보호대책을 수립∙이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-210",
    policy_name: "정보보호 지침 2영역 제10절",
  },
  {
    req_id: "2.10.4",
    category: "2. 보호대책 요구사항",
    subject: "전자거래 및 핀테크 보안",
    detail_desc:
      "전자거래 및 핀테크 서비스 제공 시 정보유출이나 데이터 조작∙사기 등의 침해사고 예방을 위해 인증∙암호화 등의 보호대책을 수립하고, 결제시스템 등 외부 시스템과 연계할 경우 안전성을 점검하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-210",
    policy_name: "정보보호 지침 2영역 제10절",
  },
  {
    req_id: "2.10.5",
    category: "2. 보호대책 요구사항",
    subject: "정보전송 보안",
    detail_desc:
      "타 조직에 개인정보 및 중요정보를 전송할 경우 안전한 전송 정책을 수립하고 조직 간 합의를 통해 관리 책임, 전송방법, 개인정보 및 중요정보 보호를 위한 기술적 보호조치 등을 협약하고 이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-210",
    policy_name: "정보보호 지침 2영역 제10절",
  },
  {
    req_id: "2.10.6",
    category: "2. 보호대책 요구사항",
    subject: "업무용 단말기기 보안",
    detail_desc:
      "PC, 모바일 기기 등 단말기기를 업무 목적으로 네트워크에 연결할 경우 기기 인증 및 승인, 접근 범위, 기기 보안설정 등의 접근통제 대책을 수립하고 주기적으로 점검하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-210",
    policy_name: "정보보호 지침 2영역 제10절",
  },
  {
    req_id: "2.10.7",
    category: "2. 보호대책 요구사항",
    subject: "보조저장매체 관리",
    detail_desc:
      "보조저장매체를 통하여 개인정보 또는 중요정보의 유출이 발생하거나 악성코드가 감염되지 않도록 관리 절차를 수립∙이행하고, 개인정보 또는 중요정보가 포함된 보조저장매체는 안전한 장소에 보관하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-210",
    policy_name: "정보보호 지침 2영역 제10절",
  },
  {
    req_id: "2.10.8",
    category: "2. 보호대책 요구사항",
    subject: "패치관리",
    detail_desc:
      "소프트웨어, 운영체제, 보안시스템 등의 취약점으로 인한 침해사고를 예방하기 위하여 최신 패치를 적용하여야 한다. 다만 서비스 영향을 검토하여 최신 패치 적용이 어려울 경우 별도의 보완대책을 마련하여 이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-210",
    policy_name: "정보보호 지침 2영역 제10절",
  },
  {
    req_id: "2.10.9",
    category: "2. 보호대책 요구사항",
    subject: "악성코드 통제",
    detail_desc:
      "바이러스∙웜∙트로이목마∙랜섬웨어 등의 악성코드로부터 개인정보 및 중요정보, 정보시스템 및 업무용 단말기 등을 보호하기 위하여 악성코드 예방∙탐지∙대응 등의 보호대책을 수립∙이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-210",
    policy_name: "정보보호 지침 2영역 제10절",
  },
  {
    req_id: "2.11.1",
    category: "2. 보호대책 요구사항",
    subject: "사고 예방 및 대응체계 구축",
    detail_desc:
      "침해사고 및 개인정보 유출 등을 예방하고 사고 발생 시 신속하고 효과적으로 대응할 수 있도록 내∙외부 침해시도의 탐지∙대응∙분석 및 공유를 위한 체계와 절차를 수립하고, 관련 외부기관 및 전문가들과 협조체계를 구축하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-211",
    policy_name: "정보보호 지침 2영역 제11절",
  },
  {
    req_id: "2.11.2",
    category: "2. 보호대책 요구사항",
    subject: "취약점 점검 및 조치",
    detail_desc:
      "정보시스템의 취약점이 노출되어 있는지를 확인하기 위하여 정기적으로 취약점 점검을 수행하고 발견된 취약점에 대해서는 신속하게 조치하여야 한다. 또한 최신 보안취약점의 발생 여부를 지속적으로 파악하고 정보시스템에 미치는 영향을 분석하여 조치하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-211",
    policy_name: "정보보호 지침 2영역 제11절",
  },
  {
    req_id: "2.11.3",
    category: "2. 보호대책 요구사항",
    subject: "이상행위 분석 및 모니터링",
    detail_desc:
      "내∙외부에 의한 침해시도, 개인정보유출 시도, 부정행위 등을 신속하게 탐지∙대응할 수 있도록 네트워크 및 데이터 흐름 등을 수집하여 분석하며, 모니터링 및 점검 결과에 따른 사후조치는 적시에 이루어져야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-211",
    policy_name: "정보보호 지침 2영역 제11절",
  },
  {
    req_id: "2.11.4",
    category: "2. 보호대책 요구사항",
    subject: "사고 대응 훈련 및 개선",
    detail_desc:
      "침해사고 및 개인정보 유출사고 대응 절차를 임직원과 이해관계자가 숙지하도록 시나리오에 따른 모의훈련을 연 1회 이상 실시하고 훈련결과를 반영하여 대응체계를 개선하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-211",
    policy_name: "정보보호 지침 2영역 제11절",
  },
  {
    req_id: "2.11.5",
    category: "2. 보호대책 요구사항",
    subject: "사고 대응 및 복구",
    detail_desc:
      "침해사고 및 개인정보 유출 징후나 발생을 인지한 때에는 법적 통지 및 신고 의무를 준수하여야 하며, 절차에 따라 신속하게 대응 및 복구하고 사고분석 후 재발방지 대책을 수립하여 대응체계에 반영하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-211",
    policy_name: "정보보호 지침 2영역 제11절",
  },
  {
    req_id: "2.12.1",
    category: "2. 보호대책 요구사항",
    subject: "재해∙재난 대비 안전조치",
    detail_desc:
      "자연재해, 통신∙전력 장애, 해킹 등 조직의 핵심 서비스 및 시스템의 운영 연속성을 위협할 수 있는 재해 유형을 식별하고 유형별 예상 피해규모 및 영향을 분석하여야 한다. 또한 복구 목표시간, 복구 목표시점을 정의하고 복구 전략 및 대책, 비상시 복구 조직, 비상연락체계, 복구 절차 등 재해 복구체계를 구축하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-212",
    policy_name: "정보보호 지침 2영역 제12절",
  },
  {
    req_id: "2.12.2",
    category: "2. 보호대책 요구사항",
    subject: "재해 복구 시험 및 개선",
    detail_desc:
      "재해 복구 전략 및 대책의 적정성을 정기적으로 시험하여 시험결과, 정보시스템 환경변화, 법규 등에 따른 변화를 반영하여 복구전략 및 대책을 보완하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-212",
    policy_name: "정보보호 지침 2영역 제12절",
  },
  {
    req_id: "3.1.1",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "개인정보 수집∙이용",
    detail_desc:
      "개인정보는 적법하고 정당하게 수집∙이용하여야 하며, 정보주체의 동의를 근거로 수집하는 경우에는 적법한 방법으로 정보주체의 동의를 받아야 한다. 또한 만 14세 미만 아동의 개인정보를 수집하는 경우에는 그 법정대리인의 동의를 받아야 하며 법정대리인이 동의하였는지를 확인하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-301",
    policy_name: "정보보호 지침 3영역 제1절",
  },
  {
    req_id: "3.1.2",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "개인정보 수집 제한",
    detail_desc:
      "개인정보를 수집하는 경우 처리 목적에 필요한 최소한의 개인정보만을 수집하여야 하며, 정보주체가 선택적으로 동의할 수 있는 사항 등에 동의하지 아니한다는 이유로 정보주체에게 재화 또는 서비스의 제공을 거부하지 않아야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-301",
    policy_name: "정보보호 지침 3영역 제1절",
  },
  {
    req_id: "3.1.3",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "주민등록번호 처리 제한",
    detail_desc:
      "주민등록번호는 법적 근거가 있는 경우를 제외하고는 수집∙이용 등 처리할 수 없으며, 주민등록번호의 처리가 허용된 경우라 하더라도 인터넷 홈페이지 등에서 대체수단을 제공하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-301",
    policy_name: "정보보호 지침 3영역 제1절",
  },
  {
    req_id: "3.1.4",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "민감정보 및 고유식별정보의 처리 제한",
    detail_desc:
      "민감정보와 고유식별정보(주민등록번호 제외)를 처리하기 위해서는 법령에서 구체적으로 처리를 요구하거나 허용하는 경우를 제외하고는 정보주체의 별도 동의를 받아야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-301",
    policy_name: "정보보호 지침 3영역 제1절",
  },
  {
    req_id: "3.1.5",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "개인정보 간접수집",
    detail_desc:
      "정보주체 이외로부터 개인정보를 수집하거나 제3자로부터 제공받는 경우에는 업무에 필요한 최소한의 개인정보를 수집하거나 제공받아야 하며, 법령에 근거하거나 정보주체의 요구가 있으면 개인정보의 수집 출처, 처리목적, 처리정지의 요구권리를 알려야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-301",
    policy_name: "정보보호 지침 3영역 제1절",
  },
  {
    req_id: "3.1.6",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "영상정보처리기기 설치∙운영",
    detail_desc:
      "고정형 영상정보처리기기를 공개된 장소에 설치∙운영하거나 이동형 영상정보처리기기를 공개된 장소에서 업무를 목적으로 운영하는 경우 설치 목적 및 위치에 따라 법적 요구사항을 준수하고, 적절한 보호대책을 수립∙이행하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-301",
    policy_name: "정보보호 지침 3영역 제1절",
  },
  {
    req_id: "3.1.7",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "마케팅 목적의 개인정보 수집∙이용",
    detail_desc:
      "재화나 서비스의 홍보, 판매 권유, 광고성 정보전송 등 마케팅 목적으로 개인정보를 수집∙이용하는 경우 그 목적을 정보주체가 명확하게 인지할 수 있도록 고지하고 동의를 받아야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-301",
    policy_name: "정보보호 지침 3영역 제1절",
  },
  {
    req_id: "3.2.1",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "개인정보 현황관리",
    detail_desc:
      "수집∙보유하는 개인정보의 항목, 보유량, 처리 목적 및 방법, 보유기간 등 현황을 정기적으로 관리하여야 하며, 공공기관의 경우 이를 법률에서 정한 관계기관의 장에게 등록하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-302",
    policy_name: "정보보호 지침 3영역 제2절",
  },
  {
    req_id: "3.2.2",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "개인정보 품질보장",
    detail_desc:
      "수집된 개인정보는 처리 목적에 필요한 범위에서 개인정보의 정확성∙완전성∙최신성이 보장되도록 정보주체에게 관리절차를 제공하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-302",
    policy_name: "정보보호 지침 3영역 제2절",
  },
  {
    req_id: "3.2.3",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "이용자 단말기 접근 보호",
    detail_desc:
      "정보주체(이용자)의 이동통신단말장치 내에 저장되어 있는 정보 및 이동통신단말장치에 설치된 기능에 접근이 필요한 경우 이를 명확하게 인지할 수 있도록 알리고 정보주체(이용자)의 동의를 받아야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-302",
    policy_name: "정보보호 지침 3영역 제2절",
  },
  {
    req_id: "3.2.4",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "개인정보 목적 외 이용 및 제공",
    detail_desc:
      "개인정보는 수집 시의 정보주체에게 고지∙동의를 받은 목적 또는 법령에 근거한 범위 내에서만 이용 또는 제공하여야 하며, 이를 초과하여 이용∙제공하려는 때에는 정보주체의 추가 동의를 받거나 관계 법령에 따른 적법한 경우인지 확인하고 적절한 보호대책을 수립∙이행하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-302",
    policy_name: "정보보호 지침 3영역 제2절",
  },
  {
    req_id: "3.2.5",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "가명정보 처리",
    detail_desc:
      "가명정보를 처리하는 경우 목적제한, 결합제한, 안전조치, 금지의무 등 법적 요건을 준수하고 적정 수준의 가명처리를 보장할 수 있도록 가명처리 절차를 수립∙이행하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-302",
    policy_name: "정보보호 지침 3영역 제2절",
  },
  {
    req_id: "3.3.1",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "개인정보 제3자 제공",
    detail_desc:
      "개인정보를 제3자에게 제공하는 경우 법적 근거에 의하거나 정보주체의 동의를 받아야 하며, 제3자에게 개인정보의 접근을 허용하는 등 제공 과정에서 개인정보를 안전하게 보호하기 위한 보호대책을 수립∙이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-303",
    policy_name: "정보보호 지침 3영역 제3절",
  },
  {
    req_id: "3.3.2",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "개인정보 처리 업무 위탁",
    detail_desc:
      "개인정보 처리업무를 제3자에게 위탁하는 경우 위탁하는 업무의 내용과 수탁자 등 관련사항을 공개하여야 한다. 또한 재화 또는 서비스를 홍보하거나 판매를 권유하는 업무를 위탁하는 경우 위탁하는 업무의 내용과 수탁자를 정보주체에게 알려야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-303",
    policy_name: "정보보호 지침 3영역 제3절",
  },
  {
    req_id: "3.3.3",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "영업의 양도 등에 따른 개인정보 이전",
    detail_desc:
      "영업의 양도∙합병 등으로 개인정보를 이전하거나 이전받는 경우 정보주체 통지 등 적절한 보호조치를 수립∙이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-303",
    policy_name: "정보보호 지침 3영역 제3절",
  },
  {
    req_id: "3.3.4",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "개인정보 국외이전",
    detail_desc:
      "개인정보를 국외로 이전하는 경우 국외 이전에 대한 동의, 관련 사항에 대한 공개 등 적절한 보호조치를 수립∙이행하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-303",
    policy_name: "정보보호 지침 3영역 제3절",
  },
  {
    req_id: "3.4.1",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "개인정보 파기",
    detail_desc:
      "개인정보의 보유기간 및 파기 관련 내부 정책을 수립하고 개인정보의 보유기간 경과, 처리목적 달성 등 파기 시점이 도달한 때에는 파기의 안전성 및 완전성이 보장될 수 있는 방법으로 지체 없이 파기하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-304",
    policy_name: "정보보호 지침 3영역 제4절",
  },
  {
    req_id: "3.4.2",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "처리목적 달성 후 보유 시 조치",
    detail_desc:
      "개인정보의 보유기간 경과 또는 처리목적 달성 후에도 관련 법령 등에 따라 파기하지 아니하고 보존하는 경우에는 해당 목적에 필요한 최소한의 항목으로 제한하고 다른 개인정보와 분리하여 저장∙관리하여야 한다.",
    compliance_cycle: "반기 1회",
    policy_id: "POL-304",
    policy_name: "정보보호 지침 3영역 제4절",
  },
  {
    req_id: "3.5.1",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "개인정보 처리방침 공개",
    detail_desc:
      "개인정보의 처리 목적 등 필요한 사항을 모두 포함하여 정보주체가 알기 쉽도록 개인정보 처리방침을 수립하고, 이를 정보주체가 언제든지 쉽게 확인할 수 있도록 적절한 방법에 따라 공개하고 지속적으로 현행화하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-305",
    policy_name: "정보보호 지침 3영역 제5절",
  },
  {
    req_id: "3.5.2",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "정보주체 권리보장",
    detail_desc:
      "정보주체가 개인정보의 열람, 정정∙삭제, 처리정지, 이의제기, 동의철회 등 요구를 수집 방법∙절차보다 쉽게 할 수 있도록 권리행사 방법 및 절차를 수립∙이행하고, 정보주체의 요구를 받은 경우 지체 없이 처리하고 관련 기록을 남겨야 한다. 또한 정보주체의 사생활 침해, 명예훼손 등 타인의 권리를 침해하는 정보가 유통되지 않도록 삭제 요청, 임시조치 등의 기준을 수립∙이행하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-305",
    policy_name: "정보보호 지침 3영역 제5절",
  },
  {
    req_id: "3.5.3",
    category: "3. 개인정보 처리단계별 요구사항",
    subject: "정보주체에 대한 통지",
    detail_desc:
      "개인정보의 이용∙제공 내역 등 정보주체에게 통지하여야 할 사항을 파악하여 그 내용을 주기적으로 통지하여야 한다.",
    compliance_cycle: "연 1회",
    policy_id: "POL-305",
    policy_name: "정보보호 지침 3영역 제5절",
  },
];
const initialPolicies: Policy[] = [
  {
    policy_id: "POL-01",
    policy_name: "정보보호 규정 및 운영 지침서",
    article_no: "제5조 (의사결정 및 경영진 참여)",
    content:
      "① 회사의 최고경영자는 연간 정보보호 계획 및 정책의 제개정에 참여하며, 관련 이사회 보고를 소집하고 승인 조치한다. ② 매년 1회 이상 이사회 보고 절차를 수행하며 결과 보고서를 보존한다.",
    last_revised_at: "2026-01-15",
  },
  {
    policy_id: "POL-02",
    policy_name: "계정 및 권한 관리 지침",
    article_no: "제12조 (사용자 권한 정기 검토)",
    content:
      "① 각 부서의 정보시스템 접근 권한은 매월 마지막 주에 정기 검토를 시행한다. ② 인사 이동 및 퇴사자의 권한은 즉시 회수하며, 불필요한 과다 권한 여부를 체크리스트에 의거 검토하여 CISO 보고를 득한다.",
    last_revised_at: "2025-11-20",
  },
  {
    policy_id: "POL-03",
    policy_name: "인프라 및 시스템 운영 보안 지침",
    article_no: "제8조 (취약점 진단 및 보안패치)",
    content:
      '① 회사의 모든 운영 서버 및 DB 서버는 상반기/하반기 연 2회 취약점 진단(모의해킹 및 설정 진단)을 필수로 수행한다. ② 점검 결과 발견된 위험등급 "상"에 해당하는 항목은 14일 이내에 조치 완료 및 승인을 받아야 한다.',
    last_revised_at: "2026-02-10",
  },
  {
    policy_id: "POL-04",
    policy_name: "개인정보보호 및 신용정보 관리 지침",
    article_no: "제15조 (수집동의 및 최소주의)",
    content:
      "① 개인정보 및 고유식별정보의 수집 시에는 별도의 동의서를 징구하며 법률적 의무사항이 명시되어야 한다. ② 개인정보보호책임자(CPO)는 매 분기 1회 사내 수집 서식 및 온라인 가입 폼의 항목에 대한 적정성을 점검한다.",
    last_revised_at: "2026-03-01",
  },
];

const initialTasks: SecurityTask[] = [
  {
    task_id: "TASK-2026-001",
    req_id: "1.1.1",
    title: "2026년 이사회 보고 및 연간 정보보호 계획 승인",
    due_date: "2026-04-30",
    status: "완료",
    assignee_id: "user_ciso",
    assignee_name: "CISO",
    completed_at: "2026-04-25 15:30",
    description:
      "2026년도 전사 정보보호 계획안에 대해 경영진 이사회 소집 및 의결 승인을 득함. 이사회 소집 통지 및 회의록 서명 완료.",
    checklists: [
      { text: "연간 정보보호 투자 예산안 확정", checked: true },
      { text: "이사회 소집 통지문 발송 및 참석 확인", checked: true },
      { text: "이사회 의결록 서명본 스캔 및 파일 적치", checked: true },
    ],
    evidence_files: [],
    approval_path: [
      { name: "보안담당자", role: "기안자", status: "approved" },
      { name: "보안팀장", role: "검토자", status: "approved" },
      { name: "CISO", role: "최종승인자", status: "approved" },
    ],
  },
  {
    task_id: "TASK-2026-002",
    req_id: "1.1.2",
    title: "정보보호 최고책임자(CISO) 지정 및 금융감독원 신고 확인",
    due_date: "2026-05-15",
    status: "완료",
    assignee_id: "user_ciso",
    assignee_name: "CISO",
    completed_at: "2026-05-12 11:20",
    description:
      "금융회사 고유 요건에 따른 CISO/CPO 전임/겸임 제한 규정 체크리스트 확인 및 적합성 점검서 작성. 금융감독원 정식 CISO 지정 신고 서류 사본 확보.",
    checklists: [
      { text: "CISO 겸임 제한 요건 확인(자산규모 기준)", checked: true },
      { text: "최고책임자 지정 공문 기안 승인", checked: true },
      { text: "금융감독원 CISO 임명 보고 접수증 확인", checked: true },
    ],
    evidence_files: [],
    approval_path: [
      { name: "보안담당자", role: "기안자", status: "approved" },
      { name: "보안팀장", role: "검토자", status: "approved" },
      { name: "CISO", role: "최종승인자", status: "approved" },
    ],
  },
  {
    task_id: "TASK-2026-003",
    req_id: "2.1.1",
    title: "사내 정보보호 정책 및 지침서 개정 공표",
    due_date: "2026-05-10",
    status: "완료",
    assignee_id: "user_admin",
    assignee_name: "보안팀장",
    completed_at: "2026-05-09 18:00",
    description:
      "망분리 예외 처리 조항 및 신용정보법 개정 사항을 반영하여 정보보호 지침서 개정 및 CISO 서명본 공포.",
    checklists: [
      { text: "개인정보 지침 개정 드래프트 작성", checked: true },
      { text: "현업 부서(IT, 인사 등) 의견 수렴 및 검토", checked: true },
      { text: "사내 그룹웨어 전사 공지 공표 이력 백업", checked: true },
    ],
    evidence_files: [],
    approval_path: [
      { name: "보안담당자", role: "기안자", status: "approved" },
      { name: "보안팀장", role: "검토자", status: "approved" },
      { name: "CISO", role: "최종승인자", status: "approved" },
    ],
  },
  {
    task_id: "TASK-2026-004",
    req_id: "2.5.3",
    title: "2026년 5월 정보시스템 접근 권한 적정성 정기 검토",
    due_date: "2026-05-31",
    status: "승인대기",
    assignee_id: "user_eng",
    assignee_name: "시스템엔지니어",
    description:
      "인사 연동 데이터 기준 퇴직자 및 부서 이동자의 불필요한 DB/운영서버 접근권한 회수 처리 및 DB 권한 승인 내역 검토.",
    checklists: [
      { text: "인사 이동 및 퇴직자 명단 대조", checked: true },
      { text: "개발자 DB 직무별 권한 분리 상태 확인", checked: true },
      { text: "불필요 권한 회수 건에 대한 IT 지원 티켓 백업", checked: false },
    ],
    evidence_files: [],
    approval_path: [
      { name: "시스템엔지니어", role: "기안자", status: "approved" },
      { name: "보안팀장", role: "검토자", status: "approved" },
      { name: "CISO", role: "최종승인자", status: "pending" },
    ],
  },
  {
    task_id: "TASK-2026-005",
    req_id: "2.7.2",
    title: "2026년 상반기 인프라 정기 취약점 점검 및 보안 진단",
    due_date: "2026-06-30",
    status: "미흡",
    assignee_id: "user_eng",
    assignee_name: "보안엔지니어",
    description:
      "웹서버, 내부 포털, 방화벽 규칙 및 가상화 인프라 취약점 진단 점검. 2026-05-21 기준 아직 수행되지 않아 기한 지연 경고 상태.",
    checklists: [
      { text: "웹 취약점 진단 툴 가동 및 스캔", checked: false },
      { text: "서버 OS 보안 설정 패치 적합성 점검", checked: false },
      { text: "발견된 위험 항목 조치 보고서 기안", checked: false },
    ],
    evidence_files: [],
    approval_path: [
      { name: "보안엔지니어", role: "기안자", status: "active" },
      { name: "보안팀장", role: "검토자", status: "pending" },
      { name: "CISO", role: "최종승인자", status: "pending" },
    ],
  },
  {
    task_id: "TASK-2026-006",
    req_id: "3.1.1",
    title: "2026년 2분기 개인정보 수집 실태 및 동의서 정기 점검",
    due_date: "2026-06-15",
    status: "진행중",
    assignee_id: "user_privacy",
    assignee_name: "개인정보보호담당자",
    description:
      "회원가입 양식 및 모바일 핀테크 웹의 신용정보 수집 동의 문구 법적 검토. 금융 소비자 권리 통지서 발송 기준 검토.",
    checklists: [
      { text: "온라인 회원 가입 단계 동의 항목 체크", checked: true },
      { text: "선택 동의 및 마케팅 동의 분리 징구 검토", checked: false },
      { text: "정보주체 제공 및 위탁 현황 대조", checked: false },
    ],
    evidence_files: [],
    approval_path: [
      { name: "개인정보보호담당자", role: "기안자", status: "active" },
      { name: "보안팀장", role: "검토자", status: "pending" },
      { name: "CISO", role: "최종승인자", status: "pending" },
    ],
  },
  {
    task_id: "TASK-2026-007",
    req_id: "1.2.1",
    title: "2026년 연간 정보보호 위험평가 수행 및 보고",
    due_date: "2026-07-31",
    status: "진행중",
    assignee_id: "user_admin",
    assignee_name: "보안팀장",
    description:
      "조직의 정보자산 목록 갱신 및 위협·취약점 분석 기반 위험평가를 수행하고 잔여위험 처리방안을 수립하여 경영진에 보고.",
    checklists: [
      { text: "정보자산 목록 최신화 (서버, DB, 앱)", checked: true },
      { text: "위협 및 취약점 분석 매트릭스 작성", checked: true },
      { text: "위험수용기준 검토 및 잔여위험 승인", checked: false },
      { text: "위험처리 계획서 경영진 보고", checked: false },
    ],
    evidence_files: [],
    approval_path: [
      { name: "보안팀장", role: "기안자", status: "active" },
      { name: "CISO", role: "최종승인자", status: "pending" },
    ],
  },
  {
    task_id: "TASK-2026-008",
    req_id: "2.2.1",
    title: "2026년 상반기 전직원 정보보호 인식 제고 교육",
    due_date: "2026-05-31",
    status: "완료",
    assignee_id: "user_admin",
    assignee_name: "보안팀장",
    completed_at: "2026-05-28 17:00",
    description:
      "전임직원 대상 사이버 위협(피싱, 악성코드) 대응 및 개인정보보호 법령 이해 교육 이수 완료. LMS 시스템 교육 수료율 95% 달성.",
    checklists: [
      { text: "LMS 온라인 교육 콘텐츠 업로드", checked: true },
      { text: "교육 필수 이수 안내 메일 발송", checked: true },
      { text: "미이수자 추가 독려 조치", checked: true },
      { text: "최종 이수율 집계 및 보고서 작성", checked: true },
    ],
    evidence_files: [],
    approval_path: [
      { name: "보안팀장", role: "기안자", status: "approved" },
      { name: "CISO", role: "최종승인자", status: "approved" },
    ],
  },
  {
    task_id: "TASK-2026-009",
    req_id: "2.6.1",
    title: "주요 DB 및 전송구간 암호화 정책 점검",
    due_date: "2026-06-30",
    status: "미흡",
    assignee_id: "user_eng",
    assignee_name: "보안엔지니어",
    description:
      "고객 금융정보 저장 DB 컬럼 암호화 현황, API 전송 TLS 버전(1.2 이상) 적용 여부, 암호키 관리 정책 준수 여부 점검.",
    checklists: [
      { text: "개인정보 처리 DB 암호화 적용 목록 확인", checked: false },
      { text: "TLS 1.2 이하 구간 식별 및 업그레이드", checked: false },
      { text: "암호키 생명주기 관리 절차 문서 검토", checked: false },
    ],
    evidence_files: [],
    approval_path: [
      { name: "보안엔지니어", role: "기안자", status: "active" },
      { name: "보안팀장", role: "검토자", status: "pending" },
      { name: "CISO", role: "최종승인자", status: "pending" },
    ],
  },
  {
    task_id: "TASK-2026-010",
    req_id: "2.9.7",
    title: "정보시스템 보안 로그 보존 및 정기 검토",
    due_date: "2026-07-15",
    status: "미흡",
    assignee_id: "user_eng",
    assignee_name: "보안엔지니어",
    description:
      "핵심 정보시스템(방화벽, WAF, DB접근제어, AD) 보안 로그 최소 6개월 보존 여부 및 이상징후 모니터링 체계 점검.",
    checklists: [
      { text: "SIEM 연동 로그 수집 범위 확인", checked: false },
      { text: "로그 보존 기간 정책 준수 여부 점검", checked: false },
      { text: "이상징후 탐지 알림 임계값 설정 검토", checked: false },
    ],
    evidence_files: [],
    approval_path: [
      { name: "보안엔지니어", role: "기안자", status: "active" },
      { name: "보안팀장", role: "검토자", status: "pending" },
      { name: "CISO", role: "최종승인자", status: "pending" },
    ],
  },
  {
    task_id: "TASK-2026-011",
    req_id: "1.3.1",
    title: "2026년 상반기 관리체계 내부감사 수행",
    due_date: "2026-07-31",
    status: "미흡",
    assignee_id: "user_ciso",
    assignee_name: "CISO",
    description:
      "ISMS-P 인증기준 전 영역(1~3영역)에 대한 내부감사 계획 수립 및 수행. 부적합 사항 발굴 및 시정조치 요구.",
    checklists: [
      { text: "내부감사 계획서 작성 및 경영진 승인", checked: false },
      { text: "체크리스트 기반 인증기준 준수 여부 점검", checked: false },
      { text: "부적합 사항 목록화 및 시정조치 계획 수립", checked: false },
      { text: "내부감사 결과 보고서 작성 및 보고", checked: false },
    ],
    evidence_files: [],
    approval_path: [
      { name: "CISO", role: "기안자", status: "active" },
      { name: "보안팀장", role: "검토자", status: "pending" },
    ],
  },
];

// 이전 버전 로컬 저장소 정리용 식별 데이터이며 화면·업무 초기값으로는 사용하지 않는다.
void initialTasks;

// /refer 원본을 파일 유형·수행결과·시점 기준으로 검증한 실제 운영 증적만 반입한다.
// 규정, 절차서, 계획서, 가이드, 샘플 및 단순 사본은 이 목록에서 제외한다.
const initialEvidences: Evidence[] = [
  {
    evidence_id: "REF-ISO-001",
    task_id: "REFERENCE-IMPORT",
    req_id: "1.1.1",
    file_name: "2025년 제4차 정보보호위원회 회의록.pdf",
    file_path:
      "/refer/ISO 27001 인증 취득/ISO 요구사항/9.1/2025년 제4차 정보보호위원회 회의록.pdf",
    file_hash:
      "41af16c8514d6fc2e36c2426bc5bfa1d169c75d8a950645c1c2fc06dfa1edfd1",
    created_at: "2025년 심사자료",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 5,
    source_type: "기존 ISO 심사자료",
    verification_status: "팀장확인필요",
    verification_note:
      "회의 개최 및 경영진 검토 결과를 입증하는 결과 문서입니다. 참석자·의결·서명 완결성 확인이 필요합니다.",
    iso_control_refs: ["ISO 27001 5.1", "ISO 27001 9.3", "A.5.4"],
  },
  {
    evidence_id: "REF-ISO-002",
    task_id: "REFERENCE-IMPORT",
    req_id: "1.2.1",
    file_name: "2025.10.21 자산목록관리대장 Ver1.1.xlsx",
    file_path:
      "/refer/2025년 ISO27001 심사/문서 요구사항 증적/자산관리대장/2025.10.21 자산목록관리대장 Ver1.1.xlsx",
    file_hash:
      "d5a1a904e4c088330f96acf171fa05a250b23c44788768b3193f7325eb19fddc",
    created_at: "2025-10-21",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 5,
    source_type: "기존 ISO 심사자료",
    verification_status: "검증완료",
    verification_note:
      "기준일과 버전이 식별되는 현행 자산대장으로 자산 식별·목록 관리의 직접 증적입니다.",
    iso_control_refs: ["ISO 27001 8.1", "A.5.9", "A.5.12"],
  },
  {
    evidence_id: "REF-ISO-003",
    task_id: "REFERENCE-IMPORT",
    req_id: "1.2.3",
    file_name: "MA_MBP 웹·앱 위험평가 결과서.xlsx",
    file_path:
      "/refer/ISO 27001 인증 취득/ISO 요구사항/6.1/MA_MBP 웹·앱 위험평가 결과서.xlsx",
    file_hash:
      "632037c7fa6f9565417511e47e9eb136aa7f868956fd6d735c45ac7d5d429132",
    created_at: "2025년 심사자료",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 5,
    source_type: "기존 ISO 심사자료",
    verification_status: "검증완료",
    verification_note:
      "계획서가 아닌 대상 시스템의 위험평가 결과서로 통제 운영 결과를 직접 입증합니다.",
    iso_control_refs: ["ISO 27001 6.1.2", "ISO 27001 8.2"],
  },
  {
    evidence_id: "REF-ISO-004",
    task_id: "REFERENCE-IMPORT",
    req_id: "1.4.2",
    file_name: "2025년 IT 자체감사 결과서.pdf",
    file_path:
      "/refer/ISO 27001 인증 취득/ISO 요구사항/9.2/2025년 IT 자체감사 결과서.pdf",
    file_hash:
      "f875ce2524ba90e60f7adbe8d9a678af67a4cce631f851e745c262ae9e88b323",
    created_at: "2025년 심사자료",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 5,
    source_type: "기존 ISO 심사자료",
    verification_status: "팀장확인필요",
    verification_note:
      "내부감사 수행 결과 문서입니다. 감사 독립성, 승인 및 시정조치 추적 여부를 추가 확인해야 합니다.",
    iso_control_refs: ["ISO 27001 9.2", "ISO 27001 10.1"],
  },
  {
    evidence_id: "REF-ISO-005",
    task_id: "REFERENCE-IMPORT",
    req_id: "2.3.3",
    file_name: "2025년 6월 SLA 평가표.pdf",
    file_path:
      "/refer/2025년 ISO27001 심사/문서 요구사항 증적/외부업체 평가/2025년 6월 SLA 평가표.pdf",
    file_hash:
      "1dbdd587b1ad59db6cfe76e88c4baa8f9241c022f9f69144e2d43884895d6315",
    created_at: "2025-06",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 5,
    source_type: "기존 ISO 심사자료",
    verification_status: "검증완료",
    verification_note:
      "특정 평가월이 식별되는 외부업체 서비스 수준 평가 결과로 정기 감독의 직접 증적입니다.",
    iso_control_refs: ["A.5.19", "A.5.20", "A.5.22"],
  },
  {
    evidence_id: "REF-ISO-006",
    task_id: "REFERENCE-IMPORT",
    req_id: "2.9.3",
    file_name: "2025년 10월 로그 및 백업 현황.xlsx",
    file_path:
      "/refer/2025년 ISO27001 심사/문서 요구사항 증적/백업 절차/202510 로그 및 백업 현황.xlsx",
    file_hash:
      "d8ef4b20e34db7e83d8a111dda387d1c7a588b2bf476ff230151720ec403238d",
    created_at: "2025-10",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 5,
    source_type: "기존 ISO 심사자료",
    verification_status: "검증완료",
    verification_note:
      "특정 운영월의 로그·백업 현황으로 절차서가 아닌 실제 운영 내역에 해당합니다.",
    iso_control_refs: ["ISO 27001 8.1", "A.8.13", "A.8.15"],
  },
  {
    evidence_id: "REF-ISO-007",
    task_id: "REFERENCE-IMPORT",
    req_id: "2.11.2",
    file_name: "2025년 네트워크 자체 취약점 점검 결과보고서.xlsx",
    file_path:
      "/refer/2025년 ISO27001 심사/문서 요구사항 증적/신규 장비 보안성 평가 결과/2025년 네트워크 자체 취약점 점검 결과보고서.xlsx",
    file_hash:
      "d79546f0653d60ab1c4b28fefcdd6e74b033dbd65a6af5a779ddc6fc9c5f1aff",
    created_at: "2025년 심사자료",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 5,
    source_type: "기존 ISO 심사자료",
    verification_status: "검증완료",
    verification_note:
      "네트워크 자산에 수행한 취약점 점검 결과보고서로 기술적 취약점 관리의 직접 증적입니다.",
    iso_control_refs: ["ISO 27001 8.1", "A.8.8", "A.8.20"],
  },
  {
    evidence_id: "REF-ISO-008",
    task_id: "REFERENCE-IMPORT",
    req_id: "2.11.2",
    file_name: "2025년 정보보호시스템 자체 취약점 점검 결과보고서.xlsx",
    file_path:
      "/refer/2025년 ISO27001 심사/문서 요구사항 증적/신규 장비 보안성 평가 결과/2025년 정보보호시스템 자체 취약점 점검 결과보고서.xlsx",
    file_hash:
      "dffa32b58104b56c51005f3ae1cfed50491a7ca0e530b776350681e05227e417",
    created_at: "2025년 심사자료",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 5,
    source_type: "기존 ISO 심사자료",
    verification_status: "검증완료",
    verification_note:
      "정보보호시스템별 자체 취약점 점검 수행 결과가 기록된 운영 증적입니다.",
    iso_control_refs: ["ISO 27001 8.1", "A.8.8", "A.8.16"],
  },
  {
    evidence_id: "REF-ISO-009",
    task_id: "REFERENCE-IMPORT",
    req_id: "2.11.4",
    file_name: "침해사고 대응 및 복구훈련 결과.pdf",
    file_path:
      "/refer/ISO 27001 인증 취득/A 통제항목/인력 통제/침해사고 대응 및 복구훈련 결과.pdf",
    file_hash:
      "852802fe52cc739f3982dc3797175ad3806a040a96b153a76019b42b12bc7b75",
    created_at: "2025년 심사 제출자료",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 5,
    source_type: "기존 ISO 심사자료",
    verification_status: "팀장확인필요",
    verification_note:
      "훈련 결과 문서이므로 운영 증적에 해당하나 실제 훈련일, 참석자 및 개선조치 완료 여부 확인이 필요합니다.",
    iso_control_refs: ["A.5.24", "A.5.26", "A.5.27"],
  },
  {
    evidence_id: "REF-ISO-010",
    task_id: "REFERENCE-IMPORT",
    req_id: "2.5.1",
    file_name: "Okta 계정 목록.png",
    file_path:
      "/refer/ISO 27001 인증 취득/A 통제항목/조직 통제/Okta 계정 목록.png",
    file_hash:
      "173384f74141a624389ec9d527f52a02476e5ae43a9832e97ddfca764461ddfc",
    created_at: "2025년 심사 제출자료",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 3,
    source_type: "기존 ISO 심사자료",
    verification_status: "팀장확인필요",
    verification_note:
      "계정 현황 화면은 보조 운영 증적입니다. 추출일과 승인된 기준 계정 목록의 대조가 필요합니다.",
    iso_control_refs: ["A.5.16", "A.5.18"],
  },
  {
    evidence_id: "REF-ISO-011",
    task_id: "REFERENCE-IMPORT",
    req_id: "2.4.2",
    file_name: "세콤 출퇴근 근태자료 2025년 6월.xlsx",
    file_path:
      "/refer/ISO 27001 인증 취득/A 통제항목/물리적 통제/7.4 물리적 보호 모니터링/세콤 출퇴근 근태자료[2025.06.01-2025.06.30].xlsx",
    file_hash:
      "eb9c657568281aa7cb300bd1866f2902b1562b284232f94c24c19325308144d6",
    created_at: "2025-06",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 3,
    source_type: "기존 ISO 심사자료",
    verification_status: "검증완료",
    verification_note:
      "기간이 명시된 물리적 출입 운영 로그로 보호구역 출입통제의 직접 증적입니다.",
    iso_control_refs: ["A.7.2", "A.7.4"],
  },
  {
    evidence_id: "REF-ISO-012",
    task_id: "REFERENCE-IMPORT",
    req_id: "2.4.2",
    file_name: "세콤 출퇴근 근태자료 2025년 7월.xlsx",
    file_path:
      "/refer/ISO 27001 인증 취득/A 통제항목/물리적 통제/7.4 물리적 보호 모니터링/세콤 출퇴근 근태자료[2025.07.01-2025.07.31].xlsx",
    file_hash:
      "cb997c2583793f1464c2cb892ac567cb46487cf6c6117c686c09a14a9874b8b5",
    created_at: "2025-07",
    created_by: "기존 ISO 27001 심사자료 검증 반입",
    retention_years: 3,
    source_type: "기존 ISO 심사자료",
    verification_status: "검증완료",
    verification_note: "월별 연속성이 확인되는 물리적 출입 운영 로그입니다.",
    iso_control_refs: ["A.7.2", "A.7.4"],
  },
];

const initialComments: Record<string, TaskComment[]> = {};

const initialQA: AuditorQA[] = [];

const initialAuditLogs: AuditLog[] = [];

// ==========================================
// 3. Helper Functions
// ==========================================

const generateNumericId = () => Date.now() + Math.floor(Math.random() * 1000);

const generateTaskSuffix = () => 100 + Math.floor(Math.random() * 900);

const escapeSpreadsheetXml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const spreadsheetSheet = (name: string, rows: unknown[][]) => `<Worksheet ss:Name="${escapeSpreadsheetXml(name)}"><Table>${rows.map((row,index)=>`<Row>${row.map(value=>`<Cell${index===0?' ss:StyleID="Header"':''}><Data ss:Type="String">${escapeSpreadsheetXml(value)}</Data></Cell>`).join('')}</Row>`).join('')}</Table></Worksheet>`;
const spreadsheetWorkbook = (sheets: {name:string;rows:unknown[][]}[]) => `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="Default"><Alignment ss:Vertical="Top"/><Font ss:FontName="Arial" ss:Size="10"/></Style><Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#DCE6F1" ss:Pattern="Solid"/></Style></Styles>${sheets.map(sheet=>spreadsheetSheet(sheet.name,sheet.rows)).join('')}</Workbook>`;

const removeDemoIdentities = (text: string) =>
  text
    .replace(/김보안(?:\s*\([^)]*\))?/g, "CISO")
    .replace(/박검토(?:\s*\([^)]*\))?/g, "보안팀장")
    .replace(/이지선(?:\s*\([^)]*\))?/g, "시스템엔지니어")
    .replace(/최인프라(?:\s*\([^)]*\))?/g, "보안엔지니어")
    .replace(/박민지(?:\s*\([^)]*\))?/g, "개인정보보호담당자")
    .replace(/이지원(?:\s*\([^)]*\))?/g, "보안담당자");

const demoEvidenceMarkers = [
  "2026_이사회_보고서_최종",
  "2026_CISO_임명_및_보안조직도",
  "2026_정보보호지침서_개정본_승인",
  "202605_권한검토_보고서",
  "2026_상반기_정보보호교육_이수현황",
];
const demoEvidenceHashes = new Set([
  "9a8d7e6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
  "1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
  "f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1a2b3c4d5e6f7a8b9c0d1e2f3a4b5",
  "e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7",
  "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b3",
]);
const demoTaskIds = new Set(
  Array.from(
    { length: 11 },
    (_, index) => `TASK-2026-${String(index + 1).padStart(3, "0")}`
  )
);
const isDemoEvidence = (fileName: string, hash?: string) =>
  demoEvidenceMarkers.some(marker => fileName.includes(marker)) ||
  Boolean(hash && demoEvidenceHashes.has(hash));

const sanitizeStoredTasks = (items: SecurityTask[]) =>
  items
    .filter(task => !demoTaskIds.has(task.task_id))
    .map(task => ({
      ...task,
      assignee_name: removeDemoIdentities(task.assignee_name),
      evidence_files: task.evidence_files.filter(
        file => !isDemoEvidence(file.file_name, file.file_hash)
      ),
      approval_path: task.approval_path.map(node => ({
        ...node,
        name: removeDemoIdentities(node.name),
      })),
    }));

const sanitizeStoredEvidences = (items: Evidence[]) =>
  items
    .filter(evidence => !isDemoEvidence(evidence.file_name, evidence.file_hash))
    .map(evidence => ({
      ...evidence,
      created_by: removeDemoIdentities(evidence.created_by),
      verified_by: evidence.verified_by
        ? removeDemoIdentities(evidence.verified_by)
        : evidence.verified_by,
    }));

type AnnualOccurrence = { code: string; label: string; due: string };
const operatingYear = 2026;
const lastDay = (year: number, month: number) => new Date(year, month, 0).getDate();
const annualOccurrences = (cycle: string, year = operatingYear): AnnualOccurrence[] => {
  const result: AnnualOccurrence[] = [];
  if (cycle.includes("연 1회"))
    result.push({
      code: "Y",
      label: `${year}년 연간`,
      due: cycle.includes("연초") ? `${year}-01-31` : `${year}-12-31`,
    });
  if (cycle.includes("반기"))
    [6, 12].forEach((month, index) =>
      result.push({
        code: `H${index + 1}`,
        label: `${index + 1}반기`,
        due: `${year}-${String(month).padStart(2, "0")}-${lastDay(year, month)}`,
      })
    );
  if (cycle.includes("분기"))
    [3, 6, 9, 12].forEach((month, index) =>
      result.push({
        code: `Q${index + 1}`,
        label: `${index + 1}분기`,
        due: `${year}-${String(month).padStart(2, "0")}-${lastDay(year, month)}`,
      })
    );
  const monthly = /월간|월 점검|월 보고|월 추적|월 SLA|상시|24×365/.test(cycle);
  if (monthly)
    Array.from({ length: 12 }, (_, index) => index + 1).forEach(month =>
      result.push({
        code: `M${String(month).padStart(2, "0")}`,
        label: `${month}월`,
        due: `${year}-${String(month).padStart(2, "0")}-${lastDay(year, month)}`,
      })
    );
  if (
    result.length === 0 ||
    /발생|변경|사고|요청|계약|입사|종료|심사|검사|긴급|수시/.test(cycle)
  )
    result.push({
      code: "ADHOC",
      label: "수시·발생 시",
      due: `${year}-12-31`,
    });
  return result;
};

// 운영업무 유형을 월간·분기·반기·연간·수시의 실제 연간 수행 건으로 전개한다.
const operatingMasterTasks: SecurityTask[] = operatingWorkMaster.flatMap(work =>
  annualOccurrences(work.cycle, operatingYear).map(occurrence => {
    const organization = getMoinWorkOrganization(work);
    return ({
    task_id: `AW-${operatingYear}-${work.id}-${occurrence.code}`,
    req_id: work.isms[0],
    title: `[${occurrence.label}] ${work.activity}`,
    due_date: occurrence.due,
    status: "진행중",
    assignee_id: `role_${work.id.toLowerCase()}`,
    assignee_name: organization.ownerDepartment,
    owner_department: organization.ownerDepartment,
    cooperating_departments: organization.cooperatingDepartments,
    organization_mapping_source: organization.source,
    description: `${operatingYear}년 ${occurrence.label} 운영업무 · 원 주기: ${work.cycle} · ISMS-P ${work.isms.join(", ")} / 전자금융감독규정 ${work.efr} / 내부문서 ${work.internal.join(", ")}`,
    checklists: [
      { text: "대상·범위 및 전기 미흡사항 확인", checked: false },
      { text: `${organization.ownerDepartment} 업무 수행 및 결과 기록`, checked: false },
      ...work.outputs.map(output => ({
        text: `${output} 작성·등록`,
        checked: false,
      })),
      { text: `${organization.reviewerDepartment} 적정성 검토`, checked: false },
      { text: `${organization.approver} 승인 및 후속조치`, checked: false },
    ],
    evidence_files: [],
    approval_path: [
      { name: organization.ownerDepartment, role: "기안자", status: "active" },
      ...(organization.cooperatingDepartments.length ? [{ name: organization.cooperatingDepartments.join(" · "), role: "협업부서", status: "pending" as const }] : []),
      { name: organization.reviewerDepartment, role: "검토자", status: "pending" },
      { name: organization.approver, role: "최종승인자", status: "pending" },
    ],
  })})
);

// ==========================================
// 4. Main App Component
// ==========================================

export default function App() {
  // App States
  const [storedTasks, setTasks] = usePersistentState<SecurityTask[]>(
    "isms_annual_operating_tasks_2026_v7",
    operatingMasterTasks,
    sanitizeStoredTasks
  );
  const [storedEvidences, setEvidences] = usePersistentState<Evidence[]>(
    "isms_evidences_verified_v7",
    initialEvidences,
    sanitizeStoredEvidences
  );
  const tasks = useMemo(() => sanitizeStoredTasks(storedTasks), [storedTasks]);
  const evidences = useMemo(
    () => sanitizeStoredEvidences(storedEvidences),
    [storedEvidences]
  );
  const [comments, setComments] = usePersistentState<
    Record<string, TaskComment[]>
  >("isms_comments_clean_v3", initialComments);
  const [qaList, setQaList] = usePersistentState<AuditorQA[]>(
    "isms_qa_clean_v2",
    initialQA
  );
  const [auditLogs, setAuditLogs] = usePersistentState<AuditLog[]>(
    "isms_audit_logs_clean_v2",
    initialAuditLogs
  );

  // UI Control States
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [currentRole, setCurrentRole] = useState<UserRole>("CISO");
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    operatingMasterTasks[0]?.task_id || ""
  );
  const [annualTaskQuery, setAnnualTaskQuery] = useState<string>("");
  const [annualTaskDomain, setAnnualTaskDomain] = useState<string>("all");
  const [annualTaskDepartment, setAnnualTaskDepartment] = useState<string>("all");
  const [annualTaskYear, setAnnualTaskYear] = useState<number>(operatingYear);
  const [showTaskDetail, setShowTaskDetail] = useState<boolean>(false);
  const taskComments = comments[selectedTaskId] || [];
  const annualWorkRows = useMemo(
    () => operatingWorkMaster.map(work => ({
      work,
      occurrences: annualTaskYear === operatingYear
        ? tasks.filter(task => task.task_id.includes(`-${work.id}-`))
        : annualOccurrences(work.cycle, annualTaskYear).map(occurrence => ({
            task_id: `PLAN-${annualTaskYear}-${work.id}-${occurrence.code}`,
            req_id: work.isms[0], title: `[${occurrence.label}] ${work.activity}`,
            due_date: occurrence.due, status: "진행중" as const, assignee_id: "plan",
            assignee_name: getMoinWorkOrganization(work).ownerDepartment,
            checklists: [], evidence_files: [], approval_path: [],
          })),
    })).filter(({work}) => {
      const organization=getMoinWorkOrganization(work);
      const departments=[organization.ownerDepartment,...organization.cooperatingDepartments,organization.reviewerDepartment,organization.approver];
      return (annualTaskDomain === "all" || work.domain === annualTaskDomain) &&
        (annualTaskDepartment === "all" || departments.some(department=>department.includes(annualTaskDepartment))) &&
        (!annualTaskQuery.trim() || `${work.id} ${work.activity} ${work.owner} ${departments.join(" ")} ${work.outputs.join(" ")} ${work.internal.join(" ")}`.toLowerCase().includes(annualTaskQuery.toLowerCase()));
    }),
    [tasks, annualTaskDomain, annualTaskDepartment, annualTaskQuery, annualTaskYear]
  );

  // Filters & Searches
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Intermediary UI actions
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "warning";
  } | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [lightboxFile, setLightboxFile] = useState<{
    name: string;
    size: string;
    hash: string;
    path: string;
    creator?: string;
    date?: string;
  } | null>(null);
  const [vfsActiveFolder, setVfsActiveFolder] =
    useState<string>("1. 관리체계 수립 및 운영");
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [tempDroppedFiles, setTempDroppedFiles] = useState<
    { name: string; size: string; hash: string }[]
  >([]);
  const [systemTime, setSystemTime] = useState<string>("");

  // Auditor specific states
  const [auditorCountdown, setAuditorCountdown] = useState<number>(3599); // 59:59
  const [showNewQAModal, setShowNewQAModal] = useState<boolean>(false);
  const [newQAQuestion, setNewQAQuestion] = useState<string>("");
  const [newQAReqId, setNewQAReqId] = useState<string>("2.5.3");
  const [replyQAId, setReplyQAId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  // ── ISO 27001 ↔ ISMS-P 듀얼 프레임워크 상태 ──
  const [framework, setFramework] = useState<Framework>("ISMS-P");
  const [isoFilterDomain, setIsoFilterDomain] = useState<string>("all");
  const [isoFilterStatus, setIsoFilterStatus] = useState<string>("all");
  const [isoEvidenceFilter, setIsoEvidenceFilter] = useState<
    "all" | "verified" | "pending" | "unlinked"
  >("all");
  const [isoSearchQuery, setIsoSearchQuery] = useState<string>("");
  const [selectedIsoControl, setSelectedIsoControl] =
    useState<ISOControl | null>(null);
  const [isoMappingFilter, setIsoMappingFilter] = useState<string>("all");

  // ── Notion-style 매트릭스 뷰 상태 ──
  const [expandedSubcats, setExpandedSubcats] = useState<Set<string>>(
    new Set(["1.1", "2.5"])
  );
  const [matrixViewMode, setMatrixViewMode] =
    useState<MatrixViewMode>("accordion");
  const [matrixYear, setMatrixYear] = useState<2025|2026>(2026);
  const [expandedReqId, setExpandedReqId] = useState<string | null>(null);

  // Auditor Countdown & System Clock Timer
  useEffect(() => {
    const timer = setInterval(() => {
      // Live Clock
      const now = new Date();
      setSystemTime(now.toLocaleString("ko-KR", { hour12: false }));

      // Auditor timer
      setAuditorCountdown(prev => (prev > 0 ? prev - 1 : 3599));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to log actions
  const logAction = (
    user: string,
    action: string,
    details: string,
    status: string = "SUCCESS"
  ) => {
    const now = new Date();
    const timestampStr = now.toISOString().replace("T", " ").substring(0, 19);
    const newLog: AuditLog = {
      log_id: generateNumericId(),
      timestamp: timestampStr,
      user,
      role: currentRole,
      action,
      details,
      status,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const showToast = (
    message: string,
    type: "success" | "info" | "warning" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRoleChange = (nextRole: UserRole) => {
    setCurrentRole(nextRole);

    if (nextRole === "외부 심사원") {
      setActiveTab("auditor");
      const timestamp = new Date()
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);
      setAuditLogs(prev => [
        {
          log_id: generateNumericId(),
          timestamp,
          user: "auditor_01",
          role: nextRole,
          action: "SWITCH_TO_AUDITOR_PORTAL",
          details: "심사원 모드 강제 진입 (타 메뉴 제어 잠금)",
          status: "SUCCESS",
        },
        ...prev,
      ]);
      showToast(
        "심사원 전용 보안 포털이 활성화되었습니다 (접근 통제).",
        "warning"
      );
    } else {
      setActiveTab(currentTab =>
        currentTab === "auditor" ? "dashboard" : currentTab
      );
    }
  };

  // ==========================================
  // 5. Actions / Event Handlers
  // ==========================================

  // [모듈 1] 정기 태스크 수동 발행 테스트
  const triggerSchedulerSimulation = () => {
    const now = new Date();
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonth = [
      nextMonthDate.getFullYear(),
      String(nextMonthDate.getMonth() + 1).padStart(2, "0"),
      "01",
    ].join("-");
    const nextMonthLabel = `${nextMonthDate.getFullYear()}년 ${nextMonthDate.getMonth() + 1}월`;
    const newTaskCode = `TASK-${nextMonthDate.getFullYear()}-${generateTaskSuffix()}`;
    const schedulerTask: SecurityTask = {
      task_id: newTaskCode,
      req_id: "2.5.3",
      title: `${nextMonthLabel} 정보시스템 접근 권한 적정성 정기 검토`,
      due_date: nextMonth,
      status: "진행중",
      assignee_id: "user_eng",
      assignee_name: "시스템엔지니어",
      description: `시스템 정기 스케줄러에 의해 자동 생성된 ${nextMonthLabel} 주기 업무입니다. ${nextMonthDate.getMonth() + 1}월 1일부터 업무 이행이 필요합니다.`,
      checklists: [
        { text: "인사 연동 목록과 DB 접속 대상자 정합성 대조", checked: false },
        { text: "권한 검토 완료 보고서 기안", checked: false },
      ],
      evidence_files: [],
      approval_path: [
        { name: "시스템엔지니어", role: "기안자", status: "active" },
        { name: "보안팀장", role: "검토자", status: "pending" },
        { name: "CISO", role: "최종승인자", status: "pending" },
      ],
    };

    setTasks(prev => [schedulerTask, ...prev]);
    logAction(
      "SYSTEM",
      "CRON_JOB_TASK_TRIGGER",
      `정기 업무 발행 기능으로 신규 월간 업무 (${newTaskCode}) 생성`,
      "SUCCESS"
    );
    showToast(
      `스케줄러 작동: 정기 보안 업무 "${schedulerTask.title}"가 담당자에게 할당되었습니다.`,
      "success"
    );
  };

  // [모듈 1] CISO 에스컬레이션 알림 발송
  const triggerEscalation = (taskId: string) => {
    const task = tasks.find(t => t.task_id === taskId);
    if (!task) return;

    logAction(
      "SYSTEM",
      "ESCALATE_ALERT",
      `미이행 업무 "${task.title}"에 대해 CISO 에스컬레이션 및 메신저 알림 전송`,
      "SUCCESS"
    );
    showToast(
      "에스컬레이션 경보: CISO에게 미이행 알림이 전달되었습니다.",
      "warning"
    );
  };

  const createOrOpenIsoEvidenceGapTask = (control: ISOControl) => {
    const mapped = control.mapped_isms[0];
    if (!mapped) {
      showToast(
        "연결된 ISMS-P 통제번호가 없어 먼저 매핑 검토가 필요합니다.",
        "warning"
      );
      return;
    }
    const existing = tasks.find(
      task => task.req_id === mapped.req_id && task.status !== "완료"
    );
    if (existing) {
      setSelectedTaskId(existing.task_id);
      setActiveTab("tasks");
      showToast("동일 통제의 기존 보완업무를 열었습니다.", "info");
      return;
    }
    const taskId = `TASK-ISO-GAP-${generateTaskSuffix()}`;
    const newTask: SecurityTask = {
      task_id: taskId,
      req_id: mapped.req_id,
      title: `[ISO ${control.control_no}] 2025 실제 증적 보완`,
      due_date: "2026-08-31",
      status: "진행중",
      assignee_id: "security_engineer",
      assignee_name: "보안엔지니어",
      description: `ISO 27001 ${control.control_no} ${control.control_name} 통제에 연결할 실제 운영 증적을 확보하고 ISMS-P ${mapped.req_id} 기준으로 적정성을 확인합니다.`,
      checklists: [
        {
          text: "실제 수행 결과 문서 또는 시스템 원본 로그 확보",
          checked: false,
        },
        { text: "수행일·대상·담당자·승인 흔적 확인", checked: false },
        { text: "SHA-256 산출 및 통제번호 연결", checked: false },
        { text: "보안팀장 증적 적정성 검토 요청", checked: false },
      ],
      evidence_files: [],
      approval_path: [
        { name: "보안엔지니어", role: "기안자", status: "active" },
        { name: "보안팀장", role: "검토자", status: "pending" },
        { name: "CISO", role: "최종승인자", status: "pending" },
      ],
    };
    setTasks(prev => [newTask, ...prev]);
    setSelectedTaskId(taskId);
    setActiveTab("tasks");
    logAction(
      currentRole,
      "CREATE_ISO_EVIDENCE_GAP_TASK",
      `ISO ${control.control_no} / ISMS-P ${mapped.req_id} 실제 증적 보완업무 발행`,
      "SUCCESS"
    );
    showToast("ISO 증적 미연결 통제의 보완업무가 발행되었습니다.", "success");
  };

  // [모듈 1 & 4.2] 기안자/실무자 업무 제출 (결재요청)
  const submitTaskForApproval = (
    taskId: string,
    descText: string,
    uploadFilesList: {
      file_name: string;
      file_size: string;
      file_hash: string;
      path: string;
    }[]
  ) => {
    if (uploadFilesList.length === 0) {
      showToast(
        "최소 1개 이상의 증적 파일(PDF 등)을 업로드해야 결재를 요청할 수 있습니다.",
        "warning"
      );
      return;
    }

    setTasks(prev =>
      prev.map(task => {
        if (task.task_id === taskId) {
          const updatedApproval = task.approval_path.map(node => {
            if (node.role === "기안자")
              return { ...node, status: "approved" as const };
            if (node.role === "검토자")
              return { ...node, status: "active" as const };
            return node;
          });
          return {
            ...task,
            status: "승인대기",
            description: descText,
            evidence_files: uploadFilesList,
            approval_path: updatedApproval,
          };
        }
        return task;
      })
    );

    logAction(
      currentRole,
      "REQUEST_APPROVAL",
      `실무 업무 (${taskId}) 완료 보고 및 증적 파일 등록 후 CISO 결재 요청`,
      "SUCCESS"
    );
    showToast(
      "보안팀장 및 CISO에게 결재 요청서가 발송되었습니다. 상태: 승인대기",
      "info"
    );
  };

  // [모듈 1 & 4.2] CISO 최종 결재 승인 처리 및 증적 자동 복사 (Virtual File System 적치)
  const approveTaskByCISO = (taskId: string) => {
    const task = tasks.find(t => t.task_id === taskId);
    if (!task) return;
    const securityLeadReview = task.approval_path.find(
      node => node.role === "검토자"
    );
    if (securityLeadReview?.status !== "approved") {
      showToast(
        "보안팀장의 증적 적정성 확인이 완료된 후 CISO 최종 승인이 가능합니다.",
        "warning"
      );
      return;
    }

    // 1. Task 상태 변경
    setTasks(prev =>
      prev.map(t => {
        if (t.task_id === taskId) {
          const updatedApproval = t.approval_path.map(node => ({
            ...node,
            status: "approved" as const,
          }));
          return {
            ...t,
            status: "완료",
            completed_at: new Date().toLocaleString("ko-KR", { hour12: false }),
            approval_path: updatedApproval,
          };
        }
        return t;
      })
    );

    // 2. 로컬 VFS 인덱스에 승인 증적 메타데이터 적치
    const newEvidences: Evidence[] = task.evidence_files.map(file => {
      const categoryPath =
        initialRequirements.find(r => r.req_id === task.req_id)?.category ||
        "2. 보호대책 요구사항";
      const destinationPath = `/VFS/${categoryPath}/${task.req_id}/${file.file_name}`;
      const linkedIsoRefs = isoControls
        .filter(control =>
          control.mapped_isms.some(mapping => mapping.req_id === task.req_id)
        )
        .flatMap(control => [control.iso_id, `A.${control.control_no}`]);
      return {
        evidence_id: `EVI-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        task_id: task.task_id,
        req_id: task.req_id,
        file_name: file.file_name,
        file_path: destinationPath,
        file_hash: file.file_hash,
        created_at: new Date().toLocaleString("ko-KR", { hour12: false }),
        created_by: `${task.assignee_name} (기안), 보안팀장 (증적 확인), CISO (최종 승인)`,
        retention_years: 5,
        source_type: "업로드",
        verification_status: "검증완료",
        verification_note:
          "보안팀장 증적 적정성 확인 및 CISO 최종 승인을 거쳐 VFS에 적치된 운영 증적입니다.",
        iso_control_refs: [...new Set(linkedIsoRefs)],
        verified_by: "보안팀장",
        verified_at: new Date().toLocaleString("ko-KR", { hour12: false }),
      };
    });

    setEvidences(prev => [...prev, ...newEvidences]);

    // 3. 감사 로그 기록
    newEvidences.forEach(ev => {
      logAction(
        "user_ciso",
        "CISO_APPROVE_AND_REGISTER",
        `CISO 최종 결재 완료 및 VFS 증적 메타데이터 등록. 파일: ${ev.file_name}, 해시: ${ev.file_hash.substring(0, 16)}...`,
        "SUCCESS"
      );
    });

    showToast(
      `업무 승인 완료: 증적 메타데이터가 "${newEvidences[0]?.file_path || ""}" 경로로 등록되었습니다.`,
      "success"
    );
  };

  // 업로드된 증적의 완전성·적정성을 보안팀장이 확인한 뒤 CISO 단계로 이관
  const reviewEvidenceBySecurityLead = (taskId: string) => {
    const task = tasks.find(item => item.task_id === taskId);
    if (!task || task.evidence_files.length === 0) {
      showToast("검토할 증적 파일이 없습니다.", "warning");
      return;
    }
    setTasks(prev =>
      prev.map(item =>
        item.task_id === taskId
          ? {
              ...item,
              approval_path: item.approval_path.map(node => {
                if (node.role === "검토자")
                  return { ...node, status: "approved" as const };
                if (node.role === "최종승인자")
                  return { ...node, status: "active" as const };
                return node;
              }),
            }
          : item
      )
    );
    logAction(
      "보안팀장",
      "EVIDENCE_REVIEW_APPROVE",
      `업무 (${taskId}) 증적 ${task.evidence_files.length}건의 무결성·통제 적합성 확인 완료`,
      "SUCCESS"
    );
    showToast(
      "보안팀장 증적 확인이 완료되어 CISO 최종 승인 단계로 이관되었습니다.",
      "success"
    );
  };

  const verifyImportedEvidenceBySecurityLead = (evidenceId: string) => {
    if (currentRole !== "보안팀장") {
      showToast(
        "기존 심사자료의 최종 증적 확인은 보안팀장 권한에서만 가능합니다.",
        "warning"
      );
      return;
    }
    const target = evidences.find(
      evidence => evidence.evidence_id === evidenceId
    );
    if (!target) return;
    const verifiedAt = new Date().toLocaleString("ko-KR", { hour12: false });
    setEvidences(prev =>
      prev.map(evidence =>
        evidence.evidence_id === evidenceId
          ? {
              ...evidence,
              verification_status: "검증완료",
              verified_by: "보안팀장",
              verified_at: verifiedAt,
            }
          : evidence
      )
    );
    logAction(
      "보안팀장",
      "REFERENCE_EVIDENCE_VERIFIED",
      `2025년 ISO 심사 증적 확인 완료: ${target.file_name} (${target.req_id})`,
      "SUCCESS"
    );
    showToast(
      "증적 확인이 완료되어 ISO 27001 및 ISMS-P 매핑에 검증 상태가 반영되었습니다.",
      "success"
    );
  };

  const excludeImportedEvidenceBySecurityLead = (
    evidenceId: string,
    reason: string
  ) => {
    if (currentRole !== "보안팀장") {
      showToast("증적 제외는 보안팀장 권한에서만 가능합니다.", "warning");
      return;
    }
    if (!reason.trim()) {
      showToast("증적 제외 사유를 입력해야 합니다.", "warning");
      return;
    }
    const target = evidences.find(
      evidence => evidence.evidence_id === evidenceId
    );
    if (!target) return;
    const reviewedAt = new Date().toLocaleString("ko-KR", { hour12: false });
    setEvidences(prev =>
      prev.map(evidence =>
        evidence.evidence_id === evidenceId
          ? {
              ...evidence,
              verification_status: "증적제외",
              exclusion_reason: reason,
              verified_by: "보안팀장",
              verified_at: reviewedAt,
            }
          : evidence
      )
    );
    logAction(
      "보안팀장",
      "REFERENCE_EVIDENCE_EXCLUDED",
      `ISO 심사자료 증적 제외: ${target.file_name}. 사유: ${reason}`,
      "SUCCESS"
    );
    showToast("부적합 자료가 증적 커버리지에서 제외되었습니다.", "warning");
  };

  // [모듈 4.2] 결재 반려 사유 작성 및 통보
  const rejectTaskByCISO = (taskId: string, rejectReason: string) => {
    if (!rejectReason.trim()) {
      showToast("반려 사유를 댓글 창에 먼저 입력해주십시오.", "warning");
      return;
    }

    setTasks(prev =>
      prev.map(t => {
        if (t.task_id === taskId) {
          const resetApproval = t.approval_path.map(node => {
            if (node.role === "최종승인자")
              return { ...node, status: "pending" as const };
            if (node.role === "기안자")
              return { ...node, status: "active" as const };
            return { ...node, status: "pending" as const };
          });
          return {
            ...t,
            status: "진행중", // 반려되어 다시 수정중
            approval_path: resetApproval,
          };
        }
        return t;
      })
    );

    // 댓글 등록
    const newComment: TaskComment = {
      comment_id: generateNumericId(),
      task_id: taskId,
      writer_name: "CISO",
      writer_role: "CISO",
      content: `⚠️ [결재 반려 알림] 사유: ${rejectReason}`,
      created_at: new Date().toLocaleString("ko-KR", { hour12: false }),
    };

    setComments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), newComment],
    }));

    logAction(
      "user_ciso",
      "REJECT_TASK_APPROVAL",
      `CISO 결재 반려 처리 (${taskId}). 사유: ${rejectReason}`,
      "SUCCESS"
    );
    showToast(
      "결재요청이 반려 처리되어 실무자에게 알림 및 피드백이 전송되었습니다.",
      "warning"
    );
  };

  // [모듈 4.2] 댓글 및 멘션 등록
  const handleAddComment = (taskId: string, text: string) => {
    if (!text.trim()) return;

    const roleName = currentRole;
    const authorMap = {
      CISO: "CISO",
      보안팀장: "보안팀장",
      엔지니어: "보안엔지니어",
      개인정보담당자: "개인정보보호담당자",
      "외부 심사원": "외부 심사원",
    };

    const newComment: TaskComment = {
      comment_id: generateNumericId(),
      task_id: taskId,
      writer_name: authorMap[roleName] || "사용자",
      writer_role: roleName,
      content: text,
      created_at: new Date().toLocaleString("ko-KR", { hour12: false }),
    };

    setComments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), newComment],
    }));

    logAction(
      currentRole,
      "ADD_TASK_COMMENT",
      `업무 ${taskId}에 신규 피드백/의견 댓글 추가`,
      "SUCCESS"
    );
  };

  // [모듈 5] 심사원 포털 - Q&A 질문 등록
  const handleAddAuditorQA = (reqId: string, question: string) => {
    if (!question.trim()) return;

    const newQA: AuditorQA = {
      qa_id: generateNumericId(),
      req_id: reqId,
      question,
      asked_by: "외부 심사원 (auditor_01)",
      asked_at: new Date().toLocaleString("ko-KR", { hour12: false }),
      status: "pending",
    };

    setQaList(prev => [newQA, ...prev]);
    logAction(
      "auditor_01",
      "CREATE_AUDITOR_QA",
      `심사기준 ${reqId}에 대한 질의사항(Q&A) 작성 및 등록`,
      "SUCCESS"
    );
    showToast(
      "질문이 등록되었습니다. 수검 준비 담당팀에 실시간 알림이 발송됩니다.",
      "success"
    );
  };

  // [모듈 5] 심사원 포털 - Q&A 답변 등록
  const handleAnswerAuditorQA = (qaId: number, answer: string) => {
    if (!answer.trim()) return;

    setQaList(prev =>
      prev.map(qa => {
        if (qa.qa_id === qaId) {
          return {
            ...qa,
            answer,
            answered_by: "CISO",
            answered_at: new Date().toLocaleString("ko-KR", { hour12: false }),
            status: "replied",
          };
        }
        return qa;
      })
    );

    logAction(
      "user_ciso",
      "SUBMIT_QA_ANSWER",
      `심사원 Q&A (일련번호 ${qaId}) 에 대한 공식 소명 답변 제출`,
      "SUCCESS"
    );
    showToast(
      "심사원 질문에 대한 답변 및 피드백이 등록 완료되었습니다.",
      "success"
    );
  };

  // [모듈 4.2] 실제 파일 바이트 기반 SHA-256 산출 (Drag & Drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      void processEvidenceFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void processEvidenceFile(files[0]);
    }
  };

  const processEvidenceFile = async (file: File) => {
    setIsUploading(true);
    try {
      const fileBytes = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", fileBytes);
      const computedHash = Array.from(new Uint8Array(digest), byte =>
        byte.toString(16).padStart(2, "0")
      ).join("");
      const sizeKB = (file.size / 1024).toFixed(1) + "KB";
      const newFile = {
        name: file.name,
        size: sizeKB,
        hash: computedHash,
      };
      setTempDroppedFiles(prev => [...prev, newFile]);
      logAction(
        currentRole,
        "CALCULATE_FILE_HASH",
        `증적 제출 파일 (${file.name}) 원본 바이트 SHA-256 산출: ${computedHash.substring(0, 16)}...`,
        "SUCCESS"
      );
      showToast(
        "실제 파일 바이트 기반 SHA-256 계산이 완료되었습니다.",
        "success"
      );
    } catch {
      showToast(
        "파일 해시 계산에 실패했습니다. 파일을 다시 선택해 주십시오.",
        "warning"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const verifyEvidenceWithOriginalFile = async (
    evidence: Evidence,
    file: File
  ) => {
    try {
      const digest = await crypto.subtle.digest(
        "SHA-256",
        await file.arrayBuffer()
      );
      const recalculated = Array.from(new Uint8Array(digest), byte =>
        byte.toString(16).padStart(2, "0")
      ).join("");
      const matched = recalculated === evidence.file_hash;
      logAction(
        currentRole,
        matched ? "EVIDENCE_HASH_MATCHED" : "EVIDENCE_HASH_MISMATCH",
        `원본 재선택 검증: ${evidence.file_name}, 결과: ${matched ? "MATCH" : "MISMATCH"}`,
        matched ? "SUCCESS" : "FAIL"
      );
      showToast(
        matched
          ? "원본 파일의 SHA-256이 등록 해시와 일치합니다."
          : "경고: 선택한 파일의 SHA-256이 등록 해시와 일치하지 않습니다.",
        matched ? "success" : "warning"
      );
    } catch {
      showToast("원본 파일 재검증 중 오류가 발생했습니다.", "warning");
    }
  };

  // ==========================================
  // 6. Calculated States / Statistics
  // ==========================================

  // 통제번호 기준으로 중복을 제거해 2025 ISO 기반과 2026 현행화를 분리한다.
  const totalReqCount = initialRequirements.length;
  const validReqIds=new Set(initialRequirements.map(req=>req.req_id));
  const isoBaselineReqIds=new Set(isoControls.flatMap(control=>control.mapped_isms.map(item=>item.req_id)).filter(reqId=>validReqIds.has(reqId)));
  const currentVerifiedReqIds=new Set(evidences.filter(evidence=>evidence.verification_status==="검증완료"&&(evidence.source_type==="업로드"||evidence.created_at.includes("2026"))).map(evidence=>evidence.req_id).filter(reqId=>validReqIds.has(reqId)));
  const executingReqIds=new Set(tasks.filter(task=>task.evidence_files.length>0||task.checklists.some(item=>item.checked)||task.status==="승인대기").map(task=>task.req_id).filter(reqId=>validReqIds.has(reqId)));
  const pendingReqIds=new Set(tasks.filter(task=>task.status==="승인대기").map(task=>task.req_id).filter(reqId=>validReqIds.has(reqId)));
  const completedTaskCount = isoBaselineReqIds.size;
  const complianceRate = Math.round((completedTaskCount / totalReqCount) * 100);

  // 상태별 개수 집계
  const countOverdue = totalReqCount-currentVerifiedReqIds.size;
  const countInProgress = [...executingReqIds].filter(reqId=>!currentVerifiedReqIds.has(reqId)).length;
  const countPending = pendingReqIds.size;
  const countCompleted = currentVerifiedReqIds.size;

  // Filtered Requirements for Compliance Grid
  const filteredRequirements = initialRequirements.filter(req => {
    // 1. 대분류 필터
    if (filterCategory !== "all" && !req.category.includes(filterCategory))
      return false;

    // 연계된 Task 조회
    const linkedTask = tasks.find(t => t.req_id === req.req_id);

    // 2. 상태 필터
    if (filterStatus !== "all") {
      const statusMatch = linkedTask
        ? linkedTask.status === filterStatus
        : filterStatus === "미흡";
      if (!statusMatch) return false;
    }

    // 3. 텍스트 검색 (인증기준 번호, 지침명, Task명, 담당자 기준)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchId = req.req_id.toLowerCase().includes(query);
      const matchSubject = req.subject.toLowerCase().includes(query);
      const matchPolicy = req.policy_name.toLowerCase().includes(query);
      const matchTaskTitle = linkedTask
        ? linkedTask.title.toLowerCase().includes(query)
        : false;
      const matchAssignee = linkedTask
        ? linkedTask.assignee_name.toLowerCase().includes(query)
        : false;

      return (
        matchId ||
        matchSubject ||
        matchPolicy ||
        matchTaskTitle ||
        matchAssignee
      );
    }

    return true;
  });

  // VFS Files filter
  const vfsFiles = evidences.filter(ev => {
    const req = initialRequirements.find(r => r.req_id === ev.req_id);
    return req && req.category === vfsActiveFolder;
  });

  // ── SOA 기반 ISMS-P req_id별 운영현황 집계 ──
  // isoControls(170개)를 mapped_isms.req_id 기준으로 집계
  const soaMappedData = useMemo(() => {
    const map = new Map<
      string,
      {
        operations: string[];
        evidences: string[];
        policies: string[];
        isoIds: string[];
        status: string;
      }
    >();

    isoControls.forEach(ctrl => {
      ctrl.mapped_isms.forEach(({ req_id }) => {
        if (!map.has(req_id)) {
          map.set(req_id, {
            operations: [],
            evidences: [],
            policies: [],
            isoIds: [],
            status: ctrl.status,
          });
        }
        const entry = map.get(req_id)!;
        if (ctrl.operation && ctrl.operation.trim()) {
          const op = ctrl.operation.trim();
          if (!entry.operations.includes(op)) entry.operations.push(op);
        }
        if (ctrl.evidence && ctrl.evidence.trim()) {
          const evParts = ctrl.evidence.split(/\s*-\s+/).filter(Boolean);
          evParts.forEach(e => {
            const ev = e.trim();
            if (ev && !entry.evidences.includes(ev)) entry.evidences.push(ev);
          });
        }
        if (ctrl.policy && ctrl.policy.trim()) {
          const polParts = ctrl.policy.split(/\s*-\s+/).filter(Boolean);
          polParts.forEach(p => {
            const pol = p.trim().split("·")[0].trim();
            if (pol && !entry.policies.includes(pol)) entry.policies.push(pol);
          });
        }
        entry.isoIds.push(ctrl.iso_id);
        // 가장 낮은 적용 상태로 업데이트
        if (ctrl.status === "부분적용") entry.status = "부분적용";
      });
    });

    return map;
  }, []);

  const getMatrixYearStatus=useCallback((reqId:string)=>{
    const hasIsoBaseline=soaMappedData.has(reqId);
    if(matrixYear===2025)return hasIsoBaseline?{label:"ISO 27001 적합",tone:"completed",note:"2025 ISO 매핑 기준"}:{label:"ISMS 추가준비",tone:"pending",note:"ISO 직접대응 없음"};
    const linked=evidences.filter(evidence=>evidence.req_id===reqId&&evidence.verification_status!=="증적제외");
    const currentVerified=linked.filter(evidence=>evidence.verification_status==="검증완료"&&(evidence.source_type==="업로드"||evidence.created_at.includes("2026")));
    const yearTasks=tasks.filter(task=>task.req_id===reqId&&task.task_id.includes("AW-2026-"));
    const hasExecution=yearTasks.some(task=>task.evidence_files.length>0||task.checklists.some(item=>item.checked)||task.status==="완료"||task.status==="승인대기");
    if(currentVerified.length>0)return{label:"현행화 완료",tone:"completed",note:`2026 검증증적 ${currentVerified.length}건`};
    if(hasExecution)return{label:"현행화 진행중",tone:"in-progress",note:"2026 수행이력 존재"};
    return{label:"2026 현행화 필요",tone:"pending",note:hasIsoBaseline||linked.length>0?"2025 기준 재검토":"2026 증적 필요"};
  },[matrixYear,soaMappedData,evidences,tasks]);

  // ── SOA 운영현황 텍스트 빌더 ──
  const getSoaOperationText = (reqId: string): string => {
    const soa = soaMappedData.get(reqId);
    if (!soa || soa.operations.length === 0) return "";
    // 중복 문장 제거 후 합산
    const unique = [
      ...new Set(
        soa.operations.flatMap(op =>
          op
            .split(/ㅇ\s+/)
            .filter(Boolean)
            .map(s => s.trim())
        )
      ),
    ].filter(Boolean);
    return unique.map(s => `ㅇ ${s}`).join("\n");
  };

  const getSoaEvidenceList = (reqId: string): string[] => {
    const soa = soaMappedData.get(reqId);
    if (!soa) return [];
    return [...new Set(soa.evidences)].filter(Boolean).slice(0, 6);
  };

  const getSoaPolicyText = (reqId: string): string => {
    const soa = soaMappedData.get(reqId);
    if (!soa) return "";
    return [...new Set(soa.policies)].filter(Boolean).join(" / ");
  };

  const getSoaIsoIds = (reqId: string): string[] => {
    const soa = soaMappedData.get(reqId);
    if (!soa) return [];
    return [...new Set(soa.isoIds)].slice(0, 5);
  };

  // ── 소분류 레이블 매핑 (ISMS-P 표준) ──

  const SUBCAT_LABELS: Record<string, string> = {
    "1.1": "관리체계 기반 마련",
    "1.2": "위험 관리",
    "1.3": "관리체계 운영",
    "1.4": "관리체계 점검 및 개선",
    "2.1": "정책, 조직, 자산 관리",
    "2.2": "인적 보안",
    "2.3": "외부자 보안",
    "2.4": "물리 보안",
    "2.5": "인증 및 권한관리",
    "2.6": "접근 통제",
    "2.7": "암호화 적용",
    "2.8": "정보시스템 도입 및 개발 보안",
    "2.9": "시스템 및 서비스 운영관리",
    "2.10": "시스템 및 서비스 보안관리",
    "2.11": "사고 예방 및 대응",
    "2.12": "재해복구",
    "3.1": "개인정보 수집 시 보호조치",
    "3.2": "개인정보 보유 및 이용 시 보호조치",
    "3.3": "개인정보 제공 시 보호조치",
    "3.4": "개인정보 파기 시 보호조치",
    "3.5": "정보주체 관리보호",
  };

  const SUBCAT_EMOJI: Record<string, string> = {
    "1.1": "📋",
    "1.2": "⚠️",
    "1.3": "🔄",
    "1.4": "🔍",
    "2.1": "📁",
    "2.2": "👥",
    "2.3": "🤝",
    "2.4": "🏢",
    "2.5": "🔑",
    "2.6": "🚪",
    "2.7": "🔐",
    "2.8": "💻",
    "2.9": "⚙️",
    "2.10": "🛡️",
    "2.11": "🚨",
    "2.12": "♻️",
    "3.1": "📥",
    "3.2": "📦",
    "3.3": "📤",
    "3.4": "🗑️",
    "3.5": "👤",
  };

  // ── 소분류별 그룹핑 (filtered 기준) ──
  const subcatGroups = useMemo(() => {
    const map = new Map<
      string,
      { subcat: string; reqs: typeof initialRequirements }
    >();
    filteredRequirements.forEach(req => {
      const parts = req.req_id.split(".");
      const subcat = parts.slice(0, 2).join(".");
      if (!map.has(subcat)) map.set(subcat, { subcat, reqs: [] });
      map.get(subcat)!.reqs.push(req);
    });
    return Array.from(map.values());
  }, [filteredRequirements]);

  // ── 3영역 바 차트 통계 ──
  const domainChartStats = useMemo(() => {
    const DOMAINS = [
      "1. 관리체계 수립 및 운영",
      "2. 보호대책 요구사항",
      "3. 개인정보 처리단계별 요구사항",
    ];
    return DOMAINS.map((domain): DomainChartStat => {
      const reqs = initialRequirements.filter(r => r.category === domain);
      const stats = { 완료: 0, 승인대기: 0, 진행중: 0, 미흡: 0, 결과없음: 0 };
      reqs.forEach(r => {
        const yearStatus=getMatrixYearStatus(r.req_id);
        if(yearStatus.tone==="completed")stats.완료++;
        else if(yearStatus.tone==="in-progress")stats.진행중++;
        else stats.미흡++;
      });
      return { domain, reqs: reqs.length, stats };
    });
  }, [getMatrixYearStatus]);

  // ── To-Be / Guide 데이터 (SOA 운영현황 기반 또는 고정 가이드) ──
  const TOBE_MAP: Record<string, string> = {
    "1.1.1": "경영진 참여 보안위원회 월 1회 → 분기 1회 정례화",
    "1.1.2": "CISO/CPO 법적 요건 충족 여부 연 1회 재검토",
    "1.1.3": "보안 협의체 활동 내역 시스템 기록 전환",
    "1.2.3": "위험 평가 결과물 포털 내 직접 등록 자동화",
    "2.2.1": "주요 직무자 목록 분기 업데이트 → 시스템 자동 연동",
    "2.5.3": "권한 검토 결과를 본 포털에서 직접 결재 처리",
    "2.5.6": "접근권한 이력 자동 수집 및 이상징후 알람 고도화",
    "2.9.7": "로그 관리 현황 대시보드 시각화 개선",
  };

  const GUIDE_MAP: Record<string, string> = {
    "1.1.1": "정보보호 규정 제1조, 이사회 보고 체계 확인",
    "1.1.2": "CISO 지정·신고 의무(전자금융거래법 §21의2)",
    "1.1.3": "정보보호위원회 구성·운영 지침",
    "1.2.3": "위험 평가 방법론(KISA 가이드라인)",
    "2.5.1": "계정관리 절차서 §3, 최소권한 원칙",
    "2.5.3": "사용자 권한 검토 반기/분기 시행",
    "2.5.6": "접근권한 이력관리 정책 §5.2",
    "2.9.7": "로그 수집·보존 정책 6개월 이상",
  };

  // ── ISO 27001 필터링된 통제항목 ──
  const filteredIsoControls = useMemo(() => {
    return isoControls.filter(ctrl => {
      if (isoFilterDomain !== "all" && !ctrl.domain.includes(isoFilterDomain))
        return false;
      if (isoFilterStatus !== "all" && ctrl.status !== isoFilterStatus)
        return false;
      const linkedEvidence = evidences.filter(
        evidence =>
          evidence.verification_status !== "증적제외" &&
          evidence.iso_control_refs?.some(
            ref =>
              ref === ctrl.iso_id ||
              ref.endsWith(` ${ctrl.control_no}`) ||
              ref.endsWith(`.${ctrl.control_no}`)
          )
      );
      const hasActualEvidence = linkedEvidence.length > 0;
      const hasVerifiedEvidence = linkedEvidence.some(
        evidence => evidence.verification_status === "검증완료"
      );
      const hasPendingEvidence = linkedEvidence.some(
        evidence => evidence.verification_status === "팀장확인필요"
      );
      if (isoEvidenceFilter === "verified" && !hasVerifiedEvidence)
        return false;
      if (isoEvidenceFilter === "pending" && !hasPendingEvidence) return false;
      if (isoEvidenceFilter === "unlinked" && hasActualEvidence) return false;
      if (isoSearchQuery.trim()) {
        const q = isoSearchQuery.toLowerCase();
        return (
          ctrl.iso_id.toLowerCase().includes(q) ||
          ctrl.control_name.toLowerCase().includes(q) ||
          ctrl.check_item.toLowerCase().includes(q) ||
          ctrl.operation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [
    isoFilterDomain,
    isoFilterStatus,
    isoEvidenceFilter,
    isoSearchQuery,
    evidences,
  ]);

  // ISO 27001 도메인 목록
  const isoDomains = useMemo(() => {
    const s = new Set(isoControls.map(c => c.domain));
    return Array.from(s);
  }, []);

  const getActualEvidenceForIsoControl = (control: ISOControl) =>
    evidences.filter(
      evidence =>
        evidence.verification_status !== "증적제외" &&
        evidence.iso_control_refs?.some(
          ref =>
            ref === control.iso_id ||
            ref.endsWith(` ${control.control_no}`) ||
            ref.endsWith(`.${control.control_no}`)
        )
    );

  // ISO 27001:2022 Annex A 조직통제와 ISMS-P는 1:1이 아니므로 세부 요구 의미를 기준으로 교정한다.
  const organizationMappingCorrections=useMemo<Record<string,{req_id:string;subject:string;category:string}[]>>(()=>({
    "5.1":[{req_id:"1.1.5",subject:"정책 수립",category:"관리체계 기반 마련"},{req_id:"2.1.1",subject:"정책의 유지관리",category:"정책·조직·자산 관리"}],
    "5.2":[{req_id:"1.1.2",subject:"최고책임자의 지정",category:"관리체계 기반 마련"},{req_id:"1.1.3",subject:"조직 구성",category:"관리체계 기반 마련"}],
    "5.3":[{req_id:"2.2.2",subject:"직무 분리",category:"인적 보안"},{req_id:"1.1.3",subject:"조직 구성",category:"관리체계 기반 마련"}],
    "5.4":[{req_id:"1.1.1",subject:"경영진의 참여",category:"관리체계 기반 마련"},{req_id:"1.3.2",subject:"보호대책 공유",category:"관리체계 운영"}],
    "5.5":[{req_id:"1.4.1",subject:"법적 요구사항 준수 검토",category:"관리체계 점검 및 개선"},{req_id:"2.11.5",subject:"사고 대응 및 복구",category:"사고 예방 및 대응"}],
    "5.6":[{req_id:"1.4.1",subject:"법적 요구사항 준수 검토",category:"관리체계 점검 및 개선"},{req_id:"1.3.2",subject:"보호대책 공유",category:"관리체계 운영"}],
    "5.7":[{req_id:"1.2.3",subject:"위험 평가",category:"위험 관리"},{req_id:"2.11.2",subject:"취약점 점검 및 조치",category:"사고 예방 및 대응"}],
    "5.8":[{req_id:"2.8.1",subject:"보안 요구사항 정의",category:"시스템 및 서비스 보안관리"}],
    "5.9":[{req_id:"1.2.1",subject:"정보자산 식별",category:"위험 관리"},{req_id:"2.1.3",subject:"정보자산 관리",category:"정책·조직·자산 관리"}],
    "5.10":[{req_id:"2.1.3",subject:"정보자산 관리",category:"정책·조직·자산 관리"},{req_id:"2.7.1",subject:"암호정책 적용",category:"암호화 적용"}],
    "5.11":[{req_id:"2.2.5",subject:"퇴직 및 직무변경 관리",category:"인적 보안"},{req_id:"2.3.4",subject:"외부자 계약 변경 및 만료 시 보안",category:"외부자 보안"}],
    "5.12":[{req_id:"2.1.3",subject:"정보자산 관리",category:"정책·조직·자산 관리"}],
  }),[]);

  // Cross-mapping 테이블 데이터 (ISO control_no 기준 그룹핑)
  const mappingTableData = useMemo(() => {
    const map = new Map<
      string,
      {
        control_no: string;
        control_name: string;
        domain: string;
        iso_items: ISOControl[];
        isms_items: { req_id: string; subject: string; category: string }[];
        iso_status: string;
        confidence: string;
      }
    >();
    isoControls.forEach(c => {
      if (!map.has(c.control_no)) {
        map.set(c.control_no, {
          control_no: c.control_no,
          control_name: c.control_name,
          domain: c.domain,
          iso_items: [],
          isms_items: [],
          iso_status: c.status,
          confidence: c.mapping_confidence,
        });
      }
      const g = map.get(c.control_no)!;
      g.iso_items.push(c);
      // merge isms mappings (deduplicate)
      c.mapped_isms.forEach(m => {
        if (!g.isms_items.find(x => x.req_id === m.req_id))
          g.isms_items.push(m);
      });
    });
    map.forEach((group,controlNo)=>{const corrected=organizationMappingCorrections[controlNo];if(corrected)group.isms_items=corrected;});
    // Filter
    return Array.from(map.values()).filter(g => {
      if (isoMappingFilter === "mapped") return g.isms_items.length > 0;
      if (isoMappingFilter === "unmapped") return g.isms_items.length === 0;
      if (isoMappingFilter === "gap") return g.isms_items.length === 0;
      return true;
    });
  }, [isoMappingFilter, organizationMappingCorrections]);

  const downloadAnnualWorkExcel = () => {
    const controlRows: unknown[][] = [['통제ID','통제명','통제 요구내용','점검주기','연결 운영업무','담당자가 이 업무를 해야 하는 이유']];
    initialRequirements.forEach(requirement => {
      const works=operatingWorkMaster.filter(work=>work.isms.includes(requirement.req_id));
      controlRows.push([requirement.req_id,requirement.subject,requirement.detail_desc,requirement.compliance_cycle,works.map(work=>`${work.id} ${work.activity}`).join(' | ')||'운영업무 매핑 필요',works.length?`${requirement.subject} 통제의 요구사항을 충족하고 심사 시 이행 사실을 입증하기 위해 연결된 운영업무를 수행합니다.`:'연결 운영업무를 지정해야 합니다.']);
    });
    const wbsRows: unknown[][] = [['조회연도','업무ID','영역','업무명','수행주기','통제ID','통제명','통제 요구내용','업무 수행이유','전자금융·관련법','내부문서','금감원 점검','WBS ID','단계','세부작업','완료조건','필수산출물','R 수행','보안팀 담당자','A 최종책임','C 협의','I 보고']];
    annualWorkRows.forEach(({work}) => {
      const requirements=work.isms.map(reqId=>initialRequirements.find(requirement=>requirement.req_id===reqId)).filter((requirement): requirement is Requirement=>Boolean(requirement));
      const controlNames=requirements.map(requirement=>`${requirement.req_id} ${requirement.subject}`).join(' | ');
      const controlDetails=requirements.map(requirement=>`${requirement.req_id}: ${requirement.detail_desc}`).join(' | ');
      const reason=`${controlNames||work.isms.join(', ')}의 요구사항을 충족하고, ${work.activity}의 수행 결과를 증적으로 남기기 위해 수행합니다.`;
      getOperatingWorkWbs(work).forEach(item => wbsRows.push([
        annualTaskYear,work.id,work.domain,work.activity,work.cycle,work.isms.join(', '),requirements.map(requirement=>requirement.subject).join(' | '),controlDetails,reason,work.efr,work.internal.join(', '),work.fss.join(', '),item.id,item.phase,item.task,item.completionCriteria,item.requiredOutput,item.responsible,item.responsible.includes('정보보안팀')?getMoinSecurityAssignee(work):'해당 없음',item.accountable,item.consulted.join(' · '),item.informed.join(' · '),
      ]));
    });
    const scheduleRows: unknown[][] = [['조회연도','수행건ID','업무ID','업무명','수행기간','마감일','상태','주관부서','협업부서','검토부서','최종승인']];
    annualWorkRows.forEach(({work,occurrences}) => {
      const organization=getMoinWorkOrganization(work);
      occurrences.forEach(task=>scheduleRows.push([annualTaskYear,task.task_id,work.id,work.activity,task.title.match(/^\[([^\]]+)\]/)?.[1]||'',task.due_date,annualTaskYear===operatingYear?task.status:'계획',organization.ownerDepartment,organization.cooperatingDepartments.join(' · '),organization.reviewerDepartment,organization.approver]));
    });
    const updateRows: unknown[][] = [['업무ID','상태','마감일','주관부서','수행결과','업데이트 안내']];
    tasks.filter(task=>task.task_id.startsWith(`AW-${operatingYear}-`)).forEach(task=>updateRows.push([task.task_id,task.status,task.due_date,task.owner_department||task.assignee_name,task.description||'','마감일·주관부서·수행결과와 진행중/미흡 상태만 업데이트. 완료·승인대기는 포털 증적·결재 절차로만 변경']));
    const xml=spreadsheetWorkbook([{name:'통제 설명',rows:controlRows},{name:'통합 WBS 업무매핑',rows:wbsRows},{name:'연간수행현황',rows:scheduleRows},{name:'업데이트양식',rows:updateRows}]);
    const url=URL.createObjectURL(new Blob([xml],{type:'application/vnd.ms-excel;charset=utf-8'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download=`MOIN_정보보호_통합_WBS_${annualTaskYear}.xls`;anchor.click();URL.revokeObjectURL(url);
    showToast(`${annualTaskYear}년 통제 설명·운영업무·WBS 통합 Excel을 생성했습니다.`, 'success');
  };

  const importAnnualWorkExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file=event.target.files?.[0]; event.target.value=''; if(!file) return;
    const xml=await file.text();
    const documentXml=new DOMParser().parseFromString(xml,'application/xml');
    if(documentXml.querySelector('parsererror')) { showToast('다운로드한 Excel 호환 .xls 파일만 업데이트할 수 있습니다.','warning'); return; }
    const worksheets=Array.from(documentXml.getElementsByTagNameNS('*','Worksheet'));
    const sheet=worksheets.find(node=>(node.getAttribute('ss:Name')||node.getAttributeNS('urn:schemas-microsoft-com:office:spreadsheet','Name'))==='업데이트양식');
    if(!sheet){showToast('업데이트양식 시트를 찾을 수 없습니다.','warning');return;}
    const rows=Array.from(sheet.getElementsByTagNameNS('*','Row')).map(row=>Array.from(row.getElementsByTagNameNS('*','Cell')).map(cell=>cell.getElementsByTagNameNS('*','Data')[0]?.textContent?.trim()||''));
    const headers=rows[0]||[]; const index=(name:string)=>headers.indexOf(name);
    if(index('업무ID')<0){showToast('업무ID 열이 없어 업데이트할 수 없습니다.','warning');return;}
    const allowedStatuses=new Set(['완료','승인대기','진행중','미흡']);
    const allowedDepartments=['정보보안팀','DevOps','Platform팀','Data팀','HR','경영지원팀','법무팀','Compliance','서비스운영팀','CEO 직속'];
    const updates=new Map(rows.slice(1).filter(row=>row[index('업무ID')]?.startsWith(`AW-${operatingYear}-`)).map(row=>[row[index('업무ID')],row]));
    const validUpdates=new Map<string,string[]>(); let rejected=0;
    updates.forEach((row,taskId)=>{const status=row[index('상태')];const due=row[index('마감일')];const department=row[index('주관부서')];const existing=tasks.find(task=>task.task_id===taskId);const protectedTransition=(status==='완료'&&existing?.status!=='완료')||(status==='승인대기'&&existing?.status!=='승인대기');if((status&&!allowedStatuses.has(status))||(due&&!/^\d{4}-\d{2}-\d{2}$/.test(due))||(department&&!allowedDepartments.some(item=>department.startsWith(item)))||protectedTransition)rejected+=1;else validUpdates.set(taskId,row);});
    const updated=tasks.filter(task=>validUpdates.has(task.task_id)).length;
    setTasks(previous=>previous.map(task=>{
      const row=validUpdates.get(task.task_id); if(!row) return task;
      const status=row[index('상태')]; const due=row[index('마감일')]; const department=row[index('주관부서')]; const description=row[index('수행결과')];
      return {...task,status:(status||task.status) as SecurityTask['status'],due_date:due||task.due_date,assignee_name:department||task.assignee_name,owner_department:department||task.owner_department,description:description||task.description};
    }));
    logAction(currentRole,'IMPORT_ANNUAL_WORK_EXCEL',`운영업무 Excel 업데이트 ${updated}건, 제외 ${rejected}건`,'SUCCESS');
    showToast(`Excel 업데이트 ${updated}건 반영${rejected?`, 형식 오류 ${rejected}건 제외`:''}`,rejected?'warning':'success');
  };

  return (
    <div className="app-container">
      {/* ==========================================
          SIDEBAR SECTION
          ========================================== */}
      <AppSidebar
        activeTab={activeTab}
        framework={framework}
        currentRole={currentRole}
        complianceRate={complianceRate}
        countOverdue={countOverdue}
        countPending={countPending}
        auditLogCount={auditLogs.length}
        onNavigate={(tab, nextFramework) => {
          setActiveTab(tab);
          if (nextFramework) setFramework(nextFramework);
        }}
        onFrameworkChange={nextFramework => {
          setFramework(nextFramework);
          if (nextFramework === "ISO27001") setActiveTab("iso-soa");
          else if (activeTab === "iso-soa" || activeTab === "mapping")
            setActiveTab("dashboard");
        }}
        onRoleChange={handleRoleChange}
      />

      {/* ==========================================
          MAIN CONTENT AREA
          ========================================== */}
      <main className="main-content">
        <AppHeader
          activeTab={activeTab}
          framework={framework}
          systemTime={systemTime}
        />

        <div className="content-body">
          {/* ==========================================
              DASHBOARD TAB
              ========================================== */}
          {activeTab === "dashboard" && (
            <DashboardView
              tasks={tasks}
              evidences={evidences}
              complianceRate={complianceRate}
              completedTaskCount={completedTaskCount}
              totalRequirementCount={totalReqCount}
              overdueCount={countOverdue}
              pendingCount={countPending}
              inProgressCount={countInProgress}
              completedCount={countCompleted}
              onSelectStatus={status => {
                setActiveTab("matrix");
                setFilterStatus(status);
              }}
              onRunScheduler={triggerSchedulerSimulation}
              onSelectTask={taskId => {
                setSelectedTaskId(taskId);
                setActiveTab("tasks");
              }}
              onEscalate={() => triggerEscalation("TASK-2026-005")}
            />
          )}

          {activeTab === "organization" && (
            <SecurityOrganizationPage tasks={tasks} evidences={evidences} />
          )}
          {activeTab === "governance-evidence" && (
            <GovernanceEvidenceRepository
              tasks={tasks}
              evidences={evidences}
              currentRole={currentRole}
              onVerifyEvidence={verifyImportedEvidenceBySecurityLead}
              onExcludeEvidence={excludeImportedEvidenceBySecurityLead}
              onOpenTask={taskId => {
                setSelectedTaskId(taskId);
                setActiveTab("tasks");
              }}
            />
          )}

          {/* ==========================================
              COMPLIANCE MATRIX TAB — Notion-Style
              ========================================== */}
          {activeTab === "matrix" && (
            <div>
              {/* ── 상단 타이틀 + 뷰 토글 ── */}
              <MatrixToolbar
                resultCount={filteredRequirements.length}
                viewMode={matrixViewMode}
                onViewModeChange={setMatrixViewMode}
                onReset={() => {
                  setFilterCategory("all");
                  setFilterStatus("all");
                  setSearchQuery("");
                }}
              />

              <div className="matrix-year-bar"><div><strong>조회 기준연도</strong><span>연도별 인증 기준과 당해연도 현행화 상태를 분리합니다.</span></div><div>{([2025,2026] as const).map(year=><button key={year} className={matrixYear===year?"active":""} onClick={()=>setMatrixYear(year)}>{year}년 {year===2025?"ISO 27001 기준":"현행화"}</button>)}</div></div>

              {/* ── 영역별 바 차트 (노션 스크린샷 3번) ── */}
              <DomainStatusCharts domains={domainChartStats} />

              {/* ── 필터 바 ── */}
              <MatrixFilters
                totalCount={initialRequirements.length}
                category={filterCategory}
                status={filterStatus}
                searchQuery={searchQuery}
                viewMode={matrixViewMode}
                onCategoryChange={setFilterCategory}
                onStatusChange={setFilterStatus}
                onSearchChange={setSearchQuery}
                onExpandAll={() =>
                  setExpandedSubcats(
                    new Set(subcatGroups.map(group => group.subcat))
                  )
                }
                onCollapseAll={() => setExpandedSubcats(new Set())}
              />

              {/* ── 메인 매트릭스 ── */}
              {matrixViewMode === "accordion" ? (
                /* 소분류 아코디언 그룹 */
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {subcatGroups.map(({ subcat, reqs: groupReqs }) => {
                    const isOpen = expandedSubcats.has(subcat);
                    const groupCompleted = groupReqs.filter(
                      r => getMatrixYearStatus(r.req_id).tone==="completed"
                    ).length;
                    const groupTotal = groupReqs.length;
                    const pct = Math.round((groupCompleted / groupTotal) * 100);
                    const catLabel = groupReqs[0]?.category || "";
                    const catNum = catLabel.split(".")[0];
                    const CAT_COLORS: Record<string, string> = {
                      "1": "var(--color-warning)",
                      "2": "var(--color-info)",
                      "3": "var(--color-success)",
                    };
                    const catColor = CAT_COLORS[catNum] || "var(--text-muted)";

                    return (
                      <div
                        key={subcat}
                        style={{
                          border: "1px solid var(--border-color)",
                          borderRadius: "10px",
                          overflow: "hidden",
                          background: "var(--bg-card)",
                        }}
                      >
                        {/* 소분류 헤더 */}
                        <button
                          onClick={() => {
                            const next = new Set(expandedSubcats);
                            if (next.has(subcat)) next.delete(subcat);
                            else next.add(subcat);
                            setExpandedSubcats(next);
                          }}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            textAlign: "left",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "1rem",
                              transition: "transform 0.2s",
                              transform: isOpen
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                              display: "inline-block",
                              color: "var(--text-muted)",
                            }}
                          >
                            ▶
                          </span>
                          <span style={{ fontSize: "1.05rem" }}>
                            {SUBCAT_EMOJI[subcat] || "📌"}
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              color: "var(--text-primary)",
                            }}
                          >
                            {subcat} {SUBCAT_LABELS[subcat]}
                          </span>
                          <span
                            style={{
                              marginLeft: "4px",
                              fontSize: "0.8rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            ({groupTotal}개)
                          </span>
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: "0.78rem",
                              padding: "2px 10px",
                              borderRadius: "12px",
                              background: catColor + "22",
                              color: catColor,
                              border: `1px solid ${catColor}44`,
                              fontWeight: 600,
                            }}
                          >
                            {catLabel.replace(/^\d+\.\s/, "").substring(0, 14)}
                          </span>
                          {/* 진행률 바 */}
                          <div
                            style={{
                              width: "80px",
                              height: "6px",
                              background: "var(--bg-tertiary)",
                              borderRadius: "3px",
                              overflow: "hidden",
                              marginLeft: "8px",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background:
                                  pct === 100
                                    ? "var(--color-success)"
                                    : "var(--color-info)",
                                borderRadius: "3px",
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                              minWidth: "34px",
                              textAlign: "right",
                            }}
                          >
                            {pct}%
                          </span>
                        </button>

                        {/* 소분류 테이블 (expanded) */}
                        {isOpen && (
                          <div
                            style={{
                              borderTop: "1px solid var(--border-color)",
                            }}
                          >
                            {/* 컬럼 헤더 */}
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "90px 1fr 220px 200px 200px 120px",
                                gap: 0,
                                background: "var(--bg-tertiary)",
                                borderBottom: "1px solid var(--border-color)",
                                padding: "0",
                              }}
                            >
                              {[
                                "번호",
                                "요구사항 / 세부점검항목",
                                "현황 분석 결과",
                                "To-Be (개선목표)",
                                "증적 자료",
                                "상태",
                              ].map((col, i) => (
                                <div
                                  key={i}
                                  style={{
                                    padding: "8px 12px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                    borderRight:
                                      i < 5
                                        ? "1px solid var(--border-color)"
                                        : "none",
                                  }}
                                >
                                  {col}
                                </div>
                              ))}
                            </div>

                            {/* 행 목록 */}
                            {groupReqs.map(req => {
                              const task = tasks.find(
                                t => t.req_id === req.req_id
                              );
                              const yearStatus=getMatrixYearStatus(req.req_id);
                              const status = yearStatus.label;
                              const isRowExpanded =
                                expandedReqId === req.req_id;
                              const importedEvidence = evidences.find(
                                ev =>
                                  ev.req_id === req.req_id &&
                                  ev.verification_status !== "증적제외" &&
                                  (matrixYear===2025?ev.created_at.includes("2025")||ev.source_type==="기존 ISO 심사자료":ev.created_at.includes("2026")||ev.source_type==="업로드")
                              );
                              const latestEvidence =
                                task?.evidence_files?.[0] ||
                                (importedEvidence
                                  ? {
                                      file_name: importedEvidence.file_name,
                                      file_size: "원본 파일",
                                      file_hash: importedEvidence.file_hash,
                                      path: importedEvidence.file_path,
                                    }
                                  : null);
                              const tobe = TOBE_MAP[req.req_id] || "—";

                              // ── SOA 기반 데이터 ──
                              const soaOpText = getSoaOperationText(req.req_id);
                              const soaEvList = getSoaEvidenceList(req.req_id);
                              const soaPolText = getSoaPolicyText(req.req_id);
                              const soaIsoIds = getSoaIsoIds(req.req_id);
                              const hasSoa = soaMappedData.has(req.req_id);

                              // 운영현황: task description 우선 → SOA 집계 → 미입력
                              const opsDisplayText =
                                task?.description || soaOpText || "";
                              // 가이드: SOA 정책문서 우선 → GUIDE_MAP → req.policy_name
                              const guide =
                                soaPolText ||
                                GUIDE_MAP[req.req_id] ||
                                req.policy_name;

                              const STATUS_COLOR: Record<string, string> = {
                                완료: "var(--color-success)",
                                승인대기: "var(--color-warning)",
                                진행중: "var(--color-info)",
                                미흡: "var(--color-danger)",
                                "ISO 27001 적합":"var(--color-success)",
                                "ISMS 추가준비":"var(--color-warning)",
                                "현행화 완료":"var(--color-success)",
                                "현행화 진행중":"var(--color-info)",
                                "2026 현행화 필요":"var(--color-warning)",
                              };
                              const STATUS_BG: Record<string, string> = {
                                완료: "var(--color-success-bg)",
                                승인대기: "var(--color-warning-bg)",
                                진행중: "var(--color-info-bg)",
                                미흡: "var(--color-danger-bg)",
                                "ISO 27001 적합":"var(--color-success-bg)",
                                "ISMS 추가준비":"var(--color-warning-bg)",
                                "현행화 완료":"var(--color-success-bg)",
                                "현행화 진행중":"var(--color-info-bg)",
                                "2026 현행화 필요":"var(--color-warning-bg)",
                              };

                              return (
                                <div
                                  key={req.req_id}
                                  style={{
                                    borderBottom:
                                      "1px solid var(--border-subtle)",
                                  }}
                                >
                                  {/* 메인 행 */}
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns:
                                        "90px 1fr 220px 200px 200px 120px",
                                      alignItems: "start",
                                      cursor: "pointer",
                                      background: isRowExpanded
                                        ? "var(--bg-tertiary)"
                                        : "transparent",
                                      transition: "background 0.15s",
                                    }}
                                    onClick={() =>
                                      setExpandedReqId(
                                        isRowExpanded ? null : req.req_id
                                      )
                                    }
                                  >
                                    {/* 번호 */}
                                    <div
                                      style={{
                                        padding: "10px 12px",
                                        borderRight:
                                          "1px solid var(--border-subtle)",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontFamily:
                                            "JetBrains Mono, monospace",
                                          fontSize: "0.82rem",
                                          fontWeight: 700,
                                          color: "var(--color-info)",
                                        }}
                                      >
                                        {req.req_id}
                                      </span>
                                      <span
                                        style={{
                                          display: "block",
                                          fontSize: "0.65rem",
                                          color: "var(--text-muted)",
                                          marginTop: "2px",
                                        }}
                                      >
                                        {req.compliance_cycle}
                                      </span>
                                    </div>

                                    {/* 요구사항 */}
                                    <div
                                      style={{
                                        padding: "10px 12px",
                                        borderRight:
                                          "1px solid var(--border-subtle)",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontWeight: 600,
                                          fontSize: "0.85rem",
                                          color: "var(--text-primary)",
                                        }}
                                      >
                                        {req.subject}
                                      </span>
                                      <span
                                        style={{
                                          display: "block",
                                          fontSize: "0.75rem",
                                          color: "var(--text-muted)",
                                          marginTop: "3px",
                                          lineHeight: 1.5,
                                        }}
                                      >
                                        {req.detail_desc.length > 80
                                          ? req.detail_desc.substring(0, 80) +
                                            "…"
                                          : req.detail_desc}
                                      </span>
                                      {task && (
                                        <span
                                          style={{
                                            display: "inline-block",
                                            marginTop: "5px",
                                            fontSize: "0.7rem",
                                            color: "var(--text-muted)",
                                          }}
                                        >
                                          👤{" "}
                                          {task.assignee_name
                                            .split("(")[0]
                                            .trim()}
                                        </span>
                                      )}
                                    </div>

                                    {/* 현황 분석 결과 — SOA 기반 */}
                                    <div
                                      style={{
                                        padding: "10px 12px",
                                        borderRight:
                                          "1px solid var(--border-subtle)",
                                      }}
                                    >
                                      {opsDisplayText ? (
                                        <div>
                                          {task?.description ? (
                                            <p
                                              style={{
                                                fontSize: "0.78rem",
                                                lineHeight: 1.6,
                                                color: "var(--text-secondary)",
                                                margin: 0,
                                              }}
                                            >
                                              {task.description.length > 110
                                                ? task.description.substring(
                                                    0,
                                                    110
                                                  ) + "\u2026"
                                                : task.description}
                                            </p>
                                          ) : (
                                            <div
                                              style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "3px",
                                              }}
                                            >
                                              {opsDisplayText
                                                .split("\n")
                                                .slice(0, 3)
                                                .map((line, i) => (
                                                  <p
                                                    key={i}
                                                    style={{
                                                      fontSize: "0.77rem",
                                                      lineHeight: 1.55,
                                                      color:
                                                        "var(--text-secondary)",
                                                      margin: 0,
                                                    }}
                                                  >
                                                    {line}
                                                  </p>
                                                ))}
                                            </div>
                                          )}
                                          {hasSoa && !task?.description && (
                                            <span
                                              style={{
                                                display: "inline-block",
                                                marginTop: "5px",
                                                fontSize: "0.65rem",
                                                background:
                                                  "var(--color-success-bg)",
                                                color: "var(--color-success)",
                                                padding: "1px 6px",
                                                borderRadius: "4px",
                                                border:
                                                  "1px solid rgba(63,185,80,0.2)",
                                              }}
                                            >
                                              ISO SOA 기반
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span
                                          style={{
                                            fontSize: "0.78rem",
                                            color: "var(--color-danger)",
                                            fontStyle: "italic",
                                          }}
                                        >
                                          현황 미입력
                                        </span>
                                      )}
                                    </div>

                                    {/* To-Be */}
                                    <div
                                      style={{
                                        padding: "10px 12px",
                                        borderRight:
                                          "1px solid var(--border-subtle)",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: "0.78rem",
                                          color:
                                            tobe === "\u2014"
                                              ? "var(--text-muted)"
                                              : "var(--color-warning)",
                                          lineHeight: 1.5,
                                        }}
                                      >
                                        {tobe}
                                      </span>
                                    </div>

                                    {/* 증적 자료 — SOA 기반 */}
                                    <div
                                      style={{
                                        padding: "10px 12px",
                                        borderRight:
                                          "1px solid var(--border-subtle)",
                                      }}
                                    >
                                      {latestEvidence ? (
                                        <button
                                          style={{
                                            background: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            padding: 0,
                                          }}
                                          onClick={e => {
                                            e.stopPropagation();
                                            setLightboxFile({
                                              name: latestEvidence.file_name,
                                              size: latestEvidence.file_size,
                                              hash: latestEvidence.file_hash,
                                              path: latestEvidence.path,
                                              creator: task?.assignee_name,
                                              date: task?.completed_at,
                                            });
                                          }}
                                        >
                                          <span
                                            className="doc-link-item"
                                            style={{ fontSize: "0.78rem" }}
                                          >
                                            📄 {latestEvidence.file_name}
                                          </span>
                                          <span
                                            style={{
                                              display: "block",
                                              fontSize: "0.67rem",
                                              color: "var(--text-muted)",
                                              marginTop: "2px",
                                              fontFamily: "monospace",
                                            }}
                                          >
                                            {latestEvidence.file_hash.substring(
                                              0,
                                              12
                                            )}
                                            \u2026
                                          </span>
                                          <span
                                            className={`matrix-review-badge ${importedEvidence || task?.approval_path.find(node => node.role === "검토자")?.status === "approved" ? "approved" : "pending"}`}
                                          >
                                            {importedEvidence
                                              ? "✓ 기존 심사자료 검증"
                                              : task?.approval_path.find(
                                                    node =>
                                                      node.role === "검토자"
                                                  )?.status === "approved"
                                                ? "✓ 팀장 확인 완료"
                                                : "○ 팀장 확인 대기"}
                                          </span>
                                        </button>
                                      ) : soaEvList.length > 0 ? (
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "3px",
                                          }}
                                        >
                                          {soaEvList
                                            .slice(0, 3)
                                            .map((ev, i) => (
                                              <div
                                                key={i}
                                                style={{
                                                  display: "flex",
                                                  alignItems: "flex-start",
                                                  gap: "4px",
                                                  fontSize: "0.75rem",
                                                  color:
                                                    "var(--text-secondary)",
                                                }}
                                              >
                                                <span
                                                  style={{
                                                    color: "var(--color-info)",
                                                    marginTop: "1px",
                                                    flexShrink: 0,
                                                  }}
                                                >
                                                  📋
                                                </span>
                                                <span
                                                  style={{ lineHeight: 1.4 }}
                                                >
                                                  {ev}
                                                </span>
                                              </div>
                                            ))}
                                          <span
                                            style={{
                                              display: "inline-block",
                                              marginTop: "4px",
                                              fontSize: "0.65rem",
                                              background:
                                                "var(--color-info-bg)",
                                              color: "var(--color-info)",
                                              padding: "1px 6px",
                                              borderRadius: "4px",
                                            }}
                                          >
                                            SOA 명세
                                          </span>
                                        </div>
                                      ) : (
                                        <button
                                          className="action-btn"
                                          style={{
                                            fontSize: "0.72rem",
                                            padding: "3px 8px",
                                          }}
                                          onClick={e => {
                                            e.stopPropagation();
                                            setSelectedTaskId(
                                              task?.task_id || ""
                                            );
                                            setActiveTab("tasks");
                                          }}
                                        >
                                          + 증적 등록
                                        </button>
                                      )}
                                    </div>

                                    {/* 상태 */}
                                    <div
                                      style={{
                                        padding: "10px 12px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: "0.76rem",
                                          fontWeight: 700,
                                          padding: "3px 10px",
                                          borderRadius: "12px",
                                          background: STATUS_BG[status],
                                          color: STATUS_COLOR[status],
                                          border: `1px solid ${STATUS_COLOR[status]}44`,
                                        }}
                                      >
                                        {status}
                                      </span>
                                      <small style={{fontSize:".61rem",color:"var(--text-muted)",textAlign:"center"}}>{yearStatus.note}</small>
                                      {hasSoa && (
                                        <span
                                          style={{
                                            fontSize: "0.63rem",
                                            color: "var(--color-success)",
                                            background:
                                              "var(--color-success-bg)",
                                            padding: "1px 5px",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          ISO매핑 {soaIsoIds.length}건
                                        </span>
                                      )}
                                      {task && (
                                        <button
                                          className="action-btn"
                                          style={{
                                            fontSize: "0.7rem",
                                            padding: "2px 8px",
                                            width: "100%",
                                          }}
                                          onClick={e => {
                                            e.stopPropagation();
                                            setSelectedTaskId(task.task_id);
                                            setActiveTab("tasks");
                                          }}
                                        >
                                          상세
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* 확장 상세 패널 — SOA 전체 데이터 표시 */}
                                  {isRowExpanded && (
                                    <div
                                      style={{
                                        background: "var(--bg-secondary)",
                                        borderTop:
                                          "1px solid var(--border-subtle)",
                                        padding: "16px 20px",
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr 1fr",
                                        gap: "20px",
                                      }}
                                    >
                                      {/* 운영현황 (전문) */}
                                      <div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            marginBottom: "8px",
                                          }}
                                        >
                                          <p
                                            style={{
                                              fontSize: "0.72rem",
                                              fontWeight: 700,
                                              color: "var(--text-muted)",
                                              textTransform: "uppercase",
                                              letterSpacing: "0.06em",
                                              margin: 0,
                                            }}
                                          >
                                            📋 운영현황
                                          </p>
                                          {hasSoa && (
                                            <span
                                              style={{
                                                fontSize: "0.65rem",
                                                background:
                                                  "var(--color-success-bg)",
                                                color: "var(--color-success)",
                                                padding: "1px 6px",
                                                borderRadius: "4px",
                                                border:
                                                  "1px solid rgba(63,185,80,0.2)",
                                              }}
                                            >
                                              ISO 27001 SOA 기반
                                            </span>
                                          )}
                                        </div>
                                        {task?.description && (
                                          <div
                                            style={{
                                              background: "var(--bg-card)",
                                              border:
                                                "1px solid var(--border-color)",
                                              borderRadius: "6px",
                                              padding: "10px 12px",
                                              marginBottom: "8px",
                                            }}
                                          >
                                            <p
                                              style={{
                                                fontSize: "0.72rem",
                                                fontWeight: 700,
                                                color: "var(--color-info)",
                                                marginBottom: "4px",
                                              }}
                                            >
                                              실무 이행 내용
                                            </p>
                                            <p
                                              style={{
                                                fontSize: "0.8rem",
                                                lineHeight: 1.7,
                                                color: "var(--text-secondary)",
                                                margin: 0,
                                              }}
                                            >
                                              {task.description}
                                            </p>
                                          </div>
                                        )}
                                        {soaOpText && (
                                          <div>
                                            <p
                                              style={{
                                                fontSize: "0.72rem",
                                                fontWeight: 700,
                                                color: "var(--text-muted)",
                                                marginBottom: "5px",
                                              }}
                                            >
                                              ISO 27001 SOA 운영현황
                                            </p>
                                            <div
                                              style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "5px",
                                              }}
                                            >
                                              {soaOpText
                                                .split("\n")
                                                .map((line, i) => (
                                                  <p
                                                    key={i}
                                                    style={{
                                                      fontSize: "0.79rem",
                                                      lineHeight: 1.6,
                                                      color:
                                                        "var(--text-secondary)",
                                                      margin: 0,
                                                      paddingLeft: "4px",
                                                      borderLeft:
                                                        "2px solid var(--color-info)",
                                                    }}
                                                  >
                                                    {line}
                                                  </p>
                                                ))}
                                            </div>
                                          </div>
                                        )}
                                        {task?.checklists &&
                                          task.checklists.length > 0 && (
                                            <div
                                              style={{
                                                marginTop: "10px",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "4px",
                                              }}
                                            >
                                              <p
                                                style={{
                                                  fontSize: "0.72rem",
                                                  fontWeight: 700,
                                                  color: "var(--text-muted)",
                                                  marginBottom: "4px",
                                                }}
                                              >
                                                이행 체크리스트
                                              </p>
                                              {task.checklists.map((cl, i) => (
                                                <div
                                                  key={i}
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    fontSize: "0.78rem",
                                                    color: cl.checked
                                                      ? "var(--color-success)"
                                                      : "var(--text-muted)",
                                                  }}
                                                >
                                                  <span>
                                                    {cl.checked ? "✅" : "⬜"}
                                                  </span>
                                                  <span>{cl.text}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        {!task?.description && !soaOpText && (
                                          <p
                                            style={{
                                              fontSize: "0.8rem",
                                              color: "var(--color-danger)",
                                              fontStyle: "italic",
                                              margin: 0,
                                            }}
                                          >
                                            ⚠️ 운영 이력 미등록
                                          </p>
                                        )}
                                      </div>

                                      {/* 기록(증적) — SOA 명세 + 실무 파일 */}
                                      <div>
                                        <p
                                          style={{
                                            fontSize: "0.72rem",
                                            fontWeight: 700,
                                            color: "var(--text-muted)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                            marginBottom: "8px",
                                          }}
                                        >
                                          🗂 기록(증적)
                                        </p>
                                        {soaEvList.length > 0 && (
                                          <div
                                            style={{
                                              background: "var(--bg-card)",
                                              border:
                                                "1px solid var(--border-color)",
                                              borderRadius: "6px",
                                              padding: "10px 12px",
                                              marginBottom: "8px",
                                            }}
                                          >
                                            <p
                                              style={{
                                                fontSize: "0.72rem",
                                                fontWeight: 700,
                                                color: "var(--color-info)",
                                                marginBottom: "6px",
                                              }}
                                            >
                                              SOA 증적 명세
                                            </p>
                                            <div
                                              style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "4px",
                                              }}
                                            >
                                              {soaEvList.map((ev, i) => (
                                                <div
                                                  key={i}
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: "5px",
                                                    fontSize: "0.78rem",
                                                    color:
                                                      "var(--text-secondary)",
                                                  }}
                                                >
                                                  <span
                                                    style={{
                                                      color:
                                                        "var(--color-success)",
                                                      flexShrink: 0,
                                                      marginTop: "1px",
                                                    }}
                                                  >
                                                    ▸
                                                  </span>
                                                  <span
                                                    style={{ lineHeight: 1.5 }}
                                                  >
                                                    {ev}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {task?.evidence_files &&
                                        task.evidence_files.length > 0 ? (
                                          <div
                                            style={{
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: "8px",
                                            }}
                                          >
                                            <p
                                              style={{
                                                fontSize: "0.72rem",
                                                fontWeight: 700,
                                                color: "var(--text-muted)",
                                                marginBottom: "2px",
                                              }}
                                            >
                                              등록된 증적 파일
                                            </p>
                                            {task.evidence_files.map(
                                              (ef, i) => (
                                                <button
                                                  key={i}
                                                  style={{
                                                    background:
                                                      "var(--bg-card)",
                                                    border:
                                                      "1px solid var(--border-color)",
                                                    borderRadius: "6px",
                                                    padding: "8px 12px",
                                                    cursor: "pointer",
                                                    textAlign: "left",
                                                  }}
                                                  onClick={() =>
                                                    setLightboxFile({
                                                      name: ef.file_name,
                                                      size: ef.file_size,
                                                      hash: ef.file_hash,
                                                      path: ef.path,
                                                      creator:
                                                        task.assignee_name,
                                                      date: task.completed_at,
                                                    })
                                                  }
                                                >
                                                  <span
                                                    style={{
                                                      fontSize: "0.8rem",
                                                      fontWeight: 600,
                                                    }}
                                                  >
                                                    📄 {ef.file_name}
                                                  </span>
                                                  <span
                                                    style={{
                                                      display: "block",
                                                      fontSize: "0.68rem",
                                                      color:
                                                        "var(--text-muted)",
                                                      marginTop: "2px",
                                                      fontFamily: "monospace",
                                                    }}
                                                  >
                                                    Hash:{" "}
                                                    {ef.file_hash.substring(
                                                      0,
                                                      20
                                                    )}
                                                    \u2026
                                                  </span>
                                                  <span
                                                    style={{
                                                      display: "block",
                                                      fontSize: "0.68rem",
                                                      color:
                                                        "var(--text-muted)",
                                                      marginTop: "1px",
                                                    }}
                                                  >
                                                    {ef.file_size} ·{" "}
                                                    {task.completed_at}
                                                  </span>
                                                </button>
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <div
                                            style={{
                                              background: "var(--bg-card)",
                                              border:
                                                "1px dashed var(--border-color)",
                                              borderRadius: "6px",
                                              padding: "12px",
                                              textAlign: "center",
                                            }}
                                          >
                                            <p
                                              style={{
                                                fontSize: "0.8rem",
                                                color: "var(--text-muted)",
                                                margin: 0,
                                              }}
                                            >
                                              실무 증적 파일 미등록
                                            </p>
                                            <button
                                              className="action-btn"
                                              style={{
                                                marginTop: "8px",
                                                fontSize: "0.75rem",
                                              }}
                                              onClick={() => {
                                                setSelectedTaskId(
                                                  task?.task_id || ""
                                                );
                                                setActiveTab("tasks");
                                              }}
                                            >
                                              업무탭에서 등록 →
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      {/* 관련문서 + ISO 연계 + 가이드 */}
                                      <div>
                                        <p
                                          style={{
                                            fontSize: "0.72rem",
                                            fontWeight: 700,
                                            color: "var(--text-muted)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                            marginBottom: "8px",
                                          }}
                                        >
                                          📂 관련문서 / ISO 연계
                                        </p>
                                        <button
                                          style={{
                                            background: "var(--bg-card)",
                                            border:
                                              "1px solid var(--border-color)",
                                            borderRadius: "6px",
                                            padding: "8px 12px",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            width: "100%",
                                            marginBottom: "8px",
                                          }}
                                          onClick={() => {
                                            const pol = initialPolicies.find(
                                              p => p.policy_id === req.policy_id
                                            );
                                            if (pol) setSelectedPolicy(pol);
                                          }}
                                        >
                                          <p
                                            style={{
                                              fontSize: "0.72rem",
                                              color: "var(--text-muted)",
                                              margin: "0 0 2px",
                                            }}
                                          >
                                            사내 규정/지침
                                          </p>
                                          <span
                                            style={{
                                              fontSize: "0.8rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            <FileCode
                                              size={13}
                                              style={{
                                                verticalAlign: "middle",
                                                marginRight: "4px",
                                              }}
                                            />
                                            {req.policy_name}
                                          </span>
                                        </button>
                                        {guide && (
                                          <div
                                            style={{
                                              background: "var(--bg-card)",
                                              border:
                                                "1px solid var(--border-color)",
                                              borderRadius: "6px",
                                              padding: "8px 12px",
                                              marginBottom: "8px",
                                            }}
                                          >
                                            <p
                                              style={{
                                                fontSize: "0.72rem",
                                                fontWeight: 700,
                                                color: "var(--text-muted)",
                                                marginBottom: "4px",
                                              }}
                                            >
                                              SOA 관련문서
                                            </p>
                                            <p
                                              style={{
                                                fontSize: "0.78rem",
                                                color: "var(--text-secondary)",
                                                margin: 0,
                                                lineHeight: 1.6,
                                              }}
                                            >
                                              {guide}
                                            </p>
                                          </div>
                                        )}
                                        {soaIsoIds.length > 0 && (
                                          <div
                                            style={{
                                              background:
                                                "var(--color-info-bg)",
                                              border:
                                                "1px solid rgba(47,129,247,0.2)",
                                              borderRadius: "6px",
                                              padding: "8px 12px",
                                              marginBottom: "8px",
                                            }}
                                          >
                                            <p
                                              style={{
                                                fontSize: "0.72rem",
                                                fontWeight: 700,
                                                color: "var(--color-info)",
                                                marginBottom: "5px",
                                              }}
                                            >
                                              🔗 ISO 27001 연계 항목
                                            </p>
                                            <div
                                              style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: "4px",
                                              }}
                                            >
                                              {soaIsoIds.map(id => (
                                                <span
                                                  key={id}
                                                  style={{
                                                    fontSize: "0.72rem",
                                                    background:
                                                      "rgba(47,129,247,0.15)",
                                                    color: "var(--color-info)",
                                                    padding: "2px 7px",
                                                    borderRadius: "4px",
                                                    fontFamily: "monospace",
                                                    fontWeight: 600,
                                                  }}
                                                >
                                                  {id}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        <div
                                          style={{
                                            background:
                                              "var(--color-warning-bg)",
                                            border:
                                              "1px solid rgba(210,153,34,0.2)",
                                            borderRadius: "6px",
                                            padding: "8px 12px",
                                          }}
                                        >
                                          <p
                                            style={{
                                              fontSize: "0.72rem",
                                              fontWeight: 700,
                                              color: "var(--color-warning)",
                                              marginBottom: "4px",
                                            }}
                                          >
                                            🎯 To-Be
                                          </p>
                                          <p
                                            style={{
                                              fontSize: "0.78rem",
                                              color: "var(--text-secondary)",
                                              margin: 0,
                                              lineHeight: 1.6,
                                            }}
                                          >
                                            {tobe}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Flat 테이블 뷰 */
                <div className="table-container">
                  <table className="compliance-table">
                    <thead>
                      <tr>
                        <th style={{ width: "90px" }}>번호</th>
                        <th style={{ width: "140px" }}>점검항목 / 주기</th>
                        <th>운영현황</th>
                        <th style={{ width: "200px" }}>기록(증적)</th>
                        <th style={{ width: "190px" }}>관련문서(정책/지침)</th>
                        <th style={{ width: "85px" }}>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequirements.length > 0 ? (
                        filteredRequirements.map(req => {
                          const task = tasks.find(t => t.req_id === req.req_id);
                          const yearStatus=getMatrixYearStatus(req.req_id);
                          const status = yearStatus.label;
                          const importedEvidence = evidences.find(
                            ev =>
                              ev.req_id === req.req_id &&
                              ev.verification_status !== "증적제외" &&
                              (matrixYear===2025?ev.created_at.includes("2025")||ev.source_type==="기존 ISO 심사자료":ev.created_at.includes("2026")||ev.source_type==="업로드")
                          );
                          const latestEvidence =
                            task?.evidence_files?.[0] ||
                            (importedEvidence
                              ? {
                                  file_name: importedEvidence.file_name,
                                  file_size: "원본 파일",
                                  file_hash: importedEvidence.file_hash,
                                  path: importedEvidence.file_path,
                                }
                              : null);
                          const opsText =
                            task?.description || "운영 이력 미등록";
                          let borderClass = "row-border-overdue";
                          if (status === "ISO 27001 적합"||status === "현행화 완료")
                            borderClass = "row-border-completed";
                          else if (status === "ISMS 추가준비"||status === "2026 현행화 필요")
                            borderClass = "row-border-pending";
                          else if (status === "현행화 진행중")
                            borderClass = "row-border-in-progress";
                          return (
                            <tr key={req.req_id} className={borderClass}>
                              <td
                                style={{
                                  verticalAlign: "top",
                                  paddingTop: "12px",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontFamily: "monospace",
                                    fontSize: "0.83rem",
                                    color: "var(--color-info)",
                                  }}
                                >
                                  {req.req_id}
                                </span>
                              </td>
                              <td
                                style={{
                                  verticalAlign: "top",
                                  paddingTop: "12px",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                    display: "block",
                                  }}
                                >
                                  {req.subject}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    color: "var(--text-muted)",
                                    display: "inline-block",
                                    marginTop: "4px",
                                    padding: "1px 6px",
                                    background: "var(--bg-tertiary)",
                                    borderRadius: "4px",
                                    border: "1px solid var(--border-color)",
                                  }}
                                >
                                  📅 {req.compliance_cycle}
                                </span>
                                {task && (
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: "0.7rem",
                                      color: "var(--text-muted)",
                                      marginTop: "3px",
                                    }}
                                  >
                                    👤 {task.assignee_name.split("(")[0].trim()}
                                  </span>
                                )}
                              </td>
                              <td
                                style={{
                                  verticalAlign: "top",
                                  paddingTop: "12px",
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: "0.8rem",
                                    lineHeight: 1.6,
                                    color: "var(--text-secondary)",
                                    margin: 0,
                                  }}
                                >
                                  {opsText.length > 150
                                    ? opsText.substring(0, 150) + "…"
                                    : opsText}
                                </p>
                                {task?.checklists &&
                                  task.checklists.slice(0, 2).map((cl, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        fontSize: "0.73rem",
                                        color: cl.checked
                                          ? "var(--color-success)"
                                          : "var(--text-muted)",
                                        marginTop: "3px",
                                      }}
                                    >
                                      {cl.checked ? "✅" : "○"} {cl.text}
                                    </div>
                                  ))}
                              </td>
                              <td
                                style={{
                                  verticalAlign: "top",
                                  paddingTop: "12px",
                                }}
                              >
                                {latestEvidence ? (
                                  <div>
                                    <button
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                      }}
                                      onClick={() =>
                                        setLightboxFile({
                                          name: latestEvidence.file_name,
                                          size: latestEvidence.file_size,
                                          hash: latestEvidence.file_hash,
                                          path: latestEvidence.path,
                                          creator: task?.assignee_name,
                                          date: task?.completed_at,
                                        })
                                      }
                                    >
                                      <span
                                        className="doc-link-item"
                                        style={{ fontSize: "0.78rem" }}
                                      >
                                        📄 {latestEvidence.file_name}
                                      </span>
                                    </button>
                                    <span
                                      style={{
                                        display: "block",
                                        fontSize: "0.68rem",
                                        color: "var(--text-muted)",
                                        marginTop: "2px",
                                        fontFamily: "monospace",
                                      }}
                                    >
                                      {latestEvidence.file_hash.substring(
                                        0,
                                        14
                                      )}
                                      …
                                    </span>
                                    {task?.completed_at && (
                                      <span
                                        style={{
                                          display: "block",
                                          fontSize: "0.68rem",
                                          color: "var(--text-muted)",
                                          marginTop: "1px",
                                        }}
                                      >
                                        📅 {task.completed_at}
                                      </span>
                                    )}
                                    <span
                                      className={`matrix-review-badge ${importedEvidence || task?.approval_path.find(node => node.role === "검토자")?.status === "approved" ? "approved" : "pending"}`}
                                    >
                                      {importedEvidence
                                        ? "✓ 기존 심사자료 검증"
                                        : task?.approval_path.find(
                                              node => node.role === "검토자"
                                            )?.status === "approved"
                                          ? "✓ 팀장 확인 완료"
                                          : "○ 팀장 확인 대기"}
                                    </span>
                                  </div>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: "0.78rem",
                                      color: "var(--text-muted)",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    - (증적 미등록)
                                  </span>
                                )}
                              </td>
                              <td
                                style={{
                                  verticalAlign: "top",
                                  paddingTop: "12px",
                                }}
                              >
                                <button
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: 0,
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    const pol = initialPolicies.find(
                                      p => p.policy_id === req.policy_id
                                    );
                                    if (pol) setSelectedPolicy(pol);
                                  }}
                                >
                                  <span
                                    className="doc-link-item"
                                    style={{ fontSize: "0.78rem" }}
                                  >
                                    <FileCode size={13} /> {req.policy_name}
                                  </span>
                                </button>
                              </td>
                              <td
                                style={{
                                  verticalAlign: "top",
                                  paddingTop: "12px",
                                  textAlign: "center",
                                }}
                              >
                                <span
                                  className={`status-badge ${yearStatus.tone}`}
                                >
                                  {status}
                                </span>
                                <small style={{display:"block",marginTop:"4px",color:"var(--text-muted)"}}>{yearStatus.note}</small>
                                {task && (
                                  <button
                                    className="action-btn"
                                    style={{
                                      marginTop: "5px",
                                      display: "block",
                                      width: "100%",
                                      fontSize: "0.7rem",
                                      padding: "2px 6px",
                                    }}
                                    onClick={() => {
                                      setSelectedTaskId(task.task_id);
                                      setActiveTab("tasks");
                                    }}
                                  >
                                    상세
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              textAlign: "center",
                              padding: "40px",
                              color: "var(--text-muted)",
                            }}
                          >
                            검색 조건에 맞는 항목이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TASK SUBMISSION WORKSPACE TAB (4.2 Split Pane)
              ========================================== */}
          {activeTab === "tasks" && (
            <div>
              <section
                className="metadata-panel"
                style={{ marginBottom: "18px" }}
              >
                <div className="card-header-row">
                  <div>
                    <h3 className="card-title">
                      <FileSpreadsheet size={18} /> 연도별 정보보호 운영계획·WBS
                    </h3>
                    <p className="section-subtitle">
                      반복 운영업무를 WBS 작업패키지와 부서 책임으로 분해하고 연도별 일정·수행상태를 관리합니다.
                    </p>
                  </div>
                  <div className="annual-excel-actions"><strong>{annualWorkRows.length}개 업무유형 · WBS {annualWorkRows.reduce((sum,row)=>sum+getOperatingWorkWbs(row.work).length,0)}개 · 연간 수행 {annualWorkRows.reduce((sum,row)=>sum+row.occurrences.length,0)}건</strong><div><button type="button" onClick={downloadAnnualWorkExcel}><FileSpreadsheet size={14}/>통합 WBS Excel</button><button type="button" onClick={()=>document.getElementById('annual-work-excel-upload')?.click()}><UploadCloud size={14}/>Excel 업데이트</button><input id="annual-work-excel-upload" type="file" accept=".xls,application/vnd.ms-excel" hidden onChange={importAnnualWorkExcel}/></div></div>
                </div>
                <div className="annual-basis-summary"><div><span>전체 업무유형</span><strong>{operatingWorkWbsSummary(operatingWorkMaster).workTypes}개</strong></div><div><span>세부 WBS</span><strong>{operatingWorkWbsSummary(operatingWorkMaster).packages}개 작업패키지</strong></div><div><span>ISMS-P</span><strong>{operatingWorkSummary.ismsCovered}개 통제 연결</strong></div><div><span>내부 규정·지침</span><strong>{operatingWorkSummary.internalCovered}개 문서군</strong></div><div><span>금감원·전자금융</span><strong>업무 근거 연계</strong></div></div>
                <div className="annual-selection-guide">
                  <div><strong>업무 선택 방법</strong><span>① 업무유형을 펼쳐 WBS를 확인하고 ② 월·분기·연간 수행 건을 선택한 뒤 ③ ‘수행·결재 화면 열기’를 누르세요. 선택만으로 화면이 이동하지 않습니다.</span></div>
                  {annualTaskYear===operatingYear&&selectedTaskId && <button type="button" onClick={()=>{setShowTaskDetail(true);setTimeout(()=>document.getElementById('task-workspace-detail')?.scrollIntoView({behavior:'smooth',block:'start'}),0)}}>선택 업무 상세로 이동</button>}
                </div>
                <section className="annual-query-panel" aria-label="운영업무 조회 조건">
                  <div className="annual-query-heading"><div><strong>조회 조건</strong><span>연도·보안영역·담당부서·검색어를 조합해 운영업무를 조회합니다.</span></div><button type="button" onClick={()=>{setAnnualTaskYear(operatingYear);setAnnualTaskDomain('all');setAnnualTaskDepartment('all');setAnnualTaskQuery('');setShowTaskDetail(false)}}>조건 초기화</button></div>
                  <div className="annual-query-fields">
                    <div className="annual-query-field year"><label>연도</label><div>{[2025,2026,2027].map(year=><button type="button" key={year} className={annualTaskYear===year?'active':''} onClick={()=>{setAnnualTaskYear(year);setShowTaskDetail(false)}}>{year}년{year===operatingYear?' · 현행':''}</button>)}</div></div>
                    <label className="annual-query-field"><span>보안영역</span><select className="form-input" value={annualTaskDomain} onChange={event => setAnnualTaskDomain(event.target.value)}><option value="all">전체</option>{Array.from(new Set(operatingWorkMaster.map(work => work.domain))).map(domain => <option key={domain}>{domain}</option>)}</select></label>
                    <label className="annual-query-field"><span>담당부서</span><select className="form-input" value={annualTaskDepartment} onChange={event=>setAnnualTaskDepartment(event.target.value)}><option value="all">전체</option>{['정보보안팀','DevOps','Platform팀','Data팀','HR','경영지원팀','법무팀','Compliance','서비스운영팀','CEO 직속'].map(department=><option key={department}>{department}</option>)}</select></label>
                    <label className="annual-query-field search"><span>검색어</span><div><Search size={15}/><input value={annualTaskQuery} onChange={event=>setAnnualTaskQuery(event.target.value)} placeholder="업무명, 담당부서, 산출물, 규정·지침"/></div></label>
                  </div>
                </section>
                {annualTaskYear!==operatingYear&&<div className="annual-year-notice">{annualTaskYear===2025?'2025년 실제 수행 여부는 ISO 27001 심사 증적과 통합 증적 보관소에서 확인합니다. 이 화면에서는 반복주기에 따른 일정 기준만 제공합니다.':'2027년은 계획 조회입니다. 담당부서와 반복주기를 미리 확인할 수 있으며 수행·결재는 해당 연도 운영계획 확정 후 활성화합니다.'}</div>}
                <div className="annual-work-list">
                  {annualWorkRows.map(({work,occurrences},workIndex)=><details className="annual-work-item" key={work.id} open={workIndex===0 ? true : undefined}>
                    <summary>
                      <span className="annual-work-id">{work.id}</span>
                      <div className="annual-work-title"><strong>{work.activity}</strong><small>{work.domain} · {work.owner}</small></div>
                      <span className="annual-work-cycle">{work.cycle}</span>
                      <span className="annual-work-count">연 {occurrences.length}건</span>
                      <div className="annual-work-progress"><span>{annualTaskYear===operatingYear?`${occurrences.filter(task=>task.status==='완료').length}/${occurrences.length} 완료`:`${occurrences.length}건 계획`}</span><i><b style={{width:annualTaskYear===operatingYear?`${occurrences.length?occurrences.filter(task=>task.status==='완료').length/occurrences.length*100:0}%`:'0%'}}/></i></div>
                      <span className="annual-expand-hint">클릭하여 수행 건 선택</span>
                    </summary>
                    <div className="annual-work-detail">
                      <div className="annual-work-meta"><span><b>필수 산출물</b>{work.outputs.join(' · ')}</span><span><b>업무 근거 매핑</b>{getOperatingWorkBasis(work).map(basis=><small key={basis}>{basis}</small>)}</span><span><b>통제 요구와 수행 이유</b>{work.isms.map(reqId=>initialRequirements.find(requirement=>requirement.req_id===reqId)).filter((requirement): requirement is Requirement=>Boolean(requirement)).map(requirement=><small key={requirement.req_id}><strong>{requirement.req_id} · {requirement.subject}</strong> — {requirement.detail_desc}</small>)}<small>위 통제 요구사항을 충족하고 심사 시 실제 이행 결과를 증적으로 제시하기 위해 이 업무와 WBS를 수행합니다.</small></span></div>
                      <div className="wbs-heading"><div><b>Work Breakdown Structure</b><span>{getOperatingWorkWbs(work).length}개 작업패키지 · 각 작업의 완료조건과 조직 책임을 기준으로 수행</span></div><div className="raci-legend"><span>R 수행</span><span>A 최종책임</span><span>C 협의</span><span>I 보고</span></div></div>
                      <div className="wbs-table-wrap"><table className="wbs-table"><thead><tr><th>WBS</th><th>단계</th><th>세부 작업</th><th>완료조건</th><th>필수 산출물</th><th>R 수행부서</th><th>보안팀 담당자</th><th>A 최종책임</th><th>C 협의</th><th>I 보고</th></tr></thead><tbody>{getOperatingWorkWbs(work).map(item=><tr key={item.id}><td>{item.id}</td><td><span className={`wbs-phase phase-${item.phase}`}>{item.phase}</span></td><td><strong>{item.task}</strong></td><td>{item.completionCriteria}</td><td>{item.requiredOutput}</td><td>{item.responsible}</td><td>{item.responsible.includes('정보보안팀')?getMoinSecurityAssignee(work):'—'}</td><td>{item.accountable}</td><td>{item.consulted.join(' · ')||'—'}</td><td>{item.informed.join(' · ')||'—'}</td></tr>)}</tbody></table></div>
                      <h4 className="annual-occurrence-title">{annualTaskYear}년 {annualTaskYear===operatingYear?'실제 수행 건 선택':'반복 일정 계획'}</h4>
                      <div className="annual-occurrence-grid">{occurrences.map(task=><button key={task.task_id} disabled={annualTaskYear!==operatingYear} className={selectedTaskId===task.task_id?'selected':''} onClick={()=>{setSelectedTaskId(task.task_id);setTempDroppedFiles([]);setShowTaskDetail(true)}}><strong>{task.title.match(/^\[([^\]]+)\]/)?.[1]||'수시'}</strong><small>{task.due_date}</small>{annualTaskYear===operatingYear?<span className={`status-badge ${task.status==='완료'?'completed':task.status==='승인대기'?'pending':task.status==='진행중'?'in-progress':'overdue'}`}>{task.status}</span>:<span className="status-badge planned">계획</span>}<em>{annualTaskYear===operatingYear?(selectedTaskId===task.task_id?'선택됨':'수행 건 선택'):'일정 기준'}</em></button>)}</div>
                      {annualTaskYear===operatingYear&&occurrences.some(task=>task.task_id===selectedTaskId)&&<div className="selected-occurrence-action"><div><strong>{occurrences.find(task=>task.task_id===selectedTaskId)?.title}</strong><span>수행 건을 선택했습니다. WBS를 계속 확인하거나 아래 버튼을 눌러 수행·증적·결재 화면을 여세요.</span></div><button type="button" onClick={()=>document.getElementById('task-workspace-detail')?.scrollIntoView({behavior:'smooth',block:'start'})}>수행·결재 화면 열기</button></div>}
                    </div>
                  </details>)}
                </div>
              </section>

              {/* Split Pane Layout */}
              {showTaskDetail && (() => {
                const currentTask = tasks.find(
                  t => t.task_id === selectedTaskId
                );
                if (!currentTask)
                  return <div>선택된 태스크가 존재하지 않습니다.</div>;
                const req = initialRequirements.find(
                  r => r.req_id === currentTask.req_id
                );

                return (
                  <div className="split-pane-layout" id="task-workspace-detail">
                    {/* 좌측 패널 (Metadata, Guide, SOP) */}
                    <div className="split-pane-left">
                      <div className="metadata-panel">
                        <h3 className="card-title">
                          <FileText size={18} />
                          업무 기본 정보 & 가이드라인
                        </h3>

                        <div className="meta-field-group">
                          <div>
                            <span className="meta-label">태스크 명칭</span>
                            <div
                              className="meta-value"
                              style={{ color: "var(--color-info)" }}
                            >
                              {currentTask.title}
                            </div>
                          </div>
                          <div>
                            <span className="meta-label">태스크 코드</span>
                            <div className="meta-value">
                              {currentTask.task_id}
                            </div>
                          </div>
                          <div>
                            <span className="meta-label">주관 담당부서</span>
                            <div className="meta-value">
                              {currentTask.assignee_name}
                            </div>
                          </div>
                          <div>
                            <span className="meta-label">협업 담당부서</span>
                            <div className="meta-value">
                              {currentTask.cooperating_departments?.length
                                ? currentTask.cooperating_departments.join(" · ")
                                : "해당 없음"}
                            </div>
                          </div>
                          <div>
                            <span className="meta-label">조직 매핑 근거</span>
                            <div className="meta-value" style={{ fontSize: "0.72rem" }}>
                              {currentTask.organization_mapping_source || "담당 역할 기준"}
                            </div>
                          </div>
                          <div>
                            <span className="meta-label">
                              이행 주기 / 마감일
                            </span>
                            <div
                              className="meta-value"
                              style={{ color: "var(--color-warning)" }}
                            >
                              [{req?.compliance_cycle}] / {currentTask.due_date}
                              까지
                            </div>
                          </div>
                        </div>

                        {/* 규정 매핑 카드 */}
                        <div className="policy-mapping-card">
                          <span
                            className="meta-label"
                            style={{
                              color: "var(--border-focus)",
                              marginBottom: "4px",
                              display: "block",
                            }}
                          >
                            연계 사내 규정 및 ISMS-P 통제항목 (N:M 매핑)
                          </span>
                          <div className="policy-mapping-title">
                            📌 ISMS-P 통제기준: {currentTask.req_id}{" "}
                            {req?.subject}
                          </div>
                          <button
                            style={{
                              background: "transparent",
                              border: "none",
                              padding: 0,
                              textAlign: "left",
                              cursor: "pointer",
                              display: "block",
                              marginTop: "4px",
                            }}
                            onClick={() => {
                              const pol = initialPolicies.find(
                                p => p.policy_id === req?.policy_id
                              );
                              if (pol) setSelectedPolicy(pol);
                            }}
                          >
                            <span
                              className="doc-link-item"
                              style={{ fontSize: "0.8rem" }}
                            >
                              🔗 연계 지침: {req?.policy_name} 자세히 읽기
                            </span>
                          </button>
                        </div>

                        {/* 실무 표준 매뉴얼 SOP */}
                        <div className="sop-checklist-section">
                          <span className="sop-title">
                            📋 실무 표준 매뉴얼(SOP) 이행 체크리스트
                          </span>
                          <div className="sop-list">
                            {currentTask.checklists.map((chk, index) => (
                              <label key={index} className="sop-item">
                                <input
                                  type="checkbox"
                                  checked={chk.checked}
                                  disabled={
                                    currentTask.status === "완료" ||
                                    currentRole === "외부 심사원"
                                  }
                                  onChange={() => {
                                    setTasks(prev =>
                                      prev.map(t => {
                                        if (t.task_id === currentTask.task_id) {
                                          const updatedChecklist = [
                                            ...t.checklists,
                                          ];
                                          updatedChecklist[index].checked =
                                            !updatedChecklist[index].checked;
                                          return {
                                            ...t,
                                            checklists: updatedChecklist,
                                          };
                                        }
                                        return t;
                                      })
                                    );
                                  }}
                                />
                                <span>{chk.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 우측 패널 (수행 본문, 결재선 설정, 파일 드랍) */}
                    <div className="split-pane-right">
                      <div className="metadata-panel">
                        <h3 className="card-title">
                          <CheckCircle2 size={18} />
                          실무 이행 결과 보고 & 증적 파일 제출
                        </h3>

                        {/* 1. 결과 요약 리치 텍스트 에디터 */}
                        <div
                          className="form-group"
                          style={{ marginBottom: "16px" }}
                        >
                          <span className="form-label">
                            점검 및 이행 결과 요약 (마크다운 지원)
                          </span>
                          <div className="rich-editor-box">
                            <div className="editor-toolbar">
                              <button className="toolbar-btn" title="Bold">
                                <b>B</b>
                              </button>
                              <button className="toolbar-btn" title="Italic">
                                <i>I</i>
                              </button>
                              <button className="toolbar-btn" title="Link">
                                L
                              </button>
                              <button className="toolbar-btn" title="Checklist">
                                C
                              </button>
                              <span
                                style={{
                                  color: "var(--text-muted)",
                                  fontSize: "0.8rem",
                                  marginLeft: "auto",
                                  alignSelf: "center",
                                }}
                              >
                                업무 수행 내용
                              </span>
                            </div>
                            <textarea
                              className="editor-textarea"
                              placeholder="보안 점검 대상 장비, 발견사항, 조치 내역 요약을 상세히 기술하십시오..."
                              value={currentTask.description || ""}
                              disabled={
                                currentTask.status === "완료" ||
                                currentRole === "외부 심사원"
                              }
                              onChange={e => {
                                const val = e.target.value;
                                setTasks(prev =>
                                  prev.map(t => {
                                    if (t.task_id === currentTask.task_id) {
                                      return { ...t, description: val };
                                    }
                                    return t;
                                  })
                                );
                              }}
                            />
                          </div>
                        </div>

                        {/* 2. 드래그 앤 드롭 파일 업로더 */}
                        {currentTask.status !== "완료" &&
                          currentRole !== "외부 심사원" && (
                            <div style={{ marginBottom: "20px" }}>
                              <span
                                className="form-label"
                                style={{
                                  display: "block",
                                  marginBottom: "6px",
                                }}
                              >
                                증적 첨부 (드래그앤드롭 지원)
                              </span>
                              <div
                                className={`upload-zone ${isDragActive ? "drag-active" : ""}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                              >
                                <input
                                  type="file"
                                  id="file-uploader-input"
                                  style={{ display: "none" }}
                                  onChange={handleFileChange}
                                />
                                <UploadCloud
                                  size={32}
                                  className="upload-icon"
                                  style={{
                                    color: isUploading
                                      ? "var(--color-info)"
                                      : "var(--text-muted)",
                                  }}
                                />
                                <span className="upload-text">
                                  {isUploading
                                    ? "🔐 SHA-256 해시 연산 중 — 무결성 검증 처리 중..."
                                    : "마우스로 파일 드래그 앤 드롭 또는 클릭하여 파일 선택"}
                                </span>
                                {isUploading && (
                                  <div
                                    className="upload-progress-bar"
                                    style={{ width: "80%" }}
                                  >
                                    <div className="upload-progress-fill"></div>
                                  </div>
                                )}
                                <span className="upload-sub">
                                  PDF, Excel, JPG 형식 지원 (최대 50MB)
                                </span>
                                <button
                                  className="action-btn"
                                  style={{ marginTop: "8px" }}
                                  onClick={() =>
                                    document
                                      .getElementById("file-uploader-input")
                                      ?.click()
                                  }
                                  disabled={isUploading}
                                >
                                  {isUploading
                                    ? "처리 중..."
                                    : "로컬 파일 탐색"}
                                </button>
                              </div>
                            </div>
                          )}

                        {/* 업로드된 파일 & 해시 리스트 */}
                        <div
                          className="uploaded-files-list"
                          style={{ marginBottom: "20px" }}
                        >
                          <span
                            className="form-label"
                            style={{ display: "block", marginBottom: "4px" }}
                          >
                            첨부 완료된 증적 리스트 (위변조 검증용 해시 락)
                          </span>

                          {/* 기존 승인/기안된 파일 */}
                          {currentTask.evidence_files.map((file, fIdx) => (
                            <div key={fIdx} className="file-item">
                              <div className="file-info">
                                <FileText
                                  size={18}
                                  style={{ color: "var(--color-info)" }}
                                />
                                <div className="file-meta">
                                  <span className="file-name">
                                    {file.file_name} ({file.file_size})
                                  </span>
                                  <span className="file-hash-tag">
                                    SHA-256: {file.file_hash}
                                  </span>
                                </div>
                              </div>
                              <button
                                className="action-btn"
                                onClick={() =>
                                  setLightboxFile({
                                    name: file.file_name,
                                    size: file.file_size,
                                    hash: file.file_hash,
                                    path: file.path,
                                    creator: currentTask.assignee_name,
                                    date: currentTask.completed_at,
                                  })
                                }
                              >
                                열람
                              </button>
                            </div>
                          ))}

                          {/* 드롭하여 방금 추가한 임시 파일 */}
                          {tempDroppedFiles.map((file, fIdx) => (
                            <div
                              key={`temp-${fIdx}`}
                              className="file-item"
                              style={{ borderColor: "var(--color-success)" }}
                            >
                              <div className="file-info">
                                <FileCheck
                                  size={18}
                                  style={{ color: "var(--color-success)" }}
                                />
                                <div className="file-meta">
                                  <span className="file-name">
                                    {file.name} ({file.size}) [업로드완료]
                                  </span>
                                  <span
                                    className="file-hash-tag"
                                    style={{ color: "var(--color-success)" }}
                                  >
                                    SHA-256 해시 연산완료: {file.hash}
                                  </span>
                                </div>
                              </div>
                              <button
                                className="action-btn"
                                style={{ color: "var(--color-danger)" }}
                                onClick={() =>
                                  setTempDroppedFiles(prev =>
                                    prev.filter((_, i) => i !== fIdx)
                                  )
                                }
                              >
                                삭제
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* 3. 다이내믹 결재라인 지정 */}
                        <div
                          className="form-group"
                          style={{ marginBottom: "24px" }}
                        >
                          <span className="form-label">
                            담당부서 및 결재 프로세스
                          </span>
                          <div className="approval-line-widget">
                            <div className="approval-flow">
                              {currentTask.approval_path.map((node, nIdx) => (
                                <React.Fragment key={nIdx}>
                                  <div className="approval-node">
                                    <span className="node-number">
                                      {nIdx + 1}
                                    </span>
                                    <div>
                                      <span
                                        className="node-name"
                                        style={{ display: "block" }}
                                      >
                                        {node.name}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "0.7rem",
                                          color: "var(--text-muted)",
                                        }}
                                      >
                                        {node.role}
                                      </span>
                                    </div>
                                    <span
                                      className={`node-status ${node.status}`}
                                    ></span>
                                  </div>
                                  {nIdx <
                                    currentTask.approval_path.length - 1 && (
                                    <ArrowRight
                                      size={14}
                                      className="flow-connector"
                                    />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 4. 작업 액션 버튼 영역 (상태별) */}
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "flex-end",
                            borderTop: "1px solid var(--border-color)",
                            paddingTop: "16px",
                          }}
                        >
                          {currentTask.status === "완료" && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                color: "var(--color-success)",
                                fontWeight: 600,
                              }}
                            >
                              <CheckCircle2 size={18} />본 업무는 최종 승인 완료
                              상태이며 등록 증적은 별도 변경 절차를 통해
                              관리해야 합니다.
                            </div>
                          )}

                          {currentTask.status !== "완료" &&
                            currentRole === "외부 심사원" && (
                              <div
                                style={{
                                  color: "var(--color-danger)",
                                  fontSize: "0.85rem",
                                }}
                              >
                                🔒 외부 심사위원은 결재 및 서류 제출 권한이
                                없습니다. (조회 전용)
                              </div>
                            )}

                          {currentTask.status !== "완료" &&
                            currentRole !== "외부 심사원" && (
                              <>
                                {/* 일반 담당자용 결재요청 */}
                                {currentTask.status !== "승인대기" && (
                                  <button
                                    className="action-btn primary"
                                    onClick={() => {
                                      const allFiles = [
                                        ...currentTask.evidence_files,
                                        ...tempDroppedFiles.map(tf => ({
                                          file_name: tf.name,
                                          file_size: tf.size,
                                          file_hash: tf.hash,
                                          path: `/VFS/임시 적치/${currentTask.req_id}/${tf.name}`,
                                        })),
                                      ];
                                      submitTaskForApproval(
                                        currentTask.task_id,
                                        currentTask.description || "",
                                        allFiles
                                      );
                                      setTempDroppedFiles([]);
                                    }}
                                  >
                                    기안 및 결재요청 (보안팀장/CISO 송신)
                                  </button>
                                )}

                                {/* CISO용 승인 / 반려 버튼 */}
                                {currentTask.status === "승인대기" &&
                                  currentRole === "보안팀장" && (
                                    <>
                                      {currentTask.approval_path.find(
                                        node => node.role === "검토자"
                                      )?.status === "approved" ? (
                                        <div className="evidence-review-message approved">
                                          <CheckCircle2 size={16} /> 증적 확인
                                          완료 · CISO 최종 승인대기
                                        </div>
                                      ) : (
                                        <button
                                          className="action-btn primary"
                                          onClick={() =>
                                            reviewEvidenceBySecurityLead(
                                              currentTask.task_id
                                            )
                                          }
                                        >
                                          <FileCheck size={16} /> 증적 적정성
                                          확인 완료
                                        </button>
                                      )}
                                    </>
                                  )}

                                {currentTask.status === "승인대기" &&
                                  currentRole === "CISO" && (
                                    <>
                                      <button
                                        className="action-btn"
                                        style={{
                                          backgroundColor:
                                            "var(--color-danger-bg)",
                                          color: "var(--color-danger)",
                                          borderColor: "var(--color-danger)",
                                        }}
                                        onClick={() => {
                                          const reason =
                                            prompt(
                                              "결재 반려 사유를 입력하십시오:"
                                            );
                                          if (reason)
                                            rejectTaskByCISO(
                                              currentTask.task_id,
                                              reason
                                            );
                                        }}
                                      >
                                        결재 반려하기
                                      </button>
                                      <button
                                        className="action-btn primary"
                                        style={{
                                          background: "var(--success-color)",
                                        }}
                                        onClick={() =>
                                          approveTaskByCISO(currentTask.task_id)
                                        }
                                        disabled={
                                          currentTask.approval_path.find(
                                            node => node.role === "검토자"
                                          )?.status !== "approved"
                                        }
                                      >
                                        {currentTask.approval_path.find(
                                          node => node.role === "검토자"
                                        )?.status === "approved"
                                          ? "CISO 최종 승인 (VFS 자동 적치)"
                                          : "보안팀장 증적 확인 필요"}
                                      </button>
                                    </>
                                  )}

                                {currentTask.status === "승인대기" &&
                                  currentRole !== "CISO" &&
                                  currentRole !== "보안팀장" && (
                                    <div
                                      style={{
                                        color: "var(--color-warning)",
                                        fontSize: "0.85rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <Clock size={16} /> 보안팀장 증적 확인 및
                                      CISO 최종 승인대기 중입니다.
                                    </div>
                                  )}
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 하단 영역: 이력 검토 및 소통 (Audit Trail & Comments) */}
              <div className="comments-section-card section-card">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                  }}
                >
                  {/* 과거 수행 이력 테이블 */}
                  <div>
                    <h4 className="card-title">
                      <History size={16} />
                      과거 수행 이력 테이블 (Historical Evidences)
                    </h4>
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>수행 회차</th>
                          <th>최종 완료일</th>
                          <th>승인자</th>
                          <th>증적 다운로드</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evidences
                          .filter(
                            evidence => evidence.task_id === selectedTaskId
                          )
                          .map(evidence => (
                            <tr key={evidence.evidence_id}>
                              <td>{evidence.file_name}</td>
                              <td>{evidence.created_at}</td>
                              <td>{evidence.created_by}</td>
                              <td>
                                <button
                                  className="action-btn"
                                  style={{
                                    padding: "2px 8px",
                                    fontSize: "0.75rem",
                                  }}
                                  onClick={() =>
                                    setLightboxFile({
                                      name: evidence.file_name,
                                      size: "원본",
                                      hash: evidence.file_hash,
                                      path: evidence.file_path,
                                      creator: evidence.created_by,
                                      date: evidence.created_at,
                                    })
                                  }
                                >
                                  메타데이터
                                </button>
                              </td>
                            </tr>
                          ))}
                        {evidences.filter(
                          evidence => evidence.task_id === selectedTaskId
                        ).length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              style={{
                                textAlign: "center",
                                color: "var(--text-muted)",
                              }}
                            >
                              등록된 실제 수행 이력이 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* 결재 반려 및 알림 댓글 소통 */}
                  <div>
                    <h4 className="card-title">
                      <Send size={16} />
                      검토 의견 및 알림 피드백 댓글 (Comments)
                    </h4>

                    <div className="comments-list">
                      {taskComments.map(cmt => (
                        <div key={cmt.comment_id} className="comment-card">
                          <div className="comment-header">
                            <div className="comment-author-info">
                              <span className="comment-author">
                                {cmt.writer_name}
                              </span>
                              <span className="comment-author-role">
                                {cmt.writer_role}
                              </span>
                            </div>
                            <span className="comment-time">
                              {cmt.created_at}
                            </span>
                          </div>
                          <p className="comment-text">{cmt.content}</p>
                        </div>
                      ))}

                      {taskComments.length === 0 && (
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                            textAlign: "center",
                            padding: "16px",
                          }}
                        >
                          본 업무에 대해 등록된 댓글이나 반려 의견이 존재하지
                          않습니다.
                        </p>
                      )}
                    </div>

                    {currentRole !== "외부 심사원" && (
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          const textarea = e.currentTarget.elements.namedItem(
                            "commentText"
                          ) as HTMLTextAreaElement;
                          if (textarea && textarea.value.trim() !== "") {
                            handleAddComment(selectedTaskId, textarea.value);
                            textarea.value = "";
                          }
                        }}
                      >
                        <div className="comment-input-box">
                          <textarea
                            name="commentText"
                            className="comment-textarea"
                            placeholder="의견 또는 피드백 입력... (@CISO, @담당자 호출 멘션 지원)"
                          />
                          <button
                            type="submit"
                            className="action-btn primary"
                            style={{
                              height: "fit-content",
                              padding: "10px 18px",
                            }}
                          >
                            등록
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              EVIDENCE VAULT (VFS) TAB
              ========================================== */}
          {activeTab === "evidence" && (
            <div>
              {/* Virtual File System Browser */}
              <div className="vfs-container">
                {/* 좌측 폴더 트리 */}
                <div className="vfs-tree-pane">
                  <h4
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      marginBottom: "14px",
                      textTransform: "uppercase",
                    }}
                  >
                    VFS 디렉토리 트리
                  </h4>

                  {[
                    "1. 관리체계 수립 및 운영",
                    "2. 보호대책 요구사항",
                    "3. 개인정보 처리단계별 요구사항",
                  ].map(folder => {
                    const isFolderActive = vfsActiveFolder === folder;
                    return (
                      <div key={folder} className="tree-node">
                        <div
                          className={`tree-folder-header ${isFolderActive ? "active" : ""}`}
                          onClick={() => setVfsActiveFolder(folder)}
                        >
                          {isFolderActive ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                          📂 {folder}
                        </div>
                        {isFolderActive && (
                          <div className="tree-sub-list">
                            {initialRequirements
                              .filter(r => r.category === folder)
                              .map(r => {
                                const fileExists = evidences.some(
                                  ev => ev.req_id === r.req_id
                                );
                                return (
                                  <div
                                    key={r.req_id}
                                    className="tree-file-item"
                                    onClick={() => {
                                      const evFile = evidences.find(
                                        ev => ev.req_id === r.req_id
                                      );
                                      if (evFile) {
                                        setLightboxFile({
                                          name: evFile.file_name,
                                          size: "2.4MB",
                                          hash: evFile.file_hash,
                                          path: evFile.file_path,
                                          creator: evFile.created_by,
                                          date: evFile.created_at,
                                        });
                                      } else {
                                        showToast(
                                          "해당 항목에 최종 승인 완료된 증적이 없습니다.",
                                          "warning"
                                        );
                                      }
                                    }}
                                  >
                                    📄 {r.req_id} {r.subject.substring(0, 10)}
                                    ... {fileExists ? "✅" : "❌"}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 우측 디렉토리 파일 리스트 */}
                <div className="vfs-content-pane">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "18px",
                      borderBottom: "1px solid var(--border-color)",
                      paddingBottom: "12px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        현재 VFS 경로:
                      </span>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                        /root/{vfsActiveFolder}
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      폴더 내 파일: {vfsFiles.length}개
                    </span>
                  </div>

                  {vfsFiles.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {vfsFiles.map(ev => (
                        <div
                          key={ev.evidence_id}
                          className="file-item"
                          style={{
                            background: "var(--bg-primary)",
                            padding: "16px 20px",
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "4px",
                              }}
                            >
                              <FileText
                                style={{ color: "var(--color-info)" }}
                              />
                              <span
                                style={{ fontWeight: 600, fontSize: "0.95rem" }}
                              >
                                {ev.file_name}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--text-muted)",
                                }}
                              >
                                | 보존기간: {ev.retention_years}년
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                                paddingLeft: "32px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                저장 경로: {ev.file_path}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                승인 일시: {ev.created_at} | 결재라인:{" "}
                                {ev.created_by}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.75rem",
                                  color: "var(--text-muted)",
                                }}
                              >
                                SHA-256 HASH: {ev.file_hash}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <label className="action-btn evidence-reverify-button">
                              원본 재선택 검증
                              <input
                                type="file"
                                onChange={event => {
                                  const file = event.target.files?.[0];
                                  if (file)
                                    void verifyEvidenceWithOriginalFile(
                                      ev,
                                      file
                                    );
                                  event.target.value = "";
                                }}
                              />
                            </label>
                            <button
                              className="action-btn primary"
                              onClick={() =>
                                setLightboxFile({
                                  name: ev.file_name,
                                  size: "3.1MB",
                                  hash: ev.file_hash,
                                  path: ev.file_path,
                                  creator: ev.created_by,
                                  date: ev.created_at,
                                })
                              }
                            >
                              바로보기
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px",
                        color: "var(--text-muted)",
                        border: "2px dashed var(--border-color)",
                        borderRadius: "8px",
                      }}
                    >
                      <FolderGit
                        size={48}
                        style={{
                          marginBottom: "16px",
                          color: "var(--text-muted)",
                        }}
                      />
                      <p>
                        선택된 디렉토리에 승인 완료 및 적치된 증적 서류가
                        존재하지 않습니다.
                      </p>
                      <p style={{ fontSize: "0.8rem", marginTop: "6px" }}>
                        업무 수행 및 결재제출 화면에서 결재를 통과시켜 최종
                        승인되면 자동으로 이곳에 분류 적치됩니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              AUDITOR PORTAL TAB
              ========================================== */}
          {activeTab === "auditor" && (
            <div>
              {/* 심사원 전용 배너 */}
              <div className="auditor-banner">
                <div className="auditor-banner-left">
                  <span className="auditor-badge">Auditor Portal</span>
                  <div>
                    <span className="auditor-status-text">
                      외부 ISMS-P 인증 심사위원 보안 세션 활성화
                    </span>
                    <p className="auditor-status-desc">
                      외부 심사원 조회 전용 권한으로 증적 메타데이터와 질문(Q&A)
                      포털에 접근 중입니다.
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      display: "block",
                    }}
                  >
                    보안 세션 자동 만료까지
                  </span>
                  <div className="auditor-timer">
                    ⏳ {Math.floor(auditorCountdown / 60)}:
                    {(auditorCountdown % 60).toString().padStart(2, "0")}
                  </div>
                </div>
              </div>

              {/* 2단 구조 - 좌측 읽기전용 증적 트리, 우측 심사 Q&A 프로세스 */}
              <div className="dashboard-grid">
                {/* 1. 읽기전용 증적 VFS 트리 */}
                <div className="section-card">
                  <h3 className="card-title">
                    <FolderGit size={18} />
                    ISMS-P 통제구조 트리 및 승인 증적 보관소 (Read-Only)
                  </h3>
                  <div className="vfs-container" style={{ height: "380px" }}>
                    <div
                      className="vfs-tree-pane"
                      style={{ borderRight: "1px solid var(--border-color)" }}
                    >
                      {[
                        "1. 관리체계 수립",
                        "2. 보호대책 요구사항",
                        "3. 개인정보 처리 제한",
                      ].map(folder => (
                        <div key={folder} className="tree-node">
                          <div
                            className="tree-folder-header active"
                            style={{ cursor: "default" }}
                          >
                            📂 {folder}
                          </div>
                          <div className="tree-sub-list">
                            {initialRequirements
                              .filter(r => r.category === folder)
                              .map(r => {
                                const evFile = evidences.find(
                                  ev => ev.req_id === r.req_id
                                );
                                return (
                                  <div
                                    key={r.req_id}
                                    className="tree-file-item"
                                    style={{
                                      cursor: evFile
                                        ? "pointer"
                                        : "not-allowed",
                                      color: evFile
                                        ? "var(--text-primary)"
                                        : "var(--text-muted)",
                                    }}
                                    onClick={() => {
                                      if (evFile) {
                                        setLightboxFile({
                                          name: evFile.file_name,
                                          size: "3.5MB",
                                          hash: evFile.file_hash,
                                          path: evFile.file_path,
                                          creator: evFile.created_by,
                                          date: evFile.created_at,
                                        });
                                      } else {
                                        showToast(
                                          "본 통제항목에 심사 대상용 최종 적치 증적이 비어있습니다.",
                                          "warning"
                                        );
                                      }
                                    }}
                                  >
                                    📄 [{r.req_id}] {r.subject}{" "}
                                    {evFile ? "✅ (열람가능)" : "❌ (누락)"}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      className="vfs-content-pane"
                      style={{ padding: "16px" }}
                    >
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        * 심사위원 안내사항: 증적 선택 시 파일명, 원본 경로,
                        등록 해시 등 메타데이터를 확인할 수 있습니다. 문서
                        본문은 임의로 생성하지 않습니다.
                      </span>
                      <div className="table-container">
                        <table
                          className="compliance-table"
                          style={{ fontSize: "0.8rem" }}
                        >
                          <thead>
                            <tr>
                              <th>인증번호</th>
                              <th>증적 명칭</th>
                              <th>무결성 해시 (SHA-256)</th>
                              <th>액션</th>
                            </tr>
                          </thead>
                          <tbody>
                            {evidences.map(ev => (
                              <tr key={ev.evidence_id}>
                                <td>{ev.req_id}</td>
                                <td>{ev.file_name}</td>
                                <td style={{ fontFamily: "var(--font-mono)" }}>
                                  {ev.file_hash.substring(0, 24)}...
                                </td>
                                <td>
                                  <button
                                    className="action-btn"
                                    onClick={() =>
                                      setLightboxFile({
                                        name: ev.file_name,
                                        size: "2.5MB",
                                        hash: ev.file_hash,
                                        path: ev.file_path,
                                        creator: ev.created_by,
                                        date: ev.created_at,
                                      })
                                    }
                                  >
                                    열람
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 심사 Q&A 프로세스 패널 */}
                <div className="section-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <h3 className="card-title" style={{ margin: 0 }}>
                      <HelpCircle size={18} />
                      실시간 심사위원 질문(Q&A) 및 소명 프로세스
                    </h3>
                    {currentRole === "외부 심사원" && (
                      <button
                        className="action-btn primary"
                        onClick={() => setShowNewQAModal(true)}
                      >
                        <Plus size={14} /> 신규 질문 등록
                      </button>
                    )}
                  </div>

                  <div className="qa-layout">
                    {qaList.map(qa => (
                      <div key={qa.qa_id} className="qa-item-box">
                        <div className="qa-item-header">
                          <span style={{ fontWeight: 600 }}>
                            통제번호 {qa.req_id}에 대한 심사원 질의
                          </span>
                          <span
                            className={`qa-status-label ${qa.status === "replied" ? "replied" : "pending"}`}
                          >
                            {qa.status === "replied"
                              ? "답변/소명 완료"
                              : "미답변 (소명요청)"}
                          </span>
                        </div>
                        <div className="qa-body">
                          <div className="qa-question">
                            <p className="qa-question-text">❓ {qa.question}</p>
                            <span className="qa-meta">
                              등록자: {qa.asked_by} | 등록일시: {qa.asked_at}
                            </span>
                          </div>

                          {qa.answer ? (
                            <div className="qa-answer-box">
                              <span className="qa-answer-title">
                                ✅ 보안팀 소명 답변
                              </span>
                              <p className="qa-answer-text">{qa.answer}</p>
                              <span
                                className="qa-meta"
                                style={{ display: "block", marginTop: "4px" }}
                              >
                                답변자: {qa.answered_by} | 답변일시:{" "}
                                {qa.answered_at}
                              </span>
                            </div>
                          ) : (
                            currentRole !== "외부 심사원" && (
                              <div className="qa-action-form">
                                <button
                                  className="action-btn primary"
                                  onClick={() => {
                                    setReplyQAId(qa.qa_id);
                                    setReplyText("");
                                  }}
                                >
                                  공식 소명 답변 작성
                                </button>
                                {replyQAId === qa.qa_id && (
                                  <div
                                    style={{
                                      marginTop: "10px",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "8px",
                                    }}
                                  >
                                    <textarea
                                      className="form-input"
                                      rows={3}
                                      placeholder="소명 설명 또는 추가 첨부서류 설명을 작성하십시오..."
                                      value={replyText}
                                      onChange={e =>
                                        setReplyText(e.target.value)
                                      }
                                    />
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "8px",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      <button
                                        className="action-btn"
                                        onClick={() => setReplyQAId(null)}
                                      >
                                        취소
                                      </button>
                                      <button
                                        className="action-btn primary"
                                        onClick={() => {
                                          handleAnswerAuditorQA(
                                            qa.qa_id,
                                            replyText
                                          );
                                          setReplyQAId(null);
                                        }}
                                      >
                                        답변 전송
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              AUDIT LOGS TAB
              ========================================== */}
          {activeTab === "logs" && (
            <div className="section-card" style={{ background: "#090d16" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="card-title"
                  style={{ margin: 0, color: "#38bdf8" }}
                >
                  <FileCode size={18} />
                  무결성 및 행위 감사로그 터미널 (Audit Trail Log)
                </h3>
                <span className="audit-immutable-badge">
                  <Lock size={13} /> Append-only · 삭제 불가
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginBottom: "16px",
                }}
              >
                * 현재 화면에서는 로그 삭제 기능을 제공하지 않는 append-only
                방식으로 기록합니다. 운영환경에서는 별도 서버 저장소와
                WORM/보존정책 적용이 필요합니다.
              </p>

              <div className="audit-log-terminal">
                {auditLogs.map(log => (
                  <div key={log.log_id} className="audit-log-line">
                    <span className="log-time">[{log.timestamp}]</span>
                    <span className="log-user">
                      {log.user}({log.role})
                    </span>
                    <span className="log-action">{log.action}</span>
                    <span className="log-details">
                      {log.details} - STATE: {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              ISO 27001 SOA 운영 현황 TAB
              ========================================== */}
          {activeTab === "iso-soa" && (
            <div>
              {/* SOA 요약 KPI */}
              <div
                className="kpi-grid"
                style={{
                  gridTemplateColumns: "repeat(5, 1fr)",
                  marginBottom: "20px",
                }}
              >
                <div
                  className="kpi-card"
                  style={{ borderTop: "3px solid var(--color-success)" }}
                >
                  <div className="kpi-header">
                    <span>SOA 보고서 기준일</span>
                    <Award
                      size={16}
                      style={{ color: "var(--color-success)" }}
                    />
                  </div>
                  <div
                    className="kpi-value"
                    style={{
                      fontSize: "1.2rem",
                      color: "var(--color-success)",
                    }}
                  >
                    {soaSummary.reportDate}
                  </div>
                  <div className="kpi-sub">버전 {soaSummary.reportVersion}</div>
                </div>
                <div
                  className="kpi-card"
                  style={{ borderTop: "3px solid var(--color-info)" }}
                >
                  <div className="kpi-header">
                    <span>전체 통제항목</span>
                    <Layers size={16} style={{ color: "var(--color-info)" }} />
                  </div>
                  <div className="kpi-value">{soaSummary.totalControls}</div>
                  <div className="kpi-sub">ISO 27001:2022 Annex A</div>
                </div>
                <div
                  className="kpi-card"
                  style={{ borderTop: "3px solid var(--color-success)" }}
                >
                  <div className="kpi-header">
                    <span>적용 완료</span>
                    <CheckSquare
                      size={16}
                      style={{ color: "var(--color-success)" }}
                    />
                  </div>
                  <div
                    className="kpi-value"
                    style={{ color: "var(--color-success)" }}
                  >
                    {soaSummary.applied}
                  </div>
                  <div className="kpi-sub">
                    부분적용: {soaSummary.partiallyApplied}
                  </div>
                </div>
                <div
                  className="kpi-card"
                  style={{ borderTop: "3px solid var(--color-warning)" }}
                >
                  <div className="kpi-header">
                    <span>ISMS-P 전환 Gap</span>
                    <AlertCircle
                      size={16}
                      style={{ color: "var(--color-warning)" }}
                    />
                  </div>
                  <div
                    className="kpi-value"
                    style={{ color: "var(--color-warning)" }}
                  >
                    {soaSummary.ismsGapCount}
                  </div>
                  <div className="kpi-sub">ISMS-P 추가 필요 항목</div>
                </div>
                <div
                  className="kpi-card"
                  style={{ borderTop: "3px solid var(--color-info)" }}
                >
                  <div className="kpi-header">
                    <span>2025 실제 증적</span>
                    <FileCheck
                      size={16}
                      style={{ color: "var(--color-info)" }}
                    />
                  </div>
                  <div
                    className="kpi-value"
                    style={{ color: "var(--color-info)" }}
                  >
                    {
                      evidences.filter(
                        evidence =>
                          evidence.iso_control_refs?.length &&
                          evidence.verification_status !== "증적제외"
                      ).length
                    }
                  </div>
                  <div className="kpi-sub">
                    검증 통제{" "}
                    {
                      isoControls.filter(control =>
                        getActualEvidenceForIsoControl(control).some(
                          evidence =>
                            evidence.verification_status === "검증완료"
                        )
                      ).length
                    }{" "}
                    · 확인대기{" "}
                    {
                      isoControls.filter(control =>
                        getActualEvidenceForIsoControl(control).some(
                          evidence =>
                            evidence.verification_status === "팀장확인필요"
                        )
                      ).length
                    }
                  </div>
                </div>
              </div>

              {/* 도메인별 적용 현황 바 */}
              <div className="section-card" style={{ marginBottom: "20px" }}>
                <h3 className="card-title">
                  <TrendingUp size={16} /> 도메인별 ISO 27001 통제항목 적용 현황
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginTop: "16px",
                  }}
                >
                  {soaSummary.domains.map(d => {
                    const rate = Math.round((d.applied / d.total) * 100);
                    return (
                      <div key={d.name}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            {d.name}
                          </span>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            적용 {d.applied}/{d.total}
                            {d.partial > 0 && (
                              <span
                                style={{
                                  color: "var(--color-warning)",
                                  marginLeft: "8px",
                                }}
                              >
                                부분 {d.partial}
                              </span>
                            )}
                          </span>
                        </div>
                        <div
                          style={{
                            background: "var(--bg-tertiary)",
                            borderRadius: "4px",
                            height: "10px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${rate}%`,
                              height: "100%",
                              background:
                                rate >= 90
                                  ? "var(--color-success)"
                                  : "var(--color-warning)",
                              borderRadius: "4px",
                              transition: "width 0.5s",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginTop: "3px",
                          }}
                        >
                          {rate}% 충족
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SOA 통제항목 상세 테이블 */}
              <div className="section-card">
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <h3 className="card-title" style={{ margin: 0 }}>
                    <FileSpreadsheet size={16} /> SOA 세부 통제항목 (
                    {filteredIsoControls.length}건)
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginLeft: "auto",
                      flexWrap: "wrap",
                    }}
                  >
                    <select
                      className="filter-select"
                      value={isoFilterDomain}
                      onChange={e => setIsoFilterDomain(e.target.value)}
                    >
                      <option value="all">도메인: 전체</option>
                      {isoDomains.map(d => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <select
                      className="filter-select"
                      value={isoFilterStatus}
                      onChange={e => setIsoFilterStatus(e.target.value)}
                    >
                      <option value="all">상태: 전체</option>
                      <option value="적용">✅ 적용</option>
                      <option value="부분적용">⚠️ 부분적용</option>
                    </select>
                    <select
                      className="filter-select"
                      value={isoEvidenceFilter}
                      onChange={e =>
                        setIsoEvidenceFilter(
                          e.target.value as
                            "all" | "verified" | "pending" | "unlinked"
                        )
                      }
                    >
                      <option value="all">증적: 전체</option>
                      <option value="verified">검증완료</option>
                      <option value="pending">팀장확인 대기</option>
                      <option value="unlinked">증적 미연결</option>
                    </select>
                    <div
                      className="search-input-wrapper"
                      style={{ minWidth: "220px" }}
                    >
                      <Search size={14} className="search-icon-svg" />
                      <input
                        type="text"
                        className="search-input"
                        placeholder="통제항목 번호/명 검색..."
                        value={isoSearchQuery}
                        onChange={e => setIsoSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>통제번호</th>
                        <th style={{ width: "160px" }}>통제항목</th>
                        <th>세부 점검내용</th>
                        <th style={{ width: "80px" }}>상태</th>
                        <th style={{ width: "220px" }}>2025 SOA 운영현황</th>
                        <th style={{ width: "120px" }}>실제 증적</th>
                        <th style={{ width: "120px" }}>연계 ISMS-P</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIsoControls.slice(0, 100).map(ctrl => {
                        const actualEvidence =
                          getActualEvidenceForIsoControl(ctrl);
                        return (
                          <tr
                            key={ctrl.iso_id}
                            className={
                              ctrl.status === "적용"
                                ? "row-border-completed"
                                : "row-border-pending"
                            }
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedIsoControl(ctrl)}
                          >
                            <td
                              style={{
                                fontWeight: 700,
                                color: "var(--color-info)",
                                fontFamily: "JetBrains Mono, monospace",
                                fontSize: "0.8rem",
                              }}
                            >
                              {ctrl.iso_id}
                            </td>
                            <td
                              style={{ fontWeight: 600, fontSize: "0.85rem" }}
                            >
                              {ctrl.control_name || ctrl.iso_id}
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "0.7rem",
                                  color: "var(--text-muted)",
                                  fontWeight: 400,
                                }}
                              >
                                {ctrl.domain}
                              </span>
                            </td>
                            <td
                              style={{
                                fontSize: "0.82rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {ctrl.check_item.substring(0, 80)}
                              {ctrl.check_item.length > 80 ? "..." : ""}
                            </td>
                            <td>
                              <span
                                className={`status-badge ${ctrl.status === "적용" ? "completed" : "pending"}`}
                              >
                                {ctrl.status === "적용" ? "✅ 적용" : "⚠️ 부분"}
                              </span>
                            </td>
                            <td
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {ctrl.operation
                                ? ctrl.operation.substring(0, 60) + "..."
                                : "-"}
                            </td>
                            <td>
                              {actualEvidence.length > 0 ? (
                                <div className="soa-evidence-state">
                                  <span className="actual-evidence-count">
                                    <FileCheck size={13} />
                                    {actualEvidence.length}건
                                  </span>
                                  {actualEvidence.some(
                                    evidence =>
                                      evidence.verification_status ===
                                      "검증완료"
                                  ) ? (
                                    <small className="verified">검증완료</small>
                                  ) : (
                                    <small className="pending">
                                      팀장확인 대기
                                    </small>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <span
                                    style={{
                                      color: "var(--color-warning)",
                                      fontSize: ".7rem",
                                    }}
                                  >
                                    미연결
                                  </span>
                                  {ctrl.mapped_isms[0] && (
                                    <button
                                      className="evidence-gap-action"
                                      onClick={event => {
                                        event.stopPropagation();
                                        createOrOpenIsoEvidenceGapTask(ctrl);
                                      }}
                                    >
                                      보완업무 발행
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td>
                              {ctrl.mapped_isms.length > 0 ? (
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "3px",
                                  }}
                                >
                                  {ctrl.mapped_isms.map(m => (
                                    <span
                                      key={m.req_id}
                                      style={{
                                        fontSize: "0.7rem",
                                        background: "var(--color-info-bg)",
                                        color: "var(--color-info)",
                                        padding: "2px 5px",
                                        borderRadius: "4px",
                                        fontFamily: "monospace",
                                      }}
                                    >
                                      {m.req_id}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span
                                  style={{
                                    color: "var(--text-muted)",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  매핑없음
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ISO 통제항목 상세 모달 */}
              {selectedIsoControl && (
                <div
                  className="lightbox-overlay"
                  onClick={() => setSelectedIsoControl(null)}
                >
                  <div
                    className="lightbox-content"
                    style={{ width: "720px", maxHeight: "80vh" }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="lightbox-header">
                      <div>
                        <span className="lightbox-title">
                          [{selectedIsoControl.iso_id}]{" "}
                          {selectedIsoControl.control_name}
                        </span>
                        <span
                          className="lightbox-subtitle"
                          style={{ display: "block" }}
                        >
                          {selectedIsoControl.domain}
                        </span>
                      </div>
                      <button
                        className="lightbox-close-btn"
                        onClick={() => setSelectedIsoControl(null)}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div
                      className="lightbox-body"
                      style={{
                        padding: "24px",
                        flexDirection: "column",
                        gap: "16px",
                        overflowY: "auto",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          세부 점검항목
                        </span>
                        <p
                          style={{
                            marginTop: "6px",
                            lineHeight: "1.6",
                            fontSize: "0.9rem",
                          }}
                        >
                          {selectedIsoControl.check_item}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                        }}
                      >
                        <div
                          className="policy-mapping-card"
                          style={{ margin: 0 }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "var(--color-success)",
                            }}
                          >
                            ✅ 2025 SOA 운영현황
                          </span>
                          <p
                            style={{
                              marginTop: "6px",
                              fontSize: "0.85rem",
                              lineHeight: "1.5",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {selectedIsoControl.operation || "운영현황 미기재"}
                          </p>
                        </div>
                        <div
                          className="policy-mapping-card"
                          style={{ margin: 0 }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "var(--color-info)",
                            }}
                          >
                            📁 증적/기록
                          </span>
                          <p
                            style={{
                              marginTop: "6px",
                              fontSize: "0.85rem",
                              lineHeight: "1.5",
                            }}
                          >
                            {selectedIsoControl.evidence || "-"}
                          </p>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "var(--color-warning)",
                              display: "block",
                              marginTop: "10px",
                            }}
                          >
                            📄 관련 정책/지침
                          </span>
                          <p
                            style={{
                              marginTop: "6px",
                              fontSize: "0.85rem",
                              lineHeight: "1.5",
                            }}
                          >
                            {selectedIsoControl.policy || "-"}
                          </p>
                        </div>
                      </div>
                      {getActualEvidenceForIsoControl(selectedIsoControl)
                        .length > 0 && (
                        <div className="iso-actual-evidence-panel">
                          <span>ISO 통제 연결 실제 증적</span>
                          {getActualEvidenceForIsoControl(
                            selectedIsoControl
                          ).map(evidence => (
                            <button
                              key={evidence.evidence_id}
                              onClick={() =>
                                setLightboxFile({
                                  name: evidence.file_name,
                                  size: "원본",
                                  hash: evidence.file_hash,
                                  path: evidence.file_path,
                                  creator: evidence.created_by,
                                  date: evidence.created_at,
                                })
                              }
                            >
                              <FileCheck size={15} />
                              <div>
                                <strong>{evidence.file_name}</strong>
                                <small>
                                  {evidence.source_type} · ISMS-P{" "}
                                  {evidence.req_id} ·{" "}
                                  {evidence.verification_status}
                                </small>
                              </div>
                              <ChevronRight size={14} />
                            </button>
                          ))}
                        </div>
                      )}
                      {selectedIsoControl.mapped_isms.length > 0 && (
                        <div>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                            }}
                          >
                            연계 ISMS-P 인증기준
                          </span>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px",
                              marginTop: "8px",
                            }}
                          >
                            {selectedIsoControl.mapped_isms.map(m => (
                              <div
                                key={m.req_id}
                                style={{
                                  background: "var(--color-info-bg)",
                                  border: "1px solid var(--color-info)",
                                  borderRadius: "6px",
                                  padding: "6px 10px",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "monospace",
                                    fontWeight: 700,
                                    color: "var(--color-info)",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {m.req_id}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--text-secondary)",
                                    marginLeft: "6px",
                                  }}
                                >
                                  {m.subject}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="lightbox-footer">
                      <span
                        className={`status-badge ${selectedIsoControl.status === "적용" ? "completed" : "pending"}`}
                      >
                        {selectedIsoControl.status}
                      </span>
                      <button
                        className="action-btn primary"
                        onClick={() => setSelectedIsoControl(null)}
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              ISO ↔ ISMS-P 매핑 & GAP 분석 TAB
              ========================================== */}
          {activeTab === "mapping" && (
            <div>
              {/* 매핑 개요 배너 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  className="kpi-card"
                  style={{
                    borderTop: "3px solid var(--color-info)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      color: "var(--color-info)",
                    }}
                  >
                    170
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    ISO 27001 통제항목
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-success)",
                      marginTop: "4px",
                    }}
                  >
                    🏆 인증 취득 완료
                  </div>
                </div>
                <div
                  className="kpi-card"
                  style={{
                    borderTop: "3px solid var(--color-warning)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      color: "var(--color-warning)",
                    }}
                  >
                    60
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    ISMS-P 추가 필요 (Gap)
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-warning)",
                      marginTop: "4px",
                    }}
                  >
                    ⚠️ 주로 3영역(개인정보) + 1영역 일부
                  </div>
                </div>
                <div
                  className="kpi-card"
                  style={{
                    borderTop: "3px solid var(--color-success)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      color: "var(--color-success)",
                    }}
                  >
                    41
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    ISMS-P ISO 매핑 항목
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-success)",
                      marginTop: "4px",
                    }}
                  >
                    ✅ ISO 운영으로 커버 가능
                  </div>
                </div>
              </div>

              {/* 매핑 필터 탭 */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    background: "var(--bg-secondary)",
                    borderRadius: "8px",
                    padding: "3px",
                    gap: "3px",
                  }}
                >
                  {[
                    { key: "all", label: "전체 매핑" },
                    { key: "mapped", label: "✅ ISMS-P 매핑" },
                    { key: "unmapped", label: "🔴 매핑 없음" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      style={{
                        padding: "5px 14px",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        background:
                          isoMappingFilter === key
                            ? "var(--color-info)"
                            : "transparent",
                        color:
                          isoMappingFilter === key
                            ? "#fff"
                            : "var(--text-muted)",
                        transition: "all 0.2s",
                      }}
                      onClick={() => setIsoMappingFilter(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    marginLeft: "8px",
                  }}
                >
                  통제그룹 기준 {mappingTableData.length}건 표시
                </span>
              </div>

              {/* ISO ↔ ISMS-P 매핑 테이블 */}
              <div className="section-card" style={{ marginBottom: "20px" }}>
                <h3 className="card-title" style={{ marginBottom: "12px" }}>
                  <GitCompare size={16} /> ISO 27001 ↔ ISMS-P 통제항목 대응 매핑
                  테이블
                </h3>
                <p className="section-subtitle" style={{marginBottom:"12px"}}>ISO 27001 매핑이 확인된 통제는 2025년 기준 ‘적합’으로 표시하고, 바로 옆에서 2026년 당해연도 문서·승인·운영증적의 현행화 상태를 별도로 관리합니다.</p>
                <div style={{ overflowX: "auto" }}>
                  <table className="matrix-table iso-mapping-table">
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>ISO 통제</th>
                        <th style={{ width: "180px" }}>ISO 통제명</th>
                        <th style={{ width: "80px" }}>ISO 도메인</th>
                        <th style={{ width: "95px" }}>SoA 적용대상</th>
                        <th>대응 ISMS-P 항목</th>
                        <th style={{ width: "100px" }}>ISO 27001 평가</th>
                        <th style={{ width: "150px" }}>2026년 현행화</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappingTableData.map(g => {
                        const hasMapped = g.isms_items.length > 0;
                        const mappedReqs=g.isms_items.map(item=>item.req_id);
                        const mappedTasks=tasks.filter(task=>mappedReqs.includes(task.req_id));
                        const currentYear=String(operatingYear);
                        const linkedEvidence=evidences.filter(evidence=>mappedReqs.includes(evidence.req_id)&&evidence.verification_status!=="증적제외");
                        const currentVerified=linkedEvidence.filter(evidence=>evidence.verification_status==="검증완료"&&(evidence.source_type==="업로드"||evidence.created_at.includes(currentYear)));
                        const hasExecution=mappedTasks.some(task=>task.evidence_files.length>0||task.checklists.some(item=>item.checked)||task.status==="완료"||task.status==="승인대기");
                        const currentization=currentVerified.length>0?"현행화 완료":hasExecution?"현행화 진행중":"현행화 필요";
                        return (
                          <tr
                            key={g.control_no}
                            className=""
                          >
                            <td
                              style={{
                                fontWeight: 700,
                                color: "var(--color-info)",
                                fontFamily: "monospace",
                              }}
                            >
                              {g.control_no}
                            </td>
                            <td
                              style={{ fontWeight: 600, fontSize: "0.85rem" }}
                            >
                              {g.control_name}
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "0.7rem",
                                  color: "var(--text-muted)",
                                  fontWeight: 400,
                                }}
                              >
                                {g.iso_items.length}개 세부항목
                              </span>
                            </td>
                            <td
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {g.domain.split(" ")[0]}
                            </td>
                            <td>
                              <span
                                className={`status-badge ${g.iso_status === "적용" ? "in-progress" : "pending"}`}
                              >
                                {g.iso_status === "적용"
                                  ? "적용대상"
                                  : "부분적용"}
                              </span>
                            </td>
                            <td>
                              {hasMapped ? (
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "4px",
                                  }}
                                >
                                  {g.isms_items.map(m => (
                                    <div
                                      key={m.req_id}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: "0.75rem",
                                          background: "var(--color-info-bg)",
                                          color: "var(--color-info)",
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                          fontFamily: "monospace",
                                          fontWeight: 700,
                                        }}
                                      >
                                        {m.req_id}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "0.75rem",
                                          color: "var(--text-secondary)",
                                        }}
                                      >
                                        {m.subject}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span
                                  style={{
                                    color: "var(--color-danger)",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  🔴 ISMS-P 매핑 없음 (신규 구축 필요)
                                </span>
                              )}
                            </td>
                            <td>
                              {hasMapped ? (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    background: "var(--color-success-bg)",
                                    color: "var(--color-success)",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontWeight: 600,
                                  }}
                                >
                                  적합
                                </span>
                              ) : (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    background: "var(--color-danger-bg)",
                                    color: "var(--color-danger)",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontWeight: 600,
                                  }}
                                >
                                  평가 필요
                                </span>
                              )}
                            </td>
                            <td>
                              {hasMapped ? (
                                <div><span className={`status-badge ${currentization==="현행화 완료"?"completed":currentization==="현행화 진행중"?"in-progress":"pending"}`}>{currentization}</span><small style={{display:"block",marginTop:"4px",color:"var(--text-muted)"}}>{currentization==="현행화 완료"?`2026 검증증적 ${currentVerified.length}건`:currentization==="현행화 진행중"?"체크·증적·승인 이력 있음":linkedEvidence.length>0?`2025 자료 ${linkedEvidence.length}건 재검토 필요`:"2026 증적 등록 필요"}</small></div>
                              ) : (
                                <span
                                  style={{
                                    color: "var(--text-muted)",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  해당없음
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gap 분석: ISMS-P 전용 항목 */}
              <div className="section-card">
                <h3 className="card-title" style={{ marginBottom: "4px" }}>
                  <AlertCircle
                    size={16}
                    style={{ color: "var(--color-warning)" }}
                  />
                  ISMS-P 전환 Gap 분석 — ISO 27001으로 커버되지 않는 추가 필요
                  항목 ({ismsGapItems.length}개)
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    marginBottom: "16px",
                  }}
                >
                  아래 항목들은 ISO 27001 인증 범위에 포함되지 않아 ISMS-P 전환
                  시 신규 구축이 필요한 통제항목입니다. 특히
                  3영역(개인정보처리단계별 요구사항)은 한국 특화 요건으로 전체
                  21개가 Gap에 해당합니다.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                  }}
                >
                  {ismsGapItems.map(g => {
                    const isPersonalData = g.req_id.startsWith("3.");
                    return (
                      <div
                        key={g.req_id}
                        style={{
                          background: "var(--bg-tertiary)",
                          border: `1px solid ${isPersonalData ? "var(--color-danger)" : "var(--color-warning)"}`,
                          borderRadius: "8px",
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              color: isPersonalData
                                ? "var(--color-danger)"
                                : "var(--color-warning)",
                            }}
                          >
                            {g.req_id}
                          </span>
                          {isPersonalData && (
                            <span
                              style={{
                                fontSize: "0.65rem",
                                background: "var(--color-danger-bg)",
                                color: "var(--color-danger)",
                                padding: "1px 5px",
                                borderRadius: "3px",
                              }}
                            >
                              개인정보 특화
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.82rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {g.subject}
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            marginTop: "2px",
                          }}
                        >
                          {g.compliance_cycle}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ==========================================
          MODALS & OVERLAYS
          ========================================== */}

      {/* 1. 사내 규정/지침 조회 모달 (Policy Reader) */}
      {selectedPolicy && (
        <div
          className="lightbox-overlay"
          onClick={() => setSelectedPolicy(null)}
        >
          <div
            className="lightbox-content"
            style={{ width: "600px", height: "fit-content" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <div>
                <span className="lightbox-title">
                  {selectedPolicy.policy_name}
                </span>
                <span
                  className="lightbox-subtitle"
                  style={{ display: "block" }}
                >
                  최종 개정일: {selectedPolicy.last_revised_at}
                </span>
              </div>
              <button
                className="lightbox-close-btn"
                onClick={() => setSelectedPolicy(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div
              className="lightbox-body"
              style={{ padding: "24px", alignItems: "stretch" }}
            >
              <div
                className="policy-mapping-card"
                style={{
                  background: "var(--bg-tertiary)",
                  borderLeft: "4px solid var(--border-focus)",
                  margin: 0,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  {selectedPolicy.article_no}
                </span>
                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.6",
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                  }}
                >
                  {selectedPolicy.content}
                </p>
              </div>
            </div>
            <div className="lightbox-footer">
              <button
                className="action-btn primary"
                onClick={() => setSelectedPolicy(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 증적 바로보기 라이트박스 뷰어 (Document PDF Viewer Modal) */}
      {lightboxFile &&
        !isDemoEvidence(lightboxFile.name, lightboxFile.hash) && (
          <div
            className="lightbox-overlay"
            onClick={() => setLightboxFile(null)}
          >
            <div
              className="lightbox-content"
              onClick={e => e.stopPropagation()}
            >
              <div className="lightbox-header">
                <div className="lightbox-title-sec">
                  <span className="lightbox-title">
                    증적 미리보기: {lightboxFile.name} ({lightboxFile.size})
                  </span>
                  <span className="lightbox-subtitle">
                    SHA-256 HASH CHECK: {lightboxFile.hash}
                  </span>
                </div>
                <button
                  className="lightbox-close-btn"
                  onClick={() => setLightboxFile(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="lightbox-body evidence-metadata-view">
                <FileCheck size={44} />
                <h3>실제 문서 본문을 생성하지 않습니다</h3>
                <p>
                  이 화면은 등록된 원본의 메타데이터만 제공합니다. 파일 내용,
                  서명, 점검결과를 임의로 구성하지 않습니다.
                </p>
                <dl>
                  <dt>파일명</dt>
                  <dd>{lightboxFile.name}</dd>
                  <dt>원본 경로</dt>
                  <dd>{lightboxFile.path}</dd>
                  <dt>등록 시점</dt>
                  <dd>{lightboxFile.date || "기록 없음"}</dd>
                  <dt>등록 주체</dt>
                  <dd>{lightboxFile.creator || "기록 없음"}</dd>
                  <dt>등록 SHA-256</dt>
                  <dd className="hash-value">{lightboxFile.hash}</dd>
                </dl>
              </div>
              <div className="lightbox-footer">
                <button
                  className="action-btn"
                  onClick={() => {
                    logAction(
                      currentRole,
                      "INTEGRITY_VERIFICATION",
                      `라이트박스 뷰어 내부 해시 무결성 검사 실행. 파일: ${lightboxFile.name}`,
                      "SUCCESS"
                    );
                    showToast(
                      "등록된 SHA-256 값을 확인했습니다. 실제 무결성 확정에는 원본 파일 재계산이 필요합니다.",
                      "info"
                    );
                  }}
                >
                  등록 해시값 확인
                </button>
                <button
                  className="action-btn primary"
                  onClick={() => setLightboxFile(null)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

      {/* 3. 심사원 신규 질문 등록 모달 */}
      {showNewQAModal && (
        <div
          className="lightbox-overlay"
          onClick={() => setShowNewQAModal(false)}
        >
          <div
            className="lightbox-content"
            style={{ width: "500px", height: "fit-content" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <span className="lightbox-title">
                신규 심사 질의사항(Q&A) 작성
              </span>
              <button
                className="lightbox-close-btn"
                onClick={() => setShowNewQAModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div
              className="lightbox-body"
              style={{ padding: "20px", alignItems: "stretch" }}
            >
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <span className="form-label">관련 통제성 점검 항목 선택:</span>
                <select
                  className="filter-select"
                  value={newQAReqId}
                  onChange={e => setNewQAReqId(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {initialRequirements.map(r => (
                    <option key={r.req_id} value={r.req_id}>
                      [{r.req_id}] {r.subject}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <span className="form-label">질의 내용 입력:</span>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="증적이 미흡하거나 추가적인 소명이 필요한 사유를 기술하십시오..."
                  value={newQAQuestion}
                  onChange={e => setNewQAQuestion(e.target.value)}
                />
              </div>
            </div>
            <div className="lightbox-footer">
              <button
                className="action-btn"
                onClick={() => setShowNewQAModal(false)}
              >
                취소
              </button>
              <button
                className="action-btn primary"
                onClick={() => {
                  handleAddAuditorQA(newQAReqId, newQAQuestion);
                  setNewQAQuestion("");
                  setShowNewQAModal(false);
                }}
              >
                질문 발송
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 알림창 */}
      {toast && (
        <div className="toast-notification">
          <CheckCircle2
            size={18}
            style={{
              color:
                toast.type === "success"
                  ? "var(--color-success)"
                  : toast.type === "warning"
                    ? "var(--color-danger)"
                    : "var(--color-info)",
            }}
          />
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}
