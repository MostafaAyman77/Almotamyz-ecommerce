import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'إنشاء حساب جديد - المتميز للمعدات',
    description: 'صفحة إنشاء حساب جديد',
};

export default function RegisterPage() {
    return (
        <RegisterForm />
    );
}
