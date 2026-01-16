import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { checkoutSchema, CheckoutFormValues } from "@/schemas/checkout.schema";

interface UseCheckoutFormProps {
    token: string | null;
    syncCartToBackend: () => Promise<void>;
    cartItems: any[];
    onSuccess: () => void;
}

export const useCheckoutForm = ({
    token,
    syncCartToBackend,
    cartItems,
    onSuccess,
}: UseCheckoutFormProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const initialValues: CheckoutFormValues = {
        fullName: "",
        phone: "",
        alternatePhone: "",
        address: "",
        city: "",
        paymentMethod: "cash",
        cardNumber: "",
        cardHolder: "",
        expirationDate: "",
        cvv: "",
    };

    const handleSubmit = async (values: CheckoutFormValues) => {
        setLoading(true);

        try {
            const baseUrl =
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

            const shippingAddress = {
                name: values.fullName,
                phone: values.phone,
                details: values.address,
                city: values.city,
            };

            let response: Response;

            if (token) {
                // 🔐 Logged-in user
                await syncCartToBackend();

                response =
                    values.paymentMethod === "cash"
                        ? await fetch(`${baseUrl}/api/v1/orders`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                shippingAddress,
                                paymentMethodType: "cash",
                            }),
                        })
                        : await fetch(`${baseUrl}/api/v1/orders/checkout`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                shippingAddress,
                                paymentMethod: "card",
                                phoneNumber: values.phone,
                            }),
                        });
            } else {
                // 👤 Guest user
                response = await fetch(`${baseUrl}/api/v1/orders/guest`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        shippingAddress,
                        paymentMethod: values.paymentMethod,
                        cartItems,
                    }),
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "فشل إنشاء الطلب");
            }

            toast.success("تم إنشاء الطلب بنجاح");
            onSuccess();

            if (values.paymentMethod === "card" && data.data?.payment?.iframeUrl) {
                window.location.href = data.data.payment.iframeUrl;
            } else {
                router.push("/orders");
            }
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ أثناء الطلب");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        initialValues,
        validationSchema: toFormikValidationSchema(checkoutSchema),
        handleSubmit,
    };
};
