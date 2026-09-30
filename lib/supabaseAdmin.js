import { createClient } from '@supabase/supabase-js';

let client = null;

export function getSupabaseAdmin() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되어 있지 않습니다.');
    }
    client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return client;
}
