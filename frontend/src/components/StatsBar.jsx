export default function StatsBar({ stats }) {
  if (!stats) return null;

  const items = [
    { label: 'Total leads', value: stats.total, mono: true },
    { label: 'New', value: stats.byStatus.new, accent: 'new' },
    { label: 'Contacted', value: stats.byStatus.contacted, accent: 'contacted' },
    { label: 'Converted', value: stats.byStatus.converted, accent: 'converted' },
    { label: 'Conversion rate', value: `${stats.conversionRate}%`, mono: true },
  ];

  return (
    <div className="stats-bar">
      {items.map((item) => (
        <div className="stat" key={item.label}>
          <span
            className={`stat-value ${item.mono ? 'mono' : ''} ${item.accent ? `stat-${item.accent}` : ''}`}
          >
            {item.value}
          </span>
          <span className="stat-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
