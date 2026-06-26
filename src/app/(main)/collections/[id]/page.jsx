import ProductClient from "./ProductClient";
import { getProductData } from "@/lib/getProduct";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getProductData(id);
  const product = data?.product;

  if (!product) return {};

  return {
    title: product.title,
    description: product.description?.slice(0, 155) || `Buy ${product.title} from Family Fashion Hub China`,
    openGraph: {
      title: product.title,
      description: product.description?.slice(0, 155),
      images: product.thumbnail ? [{ url: product.thumbnail }] : [],
    },
  };
}

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