import { SideNav } from './SideNav';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <SideNav />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
