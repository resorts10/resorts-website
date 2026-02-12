"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Resort } from "@/types/resort";
import { calculateNights, calculateTotalPrice } from "@/utils/utils";

interface BookingFormProps {
  resort: Resort;
}

export default function BookingForm({ resort }: BookingFormProps) {
  const storageKey = `bookingDraft:${resort.id}`;
  const checkInRef = useRef<HTMLInputElement | null>(null);
  const checkOutRef = useRef<HTMLInputElement | null>(null);
  const guestsRef = useRef<HTMLInputElement | null>(null);
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2,
    fullName: "",
    email: "",
    phone: "",
  });
  const formDataRef = useRef(formData);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setFormData((prev) => ({
        ...prev,
        ...(parsed && typeof parsed === "object" ? parsed : {}),
      }));
    } catch {
      // ignore
    }
  }, [storageKey]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      } as typeof prev;

      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }

      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const checkInDate = formData.checkIn ? new Date(`${formData.checkIn}T00:00:00`) : null;
  const checkOutDate = formData.checkOut ? new Date(`${formData.checkOut}T00:00:00`) : null;

  const nights =
    checkInDate && checkOutDate ? calculateNights(checkInDate, checkOutDate) : 0;

  const totalPrice =
    checkInDate && checkOutDate
      ? calculateTotalPrice(
          resort.priceRegular,
          resort.priceWeekend,
          checkInDate,
          checkOutDate
        )
      : 0;

  const depositAmount = typeof resort.deposit === "number" ? resort.deposit : 50;

  const focusField = (field: string) => {
    const el =
      field === "checkIn"
        ? checkInRef.current
        : field === "checkOut"
          ? checkOutRef.current
          : field === "guests"
            ? guestsRef.current
            : field === "fullName"
              ? fullNameRef.current
              : field === "email"
                ? emailRef.current
              : field === "phone"
                ? phoneRef.current
                : null;

    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus();
  };

  const validateForm = (opts?: { focus?: boolean }): boolean => {
    const data = formDataRef.current;
    const newErrors: Record<string, string> = {};

    if (!data.checkIn) {
      newErrors.checkIn = "يرجى اختيار تاريخ الدخول";
    }
    if (!data.checkOut) {
      newErrors.checkOut = "يرجى اختيار تاريخ الخروج";
    }
    if (data.checkIn && data.checkOut) {
      const checkInDate = new Date(data.checkIn);
      const checkOutDate = new Date(data.checkOut);
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = "تاريخ الخروج يجب أن يكون بعد تاريخ الدخول";
      }
    }
    const guestsNumber = Number(data.guests);
    if (!Number.isFinite(guestsNumber) || guestsNumber < 1) {
      newErrors.guests = "يرجى إدخال عدد الضيوف";
    }
    if (!String((data as typeof formData).fullName ?? "").trim()) {
      newErrors.fullName = "يرجى إدخال الاسم الكامل";
    } else if (String((data as typeof formData).fullName ?? "").trim().length < 2) {
      newErrors.fullName = "الاسم يجب أن يكون حرفين على الأقل";
    }
    if (!String((data as typeof formData).email ?? "").trim()) {
      newErrors.email = "يرجى إدخال البريد الإلكتروني";
    } else {
      const emailValue = String((data as typeof formData).email).trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
      if (!emailOk) newErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
    }
    if (!data.phone.trim()) {
      newErrors.phone = "يرجى إدخال رقم الهاتف";
    }

    setErrors(newErrors);

    if (opts?.focus && Object.keys(newErrors).length) {
      const order = ["checkIn", "checkOut", "guests", "fullName", "email", "phone"];
      const first = order.find((k) => Boolean(newErrors[k]));
      if (first) focusField(first);
    }

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const onValidate = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as { requestId?: string };
      const ok = validateForm({ focus: true });
      window.dispatchEvent(
        new CustomEvent("booking:validated", {
          detail: { requestId: detail?.requestId, ok },
        })
      );
    };

    window.addEventListener("booking:validate", onValidate);
    return () => window.removeEventListener("booking:validate", onValidate);
  }, []);

  const ErrorIcon = () => (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-500">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 7v6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 17h.01"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );

  return (
    <div className="p-6 bg-white rounded-xl dark:bg-[#18181b] border border-gray-200 dark:border-gray-800">
      <h2 className="mb-6 text-2xl font-bold text-heading">احجز الآن</h2>

      <div className="space-y-5">
        {/* Check-in & Check-out */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-text">
              📅 تاريخ الدخول
            </label>
            <div className="relative">
              {errors.checkIn ? <ErrorIcon /> : null}
              <input
                ref={checkInRef}
                required
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-background text-heading focus:ring-2 focus:ring-primary focus:outline-none ${
                  errors.checkIn
                    ? "border-red-500 pl-10"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              />
            </div>
            {errors.checkIn && (
              <p className="mt-1 text-xs text-red-500">{errors.checkIn}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-text">
              📅 تاريخ الخروج
            </label>
            <div className="relative">
              {errors.checkOut ? <ErrorIcon /> : null}
              <input
                ref={checkOutRef}
                required
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                min={formData.checkIn || new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-background text-heading focus:ring-2 focus:ring-primary focus:outline-none ${
                  errors.checkOut
                    ? "border-red-500 pl-10"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              />
            </div>
            {errors.checkOut && (
              <p className="mt-1 text-xs text-red-500">{errors.checkOut}</p>
            )}
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="block mb-2 text-sm font-medium text-text">
            � عدد الضيوف
          </label>
          <div className="relative">
            {errors.guests ? <ErrorIcon /> : null}
            <input
              ref={guestsRef}
              required
              type="number"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              min="1"
              max="12"
              className={`w-full px-4 py-2 border rounded-lg dark:border-gray-700 bg-white dark:bg-background text-heading focus:ring-2 focus:ring-primary focus:outline-none ${
                errors.guests ? "border-red-500 pl-10" : "border-gray-300"
              }`}
            />
          </div>
          {errors.guests && (
            <p className="mt-1 text-xs text-red-500">{errors.guests}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="block mb-2 text-sm font-medium text-text">
            👤 الاسم الكامل
          </label>
          <div className="relative">
            {errors.fullName ? <ErrorIcon /> : null}
            <input
              ref={fullNameRef}
              required
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="أدخل اسمك الكامل"
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-background text-heading focus:ring-2 focus:ring-primary focus:outline-none ${
                errors.fullName
                  ? "border-red-500 pl-10"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block mb-2 text-sm font-medium text-text">
            ✉️ البريد الإلكتروني
          </label>
          <div className="relative">
            {errors.email ? <ErrorIcon /> : null}
            <input
              ref={emailRef}
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-background text-heading focus:ring-2 focus:ring-primary focus:outline-none ${
                errors.email
                  ? "border-red-500 pl-10"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block mb-2 text-sm font-medium text-text">
            📞 رقم التواصل
          </label>
          <div className="relative">
            {errors.phone ? <ErrorIcon /> : null}
            <input
              ref={phoneRef}
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+973 XXXX XXXX"
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-background text-heading focus:ring-2 focus:ring-primary focus:outline-none ${
                errors.phone
                  ? "border-red-500 pl-10"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Price Summary */}
        {totalPrice > 0 && (
          <div className="p-4 rounded-lg bg-primary/10">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-text">عدد الليالي:</span>
              <span className="font-semibold text-heading">{nights} ليلة</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-text">سعر الإقامة:</span>
              <span className="font-semibold text-heading">
                {totalPrice} {resort.currency}
              </span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-text">مبلغ التأمين:</span>
              <span className="font-semibold text-heading">{depositAmount} {resort.currency}</span>
            </div>
            <div className="pt-2 border-t border-primary/20">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-heading">المجموع:</span>
                <span className="text-primary">
                  {totalPrice + depositAmount} {resort.currency}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-text">
              * مبلغ التأمين سيتم إرجاعه عند المغادرة
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => validateForm()}
          className="hidden"
        />
      </div>
    </div>
  );
}
