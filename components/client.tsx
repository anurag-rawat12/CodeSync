'use client';
import React from 'react';
import Avatar from 'react-avatar';
import { motion } from 'framer-motion';

interface ClientProps {
  username: string;
  isOnline?: boolean; // optional online status
}

const Client: React.FC<ClientProps> = ({ username, isOnline = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#1B1B1B]/70 backdrop-blur-md border border-white/10 
                 hover:border-[#6366F1]/50 hover:shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all cursor-default"
    >
      {/* Avatar with gradient border */}
      <div className="relative">
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1B1B1B] 
                        bg-green-400 animate-pulse" 
             style={{ display: isOnline ? 'block' : 'none' }}></div>
        <Avatar
          name={username}
          size="40"
          round
          textSizeRatio={2}
          color="#3B82F6"
          className="select-none"
        />
      </div>

      {/* Username */}
      <span className="text-gray-100 text-sm font-medium truncate max-w-[140px]">
        {username}
      </span>
    </motion.div>
  );
};

export default Client;
