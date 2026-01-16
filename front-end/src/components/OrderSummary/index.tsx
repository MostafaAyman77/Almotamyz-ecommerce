import Image from "next/image";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotalPrice,
} from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";

export const OrderSummary = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.cartItems);
    const totalPrice = useSelector(cartTotalPrice);
    const router = useRouter();

    return (
        <div
            className="rounded-lg p-6 sticky top-24"
            style={{ backgroundColor: "#edf7edff", color: "black" }}
        >
            <h2 className="text-2xl font-bold mb-6">ملخص الطلب</h2>

            <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
                {cartItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex gap-3 p-2 rounded-lg"
                        style={{ backgroundColor: "#FAFAFA", }}
                    >
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                            <Image
                                onClick={() => router.push(`/product/${item.id}`)}
                                src={item.images[0] || "/placeholder.png"}
                                alt={item.title}
                                fill
                                className="object-contain cursor-pointer"
                            />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-sm font-semibold mb-2 line-clamp-2">
                                {item.title}
                            </h3>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <button
                                        className="rounded-full p-1 transition-all duration-300 
                                            bg-red-300 hover:bg-red-500 
                                            disabled:opacity-40 disabled:cursor-not-allowed
                                            cursor-pointer
                                        "
                                        onClick={() => dispatch(decreaseQuantity(item.id))}
                                        disabled={item.quantity === 1}
                                    >
                                        <FiMinus />
                                    </button>

                                    <span style={{ fontSize: "20px", marginBottom: "0px" }}>{item.quantity}</span>

                                    <button
                                        className="rounded-full p-1 transition-all duration-300 
                                            bg-green-400 hover:bg-[var(--primary-color)]
                                            cursor-pointer
                                        "
                                        onClick={() => dispatch(increaseQuantity(item.id))}
                                    >
                                        <FiPlus />
                                    </button>
                                </div>

                                <button
                                    className="rounded-full p-2 transition-all duration-300 
                                        bg-red-500 hover:bg-red-700 mr-10 cursor-pointer
                                    "
                                    onClick={() => dispatch(removeFromCart(item.id))}
                                >
                                    <FiTrash2 color="white" />
                                </button>
                            </div>
                        </div>

                        <div className="font-bold">
                            {(item.price * item.quantity!).toFixed(2)} ج.م
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-white/20 pt-4 flex justify-between font-bold text-xl">
                <span>الإجمالي</span>
                <span style={{ color: "var(--primary-color)" }}>
                    {totalPrice.toFixed(2)} ج.م
                </span>
            </div>
        </div>
    );
};
