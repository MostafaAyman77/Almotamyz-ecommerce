"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex items-center justify-center min-h-[80vh] w-full overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10 bg-gray-50 flex items-center justify-center overflow-hidden">
                <motion.div
                    className="absolute w-[500px] h-[500px] bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    style={{ top: "10%", left: "20%" }}
                />
                <motion.div
                    className="absolute w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    style={{ bottom: "10%", right: "20%" }}
                />
            </div>

            {children}
        </div>
    );
}
