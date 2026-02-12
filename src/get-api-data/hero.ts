// import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

// TODO: Add HeroBanner/HeroSlider models to schema.prisma then uncomment prisma queries
// get hero banners
export const getHeroBanners = unstable_cache(
  async () => {
    return [];
  },
  ['heroBanners'], { tags: ['heroBanners'] }
);

// get hero sliders
export const getHeroSliders = unstable_cache(
  async () => {
    return [];
  },
  ['heroSliders'], { tags: ['heroSliders'] }
);

// single hero banner
export const getSingleHeroBanner = async (id:number) => 
  unstable_cache(
    async () => {
      return null;
    },
    ['single-hero-banner'], { tags: [`single-hero-banner-${id}`] }
  )
