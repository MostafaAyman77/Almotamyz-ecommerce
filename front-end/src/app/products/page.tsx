import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters/ProductFilters";
import Pagination from "@/components/Pagination/Pagination";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

async function getProducts(queryString: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/products?${queryString}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { data: [], paginationResult: { currentPage: 1, numberOfPages: 0 } };
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return { data: [], paginationResult: { currentPage: 1, numberOfPages: 0 } };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;

  // Construct query string from searchParams
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.append(key, value);
  });

  // Default limit if not provided
  if (!query.has("limit")) query.append("limit", "12");

  const response = await getProducts(query.toString());
  const products = response.data || [];
  const paginationResult = response.pagination;

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 border-r-4 border-[var(--primary-color)] pr-4">
        استعرض منتجاتنا
      </h1>

      <ProductFilters />

      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((item: any) => (
              <ProductCard key={item._id} item={item} />
            ))}
          </div>

          {paginationResult && <Pagination metadata={paginationResult} />}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border py-20 text-center">
          <p className="text-xl text-gray-500 mb-4">لا توجد منتجات تطابق اختياراتك حالياً</p>
          <button
            className="text-[var(--primary-color)] font-bold hover:underline"
          // This button could clear filters but for now just a message
          >
            جرب تغيير معايير البحث
          </button>
        </div>
      )}
    </div>
  );
}

