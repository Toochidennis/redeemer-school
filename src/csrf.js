/**
 * Redeemers International Secondary School — CSRF helper for admin API calls.
 *
 * Usage:
 *   const res = await csrfFetch('api/admin-news.php', { method: 'POST', body: JSON.stringify(payload) });
 */

let cachedToken = null;

export async function getCsrfToken() {
  if (cachedToken) return cachedToken;

  const res = await fetch('api/csrf.php', { credentials: 'include' });
  if (!res.ok) {
    cachedToken = null;
    return null;
  }

  const data = await res.json();
  cachedToken = data?.csrfToken || null;
  return cachedToken;
}

export function clearCsrfToken() {
  cachedToken = null;
}

export async function csrfFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  const headers = { ...(options.headers || {}) };

  // If sending JSON, set content-type
  if (options.body && typeof options.body === 'string') {
    try {
      JSON.parse(options.body);
      headers['Content-Type'] = 'application/json';
    } catch { /* not JSON */ }
  }

  // Add CSRF token for unsafe methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const token = await getCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  return fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });
}
