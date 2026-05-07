import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ===============================
// GET PRODUCTS
// ===============================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ===============================
    // QUERY PARAMS
    // ===============================
    const page = parseInt(searchParams.get("page")) || 0;
    const limit = parseInt(searchParams.get("limit")) || 12;

    const category = searchParams.get("category");
    const sort = searchParams.get("sort"); // asc | desc
    const ids = searchParams.get("ids");
    const search = searchParams.get("search");

    // NEW
    const all = searchParams.get("all") === "true";

    const client = await clientPromise;
    const db = client.db("ecommerce");

    const collection = db.collection("products");

    // ===============================
    // 🛒 CART MODE (FETCH BY IDS)
    // ===============================
    if (ids) {
      const idsArray = ids
        .split(",")
        .filter(Boolean)
        .map((id) => {
          try {
            return new ObjectId(id);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      const products = await collection
        .find({
          _id: { $in: idsArray },
        })
        .toArray();

      const formatted = products.map((p) => ({
        ...p,
        _id: p._id.toString(),
      }));

      return Response.json({
        products: formatted,
      });
    }

    // ===============================
    // FILTER QUERY
    // ===============================
    const query = {};

    // CATEGORY FILTER
    if (category && category !== "All") {
      query.category = category;
    }

    // SEARCH
    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ===============================
    // SORTING
    // ===============================
    let sortOption = {
      createdAt: -1,
    };

    if (sort === "asc") {
      sortOption = { price: 1 };
    }

    if (sort === "desc") {
      sortOption = { price: -1 };
    }

    // ===============================
    // BUILD QUERY
    // ===============================
    let cursor = collection.find(query).sort(sortOption);

    // APPLY PAGINATION ONLY IF NOT all=true
    if (!all) {
      cursor = cursor.skip(page * limit).limit(limit);
    }

    const products = await cursor.toArray();

    const total = await collection.countDocuments(query);

    // ===============================
    // FORMAT IDS
    // ===============================
    const formatted = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    // ===============================
    // RESPONSE
    // ===============================
    return Response.json({
      success: true,
      products: formatted,
      total,
      page: all ? null : page,
      limit: all ? null : limit,
      hasMore: all
        ? false
        : page * limit + products.length < total,
    });
  } catch (err) {
    console.error("GET /products error:", err);

    return Response.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

// ===============================
// CREATE PRODUCT
// ===============================
export async function POST(req) {
  try {
    const body = await req.json();

    // ===============================
    // VALIDATION
    // ===============================
    if (!body.title || !body.price) {
      return Response.json(
        {
          error: "Title and price are required",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ecommerce");

    const collection = db.collection("products");

    const newProduct = {
      title: body.title,
      price: Number(body.price),
      discountPrice: Number(body.discountPrice) || 0,
      category: body.category || "General",

      images: Array.isArray(body.images)
        ? body.images
        : [],

      thumbnail:
        body.thumbnail ||
        (Array.isArray(body.images) &&
        body.images.length > 0
          ? body.images[0]
          : ""),

      stock: Number(body.stock) || 0,
      rating: Number(body.rating) || 0,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newProduct);

    return Response.json({
      success: true,
      insertedId: result.insertedId.toString(),
    });
  } catch (err) {
    console.error("POST /products error:", err);

    return Response.json(
      {
        success: false,
        error: "Failed to create product",
      },
      { status: 500 }
    );
  }
}