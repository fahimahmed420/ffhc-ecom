export const runtime = "nodejs";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

import { generateOrderId } from "@/utils/orderId";
import { generateInvoiceHTML } from "@/lib/invoice";
import { generatePDF } from "@/lib/pdf";
import { createTransporter } from "@/lib/mail";

// ======================================
// CREATE ORDER
// ======================================
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      items = [],
      customer,
      couponCode = "",
      shipping = 0,
      discount = 0,
      paymentMethod = "COD",
    } = body;

    // ======================================
    // VALIDATION
    // ======================================
    if (!customer?.email) {
      return Response.json(
        {
          success: false,
          message: "Customer email required",
        },
        {
          status: 400,
        }
      );
    }

    if (!items.length) {
      return Response.json(
        {
          success: false,
          message: "No products found",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // DB
    // ======================================
    const client = await clientPromise;

    const db = client.db("ecommerce");

    const productCollection = db.collection("products");

    const orderCollection = db.collection("orders");

    const couponCollection = db.collection("coupons");

    // ======================================
    // VALIDATE PRODUCTS
    // ======================================
    let orderItems = [];

    let subtotal = 0;

    for (const item of items) {
      const rawId = item._id || item.id;

      if (!rawId || !ObjectId.isValid(rawId)) {
        return Response.json(
          {
            success: false,
            message: "Invalid product ID",
          },
          {
            status: 400,
          }
        );
      }

      const productId = new ObjectId(rawId);

      const product = await productCollection.findOne({
        _id: productId,
      });

      if (!product) {
        return Response.json(
          {
            success: false,
            message: "Product not found",
          },
          {
            status: 404,
          }
        );
      }

      const qty = Number(item.qty) || 1;

      if (product.stock < qty) {
        return Response.json(
          {
            success: false,
            message: `Only ${product.stock} left for ${product.title}`,
          },
          {
            status: 400,
          }
        );
      }

      // REAL PRICE FROM DB
      const price =
        product.discountPrice > 0
          ? Number(product.discountPrice)
          : Number(product.price);

      subtotal += price * qty;

      // SAVE SNAPSHOT
      orderItems.push({
        productId: product._id,

        title: product.title,

        thumbnail:
          product.images?.[0] ||
          product.thumbnail ||
          "/fallback.png",

        qty,

        price,

        total: price * qty,
      });
    }

    // ======================================
    // TOTALS
    // ======================================
    const finalShipping = Number(shipping) || 0;

    const finalDiscount = Number(discount) || 0;

    const total = Math.max(
      0,
      subtotal + finalShipping - finalDiscount
    );

    // ======================================
    // CREATE ORDER
    // ======================================
    const orderId = generateOrderId();

    const orderData = {
      orderId,

      customer,

      items: orderItems,

      subtotal,

      shipping: finalShipping,

      discount: finalDiscount,

      total,

      couponCode,

      paymentMethod,

      paymentStatus: "pending",

      status: "pending",

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    // ======================================
    // SAVE ORDER
    // ======================================
    await orderCollection.insertOne(orderData);

    // ======================================
    // REDUCE STOCK
    // ======================================
    for (const item of orderItems) {
      await productCollection.updateOne(
        {
          _id: item.productId,
        },
        {
          $inc: {
            stock: -item.qty,
          },

          $set: {
            updatedAt: new Date(),
          },
        }
      );
    }

    // ======================================
    // UPDATE COUPON USAGE
    // ======================================
    if (couponCode) {
      await couponCollection.updateOne(
        {
          code: couponCode.toUpperCase(),
        },
        {
          $inc: {
            usedCount: 1,
          },
        }
      );
    }

    // ======================================
    // GENERATE PDF
    // ======================================
    const html = await generateInvoiceHTML(orderData);

    const pdfBuffer = await generatePDF(html);

    // ======================================
    // SEND EMAIL
    // ======================================
    try {
      const transporter = createTransporter();

      await transporter.sendMail({
        from: process.env.EMAIL_USER,

        to: customer.email,

        subject: `Order Confirmation - ${orderId}`,

        html: `
          <div style="font-family:sans-serif">
            <h2>Thanks for your order 🎉</h2>

            <p>
              Your order has been placed successfully.
            </p>

            <p>
              <strong>Order ID:</strong> ${orderId}
            </p>

            <p>
              Total: ৳${total}
            </p>
          </div>
        `,

        attachments: [
          {
            filename: `invoice-${orderId}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    } catch (mailError) {
      console.error("MAIL ERROR:", mailError);
    }

    // ======================================
    // SUCCESS
    // ======================================
    return Response.json({
      success: true,

      orderId,

      message: "Order placed successfully, plz check email 🎉",
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);

    return Response.json(
      {
        success: false,
        message: "Server error",
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}