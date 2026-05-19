"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { gsap } from "gsap";
import styles from "./saved.module.scss";

interface SavedItem {
  id: number;
  product: {
    id: number;
    name: string;
    category: string;
    img: string;
    price: number;
  };
}

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSavedItems() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("saved_items")
          .select(`
            id,
            product:product_id (id, name, category, img, price)
          `)
          .eq("user_id", session.user.id);

        if (error) throw error;
        if (data) setSavedItems(data as unknown as SavedItem[]);
      } catch (err) {
        console.error("Error fetching saved items:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSavedItems();
  }, []);

  // 🛠️ تصليح خطأ الـ TweenTarget بتأمين الحاوية والعناصر قبل التمرير لـ GSAP
  useEffect(() => {
    if (loading || savedItems.length === 0 || !galleryRef.current) return;

    const targets = galleryRef.current.querySelectorAll(`.${styles.galleryCard}`);
    if (targets.length === 0) return;

    gsap.fromTo(
      targets,
      { opacity: 0, y: 60, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      }
    );
  }, [loading, savedItems]);

  // 🛠️ تصليح دالة الماوس: دمجنا المعاملات وبقينا نسحب الكارت مباشرة عبر e.currentTarget بأمان للـ TS
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(card, {
      rotateY: x * 0.12,
      rotateX: -y * 0.12,
      transformPerspective: 1000,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.5,
      ease: "power2.out"
    });
  };

  return (
    <>
      <Navbar />
      <div className={styles.savedWrapper}>
        
        <header className={styles.headerZone}>
          <Heart size={36} className={styles.heartIcon} />
          <h1>مَعرض <span>المشروبات المفضلة</span></h1>
          <p>لوحة فنية تفاعلية تضم رشفاتك المفضلة والمحفوظة بعناية لتناسب مزاجك الفاخر.</p>
        </header>

        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader2 size={40} className={styles.spinner} />
            <p>جاري تحضير معرضك الفني الخاص...</p>
          </div>
        ) : savedItems.length === 0 ? (
          <div className={styles.emptyZone}>
            <p>معرضك فارغ حالياً! اذهب للمنيو واحفظ بعض المشروبات لتراها هنا.</p>
            <Link href="/menu" className={styles.menuLink}>
              اكتشف المنيو الفاخر <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className={styles.galleryGrid} ref={galleryRef}>
            {savedItems.map((item) => {
              if (!item.product) return null;
              return (
                <div 
                  key={item.id} 
                  className={styles.galleryCard}
                  onMouseMove={handleMouseMove} // تمرير نظيف ومعامل واحد متوافق 100%
                  onMouseLeave={handleMouseLeave}
                >
                  <Link href={`/menu?cat=${item.product.category}`} className={styles.cardLink}>
                    <div className={styles.imgContainer}>
                      <Image 
                        src={item.product.img} 
                        alt={item.product.name}
                        fill
                        className={styles.galleryImg}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className={styles.overlayGlow} />
                    </div>

                    <div className={styles.cardInfo}>
                      <span className={styles.categoryBadge}>
                        {item.product.category === "coffee" ? "قهوة دافئة" : "مشروب مثلج"}
                      </span>
                      <h3>{item.product.name}</h3>
                      <div className={styles.footerZone}>
                        <span className={styles.price}>{item.product.price} ج.م</span>
                        <span className={styles.exploreText}>اكتشف في المنيو ←</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}