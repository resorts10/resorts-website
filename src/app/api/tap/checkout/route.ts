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

    // Tap Payments API request
    const tapResponse = await fetch("https://api.tap.company/v2/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAP_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: finalTotal,
        currency: currency === "د.ب" ? "BHD" : currency,
        customer: {
          first_name: fullName.split(" ")[0] || fullName,
          last_name: fullName.split(" ").slice(1).join(" ") || "",
          email: email,
          phone: {
            country_code: "973",
            number: phone.replace(/\D/g, ""),
          },
        },
        source: {
          id: "src_all",
        },
        redirect: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?provider=tap`,
        },
        post: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/tap/webhook`,
        },
        metadata: {
          resortId,
          resortName,
          checkIn,
          checkOut,
          nights,
          totalPrice,
          deposit,
          guests,
          fullName,
          email,
          phone,
        },
        description: `حجز ${resortName} من ${checkIn} إلى ${checkOut}`,
      }),
    });

    const tapData = await tapResponse.json();

    if (!tapResponse.ok) {
      console.error("Tap API error:", tapData);
      return NextResponse.json(
        { error: tapData.message || "فشل إنشاء جلسة الدفع" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      chargeId: tapData.id,
      url: tapData.transaction?.url,
    });
  } catch (error: any) {
    console.error("Tap checkout error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
