"use client";

import Image from "next/image";
import styles from "./OrdersTab.module.scss";

// 1. تعريف الهياكل لإنهاء مشاكل الـ any
interface Product {
  name: string;
  img: string;
}

interface CartItem {
  products: Product;
  quantity: number;
}

// السطر 20 تقريباً في page.tsx
export interface Order { 
  id: number; 
  customer_name: string; 
  total_price: number; 
  status: "pending" | "approved" | "rejected"; 
  items: any; 
  address: string; // أضف هذا
  phone: string;   // أضف هذا
}

export interface Props {
  orders: Order[];
  refresh: () => Promise<void>;
}

export function OrdersTab({ orders, refresh }: Props) {
  
  const openWhatsApp = (phone: string) => {
    // تشغيل الـ refresh عند الضغط (اختياري حسب رغبتك)
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
            {orders.map((o) => {
              const items: CartItem[] = typeof o.items === "string" ? JSON.parse(o.items) : o.items;

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
                              alt={item.products.name} 
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}