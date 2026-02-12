import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    console.log("Tap Webhook received:", {
      id: payload.id,
      status: payload.status,
      amount: payload.amount,
    });

    // Verify webhook signature (optional but recommended)
    const signature = req.headers.get("x-tap-signature");
    
    // Handle payment status
    if (payload.status === "CAPTURED") {
      const metadata = payload.metadata || {};
      
      console.log("Payment successful:", {
        chargeId: payload.id,
        resortName: metadata.resortName,
        customer: metadata.fullName,
        amount: payload.amount,
      });

      // TODO: Save booking to database
      // await prisma.booking.create({
      //   data: {
      //     chargeId: payload.id,
      //     resortId: metadata.resortId,
      //     resortName: metadata.resortName,
      //     checkIn: metadata.checkIn,
      //     checkOut: metadata.checkOut,
      //     nights: parseInt(metadata.nights),
      //     totalPrice: parseFloat(metadata.totalPrice),
      //     deposit: parseFloat(metadata.deposit),
      //     guests: parseInt(metadata.guests),
      //     fullName: metadata.fullName,
      //     email: metadata.email,
      //     phone: metadata.phone,
      //     status: "confirmed",
      //     provider: "tap",
      //   },
      // });

      return NextResponse.json({ received: true });
    }

    if (payload.status === "FAILED" || payload.status === "DECLINED") {
      console.error("Payment failed:", payload);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Tap webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
