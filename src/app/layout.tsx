import "./css/style.css";
import { Metadata } from "next";
import { getSeoSettings, getSiteName } from "@/get-api-data/seo-setting";
import { GoogleTagManager } from "@next/third-parties/google";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings();
  const site_name = await getSiteName();
  return {
    title: `${seoSettings?.siteTitle || "شاليهات أمواج"} | ${site_name}`,
    description:
      seoSettings?.metadescription ||
      "موقع لتأجير الشاليهات في أمواج – تفاصيل الشاليه، الصور، السياسات، والحجز والدفع بسهولة.",
    keywords:
      seoSettings?.metaKeywords ||
      "شاليهات, أمواج, تأجير شاليه, البحرين, حجز شاليه",
    openGraph: {
      images: seoSettings?.metaImage ? [seoSettings.metaImage] : [],
    },
    icons: {
      icon: seoSettings?.favicon || "/favicon.ico",
      shortcut: seoSettings?.favicon || "/favicon.ico",
      apple: seoSettings?.favicon || "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const seoSettings = await getSeoSettings();
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:opsz,wght,GRAD@17..18,450,27&display=swap"
          rel="stylesheet"
        />
        
      </head>
      <body suppressHydrationWarning={true} className={cairo.variable}>
        {children}
        {seoSettings?.gtmId && <GoogleTagManager gtmId={seoSettings.gtmId} />}
      </body>
    </html>
  );
}
