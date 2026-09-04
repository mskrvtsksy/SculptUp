type RestOptions = Omit<RequestInit, 'headers'> & { headers?: Record<string, string> };

function getConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

/** Server-only access. Never import this module into src/. */
export async function supabaseRest(path: string, options: RestOptions = {}) {
  const config = getConfig();
  if (!config) {
    const error = new Error('DATABASE_NOT_CONFIGURED');
    (error as Error & { status?: number }).status = 503;
    throw error;
  }
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = new Error('DATABASE_REQUEST_FAILED');
    (error as Error & { status?: number }).status = 502;
    throw error;
  }
  return response;
}
