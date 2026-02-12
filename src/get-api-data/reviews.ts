// import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

// TODO: Add Review model to schema.prisma then uncomment prisma queries
export const getReviews = unstable_cache(
  async (productSlug: string) => {
    return {
        reviews: [],
        avgRating: 0,
        totalRating: 0,
    };
  },
  ["reviews"],
  { tags: ["reviews"] }
);
