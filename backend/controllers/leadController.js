const pool = require('../config/db');

const VALID_STATUSES = ['new', 'contacted', 'converted'];

// GET /api/leads?status=new&search=asha&page=1&limit=10
// Used by the admin dashboard. Supports filtering by status and a
// free-text search across name/email, plus simple pagination.
async function getLeads(req, res) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];

    if (status && VALID_STATUSES.includes(status)) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeLimit = Math.min(Number(limit) || 20, 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await pool.query(
      `SELECT * FROM leads ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM leads ${whereClause}`,
      params
    );

    res.json({
      leads: rows,
      total: countRows[0].total,
      page: safePage,
      limit: safeLimit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch leads.' });
  }
}

// GET /api/leads/:id  (includes its notes)
async function getLeadById(req, res) {
  try {
    const { id } = req.params;
    const [leadRows] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);

    if (leadRows.length === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const [noteRows] = await pool.query(
      'SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json({ ...leadRows[0], notes: noteRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch lead.' });
  }
}

// POST /api/public/leads
// This is the endpoint a public website contact form would call.
// No authentication required, since visitors aren't admins.
async function createLead(req, res) {
  try {
    const { name, email, phone, source, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO leads (name, email, phone, source, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, source || 'website', message || null]
    );

    const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save lead.' });
  }
}

// PUT /api/leads/:id  — update status and/or contact details
async function updateLead(req, res) {
  try {
    const { id } = req.params;
    const { status, name, email, phone, source } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const [existing] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const current = existing[0];
    await pool.query(
      'UPDATE leads SET name = ?, email = ?, phone = ?, source = ?, status = ? WHERE id = ?',
      [
        name ?? current.name,
        email ?? current.email,
        phone ?? current.phone,
        source ?? current.source,
        status ?? current.status,
        id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update lead.' });
  }
}

// DELETE /api/leads/:id
async function deleteLead(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM leads WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    res.json({ message: 'Lead deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete lead.' });
  }
}

// POST /api/leads/:id/notes  — add a follow-up note
async function addNote(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Note text is required.' });
    }

    const [leadRows] = await pool.query('SELECT id FROM leads WHERE id = ?', [id]);
    if (leadRows.length === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const [result] = await pool.query(
      'INSERT INTO notes (lead_id, note) VALUES (?, ?)',
      [id, note.trim()]
    );

    const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add note.' });
  }
}

// GET /api/analytics — simple counts for the dashboard summary bar
async function getAnalytics(req, res) {
  try {
    const [totalRows] = await pool.query('SELECT COUNT(*) AS total FROM leads');
    const [statusRows] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM leads GROUP BY status'
    );

    const byStatus = { new: 0, contacted: 0, converted: 0 };
    statusRows.forEach((row) => {
      byStatus[row.status] = row.count;
    });

    const total = totalRows[0].total;
    const conversionRate = total > 0 ? Math.round((byStatus.converted / total) * 100) : 0;

    res.json({ total, byStatus, conversionRate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch analytics.' });
  }
}

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addNote,
  getAnalytics,
};
