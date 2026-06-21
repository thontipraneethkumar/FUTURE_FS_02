const STATUS_LABEL = {
  new: 'New',
  contacted: 'Contacted',
  converted: 'Converted',
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LeadTable({ leads, loading, onOpenLead }) {
  if (loading) {
    return <div className="table-empty">Loading leads…</div>;
  }

  if (!leads.length) {
    return (
      <div className="table-empty">
        <p>No leads match these filters.</p>
        <p className="table-empty-sub">New submissions from your contact form will show up here.</p>
      </div>
    );
  }

  return (
    <div className="lead-table-wrap">
      <table className="lead-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Source</th>
            <th>Received</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} onClick={() => onOpenLead(lead.id)} className="lead-row">
              <td className="mono lead-id">#{String(lead.id).padStart(4, '0')}</td>
              <td className="lead-name">{lead.name}</td>
              <td className="lead-email">{lead.email}</td>
              <td>{lead.source}</td>
              <td className="mono">{formatDate(lead.created_at)}</td>
              <td>
                <span className={`status-tag status-${lead.status}`}>
                  {STATUS_LABEL[lead.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
