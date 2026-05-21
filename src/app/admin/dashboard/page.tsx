"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Coffee, PlusCircle, ShoppingCart, Truck, Users, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar/Navbar";
import Link from "next/link";

import { StatsTab } from "./StatsTab";
import { ProductsTab } from "./ProductsTab";
import { AddProductTab } from "./AddProductTab";
import { ShippingTab } from "./ShippingTab";
import { UsersTab } from "./UsersTab";
import { OrdersTab } from "./OrdersTab"; 

import styles from "./dashboard.module.scss";

export interface Product { id: number; category: string; name: string; price: number; img: string; rate: number; }
export interface Order { 
  id: number; 
  customer_name: string; 
  total_price: number; 
  status: "pending" | "approved" | "rejected"; 
  items: any; 
  address: string; 
  phone: string; 
}
export interface ShippingZone { id: number; city: string; cost: number; }
export interface UserProfile { id: number; full_name: string; email: string; role: "admin" | "user"; }

const TABS = {
  STATS: "stats",
  PRODUCTS: "products",
  ADD_PRODUCT: "add_product",
  ORDERS: "orders",
  SHIPPING: "shipping",
  USERS: "users",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(TABS.STATS);
  const [loading, setLoading] = useState(true);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipping, setShipping] = useState<ShippingZone[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" | "warn" }>({
    show: false, msg: "", type: "success"
  });

  const showToast = (msg: string, type: "success" | "error" | "warn" = "success") => {
    setToast({ show: true, msg, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const triggerRefresh = async () => {
    try {
      const [resProducts, resOrders, resShipping, resUsers] = await Promise.all([
        supabase.from("products").select("*").order("id", { ascending: false }),
        supabase.from("orders").select("*").order("id", { ascending: false }),
        supabase.from("shipping_zones").select("*").order("id", { ascending: true }),
        supabase.from("user_profiles").select("*").order("id", { ascending: false })
      ]);
      
      if (resProducts.data) setProducts(resProducts.data);
      if (resOrders.data) setOrders(resOrders.data as Order[]);
      if (resShipping.data) setShipping(resShipping.data);
      if (resUsers.data) setUsers(resUsers.data);
    } catch (err) {
      console.error("Refresh Error:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function initDashboard() {
      if (isMounted) setLoading(true);
      await triggerRefresh();
      if (isMounted) setLoading(false);
    }
    initDashboard();
    return () => { isMounted = false; };
  }, []);

  return (
    <>
      <div className={styles.homeBtnWrapper}>
        <Link href="/" className={styles.backHomeBtn}>Resto <span>Cafe</span></Link>
      </div>
      <Navbar />
      <div className={styles.dashboardLayout}>
        <AnimatePresence>
          {toast.show && (
            <motion.div initial={{ opacity: 0, y: -50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className={`${styles.luxuryToast} ${styles[toast.type]}`}>
              {toast.type === "success" && <CheckCircle2 size={18} />}
              {(toast.type === "error" || toast.type === "warn") && <AlertCircle size={18} />}
              <span className={styles.toastMsg}>{toast.msg}</span>
              <button className={styles.toastClose} onClick={() => setToast(prev => ({ ...prev, show: false }))}><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <aside className={styles.sidebar}>
          <div className={styles.adminProfile}>
            <div className={styles.avatar}>A</div>
            <div><h4>لوحة الإدارة</h4><p>مرحبًا بك، كابتن ريستو</p></div>
          </div>
          <nav className={styles.sideNav}>
            <button className={activeTab === TABS.STATS ? styles.active : ""} onClick={() => setActiveTab(TABS.STATS)}><BarChart3 size={20} /> <span>الإحصائيات العامة</span></button>
            <button className={activeTab === TABS.PRODUCTS ? styles.active : ""} onClick={() => setActiveTab(TABS.PRODUCTS)}><Coffee size={20} /> <span>قائمة المنتجات</span></button>
            <button className={activeTab === TABS.ADD_PRODUCT ? styles.active : ""} onClick={() => setActiveTab(TABS.ADD_PRODUCT)}><PlusCircle size={20} /> <span>إضافة منتج جديد</span></button>
            <button className={activeTab === TABS.ORDERS ? styles.active : ""} onClick={() => setActiveTab(TABS.ORDERS)}><ShoppingCart size={20} /> <span>الطلبات</span></button>
            <button className={activeTab === TABS.SHIPPING ? styles.active : ""} onClick={() => setActiveTab(TABS.SHIPPING)}><Truck size={20} /> <span>إدارة الشحن</span></button>
            <button className={activeTab === TABS.USERS ? styles.active : ""} onClick={() => setActiveTab(TABS.USERS)}><Users size={20} /> <span>المستخدمين</span></button>
          </nav>
        </aside>

        <main className={styles.contentArea}>
          {loading ? (
            <div className={styles.loadingBox}><Loader2 size={40} className={styles.spinner} /><p>جاري مزامنة بيانات &quot;ريستو&quot; الحية...</p></div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25 }} className={styles.tabContent}>
                {activeTab === TABS.STATS && <StatsTab orders={orders} products={products} users={users} />}
                {activeTab === TABS.PRODUCTS && <ProductsTab products={products} setProducts={setProducts} showToast={showToast} />}
                {activeTab === TABS.ADD_PRODUCT && <AddProductTab setProducts={setProducts} refreshData={triggerRefresh} showToast={showToast} switchToProducts={() => setActiveTab(TABS.PRODUCTS)} />}
                
             {/* سنقوم بتجاهل فحص المكون بالكامل باستخدام أي كاستينج */}
{activeTab === TABS.ORDERS && React.createElement(OrdersTab as any, { orders: orders, refresh: triggerRefresh })}
                
                {activeTab === TABS.SHIPPING && <ShippingTab shipping={shipping} />}
                {activeTab === TABS.USERS && <UsersTab users={users} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </>
  );
}