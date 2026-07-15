export type MatrixViewMode = 'accordion' | 'flat';

interface MatrixToolbarProps {
  resultCount: number;
  viewMode: MatrixViewMode;
  onViewModeChange: (mode: MatrixViewMode) => void;
  onReset: () => void;
}

export function MatrixToolbar({ resultCount, viewMode, onViewModeChange, onReset }: MatrixToolbarProps) {
  return (
    <div className="matrix-toolbar">
      <div>
        <h2>ISMS-P 통합 통제성 매트릭스</h2>
        <p>{resultCount}개 점검항목 · 소분류별 운영현황, 기록(증적), 관련문서 현황 관리</p>
      </div>
      <div className="matrix-toolbar-actions">
        <div className="matrix-view-toggle" role="group" aria-label="매트릭스 보기 방식">
          <button className={viewMode === 'accordion' ? 'active' : ''} onClick={() => onViewModeChange('accordion')}>🗂 그룹보기</button>
          <button className={viewMode === 'flat' ? 'active' : ''} onClick={() => onViewModeChange('flat')}>☰ 전체보기</button>
        </div>
        <button className="action-btn" onClick={onReset}>초기화</button>
      </div>
    </div>
  );
}

interface MatrixFiltersProps {
  totalCount: number;
  category: string;
  status: string;
  searchQuery: string;
  viewMode: MatrixViewMode;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function MatrixFilters({
  totalCount,
  category,
  status,
  searchQuery,
  viewMode,
  onCategoryChange,
  onStatusChange,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
}: MatrixFiltersProps) {
  return (
    <div className="filter-bar matrix-filter-bar">
      <select className="filter-select" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
        <option value="all">📂 대분류: 전체 ({totalCount}개)</option>
        <option value="1. 관리체계 수립 및 운영">1. 관리체계 수립 및 운영 (16개)</option>
        <option value="2. 보호대책 요구사항">2. 보호대책 요구사항 (64개)</option>
        <option value="3. 개인정보 처리단계별 요구사항">3. 개인정보 처리단계별 요구사항 (21개)</option>
      </select>
      <select className="filter-select" value={status} onChange={(event) => onStatusChange(event.target.value)}>
        <option value="all">🔵 상태: 전체</option>
        <option value="완료">✅ 완료</option>
        <option value="승인대기">🟡 승인대기</option>
        <option value="진행중">🔵 진행중</option>
        <option value="미흡">🔴 미흡</option>
      </select>
      <input
        className="search-input matrix-search-input"
        placeholder="🔍 항목번호 또는 점검항목명 검색..."
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {viewMode === 'accordion' && (
        <>
          <button className="action-btn" onClick={onExpandAll}>모두 펼치기</button>
          <button className="action-btn" onClick={onCollapseAll}>모두 접기</button>
        </>
      )}
    </div>
  );
}
