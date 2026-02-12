// src/get-api-data/seo-setting.ts
import { unstable_cache } from "next/cache";

const DEFAULT_SEO_SETTINGS = {
  metaTitle: "شاليهات أمواج",
  metaDescription: "حجز وتأجير شاليهات فخمة في أمواج مع مسبح خاص وشاطئ خاص",
  metaKeywords: "Amwaj, Chalets, Bahrain, VIP, Resort, Booking",
  ogImage: "/assets/resort1/hero.jpeg",
};

export const getSeoSettings = unstable_cache(
  async () => {
    return DEFAULT_SEO_SETTINGS;
  },
  ["seo-setting"],
  { tags: ["seo-setting"] }
);

export async function getSiteName() {
  const seo = await getSeoSettings();
  // keep it simple and safe
  return (seo as any)?.metaTitle ?? DEFAULT_SEO_SETTINGS.metaTitle;
}
