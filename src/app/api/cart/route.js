import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ================= GET CART =================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ success: false, error: "No userId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ecommerce");
    const collection = db.collection("carts");

    const cart = await collection.findOne({ userId });

    return Response.json({
      success: true,
      cart: cart?.items || [],
    });
  } catch (err) {
    console.error("GET CART ERROR:", err);
    return Response.json({ success: false }, { status: 500 });
  }
}

// ================= SAVE CART =================
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, items } = body;

    if (!userId) {
      return Response.json({ success: false, error: "No userId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ecommerce");
    const collection = db.collection("carts");

    await collection.updateOne(
      { userId },
      {
        $set: {
          items,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("SAVE CART ERROR:", err);
    return Response.json({ success: false }, { status: 500 });
  }
}