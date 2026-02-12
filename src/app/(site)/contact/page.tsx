import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="pt-28">
      <section className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
        <h1 className="text-2xl font-semibold text-dark">تواصل معنا</h1>
        <p className="mt-2 text-gray-600">
          إذا تبي حجز، أو عندك استفسار قبل الدفع، تواصل وخلّنا نخدمك 🤝
        </p>

        <div className="grid gap-6 mt-6 lg:grid-cols-2">
          <div className="p-6 bg-background border rounded-2xl border-gray-3">
            <h2 className="text-lg font-semibold text-success">معلومات التواصل</h2>

            <ul className="mt-4 space-y-3 text-gray-700">
              <li>
                📞 الهاتف: 
                    {/* WhatsApp Support Button */}
            <a
              href="https://wa.me/97336118277?text=مرحباً، أحتاج مساعدة في عملية الدفع"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-4 text-black/70 transition rounded-lg bg-green-light-3 hover:bg-[#20BA59]"
            >
              <img
                src="/payment/whatsapp-logo.svg"
                alt="WhatsApp"
                className="w-10 h-10 backdrop-brightness-300 rounded-sm border border-gray-300 px-1 py-1 "
              />
              <div className="text-right">
                <div className="font-semibold">للمساعدة، في الحجز وطرق الدفع</div>
                <div className="text-xs ">
                  <span>متاح 24/7 - </span>
                  <span className="ltr font-bold text-md ">36118277 (973+) </span>
                </div>
              </div>
            </a>
              </li>
              <li>
                ✉️ الإيميل: <span className="text-gray-500">(ضع إيميلك هنا)</span>
              </li>
              <li>
                📍 الموقع: أمواج – البحرين
              </li>
            </ul>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/resorts"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white rounded-xl bg-blue hover:bg-blue-600"
              >
                شوف الشاليهات
              </Link>
              <a
                href="https://maps.google.com/?q=26.290121,50.669178"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold border rounded-xl border-gray-3 text-text hover:border-dark transition-all duration-200 "
              >
                افتح الموقع في الخرائط
              </a>
            </div>
          </div>

          <div className="overflow-hidden border rounded-2xl border-gray-3 bg-gray-2">
            <iframe
              title="Amwaj"
              src="https://www.google.com/maps?q=26.290121,50.669178&hl=ar&z=14&output=embed"
              className="w-full h-[360px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
