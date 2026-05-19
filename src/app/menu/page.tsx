"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, SlidersHorizontal, ShoppingBag, ChevronLeft, ChevronRight, 
  Star, Check, Loader2, LayoutGrid, Grid3X3, Percent, Tag, Bookmark, X, LogIn
} from "lucide-react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { supabase } from "@/utils/supabase";
import styles from "./menu.module.scss";

interface Product {
  id: number;
  category: string;
  name: string;
  price: number;
  img: string;
  img2?: string;
  img3?: string;
  rate: number;
  discount?: number;
  description?: string;
}

const categories = [
  { id: "all", name: "الكل" },
  { id: "coffee", name: "قهوة دافئة" },
  { id: "iced", name: "قهوة مثلجة" },
  { id: "mojito", name: "موهيتو" },
  { id: "sweets", name: "الحلويات" },
  { id: "bakery", name: "مخبوزات" },
];

const sortOptions = [
  { id: "default", name: "الترتيب الافتراضي" },
  { id: "best", name: "الأعلى تقييماً (الأفضل)" },
  { id: "low-price", name: "السعر: من الأقل للأعلى" },
  { id: "high-price", name: "السعر: من الأعلى للأقل" },
];

const ITEMS_PER_PAGE = 6;

function ProductImageSlider({ item }: { item: Product }) {
  const images = useMemo(() => {
    return [item.img, item.img2, item.img3].filter(Boolean) as string[];
  }, [item.img, item.img2, item.img3]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className={styles.sliderContainer}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.sliderImageWrapper}
        >
          <Image src={images[index]} alt={item.name} fill className={styles.productImg} sizes="(max-width: 768px) 100vw, 33vw" />
        </motion.div>
      </AnimatePresence>
      
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

export default function MenuPage() {
  const [menuData, setMenuData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewGridColumns, setViewGridColumns] = useState<3 | 2>(3);

  // 🛠️ ستيت النوافذ العائمة المخصصة للشياكة
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [showLoginBtn, setShowLoginBtn] = useState(false);

  const triggerModal = (title: string, desc: string, loginRequired = false) => {
    setModalTitle(title);
    setModalDesc(desc);
    setShowLoginBtn(loginRequired);
    setModalOpen(true);
  };

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("products").select("*");
        if (error) throw error;
        if (data) setMenuData(data);
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const processedItems = useMemo(() => {
    const items = [...menuData].filter(item => 
      (activeCat === "all" || item.category === activeCat) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "best") items.sort((a, b) => b.rate - a.rate);
    else if (sortBy === "low-price") items.sort((a, b) => a.price - b.price);
    else if (sortBy === "high-price") items.sort((a, b) => b.price - a.price);

    return items;
  }, [menuData, activeCat, searchQuery, sortBy]);

  const totalPages = Math.ceil(processedItems.length / ITEMS_PER_PAGE) || 1;
  
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [processedItems, currentPage]);

  const getCategoryName = (catId: string) => {
    const found = categories.find(c => c.id === catId);
    return found ? found.name : catId;
  };

  const addToCart = async (productId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        triggerModal("تسجيل الدخول مطلوب", "الرجاء تسجيل الدخول أولاً لتتمكن من إضافة المشروبات للسلة والاستمتاع بطلبك.", true);
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
      console.error("Cart action error:", err);
    }
  };

  const addToSaved = async (productId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        triggerModal("تسجيل الدخول مطلوب", "الرجاء تسجيل الدخول أولاً لحفظ المشروب في معرض مجموعاتك الفاخرة.", true);
        return;
      }

      const { data: existing } = await supabase
        .from("saved_items")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (!existing) {
        await supabase.from("saved_items").insert([{ user_id: session.user.id, product_id: productId }]);
        window.dispatchEvent(new Event("savedUpdate"));
        triggerModal("تم الحفظ بنجاح", "تمت إضافة المشروب لمعرض المجموعات المحفوظة الخاصة بك بتأثيرات حركية.", false);
      } else {
        triggerModal("محفوظ بالفعل", "هذا المشروب متواجد بالفعل داخل لوحة مجموعاتك الفاخرة.", false);
      }
    } catch (err) {
      console.error("Saved action error:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.menuPageWrapper}>
        
        <header className={styles.menuHero}>
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            قائمة <span>الـمشروبات</span>
          </motion.h1>
          <p>استكشف تشكيلتنا الواسعة من أجود أنواع القهوة والمشروبات المبتكرة المحدثة لايف</p>
        </header>

        <main className={styles.mainLayout}>
          
          <aside className={styles.sidebar}>
            <h3>الأصناف</h3>
            <div className={styles.catList}>
              {categories.map((cat) => (
                <button key={cat.id} className={activeCat === cat.id ? styles.active : ""} onClick={() => { setActiveCat(cat.id); setCurrentPage(1); }}>
                  {cat.name}
                  {activeCat === cat.id && (
                    <motion.div layoutId="activeTab" className={styles.activeIndicator} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                </button>
              ))}
            </div>
          </aside>

          <section className={styles.contentArea}>
            <div className={styles.topControlBar}>
              <div className={styles.searchBox}>
                <Search size={18} />
                <input type="text" placeholder="ابحث عن مشروبك المفضل..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
              </div>

              <div className={styles.rightControls}>
                <div className={styles.gridLayoutSwitcher}>
                  <button className={viewGridColumns === 3 ? styles.activeGridBtn : ""} onClick={() => setViewGridColumns(3)} aria-label="عرض 3 منتجات بالصف">
                    <Grid3X3 size={18} />
                  </button>
                  <button className={viewGridColumns === 2 ? styles.activeGridBtn : ""} onClick={() => setViewGridColumns(2)} aria-label="عرض منتجين بالصف">
                    <LayoutGrid size={18} />
                  </button>
                </div>

                <div className={styles.filterContainer}>
                  <button className={`${styles.filterBtn} ${showSortDropdown ? styles.btnActive : ""}`} onClick={() => setShowSortDropdown(!showSortDropdown)}>
                    <SlidersHorizontal size={18} />
                    <span>{sortOptions.find(o => o.id === sortBy)?.name}</span>
                  </button>

                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className={styles.filterDropdown}>
                        {sortOptions.map((option) => (
                          <div key={option.id} className={`${styles.dropdownItem} ${sortBy === option.id ? styles.selectedOpt : ""}`} onClick={() => { setSortBy(option.id); setShowSortDropdown(false); setCurrentPage(1); }}>
                            <span>{option.name}</span>
                            {sortBy === option.id && <Check size={16} className={styles.checkIcon} />}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <Loader2 size={40} className={styles.spinner} />
                <p>جاري تحميل المنيو الفاخر من السيرفر...</p>
              </div>
            ) : (
              <motion.div layout className={`${styles.menuGrid} ${viewGridColumns === 2 ? styles.cols2 : styles.cols3}`}>
                <AnimatePresence mode="popLayout">
                  {paginatedItems.map((item, index) => (
                    <motion.div layout key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, delay: index * 0.05 }} className={styles.menuCard}>
                      
                      <div className={styles.imageWrapper}>
                        <ProductImageSlider item={item} />

                        {item.discount && item.discount > 0 ? (
                          <div className={styles.discountBadge}>
                            <Percent size={10} />
                            <span>خصم {item.discount}%</span>
                          </div>
                        ) : null}

                        <div className={styles.categoryBadge}>
                          <Tag size={10} />
                          <span>{getCategoryName(item.category)}</span>
                        </div>

                        <div className={styles.rateBadge}>
                          <Star size={12} fill="#b5835a" color="#b5835a" /> 
                          <span>{item.rate}</span>
                        </div>
                      </div>

                      <div className={styles.cardInfo}>
                        <h4>{item.name}</h4>
                        
                        <p className={styles.description}>
                          {item.description || "تشكيلة فاخرة ومحضرة يدوياً بعناية من أجود المكونات الطبيعية لتضمن لك تجربة غنية لا تُنسى في ريستو كافيه."}
                        </p>

                        <div className={styles.cardBottom}>
                          <div className={styles.priceZone}>
                            {item.discount && item.discount > 0 ? (
                              <>
                                {/* 🛠️ تم تصليح الحسبة هنا بواسطة Math.round لطرد الكسور تماماً وإخفائها */}
                                <span className={styles.price}>{Math.round(item.price - (item.price * item.discount / 100))} ج.م</span>
                                <span className={styles.oldPrice}>{item.price} ج.م</span>
                              </>
                            ) : (
                              <span className={styles.price}>{item.price} ج.م</span>
                            )}
                          </div>
                          
                          <div style={{ display: "flex", gap: "8px" }}>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => addToSaved(item.id)} className={styles.archiveBtn} aria-label="حفظ بالمجموعات">
                              <Bookmark size={18} />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => addToCart(item.id)} className={styles.addBtn} aria-label="أضف إلى السلة" suppressHydrationWarning>
                              <ShoppingBag size={18} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {totalPages > 1 && !loading && (
              <div className={styles.pagination}>
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={currentPage === 1 ? styles.disabledBtn : ""}>
                  <ChevronRight size={20} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={currentPage === page ? styles.activePage : ""}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={currentPage === totalPages ? styles.disabledBtn : ""}>
                  <ChevronLeft size={20} />
                </button>
              </div>
            )}

          </section>
        </main>
      </div>

      {/* 🛠️ الـ Custom Premium Modal البديل المتكامل للـ alert القديم */}
      <AnimatePresence>
        {modalOpen && (
          <div 
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", 
              backdropFilter: "blur(6px)", zIndex: 99999, display: "flex", 
              alignItems: "center", justifyContent: "center", padding: "1rem"
            }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                background: "#18110c", border: "1px solid #b5835a", borderRadius: "20px",
                width: "100%", maxWidth: "420px", padding: "2.2rem 2rem", textAlign: "center",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)", direction: "rtl", position: "relative"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setModalOpen(false)}
                style={{
                  position: "absolute", top: "1.2rem", left: "1.2rem", background: "transparent",
                  border: "none", color: "#a0a0a0", cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>

              <div style={{ background: "rgba(181, 131, 90, 0.1)", width: "52px", height: "52px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#b5835a", margin: "0 auto 1.2rem" }}>
                <ShoppingBag size={24} />
              </div>

              <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.6rem" }}>{modalTitle}</h3>
              <p style={{ color: "#a0a0a0", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.8rem" }}>{modalDesc}</p>

              <div style={{ display: "flex", gap: "1rem" }}>
                {showLoginBtn ? (
                  <Link 
                    href="/login"
                    style={{
                      flex: 1, background: "#b5835a", color: "#fff", padding: "0.75rem",
                      borderRadius: "10px", fontWeight: "600", textDecoration: "none",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.9rem"
                    }}
                  >
                    <LogIn size={15} />
                    <span>تسجيل الدخول</span>
                  </Link>
                ) : null}
                <button 
                  onClick={() => setModalOpen(false)}
                  style={{
                    flex: 1, background: showLoginBtn ? "transparent" : "#b5835a", 
                    border: showLoginBtn ? "1px solid rgba(255,255,255,0.1)" : "none",
                    color: showLoginBtn ? "#a0a0a0" : "#fff", padding: "0.75rem", borderRadius: "10px", 
                    fontWeight: "600", cursor: "pointer", fontSize: "0.9rem"
                  }}
                >
                  {showLoginBtn ? "إلغاء" : "حسنًا، فهمت"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}