import { clearCsrfToken } from './csrf.js';

let apiAvailable = null;
let cachedAdmin = null;

async function isApiAvailable() {
  if (apiAvailable !== null) return apiAvailable;
  try {
    const res = await fetch('api/admin-me.php', { credentials: 'include' });
    apiAvailable = res.ok || res.status === 401;
  } catch {
    apiAvailable = false;
  }
  return apiAvailable;
}

export async function login(username, password) {
  if (await isApiAvailable()) {
    try {
      const res = await fetch('api/admin-login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        cachedAdmin = data.admin || { username };
        return { ok: true, session: { user: data.admin } };
      }
      return { ok: false, message: data.message || 'Invalid credentials.' };
    } catch {
      return { ok: false, message: 'Network error. Please try again.' };
    }
  }

  return { ok: false, message: 'Admin login is unavailable right now.' };
}

export async function logout() {
  clearCsrfToken();
  cachedAdmin = null;

  if (await isApiAvailable()) {
    try {
      await fetch('api/admin-logout.php', { method: 'POST', credentials: 'include' });
    } catch { /* ok */ }
  }
}

export async function getCurrentAdmin() {
  if (cachedAdmin) return cachedAdmin;

  if (await isApiAvailable()) {
    try {
      const res = await fetch('api/admin-me.php', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        cachedAdmin = data.admin || null;
        return cachedAdmin;
      }
    } catch { /* fall through */ }
    return null;
  }
  return null;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    window.location.href = 'admin_login';
    return null;
  }
  return admin;
}
