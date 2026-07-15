type DomainStatus = '완료' | '승인대기' | '진행중' | '미흡' | '결과없음';

export interface DomainChartStat {
  domain: string;
  reqs: number;
  stats: Record<DomainStatus, number>;
}

interface DomainStatusChartsProps {
  domains: DomainChartStat[];
}

const BAR_COLORS: Record<DomainStatus, string> = {
  완료: 'var(--color-success)',
  승인대기: 'var(--color-warning)',
  진행중: 'var(--color-info)',
  미흡: 'var(--color-danger)',
  결과없음: 'var(--text-muted)',
};

const CHART_HEIGHT = 112;

export function DomainStatusCharts({ domains }: DomainStatusChartsProps) {
  return (
    <div className="domain-chart-grid">
      {domains.map((domain) => {
        const domainShort = domain.domain.replace(/^\d+\.\s/, '');
        const barEntries = (Object.entries(domain.stats) as [DomainStatus, number][]).filter(([, value]) => value > 0);
        const maxValue = Math.max(...barEntries.map(([, value]) => value), 1);

        return (
          <div key={domain.domain} className="domain-chart-card">
            <div className="domain-chart-header">
              <div>
                <span className="domain-chart-kicker">{domain.domain.split('.')[0]}영역</span>
                <p className="domain-chart-title">{domainShort}</p>
              </div>
              <span className="domain-chart-total">{domain.reqs}</span>
            </div>

            <div className="domain-chart-plot" style={{ height: `${CHART_HEIGHT + 38}px` }}>
              {barEntries.map(([label, value]) => {
                const height = Math.max((value / maxValue) * CHART_HEIGHT, 4);
                return (
                  <div key={label} className="domain-bar-item">
                    <span className="domain-bar-value" style={{ color: BAR_COLORS[label] }}>{value}</span>
                    <div
                      className="domain-bar-column"
                      style={{ height: `${height}px`, backgroundColor: BAR_COLORS[label] }}
                      title={`${label}: ${value}`}
                    >
                      <span className="domain-bar-shine" />
                    </div>
                    <span className="domain-bar-label">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
