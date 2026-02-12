/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
const { SITE_NAME, COMPANY_NAME } = process.env;

const footerMenu = [
  {
    title: "روابط",
    items: [
      { label: "الشاليهات", href: "/resorts" },
      { label: "السياسات", href: "/policy" },
      { label: "تواصل", href: "/contact" },
    ],
  },
  {
    title: "معلومات",
    items: [
      { label: "الحجز والدفع", href: "/resorts" },
      { label: "الأسئلة الشائعة", href: "/policy" },
    ],
  },
];

const payments = [
  { src: "/payment/payment-01.svg", alt: "Visa" },
  { src: "/payment/payment-02.svg", alt: "PayPal" },
  { src: "/payment/payment-03.svg", alt: "Mastercard" },
  { src: "/payment/payment-04.svg", alt: "Apple Pay" },
  { src: "/payment/payment-05.svg", alt: "Google Pay" },
  { src: "/payment/payment-06.svg", alt: "Link" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightDate =
    2026 + (currentYear > 2026 ? `-${currentYear}` : "");
  const copyrightName = COMPANY_NAME || SITE_NAME || "";

  return (
    <footer className="text-sm text-text bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 border-t border-background-hover px-6 py-12 text-sm md:flex-row md:gap-12 md:px-4 min-[1320px]:px-0">
        <div>
          <Link
            className="flex items-center gap-2 text-heading"
            href="/"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              {String(SITE_NAME || "A").slice(0, 1).toUpperCase()}
            </div>
            <span className="font-300 uppercase">{SITE_NAME || "Amwaj"}</span>
          </Link>
          <p className="mt-4 max-w-xs leading-relaxed text-text">
            موقع تأجير شاليهات أمواج – صور واضحة، تفاصيل دقيقة، وحجز سريع.
          </p>
        </div>

        <div className="flex flex-1 flex-wrap gap-10">
          {footerMenu.map((col) => (
            <div key={col.title} className="min-w-[180px]">
              <p className="mb-4 font-semibold text-heading">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2">
                {col.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="text-text transition hover:text-primary"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-background-hover py-6 text-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 md:flex-row md:gap-0 md:px-4 min-[1320px]:px-0">
          <p className="text-text">
            &copy; {copyrightDate} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith(".") ? "." : ""} All rights reserved.
          </p>
          <div className="flex items-center justify-center bg-background-hover backdrop-blur-sm backdrop-brightness-950 rounded-lg py-2 px-4 gap-4 md:ml-auto md:mr-6">
            <span className="text-text/50">We Accept</span>
            <div className="flex items-center gap-3">
              {payments.map((p) => (
                <img key={p.src} src={p.src} alt={p.alt} className="h-6 w-auto" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
