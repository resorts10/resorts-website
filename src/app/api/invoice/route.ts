import { NextRequest } from "next/server";
import Stripe from "stripe";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion intentionally omitted to match the installed Stripe SDK types
});

function minorUnitDivisor(currency?: string) {
  const code = (currency || "").toLowerCase();
  return code === "bhd" ? 1000 : 100;
}

function formatMoneyFromMinor(amountMinor: number, currency?: string) {
  const divisor = minorUnitDivisor(currency);
  const code = (currency || "").toUpperCase();
  const fraction = divisor === 1000 ? 3 : 2;
  return `${(amountMinor / divisor).toFixed(fraction)} ${code}`;
}

function formatDateForInvoice(d: Date) {
  try {
    return new Intl.DateTimeFormat("ar-BH", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export async function GET(req: NextRequest) {
  console.log("Invoice API: Request received", {
    url: req.url,
    searchParams: Object.fromEntries(req.nextUrl.searchParams.entries())
  });

  const sessionId =
    req.nextUrl.searchParams.get("session_id") ||
    req.nextUrl.searchParams.get("sessionId") ||
    req.nextUrl.searchParams.get("checkout_session_id") ||
    "";
  const disposition = (req.nextUrl.searchParams.get("disposition") || "attachment").toLowerCase();
  const contentDisposition = disposition === "inline" ? "inline" : "attachment";

  if (!sessionId) {
    console.error("Invoice API: Missing session_id parameter");
    return new Response("Missing session_id", { status: 400 });
  }

  console.log("Invoice API: Processing session_id", sessionId);

  let session: Stripe.Checkout.Session;
  let lineItems: Stripe.ApiList<Stripe.LineItem>;

  try {
    console.log("Invoice API: Retrieving Stripe session...");
    session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Invoice API: Session retrieved successfully", {
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total
    });
    
    lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 10,
    });
    console.log("Invoice API: Line items retrieved", { count: lineItems.data.length });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Invoice API - Stripe retrieval error:", {
      error: errorMessage,
      sessionId,
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response(
      JSON.stringify({ 
        error: "Failed to retrieve Stripe session", 
        message: errorMessage,
        sessionId 
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  if (session.payment_status !== "paid") {
    console.warn("Invoice API: Payment not confirmed", {
      sessionId,
      payment_status: session.payment_status
    });
    return new Response("Payment not confirmed", { status: 400 });
  }

  console.log("Invoice API: Payment confirmed, generating PDF...");

  const currency = session.currency || "";
  const md = session.metadata ?? {};

  const resortName = md.resortName || "";
  const checkIn = md.checkIn || "";
  const checkOut = md.checkOut || "";
  const nights = md.nights || "";
  const fullName = md.fullName || "";
  const phone = md.phone || "";
  const guests = md.guests || "";

  const bookingMinor = lineItems.data[0]?.amount_total ?? 0;
  const depositMinor = lineItems.data[1]?.amount_total ?? 0;
  const totalMinor = session.amount_total ?? bookingMinor + depositMinor;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  try {
    let logoBytes: Uint8Array | null = null;

    try {
      const origin = req.nextUrl.origin;
      const logoUrl = new URL("/images/logo/logo.png", origin);
      const res = await fetch(logoUrl);
      if (res.ok) logoBytes = new Uint8Array(await res.arrayBuffer());
    } catch {
      // ignore
    }

    if (!logoBytes) {
      const logoPath = path.join(
        process.cwd(),
        "public",
        "images",
        "logo",
        "logo.png"
      );
      logoBytes = await fs.readFile(logoPath);
    }

    const logo = await pdfDoc.embedPng(logoBytes);

    const maxW = 155;
    const scale = maxW / logo.width;
    const dims = logo.scale(scale);
    page.drawImage(logo, {
      x: 595.28 - 50 - dims.width,
      y: 841.89 - 60 - dims.height,
      width: dims.width,
      height: dims.height,
    });
  } catch (err) {
    console.warn("Invoice API: Failed to load logo, continuing without it:", err instanceof Error ? err.message : err);
  }

  const marginX = 50;
  const rightX = 350;
  let y = 790;

  const invoiceNoRaw = session.payment_intent
    ? String(session.payment_intent)
    : session.id;
  const invoiceNo = invoiceNoRaw.slice(-18);

  const issuedAt = new Date((session.created || Math.floor(Date.now() / 1000)) * 1000);
  const dueAt = new Date(issuedAt.getTime() + 24 * 60 * 60 * 1000);

  const customerName = fullName || session.customer_details?.name || "";
  const customerEmail = session.customer_details?.email || "";

  page.drawText("Invoice", {
    x: marginX,
    y,
    size: 26,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  y -= 22;
  page.drawText(`Invoice number ${invoiceNo}`, {
    x: marginX,
    y,
    size: 10,
    font,
    color: rgb(0.25, 0.25, 0.25),
  });

  page.drawText("AMWAJ RESORTS", {
    x: 390,
    y: 792,
    size: 16,
    font: fontBold,
    color: rgb(0.15, 0.35, 0.65),
  });

  y -= 30;
  page.drawLine({
    start: { x: marginX, y },
    end: { x: 545, y },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  y -= 26;
  page.drawText("Date of issue", { x: marginX, y, size: 10, font, color: rgb(0.35, 0.35, 0.35) });
  page.drawText(formatDateForInvoice(issuedAt), { x: marginX + 90, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });

  y -= 16;
  page.drawText("Date due", { x: marginX, y, size: 10, font, color: rgb(0.35, 0.35, 0.35) });
  page.drawText(formatDateForInvoice(dueAt), { x: marginX + 90, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });

  y -= 28;
  page.drawText("amwaj resorts", {
    x: marginX,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 16;
  page.drawText("BAHRAIN - AMWAJ", {
    x: marginX,
    y,
    size: 11,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText("Bill to", {
    x: rightX,
    y: y + 16,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  if (customerName) {
    page.drawText(customerName, {
      x: rightX,
      y,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }
  if (customerEmail) {
    page.drawText(customerEmail, {
      x: rightX,
      y: y - 14,
      size: 10,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
  }

  const dueLineY = y - 58;
  page.drawText(
    `${formatMoneyFromMinor(totalMinor, currency)} due ${formatDateForInvoice(dueAt)}`,
    {
      x: marginX,
      y: dueLineY,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    }
  );
  page.drawText("Pay online", {
    x: marginX,
    y: dueLineY - 16,
    size: 10,
    font,
    color: rgb(0.1, 0.35, 0.85),
  });

  let tableY = dueLineY - 56;
  const tableX = marginX;
  const tableW = 495;

  const colDescX = tableX + 10;
  const colQtyX = tableX + 330;
  const colUnitX = tableX + 390;
  const colAmtX = tableX + 455;

  page.drawLine({
    start: { x: tableX, y: tableY },
    end: { x: tableX + tableW, y: tableY },
    thickness: 1,
    color: rgb(0.15, 0.15, 0.15),
  });
  tableY -= 18;

  page.drawText("Description", { x: colDescX, y: tableY, size: 10, font: fontBold });
  page.drawText("Qty", { x: colQtyX, y: tableY, size: 10, font: fontBold });
  page.drawText("Unit price", { x: colUnitX, y: tableY, size: 10, font: fontBold });
  page.drawText("Amount", { x: colAmtX, y: tableY, size: 10, font: fontBold });
  tableY -= 10;

  page.drawLine({
    start: { x: tableX, y: tableY },
    end: { x: tableX + tableW, y: tableY },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  const rowHeight = 26;
  const drawRow = (desc: string, amountMinor: number) => {
    tableY -= rowHeight;
    page.drawText(desc, { x: colDescX, y: tableY + 10, size: 10, font, color: rgb(0.15, 0.15, 0.15) });
    page.drawText("1", { x: colQtyX + 8, y: tableY + 10, size: 10, font, color: rgb(0.15, 0.15, 0.15) });
    const formatted = formatMoneyFromMinor(amountMinor, currency);
    page.drawText(formatted, { x: colUnitX - 10, y: tableY + 10, size: 10, font, color: rgb(0.15, 0.15, 0.15) });
    page.drawText(formatted, { x: colAmtX - 25, y: tableY + 10, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    page.drawLine({
      start: { x: tableX, y: tableY },
      end: { x: tableX + tableW, y: tableY },
      thickness: 1,
      color: rgb(0.93, 0.93, 0.93),
    });
  };

  const bookingDescParts = [resortName].filter(Boolean);
  const bookingDesc = bookingDescParts.length
    ? bookingDescParts.join(" - ")
    : "Booking";
  drawRow(bookingDesc, bookingMinor);
  drawRow("Security deposit (refundable)", depositMinor);

  const totalsY = tableY - 85;
  const totalsXLabel = tableX + 320;
  const totalsXValue = tableX + 430;

  const subtotalMinor = bookingMinor + depositMinor;
  page.drawText("Subtotal", { x: totalsXLabel, y: totalsY + 40, size: 10, font, color: rgb(0.25, 0.25, 0.25) });
  page.drawText(formatMoneyFromMinor(subtotalMinor, currency), { x: totalsXValue, y: totalsY + 40, size: 10, font, color: rgb(0.1, 0.1, 0.1) });

  page.drawText("Total Amount", { x: totalsXLabel, y: totalsY + 22, size: 10, font, color: rgb(0.25, 0.25, 0.25) });
  page.drawText(formatMoneyFromMinor(totalMinor, currency), { x: totalsXValue, y: totalsY + 22, size: 10, font, color: rgb(0.1, 0.1, 0.1) });

  page.drawText("due", { x: totalsXLabel, y: totalsY + 4, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(formatMoneyFromMinor(totalMinor, currency), { x: totalsXValue, y: totalsY + 4, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  const pdfBytes = await pdfDoc.save();
  
  console.log("Invoice API: PDF generated successfully", {
    sessionId,
    pdfSize: pdfBytes.length,
    disposition: contentDisposition
  });

  return new Response(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${contentDisposition}; filename=invoice-${session.id}.pdf`,
    },
  });
}
