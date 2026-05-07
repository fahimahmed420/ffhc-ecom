import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ================= GET SINGLE PRODUCT =================
export async function GET(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    console.log("👉 GET product:", id);

    if (!ObjectId.isValid(id)) {
      return Response.json(
        { error: "Invalid product id" },
        { status: 400 }
      );
    }

    const db = (await clientPromise).db("ecommerce");

    const product = await db.collection("products").findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const related = await db
      .collection("products")
      .find({
        category: product.category,
        _id: { $ne: product._id },
      })
      .limit(4)
      .toArray();

    return Response.json({
      product: {
        ...product,
        _id: product._id.toString(),
      },
      related: related.map((p) => ({
        ...p,
        _id: p._id.toString(),
      })),
    });
  } catch (err) {
    console.error("GET error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// ================= UPDATE PRODUCT =================
export async function PUT(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    console.log("👉 PUT request received:", id);

    const body = await req.json();
    console.log("📦 Body:", body);

    if (!ObjectId.isValid(id)) {
      console.log("❌ Invalid ID:", id);
      return Response.json(
        { error: "Invalid product id" },
        { status: 400 }
      );
    }

    const db = (await clientPromise).db("ecommerce");

    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          price: Number(body.price),
          discountPrice: Number(body.discountPrice || 0),
          stock: Number(body.stock || 0),
          updatedAt: new Date(),
        },
      }
    );

    console.log("📊 Mongo result:", result);

    if (result.matchedCount === 0) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (err) {
    console.error("PUT error:", err);
    return Response.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

// ================= DELETE PRODUCT =================
export async function DELETE(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    console.log("🗑 DELETE request:", id);

    if (!ObjectId.isValid(id)) {
      return Response.json(
        { error: "Invalid product id" },
        { status: 400 }
      );
    }

    const db = (await clientPromise).db("ecommerce");

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(id),
    });

    console.log("📊 Delete result:", result);

    if (result.deletedCount === 0) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Product deleted",
    });
  } catch (err) {
    console.error("DELETE error:", err);
    return Response.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}