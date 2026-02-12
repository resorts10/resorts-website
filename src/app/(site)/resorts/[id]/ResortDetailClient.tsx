"use client";
import { useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Timeline } from "@/components/ui/timeline";
import type { Resort } from "@/types";

interface ResortDetailClientProps {
  resort: Resort;
  galleryImages: string[];
  resortId: string;
  video?: string;
}

export function ResortDetailClient({ resort, galleryImages, resortId, video }: ResortDetailClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const getCategorizedImages = () => {
    if (resortId === "resort1") {
      return {
        bedrooms: [
          "/assets/resort1/4.jpeg",
          "/assets/resort1/6.jpeg", 
          "/assets/resort1/7.jpeg",
          "/assets/resort1/19.jpeg",
        ],
        facilities: [
          "/assets/resort1/8.jpeg",
          "/assets/resort1/9.jpeg",
          "/assets/resort1/13.jpeg",
          "/assets/resort1/15.jpeg",
          "/assets/resort1/16.jpeg",
          "/assets/resort1/17.jpeg",
          "/assets/resort1/18.jpeg",
        ],
        bathrooms: [
          "/assets/resort1/12.jpeg",
          "/assets/resort1/14.jpeg",
          "/assets/resort1/20.jpeg",
        ],
        pool: [
          "/assets/resort1/2.jpeg",
          "/assets/resort1/5.jpeg",
          "/assets/resort1/22.jpeg",
          "/assets/resort1/hero2.jpeg",
          "/assets/resort1/hero4.jpeg",
        ],
        beach: [
          "/assets/resort1/1.jpeg",
          "/assets/resort1/3.jpeg",
          "/assets/resort1/10.jpeg",
          "/assets/resort1/21.jpeg",
        ],
      };
    }

    if (resortId === "resort2") {
      return {
        bedrooms: [
          "/assets/resort2/4.jpeg",
          "/assets/resort2/8.jpeg",
          "/assets/resort2/12.jpeg",
        ],
        facilities: [
          "/assets/resort2/3.jpeg",
          "/assets/resort2/7.jpeg",
          "/assets/resort2/10.jpeg",
          "/assets/resort2/11.jpeg",
          "/assets/resort2/13.jpeg",
        ],
        bathrooms: [
          "/assets/resort2/6.jpeg",
        ],
        kitchen: [
          "/assets/resort2/5.jpeg",
        ],
        pool: [
          "/assets/resort2/2.jpeg",
          "/assets/resort2/14.jpeg",
        ],
        views: [
          "/assets/resort2/1.jpeg",
          "/assets/resort2/9.jpeg",
          "/assets/resort2/15.jpeg",
        ],
      };
    }

    if (resortId === "resort3") {
      return {
        bedrooms: [
          "/assets/resort3/1.jpeg",
          "/assets/resort3/2.jpeg",
          "/assets/resort3/3.jpeg",
        ],
        bathrooms: [
          "/assets/resort3/8.jpeg",
        ],
        facilities: [
          "/assets/resort3/4.jpeg",
          "/assets/resort3/5.jpeg",
          "/assets/resort3/6.jpeg",
          "/assets/resort3/7.jpeg",
        ],
        pool: [
          "/assets/resort3/9.jpeg",
          "/assets/resort3/10.jpeg",
          "/assets/resort3/11.jpeg",
          "/assets/resort3/12.jpeg",
        ],
      };
    }

    if (resortId === "apartment1") {
      return {
        bedrooms: [
          "/assets/apartment1/1.jpeg",
          "/assets/apartment1/2.jpeg",
          "/assets/apartment1/3.jpeg",
          "/assets/apartment1/4.jpeg",
          "/assets/apartment1/5.jpeg",
        ],
        facilities: [
          "/assets/apartment1/6.jpeg",
          "/assets/apartment1/7.jpeg",
          "/assets/apartment1/8.jpeg",
          "/assets/apartment1/9.jpeg",
          "/assets/apartment1/10.jpeg",
        ],
      };
    }

    return {
      bedrooms: resort.images.slice(0, 6),
      facilities: resort.images.slice(6, 12),
    };
  };

  const categorizedImages = getCategorizedImages();

  const timelineData = resortId === "resort1" ? [
    {
      title: "غرف النوم",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            غرف نوم فاخرة مع أسرّة كبيرة، تصميم عصري مريح، وجميع وسائل الراحة التي تحتاجها لإقامة مثالية.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.bedrooms?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="غرفة نوم"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.bedrooms || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "صالات المعيشة",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            مساحات واسعة ومريحة للاسترخاء مع العائلة، تحتوي على أرائك فاخرة، تلفزيون ذكي، ونوافذ كبيرة.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.facilities?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="صالة معيشة"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.facilities || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "المرفقات ودورات المياه",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            حمامات عصرية مزودة بأحواض استحمام كبيرة، مرايا واسعة، وتصميم أنيق يوفر أقصى درجات الراحة.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.bathrooms?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="حمام"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.bathrooms || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "المسبح الخاص",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            مسبح خاص فاخر مع إطلالة بانورامية، مثالي للاسترخاء والاستمتاع بالأجواء الهادئة. مزود بإضاءة ليلية رومانسية.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.pool?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="مسبح"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.pool || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "الشاطئ والإطلالات",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            إطلالات ساحرة على البحر الأزرق الهادئ، مع إمكانية الوصول المباشر إلى الشاطئ الخاص.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.beach?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="شاطئ"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.beach || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
  ] : resortId === "resort2" ? [
    {
      title: "غرف النوم",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            غرف نوم أنيقة بتصميم معاصر، مزودة بجميع الأثاث العصري والمرافق الفندقية الفاخرة.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.bedrooms?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="غرفة نوم"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.bedrooms || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "صالات المعيشة",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            صالة داخلية واسعة مع أريكة مريحة، طاولة قهوة عصرية، وتلفزيون كبير، مثالية للتجمعات العائلية.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.facilities?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="صالة معيشة"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.facilities || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "المطبخ والحمامات",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            مطبخ حديث مجهز بالكامل وحمامات عصرية أنيقة توفر الراحة والفخامة.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[...(categorizedImages.kitchen || []), ...(categorizedImages.bathrooms || [])].map((src, index) => (
              <img
                key={src}
                src={src}
                alt="مطبخ أو حمام"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox([...(categorizedImages.kitchen || []), ...(categorizedImages.bathrooms || [])], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "المسبح الخاص",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            مسبح خاص بإضاءة ليلية رومانسية، محاط بكراسي استلقاء مريحة، مثالي للاستجمام.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.pool?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="مسبح"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.pool || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "الإطلالات",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            إطلالات ساحرة على البحر والمساحات الخضراء من الشرفات الخارجية الواسعة.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.views?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="إطلالة"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.views || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
  ] : resortId === "resort3" ? [
    {
      title: "غرف النوم",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            غرف نوم ماستر بتصميم مريح، مناسبة للراحة والاسترخاء.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.bedrooms?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="غرفة نوم"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.bedrooms || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "الصالة",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            صالة جلوس مريحة مع مساحة مناسبة للتجمع والاسترخاء.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.facilities?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="صالة"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.facilities || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "حمام الغرف",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            حمام أنيق ومجهز بالكامل لراحة الضيوف.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.bathrooms?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="حمام"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.bathrooms || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "المرفقات وبركة السباحة",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            مسبح خاص بنظام تدفئة يعمل 24 ساعة مع جلسة خارجية وحديقة مطلة على المسبح.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.pool?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="مسبح"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.pool || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
  ] : resortId === "apartment1" ? [
    {
      title: "غرف النوم",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            غرف نوم ماستر بتصميم حديث وخصوصية تامة.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.bedrooms?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="غرفة نوم"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.bedrooms || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "صالة المعيشة وطاولة الطعام",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            صالة معيشة واسعة مع طاولة طعام، مثالية للراحة وقضاء الوقت مع العائلة.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {categorizedImages.facilities?.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="صالة معيشة"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(categorizedImages.facilities || [], index)}
              />
            ))}
          </div>
        </div>
      ),
    },
  ] : [
    {
      title: "الصور",
      content: (
        <div>
          <div className="grid grid-cols-2 gap-4">
            {galleryImages.slice(0, 8).map((src, index) => (
              <img
                key={src}
                src={src}
                alt="صورة"
                width={500}
                height={500}
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(galleryImages, index)}
              />
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Timeline Gallery */}
      <div className="mt-12">
        <Timeline data={timelineData} />
      </div>

      {/* Video */}
      {video ? (
        <div className="mt-12 px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
          <h2 className="text-xl font-semibold text-dark">🎥 فيديو</h2>
          <div className="mt-4 overflow-hidden border rounded-2xl border-gray-3 bg-black">
            <video controls className="w-full h-auto" src={video} />
          </div>
        </div>
      ) : null}

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
