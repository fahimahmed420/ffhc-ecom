import clientPromise from "@/lib/mongodb";

// ===============================
// CREATE COUPON
// ===============================
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate,
    } = body;

    // =========================
    // VALIDATION
    // =========================
    if (!code || !discountValue) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ecommerce");
    const collection = db.collection("coupons");

    // =========================
    // DUPLICATE CHECK
    // =========================
    const existing = await collection.findOne({
      code: code.toUpperCase(),
    });

    if (existing) {
      return Response.json(
        { success: false, error: "Coupon already exists" },
        { status: 400 }
      );
    }

    // =========================
    // CREATE COUPON
    // =========================
    const newCoupon = {
      code: code.toUpperCase(),
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isActive: true,
      usedCount: 0,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(newCoupon);

    return Response.json({
      success: true,
      message: "Coupon created successfully",
    });
  } catch (err) {
    console.error("POST /coupons error:", err);

    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}