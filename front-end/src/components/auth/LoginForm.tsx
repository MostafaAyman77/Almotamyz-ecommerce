"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";

const LoginForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleBlur = (field: string) => {
        const newErrors = { ...errors };

        if (field === "email") {
            if (!email) {
                newErrors.email = "البريد الإلكتروني مطلوب";
            } else {
                delete newErrors.email;
            }
        }

        if (field === "password") {
            if (!password) {
                newErrors.password = "كلمة المرور مطلوبة";
            } else {
                delete newErrors.password;
            }
        }

        setErrors(newErrors);
    };

    // Strict backend mirroring: POST /api/v1/auth/login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Trigger all validations
        const newErrors: { [key: string]: string } = {};
        if (!email) newErrors.email = "البريد الإلكتروني مطلوب";
        if (!password) newErrors.password = "كلمة المرور مطلوبة";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/api/v1/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Validation for user not found (404) or specific backend errors
                if (response.status === 404 || data.message?.toLowerCase().includes("no user found")) {
                    toast.error(
                        (t) => (
                            <div className="flex flex-col gap-2">
                                <span>{data.message || "User not found"}</span>
                                <button
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        router.push("/register");
                                    }}
                                    className="bg-white text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-100 border border-gray-300 transition-colors"
                                >
                                    Register Now
                                </button>
                            </div>
                        ),
                        { duration: 5000 }
                    );
                } else {
                    toast.error(data.message || "Something went wrong");
                }
                return;
            }

            // Success
            toast.success("Login successful!");
            // Logic for token handling should be here if backend returns it directly or via cookie
            // Assuming backend sets cookie or we need to store token manually? 
            // The prompt says "Token handling MUST follow backend + existing frontend logic".
            // Usually JSON tokens are stored in localStorage/cookies.
            // Based on typical express-async-handler + JWT pattern:
            if (data.token) {
                // Ensure backend sends 'data.data' for user object if available, otherwise just token
                dispatch(loginSuccess({ token: data.token, user: data.data || null }));
                localStorage.setItem("token", data.token); // Common fallback if not http-only cookie
                document.cookie = `token=${data.token}; path=/; max-age=86400;`; // Basic cookie set for middleware access if needed immediately
            }

            router.push("/");
            router.refresh();

        } catch (error) {
            console.error(error);
            toast.error("Network error. Please try again.");
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
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // shadow-sm equivalent
                borderRadius: "var(--radius)",
                fontFamily: "var(--font-cairo)"
            }}
        >
            <h2
                className="text-2xl font-bold text-center mb-6"
                style={{ color: "var(--black-color)" }}
            >
                تسجيل الدخول
            </h2>

            <form onSubmit={handleLogin} noValidate className="space-y-4">
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
                        onBlur={() => handleBlur("email")}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1"
                        style={{
                            borderColor: errors.email ? "var(--destructive-color)" : "var(--border-color)",
                        }}
                        // Tailwind classes for focus that match the theme colors roughly
                        // Since we can't easily use var() in tailwind.config without setup, we rely on standard classes + inline styles
                        placeholder="name@example.com"
                        required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                        style={{
                            borderColor: errors.password ? "var(--destructive-color)" : "var(--border-color)",
                        }}
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
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
                    {loading ? "جاري التحميل..." : "تسجيل الدخول"}
                </button>
            </form>

            <div className="mt-4 text-center text-sm">
                <span style={{ color: "var(--black-color)" }}>ليس لديك حساب؟ </span>
                <Link
                    href="/register"
                    className="font-semibold hover:underline"
                    style={{ color: "var(--primary-color)" }}
                >
                    إنشاء حساب جديد
                </Link>
            </div>
        </div>
    );
};

export default LoginForm;
