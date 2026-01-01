"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const RegisterForm = () => {
    const router = useRouter();

    // State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Validation Patterns (Backend Mirroring)
    // Password: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const nameRegex = /^[a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]{2,50}$/;

    const handleBlur = (field: string) => {
        const newErrors = { ...errors };

        // Strict onBlur validation mirroring submit logic
        switch (field) {
            case "name":
                if (!nameRegex.test(name)) {
                    newErrors.name = "الاسم يجب أن يحتوي على أحرف فقط ويكون الاسم بالكامل";
                } else {
                    delete newErrors.name;
                }
                break;
            case "password":
                if (!passwordRegex.test(password)) {
                    newErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير، حرف صغير، رقم، وحرف خاص";
                } else {
                    delete newErrors.password;
                }
                break;
            case "passwordConfirm":
                if (password !== passwordConfirm) {
                    newErrors.passwordConfirm = "كلمات المرور غير متطابقة";
                } else {
                    delete newErrors.passwordConfirm;
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({}); // Reset errors

        const newErrors: { [key: string]: string } = {};

        // Frontend strict validation before network request
        if (!nameRegex.test(name)) {
            newErrors.name = "الاسم يجب أن يحتوي على أحرف فقط ويكون الاسم بالكامل";
        }

        if (!passwordRegex.test(password)) {
            newErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير، حرف صغير، رقم، وحرف خاص";
        }

        if (password !== passwordConfirm) {
            newErrors.passwordConfirm = "كلمات المرور غير متطابقة";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/api/v1/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    passwordConfirm,
                    // role is NOT sent here per strict rules (backend defaults to user)
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Backend error mirroring
                // Backend typically returns { errors: [{ msg: "..." }] } or { message: "..." }
                if (data.errors && Array.isArray(data.errors)) {
                    data.errors.forEach((err: any) => toast.error(err.msg));
                } else {
                    toast.error(data.message || "فشل التسجيل");
                }
                return;
            }

            // Success
            toast.success("تم إنشاء الحساب بنجاح! قم بتسجيل الدخول الآن.");
            router.push("/login");

        } catch (error) {
            console.error(error);
            toast.error("خطأ في الشبكة. يرجى المحاولة مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="w-full max-w-md p-8 rounded-lg"
            style={{
                backgroundColor: "white",
                backdropFilter: "blur(4px)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                borderRadius: "var(--radius)",
                fontFamily: "var(--font-cairo)"
            }}
        >
            <h2
                className="text-2xl font-bold text-center mb-6"
                style={{ color: "var(--black-color)" }}
            >
                إنشاء حساب جديد
            </h2>

            <form onSubmit={handleRegister} noValidate className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-1"
                        style={{ color: "var(--black-color)" }}
                    >
                        الاسم
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => handleBlur("name")}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1"
                        style={{ borderColor: errors.name ? "var(--destructive-color)" : "var(--border-color)" }}
                        placeholder="الاسم الكامل"
                        required
                        minLength={2}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1"
                        style={{ color: "var(--black-color)" }}
                    >
                        البريد الإلكتروني
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1"
                        style={{ borderColor: "var(--border-color)" }}
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium mb-1"
                        style={{ color: "var(--black-color)" }}
                    >
                        كلمة المرور
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleBlur("password")}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1"
                        style={{ borderColor: errors.password ? "var(--destructive-color)" : "var(--border-color)" }}
                        placeholder="••••••••"
                        required
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    <p className="text-xs mt-1 text-gray-500">
                        يجب أن تحتوي على حرف كبير، حرف صغير، رقم، ورمز خاص.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="passwordConfirm"
                        className="block text-sm font-medium mb-1"
                        style={{ color: "var(--black-color)" }}
                    >
                        تأكيد كلمة المرور
                    </label>
                    <input
                        id="passwordConfirm"
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        onBlur={() => handleBlur("passwordConfirm")}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1"
                        style={{ borderColor: errors.passwordConfirm ? "var(--destructive-color)" : "var(--border-color)" }}
                        placeholder="••••••••"
                        required
                    />
                    {errors.passwordConfirm && <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-white font-medium py-2 px-4 rounded-md transition-opacity disabled:opacity-70"
                    style={{
                        backgroundColor: "var(--primary-color)",
                        borderRadius: "var(--radius)"
                    }}
                >
                    {loading ? "جاري التسجيل..." : "تسجيل"}
                </button>
            </form>

            <div className="mt-4 text-center text-sm">
                <span style={{ color: "var(--black-color)" }}>لديك حساب بالفعل؟ </span>
                <Link
                    href="/login"
                    className="font-semibold hover:underline"
                    style={{ color: "var(--primary-color)" }}
                >
                    تسجيل الدخول
                </Link>
            </div>
        </div>
    );
};

export default RegisterForm;
