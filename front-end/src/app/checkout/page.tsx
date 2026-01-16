// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "@/store/store";
// import {
//     removeFromCart,
//     increaseQuantity,
//     decreaseQuantity,
//     cartTotalPrice,
//     clearCart,
// } from "@/store/slices/cartSlice";
// import toast from "react-hot-toast";
// import { FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
// import Image from "next/image";

// const CheckoutPage = () => {
//     const router = useRouter();
//     const dispatch = useDispatch();
//     const cartItems = useSelector((state: RootState) => state.cart.cartItems);
//     const totalPrice = useSelector(cartTotalPrice);
//     const { token, user } = useSelector((state: RootState) => state.auth);

//     // Form states
//     const [fullName, setFullName] = useState("");
//     const [phone, setPhone] = useState("");
//     const [alternatePhone, setAlternatePhone] = useState("");
//     const [address, setAddress] = useState("");
//     const [city, setCity] = useState("");
//     const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
//     const [cardNumber, setCardNumber] = useState("");
//     const [cardHolder, setCardHolder] = useState("");
//     const [cvv, setCvv] = useState("");
//     const [expirationDate, setExpirationDate] = useState("");
//     const [email, setEmail] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [showError, setShowError] = useState(false);
//     const [error, setError] = useState({
//         fullname: "ادخل الاسم بالكامل",
//         phone: "ادخل رقم الهاتف",
//         address: "ادخل العنوان",
//         city: "ادخل اسم المدينة",
//         paymentMethod: "اختر طريقة الدفع",
//         cardNumber: "ادخل رقم الكارت",
//         cardHolder: "ادخل اسم صاحب الكارت",
//         cvv: "ادخل رمز الأمان CVV",
//         expirationDate: "ادخل تاريخ انتهاء الكارت",
//         email: "ادخل البريد الإلكتروني",
//     });


//     useEffect(() => {
//         // Redirect if cart is empty
//         if (cartItems.length === 0) {
//             toast.error("السلة فارغة");
//             router.push("/cart");
//         }
//     }, [cartItems, router]);

//     const handleQuantityIncrease = (productId: string) => {
//         dispatch(increaseQuantity(productId));
//     };

//     const handleQuantityDecrease = (productId: string) => {
//         dispatch(decreaseQuantity(productId));
//     };

//     const handleRemoveItem = (productId: string) => {
//         dispatch(removeFromCart(productId));
//         toast.success("تم حذف المنتج من السلة");
//     };

//     const syncCartToBackend = async () => {
//         // Skip cart sync for guest users
//         if (!token) {
//             return;
//         }

//         const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

//         try {
//             // Clear backend cart first
//             await fetch(`${baseUrl}/api/v1/cart`, {
//                 method: "DELETE",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             // Add each item to backend cart
//             for (const item of cartItems) {
//                 await fetch(`${baseUrl}/api/v1/cart`, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                         Authorization: `Bearer ${token}`,
//                     },
//                     body: JSON.stringify({
//                         productId: item.id,
//                         quantity: item.quantity,
//                     }),
//                 });
//             }
//         } catch (error) {
//             console.error("Error syncing cart:", error);
//             throw new Error("فشل في مزامنة السلة");
//         }
//     };

//     const handleCheckout = async (e: React.FormEvent) => {
//         e.preventDefault();

//         setShowError(true);

//         // Validation
//         if (!fullName || !phone || !address || !city) {
//             toast.error("يرجى ملء جميع الحقول المطلوبة");
//             return;
//         }

//         // Require email for guest users
//         if (!token && !email) {
//             toast.error("يرجى إدخال البريد الإلكتروني");
//             return;
//         }

//         if (paymentMethod === "card") {
//             if (!cardNumber || !cardHolder || !cvv || !expirationDate) {
//                 toast.error("يرجى ملء جميع بيانات البطاقة");
//                 return;
//             }
//         }

//         setLoading(true);

//         try {
//             const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

//             // Step 1: Sync cart to backend (only for authenticated users)
//             await syncCartToBackend();

//             // Step 2: Create order
//             const shippingAddress = {
//                 name: fullName,
//                 phone: phone,
//                 details: address,
//                 city: city,
//             };

//             let orderResponse;

//             if (token) {
//                 // Authenticated user order
//                 if (paymentMethod === "cash") {
//                     orderResponse = await fetch(`${baseUrl}/api/v1/orders`, {
//                         method: "POST",
//                         headers: {
//                             "Content-Type": "application/json",
//                             Authorization: `Bearer ${token}`,
//                         },
//                         body: JSON.stringify({
//                             shippingAddress,
//                             paymentMethodType: "cash",
//                         }),
//                     });
//                 } else {
//                     orderResponse = await fetch(`${baseUrl}/api/v1/orders/checkout`, {
//                         method: "POST",
//                         headers: {
//                             "Content-Type": "application/json",
//                             Authorization: `Bearer ${token}`,
//                         },
//                         body: JSON.stringify({
//                             shippingAddress,
//                             paymentMethod: "card",
//                             phoneNumber: phone,
//                             email: user?.email || email,
//                         }),
//                     });
//                 }
//             } else {
//                 // Guest user order - send cart data directly
//                 // Note: This requires backend support for guest orders
//                 toast.error("عذراً، الطلب كضيف غير متاح حالياً. يرجى تسجيل الدخول أولاً.");
//                 router.push("/login");
//                 return;
//             }

//             const orderData = await orderResponse.json();

//             if (!orderResponse.ok) {
//                 throw new Error(orderData.message || "فشل في إنشاء الطلب");
//             }

//             // Clear local cart
//             dispatch(clearCart());
//             toast.success("تم إنشاء الطلب بنجاح!");

//             // Redirect based on payment method
//             if (paymentMethod === "card" && orderData.data?.payment?.iframeUrl) {
//                 // Redirect to Paymob payment page
//                 window.location.href = orderData.data.payment.iframeUrl;
//             } else {
//                 // Redirect to orders page
//                 router.push("/orders");
//             }
//         } catch (error: any) {
//             console.error("Checkout error:", error);
//             toast.error(error.message || "حدث خطأ أثناء إتمام الطلب");
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (cartItems.length === 0) {
//         return null;
//     }

//     return (
//         <div className="min-h-screen py-8" style={{ backgroundColor: "var(--light-color)" }}>
//             <div className="max-w-7xl mx-auto px-4">
//                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//                     {/* Order Summary - Right Side */}
//                     <div className="lg:col-span-5 order-2 lg:order-1">
//                         <div
//                             className="rounded-lg p-6 sticky top-24"
//                             style={{ backgroundColor: "var(--black-color)", color: "white" }}
//                         >
//                             <h2 className="text-2xl font-bold mb-6">ملخص الطلب</h2>

//                             {/* Scrollable Products */}
//                             <div className="max-h-96 overflow-y-auto mb-6 space-y-4">
//                                 {cartItems.map((item) => (
//                                     <div
//                                         key={item.id}
//                                         className="flex gap-4 p-4 rounded-lg"
//                                         style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
//                                     >
//                                         {/* Product Image */}
//                                         <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
//                                             <Image
//                                                 src={item.images[0] || "/placeholder.png"}
//                                                 alt={item.title}
//                                                 fill
//                                                 className="object-cover"
//                                             />
//                                         </div>

//                                         {/* Product Details */}
//                                         <div className="flex-1">
//                                             <h3 className="font-semibold text-sm mb-2 line-clamp-2">
//                                                 {item.title}
//                                             </h3>
//                                             <div className="flex items-center justify-between">
//                                                 <div className="flex items-center gap-2">
//                                                     <button
//                                                         onClick={() => handleQuantityDecrease(item.id)}
//                                                         className="p-1 rounded hover:bg-white/20 transition-colors"
//                                                         disabled={item.quantity === 1}
//                                                     >
//                                                         <FiMinus size={14} />
//                                                     </button>
//                                                     <span className="font-semibold">{item.quantity}</span>
//                                                     <button
//                                                         onClick={() => handleQuantityIncrease(item.id)}
//                                                         className="p-1 rounded hover:bg-white/20 transition-colors"
//                                                     >
//                                                         <FiPlus size={14} />
//                                                     </button>
//                                                 </div>
//                                                 <button
//                                                     onClick={() => handleRemoveItem(item.id)}
//                                                     className="p-1 rounded hover:bg-red-600 transition-colors"
//                                                 >
//                                                     <FiTrash2 size={16} />
//                                                 </button>
//                                             </div>
//                                         </div>

//                                         {/* Price */}
//                                         <div className="text-left font-bold">
//                                             {(item.price * item.quantity!).toFixed(2)} ج.م
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>

//                             {/* Total */}
//                             <div className="border-t border-white/20 pt-4">
//                                 <div className="flex justify-between items-center text-xl font-bold">
//                                     <span>الإجمالي</span>
//                                     <span style={{ color: "var(--primary-color)" }}>
//                                         {totalPrice.toFixed(2)} ج.م
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Checkout Form - Left Side */}
//                     <div className="lg:col-span-7 order-1 lg:order-2">
//                         <div className="bg-white rounded-lg p-8 shadow-sm">
//                             <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--black-color)" }}>
//                                 إتمام الطلب
//                             </h1>

//                             <form onSubmit={handleCheckout} noValidate className="space-y-6">
//                                 {/* Personal Details */}
//                                 <div>
//                                     <h2
//                                         className="text-xl font-bold mb-4"
//                                         style={{ color: "var(--primary-color)" }}
//                                     >
//                                         البيانات الشخصية
//                                     </h2>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         <div>
//                                             <label className="block text-sm font-medium mb-2">
//                                                 الاسم بالكامل <span className="text-red-500">*</span>
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={fullName}
//                                                 onChange={(e) => setFullName(e.target.value)}
//                                                 className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
//                                                 style={{
//                                                     borderColor: "var(--border-color)",
//                                                 }}
//                                                 placeholder="أدخل اسمك الكامل"
//                                                 required
//                                             />
//                                             {showError && !fullName && <p className="text-red-500">{error.fullname}</p>}
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium mb-2">
//                                                 رقم التليفون <span className="text-red-500">*</span>
//                                             </label>
//                                             <input
//                                                 type="tel"
//                                                 value={phone}
//                                                 onChange={(e) => setPhone(e.target.value)}
//                                                 className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
//                                                 style={{ borderColor: "var(--border-color)" }}
//                                                 placeholder="01xxxxxxxxx"
//                                                 required
//                                                 maxLength={11}
//                                                 pattern="^01[0-9]{9}$"
//                                             />
//                                             {showError && !phone && <p className="text-red-500">{error.phone}</p>}
//                                         </div>
//                                         <div className="md:col-span-2">
//                                             <label className="block text-sm font-medium mb-2">
//                                                 رقم تليفون آخر (اختياري)
//                                             </label>
//                                             <input
//                                                 type="tel"
//                                                 value={alternatePhone}
//                                                 onChange={(e) => setAlternatePhone(e.target.value)}
//                                                 className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
//                                                 style={{ borderColor: "var(--border-color)" }}
//                                                 placeholder="01xxxxxxxxx"
//                                             />
//                                         </div>
//                                         {/* {!token && (
//                                             <div className="md:col-span-2">
//                                                 <label className="block text-sm font-medium mb-2">
//                                                     البريد الإلكتروني *
//                                                 </label>
//                                                 <input
//                                                     type="email"
//                                                     value={email}
//                                                     onChange={(e) => setEmail(e.target.value)}
//                                                     className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
//                                                     style={{ borderColor: "var(--border-color)" }}
//                                                     placeholder="example@email.com"
//                                                     required
//                                                 />
//                                             </div>
//                                         )} */}
//                                     </div>
//                                 </div>

//                                 {/* Shipping Address */}
//                                 <div>
//                                     <h2
//                                         className="text-xl font-bold mb-4"
//                                         style={{ color: "var(--primary-color)" }}
//                                     >
//                                         العنوان
//                                     </h2>
//                                     <div className="space-y-4">
//                                         <div>
//                                             <label className="block text-sm font-medium mb-2">
//                                                 العنوان بالتفصيل <span className="text-red-500">*</span>
//                                             </label>
//                                             <textarea
//                                                 value={address}
//                                                 onChange={(e) => setAddress(e.target.value)}
//                                                 className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
//                                                 style={{ borderColor: "var(--border-color)" }}
//                                                 placeholder="أدخل عنوانك بالتفصيل (الشارع، رقم المبنى، الدور، الشقة)"
//                                                 rows={3}
//                                                 required
//                                             />
//                                             {showError && !address && <p className="text-red-500">{error.address}</p>}
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium mb-2">
//                                                 المحافظة / المدينة <span className="text-red-500">*</span>
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={city}
//                                                 onChange={(e) => setCity(e.target.value)}
//                                                 className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
//                                                 style={{ borderColor: "var(--border-color)" }}
//                                                 placeholder="القاهرة، الجيزة، الإسكندرية..."
//                                                 required
//                                             />
//                                             {showError && !city && <p className="text-red-500">{error.city}</p>}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Payment Details */}
//                                 <div>
//                                     <h2
//                                         className="text-xl font-bold mb-4"
//                                         style={{ color: "var(--primary-color)" }}
//                                     >
//                                         بيانات الدفع
//                                     </h2>

//                                     {/* Payment Method Selection */}
//                                     <div className="flex gap-4 mb-4">
//                                         <label className="flex items-center gap-2 cursor-pointer">
//                                             <input
//                                                 type="radio"
//                                                 name="paymentMethod"
//                                                 value="cash"
//                                                 checked={paymentMethod === "cash"}
//                                                 onChange={() => setPaymentMethod("cash")}
//                                                 className="w-4 h-4"
//                                                 style={{ accentColor: "var(--primary-color)" }}
//                                             />
//                                             <span>الدفع عند الاستلام</span>
//                                         </label>
//                                         <label className="flex items-center gap-2 cursor-pointer">
//                                             <input
//                                                 type="radio"
//                                                 name="paymentMethod"
//                                                 value="card"
//                                                 checked={paymentMethod === "card"}
//                                                 onChange={() => setPaymentMethod("card")}
//                                                 className="w-4 h-4"
//                                                 style={{ accentColor: "var(--primary-color)" }}
//                                             />
//                                             <span>الدفع ببطاقة الائتمان</span>
//                                         </label>
//                                     </div>

//                                     {/* Card Details */}
//                                     {paymentMethod === "card" && (
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//                                             <div className="md:col-span-2">
//                                                 <label className="block text-sm font-medium mb-2">
//                                                     رقم البطاقة <span className="text-red-500">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     value={cardNumber}
//                                                     onChange={(e) => setCardNumber(e.target.value)}
//                                                     className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
//                                                     style={{ borderColor: "var(--border-color)" }}
//                                                     placeholder="1234 5678 9012 3456"
//                                                     maxLength={19}
//                                                     required
//                                                 />
//                                                 {showError && !cardNumber && <p className="text-red-500">{error.cardNumber}</p>}
//                                             </div>
//                                             <div className="md:col-span-2">
//                                                 <label className="block text-sm font-medium mb-2">
//                                                     اسم حامل البطاقة <span className="text-red-500">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     value={cardHolder}
//                                                     onChange={(e) => setCardHolder(e.target.value)}
//                                                     className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
//                                                     style={{ borderColor: "var(--border-color)" }}
//                                                     placeholder="CARD HOLDER NAME"
//                                                     required
//                                                 />
//                                                 {showError && !cardHolder && <p className="text-red-500">{error.cardHolder}</p>}
//                                             </div>
//                                             <div>
//                                                 <label className="block text-sm font-medium mb-2">
//                                                     تاريخ الانتهاء <span className="text-red-500">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     value={expirationDate}
//                                                     onChange={(e) => setExpirationDate(e.target.value)}
//                                                     className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
//                                                     style={{ borderColor: "var(--border-color)" }}
//                                                     placeholder="MM/YY"
//                                                     maxLength={5}
//                                                     required
//                                                 />
//                                                 {showError && !expirationDate && <p className="text-red-500">{error.expirationDate}</p>}
//                                             </div>
//                                             <div dir="ltr" >
//                                                 <label className="block text-sm font-medium mb-2">
//                                                     CVV <span className="text-red-500">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     value={cvv}
//                                                     onChange={(e) => setCvv(e.target.value)}
//                                                     className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
//                                                     style={{ borderColor: "var(--border-color)" }}
//                                                     placeholder="123"
//                                                     maxLength={4}
//                                                     required
//                                                 />
//                                                 {showError && !cvv && <p className="text-red-500">{error.cvv}</p>}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Submit Button */}
//                                 <button
//                                     type="submit"
//                                     disabled={loading}
//                                     className="w-full py-4 rounded-lg text-white font-bold text-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg cursor-pointer"
//                                     style={{ backgroundColor: "var(--primary-color)" }}
//                                 >
//                                     {loading ? "جاري المعالجة..." : "إتمام الطلب"}
//                                 </button>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };


"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useCheckoutForm } from "@/hooks/UseCheckoutForm";
import { clearCart } from "@/store/slices/cartSlice";
import { CheckoutForm } from "@/components/CheckoutForm";
import { RootState } from "@/store/store";
import { OrderSummary } from "@/components/OrderSummary";


const CheckoutPage = () => {
    const dispatch = useDispatch();

    // 🛒 cart from redux
    const cartItems = useSelector(
        (state: RootState) => state.cart.cartItems
    );

    // 🔐 token from redux (null لو Guest)
    const token = useSelector(
        (state: RootState) => state.auth.token
    );

    const {
        loading,
        initialValues,
        validationSchema,
        handleSubmit,
    } = useCheckoutForm({
        token,
        cartItems,
        // للمستخدم المسجّل فقط – وإنت أصلاً حافظ الكارت في localStorage
        syncCartToBackend: async () => { },
        onSuccess: () => {
            dispatch(clearCart());
        },
    });

    const formikConfig = {
        initialValues,
        validationSchema,
        onSubmit: handleSubmit,
    };

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="max-w-3xl mx-auto py-10 px-4 text-center text-gray-500">
                سلة المشتريات فارغة
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
            <div className="lg:col-span-5 order-2 lg:order-1">
                <OrderSummary />
            </div>

            <div style={{ backgroundColor: "#edf7edff" }} className="lg:col-span-7 order-1 lg:order-2 rounded-lg p-8">
                <CheckoutForm formikConfig={formikConfig} loading={loading} />
            </div>
        </div>
    );
};

export default CheckoutPage;
