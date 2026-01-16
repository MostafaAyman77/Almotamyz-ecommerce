import { Formik, Form, Field, ErrorMessage } from "formik";
import { FormInput } from "../FormInput";

interface Props {
    formikConfig: any;
    loading: boolean;
}

export const CheckoutForm = ({ formikConfig, loading }: Props) => {
    return (
        <Formik
            initialValues={formikConfig.initialValues}
            validationSchema={formikConfig.validationSchema}
            onSubmit={formikConfig.handleSubmit}
            validateOnBlur={false}
            validateOnChange={false}
        >
            {({ values }) => (
                <Form className="space-y-6">
                    {/* البيانات الشخصية */}
                    <div>
                        <h2
                            className="text-xl font-bold mb-4"
                            style={{ color: "var(--primary-color)" }}
                        >
                            البيانات الشخصية
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                name="fullName"
                                label="الاسم بالكامل"
                                placeholder="أدخل اسمك الكامل"
                            />

                            <FormInput
                                name="phone"
                                label="رقم الهاتف"
                                placeholder="01xxxxxxxxx"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                            رقم تليفون آخر (اختياري)
                        </label>

                        <Field
                            type="tel"
                            name="alternatePhone"
                            placeholder="01xxxxxxxxx"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                            style={{ borderColor: "var(--border-color)" }}
                        />
                    </div>

                    {/* العنوان */}
                    <div>
                        <h2
                            className="text-xl font-bold mb-4"
                            style={{ color: "var(--primary-color)" }}
                        >
                            العنوان
                        </h2>

                        <div className="space-y-4">
                            <FormInput
                                name="address"
                                label="العنوان بالتفصيل"
                                textarea
                                placeholder="الشارع، رقم المبنى، الدور، الشقة"
                            />

                            <FormInput
                                name="city"
                                label="المدينة"
                                placeholder="القاهرة، الجيزة..."
                            />
                        </div>
                    </div>

                    {/* الدفع */}
                    <div>
                        <h2
                            className="text-xl font-bold mb-4"
                            style={{ color: "var(--primary-color)" }}
                        >
                            بيانات الدفع
                        </h2>

                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Field
                                    type="radio"
                                    name="paymentMethod"
                                    value="cash"
                                    className="w-4 h-4"
                                    style={{ accentColor: "var(--primary-color)" }}
                                />
                                الدفع عند الاستلام
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <Field
                                    type="radio"
                                    name="paymentMethod"
                                    value="card"
                                    className="w-4 h-4"
                                    style={{ accentColor: "var(--primary-color)" }}
                                />
                                بطاقة
                            </label>
                        </div>

                        {values.paymentMethod === "card" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    name="cardNumber"
                                    label="رقم البطاقة"
                                    placeholder="1234 5678 9012 3456"
                                    dir="ltr"
                                />

                                <FormInput
                                    name="cardHolder"
                                    label="اسم حامل البطاقة"
                                    placeholder="CARD HOLDER NAME"
                                    dir="ltr"
                                />

                                <FormInput
                                    name="expirationDate"
                                    label="تاريخ الانتهاء"
                                    placeholder="MM/YY"
                                    dir="ltr"
                                />

                                <FormInput
                                    name="cvv"
                                    label="CVV"
                                    placeholder="123"
                                    dir="ltr"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-lg text-white font-bold text-lg transition-all disabled:opacity-70 hover:shadow-lg"
                        style={{ backgroundColor: "var(--primary-color)" }}
                    >
                        {loading ? "جاري المعالجة..." : "إتمام الطلب"}
                    </button>
                </Form>
            )}
        </Formik>
    );
};
