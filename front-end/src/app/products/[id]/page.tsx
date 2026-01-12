import { notFound } from "next/navigation";
import Image from "next/image";
import RelatedProducts from "@/components/RelatedProducts";
import AddToCartButton from "@/app/products/[id]/AddToCartButton";
import ProductImageGallery from "@/app/products/[id]/ProductImageGallery";
import { FaStar } from "react-icons/fa";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

interface Product {
    _id: string;
    title: string;
    slug: string;
    description: string;
    quantity: number;
    price: number;
    priceAfterDiscount?: number;
    imageCover?: string;
    images?: string[];
    category?: { _id: string; name: string };
    subcategory?: { _id: string; name: string } | string;
    brand?: { _id: string; name: string } | string;
    ratingsAverage?: number;
    ratingsQuantity?: number;
    createdAt: string;
}

async function getProduct(id: string): Promise<Product | null> {
    try {
        const res = await fetch(`${BASE_URL}/api/v1/products/${id}`, {
            cache: "no-store",
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const displayPrice = product.priceAfterDiscount || product.price;
    const hasDiscount = product.priceAfterDiscount && product.priceAfterDiscount < product.price;
    const allImages = [product.imageCover, ...(product.images || [])].filter(Boolean) as string[];

    // Extract category and subcategory IDs
    const categoryId = typeof product.category === "object" ? product.category?._id : product.category;
    const subcategoryId = typeof product.subcategory === "object" ? product.subcategory?._id : product.subcategory;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Product Details Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        {/* Left Side - Images */}
                        <ProductImageGallery images={allImages} title={product.title} />

                        {/* Right Side - Product Info */}
                        <div className="space-y-6">
                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

                            {/* Rating */}
                            {product.ratingsAverage && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={
                                                    i < Math.floor(product.ratingsAverage || 0)
                                                        ? "text-yellow-400"
                                                        : "text-gray-300"
                                                }
                                                size={20}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        ({product.ratingsQuantity || 0} تقييم)
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-green-600">
                                    {displayPrice} ج.م
                                </span>
                                {hasDiscount && (
                                    <span className="text-xl text-gray-400 line-through">
                                        {product.price} ج.م
                                    </span>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div>
                                {product.quantity > 0 ? (
                                    <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                                        متوفر في المخزون ({product.quantity} قطعة)
                                    </span>
                                ) : (
                                    <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">
                                        غير متوفر حالياً
                                    </span>
                                )}
                            </div>

                            {/* Category & Brand */}
                            <div className="space-y-2 border-t border-b border-gray-200 py-4">
                                {product.category && typeof product.category === "object" && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 font-medium">الفئة:</span>
                                        <span className="text-gray-800">{product.category.name}</span>
                                    </div>
                                )}
                                {product.subcategory && typeof product.subcategory === "object" && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 font-medium">الفئة الفرعية:</span>
                                        <span className="text-gray-800">{product.subcategory.name}</span>
                                    </div>
                                )}
                                {product.brand && typeof product.brand === "object" && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 font-medium">العلامة التجارية:</span>
                                        <span className="text-gray-800">{product.brand.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">الوصف</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </div>

                            {/* Add to Cart Button */}
                            <AddToCartButton product={product} />
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                <RelatedProducts
                    categoryId={categoryId}
                    subcategoryId={subcategoryId}
                    currentProductId={product._id}
                />
            </div>
        </div>
    );
}
