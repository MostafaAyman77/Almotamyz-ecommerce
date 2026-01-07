import ProductCard from "@/components/ProductCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

async function getProducts() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/products`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { data: [] };
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return { data: [] };
  }
}

export default async function ProductsPage() {
  const { data: products } = await getProducts();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6">
      {products && products.length > 0 ? (
        products.map((item: any) => (
          <ProductCard key={item._id} item={item} />
        ))
      ) : (
        <div className="col-span-full text-center py-10 text-gray-500">
          لا توجد منتجات حالياً
        </div>
      )}
    </div>
  );
}
