'use client';
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const userId = user?.id;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      router.push(`/dashboard/${userId}`);
    }
  }, [isSignedIn, router, userId]);

  return (
    isClient && (
      <div className="bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] min-h-screen text-white font-inter">
        <Navbar />

        {/* Hero Section */}
        <section className="flex flex-col justify-center items-center text-center px-6 md:px-12 pt-32 md:pt-40 pb-24 relative overflow-hidden">
          {/* Decorative gradient glow */}
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] blur-[120px] opacity-30 -z-10" />

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-b from-gray-100 to-gray-400 bg-clip-text text-transparent leading-[1.1]"
          >
            Code Together. <br /> Anywhere, Anytime.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-8 max-w-2xl text-gray-400 text-lg sm:text-xl leading-relaxed"
          >
            A real-time collaborative code editor built for teams and creators.
            <span className="text-white font-medium"> Share folders</span>, 
            <span className="text-white font-medium"> code together</span>, and bring your ideas to life seamlessly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-10"
          >
            <Link href={'/signup'}>
              <Button className="bg-gradient-to-r from-[#3B82F6] to-[#9333EA] text-white text-lg px-8 py-6 rounded-xl hover:opacity-90 transition-all shadow-md">
                Get Started
              </Button>
            </Link>

            <Link href={'/demo'}>
              <Button className="bg-transparent border border-gray-500 hover:border-white hover:text-white text-lg px-8 py-6 rounded-xl text-gray-300 transition-all">
                View Demo
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 text-center py-8 text-sm text-gray-500">
          © {new Date().getFullYear()} CodeSync. All rights reserved.
        </footer>
      </div>
    )
  );
}
