/**
 * Redeemers International School — Admin Auth
 *
 * Primary: PHP API (api/admin-login.php, api/admin-logout.php, api/admin-me.php)
 * Fallback: sessionStorage mock (for Vite dev without PHP)
 */

import { clearCsrfToken } from './csrf.js';

const ADMIN_SESSION_KEY = 'redeemers_admin_session_v1';

const MOCK_ADMIN = {
  id: 'admin-1',
  name: 'Frontend Admin',
  username: 'admin',
  role: 'Super Admin',
};

// -------------------------------------------------------
// API mode detection
// -------------------------------------------------------
let apiAvailable = null;

async function isApiAvailable() {
  if (apiAvailable !== null) return apiAvailable;
  try {
    const res = await fetch('api/admin-me.php', { credentials: 'include' });
    // 200 or 401 both mean the PHP backend exists
    apiAvailable = res.ok || res.status === 401;
  } catch {
    apiAvailable = false;
  }
  return apiAvailable;
}

// -------------------------------------------------------
// Login
// -------------------------------------------------------
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
        return { ok: true, session: { user: data.admin } };
      }
      return { ok: false, message: data.message || 'Invalid credentials.' };
    } catch {
      return { ok: false, message: 'Network error. Please try again.' };
    }
  }

  // sessionStorage mock fallback
  const userValue = String(username || '').trim().toLowerCase();
  const passValue = String(password || '').trim();
  if (userValue !== 'admin' || passValue !== 'admin123') {
    return { ok: false, message: 'Invalid admin credentials.' };
  }
  const session = {
    token: `mock-${Math.random().toString(36).slice(2, 12)}`,
    user: MOCK_ADMIN,
    loggedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

// -------------------------------------------------------
// Logout
// -------------------------------------------------------
export async function logout() {
  clearCsrfToken();

  if (await isApiAvailable()) {
    try {
      await fetch('api/admin-logout.php', { method: 'POST', credentials: 'include' });
    } catch { /* ok */ }
  }

  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

// -------------------------------------------------------
// Get current admin
// -------------------------------------------------------
export async function getCurrentAdmin() {
  if (await isApiAvailable()) {
    try {
      const res = await fetch('api/admin-me.php', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        return data.admin || null;
      }
    } catch { /* fall through */ }
    return null;
  }

  // sessionStorage mock fallback
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.user) return null;
    return parsed.user;
  } catch {
    return null;
  }
}

// -------------------------------------------------------
// Require admin (redirects if not logged in)
// -------------------------------------------------------
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    window.location.href = 'admin_login';
    return null;
  }
  return admin;
}
