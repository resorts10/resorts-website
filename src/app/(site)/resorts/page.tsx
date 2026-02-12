"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

import { resorts } from "@/assets/resorts";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

// ============================================================================
// ENHANCED CAROUSEL HOOK WITH PERFECT THUMBNAIL SYNC
// ============================================================================

interface CarouselState {
  isDown: boolean;
  startX: number;
  startY: number;
  scrollLeft: number;
  moved: boolean;
  velocity: number;
  lastX: number;
  lastTime: number;
}

function useScrollSnapCarousel(count: number) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const thumbnailContainerRef = useRef<HTMLDivElement | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const snapLeftsRef = useRef<number[]>([]);
  const scrollPaddingLeftRef = useRef(0);

  const dragState = useRef<CarouselState>({
    isDown: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    moved: false,
    velocity: 0,
    lastX: 0,
    lastTime: 0,
  });

  const isDraggingRef = useRef(false);
  const animationFrameRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<number>(0);
  const isScrollingProgrammatically = useRef(false);

  // ==================== UTILITY FUNCTIONS ====================

  const readScrollPaddingLeft = useCallback((el: HTMLDivElement) => {
    const sp = window.getComputedStyle(el).scrollPaddingLeft;
    const px = Number.parseFloat(sp || "0");
    return Number.isFinite(px) ? px : 0;
  }, []);

  const computeSnapLefts = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    scrollPaddingLeftRef.current = readScrollPaddingLeft(track);
    const baseLeft = track.offsetLeft;
    const lefts: number[] = [];

    for (let i = 0; i < count; i++) {
      const node = itemRefs.current[i];
      if (!node) {
        lefts.push(0);
        continue;
      }
      lefts.push(node.offsetLeft - baseLeft);
    }

    snapLeftsRef.current = lefts;
  }, [count, readScrollPaddingLeft]);

  // ==================== ACTIVE INDEX CALCULATION ====================

  const calculateActiveIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track || count <= 0) return;

    const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < count; i++) {
      const node = itemRefs.current[i];
      if (!node) continue;
      const r = node.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(c - mid);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    setActiveIndex(bestIdx);
  }, [count]);

  // ==================== THUMBNAIL AUTO-SCROLL ====================

  const scrollThumbnailIntoView = useCallback((index: number) => {
    const thumbnail = thumbnailRefs.current[index];

    if (!thumbnail) return;

    thumbnail.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, []);

  // ==================== SCROLL EVENT HANDLER ====================

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // Initial computation
    computeSnapLefts();
    requestAnimationFrame(() => {
      computeSnapLefts();
      calculateActiveIndex();
    });

    const onScroll = () => {
      window.clearTimeout(scrollTimeoutRef.current);
      cancelAnimationFrame(animationFrameRef.current);

      animationFrameRef.current = requestAnimationFrame(calculateActiveIndex);

      scrollTimeoutRef.current = window.setTimeout(() => {
        if (!isDraggingRef.current && !isScrollingProgrammatically.current) {
          computeSnapLefts();
        }
      }, 150);
    };

    const onResize = () => {
      computeSnapLefts();
      calculateActiveIndex();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameRef.current);
      window.clearTimeout(scrollTimeoutRef.current);
    };
  }, [count, computeSnapLefts, calculateActiveIndex]);

  // ==================== SYNC THUMBNAILS WITH ACTIVE INDEX ====================

  useEffect(() => {
    if (!isScrollingProgrammatically.current) {
      scrollThumbnailIntoView(activeIndex);
    }
  }, [activeIndex, scrollThumbnailIntoView]);

  // ==================== REF ASSIGNMENT ====================

  const setItemRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      itemRefs.current[index] = el;
      if (el) {
        requestAnimationFrame(computeSnapLefts);
      }
    },
    [computeSnapLefts]
  );

  const setThumbnailRef = useCallback(
    (index: number) => (el: HTMLButtonElement | null) => {
      thumbnailRefs.current[index] = el;
    },
    []
  );

  // ==================== NAVIGATION FUNCTIONS ====================

  const scrollToIndex = useCallback(
    (index: number, smooth = true) => {
      const track = trackRef.current;
      if (!track) return;
      if (index < 0 || index >= count) return;

      isScrollingProgrammatically.current = true;

      setActiveIndex(index);
      scrollThumbnailIntoView(index);

      const node = itemRefs.current[index];
      if (node) {
        node.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "nearest",
          inline: "start",
        });
      }

      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, smooth ? 600 : 50);
    },
    [count, scrollThumbnailIntoView]
  );

  // ==================== TOUCH/DRAG HANDLERS ====================

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    if (el.scrollWidth <= el.clientWidth) return;
    if (e.pointerType !== "mouse") return;
    if (e.button !== 0) return;

    computeSnapLefts();

    const now = Date.now();
    dragState.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      moved: false,
      velocity: 0,
      lastX: e.clientX,
      lastTime: now,
    };

    isDraggingRef.current = false;

    el.style.scrollBehavior = "auto";
  }, [computeSnapLefts]);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    if (!dragState.current.isDown) return;

    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;

    if (!dragState.current.moved) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > 10 && absDx > absDy * 1.5) {
        dragState.current.moved = true;
        isDraggingRef.current = true;

        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // Ignore
        }

        e.preventDefault();
      } else if (absDy > 10) {
        dragState.current.isDown = false;
        return;
      }
    }

    if (dragState.current.moved) {
      e.preventDefault();

      const now = Date.now();
      const dt = now - dragState.current.lastTime;
      if (dt > 0) {
        const vx = (e.clientX - dragState.current.lastX) / dt;
        dragState.current.velocity = vx;
        dragState.current.lastX = e.clientX;
        dragState.current.lastTime = now;
      }

      el.scrollLeft = dragState.current.scrollLeft - dx;
    }
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    dragState.current.isDown = false;

    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (el) {
      el.style.scrollBehavior = "smooth";
    }

    if (dragState.current.moved && Math.abs(dragState.current.velocity) > 0.3) {
      const momentum = dragState.current.velocity * 200;
      const currentScroll = el?.scrollLeft ?? 0;
      const targetScroll = currentScroll - momentum;

      if (el) {
        el.scrollTo({
          left: Math.max(0, Math.min(targetScroll, el.scrollWidth - el.clientWidth)),
          behavior: "smooth",
        });
      }
    }

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  }, []);

  // ==================== HELPER FUNCTIONS ====================

  const isDragging = useCallback(() => isDraggingRef.current, []);

  const guardedClick = useCallback((cb: () => void) => {
    if (isDraggingRef.current) return;
    cb();
  }, []);

  const prev = useCallback(() => {
    const newIndex = Math.max(0, activeIndex - 1);
    scrollToIndex(newIndex);
  }, [activeIndex, scrollToIndex]);

  const next = useCallback(() => {
    const newIndex = Math.min(count - 1, activeIndex + 1);
    scrollToIndex(newIndex);
  }, [activeIndex, count, scrollToIndex]);

  // ==================== RETURN API ====================

  return {
    trackRef,
    thumbnailContainerRef,
    setItemRef,
    setThumbnailRef,
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ResortsPage() {
  const router = useRouter();

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);

  const lightCarousel = useScrollSnapCarousel(resorts.length);
  const darkCarousel = useScrollSnapCarousel(resorts.length);

  const buildResortHref = useCallback((id: string) => {
    const sp = new URLSearchParams();
    if (checkIn) sp.set("checkIn", checkIn);
    if (checkOut) sp.set("checkOut", checkOut);
    sp.set("guests", String(guests || 1));
    const qs = sp.toString();
    return qs ? `/resorts/${id}?${qs}` : `/resorts/${id}`;
  }, [checkIn, checkOut, guests]);

  const onOpenResort = useCallback((id: string) => {
    router.push(buildResortHref(id));
  }, [router, buildResortHref]);

  return (
    <main className="pt-32">
      <section className="px-4 pb-12 mx-auto max-w-7xl sm:px-6 xl:px-0">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-heading sm:text-5xl">
            استكشف شاليهاتنا
          </h1>
          <p className="mt-4 text-lg text-text">
            اختر الإقامة المثالية لعطلتك القادمة
          </p>
        </div>

        {/* Booking Form */}
        <div className="max-w-4xl p-6 mx-auto mb-12 border rounded-2xl border-background-hover bg-background-hover">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="checkIn" className="block text-sm font-medium text-text">
                تاريخ الدخول
              </label>
              <input
                id="checkIn"
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-4 py-2 mt-1 text-sm border rounded-lg bg-background border-background-hover text-heading"
              />
            </div>
            <div>
              <label htmlFor="checkOut" className="block text-sm font-medium text-text">
                تاريخ الخروج
              </label>
              <input
                id="checkOut"
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-4 py-2 mt-1 text-sm border rounded-lg bg-background border-background-hover text-heading"
              />
            </div>
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-text">
                عدد الضيوف
              </label>
              <select
                id="guests"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-4 py-2 mt-1 text-sm border rounded-lg bg-background border-background-hover text-heading"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "ضيف" : "ضيوف"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                className="w-full px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-primary hover:bg-primary/90"
              >
                بحث
              </button>
            </div>
          </div>
        </div>

        {/* Light Mode Carousel */}
        <div className="relative mb-12 dark:hidden">
          <div className="relative">
            {/* Main Track */}
            <div
              ref={lightCarousel.trackRef}
              dir="rtl"
              onPointerDown={lightCarousel.onPointerDown}
              onPointerMove={lightCarousel.onPointerMove}
              onPointerUp={lightCarousel.onPointerUp}
              onPointerCancel={lightCarousel.onPointerUp}
              onPointerLeave={lightCarousel.onPointerUp}
              className="grid gap-6 grid-flow-col auto-cols-max items-start overflow-x-auto pb-4 snap-x snap-mandatory scroll-px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none carousel-track"
              style={{
                touchAction: "pan-x pan-y pinch-zoom",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {resorts.map((resort, idx) => {
                const cover =
                  resort.images.find((p) => p.includes("hero")) ?? resort.images[0];

                if (!cover) return null;

                return (
                  <motion.div
                    key={resort.id}
                    ref={lightCarousel.setItemRef(idx)}
                    dir="rtl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="overflow-hidden transition-all duration-300 border w-full snap-start md:w-[420px] lg:w-[520px] rounded-xl border-background-hover bg-background-hover hover:shadow-lg carousel-item"
                  >
                    <div className="relative w-full h-56 bg-gray-100">
                      <button
                        type="button"
                        className="relative w-full h-full group"
                        onClick={() =>
                          lightCarousel.guardedClick(() => onOpenResort(resort.id))
                        }
                      >
                        <Image
                          src={cover}
                          alt={resort.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          priority={idx < 3}
                        />
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-heading">
                            {resort.name}
                          </h2>
                          <p className="mt-1 text-sm text-text line-clamp-2">
                            {resort.description}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                          {resort.type.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-4 text-sm text-text">
                        <span className="flex items-center gap-1">
                          🛏️ {resort.bedrooms} غرف
                        </span>
                        <span className="flex items-center gap-1">
                          🚿 {resort.bathrooms} حمّامات
                        </span>
                        {resort.hasPrivatePool && (
                          <span className="flex items-center gap-1">🏊‍♂️ مسبح خاص</span>
                        )}
                        {resort.hasPrivateBeach && (
                          <span className="flex items-center gap-1">🏖️ شاطئ خاص</span>
                        )}
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
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-primary hover:bg-primary/90"
                        >
                          التفاصيل
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation Controls for Large Screens */}
            <div className="hidden xl:block">
              <motion.button
                type="button"
                onClick={lightCarousel.prev}
                disabled={lightCarousel.activeIndex <= 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 text-sm font-medium transition-all duration-200 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
                aria-label="Previous"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>

              <motion.button
                type="button"
                onClick={lightCarousel.next}
                disabled={lightCarousel.activeIndex >= lightCarousel.total - 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 text-sm font-medium transition-all duration-200 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
                aria-label="Next"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Thumbnails for Medium Screens - FIXED SYNC */}
          <div className="mt-6 flex xl:hidden">
            <div
              ref={lightCarousel.thumbnailContainerRef}
              dir="rtl"
              className="flex items-center w-full gap-3 overflow-x-auto pb-2 px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth thumbnail-container"
            >
              {resorts.map((resort, idx) => {
                const thumb =
                  resort.images.find((p) => p.includes("hero")) ?? resort.images[0];
                if (!thumb) return null;

                const active = lightCarousel.activeIndex === idx;
                return (
                  <motion.button
                    key={`light-thumb-${resort.id}`}
                    ref={lightCarousel.setThumbnailRef(idx)}
                    type="button"
                    onClick={() => lightCarousel.scrollToIndex(idx)}
                    className={`shrink-0 rounded-xl border-2 transition-all duration-300 relative thumbnail-item ${active ? "thumbnail-active" : ""
                      }`}
                    animate={{
                      borderColor: active ? "rgb(59, 130, 246)" : "rgb(229, 231, 235)",
                      scale: active ? 1.1 : 1,
                    }}
                    whileHover={{ scale: active ? 1.1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {active && (
                      <motion.div
                        layoutId="light-active-thumbnail"
                        className="absolute inset-0 rounded-xl bg-primary/20"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className="relative w-20 h-12 overflow-hidden rounded-xl bg-gray-50">
                      <Image
                        src={thumb}
                        alt={resort.name}
                        fill
                        sizes="80px"
                        className={`object-cover transition-opacity duration-300 ${active ? "opacity-100" : "opacity-70"
                          }`}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="hidden mt-6 xl:flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-3 border shadow-sm rounded-2xl bg-background border-background-hover">
              <motion.span
                key={lightCarousel.activeIndex}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-lg font-bold text-heading"
              >
                {lightCarousel.total ? lightCarousel.activeIndex + 1 : 0}
              </motion.span>
              <span className="text-sm text-text">/</span>
              <span className="text-sm font-medium text-text">{lightCarousel.total}</span>
            </div>
          </div>
        </div>

        {/* Dark Mode Carousel with Gradient - SAME FIXES */}
        <div className="relative hidden mb-12 dark:block">
          <div className="relative">
            {/* Main Track */}
            <div
              ref={darkCarousel.trackRef}
              dir="rtl"
              onPointerDown={darkCarousel.onPointerDown}
              onPointerMove={darkCarousel.onPointerMove}
              onPointerUp={darkCarousel.onPointerUp}
              onPointerCancel={darkCarousel.onPointerUp}
              onPointerLeave={darkCarousel.onPointerUp}
              className="grid gap-6 grid-flow-col auto-cols-max items-start overflow-x-auto pb-4 snap-x snap-mandatory scroll-px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none carousel-track"
              style={{
                touchAction: "pan-x pan-y pinch-zoom",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {resorts.map((resort, idx) => {
                const cover =
                  resort.images.find((p) => p.includes("hero")) ?? resort.images[0];

                if (!cover) return null;

                return (
                  <div
                    key={resort.id}
                    ref={darkCarousel.setItemRef(idx)}
                    dir="rtl"
                    className="w-full snap-start md:w-[420px] lg:w-[520px] transition-all duration-300 carousel-item"
                  >
                    <BackgroundGradient
                      containerClassName="w-full"
                      className="overflow-hidden bg-[#18181b] rounded-xl"
                    >
                      <motion.div
                        className="h-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                      >
                        <div className="relative w-full h-56 bg-[#18181b]">
                          <button
                            type="button"
                            className="relative w-full h-full group"
                            onClick={() =>
                              darkCarousel.guardedClick(() => onOpenResort(resort.id))
                            }
                          >
                            <Image
                              src={cover}
                              alt={resort.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              priority={idx < 3}
                            />
                          </button>
                        </div>

                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h2 className="text-lg font-semibold text-heading">
                                {resort.name}
                              </h2>
                              <p className="mt-1 text-sm text-text line-clamp-2">
                                {resort.description}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                              {resort.type.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3 mt-4 text-sm text-text">
                            <span className="flex items-center gap-1">
                              🛏️ {resort.bedrooms} غرف
                            </span>
                            <span className="flex items-center gap-1">
                              🚿 {resort.bathrooms} حمّامات
                            </span>
                            {resort.hasPrivatePool && (
                              <span className="flex items-center gap-1">🏊‍♂️ مسبح خاص</span>
                            )}
                            {resort.hasPrivateBeach && (
                              <span className="flex items-center gap-1">🏖️ شاطئ خاص</span>
                            )}
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
                              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-black hover:bg-gray-800"
                            >
                              التفاصيل
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    </BackgroundGradient>
                  </div>
                );
              })}
            </div>

            {/* Navigation Controls for Large Screens */}
            <div className="hidden xl:block">
              <motion.button
                type="button"
                onClick={darkCarousel.prev}
                disabled={darkCarousel.activeIndex <= 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 text-sm font-medium transition-all duration-200 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                aria-label="Previous"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>

              <motion.button
                type="button"
                onClick={darkCarousel.next}
                disabled={darkCarousel.activeIndex >= darkCarousel.total - 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 text-sm font-medium transition-all duration-200 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                aria-label="Next"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Thumbnails for Medium Screens - FIXED SYNC */}
          <div className="mt-6 flex xl:hidden">
            <div
              ref={darkCarousel.thumbnailContainerRef}
              dir="rtl"
              className="flex items-center w-full gap-3 overflow-x-auto pb-2 px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth thumbnail-container"
            >
              {resorts.map((resort, idx) => {
                const thumb =
                  resort.images.find((p) => p.includes("hero")) ?? resort.images[0];
                if (!thumb) return null;

                const active = darkCarousel.activeIndex === idx;
                return (
                  <motion.button
                    key={`dark-thumb-${resort.id}`}
                    ref={darkCarousel.setThumbnailRef(idx)}
                    type="button"
                    onClick={() => darkCarousel.scrollToIndex(idx)}
                    className={`shrink-0 rounded-xl border-2 transition-all duration-300 relative thumbnail-item ${active ? "thumbnail-active" : ""
                      }`}
                    animate={{
                      borderColor: active ? "rgb(59, 130, 246)" : "rgba(255, 255, 255, 0.1)",
                      scale: active ? 1.1 : 1,
                    }}
                    whileHover={{ scale: active ? 1.1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {active && (
                      <motion.div
                        layoutId="dark-active-thumbnail"
                        className="absolute inset-0 rounded-xl bg-primary/20"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className="relative w-20 h-12 overflow-hidden rounded-xl bg-[#18181b]">
                      <Image
                        src={thumb}
                        alt={resort.name}
                        fill
                        sizes="80px"
                        className={`object-cover transition-opacity duration-300 ${active ? "opacity-100" : "opacity-70"
                          }`}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="hidden mt-6 xl:flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-3 border shadow-lg rounded-2xl bg-[#0f0f10] border-white/10">
              <motion.span
                key={darkCarousel.activeIndex}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-lg font-bold text-white"
              >
                {darkCarousel.total ? darkCarousel.activeIndex + 1 : 0}
              </motion.span>
              <span className="text-sm text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-400">{darkCarousel.total}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}