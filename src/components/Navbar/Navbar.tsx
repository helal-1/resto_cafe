"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; 
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Info, Bookmark, ShoppingBag, Heart, User } from "lucide-react";
import { supabase } from "@/utils/supabase"; 
import styles from "./Navbar.module.scss";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userSession, setUserSession] = useState<boolean>(false);
  
  // 🛠️ عدادات ديناميكية حية بدل الأرقام الثابتة القديمة
  const [cartCount, setCartCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  
  const pathname = usePathname();

  // 🛠️ دالة جلب وحساب العدادات الحية مباشرة من سوبابيس
  const refreshBadges = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // 1. حساب إجمالي كميات السلة (مجموع حقل quantity)
      const { data: cartData } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", session.user.id);
        
      if (cartData) {
        const totalQty = cartData.reduce((acc, curr) => acc + curr.quantity, 0);
        setCartCount(totalQty);
      } else {
        setCartCount(0);
      }

      // 2. حساب إجمالي عدد المجموعات المحفوظة بدقة
      const { count: savedItemsCount } = await supabase
        .from("saved_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);
        
      setSavedCount(savedItemsCount || 0);
    } else {
      // لو مش مسجل دخول نصفر العدادات
      setCartCount(0);
      setSavedCount(0);
    }
  };

  useEffect(() => {
    // مراقبة التمرير (Scroll)
    const handleScroll = () => {
      if (window.scrollY > 50) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);

    // فحص حالة الجلسة والعدادات أول ما الصفحة تفتح
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(!!session);
      refreshBadges();
    });

    // الاستماع لأي تغيير في حالة الـ Auth (تسجيل دخول أو خروج) لتحديث الأيقونة والعدادات فوراً
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(!!session);
      refreshBadges();
    });

    // 🛠️ الاستماع للأحداث الحية القادمة من زراير صفحة المنيو وصفحة السلة
    window.addEventListener("cartUpdate", refreshBadges);
    window.addEventListener("savedUpdate", refreshBadges);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("cartUpdate", refreshBadges);
      window.removeEventListener("savedUpdate", refreshBadges);
      subscription.unsubscribe();
    };
  }, []);

  const navItems = [
    { name: "الرئيسية", path: "/", icon: <Home size={22} /> },
    { name: "المنيو", path: "/menu", icon: <UtensilsCrossed size={22} /> },
    { name: "عن ريستو", path: "/about", icon: <Info size={22} /> },
    { name: "المجموعات", path: "/saved", icon: <Bookmark size={22} /> },
  ];

  // 🛠️ نقلنا شرط الأمان ليكون هنا أسفل الـ Hooks مباشرة لتجنب كسر القواعد الصارمة لـ React
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
        <div className={styles.navContainer}>
          
          <Link href="/" className={styles.logo}>
            ريستو<span> كافيه</span>
          </Link>

          <ul className={styles.desktopNavLinks}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path} className={pathname === item.path ? styles.active : ""}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.navActions}>
            {/* 🛠️ تحويل زرار المجموعات إلى Link تفاعلي برقم حي */}
            <Link href="/saved" className={styles.iconBtn} aria-label="المجموعات المحفوظة">
              <Heart size={22} />
              {savedCount > 0 && (
                <span className={styles.badge} suppressHydrationWarning>
                  {savedCount}
                </span>
              )}
            </Link>

            {/* 🛠️ تحويل زرار السلة إلى Link تفاعلي برقم حي */}
            <Link href="/cart" className={styles.iconBtn} aria-label="سلة المشتريات">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className={styles.badge} suppressHydrationWarning>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* زرار اليوزر الذكي */}
            <Link 
              href={userSession ? "/profile" : "/login"} 
              className={styles.iconBtn} 
              aria-label="حساب المستخدم"
            >
              <User size={22} />
            </Link>
          </div>

        </div>
      </nav>

      {/* الناف بار السفلي للموبايل مدمج به الـ Links الذكية */}
      <div className={styles.bottomNav}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className={`${styles.bottomNavItem} ${isActive ? styles.activeBottom : ""}`}>
              <span className={styles.bottomIcon}>{item.icon}</span>
              <span className={styles.bottomText}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}