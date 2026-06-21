const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('crm_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }

  return data;
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password }, auth: false }),

  getLeads: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
    ).toString();
    return request(`/leads${query ? `?${query}` : ''}`);
  },

  getLead: (id) => request(`/leads/${id}`),

  updateLead: (id, body) => request(`/leads/${id}`, { method: 'PUT', body }),

  deleteLead: (id) => request(`/leads/${id}`, { method: 'DELETE' }),

  addNote: (id, note) => request(`/leads/${id}/notes`, { method: 'POST', body: { note } }),

  getAnalytics: () => request('/leads/analytics'),
};

export { getToken };
