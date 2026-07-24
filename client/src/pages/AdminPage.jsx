import { useEffect, useState, useCallback } from 'react';
import { fetchLeads, updateLeadStatus } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeads({ q, status });
      setLeads(data);
    } catch (err) {
      setError(err.message || 'Could not load leads.');
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    const timer = setTimeout(load, 250); // debounce search typing
    return () => clearTimeout(timer);
  }, [load]);

  async function handleStatusChange(id, nextStatus) {
    const prev = leads;
    setUpdatingId(id);
    setLeads((ls) => ls.map((l) => (l._id === id ? { ...l, status: nextStatus } : l)));

    try {
      await updateLeadStatus(id, nextStatus);
    } catch (err) {
      setLeads(prev); // roll back on failure
      setError(err.message || 'Could not update status. Reverted.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="container">
      <div className="admin-header">
        <div>
          <h1>Leads</h1>
          <p>
            {loading ? 'Loading…' : `${leads.length} lead${leads.length === 1 ? '' : 's'} in view`}
          </p>
        </div>
        <div className="admin-controls">
          <input
            className="search-input"
            type="search"
            placeholder="Search name, email, message…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {error && <div className="banner error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="lead-table-wrap">
        {loading ? (
          <div className="loading-state">Loading leads…</div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            No leads match this view yet. New submissions from the landing page will show up here.
          </div>
        ) : (
          <table className="lead-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Name</th>
                <th>Budget</th>
                <th>Message</th>
                <th>Filed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td className="lead-id">#{lead._id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-email">{lead.email}</div>
                  </td>
                  <td>{lead.budgetRange}</td>
                  <td>
                    <span className="lead-message" title={lead.message}>
                      {lead.message}
                    </span>
                  </td>
                  <td className="lead-id">{formatDate(lead.createdAt)}</td>
                  <td>
                    <StatusBadge
                      status={lead.status}
                      disabled={updatingId === lead._id}
                      onChange={(next) => handleStatusChange(lead._id, next)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
