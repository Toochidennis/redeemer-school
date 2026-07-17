/**
 * Redeemers International Secondary School — News Service
 *
 * Primary: PHP API (api/news.php, api/admin-news.php)
 * Fallback: localStorage (for Vite dev without PHP)
 */

import { DEFAULT_NEWS_POSTS } from './news-data.js';

// -------------------------------------------------------
// localStorage fallback (dev only)
// -------------------------------------------------------
const NEWS_STORAGE_KEY = 'redeemers_news_posts_v1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureStore() {
  if (localStorage.getItem(NEWS_STORAGE_KEY)) return;
  const seeded = DEFAULT_NEWS_POSTS.map((post) => ({
    ...post,
    status: post.status === 'Published' ? 'Published' : 'Draft',
    updatedAt: post.updatedAt || '',
  }));
  localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(seeded));
}

function readStore() {
  ensureStore();
  try {
    return JSON.parse(localStorage.getItem(NEWS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeStore(posts) {
  localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(posts));
}

function toSlug(value) {
  return String(value || '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// -------------------------------------------------------
// API mode detection
// -------------------------------------------------------
let apiAvailable = null;

async function isApiAvailable() {
  if (apiAvailable !== null) return apiAvailable;
  try {
    const res = await fetch('api/news.php', { method: 'HEAD' });
    apiAvailable = res.ok || res.status === 405; // 405 = exists but HEAD not allowed, server is PHP
    if (res.status === 200 || res.status === 405 || res.status === 401 || res.status === 404) {
      apiAvailable = true;
    }
  } catch {
    apiAvailable = false;
  }
  return apiAvailable;
}

// -------------------------------------------------------
// Public API
// -------------------------------------------------------
export async function getPublicNews() {
  if (await isApiAvailable()) {
    try {
      const res = await fetch('api/news.php', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        return data.news || [];
      }
    } catch { /* fall through to fallback */ }
  }

  // localStorage fallback
  const posts = readStore().filter((p) => p.status === 'Published');
  posts.sort((a, b) => {
    const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
    const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
    return tb - ta;
  });
  return clone(posts);
}

export async function getNewsBySlug(slug) {
  if (!slug) return null;

  if (await isApiAvailable()) {
    try {
      const res = await fetch(`api/news.php?slug=${encodeURIComponent(slug)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        return data.post || null;
      }
    } catch { /* fall through */ }
  }

  // localStorage fallback
  const post = readStore().find((p) => p.slug === slug && p.status === 'Published');
  return post ? clone(post) : null;
}

// -------------------------------------------------------
// Admin API
// -------------------------------------------------------
export async function getAdminNews() {
  if (await isApiAvailable()) {
    try {
      const res = await fetch('api/admin-news.php', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        return data.news || [];
      }
      if (res.status === 401) return [];
    } catch { /* fall through */ }
  }

  // localStorage fallback
  const posts = readStore();
  posts.sort((a, b) => {
    const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
    const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
    return tb - ta;
  });
  return clone(posts);
}

export async function getAdminNewsById(id) {
  if (!id) return null;

  if (await isApiAvailable()) {
    try {
      const res = await fetch(`api/admin-news.php?id=${encodeURIComponent(id)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        return data.post || null;
      }
    } catch { /* fall through */ }
  }

  // localStorage fallback
  const post = readStore().find((p) => p.id === id);
  return post ? clone(post) : null;
}

export async function createNews(payload) {
  if (await isApiAvailable()) {
    try {
      const { csrfFetch } = await import('./csrf.js');
      const res = await csrfFetch('api/admin-news.php', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.post || null;
      }
    } catch { /* fall through */ }
  }

  // localStorage fallback
  const posts = readStore();
  const item = {
    id: `news-${Math.random().toString(36).slice(2, 10)}`,
    slug: toSlug(payload.slug || payload.title),
    category: payload.category || 'Notice',
    title: payload.title || 'Untitled',
    summary: payload.summary || '',
    content: payload.content || '',
    image: payload.image || 'redeemers/optimized/campus.webp',
    imageLabel: payload.imageLabel || 'School Image',
    status: payload.status === 'published' || payload.status === 'Published' ? 'Published' : 'Draft',
    updatedAt: new Date().toISOString(),
  };
  posts.unshift(item);
  writeStore(posts);
  return clone(item);
}

export async function updateNews(id, payload) {
  if (await isApiAvailable()) {
    try {
      const { csrfFetch } = await import('./csrf.js');
      const res = await csrfFetch(`api/admin-news.php?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.post || null;
      }
    } catch { /* fall through */ }
  }

  // localStorage fallback
  const posts = readStore();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  posts[idx] = { ...posts[idx], ...payload, slug: toSlug(payload.slug || payload.title || posts[idx].slug), status: payload.status === 'published' || payload.status === 'Published' ? 'Published' : 'Draft', updatedAt: new Date().toISOString() };
  writeStore(posts);
  return clone(posts[idx]);
}

export async function uploadNewsImage(file) {
  if (!file) return null;

  if (await isApiAvailable()) {
    const { csrfFetch } = await import('./csrf.js');
    const body = new FormData();
    body.append('image', file);
    const res = await csrfFetch('api/upload-news-image.php', {
      method: 'POST',
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Image upload failed.');
    }
    return data.image || null;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Image upload failed.'));
    reader.readAsDataURL(file);
  });
}

export async function deleteNews(id) {
  if (await isApiAvailable()) {
    try {
      const { csrfFetch } = await import('./csrf.js');
      const res = await csrfFetch(`api/admin-news.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // localStorage fallback
  const posts = readStore();
  const filtered = posts.filter((p) => p.id !== id);
  writeStore(filtered);
  return filtered.length !== posts.length;
}

export async function publishNews(id) {
  if (await isApiAvailable()) {
    try {
      const { csrfFetch } = await import('./csrf.js');
      const res = await csrfFetch(`api/admin-news.php?action=publish&id=${encodeURIComponent(id)}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.post || null;
      }
    } catch { /* fall through */ }
  }

  // localStorage fallback
  const posts = readStore();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  posts[idx].status = 'Published';
  posts[idx].updatedAt = new Date().toISOString();
  writeStore(posts);
  return clone(posts[idx]);
}

export async function unpublishNews(id) {
  if (await isApiAvailable()) {
    try {
      const { csrfFetch } = await import('./csrf.js');
      const res = await csrfFetch(`api/admin-news.php?action=unpublish&id=${encodeURIComponent(id)}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.post || null;
      }
    } catch { /* fall through */ }
  }

  // localStorage fallback
  const posts = readStore();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  posts[idx].status = 'Draft';
  posts[idx].updatedAt = new Date().toISOString();
  writeStore(posts);
  return clone(posts[idx]);
}

export async function resetNewsStore() {
  localStorage.removeItem(NEWS_STORAGE_KEY);
  ensureStore();
}
