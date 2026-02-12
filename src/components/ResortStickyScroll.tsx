"use client";
import React from "react";
import Image from "next/image";
import { StickyScroll } from "./ui/sticky-scroll-reveal";

interface ResortStickyScrollProps {
  resortId: string;
}

export function ResortStickyScroll({ resortId }: ResortStickyScrollProps) {
  const resort1Content = [
    {
      title: "غرفة النوم الرئيسية",
      description:
        "غرفة نوم فاخرة مع سرير كينج سايز، تصميم عصري مريح، إطلالة ساحرة على البحر، وجميع وسائل الراحة التي تحتاجها لإقامة مثالية.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort1/19.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="غرفة النوم الرئيسية"
          />
        </div>
      ),
    },
    {
      title: "غرفة نوم عصرية",
      description:
        "غرفة نوم أنيقة مع سرير كبير وتنجيد داكن، تلفزيون حديث، وإضاءة دافئة تخلق أجواء مريحة ومثالية للاسترخاء.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort1/7.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="غرفة نوم عصرية"
          />
        </div>
      ),
    },
    {
      title: "المسبح الخاص",
      description:
        "مسبح خاص فاخر مع إطلالة بانورامية، مثالي للاسترخاء والاستمتاع بالأجواء الهادئة. مزود بمنطقة جلوس مريحة وإضاءة ليلية رومانسية.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort1/2.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="المسبح الخاص"
          />
        </div>
      ),
    },
    {
      title: "منطقة المعيشة",
      description:
        "مساحة واسعة ومريحة للاسترخاء مع العائلة، تحتوي على أريكة فاخرة، تلفزيون ذكي، ونوافذ كبيرة تسمح بدخول الضوء الطبيعي.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort1/13.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="منطقة المعيشة"
          />
        </div>
      ),
    },
    {
      title: "المطبخ العصري",
      description:
        "مطبخ حديث ومجهز بالكامل مع جزيرة مرمر وخزائن بيضاء أنيقة، يحتوي على جميع الأجهزة الكهربائية اللازمة لتحضير وجبات لذيذة.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort1/18.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="المطبخ العصري"
          />
        </div>
      ),
    },
    {
      title: "الحمام الفاخر",
      description:
        "حمام عصري مزود بحوض استحمام كبير، مرآة واسعة، وتصميم أنيق يوفر أقصى درجات الراحة والفخامة.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort1/12.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="الحمام الفاخر"
          />
        </div>
      ),
    },
    {
      title: "الشاطئ الخاص",
      description:
        "ممر خاص يؤدي مباشرة إلى الشاطئ، محاط بالخضرة وأشجار النخيل، مع إطلالة ساحرة على البحر الأزرق الهادئ.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort1/21.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="الشاطئ الخاص"
          />
        </div>
      ),
    },
  ];

  const resort2Content = [
    {
      title: "غرفة النوم المريحة",
      description:
        "غرفة نوم أنيقة بتصميم معاصر، مزودة بجميع الأثاث العصري والمرافق الفندقية الفاخرة. مع إطلالة ساحرة توفر أجواء هادئة ومريحة.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort2/4.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="غرفة النوم المريحة"
          />
        </div>
      ),
    },
    {
      title: "غرفة نوم ثانية",
      description:
        "غرفة نوم إضافية مع سرير مزدوج، خزانة واسعة، وتصميم بسيط وأنيق يوفر الراحة والخصوصية لجميع أفراد العائلة.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort2/8.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="غرفة نوم ثانية"
          />
        </div>
      ),
    },
    {
      title: "المسبح الخاص",
      description:
        "مسبح خاص بإضاءة ليلية رومانسية، محاط بكراسي استلقاء مريحة وأشجار النخيل، مثالي للاستجمام والاسترخاء في أي وقت.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort2/14.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="المسبح الخاص"
          />
        </div>
      ),
    },
    {
      title: "منطقة المعيشة",
      description:
        "صالة داخلية واسعة مع أريكة بيضاء مريحة، طاولة قهوة عصرية، وتلفزيون كبير، مثالية للتجمعات العائلية والاسترخاء.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort2/3.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="منطقة المعيشة"
          />
        </div>
      ),
    },
    {
      title: "المطبخ المجهز",
      description:
        "مطبخ حديث ومجهز بالكامل بجميع الأجهزة الكهربائية، خزائن بيضاء أنيقة، وأدوات الطبخ. مثالي لتحضير وجباتك المفضلة في أجواء مريحة.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort2/5.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="المطبخ المجهز"
          />
        </div>
      ),
    },
    {
      title: "الحمام الأنيق",
      description:
        "حمام عصري مع دش واسع، مرآة كبيرة، ومغسلة أنيقة، مصمم بطريقة عصرية توفر الراحة والفخامة.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort2/6.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="الحمام الأنيق"
          />
        </div>
      ),
    },
    {
      title: "إطلالة البحر",
      description:
        "شرفة خارجية واسعة مع إطلالة ساحرة على البحر، مجهزة بأثاث خارجي مريح، مثالية للاستمتاع بالمناظر الطبيعية الخلابة.",
      content: (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src="/assets/resort2/15.jpeg"
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="إطلالة البحر"
          />
        </div>
      ),
    },
  ];

  const content = resortId === "resort1" ? resort1Content : resort2Content;

  return (
    <div className="w-full py-8">
      <div className="container mb-8 px-4 mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
          جولة في الشاليه
        </h2>
        <p className="text-gray-600 text-center mt-4 max-w-2xl mx-auto">
          اكتشف التفاصيل الفاخرة والمرافق المميزة في شاليهنا
        </p>
      </div>
      <StickyScroll content={content} />
    </div>
  );
}
