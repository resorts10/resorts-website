// src/get-api-data/header-setting.ts
import { unstable_cache } from "next/cache";

const DEFAULT_HEADER_SETTINGS = {
  siteName: "شاليهات أمواج",
  website: "https://amwaj-resorts-bh.vercel.app/",
  phone: "+973 3611 8277",
  whatsapp: "https://wa.me/97336118277",
};

export const getHeaderSettings = unstable_cache(
  async () => {
    return DEFAULT_HEADER_SETTINGS;
  },
  ["header-setting"],
  { tags: ["header-setting"] }
);
