import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ======================================================
// NORMALIZE CATEGORY
// ======================================================
const normalizeCategory = (cat = "") => {
  return cat
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// ======================================================
// GET SINGLE PRODUCT + RELATED PRODUCTS
// ======================================================
export async function GET(req, context) {
  try {
    const { params } = context;

    const { id } = await params;

    // ======================================================
    // VALIDATE ID
    // ======================================================
    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          error: "Invalid product id",
        },
        {
          status: 400,
        },
      );
    }

    // ======================================================
    // DB
    // ======================================================
    const client = await clientPromise;

    const db = client.db("ecommerce");

    const collection = db.collection("products");

    // ======================================================
    // GET PRODUCT
    // ======================================================
    const product = await collection.findOne({
      _id: new ObjectId(id),
    });

    // ======================================================
    // PRODUCT NOT FOUND
    // ======================================================
    if (!product) {
      return Response.json(
        {
          success: false,
          error: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    // ======================================================
    // NORMALIZED CATEGORY
    // ======================================================
    const normalizedCategory = normalizeCategory(product.category);

    // ======================================================
    // RELATED PRODUCTS
    // ======================================================
    let related = await collection
      .find({
        category: normalizedCategory,

        _id: {
          $ne: product._id,
        },
      })
      .sort({
        createdAt: -1,
      })
      .limit(4)
      .toArray();

    // ======================================================
    // FALLBACK PRODUCTS
    // ======================================================
    if (related.length < 4) {
      const existingIds = [
        product._id,
        ...related.map((p) => p._id),
      ];

      const extraProducts = await collection
        .find({
          _id: {
            $nin: existingIds,
          },
        })
        .sort({
          createdAt: -1,
        })
        .limit(4 - related.length)
        .toArray();

      related = [...related, ...extraProducts];
    }

    // ======================================================
    // FORMAT PRODUCT
    // ======================================================
    const formattedProduct = {
      ...product,

      _id: product._id.toString(),
    };

    // ======================================================
    // FORMAT RELATED
    // ======================================================
    const formattedRelated = related.map((p) => ({
      ...p,

      _id: p._id.toString(),
    }));

    // ======================================================
    // RESPONSE
    // ======================================================
    return Response.json(
      {
        success: true,

        product: formattedProduct,

        related: formattedRelated,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (err) {
    console.error("GET /products/[id] error:", err);

    return Response.json(
      {
        success: false,
        error: "Server error",
      },
      {
        status: 500,
      },
    );
  }
}

// ======================================================
// UPDATE PRODUCT
// ======================================================
export async function PUT(req, context) {
  try {
    const { params } = context;

    const { id } = await params;

    // ======================================================
    // VALIDATE ID
    // ======================================================
    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          error: "Invalid product id",
        },
        {
          status: 400,
        },
      );
    }

    // ======================================================
    // BODY
    // ======================================================
    const body = await req.json();

    // ======================================================
    // DB
    // ======================================================
    const client = await clientPromise;

    const db = client.db("ecommerce");

    const collection = db.collection("products");

    // ======================================================
    // UPDATE
    // ======================================================
    const result = await collection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          title: body.title?.trim(),

          description: body.description?.trim(),

          category: normalizeCategory(body.category),

          price: Number(body.price),

          discountPrice: Number(body.discountPrice || 0),

          stock: Number(body.stock || 0),

          rating: Number(body.rating || 0),

          thumbnail:
            body.thumbnail || body.images?.[0] || "",

          images: Array.isArray(body.images)
            ? body.images
            : [],

          availabilityStatus:
            Number(body.stock) > 0
              ? "In Stock"
              : "Out of Stock",

          updatedAt: new Date(),
        },
      },
    );

    // ======================================================
    // NOT FOUND
    // ======================================================
    if (result.matchedCount === 0) {
      return Response.json(
        {
          success: false,
          error: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    // ======================================================
    // RESPONSE
    // ======================================================
    return Response.json(
      {
        success: true,
        message: "Product updated successfully",
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error("PUT /products/[id] error:", err);

    return Response.json(
      {
        success: false,
        error: "Update failed",
      },
      {
        status: 500,
      },
    );
  }
}

// ======================================================
// DELETE PRODUCT
// ======================================================
export async function DELETE(req, context) {
  try {
    const { params } = context;

    const { id } = await params;

    // ======================================================
    // VALIDATE ID
    // ======================================================
    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          error: "Invalid product id",
        },
        {
          status: 400,
        },
      );
    }

    // ======================================================
    // DB
    // ======================================================
    const client = await clientPromise;

    const db = client.db("ecommerce");

    const collection = db.collection("products");

    // ======================================================
    // DELETE
    // ======================================================
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    // ======================================================
    // NOT FOUND
    // ======================================================
    if (result.deletedCount === 0) {
      return Response.json(
        {
          success: false,
          error: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    // ======================================================
    // RESPONSE
    // ======================================================
    return Response.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error("DELETE /products/[id] error:", err);

    return Response.json(
      {
        success: false,
        error: "Delete failed",
      },
      {
        status: 500,
      },
    );
  }
}