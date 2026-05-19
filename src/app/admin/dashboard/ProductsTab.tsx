"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Star, Edit, Search, ChevronRight, ChevronLeft, X, Save, Loader2, Upload } from "lucide-react";
import { supabase } from "@/utils/supabase";
import styles from "./ProductsTab.module.scss";

interface LocalProduct {
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

interface ProductsProps { 
  products: LocalProduct[]; 
  setProducts: React.Dispatch<React.SetStateAction<any[]>>; 
  showToast: (msg: string, type?: "success" | "error" | "warn") => void; 
}

const ITEMS_PER_PAGE = 5;

export function ProductsTab({ products, setProducts, showToast }: ProductsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LocalProduct | null>(null);

  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleDelete = async (id: number) => {
    if (!confirm("هل تريد حذف هذا المنتج نهائياً؟")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast("تم حذف المنتج بنجاح من قائمة الكافيه", "success");
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ غير متوقع أثناء عملية الحذف", "error");
    }
  };

  const openEditModal = (product: LocalProduct) => {
    setEditingProduct({ ...product });
    setFile1(null);
    setFile2(null);
    setFile3(null);
    setIsEditModalOpen(true);
  };

  // 🛠️ تم التعديل هنا: ضبط اسم الـ Bucket الافتراضي ليكون cafe-images ليطابق حسابك بالملي ويختفي الـ 404
  const uploadImageToStorage = async (file: File, bucketName = "cafe-images"): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setIsSaving(true);

      let finalImg1 = editingProduct.img;
      let finalImg2 = editingProduct.img2 || "";
      let finalImg3 = editingProduct.img3 || "";

      if (file1) {
        const url = await uploadImageToStorage(file1);
        if (url) finalImg1 = url;
      }
      if (file2) {
        const url = await uploadImageToStorage(file2);
        if (url) finalImg2 = url;
      }
      if (file3) {
        const url = await uploadImageToStorage(file3);
        if (url) finalImg3 = url;
      }

      const updatedData = {
        ...editingProduct,
        img: finalImg1,
        img2: finalImg2,
        img3: finalImg3,
      };

      const { error } = await supabase
        .from("products")
        .update({
          name: updatedData.name,
          category: updatedData.category,
          price: Number(updatedData.price),
          discount: updatedData.discount ? Number(updatedData.discount) : 0,
          rate: Number(updatedData.rate),
          description: updatedData.description || "",
          img: updatedData.img,
          img2: updatedData.img2,
          img3: updatedData.img3,
        })
        .eq("id", updatedData.id);

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === updatedData.id ? updatedData : p));
      showToast("تم تحديث بيانات المنتج ومجلد الصور بنجاح", "success");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ أثناء تحديث بيانات وصور المنتج بالسيرفر", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.zone}>
      <h2 className={styles.title}>إدارة <span>المنتجات الحالية</span></h2>
      
      <div className={styles.searchBarZone}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="ابحث باسم المنتج أو الفئة لايف..." 
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الفئة</th>
              <th>السعر الأساسي</th>
              <th>الخصم</th>
              <th>التقييم</th>
              <th>إجراءات التحكم</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#a0a0a0" }}>
                  لا توجد منتجات مطابقة لبحثك الحالي.
                </td>
              </tr>
            ) : (
              paginatedProducts.map(p => (
                <tr key={p.id}>
                  <td className={styles.cell}>
                    <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                      <Image src={p.img} alt={p.name} fill style={{ objectFit: "cover" }} />
                    </div>
                    <span>{p.name}</span>
                  </td>
                  <td>{p.category}</td>
                  <td className={styles.price}>{p.price} ج.م</td>
                  <td style={{ color: p.discount && p.discount > 0 ? "#e74c3c" : "#a0a0a0", fontWeight: "600" }}>
                    {p.discount && p.discount > 0 ? `${p.discount}%` : "بدون"}
                  </td>
                  <td><Star size={14} fill="#b5835a" color="#b5835a"/> {p.rate}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button onClick={() => openEditModal(p)} className={styles.editBtn} aria-label="تعديل"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(p.id)} className={styles.delBtn} aria-label="حذف"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationZone}>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
            className={styles.pagArrow}
          >
            <ChevronRight size={18} />
          </button>
          
          <div className={styles.pagesNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page} 
                onClick={() => setCurrentPage(page)}
                className={`${styles.pageNumberBtn} ${currentPage === page ? styles.activePage : ""}`}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages}
            className={styles.pagArrow}
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {isEditModalOpen && editingProduct && (
          <div className={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={styles.modalContent}
            >
              <div className={styles.modalHeader}>
                <h3>تعديل منتج: <span style={{ color: "#b5835a" }}>{editingProduct.name}</span></h3>
                <button onClick={() => setIsEditModalOpen(false)} className={styles.closeModalBtn}><X size={20} /></button>
              </div>

              <form onSubmit={handleUpdateProduct} className={styles.modalForm}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>اسم المنتج</label>
                    <input type="text" required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>الفئة (Category)</label>
                    <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                      <option value="coffee">قهوة دافئة</option>
                      <option value="iced">قهوة مثلجة</option>
                      <option value="mojito">موهيتو</option>
                      <option value="sweets">الحلويات</option>
                      <option value="bakery">مخبوزات</option>
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>السعر (ج.م)</label>
                    <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>نسبة الخصم (%)</label>
                    <input type="number" min="0" max="100" value={editingProduct.discount || 0} onChange={e => setEditingProduct({...editingProduct, discount: Number(e.target.value)})} />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>التقييم الافتراضي (Rate)</label>
                    <input type="number" step="0.1" min="1" max="5" required value={editingProduct.rate} onChange={e => setEditingProduct({...editingProduct, rate: Number(e.target.value)})} />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>الصورة الأساسية للمشروب (ملف)</label>
                    <div className={styles.fileUploadWrapper}>
                      <input type="file" accept="image/*" onChange={e => setFile1(e.target.files?.[0] || null)} id="fileImg1" style={{ display: "none" }} />
                      <label htmlFor="fileImg1" className={styles.fileLabelBtn}>
                        <Upload size={14} /> 
                        <span>{file1 ? file1.name : "اختر ملف الصورة الأول..."}</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>صورة السلايدر الثانية (ملف)</label>
                    <div className={styles.fileUploadWrapper}>
                      <input type="file" accept="image/*" onChange={e => setFile2(e.target.files?.[0] || null)} id="fileImg2" style={{ display: "none" }} />
                      <label htmlFor="fileImg2" className={styles.fileLabelBtn}>
                        <Upload size={14} /> 
                        <span>{file2 ? file2.name : "اختر ملف الصورة الثاني..."}</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>صورة السلايدر الثالثة (ملف)</label>
                    <div className={styles.fileUploadWrapper}>
                      <input type="file" accept="image/*" onChange={e => setFile3(e.target.files?.[0] || null)} id="fileImg3" style={{ display: "none" }} />
                      <label htmlFor="fileImg3" className={styles.fileLabelBtn}>
                        <Upload size={14} /> 
                        <span>{file3 ? file3.name : "اختر ملف الصورة الثالث..."}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
                  <label>وصف المشروب/المنتج الشامل (حتى 30 كلمة)</label>
                  <textarea rows={3} value={editingProduct.description || ""} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} placeholder="اكتب تفاصيل ومكونات الطعم هنا..." />
                </div>

                <div className={styles.modalActions}>
                  <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                    {isSaving ? <Loader2 size={16} className={styles.spinner} /> : <><Save size={16} /> <span>حفظ التعديلات الحية</span></>}
                  </button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className={styles.cancelBtn}>إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}