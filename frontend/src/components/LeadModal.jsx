import { useEffect, useState } from 'react';
import { api } from '../api/client';

const STATUSES = ['new', 'contacted', 'converted'];

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LeadModal({ leadId, onClose, onChanged }) {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getLead(leadId)
      .then((data) => active && setLead(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [leadId]);

  async function handleStatusChange(newStatus) {
    setSavingStatus(true);
    try {
      const updated = await api.updateLead(leadId, { status: newStatus });
      setLead((prev) => ({ ...prev, status: updated.status }));
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const note = await api.addNote(leadId, noteText.trim());
      setLead((prev) => ({ ...prev, notes: [note, ...prev.notes] }));
      setNoteText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this lead permanently? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.deleteLead(leadId);
      onChanged?.();
      onClose();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {loading && <div className="modal-loading">Loading lead…</div>}

        {!loading && lead && (
          <>
            <div className="modal-header">
              <span className="mono modal-id">#{String(lead.id).padStart(4, '0')}</span>
              <h2 className="modal-name">{lead.name}</h2>
              <a href={`mailto:${lead.email}`} className="modal-email">
                {lead.email}
              </a>
              {lead.phone && <div className="modal-phone">{lead.phone}</div>}
            </div>

            {error && <div className="modal-error">{error}</div>}

            <div className="modal-section">
              <div className="modal-section-label">Status</div>
              <div className="status-options">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    className={`status-pill status-${s} ${lead.status === s ? 'status-pill-active' : ''}`}
                    onClick={() => handleStatusChange(s)}
                    disabled={savingStatus}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <div className="modal-section-label">Lead details</div>
              <div className="modal-meta-grid">
                <div>
                  <span className="modal-meta-key">Source</span>
                  <span>{lead.source}</span>
                </div>
                <div>
                  <span className="modal-meta-key">Received</span>
                  <span className="mono">{formatDateTime(lead.created_at)}</span>
                </div>
                <div>
                  <span className="modal-meta-key">Last updated</span>
                  <span className="mono">{formatDateTime(lead.updated_at)}</span>
                </div>
              </div>
              {lead.message && (
                <div className="modal-message">
                  <span className="modal-meta-key">Original message</span>
                  <p>{lead.message}</p>
                </div>
              )}
            </div>

            <div className="modal-section">
              <div className="modal-section-label">Follow-up notes</div>

              <form onSubmit={handleAddNote} className="note-form">
                <textarea
                  placeholder="Log a call, email, or next step…"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                />
                <button type="submit" disabled={savingNote || !noteText.trim()}>
                  {savingNote ? 'Saving…' : 'Add note'}
                </button>
              </form>

              <div className="note-list">
                {lead.notes.length === 0 && (
                  <div className="note-empty">No notes yet. Add the first follow-up above.</div>
                )}
                {lead.notes.map((n) => (
                  <div key={n.id} className="note-item">
                    <span className="mono note-date">{formatDateTime(n.created_at)}</span>
                    <p>{n.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="modal-delete" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete lead'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
