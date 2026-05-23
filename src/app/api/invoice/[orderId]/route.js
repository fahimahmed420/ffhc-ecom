export const runtime = "nodejs";

import clientPromise from "@/lib/mongodb";

import { generateInvoiceHTML } from "@/lib/invoice";

// ======================================================
// GET INVOICE
// ======================================================
export async function GET(req, { params }) {
  try {
    // ======================================================
    // FIX FOR NEW NEXT.JS
    // ======================================================
    const { orderId } = await params;

    // ======================================================
    // VALIDATION
    // ======================================================
    if (!orderId) {
      return new Response("Invalid order ID", {
        status: 400,
      });
    }

    const client = await clientPromise;

    const db = client.db("ecommerce");

    // ======================================================
    // FIND ORDER
    // ======================================================
    const order = await db
      .collection("orders")
      .findOne({
        orderId,
      });

    if (!order) {
      return new Response("Order not found", {
        status: 404,
      });
    }

    // ======================================================
    // GENERATE HTML
    // ======================================================
    const html =
      await generateInvoiceHTML(order);

    // ======================================================
    // RETURN HTML
    // ======================================================
    return new Response(html, {
      status: 200,

      headers: {
        "Content-Type":
          "text/html; charset=utf-8",
      },
    });
  } catch (err) {
    console.error(
      "INVOICE ROUTE ERROR:",
      err,
    );

    return new Response(
      "Failed to generate invoice",
      {
        status: 500,
      },
    );
  }
}