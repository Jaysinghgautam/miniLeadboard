require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const leadsRouter = require('./routes/leads');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'leaddesk-mini-api' });
});

app.use('/api/leads', leadsRouter);

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Central error handler — never crash, always return sensible JSON
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.publicMessage || 'Something went wrong on our end.',
  });
});

async function start() {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`LeadDesk Mini API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
