"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Coffee, ShieldCheck, Heart, Users, Sparkles, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./about.module.scss";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. أنيميشن هيدر الصفحة الفوري
      const tl = gsap.timeline();
      tl.fromTo(`.${styles.heroTitle}`, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.8 })
        .fromTo(`.${styles.heroDesc}`, { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.3");

      // 2. تأثير الـ Parallax الذكي على صور القصة بناءً على data-speed
      const parallaxElements = pageRef.current?.querySelectorAll("[data-speed]");
      parallaxElements?.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-speed") || "1");
        const yValue = (1 - speed) * 150;

        gsap.fromTo(el,
          { y: 0 },
          {
            y: yValue,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            }
          }
        );
      });

      // 3. أنيميشن عداد الأرقام والمميزات (Stats Section) عند السكرول
      gsap.fromTo(`.${styles.statCard}`,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.aboutWrapper} ref={pageRef}>
        
        {/* SECTION 1: HERO BANNER */}
        <header className={styles.aboutHero}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <span className={styles.tagline}>حكايتنا الفاخرة</span>
            <h1 className={styles.heroTitle}>ريستو كافيه... <span>أكثر من كوب قهوة</span></h1>
            <p className={styles.heroDesc}>
              قصة بدأت بشغف البحث عن الرشفة المثالية، لتتحول إلى ملاذ هادئ يجمع عشاق المزاج العالي والجودة الاستثنائية.
            </p>
          </div>
        </header>

        {/* SECTION 2: THE STORY GRID */}
        <section className={styles.storySection}>
          <div className={styles.storyGrid}>
            
            <div className={styles.textSide}>
              <div className={styles.titleZone}>
                <Coffee size={24} className={styles.goldIcon} />
                <h2>كيف بدأت الرحلة؟</h2>
              </div>
              <p>
                في عام 2024، انطلقنا برؤية واضحة: إعادة تعريف تجربة شرب القهوة في مصر. لم نكن نريد مجرد مساحة لتقديم المشروبات، بل أردنا بناء معمل متكامل يُحضر كل كوب كلوحة فنية فريدة تناسب روح يومك.
              </p>
              <p>
                نسافر عبر القارات لنستورد حبوب البن السنجل أوريجين المستدامة بنسبة 100% مباشرة من مزارع تجارة عادلة، ونقوم بتحميصها محلياً بحرص هندسي دقيق لنبرز الإيحاءات الكامنة داخل كل حبة بن.
              </p>
            </div>

            <div className={styles.imageSide} data-speed="0.85">
              <div className={styles.imageContainer}>
                <Image 
                  src="/herobanner.jpeg" 
                  alt="Roasting Coffee Beans" 
                  fill 
                  priority
                  className={styles.storyImg}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: VALUES & STATS */}
        <section className={styles.statsSection} ref={statsRef}>
          <div className={styles.sectionHeader}>
            <h2>ركائز الجودة والكمال لدينا</h2>
            <p>أرقام وقيم نعتز بها في كل تفصيلة نقدمها لك يومياً</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.iconBox}><Heart size={24} /></div>
              <h3>+١٠ آلاف</h3>
              <p>عميل سعيد ومحب لخلطاتنا</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.iconBox}><ShieldCheck size={24} /></div>
              <h3>١٠٠٪</h3>
              <p>حبوب مستدامة ذات جودة ممتازة</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.iconBox}><Users size={24} /></div>
              <h3>+٢٥</h3>
              <p>باريستا بمهارات فنية وهندسية</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.iconBox}><Sparkles size={24} /></div>
              <h3>+٥٠</h3>
              <p>مشروب مبتكر وحلويات فرنسية فاخرة</p>
            </div>
          </div>
        </section>

        {/* SECTION 4: CALL TO ACTION */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <h2>هل أنت جاهز لتجربة مشروبك القادم؟</h2>
            <p>اكتشف قائمتنا الاستثنائية المحدثة لايف واطلب رشفة تفصلك عن العالم الآن.</p>
            <Link href="/menu" className={styles.ctaBtn}>
              تصفح المنيو الفاخر <ArrowLeft size={18} />
            </Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}