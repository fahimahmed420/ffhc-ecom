export const runtime = "nodejs";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

import { generateOrderId } from "@/utils/orderId";
import { generateInvoiceHTML } from "@/lib/invoice";
import { generatePDF } from "@/lib/pdf";
import { createTransporter } from "@/lib/mail";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body?.customer?.email) {
      return Response.json(
        { success: false, message: "Email required" },
        { status: 400 }
      );
    }

    const db = (await clientPromise).db("ecommerce");

    // ===============================
    // 1. CHECK + REDUCE STOCK FIRST
    // ===============================
    const items = body.items || [];

    for (const item of items) {
      const productId = new ObjectId(item.id);
      const qty = Number(item.qty);

      const product = await db.collection("products").findOne({
        _id: productId,
      });

      if (!product) {
        return Response.json(
          { success: false, message: "Product not found" },
          { status: 404 }
        );
      }

      if (product.stock < qty) {
        return Response.json(
          {
            success: false,
            message: `Not enough stock for ${product.title}`,
          },
          { status: 400 }
        );
      }

      // 🔥 REDUCE STOCK
      await db.collection("products").updateOne(
        { _id: productId },
        {
          $inc: { stock: -qty },
          $set: { updatedAt: new Date() },
        }
      );
    }

    // ===============================
    // 2. ORDER ID
    // ===============================
    body.orderId = generateOrderId();

    // ===============================
    // 3. INVOICE
    // ===============================
    const html = await generateInvoiceHTML(body);
    const pdfBuffer = await generatePDF(html);

    // ===============================
    // 4. EMAIL
    // ===============================
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: body.customer.email,
      subject: `Order Confirmation - ${body.orderId}`,
      html: `
        <h2>Thanks for your order!</h2>
        <p>Order ID: ${body.orderId}</p>
        <p>We are processing your order now.</p>
      `,
      attachments: [
        {
          filename: `invoice-${body.orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return Response.json({
      success: true,
      orderId: body.orderId,
      message: "Order placed successfully",
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);

    return Response.json(
      {
        success: false,
        message: "Server error",
        error: err.message,
      },
      { status: 500 }
    );
  }
}