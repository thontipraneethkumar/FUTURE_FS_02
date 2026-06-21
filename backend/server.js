require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const publicRoutes = require('./routes/public');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/public', publicRoutes);

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Generic error handler (catches anything thrown synchronously in routes)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Mini CRM API running on http://localhost:${PORT}`);
});
