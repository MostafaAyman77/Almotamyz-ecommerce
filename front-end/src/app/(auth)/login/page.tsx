import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'تسجيل الدخول - المتميز للمعدات',
    description: 'صفحة تسجيل الدخول',
};

export default function LoginPage() {
    return (
        <LoginForm />
    );
}
