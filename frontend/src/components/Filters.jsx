const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
];

export default function Filters({ search, onSearchChange, status, onStatusChange }) {
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="filters-search"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="filters-select"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
