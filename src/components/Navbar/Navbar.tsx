"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; 
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Info, Bookmark, ShoppingBag, Heart, User } from "lucide-react";
import { supabase } from "@/utils/supabase"; 
import styles from "./Navbar.module.scss";
// 1. الاستيراد الجديد للـ Modal
import ProfileModal from "@/app/profile/page"; 

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userSession, setUserSession] = useState<boolean>(false);
  
  // 2. الحالة الجديدة للـ Popup
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // 🛠️ عدادات ديناميكية حية بدل الأرقام الثابتة القديمة
  const [cartCount, setCartCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  
  const pathname = usePathname();

  // 🛠️ دالة جلب وحساب العدادات الحية مباشرة من سوبابيس
const refreshBadges = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    setUserSession(true);

    // 1. جلب البروفايل بدون single() لتجنب خطأ الـ 404
    const { data: profiles, error } = await supabase
      .from("user_profiles")
      .select("full_name, email, role")
      .eq("id", session.user.id);

    // التحقق إذا كان البروفايل موجوداً
    if (profiles && profiles.length > 0) {
      setUserProfile(profiles[0]);
    } else {
      // لو المستخدم مسجل بس ملهوش بروفايل في جدول user_profiles
      setUserProfile({ 
        full_name: session.user.user_metadata?.full_name || "عميل ريستو", 
        email: session.user.email, 
        role: "user" 
      });
    }

    // 2. جلب العدادات
    const { data: cartData } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", session.user.id);
    
    setCartCount(cartData?.reduce((acc, curr) => acc + curr.quantity, 0) || 0);

    const { count } = await supabase
      .from("saved_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);
      
    setSavedCount(count || 0);
  } else {
    setUserSession(false);
    setUserProfile(null);
    setCartCount(0);
    setSavedCount(0);
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowProfile(false);
    window.location.reload();
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

    // الاستماع لأي تغيير في حالة الـ Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(!!session);
      refreshBadges();
    });

    // 🛠️ الاستماع للأحداث الحية
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
            <Link href="/saved" className={styles.iconBtn} aria-label="المجموعات المحفوظة">
              <Heart size={22} />
              {savedCount > 0 && (
                <span className={styles.badge} suppressHydrationWarning>
                  {savedCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className={styles.iconBtn} aria-label="سلة المشتريات">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className={styles.badge} suppressHydrationWarning>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* زرار اليوزر الذي يفتح الـ Popup بدل التوجيه */}
            <button 
              onClick={() => userSession ? setShowProfile(true) : window.location.href = "/login"} 
              className={styles.iconBtn} 
              aria-label="حساب المستخدم"
            >
              <User size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* 3. استدعاء المودال */}
      {showProfile && (
        <ProfileModal 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)} 
          userProfile={userProfile} 
          onLogout={handleLogout}
        />
      )}

      {/* الناف بار السفلي للموبايل */}
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