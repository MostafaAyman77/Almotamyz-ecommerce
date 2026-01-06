import ProductCarousel from "@/components/ProductCarousel";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

interface RelatedProductsProps {
    categoryId?: string;
    subcategoryId?: string;
    currentProductId: string;
}

async function getRelatedProducts(categoryId?: string, subcategoryId?: string) {
    try {
        // Prefer subcategory filter, fall back to category
        const queryParam = subcategoryId
            ? `subcategory=${subcategoryId}`
            : categoryId
                ? `category=${categoryId}`
                : "";

        if (!queryParam) {
            return [];
        }

        const res = await fetch(`${BASE_URL}/api/v1/products?${queryParam}&limit=12`, {
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("Failed to fetch related products");
            return [];
        }

        const data = await res.json();
        return data.data || [];
    } catch (error) {
        console.error("Error fetching related products:", error);
        return [];
    }
}

export default async function RelatedProducts({
    categoryId,
    subcategoryId,
    currentProductId,
}: RelatedProductsProps) {
    const products = await getRelatedProducts(categoryId, subcategoryId);

    // Filter out the current product
    const relatedProducts = products.filter(
        (product: any) => product._id !== currentProductId
    );

    if (relatedProducts.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                منتجات ذات صلة
            </h2>
            <ProductCarousel products={relatedProducts} />
        </div>
    );
}
