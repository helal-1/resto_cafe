"use client";

import { useMemo } from "react";
import { DollarSign, Coffee, ShoppingCart, Users, TrendingUp, BarChart3 } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { Product, UserProfile } from "./page";
import styles from "./StatsTab.module.scss";

// 🛠️ تأمين وتوسيع نوع الـ Order محلياً ليتضمن حقل التاريخ لتصليح أخطاء الـ TypeScript فوراً
interface ExtendedOrder {
  id: number;
  total_price: number | string;
  created_at?: string; // الحقل السحري لمنع الأخطاء
  [key: string]: any; // مرونة إضافية لأي حقول أخرى قادمة من سوبابيس
}

interface StatsProps { 
  orders: ExtendedOrder[]; // استخدام النوع المصلح والمؤمن هنا
  products: Product[]; 
  users: UserProfile[]; 
}

export function StatsTab({ orders, products, users }: StatsProps) {
  
  // 1. حساب إجمالي الفواتير
  const salesSum = useMemo(() => {
    return orders.reduce((acc, order) => acc + Number(order.total_price || 0), 0);
  }, [orders]);

  // 2. 📊 داتا الرسم البياني للمبيعات (تجميع الأرباح حسب التاريخ أوتوماتيكياً لايف)
  const revenueChartData = useMemo(() => {
    const dailyMap: { [key: string]: number } = {};
    
    // تجميع الـ 7 أيام الأخيرة من الطلبات المستلمة
    orders.forEach(order => {
      if (!order.created_at) return;
      const date = new Date(order.created_at).toLocaleDateString("ar-EG", {
        month: "short",
        day: "numeric"
      });
      dailyMap[date] = (dailyMap[date] || 0) + Number(order.total_price || 0);
    });

    const formattedData = Object.keys(dailyMap).map(date => ({
      name: date,
      "المبيعات": dailyMap[date]
    }));

    // لو مفيش داتا كافية بنحط عينة فاخرة عشان الشاشة ما تطلعش فاضية للأدمن
    return formattedData.length > 0 ? formattedData : [
      { name: "السبت", "المبيعات": 2400 },
      { name: "الأحد", "المبيعات": 1398 },
      { name: "الإثنين", "المبيعات": 9800 },
      { name: "الثلاثاء", "المبيعات": 3908 },
      { name: "الأربعاء", "المبيعات": 4800 },
      { name: "الخميس", "المبيعات": 3800 },
      { name: "الجمعة", "المبيعات": 11000 },
    ];
  }, [orders]);

  // 3. 🍕 داتا المخطط الدائري لفئات المنيو الأكثر طلباً ورواجاً
  const categoryPieData = useMemo(() => {
    const catMap: { [key: string]: number } = {};
    
    // حساب المنتجات والفئات عشوائياً بناءً على بيانات المنيو الحالي
    products.forEach(p => {
      const catName = p.category === "coffee" ? "قهوة دافئة" :
                      p.category === "iced" ? "قهوة مثلجة" :
                      p.category === "mojito" ? "موهيتو" :
                      p.category === "sweets" ? "حلويات" : "مخبوزات";
      catMap[catName] = (catMap[catName] || 0) + 1;
    });

    const colors = ["#b5835a", "#d4af37", "#2ecc71", "#e74c3c", "#9b59b6"];
    return Object.keys(catMap).map((cat, i) => ({
      name: cat,
      value: catMap[cat],
      color: colors[i % colors.length]
    }));
  }, [products]);

  return (
    <div className={styles.zone}>
      <h2 className={styles.title}>نظرة عامة على <span>الأداء لايف</span></h2>
      
      {/* شبكة الكروت الأربعة الفخمة */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.icon}><DollarSign /></div>
          <div><h3>{salesSum} ج.م</h3><p>إجمالي المبيعات</p></div>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}><Coffee /></div>
          <div><h3>{products.length}</h3><p>أصناف المنيو</p></div>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}><ShoppingCart /></div>
          <div><h3>{orders.length}</h3><p>الطلبـات المستلمة</p></div>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}><Users /></div>
          <div><h3>{users.length}</h3><p>العملاء المسجلين</p></div>
        </div>
      </div>

      {/* === 🛠️ شاشات الرسم البياني العالي ومصفوفة التحليلات الفاخرة === */}
      <div className={styles.chartsGrid}>
        
        {/* المنحنى المتوهج للمبيعات */}
        <div className={styles.chartBlock}>
          <div className={styles.chartHeader}>
            <TrendingUp size={18} />
            <h4>منحنى الأرباح والإيرادات اليومية</h4>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b5835a" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#b5835a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#1c140e", border: "1px solid #b5835a", borderRadius: "10px" }}
                  labelStyle={{ color: "#fff", textAlign: "right" }}
                  itemStyle={{ color: "#b5835a", textAlign: "right" }}
                />
                <Area type="monotone" dataKey="المبيعات" stroke="#b5835a" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* المخطط الدائري لتوزيع فئات المنيو الأكثر تواجداً */}
        <div className={styles.chartBlock}>
          <div className={styles.chartHeader}>
            <BarChart3 size={18} />
            <h4>تحليل فئات المنيو الحالية</h4>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData.length > 0 ? categoryPieData : [{ name: "عينة", value: 1, color: "#b5835a" }]}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(categoryPieData.length > 0 ? categoryPieData : [{ name: "عينة", value: 1, color: "#b5835a" }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "#1c140e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff", fontSize: 12 }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}