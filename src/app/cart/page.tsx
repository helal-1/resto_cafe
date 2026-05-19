"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, Truck, Tag, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "./cart.module.scss";

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  products: {
    name: string;
    price: number;
    img: string;
    discount?: number;
  } | null; 
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shippingCost] = useState(50); 

  // جلب عناصر السلة الخاصة بالمسجل حالياً من سوبابيس
  useEffect(() => {
    async function fetchCart() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("cart_items")
          .select("id, product_id, quantity, products(name, price, img, discount)")
          .eq("user_id", session.user.id);

        if (error) throw error;
        if (data) {
          setCartItems(data as unknown as CartItem[]);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, []);

  // 🛠️ تأمين الحسابات المالية: تقريب الأرقام لعدم ظهور الكسور الطويلة المشوهة للفاتورة
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let validItemsCount = 0;

    cartItems.forEach(item => {
      if (!item.products) return; // قفزة أمان 🚀
      validItemsCount++;
      const originalPrice = item.products.price;
      const discountPercent = item.products.discount || 0;
      
      subtotal += originalPrice * item.quantity;
      totalDiscount += (originalPrice * discountPercent / 100) * item.quantity;
    });

    // استخدام Math.round لتقريب الفواتير لأقرب جنيه ممسوح وصحيح
    const finalSubtotal = Math.round(subtotal);
    const finalDiscount = Math.round(totalDiscount);

    return {
      subtotal: finalSubtotal,
      discount: finalDiscount,
      total: Math.round(finalSubtotal - finalDiscount + (validItemsCount > 0 ? shippingCost : 0)),
      validItemsCount
    };
  }, [cartItems, shippingCost]);

  // تحديث الكمية في السيرفر والـ UI لايف
  const updateQuantity = async (id: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
      await supabase.from("cart_items").update({ quantity: newQty }).eq("id", id);
      window.dispatchEvent(new Event("cartUpdate"));
    } catch (err) {
      console.error(err);
    }
  };

  // حذف عنصر من السلة نهائياً
  const deleteItem = async (id: number) => {
    try {
      setCartItems(prev => prev.filter(item => item.id !== id));
      await supabase.from("cart_items").delete().eq("id", id);
      window.dispatchEvent(new Event("cartUpdate"));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <Loader2 size={40} className={styles.spinner} />
        <p>جاري تحضير سلتك الفاخرة...</p>
      </div>
    );
  }

  const validCartItems = cartItems.filter(item => item.products !== null);

  return (
    <>
      <Navbar />
      <div className={styles.cartPageWrapper}>
        <header className={styles.cartHeader}>
          <h1>سلة <span>المشتريات</span></h1>
          <p>راجع طلباتك المحدثة لايف قبل إتمام الدفع والاستمتاع بمشروبك</p>
        </header>

        <main className={styles.cartLayout}>
          <AnimatePresence mode="wait">
            {validCartItems.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={styles.emptyCart}>
                <ShoppingBag size={60} />
                <h3>سلتك الحالية فارغة تماماً</h3>
                <p>استكشف المنيو الحصري وأضف أفضل مشروباتنا ووجباتنا الفاخرة</p>
                <Link href="/menu" className={styles.menuLink}>اذهب للمنيو الآن</Link>
              </motion.div>
            ) : (
              <div className={styles.cartGrid}>
                {/* قائمة المنتجات في السلة */}
                <div className={styles.itemsList}>
                  {validCartItems.map((item) => {
                    if (!item.products) return null;
                    
                    const priceAfterDiscount = Math.round(item.products.price - (item.products.price * (item.products.discount || 0) / 100));
                    return (
                      <motion.div key={item.id} layout exit={{ opacity: 0, x: -50 }} className={styles.cartCard}>
                        <div className={styles.productImgWrapper}>
                          <Image src={item.products.img} alt={item.products.name} fill sizes="100px" />
                        </div>
                        
                        <div className={styles.productDetails}>
                          <h4>{item.products.name}</h4>
                          <span className={styles.unitPrice}>{priceAfterDiscount} ج.م</span>
                        </div>

                        {/* تظبيط أزرار التحكم وحمايتها من أخطاء الهيدريشن */}
                        <div className={styles.quantityControls}>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className={styles.qtyBtn} suppressHydrationWarning><Plus size={16} /></button>
                          <span className={styles.qtyNumber}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className={styles.qtyBtn} suppressHydrationWarning><Minus size={16} /></button>
                        </div>

                        <div className={styles.totalPriceZone}>
                          <span>{priceAfterDiscount * item.quantity} ج.م</span>
                        </div>

                        <button onClick={() => deleteItem(item.id)} className={styles.deleteBtn} aria-label="حذف الصنف" suppressHydrationWarning><Trash2 size={18} /></button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* كارت ملخص الفاتورة الممسوح النظيف */}
                <div className={styles.orderSummary}>
                  <h3>ملخص الفاتورة</h3>
                  
                  <div className={styles.summaryRows}>
                    <div className={styles.summaryRow}><span>المجموع الفرعي</span><span>{totals.subtotal} ج.م</span></div>
                    {totals.discount > 0 && <div className={`${styles.summaryRow} ${styles.discountRow}`}><span>إجمالي الخصومات</span><span>-{totals.discount} ج.م <Tag size={12} /></span></div>}
                    <div className={styles.summaryRow}><span>تكلفة توصيل الشحن</span><span>{shippingCost} ج.م <Truck size={14} /></span></div>
                    <div className={`${styles.summaryRow} ${styles.finalTotal}`}><span>الإجمالي النهائي</span><span>{totals.total} ج.م</span></div>
                  </div>
{/* استبدل الـ button ده بـ Link ده */}
<Link href="/checkout" className={styles.checkoutBtn}>
  <CreditCard size={18} /> <span>تأكيد الطلب وإتمام الدفع</span>
</Link>

                  <Link href="/menu" className={styles.continueShopping}>
                    <span>متابعة التسوق وإضافة أصناف أخرى</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <Footer />
    </>
  );
}