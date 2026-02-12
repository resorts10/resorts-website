"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecoverSessionClient() {
  const router = useRouter();

  useEffect(() => {
    try {
      const id = sessionStorage.getItem("lastStripeSessionId") || "";
      if (!id) return;
      router.replace(`/payment/success?session_id=${encodeURIComponent(id)}`);
    } catch {
      // ignore
    }
  }, [router]);

  return null;
}
