import { ComplianceCalendar } from './ComplianceCalendar';
import { DashboardKpis, type TaskStatusFilter } from './DashboardKpis';
import { OrganizationProgress } from './OrganizationProgress';
import { InternalDocumentCompliance } from './InternalDocumentCompliance';
import type { Evidence, SecurityTask } from '../models/compliance';

interface DashboardViewProps {
  tasks: SecurityTask[];
  evidences: Evidence[];
  complianceRate: number;
  completedTaskCount: number;
  totalRequirementCount: number;
  overdueCount: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  onSelectStatus: (status: TaskStatusFilter) => void;
  onRunScheduler: () => void;
  onSelectTask: (taskId: string) => void;
  onEscalate: () => void;
}

export function DashboardView({
  tasks,
  evidences,
  complianceRate,
  completedTaskCount,
  totalRequirementCount,
  overdueCount,
  pendingCount,
  inProgressCount,
  completedCount,
  onSelectStatus,
  onRunScheduler,
  onSelectTask,
  onEscalate,
}: DashboardViewProps) {
  return (
    <div>
      <DashboardKpis
        complianceRate={complianceRate}
        completedTaskCount={completedTaskCount}
        totalRequirementCount={totalRequirementCount}
        overdueCount={overdueCount}
        pendingCount={pendingCount}
        inProgressCount={inProgressCount}
        completedCount={completedCount}
        onSelectStatus={onSelectStatus}
      />

      <InternalDocumentCompliance tasks={tasks} evidences={evidences} />

      <div className="dashboard-grid">
        <ComplianceCalendar tasks={tasks} onRunScheduler={onRunScheduler} onSelectTask={onSelectTask} />
        <OrganizationProgress tasks={tasks} onEscalate={onEscalate} />
      </div>
    </div>
  );
}
