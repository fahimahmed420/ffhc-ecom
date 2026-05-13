import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getProductData(id) {
  const client = await clientPromise;
  const db = client.db("ecommerce");

  const product = await db.collection("products").findOne({
    _id: new ObjectId(id),
  });

  if (!product) return null;

  const related = await db
    .collection("products")
    .find({
      category: product.category,
      _id: { $ne: product._id },
    })
    .limit(8)
    .toArray();

  return {
    product: JSON.parse(JSON.stringify(product)),
    related: JSON.parse(JSON.stringify(related)),
  };
}