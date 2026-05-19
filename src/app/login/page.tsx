"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, AlertCircle, X } from "lucide-react";
import { supabase } from "@/utils/supabase";
import styles from "./login.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // نظام الإشعارات الفخم المدمج
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false, msg: "", type: "success"
  });

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast("الرجاء ملء الحقول المطلوبة", "error");
      return;
    }

    try {
      setSubmitting(true);
      
      // تسجيل الدخول الرسمي عبر موديول سوبابيس
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        triggerToast(error.message === "Invalid login credentials" ? "البريد الإلكتروني أو كلمة السر غير صحيحة" : error.message, "error");
        return;
      }

      if (data?.user) {
        triggerToast("مرحباً بك مجدداً في ريستو كافيه!", "success");
        
        // التحقق من صلاحيات المستخدم وتوجيهه (لو أدمن يروح الداش بورد، لو عميل يروح البروفايل الخاص به)
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        setTimeout(() => {
          // التوجيه الذكي المبني على الصلاحيات (Role-Based Routing)
          if (profile?.role === "admin") {
            router.push("/"); // الأدمن يدخل لوحة التحكم
          } else {
            router.push("/"); // اليوزر العادي يروح لصفحة حسابه الشخصي مباشرة
          }
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      triggerToast("حدث خطأ غير متوقع، حاول ثانية", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      
      {/* التوست الإشعاري الحركي */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className={`${styles.luxuryToast} ${styles[toast.type]}`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className={styles.toastMsg}>{toast.msg}</span>
            <button className={styles.toastClose} onClick={() => setToast(prev => ({ ...prev, show: false }))}><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* زر العودة للخلف بتأثير انسيابي */}
      <Link href="/" className={styles.backBtn}>
        <ArrowRight size={18} />
        <span>العودة للرئيسية</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={styles.loginCard}>
        
        <div className={styles.cardHeader}>
          <h2>ريستو<span> كافيه</span></h2>
          <p>تسجيل الدخول للوحة التحكم وإدارة الحساب الحية</p>
        </div>

        <form onSubmit={handleLogin} className={styles.loginForm}>
          
          {/* حقل البريد الإلكتروني */}
          <div className={styles.inputGroup}>
            <label>البريد الإلكتروني</label>
            <div className={styles.inputField}>
              <Mail className={styles.fieldIcon} size={20} />
              <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} />
            </div>
          </div>

          {/* حقل كلمة السر مع زر الإظهار والإخفاء التفاعلي */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label>كلمة السر</label>
              <Link href="/forgot-password" className={styles.forgotLink}>نسيت كلمة السر؟</Link>
            </div>
            <div className={styles.inputField}>
              <Lock className={styles.fieldIcon} size={20} />
              <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={submitting} />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* زر التأكيد والحفظ مع لودر حركي */}
          <button type="submit" disabled={submitting} className={styles.submitBtn} suppressHydrationWarning>
            {submitting ? (
              <>
                <Loader2 className={styles.spinner} size={20} />
                <span>جاري التحقق من الهوية...</span>
              </>
            ) : (
              <span>تسجيل الدخول</span>
            )}
          </button>

        </form>

        <div className={styles.cardFooter}>
          <p>ليس لديك حساب؟ <Link href="/register">أنشئ حسابك الفاخر الآن</Link></p>
        </div>

      </motion.div>
    </div>
  );
}