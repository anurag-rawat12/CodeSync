'use client';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const DemoPage = () => {
    const [name, setName] = useState('');
    const [roomID, setRoomID] = useState('');
    const router = useRouter();

    const handleNewRoom = () => {
        const newRoom = uuidv4();
        setRoomID(newRoom);
        toast.success('New room created');
    };

    const handleJoin = () => {
        if (!name || !roomID) {
            toast.error('Please fill in both fields.');
            return;
        }
        router.push(`/demo/${roomID}?name=${encodeURIComponent(name)}`);
    };

    const handleCancel = () => {
        setName('');
        setRoomID('');
    };
    const handleInputEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleJoin();
        }
    }

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-b from-[#050505] via-[#0B0B0B] to-[#111111] text-white font-inter overflow-hidden">

            {/* subtle gradient glow */}
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-gradient-to-tr from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] opacity-30 blur-[140px] -z-10" />

            {/* main card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="w-full max-w-lg bg-[#141414]/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-10 sm:p-12"
            >
                <h1 className="text-center text-4xl font-bold mb-2 bg-gradient-to-r from-[#60A5FA] to-[#A78BFA] bg-clip-text text-transparent">
                    Join or Create a Room
                </h1>
                <p className="text-center text-gray-400 mb-10">
                    Collaborate live — code, create, and build together.
                </p>

                <div className="space-y-6">
                    {/* Name field */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2 font-medium">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyUp={handleInputEnter}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 rounded-xl bg-[#1B1B1B] border border-white/10 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/40 outline-none transition-all text-white placeholder-gray-500"
                        />
                    </div>

                    {/* Room ID field */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2 font-medium">
                            Room ID
                        </label>
                        <input
                            type="text"
                            value={roomID}
                            onChange={(e) => setRoomID(e.target.value)}
                            onKeyUp={handleInputEnter}
                            placeholder="Enter or generate a Room ID"
                            className="w-full px-4 py-3 rounded-xl bg-[#1B1B1B] border border-white/10 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/40 outline-none transition-all text-white placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                    <Button
                        onClick={handleNewRoom}
                        className="w-full sm:w-auto flex-1 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:opacity-90 text-white text-[16px] py-3 rounded-xl transition-all shadow-lg"
                    >
                        New Room
                    </Button>
                    <Button
                        onClick={handleJoin}
                        className="w-full sm:w-auto flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white text-[16px] py-3 rounded-xl transition-all shadow-lg"
                    >
                        Join
                    </Button>
                    <Button
                        onClick={handleCancel}
                        className="w-full sm:w-auto flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white text-[16px] py-3 rounded-xl transition-all shadow-lg"
                    >
                        Cancel
                    </Button>
                </div>

                {/* optional footer */}
                <p className="text-center text-sm text-gray-500 mt-10">
                    Secure, fast, and collaborative. Powered by{" "}
                    <span className="text-[#8B5CF6] font-semibold">CodeSync</span>.
                </p>
            </motion.div>
        </div>
    );
};

export default DemoPage;
