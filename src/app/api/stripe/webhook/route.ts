import Stripe from "stripe";
import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion intentionally omitted to match the installed Stripe SDK types
});

async function generateInvoicePdf(opts: {
  session: Stripe.Checkout.Session;
  bookingMinor: number;
  depositMinor: number;
  totalMinor: number;
  currency: string;
  origin?: string;
}) {
  const { session, bookingMinor, depositMinor, totalMinor, currency, origin } = opts;
  const md = session.metadata ?? {};

  const resortName = md.resortName || "";
  const checkIn = md.checkIn || "";
  const checkOut = md.checkOut || "";
  const nights = md.nights || "";
  const fullName = md.fullName || "";
  const phone = md.phone || "";
  const guests = md.guests || "";

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  try {
    let logoBytes: Uint8Array | null = null;

    if (origin) {
      try {
        const logoUrl = new URL("/images/logo/logo.png", origin);
        const res = await fetch(logoUrl);
        if (res.ok) logoBytes = new Uint8Array(await res.arrayBuffer());
      } catch {
        // ignore
      }
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
  } catch {
    // ignore
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
  const bookingDesc = bookingDescParts.length ? bookingDescParts.join(" - ") : "Booking";
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
  return Buffer.from(pdfBytes);
}

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

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!webhookSecret) {
    return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("Ignored", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return new Response("Not paid", { status: 200 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "").trim();
  const emailFrom = (process.env.EMAIL_FROM || "").trim();
  const replyToEnv = (process.env.REPLY_TO || "").trim();
  const appPassword = (process.env.EMAIL_APP_PASSWORD || "").trim();
  const smtpHost = (process.env.EMAIL_SERVER_HOST || "").trim();
  const smtpPort = Number(process.env.EMAIL_SERVER_PORT || 0);
  const smtpUser = (process.env.EMAIL_SERVER_USER || "").trim();
  const smtpPass = (process.env.EMAIL_SERVER_PASSWORD || "").trim();

  if (!adminEmails || !emailFrom) {
    return new Response("Missing email configuration", { status: 500 });
  }

  const recipients = adminEmails
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const replyTo = replyToEnv || recipients[0] || "";

  if (!recipients.length) {
    return new Response("No recipients", { status: 500 });
  }

  const currency = session.currency || "";
  const md = session.metadata ?? {};

  const resortName = md.resortName || "";
  const checkIn = md.checkIn || "";
  const checkOut = md.checkOut || "";
  const nights = md.nights || "";
  const fullName = md.fullName || "";
  const phone = md.phone || "";
  const guests = md.guests || "";
  const deposit = md.deposit || "";

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 10,
  });

  const bookingMinor = lineItems.data[0]?.amount_total ?? 0;
  const depositMinor = lineItems.data[1]?.amount_total ?? 0;
  const totalMinor = session.amount_total ?? bookingMinor + depositMinor;

  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
  const forwardedHost =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const inferredOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : (process.env.NEXT_PUBLIC_SITE_URL || "").trim();

  const smtpConfigured =
    Boolean(smtpHost) &&
    Boolean(smtpPort) &&
    Boolean(smtpUser) &&
    Boolean(smtpPass) &&
    smtpPass !== "your_resend_api_key";

  const gmailConfigured = Boolean(appPassword);

  if (!smtpConfigured && !gmailConfigured) {
    return new Response(
      "Missing SMTP config (Resend) and EMAIL_APP_PASSWORD (Gmail). Configure one.",
      { status: 500 }
    );
  }

  const transport = smtpConfigured
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    : nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailFrom,
          pass: appPassword,
        },
      });

  const customerEmail = session.customer_details?.email || "";

  const subject = `حجز جديد مدفوع - ${resortName || "Amwaj Resorts"} (${session.id})`;

  const text =
    `تم تأكيد عملية الدفع بنجاح.\n\n` +
    `الشاليه: ${resortName}\n` +
    `الدخول: ${checkIn}\n` +
    `الخروج: ${checkOut}\n` +
    (nights ? `الليالي: ${nights}\n` : "") +
    (guests ? `الضيوف: ${guests}\n` : "") +
    `\n` +
    (fullName ? `الاسم: ${fullName}\n` : "") +
    (phone ? `الهاتف: ${phone}\n` : "") +
    (customerEmail ? `البريد: ${customerEmail}\n` : "") +
    `\n` +
    `رصيد المؤجر (قيمة الحجز): ${formatMoneyFromMinor(bookingMinor, currency)}\n` +
    `مبلغ التأمين (يرجع للضيف): ${formatMoneyFromMinor(depositMinor, currency)}${deposit ? ` (مذكور: ${deposit})` : ""}\n` +
    `الإجمالي: ${formatMoneyFromMinor(totalMinor, currency)}\n` +
    `\n` +
    `رقم العملية: ${session.id}\n`;

  try {
    console.log("Webhook: Attempting to send admin notification email...", {
      from: emailFrom,
      to: recipients,
      smtpConfigured,
      gmailConfigured,
    });

    await transport.sendMail({
      from: emailFrom,
      replyTo: replyTo || undefined,
      to: recipients,
      subject,
      text,
    });

    console.log("Webhook: Admin email sent successfully");

    if (customerEmail) {
      console.log("Webhook: Generating invoice PDF for customer:", customerEmail);
      
      const pdfBuffer = await generateInvoicePdf({
        session,
        bookingMinor,
        depositMinor,
        totalMinor,
        currency,
        origin: inferredOrigin || undefined,
      });

      console.log("Webhook: Invoice PDF generated, sending to customer...");

      await transport.sendMail({
        from: emailFrom,
        replyTo: replyTo || undefined,
        to: customerEmail,
        subject: `فاتورة الحجز - ${resortName || "Amwaj Resorts"}`,
        text:
          `شكراً لك، تم تأكيد عملية الدفع بنجاح.\n` +
          `تم إرفاق الفاتورة بصيغة PDF.\n\n` +
          `رقم العملية: ${session.id}\n`,
        attachments: [
          {
            filename: `invoice-${session.id}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      console.log("Webhook: Customer invoice email sent successfully");
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook: Email send failed:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      smtpConfig: {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        hasPassword: Boolean(smtpPass),
      },
      gmailConfig: {
        hasAppPassword: Boolean(appPassword),
      },
    });
    // Return 200 to prevent Stripe retries, but log the error
    return new Response(
      JSON.stringify({ 
        status: "payment_confirmed_but_email_failed", 
        error: errorMessage,
        sessionId: session.id 
      }), 
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  return new Response("OK", { status: 200 });
}
