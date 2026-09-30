import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '../../../lib/adminAuth';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';
import AdminDashboardClient from '../../../components/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminToken(token)) {
    redirect('/admin');
  }

  let attempts = [];
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('attempts')
      .select('id, name, student_id, discipline, score, total, percentage, created_at')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (!error) attempts = data || [];
  } catch (e) {
    console.error(e);
  }

  return <AdminDashboardClient initialAttempts={attempts} />;
}
