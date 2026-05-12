import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ======================================================
// GET PRODUCTS
// ======================================================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ======================================================
    // QUERY PARAMS
    // ======================================================
    const page = Math.max(Number(searchParams.get("page")) || 0, 0);

    const limit = Math.min(Number(searchParams.get("limit")) || 12, 50);

    const category = searchParams.get("category");
    const sort = searchParams.get("sort");
    const ids = searchParams.get("ids");
    const search = searchParams.get("search")?.trim();
    const all = searchParams.get("all") === "true";
    const minimal = searchParams.get("minimal") === "true";

    // ======================================================
    // DB
    // ======================================================
    const client = await clientPromise;

    const db = client.db("ecommerce");

    const collection = db.collection("products");

    // ======================================================
    // FETCH BY IDS
    // ======================================================
    if (ids) {
      const idsArray = ids
        .split(",")
        .map((id) => id.trim())
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

      if (!idsArray.length) {
        return Response.json({
          success: true,
          products: [],
        });
      }

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
        success: true,
        products: formatted,
      });
    }

    // ======================================================
    // QUERY
    // ======================================================
    const query = {};

    // CATEGORY
    if (category && category !== "All") {
      query.category = {
        $regex: `^${category.trim()}$`,
        $options: "i",
      };
    }

    // ======================================================
    // SEARCH
    // ======================================================
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
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ======================================================
    // SORTING
    // ======================================================
    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "asc":
        sortOption = { price: 1, _id: 1 };
        break;

      case "desc":
        sortOption = { price: -1, _id: -1 };
        break;

      case "rating":
        sortOption = { rating: -1, _id: -1 };
        break;

      case "popular":
        sortOption = { reviewsCount: -1, _id: -1 };
        break;

      default:
        sortOption = { createdAt: -1, _id: -1 };
    }

    // ======================================================
    // PROJECTION
    // ======================================================
    const projection = minimal
      ? {
          title: 1,
          thumbnail: 1,
          category: 1,
          price: 1,
        }
      : {};

    // ======================================================
    // CURSOR
    // ======================================================
    let cursor = collection
      .find(query, {
        projection,
      })
      .sort(sortOption);

    // ======================================================
    // PAGINATION
    // ======================================================
    if (!all) {
      cursor = cursor.skip(page * limit).limit(limit + 1);
    }

    // ======================================================
    // FETCH
    // ======================================================
    const products = await cursor.toArray();

    // ======================================================
    // HAS MORE
    // ======================================================
    const hasMore = !all && products.length > limit;

    const slicedProducts = hasMore ? products.slice(0, limit) : products;

    // ======================================================
    // FORMAT
    // ======================================================
    const formatted = slicedProducts.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    // ======================================================
    // RESPONSE
    // ======================================================
    return Response.json(
      {
        success: true,
        products: formatted,
        page: all ? null : page,
        limit: all ? null : limit,
        hasMore,
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
    console.error("GET /products error:", err);

    return Response.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      {
        status: 500,
      },
    );
  }
}

// ======================================================
// CREATE PRODUCT
// ======================================================
export async function POST(req) {
  try {
    const body = await req.json();

    // ======================================================
    // VALIDATION
    // ======================================================
    if (!body.title || !body.price) {
      return Response.json(
        {
          success: false,
          error: "Title and price are required",
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
    // NORMALIZE CATEGORY
    // ======================================================
    const normalizeCategory = (cat) => {
      if (!cat) return "";

      return cat
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    // ======================================================
    // PRODUCT
    // ======================================================
    const newProduct = {
      title: body.title.trim(),

      description: body.description?.trim() || "",

      category: normalizeCategory(body.category),

      price: Number(body.price),

      discountPrice: Number(body.discountPrice) || 0,

      stock: Number(body.stock) || 0,

      rating: Number(body.rating) || 0,

      reviewsCount: 0,

      images: Array.isArray(body.images) ? body.images : [],

      thumbnail: body.thumbnail || body.images?.[0] || "",

      availabilityStatus:
        Number(body.stock) > 0 ? "In Stock" : "Out of Stock",

      reviews: [],

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    // ======================================================
    // INSERT
    // ======================================================
    const result = await collection.insertOne(newProduct);

    return Response.json(
      {
        success: true,
        insertedId: result.insertedId.toString(),
      },
      {
        status: 201,
      },
    );
  } catch (err) {
    console.error("POST /products error:", err);

    return Response.json(
      {
        success: false,
        error: "Failed to create product",
      },
      {
        status: 500,
      },
    );
  }
}