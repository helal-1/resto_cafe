"use client";

import styles from "./OrdersTab.module.scss";

// هنفترض إن الـ Order بيجيلنا فيه تفاصيل الـ items كـ JSON
export function OrdersTab({ orders }: { orders: any[] }) {
  
  // دالة لفتح واتساب
  const openWhatsApp = (phone: string) => {
    // التأكد إن الرقم بيبدأ بـ 20
    const formattedPhone = phone.startsWith("0") ? "2" + phone : phone;
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  return (
    <div className={styles.zone}>
      <h2 className={styles.title}>إدارة <span>شحن الطلبات</span></h2>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>العميل</th>
              <th>التفاصيل (المنتجات)</th>
              <th>العنوان/الموبايل</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              // بنحول الـ items من String لـ Array
              const items = typeof o.items === "string" ? JSON.parse(o.items) : o.items;

              return (
                <tr key={o.id}>
                  <td>{o.customer_name}</td>
                  <td>
                    <div className={styles.itemsList}>
                      {items?.map((item: any, i: number) => (
                        <div key={i} className={styles.itemRow}>
                          <img src={item.products?.img} alt="product" className={styles.miniImg} />
                          <span>{item.products?.name} (x{item.quantity})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div>{o.address}</div>
                    <div className={styles.phone}>{o.phone}</div>
                  </td>
                  <td>
                    <button 
                      onClick={() => openWhatsApp(o.phone)} 
                      className={styles.whatsappBtn}
                    >
                      واتساب
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}