import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    console.log("Telr Webhook received:", {
      orderId: payload.order?.ref,
      status: payload.order?.status?.code,
      amount: payload.order?.amount,
    });

    // Verify the transaction with Telr API
    const verifyResponse = await fetch(
      `https://secure.telr.com/gateway/order.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "check",
          store: process.env.TELR_STORE_ID,
          authkey: process.env.TELR_AUTH_KEY,
          order: {
            ref: payload.order?.ref,
          },
        }),
      }
    );

    const verifyData = await verifyResponse.json();

    // Handle payment status
    if (verifyData.order?.status?.code === "3") {
      // Payment successful (status code 3 = Paid)
      console.log("Payment successful:", {
        orderId: verifyData.order.ref,
        amount: verifyData.order.amount,
      });

      // TODO: Save booking to database
      // const metadata = verifyData.order.cartid.split("-");
      // await prisma.booking.create({
      //   data: {
      //     orderId: verifyData.order.ref,
      //     resortId: metadata[0],
      //     status: "confirmed",
      //     provider: "telr",
      //   },
      // });

      return NextResponse.json({ received: true });
    }

    if (verifyData.order?.status?.code === "2") {
      console.error("Payment declined:", verifyData);
    }

    if (verifyData.order?.status?.code === "1") {
      console.log("Payment cancelled by user");
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Telr webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
