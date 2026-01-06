"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { addToCart, addToFavorite, removeFromFavorites } from "@/store/slices/cartSlice";
import { FaShoppingCart, FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Product {
    _id: string;
    title: string;
    price: number;
    priceAfterDiscount?: number;
    imageCover?: string;
    images?: string[];
    quantity: number;
}

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.cartItems);
    const favorites = useSelector((state: RootState) => state.cart.favorites);

    const isInCart = cartItems.some((item) => item.id === product._id);
    const isFavorite = favorites.some((item) => item.id === product._id);

    const handleAddToCart = () => {
        if (isInCart) return;

        const cartItem = {
            id: product._id,
            title: product.title,
            price: product.priceAfterDiscount || product.price,
            images: product.images || [product.imageCover || ""],
            thumbnail: product.imageCover,
        };

        dispatch(addToCart(cartItem));
        toast.success(
            <div className="toast-wrapper">
                <img className="toast-image" src={product.imageCover} alt="" />
                <div className="toast-content">
                    <strong>{product.title}</strong>
                    تمت إضافتها إلى العربة
                    <div>
                        <Link href="/cart">
                            <button
                                className="flex items-center justify-center text-white px-8 py-3 font-semibold rounded-xl border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                                style={{ backgroundColor: "var(--primary-color)", cursor: "pointer" }}
                            >
                                اعرض العربة
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    const handleFavorite = () => {
        const favoriteItem = {
            id: product._id,
            title: product.title,
            price: product.priceAfterDiscount || product.price,
            images: product.images || [product.imageCover || ""],
            thumbnail: product.imageCover,
        };

        if (isFavorite) {
            dispatch(removeFromFavorites(product._id));
            toast.error(`${product.title} تم إزالته من المفضلة`);
        } else {
            dispatch(addToFavorite(favoriteItem));
            toast.success(`${product.title} تمت إضافته للمفضلة`);
        }
    };

    return (
        <div className="space-y-3">
            {/* Add to Cart Button */}
            <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0 || isInCart}
                className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-200 ${isInCart
                        ? "bg-gray-400 cursor-not-allowed opacity-60"
                        : product.quantity === 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                    }`}
                style={{ cursor: product.quantity === 0 || isInCart ? "not-allowed" : "pointer" }}
            >
                <FaShoppingCart size={20} />
                <span>
                    {isInCart
                        ? "مضاف بالفعل للعربة"
                        : product.quantity === 0
                            ? "غير متوفر"
                            : "أضف إلى العربة"}
                </span>
            </button>

            {/* Add to Favorites Button */}
            <button
                onClick={handleFavorite}
                className="w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 border-2 border-gray-300 hover:border-red-500 transition-all duration-200 bg-white"
                style={{ cursor: "pointer" }}
            >
                {isFavorite ? (
                    <>
                        <FaHeart className="text-red-500" size={20} />
                        <span className="text-red-500">إزالة من المفضلة</span>
                    </>
                ) : (
                    <>
                        <FaRegHeart className="text-gray-700" size={20} />
                        <span className="text-gray-700">أضف إلى المفضلة</span>
                    </>
                )}
            </button>
        </div>
    );
}
