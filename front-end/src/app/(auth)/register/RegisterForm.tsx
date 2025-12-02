"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

const RegisterForm = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName === "") return toast.error("User Name is required");
    if (email === "") return toast.error("Email is required");
    if (password === "") return toast.error("Password is required");
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className="text-sm text-gray-500">
        Create your account to get started
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label
          htmlFor="username"
          className="flex flex-col text-sm text-gray-700"
        >
          <span className="mb-1">User Name</span>
          <input
            type="name"
            id="username"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </label>
        <label htmlFor="email" className="flex flex-col text-sm text-gray-700">
          <span className="mb-1">Email</span>
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </label>
        <label
          htmlFor="password"
          className="flex flex-col text-sm text-gray-700"
        >
          <span className="mb-1">Password</span>
          <input
            type="password"
            id="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </label>
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2 text-gray-600">
          <input
            type="checkbox"
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          Remember Me
        </label>
        <Link href="#" className="text-indigo-600 hover:underline">
          Forget Password?
        </Link>
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:cursor-pointer"
      >
        Sign In
      </button>

      <div className="flex items-center gap-2 text-sm text-gray-500 pt-3">
        <span className="flex-1 border-t border-gray-200" />
        <span className="px-2">or continue with</span>
        <span className="flex-1 border-t border-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3">
        <button
          type="button"
          className="flex items-center justify-center py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >
          GitHub
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
