export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  ...(typeof window !== 'undefined' && localStorage.getItem('auth_token')
    ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
    : {}),
});

export async function getProfilePoints(storageId: string) {
  const r = await fetch(`${API}/user-data/${storageId}/profile-points`, { headers: authHeaders() });
  if (!r.ok) throw new Error('Failed to fetch profile points');
  return r.json();
}

export async function postProfilePoint(storageId: string, body: any) {
  const r = await fetch(`${API}/user-data/${storageId}/profile-points`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('Failed to create profile point');
  return r.json();
}

export async function deleteProfilePointApi(storageId: string, id: string) {
  const r = await fetch(`${API}/user-data/${storageId}/profile-points/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!r.ok) throw new Error('Failed to delete profile point');
  return r.json?.() ?? {};
}

