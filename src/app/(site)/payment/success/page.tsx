import Stripe from "stripe";
import Link from "next/link";
import RecoverSessionClient from "./RecoverSessionClient";
import { getResortById } from "@/assets/resorts";

export const dynamic = "force-dynamic";



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion intentionally omitted to match the installed Stripe SDK types
});

function formatCurrency(amount: number, currency?: string) {
  if (!currency) return String(amount);
  const code = currency.toLowerCase();
  const divisor = code === "bhd" ? 1000 : 100;
  return (amount / divisor).toFixed(code === "bhd" ? 3 : 2);
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  console.log("Success Page: Rendering with searchParams", {
    hasSessionId: !!searchParams.session_id,
    hasSessionIdAlt: !!searchParams.sessionId,
    hasCheckoutSessionId: !!searchParams.checkout_session_id,
    allKeys: Object.keys(searchParams)
  });

  const sessionIdRaw =
    searchParams.session_id ??
    searchParams.sessionId ??
    searchParams.checkout_session_id;
  const sessionId = Array.isArray(sessionIdRaw) ? sessionIdRaw[0] : sessionIdRaw;

  if (!sessionId) {
    console.error("Success Page: No session_id found in URL");



    return (
      <main className="min-h-screen pt-28 pb-16 bg-gray-50 dark:bg-background">
        <div className="px-4 mx-auto max-w-3xl sm:px-6 xl:px-4">
          <div className="p-6 bg-white rounded-xl dark:bg-[#18181b] border border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold text-heading">تم الدفع بنجاح</h1>
            <p className="mt-2 text-text">لا يمكن العثور على رقم العملية. يرجى الرجوع والتحقق.</p>
            <RecoverSessionClient />
            <Link
              href="/resorts"
              className="inline-flex mt-6 items-center justify-center px-5 py-3 text-sm font-medium border rounded-xl border-background-hover text-heading hover:bg-background-hover transition"
            >
              رجوع لكل الشاليهات
            </Link>
          </div>
        </div>
      </main>
    );
  }

  let session: Stripe.Checkout.Session;
  let lineItems: Stripe.ApiList<Stripe.LineItem>;

  console.log("Success Page: Retrieving session from Stripe", { sessionId });

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Success Page: Session retrieved", {
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
    });

    lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 10,
    });
    console.log("Success Page: Line items retrieved", { count: lineItems.data.length });
  } catch (error: unknown) {
    console.error("Success Page: Failed to retrieve session", {
      sessionId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
    return (
      <main className="min-h-screen pt-28 pb-16 bg-gray-50 dark:bg-background">
        <div className="px-4 mx-auto max-w-3xl sm:px-6 xl:px-4">
          <div className="p-6 bg-white rounded-xl dark:bg-[#18181b] border border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold text-heading text-red-600">خطأ في استرجاع بيانات الدفع</h1>
            <p className="mt-2 text-text">فشل الاتصال بـ Stripe لاسترجاع تفاصيل العملية.</p>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-text"><strong>Session ID:</strong> {sessionId}</p>
              <p className="text-sm text-text mt-2"><strong>الخطأ:</strong> {errorMessage}</p>
            </div>
            <p className="mt-4 text-sm text-text">
              يرجى التواصل مع الدعم الفني وإرسال رقم العملية أعلاه.
            </p>
            <Link
              href="/resorts"
              className="inline-flex mt-6 items-center justify-center px-5 py-3 text-sm font-medium border rounded-xl border-background-hover text-heading hover:bg-background-hover transition"
            >
              رجوع لكل الشاليهات
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const md = session.metadata ?? {};
  const resortName = md.resortName || "";
  const checkIn = md.checkIn || "";
  const checkOut = md.checkOut || "";
  const nights = md.nights || "";
  const fullName = md.fullName || "";
  const phone = md.phone || "";
  const guests = md.guests || "";

  const currency = session.currency || "";

  const subtotalItem = lineItems.data[0]?.amount_total ?? null;
  const depositItem = lineItems.data[1]?.amount_total ?? null;
  const totalAmount = session.amount_total ?? null;

  const isPaid = session.payment_status === "paid";

  const resortId = md.resortId;
  const resort = resortId ? getResortById(resortId) : null;
  const mapSrc = resort?.location
    ? `https://www.google.com/maps?q=${resort.location.lat},${resort.location.lng}&hl=ar&z=15&output=embed`
    : null;
  const mapLink = resort?.location
    ? `https://maps.google.com/?q=${resort.location.lat},${resort.location.lng}`
    : "https://maps.google.com";

  return (
    <main className="min-h-screen pt-28 pb-16 bg-gray-50 dark:bg-background">
      <div className="px-4 mx-auto max-w-4xl sm:px-6 xl:px-4">
        <div className="p-6 bg-white rounded-xl dark:bg-[#18181b] border border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-heading">{isPaid ? "تم الدفع بنجاح" : "تم إنشاء العملية"}</h1>
          <p className="mt-2 text-text">
            {isPaid ? "تم تأكيد عملية الدفع بنجاح." : "العملية قيد المعالجة. يرجى تحديث الصفحة بعد قليل."}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-heading">تفاصيل الحجز</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text">الشاليه:</span>
                  <span className="font-medium text-heading">{resortName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text">تاريخ الدخول:</span>
                  <span className="font-medium text-heading">{checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text">تاريخ الخروج:</span>
                  <span className="font-medium text-heading">{checkOut}</span>
                </div>
                {nights ? (
                  <div className="flex justify-between">
                    <span className="text-text">عدد الليالي:</span>
                    <span className="font-medium text-heading">{nights}</span>
                  </div>
                ) : null}
                {guests ? (
                  <div className="flex justify-between">
                    <span className="text-text">عدد الضيوف:</span>
                    <span className="font-medium text-heading">{guests}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-heading">تفاصيل الدفع</h2>
              <div className="mt-3 space-y-2 text-sm">
                {subtotalItem != null ? (
                  <div className="flex justify-between">
                    <span className="text-text">قيمة الحجز:</span>
                    <span className="font-medium text-heading">
                      {formatCurrency(subtotalItem, currency)} {currency.toUpperCase()}
                    </span>
                  </div>
                ) : null}
                {depositItem != null ? (
                  <div className="flex justify-between">
                    <span className="text-text">مبلغ التأمين:</span>
                    <span className="font-medium text-heading">
                      {formatCurrency(depositItem, currency)} {currency.toUpperCase()}
                    </span>
                  </div>
                ) : null}
                {totalAmount != null ? (
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                    <span className="text-heading font-bold">الإجمالي:</span>
                    <span className="text-primary font-bold">
                      {formatCurrency(totalAmount, currency)} {currency.toUpperCase()}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-2">
                  <span className="text-text">حالة الدفع:</span>
                  <span className="font-medium text-heading">{session.payment_status}</span>
                </div>
              </div>
            </div>
          </div>

          {mapSrc ? (
            <div className="mt-6 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181b]">
              <h2 className="font-semibold text-heading mb-3">موقع الشاليه</h2>
              <div className="w-full h-[320px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <iframe
                  title="Resort location"
                  src={mapSrc}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={mapLink}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-black hover:bg-background-hover transition"
              >
                افتح الموقع في Google Maps
              </a>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <a
              href={`/api/invoice?session_id=${encodeURIComponent(sessionId)}`}
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-white rounded-xl bg-primary hover:bg-primary/90 transition"
            >
              تحميل الفاتورة PDF
            </a>
            <a
              href={`/api/invoice?session_id=${encodeURIComponent(sessionId)}&disposition=inline`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium border rounded-xl border-background-hover text-heading hover:bg-background-hover transition"
            >
              عرض الفاتورة
            </a>
            <Link
              href="/resorts"
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium border rounded-xl border-background-hover text-heading hover:bg-background-hover transition"
            >
              رجوع لكل الشاليهات
            </Link>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-background-hover">
            <div className="text-sm text-text">
              {fullName ? <div>الاسم: <span className="text-heading font-medium">{fullName}</span></div> : null}
              {phone ? <div>الهاتف: <span className="text-heading font-medium">{phone}</span></div> : null}
              {session.customer_details?.email ? (
                <div>البريد: <span className="text-heading font-medium">{session.customer_details.email}</span></div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181b]">
            <h2 className="font-semibold text-heading">الفاتورة</h2>
            <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-background">
              <iframe
                title="Invoice"
                src={`/api/invoice?session_id=${encodeURIComponent(sessionId)}&disposition=inline`}
                className="w-full h-[720px]"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
