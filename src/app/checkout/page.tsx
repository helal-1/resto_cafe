"use client";

import { useState, useEffect } from "react";
import { Truck, Smartphone, Loader2, CheckCircle2, } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "./checkout.module.scss";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "cash">("cash");
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadCart() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data } = await supabase
        .from("cart_items")
        .select("id, product_id, quantity, products(name, price, img, discount)")
        .eq("user_id", session.user.id);
        
      setCart(data || []);
    }
    loadCart();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const total = cart.reduce((acc, item) => {
      const price = item.products.price;
      const discount = item.products.discount || 0;
      const discountedPrice = Math.round(price - (price * discount / 100));
      return acc + (discountedPrice * item.quantity);
    }, 0);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("orders").insert([{
      user_id: session.user.id,
      customer_name: formData.name,
      phone: formData.phone,
      address: formData.address,
      payment_method: paymentMethod,
      total_price: total,
      items: JSON.stringify(cart), 
      status: "pending"
    }]);

    if (!error) {
      await supabase.from("cart_items").delete().eq("user_id", session.user.id);
      setLoading(false);
      setModalOpen(true); // إظهار المودال بدل التحويل لصفحة ثانية
    } else {
      console.error("Supabase Error:", error);
      alert("حدث خطأ، يرجى التأكد من تفعيل الـ Policy في سوبابيس.");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.checkoutWrapper}>
        <form onSubmit={handlePlaceOrder} className={styles.checkoutGrid}>
          
          <div className={styles.formSection}>
            <h2>إتمام الطلب</h2>
            <input placeholder="الاسم الكامل" onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input placeholder="رقم الموبايل" onChange={e => setFormData({...formData, phone: e.target.value})} required />
            <input placeholder="العنوان بالتفصيل" onChange={e => setFormData({...formData, address: e.target.value})} required />

            <h3>طريقة الدفع</h3>
            <div className={styles.methods}>
              <div className={paymentMethod === "cash" ? styles.active : ""} onClick={() => setPaymentMethod("cash")}>
                <Truck /> <span>دفع عند الاستلام</span>
              </div>
              <div className={paymentMethod === "wallet" ? styles.active : ""} onClick={() => setPaymentMethod("wallet")}>
                <Smartphone /> <span>محفظة إلكترونية</span>
              </div>
            </div>

            {paymentMethod === "wallet" && (
              <div className={styles.walletInfo}>
                <p>يرجى تحويل المبلغ الإجمالي إلى رقم الكافيه: <strong>010xxxxxxxx</strong></p>
                <p>سيقوم فريقنا بالتواصل معك لتأكيد التحويل فور وصول الطلب.</p>
              </div>
            )}
          </div>

          <div className={styles.summarySection}>
            <h3>ملخص طلباتك</h3>
            {cart.map((item: any) => {
              const discountedPrice = Math.round(item.products.price - (item.products.price * (item.products.discount || 0) / 100));
              return (
                <div key={item.id} className={styles.item}>
                  <img src={item.products.img} alt={item.products.name} />
                  <span>{item.products.name} (×{item.quantity})</span>
                  <b>{discountedPrice * item.quantity} ج.م</b>
                </div>
              );
            })}
            <button type="submit" disabled={loading}>
              {loading ? <Loader2 className={styles.spinner} /> : "تأكيد الطلب"}
            </button>
          </div>
        </form>
      </div>

      {/* مودال التأكيد الشيك */}
      {modalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", 
          backdropFilter: "blur(8px)", zIndex: 99999, display: "flex", 
          alignItems: "center", justifyContent: "center", padding: "1rem"
        }}>
          <div style={{
            background: "#18110c", border: "1px solid #b5835a", borderRadius: "20px",
            padding: "2rem", textAlign: "center", maxWidth: "400px", direction: "rtl"
          }}>
            <CheckCircle2 size={50} color="#b5835a" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>تم استلام طلبك بنجاح!</h3>
            <p style={{ color: "#a0a0a0", marginBottom: "1.5rem" }}>
              شكراً لاختيارك ريستو كافيه. سيتم التواصل معك قريباً لتأكيد الطلب.
            </p>
            <button 
              onClick={() => router.push("/")} 
              style={{
                background: "#b5835a", color: "#fff", border: "none", 
                padding: "0.8rem 2rem", borderRadius: "10px", cursor: "pointer"
              }}
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}