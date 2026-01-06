"use client";

import {
  addToCart,
  addToFavorite,
  removeFromFavorites,
} from "@/store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { FaRegHeart, FaHeart, FaShoppingCart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function ProductCard({ item }: any) {
  const dispatch = useDispatch();
  const router = useRouter();

  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const isInCart = cartItems.some((i) => i.id === item.id);


  const favorites = useSelector((state: RootState) => state.cart.favorites);
  const isFavorite = favorites.some((i) => i.id === item.id);

  // 🛒 Add to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInCart) return;
    dispatch(addToCart(item));
    toast.success(
      <div className="toast-wrapper">
        <img className='toast-image' src={item.images[0]} alt="" />
        <div className="toast-content">
          <strong>{item.title}</strong>
          تمت إضافتها إلى العربة
          <div>
            <Link href="/cart">
              <button
                className={`flex items-center justify-center text-white px-8 py-3 font-semibold rounded-xl border border-gray-300 bg-white text-gray-900 hover:bg-gray-50`}
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

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isFavorite) {
      dispatch(removeFromFavorites(item.id));
      toast.error(`${item.title} removed from favorites`);
    } else {
      dispatch(addToFavorite(item));
      toast.success(`${item.title} added to favorites`);
    }
  };

  return (
    <div
      onClick={() => router.push(`/products/${item._id}`)}
      className={"bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col cursor-pointer"}
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-100 flex items-center justify-center">
        <img
          src={item.images?.[0]}
          alt={item.title}
          className="w-full h-full object-cover"
        />

        {/* Favorite Icon */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 text-gray-700 bg-white p-2 rounded-full shadow"
          style={{ cursor: "pointer" }}
        >
          {isFavorite ? (
            <FaHeart style={{ color: "var(--primary-color)" }} />
          ) : (
            <FaRegHeart className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <h3 className="text-sm font-medium text-gray-800">{item.title}</h3>

        <p className="text-xs text-gray-500 truncate">
          {item.description || "تفاصيل المنتج"}
        </p>

        <p className="text-green-600 font-bold text-lg">
          {item.price} ج م
        </p>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className={`w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition
            ${isInCart
              ? "bg-gray-400 cursor-not-allowed opacity-60"
              : "bg-green-600 hover:bg-green-700 text-white"
            }`}
        >
          <span>{isInCart ? "مضاف بالفعل" : "أضف للسلة"}</span>
          <FaShoppingCart size={16} />
        </button>
      </div>
    </div>
  );
}
