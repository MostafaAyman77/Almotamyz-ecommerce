import { z } from "zod";

export const checkoutSchema = z
    .object({
        fullName: z.string().min(3, "ادخل الاسم بالكامل"),
        phone: z.string().regex(/^01[0-9]{9}$/, "رقم الهاتف غير صحيح"),
        alternatePhone: z.string().optional().or(z.literal("")),
        address: z.string().min(5, "ادخل العنوان"),
        city: z.string().min(2, "ادخل اسم المدينة"),
        paymentMethod: z.enum(["cash", "card"]),
        cardNumber: z.string().optional(),
        cardHolder: z.string().optional(),
        expirationDate: z.string().optional(),
        cvv: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.paymentMethod === "card") {
            if (!data.cardNumber || data.cardNumber.trim() === "")
                ctx.addIssue({ path: ["cardNumber"], message: "ادخل رقم الكارت", code: "custom" });

            if (!data.cardHolder)
                ctx.addIssue({ path: ["cardHolder"], message: "ادخل اسم صاحب الكارت", code: "custom" });

            if (!data.expirationDate)
                ctx.addIssue({
                    path: ["expirationDate"],
                    message: "ادخل تاريخ انتهاء الكارت",
                    code: "custom",
                });

            if (!data.cvv)
                ctx.addIssue({ path: ["cvv"], message: "ادخل رمز الأمان CVV", code: "custom" });
        }
    });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
