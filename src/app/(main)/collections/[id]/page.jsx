import ProductClient from "./ProductClient";
import { getProductData } from "@/lib/getProduct";

export const revalidate = 60;

export default async function Page({ params }) {
  const { id } = await params;

  if (!id) {
    return (
      <p className="text-center mt-20 text-gray-500">
        Invalid product id
      </p>
    );
  }

  const data = await getProductData(id);

  if (!data?.product) {
    return (
      <p className="text-center mt-20 text-gray-500">
        Product not found
      </p>
    );
  }

  return <ProductClient initialData={data} />;
}