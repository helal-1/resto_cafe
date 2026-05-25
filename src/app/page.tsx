"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { ArrowLeft, Coffee, Flame, Heart, ShoppingBag, Award, GlassWater, Loader2, Percent, Tag, X, LogIn } from "lucide-react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { supabase } from "@/utils/supabase";
import styles from "./page.module.scss";

// استيراد العملاق GSAP والـ ScrollTrigger السحري
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// تفعيل ميزة مراقبة السكرول من GSAP رسمياً
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Product {
  id: number;
  category: string;
  name: string;
  price: number;
  img: string;
  img2?: string;
  img3?: string;
  discount?: number;
  description?: string;
}

const categories = [
  { id: "coffee", name: "قهوة دافئة", img: "/0.5528140934805816.jpeg" },
  { id: "iced", name: "قهوة مثلجة", img: "/1779464138787-gudadm5.jpeg" },
  { id: "mojito", name: "موهيتو منعش", img: "/0.7195448592161238.jpeg" },
  { id: "sweets", name: "حلويات فخمة", img: "/0.6416238160303595.jpeg" },
  { id: "juices", name: "عصائر طبيعية", img: "/0.11233876147254995.jpeg" },
  { id: "bakery", name: "مخبوزات طازجة", img: "/1779464172820-6njyu9.jpeg" },
];

const sliderData = [
  {
    id: 1,
    subtitle: "غنية. ناعمة. مثالية.",
    title1: "تذوق القهوة كما",
    title2: "لم تفعل من قبل",
    desc: "مشروبات صنعت يدوياً بحرفية من أجود حبوب البن الفاخرة، لتُحضر لك بكل إتقان وشغف يناسب يومك.",
    img: "/herobanner.jpeg",
  },
  {
    id: 2,
    subtitle: "طازجة. دافئة. فاخرة.",
    title1: "حلويات فرنسية تذوب",
    title2: "مع كل رشفة هادئة",
    desc: "تشكيلة فاخرة من المخبوزات والحلويات اليومية الطازجة المصنوعة خصيصاً لتتناغم مع فنجان قهوتك المفضل.",
    img: "/herobanner (1).jpeg",
  },
  {
    id: 3,
    subtitle: "منعشة. باردة. طبيعية.",
    title1: "انتعاش الصيف اللذيذ مع",
    title2: "الموهيتو والعصائر",
    desc: "جدد طاقتك وحيوية يومك مع مجموعتنا الاستثنائية من الموهيتو البارد والعصائر الطبيعية المنعشة بنكهات مبتكرة.",
    img: "/herobanner (2).jpeg",
  }
];

const timelineSteps = [
  {
    id: 1,
    num: "٠١",
    title: "اختيار الحبوب الفاخرة",
    desc: "نسافر حول العالم لنستورد أجود أنواع حبوب البن السنجل أوريجين المستدامة بنسبة 100% ومن مزارع تجارة عادلة وموثوقة.",
    icon: <Coffee size={22} />,
    img: "/Coffee-Beans-Download-PNG-Image.png",
    side: "right"
  },
  {
    id: 2,
    num: "٠٢",
    title: "التحميص الاحترافي الفخم",
    desc: "نحمص حبوب البن محلياً داخل معملنا وبدرجات حرارة مدروسة بالملي لنبرز الإيحاءات والنكهات الحقيقية الكامنة في كل حبة بن.",
    icon: <Flame size={22} />,
    img: "/—Pngtree—a pile of coffee beans_15739210.png",
    side: "left"
  },
  {
    id: 3,
    num: "٠٣",
    title: "مهارة الباريستا والتحضير",
    desc: "أيدي محترفة تجمع بين الفن والهندسة لاستخلاص جرعة الإسبريسو المثالية بضغط وضبط وضبط مثالي يسحر حواسك.",
    icon: <Award size={22} />,
    img: "/barista.png",
    side: "right"
  },
  {
    id: 4,
    num: "٠٤",
    title: "التقديم والانتعاش الفاخر",
    desc: "نقدم مشروباتنا وحلوياتنا الطازجة والموهيتو المبتكر في أجواء دافئة ومصممة خصيصاً لتمنحك رشفة تفصلك عن العالم.",
    icon: <GlassWater size={22} />,
    img: "/line1.png",
    side: "left"
  }
];

function ProductImageSlider({ item }: { item: Product }) {
  const images = useMemo(() => {
    return [item.img, item.img2, item.img3].filter(Boolean) as string[];
  }, [item.img, item.img2, item.img3]);

  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      const imgEl = containerRef.current?.querySelector(`.${styles.productImg}`);
      if (imgEl) {
        gsap.to(imgEl, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            setIndex((prev) => (prev + 1) % images.length);
            gsap.to(imgEl, { opacity: 1, duration: 0.4 });
          }
        });
      } else {
        setIndex((prev) => (prev + 1) % images.length);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className={styles.sliderContainer} ref={containerRef}>
      <div className={styles.sliderImageWrapper}>
        <Image src={images[index]} alt={item.name} fill className={styles.productImg} sizes="200px" style={{ transition: "none" }} />
      </div>
      
      {images.length > 1 && (
        <div className={styles.sliderDots}>
          {images.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === index ? styles.activeDot : ""}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const totalSlides = sliderData.length;
  const slideDuration = 5000;

  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const popularRef = useRef<HTMLElement>(null);
  const infobarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function fetchPopular() {
      try {
        setLoadingProducts(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("rate", { ascending: false })
          .limit(10);

        if (error) throw error;
        if (data) setPopularProducts(data as Product[]);
      } catch (err) {
        console.error("Error loading popular products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchPopular();
  }, []);

  const addToCart = async (productId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAlertModalOpen(true);
        return;
      }

      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", session.user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert([{ user_id: session.user.id, product_id: productId, quantity: 1 }]);
      }
      window.dispatchEvent(new Event("cartUpdate"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const bgWrapper = heroRef.current?.querySelector(`.${styles.heroBgImageWrapper}`);
      const textWrapper = heroRef.current?.querySelector(`.${styles.heroContent}`);
      
      if (bgWrapper && textWrapper) {
        gsap.to([bgWrapper, textWrapper], {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            setCurrent((prev) => (prev + 1) % totalSlides);
            gsap.to([bgWrapper, textWrapper], { opacity: 1, duration: 0.8 });
          }
        });
      } else {
        setCurrent((prev) => (prev + 1) % totalSlides);
      }
    }, slideDuration);
    return () => clearInterval(timer);
  }, [totalSlides]);

  useEffect(() => {
    // أ. أنيميشن الـ Hero
    const heroCtx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(`.${styles.subtitle}`, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.6 })
        .fromTo(`.${styles.title}`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
        .fromTo(`.${styles.desc}`, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.3")
        .fromTo(`.${styles.actions} a`, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, stagger: 0.15, duration: 0.4 }, "-=0.2");
    }, heroRef);

    // ب. أنيميشن سكشن "من نحن" مع حقن تأثير الـ Parallax & Trailing السحري الذكي 🌟
    const aboutCtx = gsap.context(() => {
      // 1. أنيميشن الظهور الأساسي
      gsap.fromTo(`.${styles.aboutTextSide} > *`, 
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.15,
          scrollTrigger: {
            trigger: aboutRef.current,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        }
      );

      // 2. كود الـ Parallax الأوتوماتيكي المبني على الـ data-speed بالملي!
      const parallaxElements = aboutRef.current?.querySelectorAll("[data-speed]");
      parallaxElements?.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-speed") || "1");
        // حساب المسافة الإزاحية بناءً على سرعة العنصر الخاصة
        const yValue = (1 - speed) * 120; 

        gsap.fromTo(el,
          { y: 0 },
          {
            y: yValue,
            ease: "none",
            scrollTrigger: {
              trigger: aboutRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6, // رقم ناعم لصنع تأثير الـ Trailing (اللحاق الانسيابي الناعم)
            }
          }
        );
      });
    }, aboutRef);

    // ج. الـ Timeline المطور بالـ Scrub والانسيابية التامة بدون Markers
    const timelineCtx = gsap.context(() => {
      gsap.fromTo(`.${styles.centerLine}`, 
        { height: "0%" },
        { 
          height: "100%", 
          ease: "none",
          scrollTrigger: {
            trigger: `.${styles.timelineContainer}`,
            start: "top 70%",   
            end: "bottom 80%",  
            scrub: 0.5,         
            markers: false,
            id: "timeline-glow-line"
          }
        }
      );

      const rows = timelineRef.current?.querySelectorAll(`.${styles.timelineRow}`);
      rows?.forEach((row: Element) => {
        const textBlock = row.querySelector(`.${styles.textBlock}`);
        const centerNode = row.querySelector(`.${styles.centerCircleNode}`);
        const imageBlock = row.querySelector(`.${styles.imageBlock}`);

        const rowTl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
            end: "top 45%",
            scrub: 1, 
          }
        });

        rowTl.fromTo(textBlock, 
          { opacity: 0, x: row.classList.contains(styles.reverseRow) ? -80 : 80 },
          { opacity: 1, x: 0, ease: "power2.out" }
        )
        .fromTo(centerNode, 
          { scale: 0, backgroundColor: "#18110c", borderColor: "rgba(181, 131, 90, 0.2)" },
          { 
            scale: 1.2, 
            backgroundColor: "#b5835a", 
            borderColor: "#f4eae1",
            boxShadow: "0 0 20px #b5835a, 0 0 40px rgba(181, 131, 90, 0.4)" 
          }, 
          "-=0.5" 
        )
        .fromTo(imageBlock, 
          { opacity: 0, scale: 0.7, rotate: row.classList.contains(styles.reverseRow) ? -12 : 12 },
          { opacity: 1, scale: 1, rotate: 0, ease: "back.out(1.2)" }, 
          "-=0.4"
        );
      });
    }, timelineRef);

    // د. أنيميشن كروت الأكثر مبيعاً
    let popularCtx: gsap.Context | null = null;
    if (!loadingProducts && popularProducts.length > 0) {
      popularCtx = gsap.context(() => {
        gsap.fromTo(`.${styles.card}`,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: "power2.out",
            scrollTrigger: {
              trigger: popularRef.current,
              start: "top 75%",
              toggleActions: "play none none none"
            }
          }
        );
      }, popularRef);
    }

    // هـ. أنيميشن شريط المميزات السفلي
    const infoCtx = gsap.context(() => {
      gsap.fromTo(`.${styles.infoItem}`,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.15,
          scrollTrigger: {
            trigger: infobarRef.current,
            start: "top 90%"
          }
        }
      );
    }, infobarRef);

    return () => {
      heroCtx.revert();
      aboutCtx.revert();
      timelineCtx.revert();
      if (popularCtx) popularCtx.revert();
      infoCtx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [loadingProducts, popularProducts]);

  const currentSlide = sliderData[current];



 

  return (
    <>

      <Navbar />

      <div className={styles.container}>

        {/* 1. HERO SECTION */}
        <section className={styles.hero} ref={heroRef}>
          <div className={styles.heroBgContainer}>
            <div className={styles.heroBgImageWrapper}>
              <Image
                src={currentSlide.img}
                alt="Resto Cafe Background"
                fill
                priority
                className={styles.bgImage}
                style={{ transition: "none" }}
              />
            </div>
            <div className={styles.heroOverlay} />
            <div className={styles.heroGlow} />
          </div>

          <div className={styles.heroContentContainer}>
            <div className={styles.sliderContentWrapper}>
              <div className={styles.heroContent}>
                <span className={styles.subtitle}>{currentSlide.subtitle}</span>
                <h1 className={styles.title}>
                  {currentSlide.title1} <br /> <span>{currentSlide.title2}</span>
                </h1>
                <p className={styles.desc}>{currentSlide.desc}</p>
                <div className={styles.actions}>
                  <Link href="/menu" className={styles.btnPrimary}>
                    اكتشف المنيو <ArrowLeft size={18} />
                  </Link>
                  <Link href="/about" className={styles.btnSecondary}>
                    قصتنا
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sliderControls}>
            <div className={styles.counter}>
              <span className={styles.currentNum}>0{current + 1}</span>
              <span className={styles.separator}>/</span>
              <span className={styles.totalNum}>0{totalSlides}</span>
            </div>

            <div className={styles.progressContainer}>
              {sliderData.map((_, index) => (
                <div
                  key={index}
                  className={`${styles.progressBarWrapper} ${index === current ? styles.activeWrapper : ""}`}
                  onClick={() => setCurrent(index)}
                >
                  <div className={styles.progressBarBg}>
                    {index === current && (
                      <div className={styles.progressBarFill} style={{ height: "100%", transition: `height ${slideDuration}ms linear` }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.bottomFeaturesBar}>
            <div className={styles.features}>
              <div><Coffee size={18} /> حبوب بن ممتازة فاخرة</div>
              <div><Flame size={18} /> تحميص احترافي فخم</div>
              <div><Heart size={18} /> صُنع بكل حب وشغف</div>
            </div>
          </div>
        </section>

        {/* أصناف المشاريب الدائري */}
        <section className={styles.categoriesTrack}>
          <div className={styles.trackContainer}>
            <div className={styles.trackMarquee}>
              <div className={styles.trackGroup}>
                {categories.map((cat, idx) => (
                  <Link href={`/menu?cat=${cat.id}`} key={`cat1-${idx}`} className={styles.categoryItem}>
                    <div className={styles.itemCircle}>
                      <Image src={cat.img} alt={cat.name} width={100} height={100} className={styles.catImg} />
                    </div>
                    <span className={styles.catName}>{cat.name}</span>
                  </Link>
                ))}
              </div>
              <div className={styles.trackGroup} aria-hidden="true">
                {categories.map((cat, idx) => (
                  <Link href={`/menu?cat=${cat.id}`} key={`cat2-${idx}`} className={styles.categoryItem}>
                    <div className={styles.itemCircle}>
                      <Image src={cat.img} alt={cat.name} width={100} height={100} className={styles.catImg} />
                    </div>
                    <span className={styles.catName}>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. ABOUT US SECTION (تم حقن سمات الـ Parallax والسرعات المخصصة هنا) */}
        <section className={styles.about} ref={aboutRef}>
          <div className={styles.aboutGrid}>
            {/* جعل الصورة تتحرك بسرعة 0.7 لتأثير عمق فخم */}
            <div className={styles.aboutImageSide} data-speed="0.7">
              <Image 
                src="/about.jpeg" 
                alt="Brew Haven Blend" 
                fill
                sizes="(max-width: 968px) 100vw, 50vw"
                priority
                className={styles.aboutImage} 
              />
            </div>
            
            <div className={styles.aboutTextSide}>
              <span className={styles.sectionSubtitle}>من نحن</span>
              <h2>أكثر من مجرد <br /> كوب قهوة</h2>
              <p>في ريستو كافيه, نؤمن أن القهوة ليست مجرد مشروب عادي - بل هي تجربة فريدة متكاملة. كل كوب نقدمه لك هو مزيج من الشغف, الجودة والكمال الهادئ.</p>

              <ul className={styles.bullets}>
                <li><span>✓</span> حبوب مستدامة ومختارة بعناية</li>
                <li><span>✓</span> تجارة عادلة وموثوقة</li>
                <li><span>✓</span> محمصة طازجة أولاً بأول</li>
                <li><span>✓</span> تحضير يدوي بأيدي باريستا محترفين</li>
              </ul>
              <Link href="/about" className={styles.btnPrimary}>
                تعرف علينا أكثر <ArrowLeft size={18} />
              </Link>

              {/* جعل الأوراق العائمة تطير بسرعة 1.4 لتصنع أقوى تأثير Trailing عائم خلف النصوص! */}
              <div className={styles.floatingLeaves} data-speed="1.4">
                <Image 
                  src="/leavesImg.png" 
                  alt="Leaves Decorative" 
                  width={350} 
                  height={400} 
                  className={styles.leavesImg}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2.5 INTERACTIVE TIMELINE SECTION */}
        <section className={styles.interactiveTimeline} ref={timelineRef}>
          <div className={styles.timelineHeader}>
            <span className={styles.sectionSubtitle}>رحلة الجودة والكمال</span>
            <h2 className={styles.sectionTitle}>كيف نصنع كوبك المثالي?</h2>
          </div>

          <div className={styles.timelineContainer}>
            <div className={styles.centerLine} />

            {timelineSteps.map((step) => (
              <div key={step.id} className={`${styles.timelineRow} ${step.side === "left" ? styles.reverseRow : ""}`}>
                <div className={styles.textBlock}>
                  <span className={styles.stepNumber}>{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>

                <div className={styles.centerNodeWrapper}>
                  <div className={styles.centerCircleNode}>
                    <span className={styles.nodeIcon}>{step.icon}</span>
                  </div>
                </div>

                <div className={styles.imageBlock}>
                  <div className={styles.pngWrapper}>
                    <Image 
                      src={step.img} 
                      alt={step.title} 
                      width={500} 
                      height={300} 
                      className={styles.stepPng}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* === 3. POPULAR PICKS SECTION === */}
        <section className={styles.popular} ref={popularRef}>
          <span className={styles.sectionSubtitle}>توقيعنا الخاص</span>
          <h2 className={styles.sectionTitle}>الأكثر مبيعاً ورواجاً</h2>

          <div className={styles.carouselContainer}>
            <button 
              className={`${styles.arrowBtn} ${styles.arrowRight}`} 
              onClick={() => {
                const el = document.getElementById('popularSlider');
                if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
              }}
              aria-label="المجموعة التالية"
              suppressHydrationWarning
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" color="wheat" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            <div className={styles.sliderTrack} id="popularSlider">
              {loadingProducts ? (
                <div className={styles.loadingBoxInside}>
                  <Loader2 size={30} className={styles.spinner} />
                  <p>جاري سحب المشروبات الأكثر رواجاً...</p>
                </div>
              ) : (
                popularProducts.map((product) => {
                  const priceAfterDiscount = product.discount && product.discount > 0 
                    ? Math.round(product.price - (product.price * product.discount / 100))
                    : product.price;

                  const getCategoryName = (catId: string) => {
                    const found = [
                      { id: "coffee", name: "قهوة دافئة" },
                      { id: "iced", name: "قهوة مثلجة" },
                      { id: "mojito", name: "موهيتو" },
                      { id: "sweets", name: "الحلويات" },
                      { id: "bakery", name: "مخبوزات" }
                    ].find(c => c.id === catId);
                    return found ? found.name : catId;
                  };

                  return (
                    <div className={styles.card} key={product.id}>
                      <div className={styles.cardImg}>
                        <ProductImageSlider item={product} />

                        {product.discount && product.discount > 0 ? (
                          <div className={styles.discountBadge}>
                            <Percent size={10} />
                            <span>خصم {product.discount}%</span>
                          </div>
                        ) : null}

                        <div className={styles.categoryBadge}>
                          <Tag size={10} />
                          <span>{getCategoryName(product.category)}</span>
                        </div>
                      </div>

                      <h3>{product.name}</h3>
                      <p className={styles.cardDesc}>
                        {product.description || "مشروب محضّر بعناية فائقة من أجود المكونات الطبيعية الفاخرة."}
                      </p>
                      
                      <div className={styles.cardFooter}>
                        <div className={styles.priceZone}>
                          <span className={styles.price}>{priceAfterDiscount} ج.م</span>
                          {product.discount && product.discount > 0 && (
                            <span className={styles.oldPrice}>{product.price} ج.م</span>
                          )}
                        </div>
                        <button 
                          className={styles.btnCart} 
                          onClick={() => addToCart(product.id)}
                          aria-label="أضف إلى السلة"
                        >
                          <ShoppingBag size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button 
              className={`${styles.arrowBtn} ${styles.arrowLeft}`} 
              onClick={() => {
                const el = document.getElementById('popularSlider');
                if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
              }}
              aria-label="المجموعة السابقة"
              suppressHydrationWarning
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" color="wheat" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          </div>

          <div className={styles.viewMenuAction}>
            <Link href="/menu" className={styles.btnPrimaryOutline}>
              عرض المنيو بالكامل ←
            </Link>
          </div>
        </section>

        {/* 4. FEATURES INFOBAR */}
        <section className={styles.featuresInfobar} ref={infobarRef}>
          <div className={styles.infobarGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" color="wheat" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10"/><path d="M14 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M20 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M20 14h2l2 3v3h-2"/><path d="M3 8h16"/></svg>
              </div>
              <div className={styles.infoText}>
                <h4>توصيل مجاني</h4>
                <p>للطلبات الأعلى من 249 ج.م</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div className={styles.infoText}>
                <h4>طازج وسريع</h4>
                <p>يُحضر بكل حب وعناية فورية</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div className={styles.infoText}>
                <h4>دفع آمن 100%</h4>
                <p>حماية كاملة لبياناتك الشخصية</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div className={styles.infoText}>
                <h4>مكافآت الولاء</h4>
                <p>اجمع النقاط مع كل رشفة قهوة</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* نافذة التنبيه المخصصة الفاخرة لطلب تسجيل الدخول */}
      {isAlertModalOpen && (
        <div 
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", 
            backdropFilter: "blur(6px)", zIndex: 99999, display: "flex", 
            alignItems: "center", justifyContent: "center", padding: "1rem"
          }}
          onClick={() => setIsAlertModalOpen(false)}
        >
          <div 
            style={{
              background: "#18110c", border: "1px solid #b5835a", borderRadius: "20px",
              width: "100%", maxWidth: "420px", padding: "2rem", textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)", direction: "rtl",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsAlertModalOpen(false)}
              style={{
                position: "absolute", top: "1rem", left: "1rem", background: "transparent",
                border: "none", color: "#a0a0a0", cursor: "pointer"
              }}
            >
              <X size={20} />
            </button>

            <div style={{ background: "rgba(181, 131, 90, 0.1)", width: "56px", height: "56px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#b5835a", margin: "0 auto 1.2rem" }}>
              <ShoppingBag size={26} />
            </div>

            <h3 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: "600", marginBottom: "0.5rem" }}>تسجيل الدخول مطلوب</h3>
            <p style={{ color: "#a0a0a0", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1.8rem" }}>
              الرجاء تسجيل الدخول أولاً لتتمكن من إضافة المشروبات والمأكولات الفاخرة إلى سلة مشترياتك والاستمتاع بتجربة ريستو.
            </p>

            <div style={{ display: "flex", gap: "1rem" }}>
              <Link 
                href="/login"
                style={{
                  flex: 1, background: "#b5835a", color: "#fff", padding: "0.75rem",
                  borderRadius: "10px", fontWeight: "600", textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                }}
              >
                <LogIn size={16} />
                <span>تسجيل الدخول</span>
              </Link>
              <button 
                onClick={() => setIsAlertModalOpen(false)}
                style={{
                  flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#a0a0a0", padding: "0.75rem", borderRadius: "10px", fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}