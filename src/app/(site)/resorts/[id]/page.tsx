import Image from "next/image";
import { notFound } from "next/navigation";

import { getResortById } from "@/assets/resorts";
import BookingForm from "@/components/booking/BookingForm";
import { ResortDetailClient } from "./ResortDetailClient";
import ResortActionButtons from "./ResortActionButtons";

type Props = {
  params: Promise<{ id: string }>;
};

function isVideo(path: string) {
  return path.toLowerCase().endsWith(".mp4") || path.toLowerCase().endsWith(".webm");
}

export default async function ResortDetailPage({ params }: Props) {
  const { id } = await params;
  const resort = getResortById(id);

  if (!resort) {
    return notFound();
  }

  const hero =
    resort.images.find((p) => p.includes("hero")) ?? resort.images[0];

  if (!hero) return notFound();

  const galleryImages = resort.images.filter((p) => !isVideo(p));


  return (
    <main className="pt-28">
      <section className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative w-full overflow-hidden bg-background rounded-2xl h-[360px] lg:h-[460px]">
            <Image
              src={hero}
              alt={resort.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-semibold text-heading">
                  {resort.name}
                </h1>
                <p className="mt-2 text-text">{resort.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                {String(resort.type).toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mt-5 text-sm text-text">
              <span className="rounded-lg bg-background-hover px-3 py-2">
                🛏️ {resort.bedrooms} غرف
              </span>
              <span className="rounded-lg bg-background-hover px-3 py-2">
                🚿 {resort.bathrooms} حمّامات
              </span>
              {resort.hasPrivatePool && (
                <span className="rounded-lg bg-background-hover px-3 py-2">
                  🏊‍♂️ مسبح خاص
                </span>
              )}
              {resort.hasPrivateBeach && (
                <span className="rounded-lg bg-background-hover px-3 py-2">
                  🏖️ شاطئ خاص
                </span>
              )}
            </div>

            <div className="grid gap-4 mt-6 sm:grid-cols-2">
              <div className="p-4 border rounded-xl border-background-hover bg-background-hover">
                <p className="text-sm text-text">السعر (الأيام العادية)</p>
                <p className="mt-1 text-2xl font-semibold text-heading">
                  {resort.priceRegular} {resort.currency}
                </p>
              </div>
              <div className="p-4 border rounded-xl border-background-hover bg-background-hover">
                <p className="text-sm text-text">سعر الويكند</p>
                <p className="mt-1 text-2xl font-semibold text-heading">
                  {resort.priceWeekend} {resort.currency}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <BookingForm resort={resort} />
            </div>

            {/* Payment info text */}
            <div className="p-4 mt-5 rounded-xl bg-background-hover border border-background-hover">
              <p className="text-sm text-text mb-2">
                احجز الآن ببطاقة البنك أو Apple Pay أو Google Pay
              </p>
              <p className="text-sm text-text">
                وسائل الدفع محمية وآمنة وتستخدم SSL وضد انتي فاي ومدعومة من أمنيتي فاي & stripe provider
              </p>
            </div>

            {/* Action Buttons */}
            <ResortActionButtons
              id={id}
              resortName={resort.name}
              paymentLink={resort.paymentLink}
            />

            <div className="flex flex-wrap gap-4 mt-6 text-sm text-text">
              {resort.checkIn && (
                <p>
                  <span className="font-semibold">الدخول:</span> {resort.checkIn}
                </p>
              )}
              {resort.checkOut && (
                <p>
                  <span className="font-semibold">الخروج:</span> {resort.checkOut}
                </p>
              )}
              {typeof resort.deposit === "number" && (
                <p>
                  <span className="font-semibold">التأمين:</span> {resort.deposit} {resort.currency}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid gap-8 mt-12 lg:grid-cols-2">
          <div className="p-6 border rounded-2xl border-background-hover bg-background-hover">
            <h2 className="text-xl font-semibold text-heading">🛏️ المساحة والتوزيع</h2>
            <ul className="mt-4 space-y-2 text-text list-disc list-inside">
              {resort.features.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="p-6 border rounded-2xl border-background-hover bg-background-hover">
            <h2 className="text-xl font-semibold text-heading">🏊‍♂️ المرافق والخدمات</h2>
            <ul className="mt-4 space-y-2 text-text list-disc list-inside">
              {resort.amenities.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Policy */}
        {resort.policy?.length ? (
          <div className="p-6 mt-8 border rounded-2xl border-background-hover bg-background-hover">
            <h2 className="text-xl font-semibold text-heading">📌 التعليمات والقوانين</h2>
            <ol className="mt-4 space-y-2 text-text list-decimal list-inside">
              {resort.policy.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </div>
        ) : null}



        {/* Client Components for Gallery and Sticky Scroll */}
        <ResortDetailClient
          resort={resort}
          galleryImages={galleryImages}
          resortId={id}
          video={resort.video}
        />
      </section>
    </main>
  );
}
