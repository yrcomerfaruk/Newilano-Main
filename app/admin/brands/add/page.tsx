import { AdminBrandForm } from '@/app/admin/BrandForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Marka Ekle | Admin Paneli',
};

export default function AdminBrandAddPage() {
  return (
    <section>
      <h2>Marka Ekle</h2>
      <AdminBrandForm />
    </section>
  );
}
