import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminAnnouncements } from '@/components/AdminAnnouncements';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Duyurular | Admin | Newilano'
};

export default async function AdminAnnouncementsPage() {
  const session = await auth();
  if (!session) {
    redirect(`/giris?callbackUrl=${encodeURIComponent('/admin/announcements')}`);
  }
  if (session.user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <main style={{ padding: '1rem' }}>
      <AdminAnnouncements />
    </main>
  );
}
