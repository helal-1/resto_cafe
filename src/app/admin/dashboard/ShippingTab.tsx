import { ShippingZone } from "./page";
import styles from "./ShippingTab.module.scss";

export function ShippingTab({ shipping }: { shipping: ShippingZone[] }) {
  return (
    <div className={styles.zone}>
      <h2 className={styles.title}>تكاليف <span>شحن المحافظات</span></h2>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead><tr><th>المنطقة / المحافظة</th><th>سعر الشحن</th></tr></thead>
          <tbody>
            {shipping.map(s => (
              <tr key={s.id}><td>{s.city}</td><td className={styles.price}>{s.cost} ج.م</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}