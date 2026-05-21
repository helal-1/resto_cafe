"use client";

import Image from "next/image";
import styles from "./OrdersTab.module.scss";

// 1. تعريف الهياكل
interface Product {
  name: string;
  img: string;
}

interface CartItem {
  products: Product;
  quantity: number;
}

export interface Order {
  id: number;
  customer_name: string;
  total_price: number;
  status: "pending" | "approved" | "rejected";
  items: any;
  address: string;
  phone: string;
}

export interface Props {
  orders: Order[];
  refresh: () => Promise<void>;
}

export function OrdersTab({ orders, refresh }: Props) {
  
  const openWhatsApp = (phone: string) => {
    // تشغيل الـ refresh عند الضغط
    refresh(); 
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
              <th>التفاصيل</th>
              <th>العنوان/الموبايل</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((o) => {
                // التأكد من معالجة items سواء كانت JSON string أو مصفوفة
                const items: CartItem[] = typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []);

                return (
                  <tr key={o.id}>
                    <td>{o.customer_name}</td>
                    <td>
                      <div className={styles.itemsList}>
                        {items?.map((item, i) => (
                          <div key={i} className={styles.itemRow}>
                            {item.products?.img && (
                              <Image 
                                src={item.products.img} 
                                alt={item.products.name || "product"} 
                                width={40} 
                                height={40} 
                                className={styles.miniImg} 
                              />
                            )}
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
              })
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                  لا توجد طلبات حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}