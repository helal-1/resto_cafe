"use client";

import Link from "next/link";
// استوردنا فقط أيقونات التواصل الأساسية اللي مفيهاش أي مشاكل
import { MapPin, Phone, Mail } from "lucide-react";
import styles from "./Footer.module.scss";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerGrid}>

                {/* زاوية الاشتراك في الأخبار */}
                <div className={styles.footerColumn}>
                    <h3>كن على تواصل</h3>
                    <p>اشترك للحصول على العروض الخاصة ونصائح القهوة وأحدث الأخبار من ريستو كافيه.</p>
                    <div className={styles.subscribeBox}>
                       <input 
  type="email" 
  placeholder="أدخل بريدك الإلكتروني" 
  suppressHydrationWarning 
/>

           <button suppressHydrationWarning>→</button>
                    </div>

                    {/* هنا حطينا الـ SVGs مباشرة عشان نقفل باب أي Error نهائياً */}
                    <div className={styles.socials}>
                        {/* فيسبوك */}
                        <a href="#" aria-label="فيسبوك">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                        </a>
                        {/* إنستجرام */}
                        <a href="#" aria-label="إنستجرام">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                        </a>
                        {/* إكس (تويتر سابقاً) */}
                        <a href="#" aria-label="إكس تويتر سابقاً">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                        </a>
                        {/* يوتيوب */}
                        <a href="#" aria-label="يوتيوب">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" /><path d="m10 15 5-3-5-3z" /></svg>
                        </a>
                    </div>
                </div>

                {/* روابط سريعة */}
                <div className={styles.footerColumn}>
                    <h3>روابط سريعة</h3>
                    <ul>
                        <li><Link href="/">الرئيسية</Link></li>
                        <li><Link href="/menu">المنيو</Link></li>
                        <li><Link href="/about">عن الكافيه</Link></li>
                        <li><Link href="/gallery">المجموعات</Link></li>
                    </ul>
                </div>

                {/* خدمة العملاء */}
                <div className={styles.footerColumn}>
                    <h3>خدمة العملاء</h3>
                    <ul>
                        <li><Link href="#">الأسئلة الشائعة</Link></li>
                        <li><Link href="#">الشحن والتوصيل</Link></li>
                        <li><Link href="#">سياسة الاسترجاع</Link></li>
                        <li><Link href="#">الشروط والأحكام</Link></li>
                    </ul>
                </div>

                {/* معلومات الاتصال */}
                <div className={styles.footerColumn}>
                    <h3>اتصل بنا</h3>
                    <ul className={styles.contactList}>
                        <li><Phone size={16} /> <span>+20 123 456 7890</span></li>
                        <li><Mail size={16} /> <span>hello@restocafe.com</span></li>
                        <li><MapPin size={16} /> <span>123 شارع المعز، القاهرة، مصر</span></li>
                    </ul>
                </div>

            </div>

            <div className={styles.copyright}>
                <p>جميع الحقوق محفوظة © {new Date().getFullYear()} ريستو كافيه.</p>
            </div>
        </footer>
    );
}