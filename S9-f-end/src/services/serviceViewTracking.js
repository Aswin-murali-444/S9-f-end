/**
 * Track which services a customer opened (booking intent).
 * Persists to localStorage immediately; upserts to Supabase when `customer_service_views` exists (see S9-b-end/create-customer-service-views.sql).
 */

const LS_PREFIX = 'cd_svc_views_';

export function pushLocalServiceView(authUserId, serviceId) {
  if (!authUserId || serviceId == null || serviceId === '') return;
  const sid = String(serviceId);
  const key = LS_PREFIX + authUserId;
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '[]');
    const rest = Array.isArray(raw) ? raw.filter((x) => x && String(x.serviceId) !== sid) : [];
    const next = [{ serviceId: sid, t: Date.now() }, ...rest];
    localStorage.setItem(key, JSON.stringify(next.slice(0, 40)));
  } catch {
    /* ignore */
  }
}

export function readLocalServiceViews(authUserId) {
  if (!authUserId) return [];
  try {
    const raw = JSON.parse(localStorage.getItem(LS_PREFIX + authUserId) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

/** Fire-and-forget: local first, then DB upsert (silent if table/RLS missing). */
export async function recordServiceView(supabase, authUserId, serviceId) {
  if (!authUserId || serviceId == null || serviceId === '') return;
  pushLocalServiceView(authUserId, serviceId);
  try {
    const { data: u, error: ue } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (ue || !u?.id) return;
    const { error } = await supabase.from('customer_service_views').upsert(
      {
        user_id: u.id,
        service_id: String(serviceId),
        viewed_at: new Date().toISOString()
      },
      { onConflict: 'user_id,service_id' }
    );
    if (error) {
      const msg = String(error.message || '');
      if (!msg.includes('does not exist') && !msg.includes('relation')) {
        console.warn('[recordServiceView]', msg);
      }
    }
  } catch (e) {
    /* offline or table not created */
  }
}

export async function fetchDbServiceViews(supabase, authUserId) {
  if (!authUserId) return [];
  try {
    const { data: u } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (!u?.id) return [];
    const { data, error } = await supabase
      .from('customer_service_views')
      .select('service_id, viewed_at')
      .eq('user_id', u.id)
      .order('viewed_at', { ascending: false })
      .limit(60);
    if (error) return [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Merge local + DB timestamps per service (latest wins). */
export function mergeViewTimestamps(localList, dbList) {
  const map = new Map();
  for (const item of localList || []) {
    if (!item?.serviceId) continue;
    const sid = String(item.serviceId);
    const ts = typeof item.t === 'number' ? item.t : new Date(item.t).getTime();
    if (!Number.isNaN(ts)) map.set(sid, Math.max(map.get(sid) || 0, ts));
  }
  for (const r of dbList || []) {
    if (!r?.service_id) continue;
    const sid = String(r.service_id);
    const ts = new Date(r.viewed_at).getTime();
    if (!Number.isNaN(ts)) map.set(sid, Math.max(map.get(sid) || 0, ts));
  }
  return [...map.entries()].map(([serviceId, sortTime]) => ({ serviceId, sortTime }));
}
