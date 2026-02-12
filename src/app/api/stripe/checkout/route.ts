import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion intentionally omitted to match the installed Stripe SDK types
});

function containsLocalhost(url: string) {
  return url.includes("localhost") || url.includes("127.0.0.1");
}

function ensureSessionIdParam(url: string) {
  const placeholder = "{CHECKOUT_SESSION_ID}";

  if (/[?&]session_id=/i.test(url)) {
    if (!url.includes(placeholder)) {
      return url.replace(/([?&]session_id=)[^&]*/i, `$1${placeholder}`);
    }
    return url;
  }

  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}session_id=${placeholder}`;
}

export async function POST(req: NextRequest) {
  try {
    console.log("Checkout API: Request received");
    const body = await req.json();
    console.log("Checkout API: Request body", {
      resortId: body.resortId,
      resortName: body.resortName,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      nights: body.nights,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      guests: body.guests
    });
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
    } = body;

    if (!resortName || !checkIn || !checkOut || !phone || !email) {
      console.error("Checkout API: Missing required fields", { resortName, checkIn, checkOut, phone, email });
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    const currencyCode = currency === "د.ب" ? "bhd" : "usd";
    const minorUnitMultiplier = currencyCode === "bhd" ? 1000 : 100;

    const bookingAmount = Math.round(Number(totalPrice) * minorUnitMultiplier);
    const depositAmount = Math.round(
      Number(deposit ?? 50) * minorUnitMultiplier
    );

    const origin =
      req.nextUrl.origin ||
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const isLocalOrigin = containsLocalhost(origin);

    const defaultSuccessUrl = ensureSessionIdParam(`${origin}/payment/success`);
    const envSuccessUrl = process.env.NEXT_PUBLIC_SUCCESS_URL;

    const candidateSuccessUrl =
      envSuccessUrl &&
      (isLocalOrigin || !containsLocalhost(envSuccessUrl))
        ? envSuccessUrl
        : defaultSuccessUrl;

    const successUrl = ensureSessionIdParam(candidateSuccessUrl);

    const envCancelUrl = process.env.NEXT_PUBLIC_CANCEL_URL;
    const cancelUrl =
      envCancelUrl &&
      (isLocalOrigin || !containsLocalhost(envCancelUrl))
        ? envCancelUrl
        : `${origin}/payment?canceled=1`;

    console.log("Checkout API: Creating Stripe session...", {
      successUrl,
      cancelUrl,
      bookingAmount,
      depositAmount,
      currencyCode
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currencyCode,
            product_data: {
              name: `حجز ${resortName}`,
              description: `من ${checkIn} إلى ${checkOut} (${nights} ليلة)`,
              metadata: {
                checkIn,
                checkOut,
                nights,
                fullName,
                phone,
              },
            },
            unit_amount: bookingAmount,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: currencyCode,
            product_data: {
              name: "مبلغ التأمين (سيتم إرجاعه)",
              description: "يتم إرجاع مبلغ التأمين عند المغادرة",
            },
            unit_amount: depositAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(email ? { customer_email: email } : {}),
      metadata: {
        ...(resortId ? { resortId } : {}),
        resortName,
        checkIn,
        checkOut,
        nights: String(nights),
        currency,
        fullName: fullName || "",
        phone: phone || "",
        ...(guests ? { guests: String(guests) } : {}),
        ...(deposit != null ? { deposit: String(deposit) } : {}),
      },
    });

    console.log("Checkout API: Session created successfully", {
      sessionId: session.id,
      url: session.url
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error("Checkout API: Error creating session", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "فشل إنشاء جلسة الدفع" },
      { status: 500 }
    );
  }
}
