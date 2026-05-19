"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Shield, LogOut, Loader2,  Heart, Coffee } from "lucide-react";
import { supabase } from "@/utils/supabase";
import Link from "next/link";
import styles from "./profile.module.scss";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 1. جلب بيانات الجلسة الحالية للمستخدم
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push("/login");
          return;
        }

        // 2. جلب البروفايل الفرعي من جدول user_profiles
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("full_name, email, role")
          .eq("id", session.user.id)
          .single();

        if (error || !profile) {
          // تأمين لو البيانات ممسوحة بالخطأ
          setUserProfile({
            full_name: "عميل ريستو",
            email: session.user.email || "",
            role: "user"
          });
        } else {
          setUserProfile(profile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>جاري تحميل أجواء حسابك الفاخر...</p>
      </div>
    );
  }

  return (
    <div className={styles.profileWrapper}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className={styles.profileCard}
      >
        {/* البانر العلوي الفخم للبروفايل */}
        <div className={styles.avatarZone}>
          <div className={styles.avatarRing}>
            <User size={45} />
          </div>
          <h2>مرحباً، {userProfile?.full_name}</h2>
          <span className={styles.roleTag}>
            <Shield size={14} />
            {userProfile?.role === "admin" ? "لوحة الإدارة" : "عضوية ريستو الفاخرة"}
          </span>
        </div>

        {/* تفاصيل الحساب الحية */}
        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}><User size={20} /></div>
            <div className={styles.infoText}>
              <label>الاسم الكامل</label>
              <p>{userProfile?.full_name}</p>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoIcon}><Mail size={20} /></div>
            <div className={styles.infoText}>
              <label>البريد الإلكتروني</label>
              <p>{userProfile?.email}</p>
            </div>
          </div>
        </div>

        {/* إحصائيات سريعة للعميل لإعطاء لمسة احترافية للـ UI */}
        <div className={styles.userStats}>
          <div className={styles.statBox}>
            <Coffee size={22} />
            <span>0</span>
            <p>طلبات حية</p>
          </div>
          <div className={styles.statBox}>
            <Heart size={22} />
            <span>2</span>
            <p>بالمجموعات</p>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className={styles.actionButtons}>
          {userProfile?.role === "admin" && (
            <Link href="/admin/dashboard" className={styles.adminBtn}>
              دخول لوحة التحكم
            </Link>
          )}
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>تسجيل الخروج السريع</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}