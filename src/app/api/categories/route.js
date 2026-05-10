import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");

    const client = await clientPromise;
    const db = client.db("ecommerce");
    const collection = db.collection("products");

    // ======================================================
    // ✅ FILTER CLEAN DATA
    // ======================================================
    const validCategoryFilter = {
      category: {
        $exists: true,
        $nin: ["", "General", null],
      },
    };

    // ======================================================
    // ⚡ AGGREGATION WITH NORMALIZATION
    // ======================================================
    const categories = await collection
      .aggregate([
        { $match: validCategoryFilter },

        {
          $addFields: {
            normalized: {
              $toLower: { $trim: { input: "$category" } },
            },
          },
        },

        {
          $group: {
            _id: "$normalized",
            count: { $sum: 1 },
            name: { $first: "$category" },
          },
        },

        {
          $project: {
            _id: 0,
            name: {
              $concat: [
                { $toUpper: { $substrCP: ["$name", 0, 1] } },
                {
                  $substrCP: [
                    "$name",
                    1,
                    { $strLenCP: "$name" },
                  ],
                },
              ],
            },
            count: 1,
          },
        },

        { $sort: { name: 1 } },
      ])
      .toArray();

    // ======================================================
    // ✅ TOTAL COUNT
    // ======================================================
    const total = await collection.countDocuments(
      validCategoryFilter
    );

    // ======================================================
    // 🏠 HOME MODE
    // ======================================================
    if (mode === "home") {
      const fixedOrder = [
        "Glamour & Beauty",
        "Intimate & Personal Care",
        "Auto Parts",
        "Fashion",
        "Tools & Hardware",
        "Stationery",
        "Mother & Baby",
        "Travel & Accessories",
        "Home & Kitchen",
      ];

      const ordered = fixedOrder.map((name) => {
        const found = categories.find(
          (c) =>
            c.name.toLowerCase() ===
            name.toLowerCase()
        );

        return {
          name,
          count: found?.count || 0,
        };
      });

      return Response.json(
        { categories: ordered },
        {
          headers: {
            // ⚡ CACHE (MAIN UPGRADE)
            "Cache-Control":
              "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // ======================================================
    // 📦 FULL MODE
    // ======================================================
    return Response.json(
      {
        categories: [
          { name: "All", count: total },
          ...categories,
        ],
      },
      {
        headers: {
          // ⚡ CACHE
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    console.error("Category API error:", err);

    return Response.json(
      {
        success: false,
        error: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}