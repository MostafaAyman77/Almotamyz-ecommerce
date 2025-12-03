import ProductCard from "@/components/ProductCard";

async function getProducts() {
  const res = await fetch("https://dummyjson.com/products");
  return res.json();
}

export default async function ProductsPage() {
  const { products } = await getProducts();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6">
      {products.map((item: any) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
}
