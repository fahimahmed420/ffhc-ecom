// src/app/api/products/[id]/review/route.js
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Simple in-memory rate limit: max 3 reviews per IP per hour
const reviewRateLimit = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxPerWindow = 3;

  const entry = reviewRateLimit.get(ip) || { count: 0, start: now };

  if (now - entry.start > windowMs) {
    reviewRateLimit.set(ip, { count: 1, start: now });
    return false;
  }

  if (entry.count >= maxPerWindow) return true;

  reviewRateLimit.set(ip, { ...entry, count: entry.count + 1 });
  return false;
}

export async function POST(req, context) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many reviews. Please try again later." }),
        { status: 429 },
      );
    }

    const params = await context.params;
    const id = params.id;

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid product ID" }), { status: 400 });
    }

    const body = await req.json();
    const { name, rating, comment, email } = body;

    if (!name?.trim() || !comment?.trim() || !rating) {
      return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ecommerce");

    // ✅ Make sure the product exists
    const product = await db.collection("products").findOne({ _id: new ObjectId(id) });
    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
    }

    const newReview = {
      name,
      email: email || "",
      rating,
      comment,
      date: new Date().toISOString(),
    };

    // ✅ Use updateOne instead of findOneAndUpdate to avoid undefined result.value issues
    await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $push: { reviews: newReview } }
    );

    // ✅ Fetch the updated product to return reviews
    const updatedProduct = await db.collection("products").findOne({ _id: new ObjectId(id) });

    return new Response(
      JSON.stringify({ success: true, reviews: updatedProduct.reviews || [] }),
      { status: 200 }
    );
  } catch (err) {
    console.error("POST Review Error:", err);
    return new Response(JSON.stringify({ error: "Failed to add review" }), { status: 500 });
  }
}