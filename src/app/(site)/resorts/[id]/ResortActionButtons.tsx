"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

type Props = {
  id: string;
  resortName: string;
  paymentLink?: string | null;
};

function requestBookingValidation(): Promise<boolean> {
  return new Promise((resolve) => {
    const requestId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const onValidated = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as
        | { requestId?: string; ok?: boolean }
        | undefined;

      if (!detail || detail.requestId !== requestId) return;

      window.removeEventListener("booking:validated", onValidated);
      resolve(Boolean(detail.ok));
    };

    window.addEventListener("booking:validated", onValidated);

    window.dispatchEvent(
      new CustomEvent("booking:validate", {
        detail: { requestId },
      })
    );

    window.setTimeout(() => {
      window.removeEventListener("booking:validated", onValidated);
      resolve(false);
    }, 800);
  });
}

export default function ResortActionButtons({
  id,
  resortName,
  paymentLink,
}: Props) {
  const router = useRouter();

  const payHref = `/payment?resortId=${id}&resortName=${encodeURIComponent(
    resortName
  )}`;

  const handleInternal = async (
    e: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const ok = await requestBookingValidation();
    if (!ok) return;

    try {
      const keys = Object.keys(sessionStorage);
      const draftKey = keys.find((k) => k.startsWith("bookingDraft:"));
      if (draftKey) {
        const raw = sessionStorage.getItem(draftKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            const params = new URLSearchParams(new URL(href, window.location.origin).search);

            if (parsed.checkIn) params.set("checkIn", String(parsed.checkIn));
            if (parsed.checkOut) params.set("checkOut", String(parsed.checkOut));
            if (parsed.guests != null) params.set("guests", String(parsed.guests));
            if (parsed.fullName) params.set("fullName", String(parsed.fullName));
            if (parsed.email) params.set("email", String(parsed.email));
            if (parsed.phone) params.set("phone", String(parsed.phone));

            const baseHref = href.split("?")[0];
            href = `${baseHref}?${params.toString()}`;
          }
        }
      }
    } catch {
      // ignore
    }

    router.push(href);
  };

  const handleExternal = async (
    e: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const ok = await requestBookingValidation();
    if (!ok) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col gap-3 mt-5">
      <Link
        href={payHref}
        onClick={(e) => handleInternal(e, payHref)}
        className="inline-flex items-center border-2 border-white/60 justify-center px-5 py-3 text-sm font-medium text-white rounded-xl bg-green-600 hover:bg-green-700 transition"
      >
        احجز الآن

        <img
          src="/payment/payment-01.svg"
          alt="Stripe Link"
          className="w-8 h-8 mr-5 mb-1"
        />
        <img
          src="/payment/payment-03.svg"
          alt="Stripe Link"
          className="w-8 h-8 mr-5 mb-1"
        />
        <img
          src="/payment/payment-02.svg"
          alt="Stripe Link"
          className="w-8 h-8 mr-5 mb-1"
        />
        <img
          src="/payment/payment-04.svg"
          alt="Stripe Link"
          className="w-16 h-8 mr-5 mb-1 filter backdrop-brightness-2000  border-2 border-white/20 rounded-md"
        />
        <img
          src="/payment/payment-05.svg"
          alt="Stripe Link"
          className="w-19 h-10 mr-5 mb-1 filter backdrop-brightness-0  border-2 border-white/20 rounded-md"
        />
      </Link>

      <a
        href={paymentLink || "#"}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => handleExternal(e, paymentLink || "#")}
        className="inline-flex items-center justify-center gap-2 px-5 py-4 text-sm font-medium text-white rounded-xl bg-black hover:bg-gray-800 transition"
      >
        <span>ادفع الآن عبر Link</span>
        <img
          src="/payment/link-logo.png"
          alt="Stripe Link"
          className="w-8 h-8 mr-12 mb-1"
        />
      </a>

      <a
        href="https://wa.me/97336118277?text=مرحباً، أحتاج مساعدة في الحجز والدفع"
        target="_blank"
        rel="noreferrer"
        onClick={(e) =>
          handleExternal(
            e,
            "https://wa.me/97336118277?text=مرحباً، أحتاج مساعدة في الحجز والدفع"
          )
        }
        className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white rounded-xl bg-black hover:bg-gray-800 transition"
      >
        <div className="text-right">
          <div className="font-semibold">مساعدة وحلول مصرفية</div>
          <div className="text-xs">متاح 24/7</div>
        </div>
        <img
          src="/payment/whatsapp-logo.svg"
          alt="WhatsApp"
          className="w-8 h-8 mr-10 mb-1"
        />
      </a>

      <Link
        href="/resorts"
        className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium border rounded-xl border-background-hover text-heading hover:bg-background-hover transition"
      >
        رجوع لكل الشاليهات
      </Link>
    </div>
  );
}
