import type { Metadata } from "next";
import { Amiri, Tajawal } from "next/font/google";
import "@/styles/global.scss"; // شيل الكومنت لما تعمل الملف عشان يطبق الـ Reset

// إعداد خط أميري للعناوين الفخمة
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif", // بنحوله لـ Variable عشان نربطه بالـ Sass بسهولة
});

// إعداد خط تجول للنصوص العادية والقوائم
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-sans", // بنحوله لـ Variable عشان نربطه بالـ Sass بسهولة
});

export const metadata: Metadata = {
  title: "Resto Cafe | تجربة قهوة لا تُنسى",
  description: "ريستو كافيه يقدم أجود أنواع القهوة المختصة، الحلويات، والمشروبات الباردة بتجربة فريدة.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${tajawal.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}