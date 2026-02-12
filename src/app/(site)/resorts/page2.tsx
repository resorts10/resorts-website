

"use client";
import Link from "next/link";
import Image from "next/image";

import { resorts } from "@/assets/resorts";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

function useScrollSnapCarousel(count: number) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const snapLeftsRef = useRef<number[]>([]);
  const scrollPaddingLeftRef = useRef(0);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });
  const isDraggingRef = useRef(false);

  const readScrollPaddingLeft = (el: HTMLDivElement) => {
    const sp = window.getComputedStyle(el).scrollPaddingLeft;
    const px = Number.parseFloat(sp || "0");
    return Number.isFinite(px) ? px : 0;
  };

  const computeSnapLefts = () => {
    const track = trackRef.current;
    if (!track) return;

    scrollPaddingLeftRef.current = readScrollPaddingLeft(track);

    const trackRect = track.getBoundingClientRect();
    const lefts: number[] = [];

    for (let i = 0; i < count; i++) {
      const node = itemRefs.current[i];
      if (!node) {
        lefts.push(0);
        continue;
      }
      const r = node.getBoundingClientRect();
      const left = r.left - trackRect.left + track.scrollLeft;
      lefts.push(left);
    }

    snapLeftsRef.current = lefts;
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    computeSnapLefts();
    requestAnimationFrame(() => computeSnapLefts());

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const track = trackRef.current;
        if (!track) return;
        if (count <= 0) return;

        const lefts = snapLeftsRef.current;
        if (!lefts.length) return;

        const spLeft = scrollPaddingLeftRef.current;
        const pos = track.scrollLeft + spLeft;

        let bestIdx = 0;
        let bestDist = Number.POSITIVE_INFINITY;
        for (let i = 0; i < count; i++) {
          const d = Math.abs(lefts[i] - pos);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        }

        setActiveIndex(bestIdx);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", computeSnapLefts);
    onScroll();
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", computeSnapLefts);
      cancelAnimationFrame(raf);
    };
  }, [count]);

  const setItemRef = (index: number) => (el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
    if (el) {
      requestAnimationFrame(() => computeSnapLefts());
    }
  };

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    if (index < 0 || index >= count) return;

    computeSnapLefts();

    const lefts = snapLeftsRef.current;
    const spLeft = scrollPaddingLeftRef.current;
    const target = (lefts[index] ?? 0) - spLeft;

    setActiveIndex(index);
    track.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    if (el.scrollWidth <= el.clientWidth) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    computeSnapLefts();

    dragState.current.isDown = true;
    dragState.current.startX = e.clientX;
    dragState.current.scrollLeft = el.scrollLeft;
    dragState.current.moved = false;
    isDraggingRef.current = false;

    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    if (!dragState.current.isDown) return;

    const dx = e.clientX - dragState.current.startX;
    if (!dragState.current.moved && Math.abs(dx) > 6) {
      dragState.current.moved = true;
      isDraggingRef.current = true;
    }

    if (dragState.current.moved) {
      el.scrollLeft = dragState.current.scrollLeft - dx;
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current.isDown = false;
    try {
      trackRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    window.setTimeout(() => {
      isDraggingRef.current = false;
    }, 0);
  };

  const isDragging = () => isDraggingRef.current;

  const guardedClick = (cb: () => void) => {
    if (isDraggingRef.current) return;
    cb();
  };

  const prev = () => scrollToIndex(Math.max(0, activeIndex - 1));
  const next = () => scrollToIndex(Math.min(count - 1, activeIndex + 1));

  return {
    trackRef,
    setItemRef,
    activeIndex,
    total: count,
    scrollToIndex,
    prev,
    next,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    isDragging,
    guardedClick,
  };
}

export default function ResortsPage() {
  const router = useRouter();

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);

  const lightCarousel = useScrollSnapCarousel(resorts.length);
  const darkCarousel = useScrollSnapCarousel(resorts.length);

  const buildResortHref = (id: string) => {
    const sp = new URLSearchParams();
    if (checkIn) sp.set("checkIn", checkIn);
    if (checkOut) sp.set("checkOut", checkOut);
    sp.set("guests", String(guests || 1));
    const qs = sp.toString();
    return qs ? `/resorts/${id}?${qs}` : `/resorts/${id}`;
  };

  const onOpenResort = (id: string) => {
    router.push(buildResortHref(id));
  };

  return (
    <main className="pt-28">
      <section className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-4">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-2xl font-semibold text-heading">
            شاليهات أمواج
          </h1>
          <p className="text-text">
            اختَر الشاليه المناسب، شوف الصور والتفاصيل، وخلّ الحجز على طول 😉
          </p>
        </div>

        {/* Booking bar */}
        <div className="mb-28 rounded-2xl border border-background-hover bg-background-hover p-4">
          <div className="grid gap-4 md:grid-cols-5 ">
            <div>
              <label className="block mb-2 text-sm font-medium text-text">
                تاريخ الدخول
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => {
                  const v = e.target.value;
                  setCheckIn(v);
                  if (checkOut && v && checkOut <= v) {
                    setCheckOut("");
                  }
                }}
                min={todayStr}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 bg-white dark:bg-background text-heading focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-text">
                تاريخ الخروج
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || todayStr}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 bg-white dark:bg-background text-heading focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-text">
                عدد الضيوف
              </label>
              <input
                type="number"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value || 1))}
                min={1}
                max={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 bg-white dark:bg-background text-heading focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  if (!checkIn) return;
                  const first = resorts[0]?.id;
                  if (first) onOpenResort(first);
                }}
                disabled={!checkIn}
                className="w-full px-5 py-3 text-sm font-medium text-white rounded-xl bg-black hover:bg-black/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                اختر الشاليه وأكمل الحجز
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-text">
            ملاحظة: اختر التواريخ هنا، ثم افتح أي شاليه وسيتم تمرير التواريخ تلقائياً.
          </p>
        </div>

        {/* Light mode cards */}
        <div className="mb-12 dark:hidden">
          <div
            ref={lightCarousel.trackRef}
            onPointerDown={lightCarousel.onPointerDown}
            onPointerMove={lightCarousel.onPointerMove}
            onPointerUp={lightCarousel.onPointerUp}
            onPointerCancel={lightCarousel.onPointerUp}
            onPointerLeave={lightCarousel.onPointerUp}
            className="grid gap-6 overflow-x-hidden md:grid-flow-col md:auto-cols-max md:items-start md:overflow-x-auto md:pb-4 md:snap-x md:snap-mandatory md:scroll-px-4 md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden md:cursor-grab md:active:cursor-grabbing md:[touch-action:pan-y] md:overscroll-x-contain"
          >
            {resorts.map((resort, idx) => {
              const cover =
                resort.images.find((p) => p.includes("hero")) ?? resort.images[0];

              if (!cover) return null;

              return (
                <div
                  ref={lightCarousel.setItemRef(idx)}
                  key={`light-${resort.id}`}
                  className="w-full md:snap-start md:w-[420px] lg:w-[520px] overflow-hidden bg-white border rounded-xl border-gray-200"
                >
                  <div className="relative w-full h-56 bg-gray-50 ">
                    <button
                      type="button"
                      className="relative w-full h-full"
                      onClick={() =>
                        lightCarousel.guardedClick(() => onOpenResort(resort.id))
                      }
                    >
                      <Image
                        src={cover}
                        alt={resort.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw "
                        className="object-cover "
                        priority
                      />
                    </button>
                  </div>

                  <div className="p-5 cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-heading">
                          {resort.name}
                        </h2>
                        <p className="mt-1 text-sm text-text">
                          {resort.description}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                        {resort.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4 text-sm text-text">
                      <span>
                        🛏️ {resort.bedrooms} غرف
                      </span>
                      <span>
                        🚿 {resort.bathrooms} حمّامات
                      </span>
                      {resort.hasPrivatePool && <span>🏊‍♂️ مسبح خاص</span>}
                      {resort.hasPrivateBeach && <span>🏖️ شاطئ خاص</span>}
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-5">
                      <div>
                        <p className="text-xs text-text">السعر (عادي)</p>
                        <p className="text-base font-semibold text-heading">
                          {resort.priceRegular} {resort.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text">الويكند</p>
                        <p className="text-base font-semibold text-heading">
                          {resort.priceWeekend} {resort.currency}
                        </p>
                      </div>

                      <Link
                        href={buildResortHref(resort.id)}
                        onClick={(e) => {
                          if (lightCarousel.isDragging()) {
                            e.preventDefault();
                          }
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-black hover:bg-background transition"
                      >
                        التفاصيل
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:flex xl:hidden items-center gap-3 mt-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {resorts.map((resort, idx) => {
              const thumb =
                resort.images.find((p) => p.includes("hero")) ?? resort.images[0];
              if (!thumb) return null;

              const active = lightCarousel.activeIndex === idx;
              return (
                <button
                  key={`light-thumb-${resort.id}`}
                  type="button"
                  onClick={() => lightCarousel.scrollToIndex(idx)}
                  className={
                    "shrink-0 rounded-xl border transition " +
                    (active
                      ? "border-primary"
                      : "border-gray-200 hover:border-gray-300")
                  }
                >
                  <div className="relative w-20 h-12 overflow-hidden rounded-xl bg-gray-50">
                    <Image
                      src={thumb}
                      alt={resort.name}
                      fill
                      sizes="80px"
                      className={"object-cover transition " + (active ? "opacity-100" : "opacity-70")}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="hidden xl:flex items-center justify-center mt-4">
            <div className="inline-flex items-center gap-3 rounded-full bg-background-hover border border-background-hover px-3 py-2">
              <button
                type="button"
                onClick={lightCarousel.prev}
                disabled={lightCarousel.activeIndex <= 0}
                className="px-4 py-2 text-sm font-medium rounded-full bg-black text-white disabled:opacity-50"
              >
                Previous
              </button>
              <div className="min-w-16 text-center text-sm font-semibold text-heading">
                {lightCarousel.total ? lightCarousel.activeIndex + 1 : 0}/{lightCarousel.total}
              </div>
              <button
                type="button"
                onClick={lightCarousel.next}
                disabled={lightCarousel.activeIndex >= lightCarousel.total - 1}
                className="px-4 py-2 text-sm font-medium rounded-full bg-black text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Dark mode cards with gradient */}
        <div className="relative hidden dark:block mb-12">
          <div
            ref={darkCarousel.trackRef}
            onPointerDown={darkCarousel.onPointerDown}
            onPointerMove={darkCarousel.onPointerMove}
            onPointerUp={darkCarousel.onPointerUp}
            onPointerCancel={darkCarousel.onPointerUp}
            onPointerLeave={darkCarousel.onPointerUp}
            className="grid gap-6 overflow-x-hidden md:grid-flow-col md:auto-cols-max md:items-start md:overflow-x-auto md:pb-4 md:snap-x md:snap-mandatory md:scroll-px-4 md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden md:cursor-grab md:active:cursor-grabbing md:[touch-action:pan-y] md:overscroll-x-contain"
          >
            {resorts.map((resort, idx) => {
              const cover =
                resort.images.find((p) => p.includes("hero")) ?? resort.images[0];

              if (!cover) return null;

              return (
                <BackgroundGradient
                  key={resort.id}
                  containerClassName="w-full md:snap-start md:w-[420px] lg:w-[520px]"
                  className="overflow-hidden bg-[#18181b] rounded-xl"
                >
                  <div ref={darkCarousel.setItemRef(idx)} className="h-full">
                  <div className="relative w-full h-56 bg-[#18181b]">
                    <button
                      type="button"
                      className="relative w-full h-full"
                      onClick={() =>
                        darkCarousel.guardedClick(() => onOpenResort(resort.id))
                      }
                    >
                      <Image
                        src={cover}
                        alt={resort.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                        priority
                      />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-heading">
                          {resort.name}
                        </h2>
                        <p className="mt-1 text-sm text-text">
                          {resort.description}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                        {resort.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4 text-sm text-text">
                      <span>
                        🛏️ {resort.bedrooms} غرف
                      </span>
                      <span>
                        🚿 {resort.bathrooms} حمّامات
                      </span>
                      {resort.hasPrivatePool && <span>🏊‍♂️ مسبح خاص</span>}
                      {resort.hasPrivateBeach && <span>🏖️ شاطئ خاص</span>}
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-5">
                      <div>
                        <p className="text-xs text-text">السعر (عادي)</p>
                        <p className="text-base font-semibold text-heading">
                          {resort.priceRegular} {resort.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text">الويكند</p>
                        <p className="text-base font-semibold text-heading">
                          {resort.priceWeekend} {resort.currency}
                        </p>
                      </div>

                      <Link
                        href={buildResortHref(resort.id)}
                        onClick={(e) => {
                          if (darkCarousel.isDragging()) {
                            e.preventDefault();
                          }
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-black hover:bg-background transition"
                      >
                        التفاصيل
                      </Link>
                    </div>
                  </div>
                  </div>
                </BackgroundGradient>
              );
            })}
          </div>

          <div className="hidden md:flex xl:hidden items-center gap-3 mt-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {resorts.map((resort, idx) => {
              const thumb =
                resort.images.find((p) => p.includes("hero")) ?? resort.images[0];
              if (!thumb) return null;

              const active = darkCarousel.activeIndex === idx;
              return (
                <button
                  key={`dark-thumb-${resort.id}`}
                  type="button"
                  onClick={() => darkCarousel.scrollToIndex(idx)}
                  className={
                    "shrink-0 rounded-xl border transition " +
                    (active
                      ? "border-primary"
                      : "border-background-hover hover:border-white/20")
                  }
                >
                  <div className="relative w-20 h-12 overflow-hidden rounded-xl bg-[#18181b]">
                    <Image
                      src={thumb}
                      alt={resort.name}
                      fill
                      sizes="80px"
                      className={"object-cover transition " + (active ? "opacity-100" : "opacity-70")}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="hidden xl:flex items-center justify-center mt-4">
            <div className="inline-flex items-center gap-3 rounded-full bg-[#0f0f10] border border-white/10 px-3 py-2">
              <button
                type="button"
                onClick={darkCarousel.prev}
                disabled={darkCarousel.activeIndex <= 0}
                className="px-4 py-2 text-sm font-medium rounded-full bg-black text-white disabled:opacity-50"
              >
                Previous
              </button>
              <div className="min-w-16 text-center text-sm font-semibold text-white">
                {darkCarousel.total ? darkCarousel.activeIndex + 1 : 0}/{darkCarousel.total}
              </div>
              <button
                type="button"
                onClick={darkCarousel.next}
                disabled={darkCarousel.activeIndex >= darkCarousel.total - 1}
                className="px-4 py-2 text-sm font-medium rounded-full bg-black text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
