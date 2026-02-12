export type Resort = {
  id: string;
  name: string;
  type: "vip" | "standard" | string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  priceRegular: number;
  priceWeekend: number;
  currency: string;
  features: string[];
  amenities: string[];
  images: string[];
  video?: string;
  hasPrivatePool?: boolean;
  hasPrivateBeach?: boolean;
  beachAccess?: "direct" | "nearby" | "none" | string;

  // Booking & location
  paymentLink?: string;
  deposit?: number;
  checkIn?: string;
  checkOut?: string;
  policy?: string[];
  location?: {
    lat: number;
    lng: number;
    villa?: string;
    road?: string;
    block?: string;
    area?: string;
  };
};
