// src/get-api-data/header-setting.ts
import { unstable_cache } from "next/cache";

const DEFAULT_HEADER_SETTINGS = {
  siteName: "شاليهات أمواج",
  phone: "+973 0000 0000",
  whatsapp: "https://wa.me/97300000000",
};

export const getHeaderSettings = unstable_cache(
  async () => {
    return DEFAULT_HEADER_SETTINGS;
  },
  ["header-setting"],
  { tags: ["header-setting"] }
);
