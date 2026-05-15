export const ADMIN_ROLE_ALIASES = new Set(['admin', 'super-admin', 'super_admin']);

export function normalizeUserRole(role = '') {
  const normalized = String(role || '').trim().toLowerCase();
  if (!normalized) return 'user';
  if (ADMIN_ROLE_ALIASES.has(normalized)) return 'admin';
  return normalized;
}

export function isAdminRole(role = '') {
  return normalizeUserRole(role) === 'admin';
}

export function formatRoleLabel(role = '') {
  const normalized = normalizeUserRole(role);
  if (normalized === 'admin') return 'Admin';
  if (!normalized) return 'User';
  return normalized
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
