'use client';
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      <div className="bg-black min-h-[100vh] text-white">
        <Navbar></Navbar>

        <section className="flex justify-center items-center flex-col">
          <h1 className="lg:text-[5vw] text-[8vw] text-center mt-20 bg-gradient-to-b from-[#E6E6E6] to-gray-500 bg-clip-text text-transparent">
            Code Together. Anywhere, Anytime
          </h1>
          <p className="text-center mt-[2.5vw] lg:w-[60%] w-[90%] text-[#6F6F6F] mx-auto text-[4vw] lg:text-[1.6vw] ">
            A real-time collaborative code editor designed for teams and individuals.
            <span className="text-white"> Share folders</span>, <span className="text-white"> code together</span>, and bring your ideas to life seamlessly.
          </p>

          <div className="flex flex-row gap-[2vw] ">
            <Link href={'/signup'} className="mt-[5vw]">
              <Button className='bg-gray-300 group  hover:bg-[#E4E6EF] text-[20px] lg:text-[16px] leading-6 px-[1.6vw] py-[1.8vw] rounded-xl text-black'>
                Get Started
              </Button>
            </Link>

            <Link href={'/'} className="mt-[5vw]">
              <Button className='bg-gray-300 group  hover:bg-[#E4E6EF] text-[20px] lg:text-[16px] leading-6 px-[1.6vw] py-[1.8vw] rounded-xl text-black'>
                Learn More
              </Button>
            </Link>
          </div>
        </section>
      </div>
    )
  );
}
