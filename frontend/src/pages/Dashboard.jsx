import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatsBar from '../components/StatsBar';
import Filters from '../components/Filters';
import LeadTable from '../components/LeadTable';
import LeadModal from '../components/LeadModal';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { admin, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [activeLeadId, setActiveLeadId] = useState(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLeads({ search, status });
      setLeads(data.leads);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  const loadStats = useCallback(async () => {
    try {
      const data = await api.getAnalytics();
      setStats(data);
    } catch (err) {
      // Analytics failing shouldn't block the rest of the dashboard.
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadLeads, 250); // debounce search typing
    return () => clearTimeout(timer);
  }, [loadLeads]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  function handleLeadChanged() {
    loadLeads();
    loadStats();
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="dashboard-tab">LEAD DESK</span>
          <h1>Client leads</h1>
        </div>
        <div className="dashboard-admin">
          <span>{admin?.username}</span>
          <button onClick={logout} className="logout-btn">
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <StatsBar stats={stats} />

        <div className="dashboard-toolbar">
          <Filters
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
          />
        </div>

        {error && <div className="dashboard-error">{error}</div>}

        <LeadTable leads={leads} loading={loading} onOpenLead={setActiveLeadId} />
      </main>

      {activeLeadId && (
        <LeadModal
          leadId={activeLeadId}
          onClose={() => setActiveLeadId(null)}
          onChanged={handleLeadChanged}
        />
      )}
    </div>
  );
}
