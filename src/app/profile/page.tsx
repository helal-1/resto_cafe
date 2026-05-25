"use client";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Shield, LogOut, X, Coffee, Heart, Settings, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import styles from "./profile.module.scss";

export default function ProfileModal({ isOpen, onClose, userProfile, onLogout }: any) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
          
          {/* المنطقة العلوية */}
          <div className={styles.avatarZone}>
            <div className={styles.avatarRing}><User size={30} /></div>
            <h2>{userProfile?.full_name || "عميل ريستو"}</h2>
            <div className={styles.roleBadge}>
              {userProfile?.role === "admin" ? "لوحة الإدارة" : "عضوية ريستو الفاخرة"}
            </div>
          </div>

          {/* معلومات المستخدم */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}><Mail size={16}/> <span>{userProfile?.email}</span></div>
            <div className={styles.infoItem}><Shield size={16}/> <span>{userProfile?.role === "admin" ? "أدمن" : "مستخدم نشط"}</span></div>
          </div>

          {/* إحصائيات سريعة */}
          <div className={styles.statsRow}>
            <div className={styles.stat}><Coffee size={18} /> <p>0 طلب</p></div>
            <div className={styles.stat}><Heart size={18} /> <p>2 مفضلة</p></div>
          </div>

          {/* أزرار الإجراءات */}
          <div className={styles.actionSection}>
            {userProfile?.role === "admin" && (
              <Link href="/admin/dashboard" className={styles.adminLink}>
                <LayoutDashboard size={18} /> لوحة التحكم
              </Link>
            )}
            <button onClick={onLogout} className={styles.logoutBtn}>
              <LogOut size={18} /> تسجيل الخروج
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}