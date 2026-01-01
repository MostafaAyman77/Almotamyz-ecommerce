"use client";

import React from 'react';

export default function AdminDashboardPage() {
    return (
        <div style={{ fontFamily: "var(--font-cairo)" }}>
            <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--black-color)" }}>نظرة عامة</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm mb-2">إجمالي المنتجات</h3>
                    <p className="text-3xl font-bold" style={{ color: "var(--primary-color)" }}>--</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm mb-2">إجمالي الماركات</h3>
                    <p className="text-3xl font-bold" style={{ color: "var(--primary-color)" }}>--</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm mb-2">المستخدمين</h3>
                    <p className="text-3xl font-bold" style={{ color: "var(--primary-color)" }}>--</p>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 p-4 rounded-md text-blue-800">
                <p>مرحباً بك في لوحة تحكم المسؤول. قم باختيار قسم من القائمة الجانبية للبدء.</p>
            </div>
        </div>
    );
}
