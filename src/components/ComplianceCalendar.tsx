import { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { SecurityTask, TaskStatus } from '../models/compliance';

export type CalendarTask = Pick<SecurityTask, 'task_id' | 'title' | 'due_date' | 'status'>;

interface ComplianceCalendarProps {
  tasks: CalendarTask[];
  onRunScheduler: () => void;
  onSelectTask: (taskId: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function dateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function statusClass(status: TaskStatus) {
  if (status === '완료') return 'completed';
  if (status === '승인대기') return 'pending-approval';
  if (status === '진행중') return 'in-progress';
  return 'overdue';
}

export function ComplianceCalendar({ tasks, onRunScheduler, onSelectTask }: ComplianceCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = viewMonth.getFullYear();
  const monthIndex = viewMonth.getMonth();

  const tasksByDate = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    tasks.forEach((task) => map.set(task.due_date, [...(map.get(task.due_date) ?? []), task]));
    return map;
  }, [tasks]);

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(year, monthIndex, index - firstWeekday + 1);
      const cellYear = date.getFullYear();
      const cellMonth = date.getMonth();
      const day = date.getDate();
      const key = dateKey(cellYear, cellMonth, day);
      return { key, day, isCurrentMonth: cellMonth === monthIndex, tasks: tasksByDate.get(key) ?? [] };
    });
  }, [monthIndex, tasksByDate, year]);

  const moveMonth = (offset: number) => setViewMonth(new Date(year, monthIndex + offset, 1));

  return (
    <div className="section-card calendar-widget">
      <h3 className="card-title"><Calendar size={18} />{year}년 {monthIndex + 1}월 보안 컴플라이언스 캘린더</h3>
      <div className="calendar-header">
        <div className="calendar-month-nav">
          <button type="button" className="calendar-nav-btn" onClick={() => moveMonth(-1)} aria-label="이전 달"><ChevronLeft size={16} /></button>
          <strong>{year}.{String(monthIndex + 1).padStart(2, '0')}</strong>
          <button type="button" className="calendar-nav-btn" onClick={() => moveMonth(1)} aria-label="다음 달"><ChevronRight size={16} /></button>
        </div>
        <button className="action-btn" onClick={onRunScheduler}><Plus size={14} /> 정기 태스크 발행</button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((day) => <div key={day} className="calendar-day-label">{day}</div>)}
        {cells.map((cell) => {
          const isToday = cell.key === dateKey(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <button
              type="button"
              key={cell.key}
              className={`calendar-cell ${cell.isCurrentMonth ? '' : 'different-month'} ${isToday ? 'today' : ''} ${cell.tasks.length > 0 ? 'has-events' : ''}`}
              onClick={() => cell.tasks[0] && onSelectTask(cell.tasks[0].task_id)}
              disabled={cell.tasks.length === 0}
            >
              <span className="calendar-day-num">{cell.day}</span>
              <span className="calendar-events">
                {cell.tasks.slice(0, 2).map((task) => (
                  <span key={task.task_id} className="calendar-cell-event-title" title={task.title}>
                    <span className={`calendar-event-dot ${statusClass(task.status)}`} />
                    {task.title.length > 10 ? `${task.title.substring(0, 10)}…` : task.title}
                  </span>
                ))}
                {cell.tasks.length > 2 && <span className="calendar-more">+{cell.tasks.length - 2}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
