import { useState } from "react";
import Image from "next/image";
import { Loader2, ImageIcon, FileText, Percent, Upload, CheckCircle2 , Star } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { Product } from "./page";
import styles from "./AddProductTab.module.scss";

interface AddProps { setProducts: React.Dispatch<React.SetStateAction<Product[]>>; refreshData: () => Promise<void>; showToast: (msg: string, type?: "success" | "error" | "warn") => void; switchToProducts: () => void; }

export function AddProductTab({ setProducts, refreshData, showToast, switchToProducts }: AddProps) {
  const [form, setForm] = useState({ name: "", category: "coffee", price: "", rate: "5.0", discount: "0", description: "" });
  const [urls, setUrls] = useState({ img: "", img2: "", img3: "" });
  const [uploading, setUploading] = useState({ img: false, img2: false, img3: false });
  const [submitting, setSubmitting] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: "img" | "img2" | "img3") => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      setUploading(prev => ({ ...prev, [key]: true }));
      const name = `${Math.random()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from("cafe-images").upload(name, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("cafe-images").getPublicUrl(name);
      setUrls(prev => ({ ...prev, [key]: publicUrl }));
      showToast("تم رفع الصورة للمخزن بنجاح", "success");
    } catch { showToast("فشل رفع الصورة", "error"); } finally { setUploading(prev => ({ ...prev, [key]: false })); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!urls.img) { showToast("الرجاء رفع الصورة الرئيسية أولاً!", "warn"); return; }
    try {
      setSubmitting(true);
      const { data, error } = await supabase.from("products").insert([{
        name: form.name, category: form.category, price: Number(form.price), rate: Number(form.rate) || 5.0,
        discount: Number(form.discount) || 0, description: form.description, img: urls.img,
        img2: urls.img2 || "/Coffee time.jpeg", img3: urls.img3 || "/Coffee time.jpeg"
      }]).select();
      if (error) throw error;
      if (data && data[0]) setProducts(prev => [data[0], ...prev]);
      showToast("تم إضافة الصنف الجديد بنجاح!", "success");
      await refreshData(); switchToProducts();
    } catch (err: any) { showToast(`فشل الحفظ: ${err.message}`, "error"); } finally { setSubmitting(false); }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>إدراج <span>صنف جديد ومطور</span> للمنيو</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.group}>
            <label>اسم المشروب</label>
            <input type="text" required placeholder="سبانش لاتيه" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className={styles.group}>
            <label>الفئة</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="coffee">قهوة دافئة</option><option value="iced">قهوة مثلجة</option>
              <option value="mojito">موهيتو</option><option value="sweets">الحلويات</option><option value="bakery">المخبوزات</option>
            </select>
          </div>
        </div>
        <div className={styles.rowThree}>
          <div className={styles.group}><label>السعر الأساسي</label><input type="number" required placeholder="180" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
          <div className={styles.group}><label><Percent size={14} /> الخصم (%)</label><input type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} /></div>
          <div className={styles.group}><label><Star size={14} /> التقييم</label><input type="text" value={form.rate} onChange={e => setForm({...form, rate: e.target.value})} /></div>
        </div>
        <div className={styles.group}><label><FileText size={14} /> وصف المنتج</label><textarea rows={4} required placeholder="اكتب مكونات الصنف..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
        
        <div className={styles.imgTitle}><ImageIcon size={16} /> <span>رفع الصور (حتى 3 صور حية)</span></div>
        <div className={styles.rowThree}>
          {(["img", "img2", "img3"] as const).map((key, index) => (
            <div key={key} className={styles.upCard}>
              <label>{index === 0 ? "الصورة الرئيسية" : `الصورة الإضافية ${index + 1}`}</label>
              <div className={styles.box}>
                {uploading[key] ? <Loader2 className={styles.spin} size={24} /> : urls[key] ? (
                  <div className={styles.preview}>
                    <Image src={urls[key]} alt="Preview" fill style={{ objectFit: "cover" }} />
                    <div className={styles.check}><CheckCircle2 size={16} /> مرفوعة</div>
                  </div>
                ) : <div className={styles.placeholder}><Upload size={20} /><span>اختر ملف صورة</span></div>}
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, key)} className={styles.fileInput} />
              </div>
            </div>
          ))}
        </div>
        <button type="submit" disabled={submitting} className={styles.btn}>{submitting ? <Loader2 className={styles.spin} size={18} /> : "تأكيد وحفظ البيانات"}</button>
      </form>
    </div>
  );
}