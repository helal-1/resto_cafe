import { UserProfile } from "./page";
import styles from "./UsersTab.module.scss";

export function UsersTab({ users }: { users: UserProfile[] }) {
  return (
    <div className={styles.zone}>
      <h2 className={styles.title}>الأعضاء <span>والمسجلين بالموقع</span></h2>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead><tr><th>الاسم بالكامل</th><th>البريد الإلكتروني</th><th>الصلاحية</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.full_name}</td><td>{u.email}</td>
                <td><span className={u.role === "admin" ? styles.admin : styles.user}>{u.role === "admin" ? "مدير نظام" : "عميل"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}