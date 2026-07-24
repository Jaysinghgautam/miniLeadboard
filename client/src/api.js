const BASE = import.meta.env.VITE_API_URL || '';

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.fields = data.fields || null;
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function createLead(payload) {
  const res = await fetch(`${BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function fetchLeads({ q = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  const qs = params.toString();
  const res = await fetch(`${BASE}/api/leads${qs ? `?${qs}` : ''}`);
  return handle(res);
}

export async function updateLeadStatus(id, status) {
  const res = await fetch(`${BASE}/api/leads/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handle(res);
}
