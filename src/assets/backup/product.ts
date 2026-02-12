// import { prisma } from "@/lib/prismaDB";
// import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

// TODO: Add Product model to schema.prisma then uncomment prisma queries
// get product for id and title 
export const getProductsIdAndTitle = unstable_cache(
  async () => {
    return [];
  },
  ['products'], { tags: ['products'] }
);

// get new arrival product
export const getNewArrivalsProduct = unstable_cache(
  async () => {
    return [];
  },
  ['products'], { tags: ['products'] }
);

// get best selling product
export const getBestSellingProducts = unstable_cache(
  async () => {
    return [];
  },
  ['products'], { tags: ['products'] }
);

// get latest product
export const getLatestProducts = unstable_cache(
  async () => {
    return [];
  },
  ['products'], { tags: ['products'] }
);


// GET ALL PRODUCTS
export const getAllProducts = unstable_cache(
  async () => {
    return [];
  },
  ['products'], { tags: ['products'] }
);

// GET PRODUCT BY SLUG
export const getProductBySlug = async (slug: string) => {
  return null;
}

// GET PRODUCT BY ID
export const getProductById = async (productId: string) => {
  return null;
};


export const getRelatedProducts = unstable_cache(
  async (category: string, tags: string[] | undefined, currentProductId: string,productTitle:string) => {
    return [];
  },
  ['related-products'],
  { tags: ['products'] }
);
