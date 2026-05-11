import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// =====================================
// VALIDATE COUPON
// =====================================
export async function POST(req) {
  try {
    const body = await req.json();

    const { code, items } = body;

    // ===============================
    // VALIDATION
    // ===============================
    if (!code) {
      return Response.json(
        {
          success: false,
          error: "Coupon code is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Cart items are required",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // DB
    // ===============================
    const client = await clientPromise;

    const db = client.db("ecommerce");

    const couponCollection = db.collection("coupons");

    const productCollection = db.collection("products");

    // ===============================
    // FIND COUPON
    // ===============================
    const coupon = await couponCollection.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return Response.json(
        {
          success: false,
          error: "Invalid coupon",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // EXPIRY CHECK
    // ===============================
    if (
      coupon.expiryDate &&
      new Date(coupon.expiryDate) < new Date()
    ) {
      return Response.json(
        {
          success: false,
          error: "Coupon expired",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // USAGE LIMIT CHECK
    // ===============================
    if (
      coupon.usageLimit &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return Response.json(
        {
          success: false,
          error: "Coupon usage limit reached",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // CALCULATE CART TOTAL
    // ===============================
    let cartTotal = 0;

    for (const item of items) {
      try {
        const productId = item._id || item.id;

        if (!productId || !ObjectId.isValid(productId)) {
          continue;
        }

        const product = await productCollection.findOne({
          _id: new ObjectId(productId),
        });

        if (!product) continue;

        const qty = Number(item.qty) || 1;

        const price =
          product.discountPrice > 0
            ? Number(product.discountPrice)
            : Number(product.price);

        cartTotal += price * qty;
      } catch (err) {
        console.error("Item validation error:", err);
      }
    }

    // ===============================
    // EMPTY CART CHECK
    // ===============================
    if (cartTotal <= 0) {
      return Response.json(
        {
          success: false,
          error: "Invalid cart",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // MIN PURCHASE CHECK
    // ===============================
    if (
      coupon.minPurchase &&
      cartTotal < Number(coupon.minPurchase)
    ) {
      return Response.json(
        {
          success: false,
          error: `Minimum purchase is ৳${coupon.minPurchase}`,
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // CALCULATE DISCOUNT
    // ===============================
    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount =
        (cartTotal * Number(coupon.discountValue)) / 100;

      // MAX DISCOUNT
      if (coupon.maxDiscount) {
        discount = Math.min(
          discount,
          Number(coupon.maxDiscount)
        );
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    // NEVER EXCEED TOTAL
    discount = Math.min(discount, cartTotal);

    // ROUND
    discount = Math.round(discount);

    // ===============================
    // SUCCESS
    // ===============================
    return Response.json({
      success: true,
      discount,
      cartTotal,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (err) {
    console.error("POST /api/coupons/validate error:", err);

    return Response.json(
      {
        success: false,
        error: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}