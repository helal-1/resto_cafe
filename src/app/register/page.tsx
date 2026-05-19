"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, AlertCircle, X } from "lucide-react";
import { supabase } from "@/utils/supabase";
import styles from "./register.module.scss";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // نظام الإشعارات الفخم المدمج بالصفحة
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false, msg: "", type: "success"
  });

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      triggerToast("الرجاء ملء جميع الحقول المطلوبة", "error");
      return;
    }

    if (password.length < 6) {
      triggerToast("كلمة السر يجب ألا تقل عن 6 أحرف", "error");
      return;
    }

    try {
      setSubmitting(true);

      // 1. إنشاء الحساب الأمني في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        triggerToast(authError.message, "error");
        return;
      }

      // 2. إذا تم إنشاء الحساب بنجاح، نقوم بربط البيانات بجدول user_profiles الخاص بالموقع
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert([
            {
              id: authData.user.id, // ربط الـ UUID الأمني القادم من Auth
              full_name: fullName.trim(),
              email: email.trim(),
              role: "user" // رول افتراضي كـ "عميل"
            }
          ]);

        if (profileError) {
          console.error("خطأ أثناء إنشاء البروفايل:", profileError.message);
          triggerToast("تم إنشاء الحساب، لكن حدث خطأ أثناء تهيئة البيانات الفرعية", "error");
          return;
        }

        triggerToast("تم إنشاء حسابك الفاخر بنجاح! جاري التوجيه...", "success");
        
        // توجيه العميل فوراً للرئيسية بعد ثانية ونص ليستمتع بالكافيه
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }

    } catch (err) {
      console.error(err);
      triggerToast("حدث خطأ غير متوقع أثناء التسجيل", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.registerWrapper}>
      
      {/* التوست الإشعاري المدمج الحركي */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className={`${styles.luxuryToast} ${styles[toast.type]}`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className={styles.toastMsg}>{toast.msg}</span>
            <button className={styles.toastClose} onClick={() => setToast(prev => ({ ...prev, show: false }))}><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* زر العودة للرئيسية التفاعلي */}
      <Link href="/" className={styles.backBtn}>
        <ArrowRight size={18} />
        <span>العودة للرئيسية</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={styles.registerCard}>
        
        <div className={styles.cardHeader}>
          <h2>ريستو<span> كافيه</span></h2>
          <p>أنشئ حسابك الفاخر الآن لتجربة تصفح وطلب حية مخصصة لك</p>
        </div>

        <form onSubmit={handleRegister} className={styles.registerForm}>
          
          {/* حقل الاسم بالكامل */}
          <div className={styles.inputGroup}>
            <label>الاسم بالكامل</label>
            <div className={styles.inputField}>
              <User className={styles.fieldIcon} size={20} />
              <input type="text" required placeholder="مثال: محمد أحمد" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={submitting} />
            </div>
          </div>

          {/* حقل البريد الإلكتروني */}
          <div className={styles.inputGroup}>
            <label>البريد الإلكتروني</label>
            <div className={styles.inputField}>
              <Mail className={styles.fieldIcon} size={20} />
              <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} />
            </div>
          </div>

          {/* حقل كلمة السر مع ميزة الإخفاء والإظهار التفاعلية */}
          <div className={styles.inputGroup}>
            <label>كلمة السر (6 أحرف على الأقل)</label>
            <div className={styles.inputField}>
              <Lock className={styles.fieldIcon} size={20} />
              <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={submitting} />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* زر التثبيت والحفظ النهائي */}
          <button type="submit" disabled={submitting} className={styles.submitBtn} suppressHydrationWarning>
            {submitting ? (
              <>
                <Loader2 className={styles.spinner} size={20} />
                <span>جاري صب البيانات في السيرفر...</span>
              </>
            ) : (
              <span>إنشاء الحساب</span>
            )}
          </button>

        </form>

        <div className={styles.cardFooter}>
          <p>لديك حساب بالفعل؟ <Link href="/login">تسجيل الدخول الفوري</Link></p>
        </div>

      </motion.div>
    </div>
  );
}