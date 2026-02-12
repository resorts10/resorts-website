import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      resortId,
      resortName,
      checkIn,
      checkOut,
      nights,
      totalPrice,
      currency,
      deposit,
      fullName,
      email,
      phone,
      guests,
    } = await req.json();

    if (!fullName || !email || !phone || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "يرجى إدخال جميع البيانات المطلوبة" },
        { status: 400 }
      );
    }

    const finalTotal = parseFloat(totalPrice) + parseFloat(deposit);

    // Telr API request
    const telrResponse = await fetch("https://secure.telr.com/gateway/order.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "create",
        store: process.env.TELR_STORE_ID,
        authkey: process.env.TELR_AUTH_KEY,
        order: {
          cartid: `${resortId}-${Date.now()}`,
          test: process.env.TELR_TEST_MODE === "true" ? "1" : "0",
          amount: finalTotal.toFixed(3),
          currency: currency === "د.ب" ? "BHD" : currency,
          description: `حجز ${resortName} من ${checkIn} إلى ${checkOut}`,
        },
        customer: {
          email: email,
          phone: phone,
          name: {
            forenames: fullName.split(" ")[0] || fullName,
            surname: fullName.split(" ").slice(1).join(" ") || "",
          },
        },
        return: {
          authorised: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?provider=telr&status=success`,
          declined: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?provider=telr&status=failed`,
          cancelled: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?provider=telr&status=cancelled`,
        },
        billing: {
          name: {
            forenames: fullName.split(" ")[0] || fullName,
            surname: fullName.split(" ").slice(1).join(" ") || "",
          },
        },
        framed: 0,
      }),
    });

    const telrData = await telrResponse.json();

    if (!telrResponse.ok || telrData.error) {
      console.error("Telr API error:", telrData);
      return NextResponse.json(
        { error: telrData.error?.message || "فشل إنشاء جلسة الدفع" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      orderId: telrData.order?.ref,
      url: telrData.order?.url,
    });
  } catch (error: any) {
    console.error("Telr checkout error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
